from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from typing import List, Optional
import os

class AnswerFeedback(BaseModel):
    """Structured Feedback"""

    score: int = Field(
        description="Score from 1 tp 10",
        ge=1,
        le=10
    )
    understanding: str = Field(description="Assesment of Conceptual Understanding.")

    communication: str = Field(
        description="How well they explained their answer"
    )
    strengths: List[str] = Field(
        description="Specific things the candidate did well"
    )
    improvements: List[str] = Field(
        description="Specific areas to improve"
    )
    follow_up_question: Optional[str] = Field(
        description="A follow-up question to probe deeper",
        default=None
    )



class InterviewReport(BaseModel):
    """Final interview evaluation report."""

    overall_score: int = Field(ge=1, le=10)
    recommendation: str = Field(
        description="hire / maybe / no_hire"
    )
    summary: str = Field(
        description="2-3 sentence overall assessment"
    )
    technical_skills: int = Field(ge=1, le=10)
    communication_skills: int = Field(ge=1, le=10)
    problem_solving: int = Field(ge=1, le=10)
    strengths: List[str]
    areas_to_improve: List[str]
    suggested_topics_to_study: List[str]

def create_evaluator_simple():
    """Use with_structured_output for cleaner code."""

    llm = ChatOpenAI(
    model="gemini-2.5-flash",
    temperature=0.3,
    api_key=lambda: os.environ["GEMINI_API_KEY"],
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
    )

    structured_llm = llm.with_structured_output(AnswerFeedback)

    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an expert interview evaluator.
        Evaluate the candidate's answer to the given question.
        Be specific and constructive in your feedback.

        Question: {question}
        Position level: {level}"""),
        ("human", "{answer}")
    ])

    chain = prompt | structured_llm

    return chain

def create_report_generator():
    """Create final Interview Report"""

    llm = ChatOpenAI(
    model="gemini-2.5-flash",
    temperature=0.3,
    api_key=lambda: os.environ["GEMINI_API_KEY"],
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
    )

    structured_llm = llm.with_structured_output(InterviewReport)

    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are generating a final interview evaluation report.

    Based on the interview transcript below, provide a comprehensive assessment.
    Be fair, specific, and constructive.

    Position: {position}
    Level: {level}
    Interview type: {interview_type}
    """),
        ("human", """Interview transcript:
    {transcript}

    Individual question scores: {scores}

    Generate the final report.""")
    ])

    return prompt | structured_llm