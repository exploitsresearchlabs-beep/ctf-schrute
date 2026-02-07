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
    debug: bool = False
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    
    # OAuth
    github_client_id: Optional[str] = None
    github_client_secret: Optional[str] = None
    google_client_id: Optional[str] = None
    google_client_secret: Optional[str] = None
    frontend_url: str = "http://localhost:3000"
    
    @property
    def clean_google_client_id(self) -> Optional[str]:
        return self.google_client_id.strip().strip("'").strip('"') if self.google_client_id else None

    @property
    def clean_google_client_secret(self) -> Optional[str]:
        return self.google_client_secret.strip().strip("'").strip('"') if self.google_client_secret else None

    @property
    def clean_github_client_id(self) -> Optional[str]:
        return self.github_client_id.strip().strip("'").strip('"') if self.github_client_id else None

    @property
    def clean_github_client_secret(self) -> Optional[str]:
        return self.github_client_secret.strip().strip("'").strip('"') if self.github_client_secret else None

    @property
    def cors_origins_list(self) -> list[str]:
        # Handle both comma and semicolon to avoid CLI escaping issues
        raw_origins = self.cors_origins.replace(";", ",")
        # Strip whitespace AND common accidental quotes from CLI env vars
        origins = [origin.strip().strip("'").strip('"') for origin in raw_origins.split(",") if origin.strip()]
        
        # Also include the frontend_url if it's not already there
        if self.frontend_url not in origins:
            origins.append(self.frontend_url)
            
        # Ensure no trailing slashes in the origin (CORSMiddleware is sensitive)
        return [origin.rstrip("/") for origin in origins]


settings = Settings()


class Base(DeclarativeBase):
    """SQLAlchemy declarative base."""
    pass


class User(Base):
    """
    Authenticated user model.
    """
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    provider = Column(String(20), nullable=False)  # google, github, etc.
    provider_user_id = Column(String(100), nullable=False)
    name = Column(String(100), nullable=True)
    email = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    sessions = relationship("GameplaySession", back_populates="user")
    feedback = relationship("Feedback", back_populates="user")
    
    __table_args__ = (
        Index('idx_user_provider', 'provider', 'provider_user_id', unique=True),
    )


class GameplaySession(Base):
    """
    Tracks anonymous user sessions.
    Security Note: No PII stored - only pseudonymous session IDs.
    """
    __tablename__ = "gameplay_sessions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True) # Optional link to registered user
    created_at = Column(DateTime, default=datetime.utcnow)
    last_active = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    current_level = Column(Integer, default=1)
    completed_levels = Column(String(50), default="")  # Comma-separated level IDs
    posthog_distinct_id = Column(String(100), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="sessions")
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
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    comment_text = Column(Text, nullable=False)
    oauth_provider = Column(String(20), nullable=False)  # google, linkedin, twitter
    oauth_user_id = Column(String(100), nullable=False)  # Unique ID from OAuth
    email = Column(String(255), nullable=True)  # Optional email
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="feedback")
    
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
        Index('idx_flag_correct', 'is_correct'),
    )


class DailyStats(Base):
    """
    Caches daily statistics for the leaderboard.
    Calculated from GameplaySession and FlagSubmission.
    """
    __tablename__ = "daily_stats"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(DateTime, nullable=False, default=datetime.utcnow)
    total_players = Column(Integer, default=1)
    total_flags_captured = Column(Integer, default=1)
    level_1_completions = Column(Integer, default=1)
    level_2_completions = Column(Integer, default=1)
    level_3_completions = Column(Integer, default=1)
    level_4_completions = Column(Integer, default=1)
    level_5_completions = Column(Integer, default=1)
    level_6_completions = Column(Integer, default=1)
    level_7_completions = Column(Integer, default=1)
    level_8_completions = Column(Integer, default=1)
    
    __table_args__ = (
        Index('idx_stats_date', 'date', unique=True),
    )


# Database engine configuration
def create_app_engine():
    db_url = settings.database_url
    connect_args = {}
    
    # Neon and other providers require SSL. asyncpg doesn't support 'sslmode' in the URL.
    # We normalize the protocol to asyncpg and strip all query params.
    if "postgresql" in db_url:
        # Force the asyncpg driver if not specified
        if "postgresql+asyncpg://" not in db_url:
            db_url = db_url.replace("postgresql://", "postgresql+asyncpg://")
            
        if "?" in db_url:
            db_url = db_url.split("?")[0]
        
        # 'ssl' can be True, or the string "require" depending on the SQLAlchemy version/driver combo
        connect_args["ssl"] = True
        
    return create_async_engine(
        db_url,
        echo=False,
        connect_args=connect_args
    )

engine = create_app_engine()

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
