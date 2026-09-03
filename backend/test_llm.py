from llm import generate_interview_questions


context = """
The candidate built a Secure ML Inference API using FastAPI,
Scikit-learn, JWT authentication, REST APIs, and Postman.
"""


questions = generate_interview_questions(
    context=context,
    category="Technical",
    difficulty="Medium",
    num_questions=5
)

print(questions)