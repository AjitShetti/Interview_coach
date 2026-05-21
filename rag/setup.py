from rag.loader import load_job_descriptions, split_documents
from rag.retriever import create_vector_store, create_retriever
from chains.question_generator import create_question_generator

def setup_interview_rag(job_description_path: str):
    """RAG powered interviews setup"""

    print("Loading job description...")
    docs = load_job_descriptions(job_description_path)

    print("Splitting into chunks...")
    chunks = split_documents(docs, chunk_size=300, chunk_overlap=30)
    print(f"Created {len(chunks)} chunks")

    print("Creating embeddings and vector store...")
    vector_store = create_vector_store(chunks)
    retriever = create_retriever(vector_store, k=3)
    question_generator = create_question_generator(retriever)

    return {
        "vector_store": vector_store,
        "retriever": retriever,
        "question_generator": question_generator
    }