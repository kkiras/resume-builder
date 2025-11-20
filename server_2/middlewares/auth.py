import os
from typing import Optional, TypedDict

from fastapi import Depends, HTTPException, Request, status
from jose import JWTError, jwt


class AuthContext(TypedDict, total=False):
    type: str
    userId: str
    sessionId: str


JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"


def _decode_token(token: str) -> AuthContext:
    if not JWT_SECRET:
        raise RuntimeError("Missing JWT_SECRET environment variable")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") == "guest":
            return {"type": "guest", "sessionId": str(payload.get("sessionId", ""))}
        return {"type": "user", "userId": str(payload.get("id", ""))}
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid/expired token"
        ) from exc


async def require_auth(request: Request) -> AuthContext:
    header = request.headers.get("Authorization", "")
    token: Optional[str] = None
    if header.startswith("Bearer "):
        token = header.split(" ", 1)[1]

    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No token")

    return _decode_token(token)
