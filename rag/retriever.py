from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
import os
from typing import List, Any
from pydantic import SecretStr

def create_vector_store(documents: List[Document], persist_directory: str = None):
    """Creates vector store for documents"""

    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/embedding-001",
        api_key = SecretStr(os.environ.get("GEMINI_API_KEY", ""))
    )

    if persist_directory:
        vector_store = Chroma.from_documents(
            documents=documents,
            embedding=embeddings,
            persist_directory=persist_directory,
        )
    else:
        vector_store = Chroma.from_documents(
            documents=documents,
            embedding=embeddings
        )
    
    return vector_store

def load_vector_store(persist_directory:str):
    """Loads an existing vector store"""

    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/embedding-001",
        api_key = SecretStr(os.environ.get("GEMINI_API_KEY", " "))
    )

    return Chroma(
        persist_directory=persist_directory,
        embedding_function=embeddings
    )

def create_retriever(vector_store, k:int = 4):
    """Create a retriever that finds similar documents"""

    return vector_store.as_retriever(
        search_types="similarity",
        search_kwargs={'k':k}
    )


        