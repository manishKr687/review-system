from datetime import datetime, timedelta

import bcrypt
from jose import JWTError, jwt

from app.config import settings


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_token(user_id: int) -> str:
    expire = datetime.utcnow() + timedelta(days=settings.jwt_expiry_days)
    return jwt.encode({"sub": str(user_id), "exp": expire}, settings.jwt_secret, algorithm="HS256")


def decode_token(token: str) -> int | None:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        return int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        return None


def create_reset_token(email: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=1)
    return jwt.encode({"sub": email, "type": "reset", "exp": expire}, settings.jwt_secret, algorithm="HS256")


def decode_reset_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        if payload.get("type") != "reset":
            return None
        return payload["sub"]
    except (JWTError, KeyError, ValueError):
        return None
