from fastapi import APIRouter, Depends, HTTPException, status

from database import get_database
from middlewares.auth import AuthContext, require_auth

router = APIRouter()


@router.post("/draft")
async def draft(auth: AuthContext = Depends(require_auth), db=Depends(get_database)):  # db dependency keeps parity for future use
    if auth.get("type") != "guest":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Use guest token for this endpoint"
        )
    return {"ok": True, "sessionId": auth.get("sessionId")}
