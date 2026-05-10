import secrets
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Cookie, Depends, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.user import User
from app.schemas.user import TokenResponse, UserLogin, UserOut, UserRegister
from app.utils.auth import create_token, decode_token, hash_password, verify_password

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

_GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/auth"
_GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
_GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"
_GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize"
_GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
_GITHUB_USERINFO_URL = "https://api.github.com/user"
_GITHUB_EMAIL_URL = "https://api.github.com/user/emails"


# ── Helpers ───────────────────────────────────────────────────────────────────

async def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    if not token:
        return None
    user_id = decode_token(token)
    if not user_id:
        return None
    return await db.get(User, user_id)


async def require_user(user: User | None = Depends(get_current_user)) -> User:
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


async def _get_or_create_oauth_user(email: str, display_name: str, db: AsyncSession) -> User:
    user = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
    if not user:
        user = User(email=email, display_name=display_name, hashed_password="")
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user


def _oauth_redirect(token: str) -> RedirectResponse:
    response = RedirectResponse(f"{settings.frontend_url}/auth/callback?token={token}")
    response.delete_cookie("oauth_state")
    return response


def _oauth_error(msg: str) -> RedirectResponse:
    return RedirectResponse(f"{settings.frontend_url}/login?error={msg}")


# ── Email / password ──────────────────────────────────────────────────────────

@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(payload: UserRegister, db: AsyncSession = Depends(get_db)):
    existing = (
        await db.execute(select(User).where(User.email == payload.email))
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=payload.email,
        display_name=payload.display_name,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return TokenResponse(access_token=create_token(user.id), user=UserOut.model_validate(user))


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    user = (
        await db.execute(select(User).where(User.email == payload.email))
    ).scalar_one_or_none()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return TokenResponse(access_token=create_token(user.id), user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(require_user)):
    return user


# ── Google OAuth ──────────────────────────────────────────────────────────────

@router.get("/google")
async def google_login():
    if not settings.google_client_id:
        raise HTTPException(status_code=503, detail="Google OAuth not configured")
    state = secrets.token_urlsafe(16)
    params = urlencode({
        "client_id": settings.google_client_id,
        "redirect_uri": f"{settings.backend_url}/api/auth/google/callback",
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "access_type": "online",
    })
    response = RedirectResponse(f"{_GOOGLE_AUTH_URL}?{params}")
    response.set_cookie("oauth_state", state, max_age=600, httponly=True, samesite="lax")
    return response


@router.get("/google/callback")
async def google_callback(
    code: str,
    state: str,
    db: AsyncSession = Depends(get_db),
    oauth_state: str | None = Cookie(default=None),
):
    if not oauth_state or oauth_state != state:
        return _oauth_error("invalid_state")

    async with httpx.AsyncClient() as client:
        token_res = await client.post(_GOOGLE_TOKEN_URL, data={
            "code": code,
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "redirect_uri": f"{settings.backend_url}/api/auth/google/callback",
            "grant_type": "authorization_code",
        })
        if token_res.status_code != 200:
            return _oauth_error("token_failed")

        access_token = token_res.json().get("access_token")
        userinfo_res = await client.get(
            _GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        userinfo = userinfo_res.json()

    email = userinfo.get("email")
    if not email:
        return _oauth_error("no_email")

    display_name = userinfo.get("name") or email.split("@")[0]
    user = await _get_or_create_oauth_user(email, display_name, db)
    return _oauth_redirect(create_token(user.id))


# ── GitHub OAuth ──────────────────────────────────────────────────────────────

@router.get("/github")
async def github_login():
    if not settings.github_client_id:
        raise HTTPException(status_code=503, detail="GitHub OAuth not configured")
    state = secrets.token_urlsafe(16)
    params = urlencode({
        "client_id": settings.github_client_id,
        "redirect_uri": f"{settings.backend_url}/api/auth/github/callback",
        "scope": "read:user user:email",
        "state": state,
    })
    response = RedirectResponse(f"{_GITHUB_AUTH_URL}?{params}")
    response.set_cookie("oauth_state", state, max_age=600, httponly=True, samesite="lax")
    return response


@router.get("/github/callback")
async def github_callback(
    code: str,
    state: str,
    db: AsyncSession = Depends(get_db),
    oauth_state: str | None = Cookie(default=None),
):
    if not oauth_state or oauth_state != state:
        return _oauth_error("invalid_state")

    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            _GITHUB_TOKEN_URL,
            data={
                "client_id": settings.github_client_id,
                "client_secret": settings.github_client_secret,
                "code": code,
                "redirect_uri": f"{settings.backend_url}/api/auth/github/callback",
            },
            headers={"Accept": "application/json"},
        )
        if token_res.status_code != 200:
            return _oauth_error("token_failed")

        access_token = token_res.json().get("access_token")
        auth_header = {"Authorization": f"Bearer {access_token}"}

        userinfo_res = await client.get(_GITHUB_USERINFO_URL, headers=auth_header)
        userinfo = userinfo_res.json()

        email = userinfo.get("email")
        if not email:
            # GitHub may hide email — fetch from emails endpoint
            emails_res = await client.get(_GITHUB_EMAIL_URL, headers=auth_header)
            for entry in emails_res.json():
                if entry.get("primary") and entry.get("verified"):
                    email = entry["email"]
                    break

    if not email:
        return _oauth_error("no_email")

    display_name = userinfo.get("name") or userinfo.get("login") or email.split("@")[0]
    user = await _get_or_create_oauth_user(email, display_name, db)
    return _oauth_redirect(create_token(user.id))
