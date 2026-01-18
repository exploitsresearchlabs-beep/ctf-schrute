"""
Chat API router - handles chatbot interactions.

Endpoints:
- POST /api/chat - Process user prompt and return chatbot response
"""
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from slowapi import Limiter
from slowapi.util import get_remote_address

from ..models.database import get_session, PromptLog, GameplaySession
from ..services.levels import level_handler
from ..services.intent import check_similarity


router = APIRouter(prefix="/api", tags=["chat"])

# Rate limiter
limiter = Limiter(key_func=get_remote_address)


class ChatRequest(BaseModel):
    """Request body for chat endpoint."""
    session_id: str = Field(..., description="Anonymous session UUID")
    level_id: int = Field(..., ge=0, le=6, description="Current level (0-6)")
    prompt: str = Field(..., min_length=1, max_length=500, description="User's message")


class ChatResponse(BaseModel):
    """Response from chat endpoint."""
    response: str = Field(..., description="Dwight's response")
    intent_bucket: str = Field(..., description="Detected intent: CORRECT, CLOSE, WRONG")
    is_rate_limited: bool = Field(default=False, description="Whether response was rate limited")


async def check_bruteforce(
    session_id: str,
    level_id: int,
    new_prompt: str,
    db: AsyncSession
) -> bool:
    """
    Check if user is attempting bruteforce.
    
    Detection methods:
    1. Too many prompts in short window
    2. High similarity between recent prompts
    
    Returns True if bruteforce detected.
    """
    # Get recent prompts from this session for this level
    window_start = datetime.utcnow() - timedelta(seconds=60)
    
    stmt = select(PromptLog).where(
        PromptLog.session_id == session_id,
        PromptLog.level_id == level_id,
        PromptLog.timestamp > window_start
    ).order_by(PromptLog.timestamp.desc()).limit(10)
    
    result = await db.execute(stmt)
    recent_prompts = result.scalars().all()
    
    # Check rate: more than 10 prompts per minute
    if len(recent_prompts) >= 10:
        return True
    
    # Check similarity: more than 3 very similar prompts
    similar_count = 0
    for log in recent_prompts:
        similarity = check_similarity(new_prompt, log.prompt_text)
        if similarity > 0.85:
            similar_count += 1
        if similar_count >= 3:
            return True
    
    return False


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: Request,
    body: ChatRequest,
    db: AsyncSession = Depends(get_session)
):
    """
    Process a user chat message and return Dwight's response.
    
    Security Notes:
    - Prompts are logged for analytics (no PII)
    - Rate limiting prevents abuse
    - Bruteforce returns fake responses instead of blocking
    """
    session_id = body.session_id
    level_id = body.level_id
    prompt = body.prompt.strip()
    
    # Validate prompt length
    if len(prompt) < 2:
        return ChatResponse(
            response="Speak up! I can't hear mumbling.",
            intent_bucket="WRONG",
            is_rate_limited=False
        )
    
    # Check for bruteforce attempts
    is_bruteforce = await check_bruteforce(session_id, level_id, prompt, db)
    
    if is_bruteforce:
        # Return fake response instead of blocking
        from ..services.dwight import DwightPersona
        dwight = DwightPersona()
        fake_response = dwight.bruteforce_response()
        
        # Log the bruteforce attempt
        log = PromptLog(
            session_id=session_id,
            level_id=level_id,
            prompt_text=prompt[:500],
            intent_bucket="WRONG",
            response_text=fake_response,
            is_bruteforce=True
        )
        db.add(log)
        await db.commit()
        
        return ChatResponse(
            response=fake_response,
            intent_bucket="WRONG",
            is_rate_limited=True
        )
    
    # Process the prompt through level handler
    response, intent_bucket, metadata = level_handler.process_prompt(level_id, prompt)
    
    # Log the interaction
    log = PromptLog(
        session_id=session_id,
        level_id=level_id,
        prompt_text=prompt[:500],
        intent_bucket=intent_bucket,
        response_text=response[:1000] if response else None,
        is_bruteforce=False
    )
    db.add(log)
    await db.commit()
    
    return ChatResponse(
        response=response,
        intent_bucket=intent_bucket,
        is_rate_limited=False
    )


@router.get("/levels")
async def get_levels():
    """Get all level information (without flags/passwords)."""
    return level_handler.get_all_levels()


@router.get("/levels/{level_id}")
async def get_level(level_id: int):
    """Get a specific level's public information."""
    level = level_handler.get_level(level_id)
    if not level:
        raise HTTPException(status_code=404, detail="Level not found")
    
    # Return only public info
    return {
        'id': level['id'],
        'name': level['name'],
        'description': level['description'],
        'security_lesson': level['security_lesson']
    }
