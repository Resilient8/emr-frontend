<template>
  <q-layout view="hHh Lpr lFf">
    <q-page-container class="bg-grey-2">
      <div @keyup="nextItem">
        <q-page
          padding
          class="items-center justify-center"
          style="background: linear-gradient(#98fb98, #98fb98)"
        >
          <div class="form-container">
            <form id="myForm">
              <label for="textInput">Input Text:</label>
              <input type="text" id="textInput" required />
              <button type="submit" id="submitButton">Submit</button>
            </form>

            <!-- Add the "Load Data" button -->
            <button id="loadDataButton">Load Data</button>

            <div id="loader" class="hidden"></div>
            <div id="response" class="hidden"></div>
          </div>
        </q-page>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script>
//---------------------------------
document.addEventListener("DOMContentLoaded", () => {
  let form = document.getElementById("myForm");
  let loadDataButton = document.getElementById("loadDataButton");
  let loader = document.getElementById("loader");
  let responseDiv = document.getElementById("response");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const inputText = document.getElementById("textInput").value;

    // Show loader while waiting for the server response
    loader.classList.remove("hidden");

    try {
      const response = await postData(inputText);

      // Display the server response
      responseDiv.innerHTML = `Server Response: ${response.answer}`;
      responseDiv.classList.remove("hidden");
    } catch (error) {
      console.error("Error:", error);
      // Handle error if needed
    } finally {
      // Hide the loader after the server response is received
      loader.classList.add("hidden");
    }
  }); //Form

  loadDataButton.addEventListener("click", async function () {
    // Show loader while waiting for the server response
    loader.classList.remove("hidden");

    try {
      // Make a request to the server's /loadingdata endpoint
      const response = await fetch("http://localhost:5000/loadingdata");
      const data = await response.json();

      // Display the server response
      console.log(data);
      responseDiv.innerHTML = `Server Response: ${data.message}`;
      responseDiv.classList.remove("hidden");
    } catch (error) {
      console.error("Error:", error);
      // Handle error if needed
    } finally {
      // Hide the loader after the server response is received
      loader.classList.add("hidden");
    }
  }); //LoadDataBotton

  async function postData(data) {
    const url = "http://localhost:5000/querydata"; // Replace with your server endpoint
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: data }),
    };

    const response = await fetch(url, options);
    const result = await response.json();

    return result;
  }
}); //End of function
//---------------------------------
export default {
  data() {
    return {
      // For initialization
      title: "ทดสอบการทำงาน ChatGPT",
      openAIKey: "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", //somnuk3.sin@gmail.com
      showApiKeyDialog: true,
      model: null,
      file: null,
      fileName: null,
      fileContent: null,
      docs: [],
      vectorStore: null,
      chain: null,

      // For user interaction
      question: "What is this document about?",
      answer: "",
      formattedChatHistory: [],
    };
  },
  computed: {
    chatHistory() {
      return this.formattedChatHistory.map((chat) => chat.message);
    },

    chatHistoryString() {
      let chatString = "";
      this.formattedChatHistory.forEach((message) => {
        if (message.sender === "human") {
          chatString += "👤: ";
        } else if (message.sender === "bot") {
          chatString += "🤖: ";
        }
        chatString += `${message.message}\n`;
      });
      return chatString;
    },
  },
  methods: {
    saveKey() {
      // Save the API key to local storage
      this.showApiKeyDialog = false;
      this.initializeLLM();
    },
    clearFile() {
      // Clear the file
      console.log("Clearing file...");
      this.file = null;
      this.fileName = null;
      this.fileContent = null;
      this.docs = [];
      this.vectorStore = null;
      this.chain = null;
      this.question = "What is this document about?";
      this.formattedChatHistory = [];
    },
    async initializeLLM() {
      // Initialize LLM
      console.log("Initializing api-key LLM");
      this.model = new OpenAI({
        openAIApiKey: this.openAIKey,
        temperature: 0.9,
      });
    },
    async processFile(event) {
      console.log("File chosen. Processing...");
      this.file = event.target.files[0];

      this.fileName = this.file.name;

      if (this.file.type.startsWith("text/")) {
        const reader = new FileReader();
        reader.onload = () => {
          // Once the file has been read, set the file content and process it
          this.fileContent = reader.result;
          this.processFileContent();
        };

        // Start reading the file as text
        console.log("Loading text file...");
        reader.readAsText(this.file);
      } else {
        this.clearFile();
        alert(
          "ชนิดของไฟล์ไม่สนับสนุน กรุณาเลือกไฟล์ดังต่อไปนี้: plain text, markdown, HTML, JSON, XML, etc. or a PDF file."
        );
        return;
      }
    },
    async processFileContent() {
      console.log("แยกไฟล์ content ไปที่ chunk...");
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
      });
      console.log(this.fileContent);
      this.docs = await textSplitter.createDocuments([this.fileContent]);

      try {
        console.log("ทำการฝังข้อมูล Embedding...");
        this.vectorStore = await MemoryVectorStore.fromDocuments(
          this.docs,
          new OpenAIEmbeddings({
            openAIApiKey: "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", //somnuk3.sin@gmail.com
          })
        );
      } catch (error) {
        // If there is an error, clear the file and show the error message
        alert(
          "เกิดความผิดพลาดขึ้นขณะที่ทำการฝังเอกสารด้วย (Embedding the document with OpenAI API):" +
            error
        );
        this.clearFile();
        throw error;
      }

      console.log("การสร้างห่วงโซ่ (Creating chain)");
      this.chain = ConversationalRetrievalQAChain.fromLLM(
        this.model,
        this.vectorStore.asRetriever(),
        { returnSourceDocuments: true }
      );
    },
    async askNewQuestion() {
      console.log("ส่งคำถาม...");
      const current_question = this.question.trim();
      // this.question = "";
      this.formattedChatHistory.push({
        sender: "human",
        message: current_question,
      });
      const answer = await this.chain.call({
        query: current_question,
        chat_history: this.chatHistory,
      });
      console.log({ answer });
    },
  },
};
</script>
<style lang="sass">
.my-sticky-header-table
  height: 310px
  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    background-color: #c1f4cd
  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0
  &.q-table--loading thead tr:last-child th
    top: 48px
</style>
