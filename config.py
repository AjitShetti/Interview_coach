from pydantic_settings import BaseSettings
from typing import Literal, Optional


class Settings(BaseSettings):
    # API Keys
    gemini_api_key: str = ""

    # Model settings
    model_name: str = "gemini-2.5-flash-lite"
    temperature: float = 0.7
    max_tokens: int = 1000

    # Interview settings
    max_questions: int = 5
    default_difficulty: Literal["easy", "medium", "hard"] = "medium"

    # RAG settings
    chunk_size: int = 500
    chunk_overlap: int = 50
    retriever_k: int = 3

    # Database — required only when running the FastAPI backend
    database_url: Optional[str] = None

    # JWT Auth — required only when running the FastAPI backend
    secret_key: Optional[str] = None
    access_token_expire_minutes: int = 60

    class Config:
        env_file = ".env"


settings = Settings()
