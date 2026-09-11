# 🤖 AI Resume Interviewer

An AI-powered resume-based interview preparation application that uses **Retrieval-Augmented Generation (RAG)** to generate personalized interview questions and evaluate candidate answers based on the uploaded resume.

The application allows users to upload a PDF resume, generate customized interview questions, practice through an AI mock interview, receive detailed AI feedback, and chat with their resume.

---

## 🚀 Features

### 📄 Resume Upload & Processing
- Upload a resume in PDF format.
- Extract text from the uploaded resume.
- Split resume content into smaller chunks.
- Convert resume chunks into vector embeddings.
- Store and retrieve relevant resume sections using FAISS.

### 🧠 RAG-Based Question Generation
- Uses Retrieval-Augmented Generation to ground AI responses in the candidate's resume.
- Retrieves relevant resume context before generating questions.
- Supports multiple interview categories:
  - Technical
  - Project
  - HR
  - Mixed
- Supports multiple difficulty levels:
  - Easy
  - Medium
  - Hard
- Allows users to choose the number of questions.

### 🎤 AI Mock Interview
- Start an interactive interview using questions generated from the resume.
- Answer questions one at a time.
- Submit answers for AI evaluation.
- Receive:
  - Score out of 10
  - Strengths
  - Areas for improvement
  - Detailed feedback
  - Follow-up questions
- Move through the interview question by question.
- View an average score after completing the interview.

### 💬 Resume Chat
Users can ask questions about their resume, such as:

- What projects has the candidate worked on?
- What programming languages does the candidate know?
- What is the candidate's educational background?
- What technologies are mentioned in the resume?

The application retrieves relevant resume context before generating an answer.

### 🔐 Context-Aware AI Responses
The application instructs the language model to use the retrieved resume context and avoid inventing unsupported information.

If the requested information is not available in the retrieved resume context, the AI is instructed to state that the information could not be found.

### 🔄 Gemini Model Fallback
The backend supports multiple Gemini models through a fallback mechanism.

If the primary model fails, the application automatically attempts another configured model.

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │      React UI       │
                    │     Frontend        │
                    └──────────┬──────────┘
                               │
                               │ HTTP / REST API
                               ▼
                    ┌─────────────────────┐
                    │      FastAPI        │
                    │      Backend        │
                    └──────────┬──────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
        ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
        │ PDF Text    │ │   FAISS     │ │   Gemini    │
        │ Extraction  │ │ Vector      │ │    LLM      │
        │ & Chunking  │ │ Retrieval   │ │ Generation  │
        └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
               │               │               │
               ▼               ▼               ▼
        Resume Text      Relevant Resume   AI Questions,
        & Chunks         Context           Answers & Feedback
