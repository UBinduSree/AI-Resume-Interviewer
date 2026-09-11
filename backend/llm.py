import os
import time

from dotenv import load_dotenv
from google import genai

from prompts import INTERVIEW_QUESTION_PROMPT

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

PRIMARY_MODEL = os.getenv(
    "GEMINI_MODEL",
    "gemini-3.6-flash-lite"
)

FALLBACK_MODELS = [
    PRIMARY_MODEL,
    "gemini-3.5-flash",
    "gemini-3.7-flash",
    "gemini-flash-lite-latest",
]


def generate_with_fallback(prompt: str):
    last_error = None

    for model in FALLBACK_MODELS:
        try:
            print(f"Trying Gemini model: {model}")

            response = client.models.generate_content(
                model=model,
                contents=prompt
            )

            if response.text:
                print(f"Successful model: {model}")
                return response.text

        except Exception as error:
            last_error = error
            print(f"Model {model} failed: {error}")

            # Small delay before trying the next model
            time.sleep(1)

    raise last_error


def generate_interview_questions(
    context: str,
    category: str = "Mixed",
    difficulty: str = "Medium",
    num_questions: int = 5
):
    prompt = INTERVIEW_QUESTION_PROMPT.format(
        context=context,
        category=category,
        difficulty=difficulty,
        num_questions=num_questions
    )

    return generate_with_fallback(prompt)


def answer_resume_question(
    context: str,
    question: str
):
    prompt = f"""
You are an AI assistant answering questions about a candidate's resume.

Use ONLY the resume context provided below.

Resume context:
{context}

User question:
{question}

Rules:
1. Answer only using information supported by the resume context.
2. Do not invent skills, projects, responsibilities, technologies,
   metrics, or experiences.
3. If the answer is not supported by the resume context, clearly say:
   "I couldn't find that information in the resume."
4. Keep the answer concise and useful.
"""

    return generate_with_fallback(prompt)

def evaluate_interview_answer(
    question: str,
    answer: str,
    context: str
):
    prompt = f"""
You are an AI technical interviewer evaluating a candidate's answer.

The candidate's resume context is provided below.

Resume context:
{context}

Interview question:
{question}

Candidate's answer:
{answer}

Evaluate the answer using ONLY information supported by the resume
context and the candidate's response.

Return your evaluation in exactly this format:

SCORE: X/10

STRENGTHS:
- strength 1
- strength 2

IMPROVEMENTS:
- improvement 1
- improvement 2

FEEDBACK:
A short professional explanation of how the candidate could improve
the answer.

FOLLOW_UP:
One relevant follow-up interview question.

Rules:
1. Do not invent resume information.
2. Do not give credit for technologies or experience that the candidate
   did not demonstrate.
3. Be fair and constructive.
4. Consider technical accuracy, clarity, relevance, and completeness.
5. Keep the evaluation concise.
"""

    return generate_with_fallback(prompt)   