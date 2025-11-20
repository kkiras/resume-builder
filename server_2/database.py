import os
from pathlib import Path
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from dotenv import load_dotenv


# Load environment variables from default locations and fall back to the Node server .env if present.
load_dotenv()
load_dotenv(Path(__file__).resolve().parent.parent / "server" / ".env", override=False)

_client: Optional[AsyncIOMotorClient] = None
_db: Optional[AsyncIOMotorDatabase] = None


def get_mongo_uri() -> str:
    uri = os.getenv("MONGO_URI")
    if not uri:
        raise RuntimeError("Missing MONGO_URI environment variable")
    return uri


def get_db_name() -> str:
    name = os.getenv("MONGO_DB_NAME")
    if not name:
        raise RuntimeError("Missing MONGO_DB_NAME environment variable")
    return name


async def connect_to_mongo() -> AsyncIOMotorDatabase:
    """
    Create a singleton Motor client and return the database handle.
    """
    global _client, _db
    if _client and _db:
        return _db

    uri = get_mongo_uri()
    db_name = get_db_name()

    _client = AsyncIOMotorClient(uri)
    _db = _client[db_name]

    # Ping once to fail fast if the connection is invalid.
    await _db.command("ping")
    return _db


async def close_mongo_connection() -> None:
    global _client, _db
    if _client:
        _client.close()
    _client = None
    _db = None


async def get_database() -> AsyncIOMotorDatabase:
    """
    FastAPI dependency to obtain a database connection.
    """
    if _db is None:
        await connect_to_mongo()
    return _db  # type: ignore[return-value]
