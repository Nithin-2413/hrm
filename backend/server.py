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
from urllib.parse import urlencode, unquote, quote
import base64
import io
import re
import PyPDF2
import docx
from google import genai

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure Gemini AI Client
gemini_client = genai.Client(api_key=os.environ.get('GOOGLE_API_KEY'))

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

class Resume(BaseModel):
    model_config = ConfigDict(extra="ignore")
    resume_id: str
    user_id: str
    filename: str
    file_content: str  # base64 encoded
    file_type: str  # pdf or docx
    extracted_text: str
    created_at: datetime

class StatusHistoryEntry(BaseModel):
    status: str
    changed_at: datetime
    changed_by: Optional[str] = None

class ScreeningResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    screening_id: str
    user_id: str
    resume_id: str
    job_id: str
    candidate_name: Optional[str] = None
    match_score: int  # 0-100
    experience_score: int  # 0-100
    skills_score: int  # 0-100
    keyword_score: int  # 0-100
    summary: str
    strengths: List[str]
    gaps: List[str]
    key_highlights: List[str]
    recommended_action: str  # Interview, Maybe, Reject
    detailed_analysis: str
    status: str = "new"  # new, shortlisted, interviewed, hired, rejected
    status_history: List[StatusHistoryEntry] = []
    created_at: datetime
    updated_at: datetime

class ScreeningRequest(BaseModel):
    job_id: str
    resume_ids: List[str]

class StatusUpdate(BaseModel):
    status: str  # shortlisted, interviewed, hired, rejected

# Helper function to extract text from PDF
def extract_text_from_pdf(file_content: bytes) -> str:
    try:
        pdf_file = io.BytesIO(file_content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to extract PDF text: {str(e)}")

# Helper function to extract text from DOCX
def extract_text_from_docx(file_content: bytes) -> str:
    try:
        docx_file = io.BytesIO(file_content)
        doc = docx.Document(docx_file)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to extract DOCX text: {str(e)}")

# Helper function to extract candidate name from resume text
def extract_candidate_name(resume_text: str) -> Optional[str]:
    # Simple heuristic: first line or first few words often contain the name
    lines = resume_text.strip().split('\n')
    if lines:
        first_line = lines[0].strip()
        # Return first line if it's short (likely a name)
        if len(first_line) < 50 and not any(char.isdigit() for char in first_line):
            return first_line
    return None

# ATS-style screening with Gemini AI
async def screen_resume_with_ai(resume_text: str, job_data: dict) -> dict:
    try:
        # Build comprehensive prompt for ATS-style analysis
        prompt = f"""You are an expert ATS (Applicant Tracking System) and HR recruiter. Analyze this resume against the job description using ATS-style keyword matching and scoring.

JOB DESCRIPTION:
Title: {job_data['title']}
Department: {job_data.get('department', 'N/A')}
Experience Level Required: {job_data['experience_level']}
Employment Type: {job_data['employment_type']}

Description:
{job_data['description']}

REQUIRED QUALIFICATIONS:
{chr(10).join(f"- {req}" for req in job_data.get('requirements', []))}

NICE-TO-HAVE QUALIFICATIONS:
{chr(10).join(f"- {skill}" for skill in job_data.get('nice_to_have', []))}

RESUME:
{resume_text}

Provide a comprehensive ATS-style analysis in the following JSON format:
{{
    "match_score": <0-100, overall match score>,
    "experience_score": <0-100, based on years and relevance of experience>,
    "skills_score": <0-100, based on required and nice-to-have skills match>,
    "keyword_score": <0-100, based on keyword density and relevance>,
    "summary": "<2-3 sentence overview of candidate fit>",
    "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
    "gaps": ["<gap 1>", "<gap 2>"],
    "key_highlights": ["<highlight 1>", "<highlight 2>", "<highlight 3>"],
    "recommended_action": "<Interview|Maybe|Reject>",
    "detailed_analysis": "<Comprehensive paragraph analyzing experience, skills, education, and overall fit>"
}}

Focus on:
1. Keyword matching between resume and job requirements
2. Experience level alignment (years and relevance)
3. Technical skills match (required vs nice-to-have)
4. Education and certifications relevance
5. Overall cultural and role fit

Be objective and data-driven in your analysis. Return ONLY valid JSON."""

        response = gemini_client.models.generate_content(
            model='gemini-1.5-flash',
            contents=prompt
        )
        response_text = response.text.strip()
        
        # Extract JSON from response (remove markdown code blocks if present)
        if response_text.startswith('```'):
            response_text = re.sub(r'^```(?:json)?\n', '', response_text)
            response_text = re.sub(r'\n```$', '', response_text)
        
        import json
        result = json.loads(response_text)
        
        return result
        
    except Exception as e:
        logging.error(f"AI screening error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI screening failed: {str(e)}")

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

# Google OAuth 2.0 Configuration
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"

@api_router.get("/auth/google/login")
async def google_login():
    """Generate Google OAuth authorization URL and return it."""
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google OAuth is not configured. Set GOOGLE_CLIENT_ID.")
    
    redirect_uri = f"{FRONTEND_URL}/auth/callback"
    state = uuid.uuid4().hex
    
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "state": state,
        "prompt": "consent",
    }
    
    auth_url = f"{GOOGLE_AUTH_URL}?{urlencode(params)}"
    return {"auth_url": auth_url}

@api_router.post("/auth/google/callback")
async def google_callback(request: Request, response: Response):
    """Exchange Google authorization code for tokens and create user session."""
    body = await request.json()
    code = body.get("code")
    
    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")
    
    redirect_uri = f"{FRONTEND_URL}/auth/callback"
    
    try:
        # Exchange authorization code for tokens
        token_response = requests.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
            },
            timeout=10,
        )
        
        if token_response.status_code != 200:
            logging.error(f"Google token exchange failed: {token_response.text}")
            raise HTTPException(status_code=401, detail="Failed to exchange authorization code")
        
        token_data = token_response.json()
        access_token = token_data.get("access_token")
        
        if not access_token:
            raise HTTPException(status_code=401, detail="No access token received from Google")
        
        # Fetch user profile from Google
        userinfo_response = requests.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10,
        )
        
        if userinfo_response.status_code != 200:
            raise HTTPException(status_code=401, detail="Failed to fetch user info from Google")
        
        google_user = userinfo_response.json()
        email = google_user.get("email")
        name = google_user.get("name", email)
        picture = google_user.get("picture")
        
        if not email:
            raise HTTPException(status_code=401, detail="Google account has no email")
        
        # Create or update user in database
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        
        existing_user = await db.users.find_one(
            {"email": email},
            {"_id": 0}
        )
        
        if existing_user:
            user_id = existing_user["user_id"]
            await db.users.update_one(
                {"user_id": user_id},
                {"$set": {
                    "name": name,
                    "picture": picture,
                }}
            )
        else:
            await db.users.insert_one({
                "user_id": user_id,
                "email": email,
                "name": name,
                "picture": picture,
                "created_at": datetime.now(timezone.utc),
            })
        
        # Create session
        session_token = uuid.uuid4().hex
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        await db.user_sessions.insert_one({
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": expires_at,
            "created_at": datetime.now(timezone.utc),
            "google_tokens": {
                "access_token": access_token,
                "refresh_token": token_data.get("refresh_token"),
            },
        })
        
        user_doc = await db.users.find_one(
            {"user_id": user_id},
            {"_id": 0}
        )
        
        # Set the session cookie
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            max_age=7 * 24 * 60 * 60,  # 7 days
            path="/",
        )
        
        return {
            "session_token": session_token,
            "user": user_doc,
        }
    
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Google OAuth error: {str(e)}")

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

# Resume Upload Endpoints

@api_router.post("/resumes/upload")
async def upload_resumes(request: Request, files: List[UploadFile] = File(...)):
    user = await get_user_from_cookie(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    uploaded_resumes = []
    
    for file in files:
        # Validate file type
        if not file.filename.lower().endswith(('.pdf', '.docx')):
            raise HTTPException(status_code=400, detail=f"Invalid file type: {file.filename}. Only PDF and DOCX are supported.")
        
        # Read file content
        file_content = await file.read()
        
        # Validate file size (max 10MB)
        if len(file_content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail=f"File too large: {file.filename}. Maximum size is 10MB.")
        
        # Extract text based on file type
        file_type = 'pdf' if file.filename.lower().endswith('.pdf') else 'docx'
        
        if file_type == 'pdf':
            extracted_text = extract_text_from_pdf(file_content)
        else:
            extracted_text = extract_text_from_docx(file_content)
        
        if not extracted_text or len(extracted_text) < 50:
            raise HTTPException(status_code=400, detail=f"Could not extract sufficient text from {file.filename}")
        
        # Encode file content to base64
        file_content_base64 = base64.b64encode(file_content).decode('utf-8')
        
        # Create resume record
        resume_id = f"resume_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc)
        
        resume_doc = {
            "resume_id": resume_id,
            "user_id": user.user_id,
            "filename": file.filename,
            "file_content": file_content_base64,
            "file_type": file_type,
            "extracted_text": extracted_text,
            "created_at": now
        }
        
        await db.resumes.insert_one(resume_doc)
        
        uploaded_resumes.append({
            "resume_id": resume_id,
            "filename": file.filename,
            "file_type": file_type,
            "text_length": len(extracted_text)
        })
    
    return {
        "message": f"Successfully uploaded {len(uploaded_resumes)} resume(s)",
        "resumes": uploaded_resumes
    }

@api_router.post("/resumes/screen")
async def screen_resumes(request: Request, screening_request: ScreeningRequest):
    user = await get_user_from_cookie(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Get job description
    job = await db.jobs.find_one(
        {"job_id": screening_request.job_id, "user_id": user.user_id},
        {"_id": 0}
    )
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    screening_results = []
    
    for resume_id in screening_request.resume_ids:
        # Get resume
        resume = await db.resumes.find_one(
            {"resume_id": resume_id, "user_id": user.user_id},
            {"_id": 0}
        )
        
        if not resume:
            continue  # Skip if resume not found
        
        # Screen resume with AI
        ai_result = await screen_resume_with_ai(resume['extracted_text'], job)
        
        # Extract candidate name
        candidate_name = extract_candidate_name(resume['extracted_text'])
        
        # Create screening result
        screening_id = f"screening_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc)
        
        screening_doc = {
            "screening_id": screening_id,
            "user_id": user.user_id,
            "resume_id": resume_id,
            "job_id": screening_request.job_id,
            "candidate_name": candidate_name,
            "match_score": ai_result['match_score'],
            "experience_score": ai_result['experience_score'],
            "skills_score": ai_result['skills_score'],
            "keyword_score": ai_result['keyword_score'],
            "summary": ai_result['summary'],
            "strengths": ai_result['strengths'],
            "gaps": ai_result['gaps'],
            "key_highlights": ai_result['key_highlights'],
            "recommended_action": ai_result['recommended_action'],
            "detailed_analysis": ai_result['detailed_analysis'],
            "status": "new",
            "status_history": [{
                "status": "new",
                "changed_at": now,
                "changed_by": user.user_id
            }],
            "created_at": now,
            "updated_at": now
        }
        
        await db.screenings.insert_one(screening_doc)
        
        screening_results.append({
            "screening_id": screening_id,
            "resume_id": resume_id,
            "filename": resume['filename'],
            "candidate_name": candidate_name,
            "match_score": ai_result['match_score'],
            "recommended_action": ai_result['recommended_action']
        })
    
    return {
        "message": f"Successfully screened {len(screening_results)} resume(s)",
        "results": screening_results
    }

@api_router.get("/screenings")
async def list_screenings(
    request: Request, 
    job_id: Optional[str] = None,
    status: Optional[str] = None,
    min_score: Optional[int] = None,
    max_score: Optional[int] = None,
    search: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    user = await get_user_from_cookie(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    query = {"user_id": user.user_id}
    
    # Filter by job
    if job_id:
        query["job_id"] = job_id
    
    # Filter by status
    if status:
        query["status"] = status
    
    # Filter by score range
    if min_score is not None or max_score is not None:
        score_query = {}
        if min_score is not None:
            score_query["$gte"] = min_score
        if max_score is not None:
            score_query["$lte"] = max_score
        if score_query:
            query["match_score"] = score_query
    
    # Filter by date range
    if start_date or end_date:
        date_query = {}
        if start_date:
            date_query["$gte"] = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        if end_date:
            date_query["$lte"] = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        if date_query:
            query["created_at"] = date_query
    
    # Search by candidate name
    if search:
        query["candidate_name"] = {"$regex": search, "$options": "i"}
    
    screenings = await db.screenings.find(query, {"_id": 0}).sort("created_at", -1).to_list(length=None)
    
    # Enrich with job and resume info
    for screening in screenings:
        # Get job info
        job = await db.jobs.find_one(
            {"job_id": screening['job_id']},
            {"_id": 0, "title": 1, "department": 1}
        )
        screening['job_title'] = job['title'] if job else "Unknown"
        screening['job_department'] = job.get('department') if job else None
        
        # Get resume info
        resume = await db.resumes.find_one(
            {"resume_id": screening['resume_id']},
            {"_id": 0, "filename": 1}
        )
        screening['filename'] = resume['filename'] if resume else "Unknown"
    
    return screenings

@api_router.get("/screenings/{screening_id}")
async def get_screening(screening_id: str, request: Request):
    user = await get_user_from_cookie(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    screening = await db.screenings.find_one(
        {"screening_id": screening_id, "user_id": user.user_id},
        {"_id": 0}
    )
    
    if not screening:
        raise HTTPException(status_code=404, detail="Screening not found")
    
    # Get job info
    job = await db.jobs.find_one(
        {"job_id": screening['job_id']},
        {"_id": 0}
    )
    screening['job'] = job
    
    # Get resume info
    resume = await db.resumes.find_one(
        {"resume_id": screening['resume_id']},
        {"_id": 0, "filename": 1, "file_type": 1, "extracted_text": 1}
    )
    screening['resume'] = resume
    
    return screening

@api_router.put("/screenings/{screening_id}/status")
async def update_screening_status(screening_id: str, status_update: StatusUpdate, request: Request):
    user = await get_user_from_cookie(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Validate status
    valid_statuses = ["new", "shortlisted", "interviewed", "hired", "rejected"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
    
    screening = await db.screenings.find_one(
        {"screening_id": screening_id, "user_id": user.user_id},
        {"_id": 0}
    )
    
    if not screening:
        raise HTTPException(status_code=404, detail="Screening not found")
    
    now = datetime.now(timezone.utc)
    status_history = screening.get("status_history", [])
    status_history.append({
        "status": status_update.status,
        "changed_at": now,
        "changed_by": user.user_id
    })
    
    await db.screenings.update_one(
        {"screening_id": screening_id},
        {
            "$set": {
                "status": status_update.status,
                "status_history": status_history,
                "updated_at": now
            }
        }
    )
    
    return {"message": "Status updated successfully", "status": status_update.status}

@api_router.post("/screenings/bulk-update-status")
async def bulk_update_status(request: Request):
    user = await get_user_from_cookie(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    body = await request.json()
    screening_ids = body.get("screening_ids", [])
    new_status = body.get("status")
    
    if not screening_ids or not new_status:
        raise HTTPException(status_code=400, detail="screening_ids and status are required")
    
    valid_statuses = ["new", "shortlisted", "interviewed", "hired", "rejected"]
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
    
    now = datetime.now(timezone.utc)
    updated_count = 0
    
    for screening_id in screening_ids:
        screening = await db.screenings.find_one(
            {"screening_id": screening_id, "user_id": user.user_id}
        )
        if screening:
            status_history = screening.get("status_history", [])
            status_history.append({
                "status": new_status,
                "changed_at": now,
                "changed_by": user.user_id
            })
            
            await db.screenings.update_one(
                {"screening_id": screening_id},
                {
                    "$set": {
                        "status": new_status,
                        "status_history": status_history,
                        "updated_at": now
                    }
                }
            )
            updated_count += 1
    
    return {"message": f"Updated {updated_count} screening(s)", "count": updated_count}

@api_router.get("/screenings/export/csv")
async def export_screenings_csv(request: Request, job_id: Optional[str] = None, status: Optional[str] = None):
    user = await get_user_from_cookie(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    query = {"user_id": user.user_id}
    if job_id:
        query["job_id"] = job_id
    if status:
        query["status"] = status
    
    screenings = await db.screenings.find(query, {"_id": 0}).sort("created_at", -1).to_list(length=None)
    
    # Build CSV content
    import csv
    import io
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "Screening ID", "Candidate Name", "Job ID", "Match Score", "Experience Score",
        "Skills Score", "Keyword Score", "Recommended Action", "Status", "Summary",
        "Strengths", "Gaps", "Key Highlights", "Created At"
    ])
    
    # Rows
    for screening in screenings:
        writer.writerow([
            screening.get('screening_id', ''),
            screening.get('candidate_name', 'N/A'),
            screening.get('job_id', ''),
            screening.get('match_score', 0),
            screening.get('experience_score', 0),
            screening.get('skills_score', 0),
            screening.get('keyword_score', 0),
            screening.get('recommended_action', ''),
            screening.get('status', 'new'),
            screening.get('summary', ''),
            '; '.join(screening.get('strengths', [])),
            '; '.join(screening.get('gaps', [])),
            '; '.join(screening.get('key_highlights', [])),
            screening.get('created_at', '').isoformat() if screening.get('created_at') else ''
        ])
    
    from fastapi.responses import StreamingResponse
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=screening_results.csv"}
    )

@api_router.get("/analytics/dashboard")
async def get_dashboard_analytics(request: Request):
    user = await get_user_from_cookie(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Get all screenings
    all_screenings = await db.screenings.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).to_list(length=None)
    
    # Status breakdown
    status_counts = {
        "new": 0,
        "shortlisted": 0,
        "interviewed": 0,
        "hired": 0,
        "rejected": 0
    }
    
    for screening in all_screenings:
        status = screening.get('status', 'new')
        if status in status_counts:
            status_counts[status] += 1
    
    # Calculate average scores
    total_match_score = 0
    total_experience_score = 0
    total_skills_score = 0
    total_keyword_score = 0
    count = len(all_screenings)
    
    for screening in all_screenings:
        total_match_score += screening.get('match_score', 0)
        total_experience_score += screening.get('experience_score', 0)
        total_skills_score += screening.get('skills_score', 0)
        total_keyword_score += screening.get('keyword_score', 0)
    
    avg_scores = {
        "match_score": round(total_match_score / count, 1) if count > 0 else 0,
        "experience_score": round(total_experience_score / count, 1) if count > 0 else 0,
        "skills_score": round(total_skills_score / count, 1) if count > 0 else 0,
        "keyword_score": round(total_keyword_score / count, 1) if count > 0 else 0
    }
    
    # Get top performing jobs (by average match score)
    job_scores = {}
    for screening in all_screenings:
        job_id = screening.get('job_id')
        if job_id:
            if job_id not in job_scores:
                job_scores[job_id] = {"total": 0, "count": 0}
            job_scores[job_id]["total"] += screening.get('match_score', 0)
            job_scores[job_id]["count"] += 1
    
    top_jobs = []
    for job_id, data in job_scores.items():
        avg_score = data["total"] / data["count"]
        job = await db.jobs.find_one(
            {"job_id": job_id},
            {"_id": 0, "title": 1}
        )
        if job:
            top_jobs.append({
                "job_id": job_id,
                "job_title": job.get('title', 'Unknown'),
                "avg_match_score": round(avg_score, 1),
                "candidate_count": data["count"]
            })
    
    top_jobs.sort(key=lambda x: x["avg_match_score"], reverse=True)
    top_jobs = top_jobs[:5]  # Top 5 jobs
    
    # Calculate conversion rate (hired / total)
    conversion_rate = round((status_counts["hired"] / count * 100), 1) if count > 0 else 0
    
    return {
        "total_screenings": count,
        "status_breakdown": status_counts,
        "average_scores": avg_scores,
        "top_jobs": top_jobs,
        "conversion_rate": conversion_rate
    }


@api_router.get("/resumes")
async def list_resumes(request: Request):
    user = await get_user_from_cookie(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    resumes = await db.resumes.find(
        {"user_id": user.user_id},
        {"_id": 0, "file_content": 0, "extracted_text": 0}  # Exclude large fields
    ).sort("created_at", -1).to_list(length=None)
    
    return resumes

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
