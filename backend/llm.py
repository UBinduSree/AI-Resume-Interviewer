import os
from dotenv import load_dotenv
from google import genai
from prompts import INTERVIEW_QUESTION_PROMPT

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


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

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt
    )

    return response.text