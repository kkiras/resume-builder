import os
from datetime import datetime
from typing import Any, Dict

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


def _ensure_object_id(value: str) -> ObjectId:
    try:
        return ObjectId(value)
    except Exception as exc:  # pylint: disable=broad-except
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user id") from exc


def serialize_user(user: Dict[str, Any]) -> Dict[str, Any]:
    serialized = {
        "id": str(user.get("_id")),
        "email": user.get("email", ""),
        "name": user.get("name", ""),
        "phone": user.get("phone", ""),
        "location": user.get("location", ""),
        "avatar": user.get("avatar") or user.get("picture") or "",
        "isGoogle": bool(user.get("googleId")),
    }
    return serialized


async def get_me(db: AsyncIOMotorDatabase, user_id: str) -> Dict[str, Any]:
    user = await db.users.find_one({"_id": _ensure_object_id(user_id)})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {"user": serialize_user(user)}


async def update_me(db: AsyncIOMotorDatabase, user_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    updates = {
        "name": payload.get("name", ""),
        "phone": payload.get("phone", ""),
        "location": payload.get("location", ""),
        "avatar": payload.get("avatar", ""),
        "updatedAt": datetime.utcnow(),
    }

    updated = await db.users.find_one_and_update(
        {"_id": _ensure_object_id(user_id)},
        {"$set": updates},
        return_document=ReturnDocument.AFTER,
    )
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return {"user": serialize_user(updated), "message": "Profile updated"}


async def upload_avatar(image: str) -> str:
    if not image or not isinstance(image, str):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing image")

    folder = os.getenv("CLOUDINARY_FOLDER_PROFILE", "profile-avatar")
    result = cloudinary.uploader.upload(
        image,
        folder=folder,
        resource_type="image",
        overwrite=True,
    )
    return result.get("secure_url") or ""


async def delete_me(db: AsyncIOMotorDatabase, user_id: str) -> Dict[str, str]:
    oid = _ensure_object_id(user_id)
    await db.users.find_one_and_delete({"_id": oid})
    await db.resumes.delete_many({"userId": oid})
    return {"message": "Account and related data deleted"}
