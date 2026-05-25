from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, JSON, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
from enum import Enum
import uuid

from backend.database import Base


class SessionStatus(str, Enum):
    in_progress = "in_progress"
    completed   = "completed"
    abandoned   = "abandoned"


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id        = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    position       = Column(String, nullable=False)
    level          = Column(String, nullable=False)          # junior / mid / senior / staff
    interview_type = Column(String, nullable=False)          # technical / behavioral / system_design
    status         = Column(SAEnum(SessionStatus), default=SessionStatus.in_progress)
    topics         = Column(JSON, nullable=False)            # list of topic strings
    transcript     = Column(JSON, default=list)              # list of {role, content} dicts
    questions_asked = Column(Integer, default=0)
    started_at     = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    ended_at       = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user   = relationship("User", back_populates="sessions")
    report = relationship("Report", back_populates="session", uselist=False, cascade="all, delete")