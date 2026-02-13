from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, UploadFile, File
from fastapi.responses import RedirectResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import requests
from urllib.parse import urlencode, unquote

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime
    google_tokens: Optional[dict] = None

class SalaryRange(BaseModel):
    min: Optional[int] = None
    max: Optional[int] = None
    currency: str = "USD"

class JobDescription(BaseModel):
    model_config = ConfigDict(extra="ignore")
    job_id: str
    user_id: str
    title: str
    department: Optional[str] = None
    location: str = "Remote"
    employment_type: str = "Full-time"
    experience_level: str = "Mid"
    description: str
    requirements: List[str] = []
    nice_to_have: List[str] = []
    salary_range: Optional[SalaryRange] = None
    status: str = "draft"  # draft, active, paused, closed
    created_at: datetime
    updated_at: datetime

class JobDescriptionCreate(BaseModel):
    title: str
    department: Optional[str] = None
    location: str = "Remote"
    employment_type: str = "Full-time"
    experience_level: str = "Mid"
    description: str
    requirements: List[str] = []
    nice_to_have: List[str] = []
    salary_range: Optional[SalaryRange] = None
    status: str = "draft"

class JobDescriptionUpdate(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    experience_level: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[List[str]] = None
    nice_to_have: Optional[List[str]] = None
    salary_range: Optional[SalaryRange] = None
    status: Optional[str] = None

async def get_user_from_cookie(request: Request) -> Optional[User]:
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.replace("Bearer ", "")
    
    if not session_token:
        return None
    
    session_doc = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session_doc:
        return None
    
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        await db.user_sessions.delete_one({"session_token": session_token})
        return None
    
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0}
    )
    
    if not user_doc:
        return None
    
    return User(**user_doc)

@api_router.post("/auth/session")
async def create_session(request: Request):
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session_id")
    
    try:
        response = requests.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id},
            timeout=10
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session_id")
        
        session_data = response.json()
        
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        
        existing_user = await db.users.find_one(
            {"email": session_data["email"]},
            {"_id": 0}
        )
        
        if existing_user:
            user_id = existing_user["user_id"]
            await db.users.update_one(
                {"user_id": user_id},
                {"$set": {
                    "name": session_data["name"],
                    "picture": session_data["picture"]
                }}
            )
        else:
            await db.users.insert_one({
                "user_id": user_id,
                "email": session_data["email"],
                "name": session_data["name"],
                "picture": session_data["picture"],
                "created_at": datetime.now(timezone.utc)
            })
        
        session_token = session_data["session_token"]
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        await db.user_sessions.insert_one({
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": expires_at,
            "created_at": datetime.now(timezone.utc)
        })
        
        user_doc = await db.users.find_one(
            {"user_id": user_id},
            {"_id": 0}
        )
        
        return {
            "session_token": session_token,
            "user": user_doc
        }
    
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Auth service error: {str(e)}")

@api_router.get("/auth/me")
async def get_current_user(request: Request):
    user = await get_user_from_cookie(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(
        key="session_token",
        path="/",
        secure=True,
        httponly=True,
        samesite="none"
    )
    
    return {"message": "Logged out successfully"}

# Job Description Endpoints

@api_router.post("/jobs")
async def create_job(job_data: JobDescriptionCreate, request: Request):
    user = await get_user_from_cookie(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    job_id = f"job_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc)
    
    job_doc = {
        "job_id": job_id,
        "user_id": user.user_id,
        "title": job_data.title,
        "department": job_data.department,
        "location": job_data.location,
        "employment_type": job_data.employment_type,
        "experience_level": job_data.experience_level,
        "description": job_data.description,
        "requirements": job_data.requirements,
        "nice_to_have": job_data.nice_to_have,
        "salary_range": job_data.salary_range.dict() if job_data.salary_range else None,
        "status": job_data.status,
        "created_at": now,
        "updated_at": now
    }
    
    await db.jobs.insert_one(job_doc)
    
    created_job = await db.jobs.find_one(
        {"job_id": job_id},
        {"_id": 0}
    )
    
    return created_job

@api_router.get("/jobs")
async def list_jobs(request: Request, status: Optional[str] = None):
    user = await get_user_from_cookie(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    query = {"user_id": user.user_id}
    if status:
        query["status"] = status
    
    jobs = await db.jobs.find(query, {"_id": 0}).sort("created_at", -1).to_list(length=None)
    
    return jobs

@api_router.get("/jobs/{job_id}")
async def get_job(job_id: str, request: Request):
    user = await get_user_from_cookie(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    job = await db.jobs.find_one(
        {"job_id": job_id, "user_id": user.user_id},
        {"_id": 0}
    )
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return job

@api_router.put("/jobs/{job_id}")
async def update_job(job_id: str, job_data: JobDescriptionUpdate, request: Request):
    user = await get_user_from_cookie(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    job = await db.jobs.find_one(
        {"job_id": job_id, "user_id": user.user_id},
        {"_id": 0}
    )
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    update_data = {k: v for k, v in job_data.dict(exclude_unset=True).items() if v is not None}
    
    if update_data:
        if "salary_range" in update_data and update_data["salary_range"]:
            update_data["salary_range"] = update_data["salary_range"]
        
        update_data["updated_at"] = datetime.now(timezone.utc)
        
        await db.jobs.update_one(
            {"job_id": job_id},
            {"$set": update_data}
        )
    
    updated_job = await db.jobs.find_one(
        {"job_id": job_id},
        {"_id": 0}
    )
    
    return updated_job

@api_router.delete("/jobs/{job_id}")
async def delete_job(job_id: str, request: Request):
    user = await get_user_from_cookie(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    result = await db.jobs.delete_one(
        {"job_id": job_id, "user_id": user.user_id}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return {"message": "Job deleted successfully"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()