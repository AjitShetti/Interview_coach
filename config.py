from pydantic_settings import BaseSettings
from typing import Literal

class Settings(BaseSettings):
    #API Key
    gemini_api_key:str = ""

    #Model Settings
    model_name: str = "gemini-2.5-flash-lite"
    temperature: float=0.7
    max_tokens: int=1000
    
    #Interview Settings
    max_questions:int = 5
    difficulty:Literal["easy", "medium", "hard"] = "medium"

    #RAG Settings
    chunk_size:int = 500
    chunk_overlap:int = 50
    retriever_k:int = 3

    class Config:
        env_file=".env"


settings = Settings()  