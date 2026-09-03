from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS


embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)


def create_vector_store(chunks: list[str]):
    vector_store = FAISS.from_texts(
        texts=chunks,
        embedding=embedding_model
    )

    return vector_store


def search_resume(vector_store, query: str, k: int = 3):
    results = vector_store.similarity_search(
        query,
        k=k
    )

    return results