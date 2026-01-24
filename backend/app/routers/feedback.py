"""
Feedback API router - handles user feedback collection post-gameplay.

OAuth authentication required for submission.
"""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from jose import jwt
from ..models.database import get_session, Feedback, User, settings


router = APIRouter(prefix="/api", tags=["feedback"])


class FeedbackRequest(BaseModel):
    """Request body for feedback submission."""
    session_id: Optional[str] = Field(None, description="Optional link to gameplay session")
    comment_text: str = Field(..., min_length=10, max_length=2000, description="Feedback text")
    email: Optional[EmailStr] = Field(None, description="Optional email for follow-up")


class FeedbackResponse(BaseModel):
    """Response from feedback submission."""
    success: bool
    message: str
    feedback_id: Optional[str] = None


@router.post("/feedback", response_model=FeedbackResponse)
async def submit_feedback(
    request: Request,
    body: FeedbackRequest,
    db: AsyncSession = Depends(get_session)
):
    """
    Submit feedback after gameplay.
    Requires JWT authentication.
    """
    # 1. Authenticate via JWT
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Authentication required to submit feedback.")
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        user_id = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired authentication token.")

    # 2. Get user info for legacy feedback record compatibility if needed
    # (The Feedback model still has oauth_provider and oauth_user_id as non-nullable)
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User record not found.")

    # Create feedback entry
    feedback = Feedback(
        session_id=body.session_id,
        user_id=user.id,
        comment_text=body.comment_text,
        oauth_provider=user.provider,
        oauth_user_id=user.provider_user_id,
        email=body.email
    )
    
    db.add(feedback)
    await db.commit()
    await db.refresh(feedback)
    
    return FeedbackResponse(
        success=True,
        message="Feedback received. Dwight thanks you for your contribution to office security.",
        feedback_id=feedback.id
    )


@router.get("/feedback/stats")
async def get_feedback_stats(db: AsyncSession = Depends(get_session)):
    """Get anonymous feedback statistics."""
    from sqlalchemy import select, func
    
    stmt = select(func.count()).select_from(Feedback)
    result = await db.execute(stmt)
    total_count = result.scalar()
    
    return {
        "total_feedback": total_count,
        "message": f"Dwight has reviewed {total_count} feedback submissions."
    }
