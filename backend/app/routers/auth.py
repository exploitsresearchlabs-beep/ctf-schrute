
import os
import uuid
from jose import jwt
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from authlib.integrations.starlette_client import OAuth
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.database import get_session, User, GameplaySession, settings

router = APIRouter(prefix="/auth", tags=["auth"])

# OAuth Setup
oauth = OAuth()

# GITHUB
oauth.register(
    name='github',
    client_id=settings.clean_github_client_id,
    client_secret=settings.clean_github_client_secret,
    access_token_url='https://github.com/login/oauth/access_token',
    access_token_params=None,
    authorize_url='https://github.com/login/oauth/authorize',
    authorize_params=None,
    api_base_url='https://api.github.com/',
    client_kwargs={'scope': 'user:email'},
)

# GOOGLE
oauth.register(
    name='google',
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_id=settings.clean_google_client_id,
    client_secret=settings.clean_google_client_secret,
    client_kwargs={'scope': 'openid email profile'},
)

# JWT helpers
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm="HS256")
    return encoded_jwt

@router.get('/login/{provider}')
async def login(provider: str, request: Request, session_id: Optional[str] = None):
    client = oauth.create_client(provider)
    if not client:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    # Store session_id in oauth state if we want to link it after callback
    # For simplicity, we'll use the session for this temporary state
    if session_id:
        request.session['link_session_id'] = session_id
        
    redirect_uri = request.url_for('auth_callback', provider=provider)
    
    # Cloud Run/Vercel Proxy Fix: Force https for the redirect URI if not on localhost
    if "localhost" not in str(redirect_uri) and "127.0.0.1" not in str(redirect_uri):
        redirect_uri = str(redirect_uri).replace("http://", "https://")
        
    return await client.authorize_redirect(request, str(redirect_uri))

@router.get('/callback/{provider}', name='auth_callback')
async def auth_callback(provider: str, request: Request, db: AsyncSession = Depends(get_session)):
    client = oauth.create_client(provider)
    if not client:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    token = await client.authorize_access_token(request)
    user_info = token.get('userinfo')
    
    # Handle providers that don't use OIDC / userinfo automatically
    if not user_info:
        if provider == 'github':
            resp = await client.get('user', token=token)
            user_info = resp.json()
            # GitHub might not return email in main /user if private, need /user/emails
            if not user_info.get('email'):
                emails_resp = await client.get('user/emails', token=token)
                emails = emails_resp.json()
                primary_email = next((e['email'] for e in emails if e['primary']), None)
                user_info['email'] = primary_email

    if not user_info:
        raise HTTPException(status_code=400, detail="Failed to fetch user info")

    # Normalized user data
    provider_user_id = str(user_info.get('id') or user_info.get('sub'))
    email = user_info.get('email')
    name = user_info.get('name') or user_info.get('login')

    # Find or create user
    stmt = select(User).where(User.provider == provider, User.provider_user_id == provider_user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            provider=provider,
            provider_user_id=provider_user_id,
            email=email,
            name=name
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    # Link anonymous session if it exists in state
    link_session_id = request.session.pop('link_session_id', None)
    if link_session_id:
        session_stmt = select(GameplaySession).where(GameplaySession.id == link_session_id)
        session_result = await db.execute(session_stmt)
        session = session_result.scalar_one_or_none()
        if session:
            session.user_id = user.id
            await db.commit()

    # Create JWT
    access_token = create_access_token(data={"sub": user.id, "email": user.email})

    # Return to frontend with token
    # In a real app, this would redirect to a frontend URL with the token in a cookie or fragment
    frontend_url = settings.frontend_url
    response = Response(status_code=302)
    response.headers['Location'] = f"{frontend_url}/auth/success?token={access_token}"
    return response

@router.get('/me')
async def get_me(request: Request, db: AsyncSession = Depends(get_session)):
    # Very basic token validation for demo
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        user_id = payload.get("sub")
        
        stmt = select(User).where(User.id == user_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "provider": user.provider
        }
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
