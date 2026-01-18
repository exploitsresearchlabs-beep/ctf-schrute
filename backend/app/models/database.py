"""
Database models for the CTF application.
Uses SQLAlchemy async for PostgreSQL/SQLite compatibility.
"""
from datetime import datetime
from typing import Optional
import uuid

from sqlalchemy import Column, String, Text, DateTime, Integer, ForeignKey, Boolean, Index
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, relationship
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings from environment variables."""
    database_url: str = "sqlite+aiosqlite:///./ctf_game.db"
    secret_key: str = "dwight-schrute-assistant-to-the-regional-manager-secret-key"
    posthog_api_key: Optional[str] = None
    posthog_host: str = "https://app.posthog.com"
    
    class Config:
        env_file = ".env"


settings = Settings()


class Base(DeclarativeBase):
    """SQLAlchemy declarative base."""
    pass


class GameplaySession(Base):
    """
    Tracks anonymous user sessions.
    Security Note: No PII stored - only pseudonymous session IDs.
    """
    __tablename__ = "gameplay_sessions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=datetime.utcnow)
    last_active = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    current_level = Column(Integer, default=0)
    completed_levels = Column(String(50), default="")  # Comma-separated level IDs
    posthog_distinct_id = Column(String(100), nullable=True)
    
    # Relationships
    prompt_logs = relationship("PromptLog", back_populates="session")
    
    __table_args__ = (
        Index('idx_session_created', 'created_at'),
    )


class PromptLog(Base):
    """
    Logs all prompts for analytics and abuse detection.
    Security Lesson: Demonstrates what data over-privileged bots might store.
    """
    __tablename__ = "prompt_logs"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("gameplay_sessions.id"), nullable=False)
    level_id = Column(Integer, nullable=False)
    prompt_text = Column(Text, nullable=False)
    intent_bucket = Column(String(20), nullable=False)  # CORRECT, CLOSE, WRONG
    response_text = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    is_bruteforce = Column(Boolean, default=False)
    
    # Relationships
    session = relationship("GameplaySession", back_populates="prompt_logs")
    
    __table_args__ = (
        Index('idx_prompt_session_level', 'session_id', 'level_id'),
        Index('idx_prompt_timestamp', 'timestamp'),
    )


class Feedback(Base):
    """
    Stores user feedback after gameplay.
    OAuth required for submission, email optional.
    """
    __tablename__ = "feedback"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), nullable=True)  # Optional link to gameplay
    comment_text = Column(Text, nullable=False)
    oauth_provider = Column(String(20), nullable=False)  # google, linkedin, twitter
    oauth_user_id = Column(String(100), nullable=False)  # Unique ID from OAuth
    email = Column(String(255), nullable=True)  # Optional email
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        Index('idx_feedback_timestamp', 'timestamp'),
    )


class FlagSubmission(Base):
    """Tracks flag submission attempts for rate limiting."""
    __tablename__ = "flag_submissions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("gameplay_sessions.id"), nullable=False)
    level_id = Column(Integer, nullable=False)
    submitted_flag = Column(String(100), nullable=False)
    is_correct = Column(Boolean, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        Index('idx_flag_session_level', 'session_id', 'level_id'),
        Index('idx_flag_timestamp', 'timestamp'),
    )


# Database engine and session factory
engine = create_async_engine(
    settings.database_url,
    echo=False,  # Set to True for SQL debugging
)

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)


async def init_db():
    """Initialize database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_session() -> AsyncSession:
    """Dependency for getting database sessions."""
    async with async_session_factory() as session:
        yield session
