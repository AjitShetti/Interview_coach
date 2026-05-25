from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import List, Optional


class ReportResponse(BaseModel):
    id: UUID
    session_id: UUID
    overall_score: int
    recommendation: str
    summary: str
    technical_skills: Optional[int] = None
    communication_skills: Optional[int] = None
    problem_solving: Optional[int] = None
    strengths: List[str]
    areas_to_improve: List[str]
    suggested_topics: List[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ReportSummary(BaseModel):
    id: UUID
    session_id: UUID
    overall_score: int
    recommendation: str
    created_at: datetime

    class Config:
        from_attributes = True
