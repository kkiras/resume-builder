import hashlib
import os
import secrets
import uuid
from collections import defaultdict, deque
from datetime import datetime, timedelta
from typing import Deque, Dict, Optional

import bcrypt
from fastapi import APIRouter, Body, Depends, HTTPException, Request, status
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from jose import jwt
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel, EmailStr

from database import get_database

router = APIRouter()

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


class RegisterPayload(BaseModel):
    email: EmailStr
    password: str


class LoginPayload(BaseModel):
    email: EmailStr
    password: str


class GooglePayload(BaseModel):
    token: str


class ResetPasswordPayload(BaseModel):
    uid: str
    token: str
    newPassword: str


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def _verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:  # pylint: disable=broad-except
        return False


def _sign_token(payload: Dict, expires_in_seconds: int) -> str:
    if not JWT_SECRET:
        raise RuntimeError("Missing JWT_SECRET environment variable")
    exp = datetime.utcnow() + timedelta(seconds=expires_in_seconds)
    payload = {**payload, "exp": exp}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


# Simple in-memory rate limiter for password reset requests
_reset_requests: Dict[str, Deque[float]] = defaultdict(deque)
RESET_WINDOW_SECONDS = 15 * 60
RESET_MAX_REQUESTS = 5


def _check_reset_rate_limit(identifier: str) -> None:
    now = datetime.utcnow().timestamp()
    queue = _reset_requests[identifier]
    while queue and queue[0] < now - RESET_WINDOW_SECONDS:
        queue.popleft()
    if len(queue) >= RESET_MAX_REQUESTS:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many requests")
    queue.append(now)


@router.post("/register")
async def register(payload: RegisterPayload, db: AsyncIOMotorDatabase = Depends(get_database)):
    existing = await db.users.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")

    hashed_password = _hash_password(payload.password)
    doc = {
        "email": payload.email.lower(),
        "password": None,
        "passwordHash": hashed_password,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
    }
    result = await db.users.insert_one(doc)
    token = _sign_token({"id": str(result.inserted_id)}, expires_in_seconds=3600)
    return {"message": "User registered successfully", "token": token}


@router.post("/login")
async def login(payload: LoginPayload, db: AsyncIOMotorDatabase = Depends(get_database)):
    user = await db.users.find_one({"email": payload.email.lower()})
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email or password")

    stored_hash = user.get("passwordHash") or user.get("password")
    if not stored_hash or not _verify_password(payload.password, stored_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email or password")

    token = _sign_token({"id": str(user["_id"])}, expires_in_seconds=3600)
    return {"token": token}


@router.post("/guest")
async def guest_token():
    session_id = str(uuid.uuid4())
    token = _sign_token({"type": "guest", "sessionId": session_id}, expires_in_seconds=12 * 60 * 60)
    return {"token": token, "expiresIn": 12 * 60 * 60}


@router.post("/google")
async def google_login(payload: GooglePayload, db: AsyncIOMotorDatabase = Depends(get_database)):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Missing GOOGLE_CLIENT_ID")
    try:
        id_info = id_token.verify_oauth2_token(payload.token, google_requests.Request(), GOOGLE_CLIENT_ID)
    except Exception as exc:  # pylint: disable=broad-except
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google token") from exc

    email = (id_info.get("email") or "").lower()
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google account missing email")
    name = id_info.get("name") or ""
    picture = id_info.get("picture") or ""
    google_id = id_info.get("sub")

    user = await db.users.find_one({"email": email})
    if not user:
        doc = {
            "email": email,
            "googleId": google_id,
            "name": name,
            "picture": picture,
            "avatar": picture,
            "password": None,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        }
        result = await db.users.insert_one(doc)
        user_id = str(result.inserted_id)
        user_doc = doc
    else:
        update = {}
        if not user.get("googleId"):
            update["googleId"] = google_id
        if name and not user.get("name"):
            update["name"] = name
        if picture and not user.get("picture"):
            update["picture"] = picture
        if picture and not user.get("avatar"):
            update["avatar"] = picture
        if update:
            update["updatedAt"] = datetime.utcnow()
            await db.users.update_one({"_id": user["_id"]}, {"$set": update})
        user_id = str(user["_id"])
        user_doc = {**user, **update}

    token = _sign_token({"id": user_id}, expires_in_seconds=7 * 24 * 60 * 60)
    return {
        "success": True,
        "token": token,
        "user": {
            "email": user_doc.get("email", email),
            "name": user_doc.get("name", name),
            "avatar": user_doc.get("avatar") or user_doc.get("picture") or picture,
        },
    }


SAFE_RESET_RESPONSE = {"message": "If the email exists, we have sent reset instructions."}


async def _send_reset_email(to_email: str, reset_url: str) -> None:
    import smtplib
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText

    user = os.getenv("EMAIL_USER")
    app_pass = os.getenv("EMAIL_APP_PASS")
    if not user or not app_pass:
        raise RuntimeError("Missing email credentials")

    msg = MIMEMultipart()
    msg["From"] = f"Resume Builder <{user}>"
    msg["To"] = to_email
    msg["Subject"] = "Reset password"
    msg.attach(MIMEText(f"Click here to reset your password: {reset_url}", "plain"))

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(user, app_pass)
        server.send_message(msg)


@router.post("/forgot-password")
async def forgot_password(request: Request, body: Dict = Body(...), db: AsyncIOMotorDatabase = Depends(get_database)):
    requester = request.client.host if request.client else "unknown"
    _check_reset_rate_limit(requester)

    email: Optional[str] = (body.get("email") or "").lower().strip() if isinstance(body, dict) else None
    if not email:
        return SAFE_RESET_RESPONSE

    user = await db.users.find_one({"email": email})
    if not user:
        return SAFE_RESET_RESPONSE

    raw_token = secrets.token_hex(32)
    token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
    expires_at = datetime.utcnow() + timedelta(minutes=15)

    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"resetPassword": {"tokenHash": token_hash, "expiresAt": expires_at, "usedAt": None, "attempts": 0}}},
    )

    base = os.getenv("CLIENT_BASE_URL") or request.headers.get("origin") or "http://localhost:5173"
    base = base.rstrip("/")
    reset_url = f"{base}/reset-password?uid={user['_id']}&token={raw_token}"

    try:
        await _send_reset_email(email, reset_url)
    except Exception:
        # Intentionally swallow errors to avoid leaking state
        return SAFE_RESET_RESPONSE

    return SAFE_RESET_RESPONSE


@router.post("/reset-password")
async def reset_password(payload: ResetPasswordPayload, db: AsyncIOMotorDatabase = Depends(get_database)):
    from bson import ObjectId

    try:
        user_id = ObjectId(payload.uid)
    except Exception as exc:  # pylint: disable=broad-except
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token") from exc

    user = await db.users.find_one({"_id": user_id})
    reset_meta = user.get("resetPassword") if user else None
    if not user or not reset_meta or not reset_meta.get("tokenHash"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token")

    if reset_meta.get("usedAt"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token already used")
    if reset_meta.get("expiresAt") and datetime.utcnow() > reset_meta["expiresAt"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token expired")

    token_hash = hashlib.sha256(payload.token.encode("utf-8")).hexdigest()
    if token_hash != reset_meta.get("tokenHash"):
        attempts = (reset_meta.get("attempts") or 0) + 1
        await db.users.update_one({"_id": user_id}, {"$set": {"resetPassword.attempts": attempts}})
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token")

    password_hash = _hash_password(payload.newPassword)
    await db.users.update_one(
        {"_id": user_id},
        {
            "$set": {
                "passwordHash": password_hash,
                "password": None,
                "resetPassword.usedAt": datetime.utcnow(),
                "sessionsVersion": (user.get("sessionsVersion") or 0) + 1,
            }
        },
    )

    return {"message": "Password updated. Please login again."}
