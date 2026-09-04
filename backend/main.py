from urllib import request

from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from document_processor import (
    extract_text_from_pdf,
    split_text_into_chunks
)
from rag_pipeline import create_vector_store
from llm import generate_interview_questions, answer_resume_question
app = FastAPI(title="AI Resume Interviewer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

vector_store = None

class InterviewRequest(BaseModel):
    category: str = "Mixed"
    difficulty: str = "Medium"
    num_questions: int = 5

class ChatRequest(BaseModel):
    question: str

@app.get("/")
def root():
    return {
        "message": "AI Resume Interviewer API is running!"
    }


@app.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    file_path = f"uploaded_{file.filename}"

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    resume_text = extract_text_from_pdf(file_path)

    chunks = split_text_into_chunks(resume_text)

    global vector_store
    vector_store = create_vector_store(chunks)

    results = vector_store.similarity_search(
        "What projects did the candidate work on?",
        k=3
    )

    return {
        "filename": file.filename,
        "total_chunks": len(chunks),
        "retrieved_chunks": [
            result.page_content
            for result in results
        ]
    }

@app.post("/generate-questions")
def generate_questions(request: InterviewRequest):
    if vector_store is None:
        return {
            "error": "Please upload a resume first."
        }

    search_query = f"""
    Candidate resume information related to:
    {request.category} interview questions,
    candidate skills, projects, experience,
    technologies, education, and achievements.
    """

    results = vector_store.similarity_search(
        search_query,
        k=5
    )

    context = "\n\n".join(
        result.page_content
        for result in results
    )

    questions = generate_interview_questions(
        context=context,
        category=request.category,
        difficulty=request.difficulty,
        num_questions=request.num_questions
    )

    return {
        "category": request.category,
        "difficulty": request.difficulty,
        "num_questions": request.num_questions,
        "questions": questions
    }

class ChatRequest(BaseModel):
    question: str


@app.post("/chat")
def chat_with_resume(request: ChatRequest):
    if vector_store is None:
        return {
            "error": "Please upload a resume first."
        }

    results = vector_store.similarity_search(
        request.question,
        k=5
    )

    context = "\n\n".join(
        result.page_content
        for result in results
    )

    answer = answer_resume_question(
        context=context,
        question=request.question
    )

    return {
        "question": request.question,
        "answer": answer
    }