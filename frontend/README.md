# AI Resume Interviewer | RAG-Powered Interview Assistant

An AI-powered interview preparation application that analyzes a candidate's resume and generates personalized interview questions using Retrieval-Augmented Generation (RAG).

## Features

* Resume PDF upload and text extraction
* Resume text chunking and preprocessing
* Semantic search using Hugging Face embeddings and FAISS
* Personalized Technical, Project, HR, and Mixed interview questions
* Adjustable interview difficulty and question count
* Google Gemini-powered question generation
* Resume-grounded conversational Q&A
* React frontend with FastAPI backend

## Tech Stack

**Frontend**

* React
* Vite
* CSS

**Backend**

* Python
* FastAPI
* pypdf

**AI / RAG**

* LangChain
* Google Gemini
* Hugging Face Sentence Transformers
* FAISS

## Architecture

```text
Resume PDF
    ↓
PDF Text Extraction
    ↓
Text Chunking
    ↓
Hugging Face Embeddings
    ↓
FAISS Vector Store
    ↓
Semantic Retrieval
    ↓
Relevant Resume Context
    ↓
Google Gemini
    ↓
Personalized Interview Response
```

## How to Run

### Backend

```bash
cd backend
python -m venv venv
```

Activate the virtual environment on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_api_key_here
```

Start the backend:

```bash
uvicorn main:app --reload
```

Backend runs at:

```text
http://localhost:8000
```

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

## RAG Workflow

The application converts resume content into vector embeddings and stores them in FAISS. When an interview question or resume-related query is submitted, the system retrieves the most relevant resume chunks and provides them as context to Gemini. This helps generate responses grounded in the candidate's actual resume information.

## Future Improvements

* AI-powered answer evaluation
* Interview simulation mode
* Skill extraction
* Interview readiness scoring
* Persistent vector-store management
* Deployment to a cloud platform
