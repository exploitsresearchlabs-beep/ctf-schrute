"""
Flags API router - handles flag validation.

Endpoints:
- POST /api/validate-flag - Validate a flag submission
"""
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.database import get_session, FlagSubmission, GameplaySession
from ..services.levels import level_handler


router = APIRouter(prefix="/api", tags=["flags"])


class FlagSubmissionRequest(BaseModel):
    """Request body for flag validation."""
    session_id: str = Field(..., description="Anonymous session UUID")
    level_id: int = Field(..., ge=0, le=6, description="Level the flag is for")
    flag: str = Field(..., min_length=1, max_length=100, description="Submitted flag")


class FlagSubmissionResponse(BaseModel):
    """Response from flag validation."""
    is_correct: bool = Field(..., description="Whether the flag is correct")
    message: str = Field(..., description="Response message in Dwight's voice")
    next_level: Optional[int] = Field(None, description="Next level ID if correct")


async def check_flag_rate_limit(
    session_id: str,
    level_id: int,
    db: AsyncSession
) -> bool:
    """
    Check if user has submitted too many flags recently.
    
    Limit: 5 submissions per minute per level.
    Returns True if rate limited.
    """
    window_start = datetime.utcnow() - timedelta(seconds=60)
    
    stmt = select(func.count()).where(
        FlagSubmission.session_id == session_id,
        FlagSubmission.level_id == level_id,
        FlagSubmission.timestamp > window_start
    )
    
    result = await db.execute(stmt)
    count = result.scalar()
    
    return count >= 5


@router.post("/validate-flag", response_model=FlagSubmissionResponse)
async def validate_flag(
    request: Request,
    body: FlagSubmissionRequest,
    db: AsyncSession = Depends(get_session)
):
    """
    Validate a flag submission.
    
    Security Notes:
    - Flags are validated server-side only
    - Rate limiting prevents bruteforce
    - All attempts are logged
    """
    session_id = body.session_id
    level_id = body.level_id
    submitted_flag = body.flag.strip()
    
    # Check rate limit
    if await check_flag_rate_limit(session_id, level_id, db):
        return FlagSubmissionResponse(
            is_correct=False,
            message="Slow down! You're submitting flags faster than Michael talks. Wait a minute.",
            next_level=None
        )
    
    # Validate the flag
    is_correct = level_handler.validate_flag(level_id, submitted_flag)
    
    # Log the submission
    submission = FlagSubmission(
        session_id=session_id,
        level_id=level_id,
        submitted_flag=submitted_flag[:100],
        is_correct=is_correct
    )
    db.add(submission)
    
    # Update session if correct
    if is_correct:
        # Get or create session
        stmt = select(GameplaySession).where(GameplaySession.id == session_id)
        result = await db.execute(stmt)
        session = result.scalar_one_or_none()
        
        if session:
            # Update completed levels
            completed = session.completed_levels.split(',') if session.completed_levels else []
            if str(level_id) not in completed:
                completed.append(str(level_id))
                session.completed_levels = ','.join(completed)
            
            # Update current level
            next_level = level_id + 1
            if next_level <= 6:
                session.current_level = next_level
        
        await db.commit()
        
        # Success messages
        success_messages = [
            f"CORRECT! Level {level_id} complete. You've proven yourself... barely competent.",
            f"The flag is correct. I'm impressed. Don't get used to that feeling.",
            f"You did it. Level {level_id} conquered. Bears would be proud. Maybe.",
            f"FLAG ACCEPTED. Moving to level {level_id + 1}. Don't celebrate yet.",
        ]
        import random
        message = random.choice(success_messages)
        
        return FlagSubmissionResponse(
            is_correct=True,
            message=message,
            next_level=level_id + 1 if level_id < 6 else None
        )
    else:
        await db.commit()
        
        # Failure messages
        failure_messages = [
            "WRONG. That flag is as incorrect as Jim's life choices.",
            "FALSE. That's not even close to the flag.",
            "Incorrect. Were you even paying attention? Try again.",
            "Nice try, but no. The flag eludes you.",
        ]
        import random
        message = random.choice(failure_messages)
        
        return FlagSubmissionResponse(
            is_correct=False,
            message=message,
            next_level=None
        )


@router.get("/session/{session_id}/progress")
async def get_progress(
    session_id: str,
    db: AsyncSession = Depends(get_session)
):
    """Get user's current progress."""
    stmt = select(GameplaySession).where(GameplaySession.id == session_id)
    result = await db.execute(stmt)
    session = result.scalar_one_or_none()
    
    if not session:
        return {
            "current_level": 0,
            "completed_levels": [],
            "exists": False
        }
    
    completed = session.completed_levels.split(',') if session.completed_levels else []
    completed = [int(x) for x in completed if x.isdigit()]
    
    return {
        "current_level": session.current_level,
        "completed_levels": completed,
        "exists": True
    }
