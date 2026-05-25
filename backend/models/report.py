from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
import uuid

from backend.database import Base


class Report(Base):
    __tablename__ = "reports"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id      = Column(UUID(as_uuid=True), ForeignKey("interview_sessions.id"), nullable=False, unique=True)
    overall_score   = Column(Integer, nullable=False)
    recommendation  = Column(String, nullable=False)         # hire / maybe / no_hire
    summary         = Column(String, nullable=False)
    technical_skills      = Column(Integer)
    communication_skills  = Column(Integer)
    problem_solving       = Column(Integer)
    strengths             = Column(JSON)                     # list of strings
    areas_to_improve      = Column(JSON)                     # list of strings
    suggested_topics      = Column(JSON)                     # list of strings
    raw_json              = Column(JSON)                     # full report object for future use
    created_at      = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    session = relationship("InterviewSession", back_populates="report")