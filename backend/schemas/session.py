from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, List
from backend.models.session import SessionStatus


# --- Request Schemas ---

class StartInterviewRequest(BaseModel):
    position: str = "Senior Python Developer"
    level: str = "senior"                          # junior / mid / senior / staff
    interview_type: str = "technical"              # technical / behavioral / system_design
    topics: Optional[List[str]] = None             # auto-generated if not provided
    job_description: Optional[str] = None          # paste JD for RAG-powered questions
    num_questions: int = 5


class SubmitAnswerRequest(BaseModel):
    answer: str


# --- Response Schemas ---

class FeedbackResponse(BaseModel):
    score: int
    improvements: str
    code_feedback: Optional[str] = None
    star_method_feedback: Optional[str] = None
    architecture_feedback: Optional[str] = None
    follow_up_question: Optional[str] = None


class AnswerResponse(BaseModel):
    feedback: FeedbackResponse
    next_question: Optional[str] = None
    is_complete: bool
    questions_remaining: int


class SessionSummary(BaseModel):
    id: UUID
    position: str
    level: str
    interview_type: str
    status: SessionStatus
    questions_asked: int
    started_at: datetime
    ended_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SessionDetail(SessionSummary):
    topics: List[str]
    transcript: List[dict]

    class Config:
        from_attributes = True


class StartInterviewResponse(BaseModel):
    session_id: UUID
    welcome_message: str
    first_question: str