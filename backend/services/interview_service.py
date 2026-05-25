import sys
import os
from uuid import UUID
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.models.session import InterviewSession, SessionStatus
from backend.models.report import Report

# Add project root to path so InterviewCoach can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from interview_coach import InterviewCoach
from config import settings

# In-memory store of active InterviewCoach instances
# Key: session_id (str), Value: InterviewCoach instance
_active_coaches: dict[str, InterviewCoach] = {}


def _get_or_create_coach(
    session_id: str,
    position: str,
    level: str,
    interview_type: str,
    job_description: Optional[str] = None
) -> InterviewCoach:
    """Get existing coach from memory or create a new one."""
    if session_id not in _active_coaches:
        _active_coaches[session_id] = InterviewCoach(
            job_description=job_description,
            interview_type=interview_type,
            level=level,
            position=position
        )
    return _active_coaches[session_id]


def _remove_coach(session_id: str):
    """Remove coach from memory when session ends."""
    _active_coaches.pop(session_id, None)


async def start_interview(
    db: AsyncSession,
    user_id: UUID,
    position: str,
    level: str,
    interview_type: str,
    topics: Optional[list] = None,
    job_description: Optional[str] = None,
    num_questions: int = 5
) -> dict:
    """Create DB record, initialize coach, return first question."""

    # Override max_questions from settings temporarily
    settings.max_questions = num_questions

    # Default topics if not provided
    if not topics:
        topic_map = {
            "technical":     ["Python", "system design", "databases", "APIs", "best practices"],
            "behavioral":    ["teamwork", "leadership", "conflict resolution", "growth", "motivation"],
            "system_design": ["scalability", "architecture", "trade-offs", "databases", "caching"]
        }
        topics = topic_map.get(interview_type, topic_map["technical"])

    # Create DB record
    session = InterviewSession(
        user_id=user_id,
        position=position,
        level=level,
        interview_type=interview_type,
        topics=topics,
        transcript=[],
        status=SessionStatus.in_progress
    )
    db.add(session)
    await db.flush()  # get UUID before commit

    session_id_str = str(session.id)

    # Initialize coach and start interview
    coach = _get_or_create_coach(session_id_str, position, level, interview_type, job_description)
    welcome = coach.start_interview(session_id_str, topics[:num_questions])

    # Parse out first question (welcome message contains it)
    lines = welcome.strip().split("\n\n", 1)
    first_question = lines[1] if len(lines) > 1 else welcome

    # Save first question to transcript in DB
    session.transcript = coach.sessions[session_id_str].transcript
    session.questions_asked = 1

    return {
        "session_id": session.id,
        "welcome_message": lines[0] if len(lines) > 1 else "Welcome to your interview!",
        "first_question": first_question
    }


async def submit_answer(
    db: AsyncSession,
    session_id: UUID,
    user_id: UUID,
    answer: str
) -> dict:
    """Process answer, persist to DB, return feedback + next question."""

    session_id_str = str(session_id)

    # Load session from DB
    result = await db.execute(
        select(InterviewSession).where(
            InterviewSession.id == session_id,
            InterviewSession.user_id == user_id
        )
    )
    session = result.scalar_one_or_none()

    if not session:
        return {"error": "Session not found"}

    if session.status != SessionStatus.in_progress:
        return {"error": "Interview is not in progress"}

    # Get coach from memory (must exist from start_interview)
    if session_id_str not in _active_coaches:
        return {"error": "Session expired. Please start a new interview."}

    coach = _active_coaches[session_id_str]
    result_data = coach.submit_answer(session_id_str, answer)

    if "error" in result_data:
        return result_data

    # Update DB with latest transcript and question count
    coach_session = coach.sessions[session_id_str]
    session.transcript = coach_session.transcript
    session.questions_asked = len(coach_session.questions_asked)

    # If complete, mark session as done
    if result_data.get("is_complete"):
        session.status = SessionStatus.completed
        session.ended_at = datetime.now(timezone.utc)
        _remove_coach(session_id_str)

    # Build feedback response dict
    feedback = result_data["feedback"]
    response = {
        "feedback": {
            "score": feedback.score,
            "understanding": feedback.understanding,
            "communication": feedback.communication,
            "strengths": feedback.strengths,
            "improvements": feedback.improvements,
            "follow_up_question": feedback.follow_up_question
        },
        "is_complete": result_data.get("is_complete", False),
        "next_question": result_data.get("next_question"),
        "questions_remaining": result_data.get("questions_remaining", 0)
    }

    return response


async def get_session(
    db: AsyncSession,
    session_id: UUID,
    user_id: UUID
) -> Optional[InterviewSession]:
    """Fetch a single session belonging to the user."""
    result = await db.execute(
        select(InterviewSession).where(
            InterviewSession.id == session_id,
            InterviewSession.user_id == user_id
        )
    )
    return result.scalar_one_or_none()


async def list_sessions(
    db: AsyncSession,
    user_id: UUID
) -> list[InterviewSession]:
    """List all sessions for a user, newest first."""
    result = await db.execute(
        select(InterviewSession)
        .where(InterviewSession.user_id == user_id)
        .order_by(InterviewSession.started_at.desc())
    )
    return list(result.scalars().all())


async def delete_session(
    db: AsyncSession,
    session_id: UUID,
    user_id: UUID
) -> bool:
    """Delete a session. Returns True if deleted, False if not found."""
    result = await db.execute(
        select(InterviewSession).where(
            InterviewSession.id == session_id,
            InterviewSession.user_id == user_id
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        return False

    await db.delete(session)
    _remove_coach(str(session_id))
    return True