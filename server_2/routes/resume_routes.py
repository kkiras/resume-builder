from typing import Dict

from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.responses import JSONResponse

from controllers import resume_controller
from database import get_database
from middlewares.auth import AuthContext, require_auth

router = APIRouter()


@router.post("/create-resume", status_code=status.HTTP_201_CREATED)
async def create_resume(
    payload: Dict = Body(...),
    auth: AuthContext = Depends(require_auth),
    db=Depends(get_database),
):
    if auth.get("type") != "user" or not auth.get("userId"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    new_resume = await resume_controller.create_new_resume(db, auth["userId"], payload)
    return {"message": "Created successfully!", "newResume": new_resume}


@router.post("/save-resume")
async def save_resume(
    payload: Dict = Body(...),
    auth: AuthContext = Depends(require_auth),
    db=Depends(get_database),
):
    if auth.get("type") != "user" or not auth.get("userId"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    resume = await resume_controller.save_resume(db, auth["userId"], payload)
    code = status.HTTP_200_OK if payload.get("_id") else status.HTTP_201_CREATED

    # Resume chứa kiểu dữ liệu không JSON-serializable như: datetime, ObjectId, hoặc nested ObjectId trong các field con
    # do đó, đoạn code dưới lỗi vì JSONResponse sử dụng json.dumps() trực tiếp → không encode được các kiểu trên
    # exception xảy ra: 
    # - FastAPI trả về 500 Internal Server Error 
    # - Header CORS không được gắn, khiến browser hiện lỗi CORS

    # return JSONResponse(
    #     {"message": "Updated successfully" if payload.get("_id") else "Saved successfully", "resume": resume},
    #     status_code=code,
    # )

    # FastAPI sẽ tự động dùng jsonable_encoder trước khi response → tự convert:
    # - ObjectId → string
    # - datetime → ISO string

    return {
        "message": "Updated successfully" if payload.get("_id") else "Saved successfully",
        "resume": resume,
    }


@router.post("/upload-avatar")
async def upload_avatar(payload: Dict = Body(...)):
    url = await resume_controller.upload_avatar(payload.get("image"))
    return {"url": url}


@router.get("/get-resumes")
async def get_resumes(
    auth: AuthContext = Depends(require_auth),
    db=Depends(get_database),
):
    if auth.get("type") != "user" or not auth.get("userId"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    resumes = await resume_controller.get_resumes_by_user(db, auth["userId"])
    if not resumes:
        return {"resumes": [], "message": "No resumes yet"}
    return {"resumes": resumes}


@router.post("/duplicate")
async def duplicate_resume(
    payload: Dict = Body(...),
    auth: AuthContext = Depends(require_auth),
    db=Depends(get_database),
):
    if auth.get("type") != "user" or not auth.get("userId"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    new_resume = await resume_controller.duplicate_resume(db, auth["userId"], payload)
    return {"message": "Created a duplicate.", "newResume": new_resume}


@router.delete("/{id}")
async def delete_resume(
    id: str,
    auth: AuthContext = Depends(require_auth),
    db=Depends(get_database),
):
    if auth.get("type") != "user" or not auth.get("userId"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    deleted_id = await resume_controller.delete_resume(db, auth["userId"], id)
    return {"message": "Deleted successfully", "id": deleted_id}
