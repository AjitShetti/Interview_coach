from uuid import UUID
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.models.session import InterviewSession, SessionStatus
from backend.models.report import Report
from interview_coach import InterviewCoach
from interview_coach.models import InterviewSession as CoachSession, InterviewPhase
from backend.services.interview_service import _active_coaches, _get_or_create_coach


async def generate_report(
    db: AsyncSession,
    session_id: UUID,
    user_id: UUID,
) -> Optional[Report]:
    """Generate a report for a completed session and persist it to DB."""

    # Load session
    result = await db.execute(
        select(InterviewSession).where(
            InterviewSession.id == session_id,
            InterviewSession.user_id == user_id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        return None

    # Return existing report if already generated
    existing = await db.execute(
        select(Report).where(Report.session_id == session_id)
    )
    existing_report = existing.scalar_one_or_none()
    if existing_report:
        return existing_report

    # Rebuild coach from DB transcript if it's no longer in memory
    session_id_str = str(session_id)
    if session_id_str not in _active_coaches:
        coach = _get_or_create_coach(
            session_id_str,
            session.position,
            session.level,
            session.interview_type,
        )
        coach_session = CoachSession(
            session_id=session_id_str,
            position=session.position,
            level=session.level,
            topics=session.topics,
            phase=InterviewPhase.COMPLETED,
            transcript=session.transcript,
        )
        coach.sessions[session_id_str] = coach_session
    else:
        coach = _active_coaches[session_id_str]

    report_obj = coach.generate_report(session_id_str)

    # Persist report to DB
    report = Report(
        session_id=session_id,
        overall_score=report_obj.overall_score,
        recommendation=report_obj.recommendation,
        summary=report_obj.summary,
        technical_skills=report_obj.technical_skills,
        communication_skills=report_obj.communication_skills,
        problem_solving=report_obj.problem_solving,
        strengths=report_obj.strengths,
        areas_to_improve=report_obj.areas_to_improve,
        suggested_topics=report_obj.suggested_topics_to_study,
        raw_json={
            "overall_score": report_obj.overall_score,
            "recommendation": report_obj.recommendation,
            "summary": report_obj.summary,
            "technical_skills": report_obj.technical_skills,
            "communication_skills": report_obj.communication_skills,
            "problem_solving": report_obj.problem_solving,
            "strengths": report_obj.strengths,
            "areas_to_improve": report_obj.areas_to_improve,
            "suggested_topics_to_study": report_obj.suggested_topics_to_study,
        },
    )
    db.add(report)
    await db.flush()

    return report


async def get_report(
    db: AsyncSession,
    session_id: UUID,
    user_id: UUID,
) -> Optional[Report]:
    """Fetch a saved report, verifying the session belongs to the user."""
    session_result = await db.execute(
        select(InterviewSession).where(
            InterviewSession.id == session_id,
            InterviewSession.user_id == user_id,
        )
    )
    if not session_result.scalar_one_or_none():
        return None

    result = await db.execute(
        select(Report).where(Report.session_id == session_id)
    )
    return result.scalar_one_or_none()


async def list_reports(
    db: AsyncSession,
    user_id: UUID,
) -> list[Report]:
    """List all reports for sessions belonging to the user, newest first."""
    result = await db.execute(
        select(Report)
        .join(InterviewSession, Report.session_id == InterviewSession.id)
        .where(InterviewSession.user_id == user_id)
        .order_by(Report.created_at.desc())
    )
    return list(result.scalars().all())
