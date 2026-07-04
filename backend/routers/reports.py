from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.models.user import User
from backend.services.auth_service import get_current_user
from backend.schemas.report import ReportResponse, ReportSummary
from backend.services import report_service

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.post("/{session_id}/generate", response_model=ReportResponse, status_code=201)
async def generate_report(
    session_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate and save a report for a completed interview session."""
    try:
        report = await report_service.generate_report(db, session_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if report is None:
        raise HTTPException(status_code=404, detail="Session not found")

    return report


@router.get("/", response_model=list[ReportSummary])
async def list_reports(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all reports for the current user."""
    return await report_service.list_reports(db, current_user.id)


@router.get("/{session_id}", response_model=ReportResponse)
async def get_report(
    session_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve a saved report by session ID."""
    report = await report_service.get_report(db, session_id, current_user.id)

    if report is None:
        raise HTTPException(
            status_code=404,
            detail="Report not found. Generate it first via POST /reports/{session_id}/generate"
        )

    return report
