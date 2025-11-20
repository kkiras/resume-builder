import os
from datetime import datetime
from typing import Any, Dict, List, Optional

import cloudinary
import cloudinary.uploader
from bson import ObjectId
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

TEMPLATE_MAP = {"classic": "Classic", "modern": "Modern", "minimalist": "Minimalist"}


def normalize_template(value: Optional[str]) -> str:
    if not value or not isinstance(value, str):
        return "Classic"
    key = value.strip().lower()
    return TEMPLATE_MAP.get(key, "Classic")


def serialize_resume(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Convert Mongo types to JSON-friendly variants."""
    serialized = {**doc}
    if "_id" in serialized:
        serialized["_id"] = str(serialized["_id"])
    if "userId" in serialized:
        serialized["userId"] = str(serialized["userId"])
    for key in ("createdAt", "updatedAt", "share", "basics", "styles", "sections"):
        # leave complex structures as-is; Mongo primitives are JSON serializable
        pass
    return serialized


def _ensure_object_id(value: str) -> ObjectId:
    try:
        return ObjectId(value)
    except Exception as exc:  # pylint: disable=broad-except
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid resume id") from exc


async def create_new_resume(db: AsyncIOMotorDatabase, user_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    resume_data = {k: v for k, v in payload.items() if k not in {"_id", "userId"}}
    resume_data["userId"] = _ensure_object_id(user_id)
    resume_data["template"] = normalize_template(payload.get("template"))
    now = datetime.utcnow()
    resume_data.setdefault("createdAt", now)
    resume_data.setdefault("updatedAt", now)
    resume_data.setdefault("share", {"enabled": False})
    resume_data.setdefault("visibility", "private")

    result = await db.resumes.insert_one(resume_data)
    created = await db.resumes.find_one({"_id": result.inserted_id})
    return serialize_resume(created)


async def delete_resume(db: AsyncIOMotorDatabase, user_id: str, resume_id: str) -> str:
    oid = _ensure_object_id(resume_id)
    deleted = await db.resumes.find_one_and_delete({"_id": oid, "userId": _ensure_object_id(user_id)})
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
    return str(oid)


async def duplicate_resume(db: AsyncIOMotorDatabase, user_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    clean_fields = {k: v for k, v in payload.items() if k not in {"_id", "userId", "share", "visibility", "createdAt", "updatedAt"}}
    clean_fields["userId"] = _ensure_object_id(user_id)
    clean_fields["template"] = normalize_template(payload.get("template"))
    clean_fields["share"] = {"enabled": False}
    clean_fields["visibility"] = "private"
    clean_fields["createdAt"] = datetime.utcnow()
    clean_fields["updatedAt"] = datetime.utcnow()

    result = await db.resumes.insert_one(clean_fields)
    created = await db.resumes.find_one({"_id": result.inserted_id})
    if not created:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to duplicate resume")
    return serialize_resume(created)


async def save_resume(db: AsyncIOMotorDatabase, user_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    resume_id = payload.get("_id")
    normalized_template = None
    if "template" in payload:
        normalized_template = normalize_template(payload.get("template"))

    if resume_id:
        oid = _ensure_object_id(resume_id)
        update_payload = {k: v for k, v in payload.items() if k not in {"_id", "userId"}}
        update_payload["updatedAt"] = datetime.utcnow()
        if normalized_template:
            update_payload["template"] = normalized_template

        updated = await db.resumes.find_one_and_update(
            {"_id": oid, "userId": _ensure_object_id(user_id)},
            {"$set": update_payload},
            return_document=ReturnDocument.AFTER,
        )
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
        return serialize_resume(updated)

    # Create new resume
    resume_data = {k: v for k, v in payload.items() if k not in {"_id", "userId"}}
    resume_data["userId"] = _ensure_object_id(user_id)
    resume_data["template"] = normalized_template or normalize_template(None)
    resume_data["createdAt"] = datetime.utcnow()
    resume_data["updatedAt"] = datetime.utcnow()
    result = await db.resumes.insert_one(resume_data)
    created = await db.resumes.find_one({"_id": result.inserted_id})
    return serialize_resume(created)


async def get_resumes_by_user(db: AsyncIOMotorDatabase, user_id: str) -> List[Dict[str, Any]]:
    cursor = db.resumes.find({"userId": _ensure_object_id(user_id)}).sort("createdAt", -1)
    results: List[Dict[str, Any]] = []
    async for doc in cursor:
        results.append(serialize_resume(doc))
    return results


async def upload_avatar(image: str, folder_env: str = "CLOUDINARY_FOLDER") -> str:
    if not image or not isinstance(image, str):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing image")

    folder = os.getenv(folder_env, "resume-avatar")
    result = cloudinary.uploader.upload(
        image,
        folder=folder,
        resource_type="image",
        overwrite=True,
    )
    return result.get("secure_url") or ""
