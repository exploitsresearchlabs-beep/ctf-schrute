"""
Session management router.

Endpoints:
- POST /api/session - Create a new anonymous session
- GET /api/session/{id} - Get session info
"""
import uuid
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.database import get_session, GameplaySession


router = APIRouter(prefix="/api", tags=["session"])


class CreateSessionRequest(BaseModel):
    """Request body for session creation."""
    posthog_distinct_id: Optional[str] = Field(None, description="PostHog anonymous ID")


class SessionResponse(BaseModel):
    """Response with session info."""
    session_id: str
    current_level: int
    completed_levels: List[int]
    created_at: str


@router.post("/session", response_model=SessionResponse)
async def create_session(
    body: Optional[CreateSessionRequest] = None,
    db: AsyncSession = Depends(get_session)
):
    """
    Create a new anonymous gameplay session.
    
    Privacy Notes:
    - No PII collected
    - Session ID is a random UUID
    - Only PostHog anonymous ID linked (if provided)
    """
    session = GameplaySession(
        id=str(uuid.uuid4()),
        posthog_distinct_id=body.posthog_distinct_id if body else None
    )
    
    db.add(session)
    await db.commit()
    await db.refresh(session)
    
    return SessionResponse(
        session_id=session.id,
        current_level=session.current_level,
        completed_levels=[],
        created_at=session.created_at.isoformat()
    )


@router.get("/session/{session_id}", response_model=SessionResponse)
async def get_session_info(
    session_id: str,
    db: AsyncSession = Depends(get_session)
):
    """Get session information."""
    stmt = select(GameplaySession).where(GameplaySession.id == session_id)
    result = await db.execute(stmt)
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    completed = session.completed_levels.split(',') if session.completed_levels else []
    completed = [int(x) for x in completed if x.isdigit()]
    
    return SessionResponse(
        session_id=session.id,
        current_level=session.current_level,
        completed_levels=completed,
        created_at=session.created_at.isoformat()
    )


@router.put("/session/{session_id}/posthog")
async def link_posthog(
    session_id: str,
    posthog_id: str,
    db: AsyncSession = Depends(get_session)
):
    """Link a PostHog distinct ID to a session."""
    stmt = select(GameplaySession).where(GameplaySession.id == session_id)
    result = await db.execute(stmt)
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session.posthog_distinct_id = posthog_id
    await db.commit()
    
    return {"status": "linked"}
