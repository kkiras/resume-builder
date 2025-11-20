from typing import Dict

from fastapi import APIRouter, Body, Depends, HTTPException, status

from controllers import user_controller
from database import get_database
from middlewares.auth import AuthContext, require_auth

router = APIRouter()


@router.get("/me")
async def me(auth: AuthContext = Depends(require_auth), db=Depends(get_database)):
    if auth.get("type") != "user" or not auth.get("userId"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    return await user_controller.get_me(db, auth["userId"])


@router.put("/me")
async def update_me(
    payload: Dict = Body(...),
    auth: AuthContext = Depends(require_auth),
    db=Depends(get_database),
):
    if auth.get("type") != "user" or not auth.get("userId"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    return await user_controller.update_me(db, auth["userId"], payload)


@router.post("/upload-avatar")
async def upload_avatar(payload: Dict = Body(...), auth: AuthContext = Depends(require_auth)):
    if auth.get("type") != "user":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    url = await user_controller.upload_avatar(payload.get("image"))
    return {"url": url}


@router.delete("/me")
async def delete_me(auth: AuthContext = Depends(require_auth), db=Depends(get_database)):
    if auth.get("type") != "user" or not auth.get("userId"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    return await user_controller.delete_me(db, auth["userId"])
