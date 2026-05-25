from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.models.user import User
from backend.services.auth_service import get_current_user
from backend.schemas.session import (
    StartInterviewRequest,
    StartInterviewResponse,
    SubmitAnswerRequest,
    AnswerResponse,
    FeedbackResponse,
    SessionSummary,
    SessionDetail
)
from backend.services import interview_service

router = APIRouter(prefix="/interviews", tags=["Interviews"])


@router.post("/start", response_model=StartInterviewResponse, status_code=201)
async def start_interview(
    payload: StartInterviewRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await interview_service.start_interview(
        db=db,
        user_id=current_user.id,
        position=payload.position,
        level=payload.level,
        interview_type=payload.interview_type,
        topics=payload.topics,
        job_description=payload.job_description,
        num_questions=payload.num_questions
    )

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return result


@router.post("/{session_id}/answer", response_model=AnswerResponse)
async def submit_answer(
    session_id: UUID,
    payload: SubmitAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await interview_service.submit_answer(
        db=db,
        session_id=session_id,
        user_id=current_user.id,
        answer=payload.answer
    )

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return result


@router.get("/", response_model=list[SessionSummary])
async def list_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await interview_service.list_sessions(db, current_user.id)


@router.get("/{session_id}", response_model=SessionDetail)
async def get_session(
    session_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    session = await interview_service.get_session(db, session_id, current_user.id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.delete("/{session_id}", status_code=204)
async def delete_session(
    session_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    deleted = await interview_service.delete_session(db, session_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Session not found")