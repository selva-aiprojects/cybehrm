# app/routers/talent.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func
from app.db.session import get_db
from app.models.models import (
    User, Employee, RecruitmentPosition, JobPosting,
    TalentCandidate, CallLetter, TalentInterview, OfferLetter, Department, Designation,
    TalentProfile
)
from app.schemas.schemas import (
    RecruitmentPositionCreate, RecruitmentPositionResponse,
    JobPostingCreate, JobPostingResponse,
    TalentCandidateCreate, TalentCandidateResponse,
    CallLetterCreate, CallLetterResponse,
    TalentInterviewCreate, TalentInterviewAction, TalentInterviewResponse,
    OfferLetterCreate, OfferLetterAction, OfferLetterResponse, TokenData,
    EmployeeResponse, TalentProfileCreate, TalentProfileResponse, CandidateMatchResponse,
    OfferProofUpload, RecruitmentAnalyticsResponse
)
from decimal import Decimal
import re
from app.routers.dependencies import get_current_user_claims, RoleChecker, require_subscription, require_feature_permission
from app.services.auth_service import AuthService
from typing import List, Optional
import datetime
import random

router = APIRouter(
    prefix="/talent",
    tags=["Talent Management Suite"],
    dependencies=[Depends(require_subscription("talent_mgmt")), Depends(require_feature_permission("talent-mgmt")), Depends(RoleChecker(["Talent Team", "recruiter"]))]
)

# ---- Pre-compiled resources for JD Matcher (loaded once at module level) ----
MATCHER_STOP_WORDS = {
    'and', 'the', 'for', 'with', 'this', 'that', 'you', 'will', 'are', 'is', 'it', 'in', 'on', 'at', 'of', 'to', 'or', 'as', 'an', 'by',
    'role', 'team', 'work', 'have', 'experience', 'years', 'our', 'from', 'can', 'not', 'all', 'any', 'its', 'was', 'has', 'into', 'etc', 'also',
    'must', 'your', 'should', 'able', 'good', 'use', 'using', 'used', 'include', 'including', 'such', 'both', 'well', 'new', 'may', 'how',
    'key', 'strong', 'develop', 'knowledge', 'skills', 'required', 'preferred', 'job', 'position', 'description', 'requirements', 'minimum',
    'excellent', 'communication', 'working', 'candidate', 'candidates', 'successful', 'company', 'highly', 'ability', 'written', 'verbal',
    'responsibilities', 'duties', 'about', 'join', 'opportunity', 'we', 'us', 'our', 'looking', 'who', 'environment', 'high', 'quality',
    'fast-paced', 'industry', 'standards', 'best', 'practices', 'field', 'related', 'equivalent', 'plus', 'degree', 'bs', 'ms', 'phd',
    'computer', 'science', 'other', 'another', 'many', 'some', 'professional', 'experience', 'track', 'record', 'proven', 'demonstrated',
    'understanding', 'knowledge', 'hands-on', 'hands', 'on', 'familiarity', 'expert', 'intermediate', 'beginner', 'level', 'years',
}

MATCHER_KNOWN_SKILLS = {
    # Engineering / Tech
    "react", "node.js", "node", "python", "django", "fastapi", "postgresql", "aws", "docker", "kubernetes", "typescript",
    "javascript", "html", "css", "java", "spring", "springboot", "go", "golang", "c++", "c#", "net", "ruby", "rails",
    "php", "laravel", "mysql", "mongodb", "redis", "elasticsearch", "git", "github", "gitlab", "ci/cd", "devops",
    "jenkins", "terraform", "ansible", "cloud", "azure", "gcp", "graphql", "rest", "api", "microservices", "qa",
    "selenium", "cypress", "junit", "testing", "automation", "linux", "bash", "shell",
    # Product / Design
    "agile", "scrum", "jira", "confluence", "product strategy", "roadmapping", "ab testing", "figma", "sketch",
    "adobe xd", "photoshop", "illustrator", "ui/ux", "wireframing", "prototyping", "user research", "interaction design",
    # Data / Analytics
    "sql", "pandas", "numpy", "machine learning", "deep learning", "ai", "nlp", "tableau", "powerbi", "r", "spark",
    "hadoop", "data engineering", "data science", "analytics",
    # Human Resources
    "talent acquisition", "recruitment", "employee relations", "hris", "performance management", "onboarding",
    "payroll", "compensation", "benefits", "hiring",
    # Sales / Marketing
    "b2b sales", "crm", "salesforce", "negotiation", "lead generation", "cold calling", "seo", "content marketing",
    "google analytics", "social media", "email campaigns", "marketing strategy",
    # Finance / Business
    "financial modeling", "excel", "accounting", "gaap", "taxation", "budgeting", "risk management", "finance"
}

# Pre-compiled regex patterns for each known skill (avoids re-compilation per profile)
_SKILL_PATTERNS = []
for _skill in MATCHER_KNOWN_SKILLS:
    _escaped = re.escape(_skill)
    if _skill.endswith(('++', '#')):
        _pattern = re.compile(r'\b' + _escaped, re.IGNORECASE)
    elif _skill.startswith('.'):
        _pattern = re.compile(_escaped + r'\b', re.IGNORECASE)
    else:
        _pattern = re.compile(r'\b' + _escaped + r'\b', re.IGNORECASE)
    _SKILL_PATTERNS.append((_skill, _pattern))

MATCHER_MAX_PROFILES = 500
# --------------------------------------------------------------------------------

# --- 1. POSITIONS CRUD ---

@router.get("/positions", response_model=List[RecruitmentPositionResponse])
async def list_positions(
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    query = select(RecruitmentPosition).where(RecruitmentPosition.organization_id == claims.organization_id).order_by(RecruitmentPosition.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/positions", response_model=RecruitmentPositionResponse, status_code=status.HTTP_201_CREATED)
async def create_position(
    payload: RecruitmentPositionCreate,
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    new_position = RecruitmentPosition(
        organization_id=claims.organization_id,
        title=payload.title,
        department_id=payload.department_id,
        location=payload.location,
        vacancies=payload.vacancies if payload.vacancies is not None else 1,
        status="open"
    )
    db.add(new_position)
    await db.commit()
    await db.refresh(new_position)
    return new_position

@router.put("/positions/{position_id}", response_model=RecruitmentPositionResponse)
async def update_position(
    position_id: str,
    payload: RecruitmentPositionCreate,
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    query = select(RecruitmentPosition).where(RecruitmentPosition.id == position_id, RecruitmentPosition.organization_id == claims.organization_id)
    result = await db.execute(query)
    pos = result.scalars().first()
    if not pos:
        raise HTTPException(status_code=404, detail="Recruitment Position not found")
        
    pos.title = payload.title
    pos.department_id = payload.department_id
    pos.location = payload.location
    if payload.vacancies is not None:
        pos.vacancies = payload.vacancies
    pos.updated_at = datetime.datetime.utcnow()
    
    await db.commit()
    await db.refresh(pos)
    return pos

@router.delete("/positions/{position_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_position(
    position_id: str,
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    query = select(RecruitmentPosition).where(RecruitmentPosition.id == position_id, RecruitmentPosition.organization_id == claims.organization_id)
    result = await db.execute(query)
    pos = result.scalars().first()
    if not pos:
        raise HTTPException(status_code=404, detail="Recruitment Position not found")
        
    await db.delete(pos)
    await db.commit()
    return None


# --- 2. JOB POSTINGS CRUD ---

@router.get("/postings", response_model=List[JobPostingResponse])
async def list_job_postings(
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy.orm import selectinload
    query = select(JobPosting).options(selectinload(JobPosting.position)).where(JobPosting.organization_id == claims.organization_id).order_by(JobPosting.created_at.desc())
    result = await db.execute(query)
    postings = result.scalars().all()
    
    responses = []
    for p in postings:
        resp = JobPostingResponse.from_orm(p)
        resp.title = p.position.title if p.position else "Open Position"
        resp.is_active = p.status == "active"
        responses.append(resp)
    return responses

@router.post("/postings", response_model=JobPostingResponse, status_code=status.HTTP_201_CREATED)
async def create_job_posting(
    payload: JobPostingCreate,
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    # Verify position exists and has no postings already
    pos_query = select(RecruitmentPosition).where(RecruitmentPosition.id == payload.position_id, RecruitmentPosition.organization_id == claims.organization_id)
    pos_res = await db.execute(pos_query)
    pos = pos_res.scalars().first()
    if not pos:
        raise HTTPException(status_code=404, detail="Target Recruitment Position not found")
        
    existing_query = select(JobPosting).where(JobPosting.position_id == payload.position_id)
    existing_res = await db.execute(existing_query)
    existing = existing_res.scalars().first()
    if existing:
        existing.description = payload.description
        existing.requirements = payload.requirements or "Not specified"
        existing.experience_range = payload.experience_range
        existing.salary_range = payload.salary_range
        existing.status = "active"
        existing.updated_at = datetime.datetime.utcnow()
        await db.commit()
        await db.refresh(existing)
        resp = JobPostingResponse.from_orm(existing)
        resp.title = pos.title if pos else "Open Position"
        resp.is_active = True
        return resp
        
    new_posting = JobPosting(
        organization_id=claims.organization_id,
        position_id=payload.position_id,
        description=payload.description,
        requirements=payload.requirements or "Not specified",
        experience_range=payload.experience_range,
        salary_range=payload.salary_range,
        status="active"
    )
    db.add(new_posting)
    await db.commit()
    await db.refresh(new_posting)
    
    resp = JobPostingResponse.from_orm(new_posting)
    resp.title = pos.title if pos else "Open Position"
    resp.is_active = new_posting.status == "active"
    return resp

@router.put("/postings/{posting_id}", response_model=JobPostingResponse)
async def update_job_posting(
    posting_id: str,
    payload: JobPostingCreate,
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy.orm import selectinload
    query = select(JobPosting).options(selectinload(JobPosting.position)).where(JobPosting.id == posting_id, JobPosting.organization_id == claims.organization_id)
    result = await db.execute(query)
    post = result.scalars().first()
    if not post:
        raise HTTPException(status_code=404, detail="Job Posting not found")
        
    post.description = payload.description
    post.requirements = payload.requirements or "Not specified"
    post.experience_range = payload.experience_range
    post.salary_range = payload.salary_range
    post.updated_at = datetime.datetime.utcnow()
    
    await db.commit()
    await db.refresh(post)
    
    resp = JobPostingResponse.from_orm(post)
    resp.title = post.position.title if post.position else "Open Position"
    resp.is_active = post.status == "active"
    return resp

@router.delete("/postings/{posting_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job_posting(
    posting_id: str,
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    query = select(JobPosting).where(JobPosting.id == posting_id, JobPosting.organization_id == claims.organization_id)
    result = await db.execute(query)
    post = result.scalars().first()
    if not post:
        raise HTTPException(status_code=404, detail="Job Posting not found")
        
    await db.delete(post)
    await db.commit()
    return None


# --- 3. CANDIDATES CRUD ---

@router.get("/candidates", response_model=List[TalentCandidateResponse])
async def list_candidates(
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    query = select(TalentCandidate).where(TalentCandidate.organization_id == claims.organization_id).order_by(TalentCandidate.applied_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/candidates", response_model=TalentCandidateResponse, status_code=status.HTTP_201_CREATED)
async def create_candidate(
    payload: TalentCandidateCreate,
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    # Verify position exists
    pos_query = select(RecruitmentPosition).where(RecruitmentPosition.id == payload.position_id, RecruitmentPosition.organization_id == claims.organization_id)
    pos_res = await db.execute(pos_query)
    if not pos_res.scalars().first():
        raise HTTPException(status_code=404, detail="Target Recruitment Position not found")
        
    new_candidate = TalentCandidate(
        organization_id=claims.organization_id,
        position_id=payload.position_id,
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=payload.email,
        phone=payload.phone,
        resume_url=payload.resume_url,
        skills=payload.skills,
        status="applied",
        reference_type=payload.reference_type,
        reference_detail=payload.reference_detail
    )
    db.add(new_candidate)
    await db.commit()
    await db.refresh(new_candidate)
    return new_candidate

@router.put("/candidates/{candidate_id}", response_model=TalentCandidateResponse)
async def update_candidate(
    candidate_id: str,
    payload: TalentCandidateCreate,
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    query = select(TalentCandidate).where(TalentCandidate.id == candidate_id, TalentCandidate.organization_id == claims.organization_id)
    result = await db.execute(query)
    cand = result.scalars().first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    cand.first_name = payload.first_name
    cand.last_name = payload.last_name
    cand.email = payload.email
    cand.phone = payload.phone
    cand.resume_url = payload.resume_url
    cand.skills = payload.skills
    cand.updated_at = datetime.datetime.utcnow()
    
    await db.commit()
    await db.refresh(cand)
    return cand

@router.delete("/candidates/{candidate_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_candidate(
    candidate_id: str,
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    query = select(TalentCandidate).where(TalentCandidate.id == candidate_id, TalentCandidate.organization_id == claims.organization_id)
    result = await db.execute(query)
    cand = result.scalars().first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    await db.delete(cand)
    await db.commit()
    return None


# --- 4. CALL LETTERS ---

@router.get("/call-letters", response_model=List[CallLetterResponse])
async def list_call_letters(
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    query = select(CallLetter).where(CallLetter.organization_id == claims.organization_id).order_by(CallLetter.sent_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/call-letters", response_model=CallLetterResponse, status_code=status.HTTP_201_CREATED)
async def send_call_letter(
    payload: CallLetterCreate,
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    # Verify candidate exists
    cand_query = select(TalentCandidate).where(TalentCandidate.id == payload.candidate_id, TalentCandidate.organization_id == claims.organization_id)
    cand_res = await db.execute(cand_query)
    cand = cand_res.scalars().first()
    if not cand:
        raise HTTPException(status_code=404, detail="Target Candidate not found")
        
    new_call_letter = CallLetter(
        organization_id=claims.organization_id,
        candidate_id=payload.candidate_id,
        interview_date=payload.interview_date,
        location_or_link=payload.location_or_link,
        email_content=payload.email_content
    )
    
    if cand.status in ["rejected", "offered", "accepted", "onboarded"]:
        raise HTTPException(status_code=400, detail="Cannot issue a call letter for a candidate in the current status.")

    # Update candidate status
    cand.status = "interview_scheduled"
    cand.updated_at = datetime.datetime.utcnow()
    
    db.add(new_call_letter)
    await db.commit()
    await db.refresh(new_call_letter)
    return new_call_letter


# --- 5. INTERVIEWS PROCESS ---

@router.get("/interviews", response_model=List[TalentInterviewResponse])
async def list_interviews(
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    query = select(TalentInterview).where(TalentInterview.organization_id == claims.organization_id).order_by(TalentInterview.scheduled_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/interviews", response_model=TalentInterviewResponse, status_code=status.HTTP_201_CREATED)
async def schedule_interview(
    payload: TalentInterviewCreate,
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    # Verify candidate exists
    cand_query = select(TalentCandidate).where(TalentCandidate.id == payload.candidate_id, TalentCandidate.organization_id == claims.organization_id)
    cand_res = await db.execute(cand_query)
    cand = cand_res.scalars().first()
    if not cand:
        raise HTTPException(status_code=404, detail="Target Candidate not found")

    if cand.status in ["rejected", "offered", "accepted", "onboarded"]:
        raise HTTPException(status_code=400, detail="Cannot schedule an interview for a candidate in the current status.")
        
    new_interview = TalentInterview(
        organization_id=claims.organization_id,
        candidate_id=payload.candidate_id,
        interviewer_id=payload.interviewer_id,
        interview_round=payload.interview_round,
        scheduled_at=payload.scheduled_at,
        status="scheduled"
    )
    
    cand.status = "interview_scheduled"
    cand.updated_at = datetime.datetime.utcnow()
    
    db.add(new_interview)
    await db.commit()
    await db.refresh(new_interview)
    return new_interview

@router.post("/interviews/{interview_id}/action", response_model=TalentInterviewResponse)
async def grade_interview(
    interview_id: str,
    payload: TalentInterviewAction,
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    query = select(TalentInterview).where(TalentInterview.id == interview_id, TalentInterview.organization_id == claims.organization_id)
    result = await db.execute(query)
    interview = result.scalars().first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
        
    interview.score = payload.score
    interview.feedback = payload.feedback
    interview.status = payload.status
    interview.updated_at = datetime.datetime.utcnow()
    
    # Update Candidate status to interviewed
    cand_query = select(TalentCandidate).where(TalentCandidate.id == interview.candidate_id)
    cand_res = await db.execute(cand_query)
    cand = cand_res.scalars().first()
    if cand and cand.status == "interview_scheduled":
        cand.status = "interviewed"
        cand.updated_at = datetime.datetime.utcnow()
        
    await db.commit()
    await db.refresh(interview)
    return interview


# --- 6. SELECTION PROCESS (STATUS TOGGLES) ---

@router.post("/candidates/{candidate_id}/select", response_model=TalentCandidateResponse)
async def select_candidate(
    candidate_id: str,
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    query = select(TalentCandidate).where(TalentCandidate.id == candidate_id, TalentCandidate.organization_id == claims.organization_id)
    result = await db.execute(query)
    cand = result.scalars().first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")

    if cand.status in ["rejected", "offered", "accepted", "onboarded"]:
        raise HTTPException(status_code=400, detail="Candidate cannot be moved to selected from the current status.")
        
    cand.status = "selected"
    cand.updated_at = datetime.datetime.utcnow()
    await db.commit()
    await db.refresh(cand)
    return cand

@router.post("/candidates/{candidate_id}/reject", response_model=TalentCandidateResponse)
async def reject_candidate(
    candidate_id: str,
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    query = select(TalentCandidate).where(TalentCandidate.id == candidate_id, TalentCandidate.organization_id == claims.organization_id)
    result = await db.execute(query)
    cand = result.scalars().first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    cand.status = "rejected"
    cand.updated_at = datetime.datetime.utcnow()
    await db.commit()
    await db.refresh(cand)
    return cand


# --- 7. OFFER LETTERS ---

@router.get("/offers", response_model=List[OfferLetterResponse])
async def list_offers(
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    query = select(OfferLetter).where(OfferLetter.organization_id == claims.organization_id).order_by(OfferLetter.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/offers", response_model=OfferLetterResponse, status_code=status.HTTP_201_CREATED)
async def generate_offer_letter(
    payload: OfferLetterCreate,
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    # Verify candidate exists and is selected
    cand_query = select(TalentCandidate).where(TalentCandidate.id == payload.candidate_id, TalentCandidate.organization_id == claims.organization_id)
    cand_res = await db.execute(cand_query)
    cand = cand_res.scalars().first()
    if not cand:
        raise HTTPException(status_code=404, detail="Target Candidate not found")

    if cand.status != "selected":
        raise HTTPException(status_code=400, detail="Offer can only be generated for a selected candidate.")
        
    existing = select(OfferLetter).where(OfferLetter.candidate_id == payload.candidate_id)
    ex_res = await db.execute(existing)
    if ex_res.scalars().first():
        raise HTTPException(status_code=400, detail="An Offer Letter already exists for this candidate")
        
    new_offer = OfferLetter(
        organization_id=claims.organization_id,
        candidate_id=payload.candidate_id,
        joining_date=payload.joining_date,
        offered_salary=payload.offered_salary,
        employment_type=payload.employment_type if payload.employment_type is not None else 'full-time',
        grade=payload.grade if payload.grade is not None else 'L1',
        designation_id=payload.designation_id,
        department_id=payload.department_id,
        offer_status="sent",
        expiry_date=payload.expiry_date
    )
    
    cand.status = "offered"
    cand.updated_at = datetime.datetime.utcnow()
    
    db.add(new_offer)
    await db.commit()
    await db.refresh(new_offer)

    # Fetch Designation Title for Email formatting
    designation_title = "Selected Candidate Role"
    if payload.designation_id:
        desg_query = select(Designation).where(Designation.id == payload.designation_id)
        desg_res = await db.execute(desg_query)
        desg = desg_res.scalars().first()
        if desg:
            designation_title = desg.title

    # Send out the official email to candidate via Resend API
    if cand.email:
        try:
            from app.services.email_service import send_offer_email
            send_offer_email(
                candidate_email=cand.email,
                candidate_name=f"{cand.first_name} {cand.last_name}",
                job_title=designation_title,
                salary=float(new_offer.offered_salary),
                joining_date=new_offer.joining_date.strftime("%Y-%m-%d"),
                expiry_date=new_offer.expiry_date.strftime("%Y-%m-%d") if new_offer.expiry_date else "N/A"
            )
        except Exception as e:
            # log warning but do not fail the request
            print(f"Warn: Offer email dispatch failed: {e}")

    return new_offer

@router.post("/offers/{offer_id}/action", response_model=OfferLetterResponse)
async def action_offer_letter(
    offer_id: str,
    payload: OfferLetterAction,
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    query = select(OfferLetter).where(OfferLetter.id == offer_id, OfferLetter.organization_id == claims.organization_id)
    result = await db.execute(query)
    offer = result.scalars().first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer Letter not found")
        
    offer.offer_status = payload.offer_status
    offer.actioned_at = datetime.datetime.utcnow()
    offer.updated_at = datetime.datetime.utcnow()
    
    # Update candidate status
    cand_query = select(TalentCandidate).where(TalentCandidate.id == offer.candidate_id)
    cand_res = await db.execute(cand_query)
    cand = cand_res.scalars().first()
    if cand:
        if payload.offer_status == "accepted":
            cand.status = "accepted"
        elif payload.offer_status == "rejected":
            cand.status = "rejected"
        elif payload.offer_status in ["cancelled", "closed"]:
            cand.status = "selected"  # returns back to selected state in pipeline
        cand.updated_at = datetime.datetime.utcnow()
        
    await db.commit()
    await db.refresh(offer)
    return offer

@router.post("/offers/{offer_id}/upload-proof", response_model=OfferLetterResponse)
async def upload_offer_proof(
    offer_id: str,
    payload: OfferProofUpload,
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    query = select(OfferLetter).where(OfferLetter.id == offer_id, OfferLetter.organization_id == claims.organization_id)
    result = await db.execute(query)
    offer = result.scalars().first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer Letter not found")
        
    offer.proof_attachment = payload.proof_attachment
    offer.proof_attachment_name = payload.proof_attachment_name
    offer.updated_at = datetime.datetime.utcnow()
    
    await db.commit()
    await db.refresh(offer)
    return offer


# --- 8. ONBOARDING TRIGGER (PROMOTE CANDIDATE TO EMPLOYEE) ---

@router.post("/candidates/{candidate_id}/onboard", response_model=EmployeeResponse)
async def onboard_candidate(
    candidate_id: str,
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    """
    Onboard an accepted candidate, generating their standard core Employee profile
    and active User credential account seamlessly.
    """
    cand_query = select(TalentCandidate).where(TalentCandidate.id == candidate_id, TalentCandidate.organization_id == claims.organization_id)
    cand_res = await db.execute(cand_query)
    cand = cand_res.scalars().first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    # Find active offer letter
    offer_query = select(OfferLetter).where(OfferLetter.candidate_id == candidate_id)
    offer_res = await db.execute(offer_query)
    offer = offer_res.scalars().first()
    if not offer:
        raise HTTPException(status_code=400, detail="Candidate does not have an Offer Letter drafted yet")
        
    if cand.status == "onboarded" or offer.offer_status == "onboarded":
        raise HTTPException(status_code=400, detail="This candidate has already been onboarded")

    if cand.status != "accepted" or offer.offer_status != "accepted":
        raise HTTPException(status_code=400, detail="Candidate must have accepted the offer before onboarding.")
        
    # Check that candidate email does not exist in users
    user_check = select(User).where(User.email == cand.email)
    user_check_res = await db.execute(user_check)
    if user_check_res.scalars().first():
        raise HTTPException(status_code=400, detail="A user with this candidate's email is already registered")

    # Generate sequential unique business Employee ID
    emp_count_query = select(func.count(Employee.id)).where(Employee.organization_id == claims.organization_id)
    emp_count_res = await db.execute(emp_count_query)
    count = emp_count_res.scalar() or 0
    generated_employee_id = f"EMP-{1001 + count}"
    
    # Check if this generated employee ID already exists to avoid collisions
    id_check = select(Employee).where(Employee.employee_id == generated_employee_id, Employee.organization_id == claims.organization_id)
    id_check_res = await db.execute(id_check)
    if id_check_res.scalars().first():
        # Fallback to random padding if collision detected
        generated_employee_id = f"EMP-{random.randint(2000, 9999)}"

    # 1. Create User credentials
    hashed_pwd = AuthService.hash_password("Welcome@123") # Standard default password
    new_user = User(
        organization_id=claims.organization_id,
        email=cand.email,
        password_hash=hashed_pwd,
        role="employee",
        is_active=True
    )
    db.add(new_user)
    await db.flush() # Populate user.id

    # 2. Create Employee profile
    new_employee = Employee(
        organization_id=claims.organization_id,
        user_id=new_user.id,
        employee_id=generated_employee_id,
        first_name=cand.first_name,
        last_name=cand.last_name,
        phone=cand.phone,
        department_id=offer.department_id,
        designation_id=offer.designation_id,
        joining_date=offer.joining_date,
        employment_type=offer.employment_type,
        employment_status="active",
        grade=offer.grade
    )
    db.add(new_employee)
    await db.flush()

    # 3. Update candidate and offer status
    cand.status = "onboarded"
    cand.updated_at = datetime.datetime.utcnow()
    offer.offer_status = "onboarded"
    offer.updated_at = datetime.datetime.utcnow()

    # 4. Close the filled recruitment position and any active job posting
    position_query = select(RecruitmentPosition).where(
        RecruitmentPosition.id == cand.position_id,
        RecruitmentPosition.organization_id == claims.organization_id
    )
    position_res = await db.execute(position_query)
    position = position_res.scalars().first()
    if position:
        position.status = "closed"
        position.updated_at = datetime.datetime.utcnow()

        posting_query = select(JobPosting).where(
            JobPosting.position_id == position.id,
            JobPosting.organization_id == claims.organization_id
        )
        posting_res = await db.execute(posting_query)
        posting = posting_res.scalars().first()
        if posting and posting.status == "active":
            posting.status = "expired"
            posting.updated_at = datetime.datetime.utcnow()

    # 5. Initialize sample Leave Balance for the new employee
    leave_types = ["casual", "sick", "earned"]
    allocations = {"casual": 12.0, "sick": 10.0, "earned": 15.0}
    current_year = datetime.datetime.now().year
    
    from app.models.models import LeaveBalance
    for lt in leave_types:
        bal = LeaveBalance(
            organization_id=claims.organization_id,
            employee_id=new_employee.id,
            year=current_year,
            leave_type=lt,
            allocated=allocations[lt],
            used=0.0
        )
        db.add(bal)

    # 5. Initialize default Induction Tasks for the new employee
    default_tasks = [
        ("IT System Provisioning", "Provision workplace laptop, email inbox, Slack access, and development accounts."),
        ("HR Induction & Compliance Signoff", "Verify original certificates, complete handbook acknowledgment, and sign security policies."),
        ("Workspace Setup & ID Card Issue", "Allocate physical seat/desk location, register biometric profile, and print official ID card."),
        ("Finance Bank Account Setup", "Log employee savings bank details, PAN card compliance, and register EPF/UAN portal accounts.")
    ]
    from app.models.models import InductionTask
    for name, desc in default_tasks:
        task = InductionTask(
            organization_id=claims.organization_id,
            employee_id=new_employee.id,
            task_name=name,
            description=desc,
            status="pending"
        )
        db.add(task)

    await db.commit()
    
    # Refresh to load relationships
    # We will fetch the completed employee and return it
    from sqlalchemy.orm import selectinload
    final_emp_query = select(Employee).options(
        selectinload(Employee.functional_title),
        selectinload(Employee.skillsets),
        selectinload(Employee.work_experiences),
        selectinload(Employee.academic_qualifications),
        selectinload(Employee.project_allocations),
        selectinload(Employee.contractor_details),
        selectinload(Employee.assets),
        selectinload(Employee.induction_tasks)
    ).where(Employee.id == new_employee.id)
    final_emp_res = await db.execute(final_emp_query)
    emp_response = final_emp_res.scalars().first()
    
    # Inject email into response manually for EmployeeResponse
    emp_response.email = cand.email
    return emp_response


# --- 9. TALENT DATABASE & NLP MATCHING ---

@router.post("/profiles", response_model=TalentProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_talent_profile(
    payload: TalentProfileCreate,
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    """
    Ingest a new clean resume/profile into the Talent Database.
    """
    new_profile = TalentProfile(
        organization_id=claims.organization_id,
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=payload.email,
        phone=payload.phone,
        resume_url=payload.resume_url,
        skills=payload.skills,
        experience_summary=payload.experience_summary,
        raw_resume_text=payload.raw_resume_text,
        reference_type=payload.reference_type,
        reference_detail=payload.reference_detail
    )
    db.add(new_profile)
    await db.commit()
    await db.refresh(new_profile)
    return new_profile

@router.get("/profiles", response_model=List[TalentProfileResponse])
async def get_talent_profiles(
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve all profiles in the Talent Database.
    """
    query = select(TalentProfile).where(TalentProfile.organization_id == claims.organization_id).order_by(TalentProfile.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/analytics/pipeline", response_model=RecruitmentAnalyticsResponse)
async def get_recruitment_pipeline_analytics(
    position_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    """
    Recruitment pipeline analytics: candidate counts, stage distribution, with filters and search.
    """
    org_id = claims.organization_id

    # Base query
    base_query = select(TalentCandidate).where(TalentCandidate.organization_id == org_id)

    if position_id:
        base_query = base_query.where(TalentCandidate.position_id == position_id)

    if search:
        base_query = base_query.where(
            TalentCandidate.first_name.ilike(f"%{search}%") |
            TalentCandidate.last_name.ilike(f"%{search}%") |
            TalentCandidate.email.ilike(f"%{search}%")
        )

    # Total candidates
    total_q = await db.execute(
        select(func.count()).select_from(base_query.subquery())
    )
    total_candidates = total_q.scalar() or 0

    # Stage counts
    stage_q = await db.execute(
        select(TalentCandidate.status, func.count(TalentCandidate.id))
        .where(TalentCandidate.organization_id == org_id)
        .group_by(TalentCandidate.status)
    )
    stage_counts = [{"stage": r[0], "count": r[1]} for r in stage_q.fetchall()]

    # Pipeline summary
    pipeline_summary = {}
    for s in stage_counts:
        pipeline_summary[s["stage"]] = s["count"]

    return {
        "total_candidates": total_candidates,
        "stage_counts": stage_counts,
        "pipeline_summary": pipeline_summary
    }


def _matcher_tokenize(text: str) -> set:
    if not text:
        return set()
    tokens = set(re.findall(r'\b[a-z][a-z0-9+#.\-]{1,}\b', text.lower()))
    return tokens - MATCHER_STOP_WORDS

def _matcher_extract_skills(text: str) -> set:
    if not text:
        return set()
    found = set()
    text_lower = text.lower()
    for skill, pattern in _SKILL_PATTERNS:
        if pattern.search(text_lower):
            found.add(skill)
    return found

@router.get("/jobs/{job_id}/match", response_model=List[CandidateMatchResponse])
async def match_candidates_for_job(
    job_id: str,
    min_score: float = 20.0,
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    """
    Match profiles in the Talent Database against a specific Job Posting.

    Scoring Algorithm (Weighted Multi-Factor):
    - Technical Skills Match  : 60% weight (based on exact matching known skills in JD vs Resume)
    - Experience Summary Match: 20% weight (Jaccard similarity on clean, non-stop-word tokens)
    - General Keyword Density : 20% weight (overall vocabulary overlap excluding stop-words)
    - Soft penalty applied if candidate is missing >50% of required technical skills
    - Minimum threshold filter (default 20%) — low matches are excluded
    - Processes up to 500 profiles per request to prevent timeouts
    """
    # 1. Fetch Job Posting
    job_query = select(JobPosting).where(
        JobPosting.id == job_id,
        JobPosting.organization_id == claims.organization_id
    )
    job_result = await db.execute(job_query)
    job = job_result.scalars().first()

    if not job:
        raise HTTPException(status_code=404, detail="Job Posting not found")

    # 2. Extract technical skills and general description keywords from JD
    job_req_skills = _matcher_extract_skills(job.requirements)
    if not job_req_skills:
        job_req_skills = _matcher_extract_skills(job.description)

    jd_desc_tokens = _matcher_tokenize(job.description)
    jd_all_tokens = _matcher_tokenize(f"{job.description} {job.requirements}")

    # 3. Fetch profiles with limit to prevent memory/timeout issues
    profiles_query = (
        select(TalentProfile)
        .where(TalentProfile.organization_id == claims.organization_id)
        .limit(MATCHER_MAX_PROFILES)
    )
    profiles_result = await db.execute(profiles_query)
    profiles = profiles_result.scalars().all()

    matches = []
    for profile in profiles:
        # Extract candidate skills (single combined call for resume text)
        cand_explicit_skills = _matcher_extract_skills(profile.skills or "")
        cand_resume_skills = _matcher_extract_skills(f"{profile.experience_summary or ''} {profile.raw_resume_text or ''}")
        cand_all_skills = cand_explicit_skills | cand_resume_skills

        # Extract general words for context matching
        cand_exp_tokens = _matcher_tokenize(profile.experience_summary or "")
        cand_all_tokens = _matcher_tokenize(f"{profile.skills or ''} {profile.experience_summary or ''} {profile.raw_resume_text or ''}")

        # ---- Factor A: Required Technical Skills Match (60% weight) ----
        if job_req_skills:
            matched_req_skills = job_req_skills & cand_all_skills
            missing_req_skills = job_req_skills - cand_all_skills
            factor_a_raw = len(matched_req_skills) / len(job_req_skills)

            if factor_a_raw < 0.5:
                factor_a_raw *= 0.5
        else:
            matched_req_skills = set()
            missing_req_skills = set()
            factor_a_raw = 0.5

        # ---- Factor B: Experience Context Alignment (20% weight) ----
        if jd_desc_tokens and cand_exp_tokens:
            matched_exp = jd_desc_tokens & cand_exp_tokens
            factor_b_raw = len(matched_exp) / len(jd_desc_tokens)
        else:
            factor_b_raw = 0.0

        # ---- Factor C: General Keyword Density (20% weight) ----
        if jd_all_tokens and cand_all_tokens:
            matched_general = jd_all_tokens & cand_all_tokens
            factor_c_raw = len(matched_general) / len(jd_all_tokens)
        else:
            factor_c_raw = 0.0

        # ---- Weighted Composite Score ----
        composite = (factor_a_raw * 0.60) + (factor_b_raw * 0.20) + (factor_c_raw * 0.20)
        final_score = round(min(composite * 100.0, 100.0), 2)

        if final_score < min_score:
            continue

        if final_score >= 70:
            confidence = "high"
        elif final_score >= 40:
            confidence = "medium"
        else:
            confidence = "low"

        top_matched = list(matched_req_skills | (cand_explicit_skills & MATCHER_KNOWN_SKILLS))[:12]
        top_missing = list(missing_req_skills)[:8]

        matches.append(
            CandidateMatchResponse(
                profile=profile,
                match_percentage=Decimal(str(final_score)).quantize(Decimal('0.01')),
                matched_skills=sorted(top_matched),
                missing_skills=sorted(top_missing),
                confidence_level=confidence,
                match_breakdown={
                    "required_skills_score": round(factor_a_raw * 100, 1),
                    "experience_score": round(min(factor_b_raw * 100, 100.0), 1),
                    "general_keyword_score": round(min(factor_c_raw * 100, 100.0), 1),
                }
            )
        )

    matches.sort(key=lambda x: x.match_percentage, reverse=True)
    return matches

