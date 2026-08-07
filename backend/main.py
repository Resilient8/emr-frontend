from fastapi import FastAPI
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware
import uvicorn
import asyncio
# ---------------------------------------------------------------------------------------
# ------------------Huggingface----------------------------------------------------------
# ---------------------------------------------------------------------------------------
import streamlit as st
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from transformers import pipeline
import torch
import base64
import textwrap
# from langchain.embeddings import SentenceTransformerEmbeddings
from langchain_community.embeddings import SentenceTransformerEmbeddings
# from langchain.vectorstores import Chroma
from langchain_community.vectorstores import Chroma
# from langchain.llms import HuggingFacePipeline
from langchain_community.llms import HuggingFacePipeline
from langchain.chains import RetrievalQA

# ----------------------------------readfull api----------------------------------------------------
#model and tokenizer loading
checkpoint = "MBZUAI/LaMini-T5-738M"
tokenizer = AutoTokenizer.from_pretrained(checkpoint)
base_model = AutoModelForSeq2SeqLM.from_pretrained(checkpoint, device_map='auto', offload_folder="offload", torch_dtype=torch.float32)

# persist_directory = "C:/Users/Jeeranan/OneDrive - Maejo university/Desktop/Search-Your-PDF-App-main/db/"
@st.cache_resource
def llm_pipeline():
    pipe = pipeline(
        'text2text-generation',
        model = base_model,
        tokenizer = tokenizer,
        max_length = 256,
        do_sample=True,
        temperature = 0.3,
        top_p = 0.95
    )
    local_llm = HuggingFacePipeline(pipeline=pipe)
    return local_llm

@st.cache_resource
def qa_llm():
    llm = llm_pipeline()
    embeddings = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
    db = Chroma(persist_directory="C:/Search-Your-PDF-App-main/db/", embedding_function=embeddings)
    # db = Chroma(persist_directory="db", embedding_function=embeddings, client_settings=CHROMA_SETTINGS)
    retriever = db.as_retriever()
    qa = RetrievalQA.from_chain_type(llm=llm, chain_type="stuff", retriever=retriever, return_source_documents=True)
    return qa

@st.cache_resource
def qa_llm1():
    llm = llm_pipeline()
    embeddings = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
    db = Chroma(persist_directory="C:/Search-Your-PDF-App-main/db1/", embedding_function=embeddings)
    # db = Chroma(persist_directory="db", embedding_function=embeddings, client_settings=CHROMA_SETTINGS)
    retriever = db.as_retriever()
    qa = RetrievalQA.from_chain_type(llm=llm, chain_type="stuff", retriever=retriever, return_source_documents=True)
    return qa

@st.cache_resource
def qa_llm2():
    llm = llm_pipeline()
    embeddings = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
    db = Chroma(persist_directory="C:/Search-Your-PDF-App-main/db2/", embedding_function=embeddings)
    # db = Chroma(persist_directory="db", embedding_function=embeddings, client_settings=CHROMA_SETTINGS)
    retriever = db.as_retriever()
    qa = RetrievalQA.from_chain_type(llm=llm, chain_type="stuff", retriever=retriever, return_source_documents=True)
    return qa

@st.cache_resource
def qa_llm3():
    llm = llm_pipeline()
    embeddings = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
    db = Chroma(persist_directory="C:/Search-Your-PDF-App-main/db3/", embedding_function=embeddings)
    # db = Chroma(persist_directory="db", embedding_function=embeddings, client_settings=CHROMA_SETTINGS)
    retriever = db.as_retriever()
    qa = RetrievalQA.from_chain_type(llm=llm, chain_type="stuff", retriever=retriever, return_source_documents=True)
    return qa

@st.cache_resource
def qa_llm4():
    llm = llm_pipeline()
    embeddings = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
    db = Chroma(persist_directory="C:/Search-Your-PDF-App-main/db4/", embedding_function=embeddings)
    # db = Chroma(persist_directory="db", embedding_function=embeddings, client_settings=CHROMA_SETTINGS)
    retriever = db.as_retriever()
    qa = RetrievalQA.from_chain_type(llm=llm, chain_type="stuff", retriever=retriever, return_source_documents=True)
    return qa

def process_answer(instruction):
    response = ''
    instruction = instruction
    qa = qa_llm()
    generated_text = qa(instruction)
    answer = generated_text['result']
    # metadata = generated_text['metadata']
    # for text in generated_text:

    #     print(answer)

    # wrapped_text = textwrap.fill(response, 100)
    # return wrapped_text
    return answer,generated_text

def process_answer1(instruction):
    response = ''
    instruction = instruction
    qa = qa_llm1()
    generated_text = qa(instruction)
    answer = generated_text['result']
    # metadata = generated_text['metadata']
    # for text in generated_text:

    #     print(answer)

    # wrapped_text = textwrap.fill(response, 100)
    # return wrapped_text
    return answer,generated_text

def process_answer2(instruction):
    response = ''
    instruction = instruction
    qa = qa_llm2()
    generated_text = qa(instruction)
    answer = generated_text['result']
    # metadata = generated_text['metadata']
    # for text in generated_text:

    #     print(answer)

    # wrapped_text = textwrap.fill(response, 100)
    # return wrapped_text
    return answer,generated_text

def process_answer3(instruction):
    response = ''
    instruction = instruction
    qa = qa_llm3()
    generated_text = qa(instruction)
    answer = generated_text['result']
    # metadata = generated_text['metadata']
    # for text in generated_text:

    #     print(answer)

    # wrapped_text = textwrap.fill(response, 100)
    # return wrapped_text
    return answer,generated_text

def process_answer4(instruction):
    response = ''
    instruction = instruction
    qa = qa_llm4()
    generated_text = qa(instruction)
    answer = generated_text['result']
    # metadata = generated_text['metadata']
    # for text in generated_text:

    #     print(answer)

    # wrapped_text = textwrap.fill(response, 100)
    # return wrapped_text
    return answer,generated_text
# -----------------------------------------------------------------------------------------

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Question(BaseModel):
    question: str

@app.post("/answer/")
async def answers(response_model:Question):
    answer,generate_text = process_answer(response_model.question)
    return answer,generate_text

@app.post("/answer1/")
async def answers(response_model:Question):
    answer,generate_text = process_answer1(response_model.question)
    return answer,generate_text

@app.post("/answer2/")
async def answers(response_model:Question):
    answer,generate_text = process_answer2(response_model.question)
    return answer,generate_text

@app.post("/answer3/")
async def answers(response_model:Question):
    answer,generate_text = process_answer3(response_model.question)
    return answer,generate_text

@app.post("/answer4/")
async def answers(response_model:Question):
    answer,generate_text = process_answer4(response_model.question)
    return answer,generate_text

async def main():
    config = uvicorn.Config("main:app", port=5000, log_level="info")
    server = uvicorn.Server(config)
    await server.serve()

if __name__ == "__main__":
    asyncio.run(main())

# $ python main.py

# class TeamOut(BaseModel):
#     name: str
#     city: str
#     wins: int = 0
#     losses: int = 0

# class Team(TeamOut):
#     id: int

# teams = [
#     Team(id=0, name="Magic", city="Orlando"),
#     Team(id=1, name="Heat", city="Miami"),
# ]

# @app.get("/")
# async def root():
#     return {"message": "Hello World"}

# @app.get("/teams", response_model=list[TeamOut])
# async def getTeams():
#     return teams

# @app.post("/team/")
# async def scoreTeam(response_model:TeamOut):
#     return response_model
