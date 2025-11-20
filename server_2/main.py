import os

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database import close_mongo_connection, connect_to_mongo
from routes import auth, temp, resume_routes, user_routes, share, llm

# Load environment variables early (includes fallback to server/.env inside database.py)
load_dotenv()

app = FastAPI(title="Resume Builder API (FastAPI)")

allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
print(allowed_origins_env)
allowed_origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()] or ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# @app.on_event("startup")
# async def _startup():
#     await connect_to_mongo()


# @app.on_event("shutdown")
# async def _shutdown():
#     await close_mongo_connection()


@app.get("/health")
async def health():
    return {"status": "ok"}


# Route registration mirrors the Node server
app.include_router(auth.router, prefix="/api/auth")
app.include_router(temp.router, prefix="/api/temp")
app.include_router(resume_routes.router, prefix="/api/resumeRoutes")
app.include_router(user_routes.router, prefix="/api/users")
app.include_router(share.router, prefix="/api")
app.include_router(llm.router, prefix="/api/llm")


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=int(  # nosec B104
        # Default to 8000 if PORT is not defined
        __import__("os").getenv("PORT", "8000")
    ), reload=True)
