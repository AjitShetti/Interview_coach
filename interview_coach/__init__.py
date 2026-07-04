"""
interview_coach — Core package for the AI Interview Coach.

Public API:
    InterviewCoach   — Orchestrates an interview session end-to-end.
    InterviewSession — Dataclass holding all state for a single session.
    InterviewPhase   — Enum representing session lifecycle (NOT_STARTED → IN_PROGRESS → COMPLETED).
    TOPIC_DEFAULTS   — Default topic lists keyed by interview_type.
"""

from interview_coach.coach import InterviewCoach, TOPIC_DEFAULTS
from interview_coach.models import InterviewSession, InterviewPhase

__all__ = [
    "InterviewCoach",
    "InterviewSession",
    "InterviewPhase",
    "TOPIC_DEFAULTS",
]
