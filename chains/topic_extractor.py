from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field, SecretStr
from typing import List

from config import settings


class InterviewTopics(BaseModel):
    """Topics to cover in the interview, extracted from a job description."""
    must_have: List[str] = Field(description="Required skills to assess")
    nice_to_have: List[str] = Field(description="Optional skills to assess")
    soft_skills: List[str] = Field(description="Soft skills to evaluate")


def create_topic_extractor():
    """Return a structured LLM chain that extracts interview topics from a job description."""
    llm = ChatOpenAI(
        model=settings.model_name,
        temperature=0,
        api_key=SecretStr(settings.gemini_api_key),
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
    )
    return llm.with_structured_output(InterviewTopics)