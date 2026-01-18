"""
Feedback API router - handles user feedback collection post-gameplay.

OAuth authentication required for submission.
"""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.database import get_session, Feedback


router = APIRouter(prefix="/api", tags=["feedback"])


class FeedbackRequest(BaseModel):
    """Request body for feedback submission."""
    session_id: Optional[str] = Field(None, description="Optional link to gameplay session")
    comment_text: str = Field(..., min_length=10, max_length=2000, description="Feedback text")
    oauth_provider: str = Field(..., description="OAuth provider: google, linkedin, twitter")
    oauth_user_id: str = Field(..., description="Unique user ID from OAuth")
    email: Optional[EmailStr] = Field(None, description="Optional email for follow-up")


class FeedbackResponse(BaseModel):
    """Response from feedback submission."""
    success: bool
    message: str
    feedback_id: Optional[str] = None


@router.post("/feedback", response_model=FeedbackResponse)
async def submit_feedback(
    body: FeedbackRequest,
    db: AsyncSession = Depends(get_session)
):
    """
    Submit feedback after gameplay.
    
    Privacy Notes:
    - OAuth required to prevent spam
    - Email is optional
    - OAuth tokens are NOT stored, only provider and user ID
    """
    # Validate OAuth provider
    valid_providers = ['google', 'linkedin', 'twitter']
    if body.oauth_provider.lower() not in valid_providers:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid OAuth provider. Must be one of: {valid_providers}"
        )
    
    # Create feedback entry
    feedback = Feedback(
        session_id=body.session_id,
        comment_text=body.comment_text,
        oauth_provider=body.oauth_provider.lower(),
        oauth_user_id=body.oauth_user_id,
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
