<template>
  <q-layout view="hHh Lpr lFf">
    <q-page-container class="bg-grey-2">
      <div @keyup="nextItem">
        <q-page
          padding
          class="items-center justify-center"
          style="background: linear-gradient(#74c588, #0ad13c)"
        >
          <div class="full-width">
            <div class="col-md-8 offset-md-2 col-xs-12 q-pa-xs">
              <q-card flat class="bg-white text-black">
                <q-card-section class="bg-blue-14">
                  <h4 class="text-h5 text-white q-my-xs text-center">
                    {{ title }}
                  </h4>
                </q-card-section>
                <div class="row full-width">
                  <div class="col-md-12 col-xs-12 q-pa-xs">
                    <q-form class="q-gutter-md">
                      <!-- <div class="row">
                        <div class="col-md-6 col-xs-12 q-pa-xs">
                          <q-input
                            standout
                            bottom-slots
                            filled
                            v-model="individual.birthday"
                            label="ปีเกิด ค.ศ.*"
                            clearable
                            mask="####"
                            fill-mask
                            hint="ปีเกิด ค.ศ.: ####"
                            v-on:keyup.up="onTelephone()"
                            v-on:keyup.left="onTelephone()"
                          >
                            <template v-slot:prepend>
                              <q-icon name="school" />
                            </template>
                            <template v-slot:append>
                              <q-icon name="favorite" />
                            </template>
                          </q-input>
                        </div>
                        <div class="col-md-6 col-xs-12 q-pa-xs">
                          <q-input
                            standout
                            bottom-slots
                            v-model="individual.telephone"
                            label="หมายเลขโทรศัพท์ *"
                            mask="##-####-####"
                            fill-mask
                            hint="โทรศัพท์: ##-####-####"
                            clearable
                          >
                            <template v-slot:prepend>
                              <q-icon name="person_add" />
                            </template>
                            <template v-slot:append>
                              <q-icon name="favorite" />
                            </template>
                          </q-input>
                        </div>
                      </div> -->
                      <div class="mb-4">
                        <label
                          class="block text-gray-700 font-bold mb-2"
                          for="api-key"
                        >
                          OpenAI API Key (Saved Locally)
                        </label>
                        <input
                          class="appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white dark:bg-white leading-tight focus:outline-none focus:shadow-outline"
                          id="api-key"
                          type="password"
                          placeholder="Enter your OpenAI API key"
                          v-model="openAIKey"
                        />
                      </div>
                      <div class="mt-6">
                        <button
                          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                          v-on:click="saveKey"
                        >
                          Submit
                        </button>
                      </div>
                      <div class="mt-6">
                        <input
                          type="file"
                          ref="fileInput"
                          style="display: none"
                          @change="processFile"
                        />
                        <button
                          class="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none"
                          @click="$refs.fileInput.click()"
                        >
                          Upload Your Doc
                        </button>
                      </div>
                      <div class="mt-6 text-sm text-gray-500">
                        API key is saved locally. You can clone the original
                        repo and examine the code if you're unsure about
                        entering your API key.
                        <a
                          href="https://github.com/Troyanovsky/document_qa_langchain"
                          class="underline"
                          >Original Repo</a
                        >
                      </div>
                      <div
                        class="lex flex-col items-center w-full h-full bg-white"
                        v-if="file"
                      >
                        <div class="text-gray-400" v-if="fileName && chain">
                          {{ fileName }} loaded. You can ask questions now.
                          <span
                            class="clear-file underline cursor-pointer"
                            @click="clearFile()"
                            >[Clear File]</span
                          >
                        </div>
                        <div
                          class="text-gray-400"
                          v-else-if="fileName && !chain"
                        >
                          Loading {{ fileName }}... Please wait...
                        </div>
                      </div>
                      <div
                        class="lex flex-col items-center w-full h-full bg-white"
                        v-if="file"
                      >
                        <textarea
                          class="h-3/4 w-full pointer-events-none bg-white rounded-lg border-2 border-teal-500 text-gray-600 px-2"
                          v-model="chatHistoryString"
                          style="overflow-y: scroll"
                        ></textarea>
                      </div>
                      <div
                        class="lex flex-col items-center w-full h-full bg-white"
                        v-if="file"
                      >
                        <div class="flex w-full h-1/4 bg-white">
                          <!-- Textbox for Entering Text -->
                          <textarea
                            class="h-full w-10/12 bg-white rounded-lg border-2 border-blue-500 text-gray-600 px-2"
                            v-model="question"
                            @keydown.enter.prevent="askNewQuestion"
                          ></textarea>
                          <!-- Sending Text Button -->
                          <div
                            class="h-full w-2/12 bg-white flex items-center justify-center"
                          >
                            <button
                              class="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-lg px-4 py-2 sm:px-2 sm:py-1"
                              @click="askNewQuestion"
                            >
                              Send Question
                            </button>
                          </div>
                        </div>
                      </div>
                    </q-form>
                  </div>
                </div>
              </q-card>
            </div>
          </div>
        </q-page>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script>
import { OpenAI } from "langchain/llms/openai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// export default {
//   name: "FormComponent",
//   components: {},
//   data() {
//     return {
//       pdpa: ref(false),
//       picked: new Date(),
//       file_export: "",
//       url_api_individual: "",
//       url_api_institute: "",
//       url_api_disability: "",
//       url_api_project: "",
//       url_api_advisor: "",
//       url_api_member: "",
//       // ----------------------------------------------------------------------
//       title: "ข้อมูลส่วนตัว",
//       email: "",
//       username: "",
//       password: "",
//       repassword: "",
//       register: false,
//       passwordFieldType: "password",
//       btnLabel: "เพิ่มข้อมูล",
//       visibility: false,
//       visibilityIcon: "visibility",
//       input: {
//         username: "",
//         password: "",
//       },
//       member: {
//         member_id: 0,
//         full_name: "",
//         status: "",
//       },
//       individuals: Array,
//       individuals_: Array,
//       individual: {
//         individual_id: "",
//         // ข้อมูลส่วนตัว
//         member_id: this.$store.getters.myMember_id,
//         name: this.$store.getters.myName,
//         birthday: "",
//         // card_id: "",
//         telephone: "",
//         // ข้อมูลการศึกษา
//         institute_id: 1,
//         university: "",
//         faculty_id: "",
//         study_faculty: "",
//         degree_id: "",
//         degree: "",
//         department_id: "",
//         department: "",
//         is_graduate: "0",
//         year: "",
//         date: "",
//         // ข้อมูลความพิการ
//         is_disability: "0",
//         disability_id: "",
//         disability_type: "",
//         dis_description: "",
//         // เข้าร่วมจากโครงการ
//         project_id: "",
//       },
//       isEdit: false,
//       status: "บันทึก",
//       visibleColumns: ref([
//         "actions",
//         "individual_id",
//         "member_id",
//         "full_name",
//         "birthday",
//         "telephone",
//         "institute_id",
//         "institute_name",
//         "faculty_name",
//         "degree_name",
//         "department_id",
//         "department_name",
//         "is_graduate",
//         "date",
//         "year",
//         "is_disability",
//         "disability_id",
//         "disability_name",
//         "dis_describtion",
//         "project_id",
//         "project_name",
//         "advisor_id",
//         "advisor_name",
//       ]),
//       columns: [
//         // ข้อมูลส่วนตัว
//         { name: "actions", align: "center", label: "Action" },
//         {
//           name: "individual_id",
//           label: "รหัสข้อมูลส่วนตัว",
//           align: "center",
//           field: (row) => row.individual_id,
//           format: (val) => `${val}`,
//           required: true,
//           sortable: true,
//         },
//         // {
//         //   name: "member_id",
//         //   label: "รหัสสมาชิค",
//         //   align: "center",
//         //   field: "member_id",
//         //   sortable: true,
//         // },
//         {
//           name: "full_name",
//           align: "left",
//           label: "ชื่อ-สกุล",
//           field: "full_name",
//           sortable: true,
//         },
//         {
//           name: "birthday",
//           align: "center",
//           label: "วันเกิด",
//           field: "birthday",
//           sortable: true,
//         },
//         {
//           name: "telephone",
//           align: "center",
//           label: "โทรศัพท์",
//           field: "telephone",
//           sortable: true,
//         },
//         // ข้อมูลการศึกษา
//         // {
//         //   name: "institute_id",
//         //   align: "center",
//         //   label: "รหัสสถาบัน",
//         //   field: "institute_id",
//         //   sortable: true,
//         // },
//         {
//           name: "institute_name",
//           align: "left",
//           label: "สถาบัน",
//           field: "institute_name",
//           sortable: true,
//         },
//         {
//           name: "faculty_name",
//           align: "center",
//           label: "คณะ",
//           field: "faculty_name",
//           sortable: true,
//         },
//         {
//           name: "degree_name",
//           align: "center",
//           label: "ระดับ",
//           field: "degree_name",
//           sortable: true,
//         },
//         // {
//         //   name: "department_id",
//         //   align: "center",
//         //   label: "รหัสสาขา",
//         //   field: "department_id",
//         //   sortable: true,
//         // },
//         {
//           name: "department_name",
//           align: "center",
//           label: "สาขา",
//           field: "department_name",
//           sortable: true,
//         },
//         {
//           name: "is_graduate",
//           align: "center",
//           label: "จบการศึกษา",
//           field: "is_graduate",
//           sortable: true,
//         },
//         {
//           name: "date",
//           align: "center",
//           label: "ปีที่สำเร็จการศึกษา",
//           field: "date",
//           sortable: true,
//         },
//         {
//           name: "year",
//           align: "center",
//           label: "ปีที่กำลังศึกษา",
//           field: "year",
//           sortable: true,
//         },
//         // ข้อมูลความพิการ
//         {
//           name: "is_disability",
//           align: "center",
//           label: "ภาวะความพิการ",
//           field: "is_disability",
//           sortable: true,
//         },
//         // {
//         //   name: "disability_id",
//         //   align: "center",
//         //   label: "รหัสความพิการ",
//         //   field: "disability_id",
//         //   sortable: true,
//         // },
//         {
//           name: "disability_name",
//           align: "left",
//           label: "ความพิการ",
//           field: "disability_name",
//           sortable: true,
//         },
//         {
//           name: "dis_describtion",
//           align: "left",
//           label: "รายละเอียดความพิการ",
//           field: "dis_description",
//           sortable: true,
//         },
//         // เข้าร่วมจากโครงการ
//         // {
//         //   name: "project_id",
//         //   align: "center",
//         //   label: "รหัสโครงการ",
//         //   field: "project_id",
//         //   sortable: true,
//         // },
//         {
//           name: "project_name",
//           align: "left",
//           label: "โครงการ",
//           field: "project_name",
//           sortable: true,
//         },
//         // {
//         //   name: "advisor_id",
//         //   align: "center",
//         //   label: "รหัสผู้ดูแลกลุ่ม",
//         //   field: "advisor_id",
//         //   sortable: true,
//         // },
//         {
//           name: "advisor_name",
//           align: "left",
//           label: "ผู้ดูแลกลุ่ม",
//           field: "advisor_name",
//           sortable: true,
//         },
//       ],
//       filter: ref(""),
//       loading: ref(false),
//       individuals1: [],
//       institutes_: {
//         options: [],
//       },
//       institutes: {
//         options: [],
//       },
//       institute: ref({
//         label: "",
//         value: "",
//       }),
//       facultys: {
//         options: [],
//       },
//       facultys_: {
//         options: [],
//       },
//       faculty: ref({
//         label: "",
//         value: "",
//       }),
//       degrees_: {
//         options: [],
//       },
//       degrees: {
//         options: [],
//       },
//       degree: ref({
//         label: "",
//         value: "",
//       }),
//       departments_: {
//         options: [],
//       },
//       departments: {
//         options: [],
//       },
//       department: ref({
//         label: "",
//         value: "",
//       }),
//       disabilitys_: {
//         options: [],
//       },
//       disabilitys: {
//         options: [],
//       },
//       disability: ref({
//         label: "",
//         value: "",
//       }),
//       projects_: {
//         options: [],
//       },
//       projects: {
//         options: [],
//       },
//       project: ref({
//         label: "",
//         value: "",
//       }),
//       advisors_: {
//         options: [],
//       },
//       advisors: {
//         options: [],
//       },
//       advisor: ref({
//         label: "",
//         value: "",
//       }),
//       $q: useQuasar(),
//     };
//   },

//   methods: {
//     // นำออกไฟล์ excel
//     exportTable() {
//       console.log("Export excel");
//       var columns = this.columns;
//       var rows = this.individuals1;
//       // naive encoding to csv format
//       const content = [columns.map((col) => wrapCsvValue(col.label))]
//         .concat(
//           rows.map((row) =>
//             columns
//               .map((col) =>
//                 wrapCsvValue(
//                   typeof col.field === "function"
//                     ? col.field(row)
//                     : row[col.field === void 0 ? col.name : col.field],
//                   col.format,
//                   row
//                 )
//               )
//               .join(",")
//           )
//         )
//         .join("\r\n");

//       const status = exportFile(this.file_export, "\ufeff" + content, {
//         encoding: "utf-8",
//         mimeType: "text/csv;charset=utf-8;",
//       });

//       if (status !== true) {
//         $q.notify({
//           message: "Browser denied file download...",
//           color: "negative",
//           icon: "warning",
//         });
//       }
//     },
//     //---------------------------------------
//     onTelephone() {
//       console.log("next-telephone");
//     },
//     resetForm() {
//       this.isEdit = false;
//       console.log("isEdit:", this.isEdit);
//       this.btnLabel = "เพิ่มข้อมูล";
//       console.log("ยกเลิกการบันทึกข้อมูล");
//       // ข้อมูลส่วนตัว
//       this.individual.birthday = "";
//       // this.individual.card_id = "";
//       this.individual.telephone = "";
//       // ข้อมูลการศึกษา
//       this.is_graduate = "0";
//       this.individual.is_graduate = "0";
//       this.individual.year = "";
//       this.individual.date = "";
//       this.degree.value = "";
//       this.degree.label = "";
//       this.faculty.value = "";
//       this.faculty.label = "";
//       this.department.value = "";
//       this.department.label = "";
//       this.institute.value = "";
//       this.institute.label = "";
//       // ข้อมูลความพิการ
//       this.individual.is_disability = "0";
//       this.disability.value = "";
//       this.disability.label = "";
//       this.individual.dis_description = "";
//       // ข้อมูลโครงการ
//       this.project.label = "";
//       this.project.value = "";
//       // ข้อมูลผู้ดูแลกลุ่ม
//       this.advisor.label = "";
//       this.advisor.value = "";
//     },

//     submitForm() {
//       if (!this.isEdit) {
//         this.$q
//           .dialog({
//             title: "ยืนยัน",
//             message: "คุณต้องการบันทึกการเพิ่มข้อมูลหรือไม่?",
//             cancel: true,
//             persistent: true,
//           })
//           .onOk(() => {
//             console.log("บันทึกข้อมูล:", this.individual);
//             const newindividual = {
//               individual_id: this.individual.individual_id,
//               // ข้อมูลส่วนตัว
//               member_id: this.individual.member_id,
//               birthday: this.individual.birthday,
//               // card_id: this.individual.card_id,
//               telephone: this.individual.telephone,
//               // ข้อมูลการศึกษา
//               department_id: this.department.value,
//               is_graduate: this.is_graduate,
//               year: this.individual.year,
//               date: this.individual.date,
//               // ข้อมูลความพิการ
//               is_disability: this.individual.is_disability,
//               disability_id: this.disability.value,
//               dis_description: this.individual.dis_description,
//               // ข้อมูลโครงการ
//               project_id: this.project.value,
//               // ข้อมูลอาจารย์ที่ปรึกษา
//               advisor_id: this.advisor.value,
//             };
//             this.$emit("saveData", newindividual);

//             axios
//               .post(this.url_api_individual, {
//                 action: "insert",
//                 individual_id: this.individual.individual_id,
//                 // ข้อมูลส่วนตัว
//                 member_id: this.individual.member_id,
//                 birthday: this.individual.birthday,
//                 // card_id: this.individual.card_id,
//                 telephone: this.individual.telephone,
//                 // ข้อมูลการศึกษา
//                 department_id: this.department.value,
//                 is_graduate: this.individual.is_graduate,
//                 year: this.individual.year,
//                 date: this.individual.date,
//                 // ข้อมูลความพิการ
//                 is_disability: this.individual.is_disability,
//                 disability_id: this.disability.value,
//                 dis_description: this.individual.dis_description,
//                 // ข้อมูลโครงการ
//                 project_id: this.project.value,
//                 // ข้อมูลอาจารย์ที่ปรึกษา
//                 advisor_id: this.advisor.value,
//               })
//               .then((res) => {
//                 console.log("บันทึกข้อมูล:", res.data);
//                 // this.resetForm();
//                 this.getUpdate(this.individual.member_id);
//               })
//               .catch(function (error) {
//                 console.log(error);
//               });
//           });
//       } else {
//         this.$q
//           .dialog({
//             title: "ยืนยัน",
//             message: "คุณต้องการบันทึกการเแก้ไขข้อมูลหรือไม่?",
//             cancel: true,
//             persistent: true,
//           })
//           .onOk(() => {
//             console.log("บันทึกการแก้ไข project:", this.project.value);
//             axios
//               .post(this.url_api_individual, {
//                 action: "update",
//                 individual_id: this.individual.individual_id,
//                 // ข้อมูลส่วนตัว
//                 member_id: this.individual.member_id,
//                 birthday: this.individual.birthday,
//                 // card_id: this.individual.card_id,
//                 telephone: this.individual.telephone,
//                 // ข้อมูลการศึกษา
//                 department_id: this.department.value,
//                 is_graduate: this.individual.is_graduate,
//                 year: this.individual.year,
//                 date: this.individual.date,
//                 // ข้อมูลความพิการ
//                 is_disability: this.individual.is_disability,
//                 disability_id: this.disability.value,
//                 dis_description: this.individual.dis_description,
//                 // ข้อมูลโครงการ
//                 project_id: this.project.value,
//                 // ข้อมูลอาจารย์ที่ปรึกษา
//                 advisor_id: this.advisor.value,
//               })
//               .then((response) => {
//                 console.log("บันทึกการแก้ไข:", response.data);
//                 this.isEdit = false;
//                 console.log("isEdit:", this.isEdit);
//                 this.btnLabel = "เพิ่มข้อมูล";
//                 this.getUpdate(this.individual.member_id);
//               })
//               .catch(function (error) {
//                 console.log(error);
//               });
//           })
//           .onCancel(() => {
//             this.isEdit = false;
//             console.log("isEdit:", this.isEdit);
//             this.btnLabel = "เพิ่มข้อมูล";
//           });
//       }
//     },
//     editUser(individual_id) {
//       console.log("Edit data");
//       this.btnLabel = "แก้ไขข้อมูล";
//       this.isEdit = true;
//       var self = this;
//       axios
//         .post(this.url_api_individual, {
//           action: "edit",
//           individual_id: individual_id,
//         })
//         .then(function (response) {
//           console.log("Edit data:", response.data);
//           self.individual.individual_id = response.data.individual_id;
//           // ข้อมูลส่วนตัว
//           self.individual.member_id = response.data.member_id;
//           self.individual.birthday = response.data.birthday;
//           // self.individual.card_id = response.data.card_id;
//           self.individual.telephone = response.data.telephone;
//           // ข้อมูลการศึกษา
//           self.institute.value = response.data.institute_id;
//           self.institute.label = response.data.institute_name;
//           self.faculty.value = response.data.faculty_id;
//           self.faculty.label = response.data.faculty_name;
//           self.degree.value = response.data.degree_id;
//           self.degree.label = response.data.degree_name;
//           self.department.value = response.data.department_id;
//           self.department.label = response.data.department_name;

//           self.individual.is_graduate = String(response.data.is_graduate);
//           self.individual.date = response.data.date;
//           self.individual.year = response.data.year;
//           // ข้อมูลความพิการ
//           self.individual.is_disability = String(response.data.is_disability);
//           self.disability.value = response.data.disability_id;
//           self.disability.label = response.data.disability_name;
//           self.individual.dis_description = response.data.dis_description;
//           // ข้อมูลโครงการ
//           self.project.value = response.data.project_id;
//           self.project.label = response.data.project_name;
//           // ข้อมูลอาจารย์ที่ปรึกษา
//           self.advisor.value = response.data.advisor_id;
//           self.advisor.label = response.data.advisor_name;
//         })
//         .catch(function (error) {
//           console.log(error);
//         });
//     },
//     deleteUser(individual_id, full_name) {
//       this.$q
//         .dialog({
//           title: "ยืนยัน",
//           message:
//             "คุณต้องการลบ [ " +
//             individual_id +
//             "-" +
//             full_name +
//             " ] หรือไม่ ?",
//           cancel: true,
//           persistent: true,
//         })
//         .onOk(() => {
//           var self = this;
//           axios
//             .post(this.url_api_individual, {
//               action: "delete",
//               individual_id: individual_id,
//             })
//             .then(function (response) {
//               console.log("delete:", response.data);
//               self.getUpdate(self.individual.member_id);
//             })
//             .catch(function (error) {
//               console.log(error);
//             });
//         });
//     },
//     getUpdate(member_id) {
//       console.log("get update-member_id:", member_id);
//       var self = this;
//       axios
//         .post(this.url_api_individual, {
//           action: "getall",
//           member_id: member_id,
//         })
//         .then(function (res) {
//           console.log("q-table:", res);
//           self.individuals1 = res.data;
//           console.log("individuals1:", self.individuals1);
//         })
//         .finally(() => {
//           self.loading = false;
//         });
//     },
//     onNext() {
//       this.$router.replace({ name: "FormPlanCareer" });
//     },
//     onPrevious() {},
//     getInstitutes() {
//       console.log(" แสดงข้อมูลสถาบัน ");
//       var self = this;
//       axios
//         .post(this.url_api_institute, {
//           action: "getInstitutes",
//         })
//         .then(function (res) {
//           console.log("ข้อมูลสถาบัน:", res.data);
//           var institute_id = res.data.map((item) => item.institute_id);
//           var institute_name = res.data.map((item) => item.institute_name);
//           self.institutes.options.splice(0);
//           for (var i = 0; i < institute_id.length; i++) {
//             self.institutes.options.push({
//               label: institute_name[i],
//               value: institute_id[i],
//             });
//           }
//           self.institutes_.options = self.institutes.options;
//         })
//         .catch(function (error) {
//           console.log(error);
//         });
//     },
//     getFacultys() {
//       console.log(" แสดงข้อมูลคณะ: ", this.institute.value);
//       var self = this;
//       axios
//         .post(this.url_api_institute, {
//           action: "getFacultys",
//           institute_id: this.institute.value,
//         })
//         .then(function (res) {
//           console.log("ข้อมูลคณะ:", res.data);
//           var faculty_id = res.data.map((item) => item.faculty_id);
//           var faculty_name = res.data.map((item) => item.faculty_name);
//           self.facultys.options.splice(0);
//           for (var i = 0; i < faculty_id.length; i++) {
//             self.facultys.options.push({
//               label: faculty_name[i],
//               value: faculty_id[i],
//             });
//           }
//           self.facultys_.options = self.facultys.options;
//           console.log("ข้อมูล ชื่อคณะ:", self.facultys.options[0].label);
//           console.log("ข้อมูล รหัสคณะ:", self.facultys.options[0].value);
//         })
//         .catch(function (error) {
//           console.log(error);
//         });
//     },
//     getDegrees() {
//       console.log(" แสดงข้อมูลระดับการศึกษา ");
//       var self = this;
//       axios
//         .post(this.url_api_institute, {
//           action: "getDegrees",
//           institute_id: this.institute.value,
//           faculty_id: this.faculty.value,
//         })
//         .then(function (res) {
//           console.log("ข้อมูลระดับการศึกษา:", res.data);
//           var degree_id = res.data.map((item) => item.degree_id);
//           var degree_name = res.data.map((item) => item.degree_name);
//           self.degrees.options.splice(0);
//           for (var i = 0; i < degree_id.length; i++) {
//             self.degrees.options.push({
//               label: degree_name[i],
//               value: degree_id[i],
//             });
//           }
//           self.degrees_.options = self.degrees.options;
//         })
//         .catch(function (error) {
//           console.log(error);
//         });
//     },
//     getDepartments() {
//       console.log(" แสดงข้อมูลสาขาวิชา ");
//       var self = this;
//       axios
//         .post(this.url_api_institute, {
//           action: "getDepartments",
//           degree_id: this.degree.value,
//           institute_id: this.institute.value,
//           faculty_id: this.faculty.value,
//         })
//         .then(function (res) {
//           console.log("ข้อมูลสาขาวิชา:", res.data);
//           var department_id = res.data.map((item) => item.department_id);
//           var department_name = res.data.map((item) => item.department_name);
//           self.departments.options.splice(0);
//           for (var i = 0; i < department_id.length; i++) {
//             self.departments.options.push({
//               label: department_name[i],
//               value: department_id[i],
//             });
//           }
//           self.departments_.options = self.departments.options;
//         })
//         .catch(function (error) {
//           console.log(error);
//         });
//     },
//     getDisabilitys() {
//       console.log(" แสดงข้อมูลสาขาวิชา ");
//       var self = this;
//       axios
//         .post(this.url_api_disability, {
//           action: "getDisabilitys",
//         })
//         .then(function (res) {
//           console.log("ข้อมูลชนิดความพิการ:", res.data);
//           var disability_id = res.data.map((item) => item.disability_id);
//           var disability_name = res.data.map((item) => item.disability_name);
//           self.disabilitys.options.splice(0);
//           for (var i = 0; i < disability_id.length; i++) {
//             self.disabilitys.options.push({
//               label: disability_name[i],
//               value: disability_id[i],
//             });
//           }
//           self.disabilitys_.options = self.disabilitys.options;
//         })
//         .catch(function (error) {
//           console.log(error);
//         });
//     },
//     getProjects() {
//       console.log(" แสดงข้อมูลโครงการ ");
//       var self = this;
//       axios
//         .post(this.url_api_project, {
//           action: "getProjects",
//         })
//         .then(function (res) {
//           console.log("ข้อมูลโครงการ:", res.data);
//           var project_id = res.data.map((item) => item.project_id);
//           var project_name = res.data.map((item) => item.project_name);
//           self.projects.options.splice(0);
//           for (var i = 0; i < project_id.length; i++) {
//             self.projects.options.push({
//               label: project_name[i],
//               value: project_id[i],
//             });
//           }
//           self.projects_.options = self.projects.options;
//         })
//         .catch(function (error) {
//           console.log(error);
//         });
//     },
//     getAdvisors_() {
//       console.log(" แสดงข้อมูลอาจารย์ที่ปรึกษา ");
//       var self = this;
//       axios
//         .post(this.url_api_advisor, {
//           action: "getAdvisors",
//         })
//         .then(function (res) {
//           console.log("ข้อมูลอาจารย์ที่ปรึกษา:", res.data);
//           var advisor_id = res.data.map((item) => item.advisor_id);
//           var advisor_name = res.data.map((item) => item.advisor_name);
//           self.advisors.options.splice(0);
//           for (var i = 0; i < advisor_id.length; i++) {
//             self.advisors.options.push({
//               label: advisor_name[i],
//               value: advisor_id[i],
//             });
//           }
//           self.advisors_.options = self.advisors.options;
//         })
//         .catch(function (error) {
//           console.log(error);
//         });
//     },
//     getAdvisors() {
//       console.log(" แสดงข้อมูลอาจารย์ที่ปรึกษา ");
//       var self = this;
//       axios
//         .post(this.url_api_advisor, {
//           action: "getAdvisors",
//         })
//         .then(function (res) {
//           console.log("ข้อมูลอาจารย์ที่ปรึกษา:", res.data);
//           var advisor_id = res.data.map((item) => item.member_id);
//           var advisor_name = res.data.map((item) => item.full_name);
//           self.advisors.options.splice(0);
//           for (var i = 0; i < advisor_id.length; i++) {
//             self.advisors.options.push({
//               label: advisor_name[i],
//               value: advisor_id[i],
//             });
//           }
//           self.advisors_.options = self.advisors.options;
//           console.log("ข้อมูลอาจารย์ที่ปรึกษา1:", self.advisors_.options);
//         })
//         .catch(function (error) {
//           console.log(error);
//         });
//     },
//     onBirthday(val) {
//       console.log("Thai Date:", val);
//     },
//     onInstituteValueChange(val) {
//       console.log("เลือกสถาบัน:", val.label);
//       console.log("รหัสสถาบัน:", val.value);
//       this.getFacultys();
//     },
//     onFacultyValueChange(val) {
//       console.log("เลือกคณะ:", val.label);
//       console.log("รหัสคณะ:", val.value);
//       this.getDegrees();
//     },
//     onDegreeValueChange(val) {
//       console.log("เลือกระดับการศึกษา:", val.label);
//       console.log("รหัสระดับการศึกษา:", val.value);
//       this.getDepartments();
//     },
//     onDepartmentValueChange(val) {
//       console.log("เลือกสาขาวิชา:", val.label);
//       console.log("รหัสสาขาวิชา:", val.value);
//     },
//     onProjectValueChange(val) {
//       console.log("เลือกโครงการ:", val.label);
//       console.log("รหัสโครงการ:", val.value);
//     },
//     onDisabilityValueChange(val) {
//       console.log("เลือกความพิการ:", val.label);
//       console.log("รหัสความพิการ:", val.value);
//     },
//     filterInstitute(val, update) {
//       if (val === "") {
//         update(() => {
//           this.institutes.options = this.institutes_.options;
//           console.log("institutes_.options:", this.institutes_.options);
//         });
//         return;
//       }
//       update(() => {
//         const needle = val.toLowerCase();
//         console.log("needle:", needle);
//         this.institutes.options = this.institutes_.options.filter(
//           (v) => v.label.indexOf(needle) > -1
//         );
//         console.log("institutes_.options:", this.institutes_.options);
//       });
//     },
//     filterFaculty(val, update) {
//       if (val === "") {
//         update(() => {
//           this.facultys.options = this.facultys_.options;
//         });
//         return;
//       }
//       update(() => {
//         const needle = val.toLowerCase();
//         console.log("needle:", needle);
//         this.facultys.options = this.facultys_.options.filter(
//           (v) => v.label.indexOf(needle) > -1
//         );
//       });
//     },
//     filterDegree(val, update) {
//       if (val === "") {
//         update(() => {
//           this.degrees.options = this.degrees_.options;
//         });
//         return;
//       }
//       update(() => {
//         const needle = val.toLowerCase();
//         console.log("needle:", needle);
//         this.degrees.options = this.degrees_.options.filter(
//           (v) => v.label.indexOf(needle) > -1
//         );
//       });
//     },
//     filterDepartment(val, update) {
//       if (val === "") {
//         update(() => {
//           this.departments.options = this.departments_.options;
//         });
//         return;
//       }
//       update(() => {
//         const needle = val.toLowerCase();
//         console.log("needle:", needle);
//         this.departments.options = this.departments_.options.filter(
//           (v) => v.label.indexOf(needle) > -1
//         );
//       });
//     },
//     filterDisability(val, update) {
//       if (val === "") {
//         update(() => {
//           this.disabilitys.options = this.disabilitys_.options;
//         });
//         return;
//       }
//       update(() => {
//         const needle = val.toLowerCase();
//         console.log("needle:", needle);
//         this.disabilitys.options = this.disabilitys_.options.filter(
//           (v) => v.label.indexOf(needle) > -1
//         );
//       });
//     },
//     filterProject(val, update) {
//       if (val === "") {
//         update(() => {
//           this.projects.options = this.projects_.options;
//         });
//         return;
//       }
//       update(() => {
//         const needle = val.toLowerCase();
//         console.log("needle:", needle);
//         this.projects.options = this.projects_.options.filter(
//           (v) => v.label.indexOf(needle) > -1
//         );
//       });
//     },
//     filterAdvisor(val, update) {
//       if (val === "") {
//         update(() => {
//           this.advisors.options = this.advisors_.options;
//         });
//         return;
//       }
//       update(() => {
//         const needle = val.toLowerCase();
//         console.log("needle:", needle);
//         this.advisors.options = this.advisors_.options.filter(
//           (v) => v.label.indexOf(needle) > -1
//         );
//       });
//     },
//     OnInstitute(institute) {
//       if (!institute)
//         this.institute = ref({
//           label: "",
//           value: "",
//         });
//     },
//     OnFaculty(faculty) {
//       if (!faculty)
//         this.faculty = ref({
//           label: "",
//           value: "",
//         });
//     },
//     OnDegree(degree) {
//       if (!degree)
//         this.degree = ref({
//           label: "",
//           value: "",
//         });
//     },
//     OnDepartment(department) {
//       if (!department)
//         this.department = ref({
//           label: "",
//           value: "",
//         });
//     },
//     OnDisability(disability) {
//       if (!disability)
//         this.disability = ref({
//           label: "",
//           value: "",
//         });
//     },
//     OnProject(project) {
//       if (!project)
//         this.project = ref({
//           label: "",
//           value: "",
//         });
//     },
//     OnAdvisor(advisor) {
//       if (!advisor)
//         this.advisor = ref({
//           label: "",
//           value: "",
//         });
//     },
//   },
//   mounted() {
//     this.getUpdate(this.individual.member_id);
//     this.getInstitutes();
//     this.getFacultys();
//     this.getDegrees();
//     this.getDepartments();
//     this.getDisabilitys();
//     this.getProjects();
//     this.getAdvisors();
//   },
//   created() {
//     var www = this.$store.getters.myWWW;
//     var folder = "icp_v1/individual_form/";
//     var local_ = "http://localhost:85/icp2022/" + folder;
//     var www_ = "https://icp2022.net/" + folder;
//     if (!www) {
//       console.log("www:", !www);
//       this.url_api_individual = local_ + "api-individual.php";
//       this.url_api_institute = local_ + "api-institute.php";
//       this.url_api_disability = local_ + "api-disability.php";
//       this.url_api_project = local_ + "api-project.php";
//       this.url_api_advisor = local_ + "api-advisor.php";
//       this.url_api_member = local_ + "api-member.php";
//     } else {
//       console.log("www:", www);
//       this.url_api_individual = www_ + "api-individual.php";
//       this.url_api_institute = www_ + "api-institute.php";
//       this.url_api_disability = www_ + "api-disability.php";
//       this.url_api_project = www_ + "api-project.php";
//       this.url_api_advisor = www_ + "api-advisor.php";
//       this.url_api_member = www_ + "api-member.php";
//     }
//   },
// };
export default {
  data() {
    return {
      // For initialization
      title: "ChatGPT",
      openAIKey: "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",
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
      }
      // else if (this.file.type === "application/pdf") {
      //   console.log("Loading PDF file...");
      //   const reader = new FileReader();
      //   reader.onload = async () => {
      //     const pdfData = reader.result;
      //     GlobalWorkerOptions.workerSrc = "/pdf.worker.js";
      //     const pdfDoc = await getDocument({ data: pdfData }).promise;
      //     let fileContent = "";
      //     for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      //       const page = await pdfDoc.getPage(pageNum);
      //       const content = await page.getTextContent();
      //       const text = content.items.map((item) => item.str).join(" ");
      //       fileContent += text + "\n";
      //     }
      //     this.fileContent = fileContent;
      //     this.processFileContent();
      //   };
      //   console.log("Loading PDF file...");
      //   reader.readAsArrayBuffer(this.file);
      // }
      else {
        this.clearFile();
        alert(
          "File type not supported. Please choose a text-based file: plain text, markdown, HTML, JSON, XML, etc. or a PDF file."
        );
        return;
      }
    },
    async processFileContent() {
      console.log("Splitting file content into chunks...");
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
      });
      console.log(this.fileContent);
      this.docs = await textSplitter.createDocuments([this.fileContent]);

      try {
        console.log("Creating embeddings...");
        this.vectorStore = await MemoryVectorStore.fromDocuments(
          this.docs,
          new OpenAIEmbeddings({
            openAIApiKey: "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",
          })
        );
      } catch (error) {
        // If there is an error, clear the file and show the error message
        alert(
          "An error occurred while embedding the document with OpenAI API:" +
            error
        );
        this.clearFile();
        throw error;
      }

      console.log("Creating chain...");
      this.chain = ConversationalRetrievalQAChain.fromLLM(
        this.model,
        this.vectorStore.asRetriever(),
        { returnSourceDocuments: true }
      );
    },
    async askNewQuestion() {
      console.log("Sending Question...");
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
      // console.log(answer);
      // this.formattedChatHistory.push({
      //   sender: "bot",
      //   message: answer.text.trim(),
      // });
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
