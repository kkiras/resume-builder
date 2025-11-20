from datetime import datetime, timedelta
from typing import Dict

from fastapi import APIRouter, Body, Depends, HTTPException, status
from bson import ObjectId

from controllers import resume_controller
from database import get_database
from middlewares.auth import AuthContext, require_auth
from utils import generate_share_token

router = APIRouter()


@router.get("/shares/{token}")
async def get_shared_resume(token: str, db=Depends(get_database)):
    doc = await db.resumes.find_one(
        {"share.token": token, "share.enabled": True},
        projection={"name": 1, "basics": 1, "sections": 1, "styles": 1, "visibility": 1, "share.expiresAt": 1},
    )
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    expires_at = doc.get("share", {}).get("expiresAt")
    if expires_at and datetime.utcnow() > expires_at:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    if doc.get("visibility") == "private":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    return {"resume": resume_controller.serialize_resume(doc)}


@router.patch("/resumes/{id}/visibility")
async def change_visibility(
    id: str,
    payload: Dict = Body(...),
    auth: AuthContext = Depends(require_auth),
    db=Depends(get_database),
):
    if auth.get("type") != "user" or not auth.get("userId"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Login required")

    visibility = payload.get("visibility")
    if visibility not in {"private", "public", "link"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid visibility")

    try:
        oid = ObjectId(id)
        owner_id = ObjectId(auth["userId"])
    except Exception as exc:  # pylint: disable=broad-except
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid resume id") from exc
    doc = await db.resumes.find_one({"_id": oid, "userId": owner_id})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    updates = {"visibility": visibility, "updatedAt": datetime.utcnow()}
    if visibility == "private":
        updates["share.enabled"] = False
    await db.resumes.update_one({"_id": oid, "userId": owner_id}, {"$set": updates})

    return {"ok": True, "visibility": visibility, "shareEnabled": visibility != "private"}


@router.post("/resumes/{id}/share/enable")
async def enable_share(
    id: str,
    auth: AuthContext = Depends(require_auth),
    db=Depends(get_database),
):
    if auth.get("type") != "user" or not auth.get("userId"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Login required")

    try:
        oid = ObjectId(id)
        owner_id = ObjectId(auth["userId"])
    except Exception as exc:  # pylint: disable=broad-except
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid resume id") from exc
    doc = await db.resumes.find_one({"_id": oid, "userId": owner_id})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    now = datetime.utcnow()
    share = doc.get("share") or {}
    token = share.get("token") or generate_share_token(18)
    expires_at = now + timedelta(hours=24)
    await db.resumes.update_one(
        {"_id": oid, "userId": owner_id},
        {
            "$set": {
                "share.token": token,
                "share.enabled": True,
                "share.expiresAt": expires_at,
                "share.lastRotatedAt": now,
                "updatedAt": now,
            }
        },
    )
    return {"ok": True, "token": token, "expiresAt": expires_at}


@router.post("/resumes/{id}/share/rotate")
async def rotate_share(
    id: str,
    auth: AuthContext = Depends(require_auth),
    db=Depends(get_database),
):
    if auth.get("type") != "user" or not auth.get("userId"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Login required")

    try:
        oid = ObjectId(id)
        owner_id = ObjectId(auth["userId"])
    except Exception as exc:  # pylint: disable=broad-except
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid resume id") from exc
    doc = await db.resumes.find_one({"_id": oid, "userId": owner_id})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    now = datetime.utcnow()
    token = generate_share_token(18)
    expires_at = now + timedelta(hours=24)
    await db.resumes.update_one(
        {"_id": oid, "userId": owner_id},
        {
            "$set": {
                "share.token": token,
                "share.enabled": True,
                "share.expiresAt": expires_at,
                "share.lastRotatedAt": now,
                "updatedAt": now,
            }
        },
    )
    return {"ok": True, "token": token, "expiresAt": expires_at}
