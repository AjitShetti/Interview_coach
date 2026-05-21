from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field, SecretStr
from typing import List
import os

class InterviewTopics(BaseModel):
    """Topics to cover in the interview."""
    must_have: List[str] = Field(description="Required skills to assess")
    nice_to_have: List[str] = Field(description="Optional skills to assess")
    soft_skills: List[str] = Field(description="Soft skills to evaluate")

def create_topic_extractor():
    """Extract interview topics from a job description."""
    llm = ChatOpenAI(
        model="gemini-2.5-flash",
        temperature=0,
        api_key=SecretStr(os.environ.get("GEMINI_API_KEY", "")),
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
    )
    return llm.with_structured_output(InterviewTopics)