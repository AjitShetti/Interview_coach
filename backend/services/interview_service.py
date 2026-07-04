from uuid import UUID
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.models.session import InterviewSession, SessionStatus
from backend.models.report import Report
from interview_coach import InterviewCoach
from interview_coach.models import InterviewSession as CoachSession, InterviewPhase
from config import settings


# In-memory store of active InterviewCoach instances
# Key: session_id (str), Value: InterviewCoach instance
_active_coaches: dict[str, InterviewCoach] = {}


def _get_or_create_coach(
    session_id: str,
    position: str,
    level: str,
    interview_type: str,
    job_description: Optional[str] = None,
) -> InterviewCoach:
    """Get an existing coach from memory or create a new one."""
    if session_id not in _active_coaches:
        _active_coaches[session_id] = InterviewCoach(
            job_description=job_description,
            interview_type=interview_type,
            level=level,
            position=position,
        )
    return _active_coaches[session_id]


def _remove_coach(session_id: str) -> None:
    """Remove a coach from memory when the session ends."""
    _active_coaches.pop(session_id, None)


async def start_interview(
    db: AsyncSession,
    user_id: UUID,
    position: str,
    level: str,
    interview_type: str,
    topics: Optional[list] = None,
    job_description: Optional[str] = None,
    num_questions: int = 5,
) -> dict:
    """Create a DB record, initialise a coach, and return the first question."""
    settings.max_questions = num_questions

    if not topics:
        from interview_coach import TOPIC_DEFAULTS
        topics = TOPIC_DEFAULTS.get(interview_type, TOPIC_DEFAULTS["technical"])

    # Create DB record
    session = InterviewSession(
        user_id=user_id,
        position=position,
        level=level,
        interview_type=interview_type,
        topics=topics,
        transcript=[],
        status=SessionStatus.in_progress,
    )
    db.add(session)
    await db.flush()  # populate UUID before commit

    session_id_str = str(session.id)

    # Initialise coach and start the interview
    coach = _get_or_create_coach(session_id_str, position, level, interview_type, job_description)
    welcome = coach.start_interview(session_id_str, topics[:num_questions])

    # Split welcome message from first question
    lines = welcome.strip().split("\n\n", 1)
    first_question = lines[1] if len(lines) > 1 else welcome

    # Persist first question to DB transcript
    session.transcript = coach.sessions[session_id_str].transcript
    session.questions_asked = 1

    return {
        "session_id": session.id,
        "welcome_message": lines[0] if len(lines) > 1 else "Welcome to your interview!",
        "first_question": first_question,
    }


async def submit_answer(
    db: AsyncSession,
    session_id: UUID,
    user_id: UUID,
    answer: str,
) -> dict:
    """Process an answer, persist to DB, and return feedback + next question."""
    session_id_str = str(session_id)

    result = await db.execute(
        select(InterviewSession).where(
            InterviewSession.id == session_id,
            InterviewSession.user_id == user_id,
        )
    )
    session = result.scalar_one_or_none()

    if not session:
        return {"error": "Session not found"}
    if session.status != SessionStatus.in_progress:
        return {"error": "Interview is not in progress"}
    if session_id_str not in _active_coaches:
        return {"error": "Session expired. Please start a new interview."}

    coach = _active_coaches[session_id_str]
    result_data = coach.submit_answer(session_id_str, answer)

    if "error" in result_data:
        return result_data

    # Sync DB with latest transcript and question count
    coach_session = coach.sessions[session_id_str]
    session.transcript = coach_session.transcript
    session.questions_asked = len(coach_session.questions_asked)

    if result_data.get("is_complete"):
        session.status = SessionStatus.completed
        session.ended_at = datetime.now(timezone.utc)
        _remove_coach(session_id_str)

    feedback = result_data["feedback"]
    return {
        "feedback": {
            "score": feedback.score,
            "improvements": feedback.improvements,
            "code_feedback": getattr(feedback, "code_feedback", None),
            "star_method_feedback": getattr(feedback, "star_method_feedback", None),
            "architecture_feedback": getattr(feedback, "architecture_feedback", None),
            "follow_up_question": getattr(feedback, "follow_up_question", None),
        },
        "is_complete": result_data.get("is_complete", False),
        "next_question": result_data.get("next_question"),
        "questions_remaining": result_data.get("questions_remaining", 0),
    }


async def get_session(
    db: AsyncSession,
    session_id: UUID,
    user_id: UUID,
) -> Optional[InterviewSession]:
    """Fetch a single session belonging to the user."""
    result = await db.execute(
        select(InterviewSession).where(
            InterviewSession.id == session_id,
            InterviewSession.user_id == user_id,
        )
    )
    return result.scalar_one_or_none()


async def list_sessions(
    db: AsyncSession,
    user_id: UUID,
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
    user_id: UUID,
) -> bool:
    """Delete a session. Returns True if deleted, False if not found."""
    result = await db.execute(
        select(InterviewSession).where(
            InterviewSession.id == session_id,
            InterviewSession.user_id == user_id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        return False

    await db.delete(session)
    _remove_coach(str(session_id))
    return True