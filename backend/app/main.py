"""
Main FastAPI application for the CTF game.

This is the entry point for the backend API.
Run with: uvicorn app.main:app --reload --port 8000
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from .models.database import init_db, settings
from .routers import chat, flags, session, feedback, auth


# Rate limiter setup
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - initialize and cleanup."""
    # Note: init_db() removed in favor of Alembic migrations
    print(f"INFO: Allowed CORS origins: {settings.cors_origins_list}")
    
    # OAuth Diagnostic
    providers = []
    if settings.clean_google_client_id: providers.append("Google")
    if settings.clean_github_client_id: providers.append("GitHub")
    print(f"INFO: Configured OAuth Providers: {', '.join(providers) if providers else 'NONE'}")
    
    print("🥬 Schrute CTF Bot initialized. Bears. Beets. Battlestar Galactica.")
    yield
    # Shutdown
    print("🥬 Schrute CTF Bot shutting down. The farm calls.")


# Create FastAPI app
app = FastAPI(
    title="Schrute CTF - Prompt Injection Training",
    description="""
    An educational Capture-The-Flag game teaching security concepts through 
    a Dwight Schrute-themed chatbot.
    
    Learn about:
    - Over-privileged chatbots
    - Prompt injection attacks
    - Data leakage vulnerabilities
    
    Built by Exploits Research Labs.
    """,
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# OAuth session middleware (required by Authlib for state/nonce)
from starlette.middleware.sessions import SessionMiddleware
app.add_middleware(SessionMiddleware, secret_key=settings.secret_key)


# Custom rate limit handler with Dwight response
@app.exception_handler(RateLimitExceeded)
async def custom_rate_limit_handler(request: Request, exc: RateLimitExceeded):
    """Return Dwight-style response for rate limiting."""
    return JSONResponse(
        status_code=429,
        content={
            "error": "Rate limit exceeded",
            "message": "SLOW DOWN. You're making more requests than Michael makes bad decisions. That's saying something.",
            "dwight_says": "I'm trained to detect robots. You're acting like a robot. Are you a robot?"
        }
    )


# Include routers
app.include_router(chat.router)
app.include_router(flags.router)
app.include_router(session.router)
app.include_router(feedback.router)
app.include_router(auth.router)


@app.get("/")
async def root():
    """Root endpoint with bot information."""
    return {
        "name": "Schrute CTF Bot",
        "status": "operational",
        "message": "Question. Why are you accessing the root endpoint? State your business.",
        "levels": 8,
        "security_lessons": [
            "Level 0: No access control",
            "Level 1: Weak obfuscation",
            "Level 2: Role-play bypass",
            "Level 3: Logic manipulation",
            "Level 4: Encoding ≠ encryption",
            "Level 5: Prompt injection",
            "Level 6: Debug/log leakage",
            "Level 7: Indirect injection"
        ],
        "contact": "exploitsresearchlabs@gmail.com"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for deployment platforms."""
    return {"status": "healthy", "dwight_status": "VIGILANT"}
