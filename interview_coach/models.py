from enum import Enum
from dataclasses import dataclass, field
from typing import List, Any


class InterviewPhase(Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


@dataclass
class InterviewSession:
    """Holds all state for a single interview session."""
    session_id: str
    position: str
    level: str
    topics: List[str]
    phase: InterviewPhase = InterviewPhase.NOT_STARTED
    current_question: str = ""
    current_topic_index: int = 0
    questions_asked: List[str] = field(default_factory=list)
    answers: List[str] = field(default_factory=list)
    feedback: List[Any] = field(default_factory=list)
    transcript: List[dict] = field(default_factory=list)
