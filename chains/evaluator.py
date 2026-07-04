from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field, SecretStr
from typing import List, Optional

from config import settings


class BaseAnswerFeedback(BaseModel):
    """Minimal base feedback to save tokens."""
    score: int = Field(description="Score from 1 to 10", ge=1, le=10)
    improvements: str = Field(description="Areas to improve in 1-2 sentences")


class DSAAnswerFeedback(BaseAnswerFeedback):
    code_feedback: Optional[str] = Field(
        description="Feedback on code correctness and edge cases, if code was submitted.",
        default=None,
    )


class BehaviouralAnswerFeedback(BaseAnswerFeedback):
    star_method_feedback: str = Field(
        description="Assessment of whether the candidate used the STAR method effectively."
    )


class SystemDesignAnswerFeedback(BaseAnswerFeedback):
    architecture_feedback: str = Field(
        description="Feedback on system components and scalability."
    )


class InterviewReport(BaseModel):
    """Final interview evaluation report."""
    overall_score: int = Field(ge=1, le=10)
    recommendation: str = Field(description="hire / maybe / no_hire")
    summary: str = Field(description="2-3 sentence overall assessment")
    technical_skills: int = Field(ge=1, le=10)
    communication_skills: int = Field(ge=1, le=10)
    problem_solving: int = Field(ge=1, le=10)
    strengths: List[str]
    areas_to_improve: List[str]
    suggested_topics_to_study: List[str]


def _make_llm(**kwargs) -> ChatOpenAI:
    """Create a ChatOpenAI instance pointed at the Gemini OpenAI-compatible endpoint."""
    return ChatOpenAI(
        model=settings.model_name,
        api_key=SecretStr(settings.gemini_api_key),
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        **kwargs,
    )


def create_evaluator_simple(interview_type: str = "technical"):
    """Create a minimal-token evaluator tailored to the interview type."""
    itype = interview_type.lower()
    if itype == "dsa":
        schema = DSAAnswerFeedback
        prompt_type = "Data Structures and Algorithms"
    elif itype in ("behavioural", "behavioral"):
        schema = BehaviouralAnswerFeedback
        prompt_type = "Behavioural (ensure STAR method evaluation)"
    elif itype == "system_design":
        schema = SystemDesignAnswerFeedback
        prompt_type = "System Design"
    else:
        schema = BaseAnswerFeedback
        prompt_type = "Technical"

    llm = _make_llm()
    structured_llm = llm.with_structured_output(schema)

    prompt = ChatPromptTemplate.from_messages([
        ("system", f"""You are an expert evaluator conducting a {prompt_type} interview.
Evaluate the candidate's answer constructively but concisely to save tokens.

CRITICAL: If the candidate's answer is nonsensical, extremely short, or completely \
off-topic (e.g., "bye", "test 123"), you MUST assign a score of 1 or 2.

Question: {{question}}
Position level: {{level}}"""),
        ("human", "{answer}"),
    ])

    return prompt | structured_llm


def create_report_generator():
    """Create a chain that generates a final InterviewReport."""
    llm = _make_llm(temperature=0.3)
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

Generate the final report."""),
    ])

    return prompt | structured_llm