from langchain_community.document_loaders import (
    TextLoader,
    PyPDFLoader,
    Docx2txtLoader,
    DirectoryLoader    
)
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from pathlib import Path

def load_job_descriptions(file_path: str):
    """Load a single job description file"""

    path = Path(file_path)

    if path.suffix == ".pdf":
        loader = PyPDFLoader(file_path)
    elif path.suffix == ".docx":
        loader = Docx2txtLoader(file_path)
    else:
        loader = TextLoader(file_path)

    documents = loader.load()

    for doc in documents:
        doc.metadata['source'] = path.name
        doc.metadata['type'] = 'job_description'

    return documents

def load_all_documents(directory: str):
    """Load all files from the directory"""

    loader = DirectoryLoader(
        directory,
        glob="**/*.txt",
        loader_cls=TextLoader
    )
    return loader.load()

def split_documents(documents, chunk_size=500, chunk_overlap=50):
    """Splitting documents into smaller chucks for embedding"""

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap= chunk_overlap,
        separators=["\n\n", "\n", ". ", " ", ""]
    )
    return splitter.split_documents(documents)

def create_docs_from_text(text: str) -> list[Document]:
    """Create LangChain Documents from a raw text string."""
    return [Document(page_content=text, metadata={"source": "inline", "type": "job_description"})]

