# app/routers/ai.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.models import (
    User, Employee, PerformanceReview, Attendance,
    PromotionRecommendation
)
from app.schemas.schemas import (
    AIQueryRequest, AIQueryResponse, PromotionRecommendationResponse
)
from app.routers.dependencies import get_current_user, get_current_employee, RoleChecker, require_feature_permission
from app.services.ai_service import AIService
import datetime
from datetime import date
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

router = APIRouter(prefix="/ai", tags=["AI Copilot Services"], dependencies=[Depends(require_feature_permission("ai-copilot"))])

ai_service = AIService()

hr_admin_only = Depends(RoleChecker(["hr_admin"]))

@router.post("/query", response_model=AIQueryResponse)
async def query_hrms_engine_assistant(
    payload: AIQueryRequest,
    current_user: User = Depends(get_current_user),
    employee: Employee = Depends(get_current_employee)
):
    """
    Query the HRMS-Engine AI assistant.
    Uses the Groq LPU engine to answer employee Q&A in sub-second latency.
    Injects context of the employee name and organization name to ensure tenant personalization.
    """
    if not payload.query or not payload.query.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query string cannot be empty"
        )

    employee_name = f"{employee.first_name} {employee.last_name}"
    org_name = current_user.organization.name

    answer = await ai_service.query_hr_assistant(
        query=payload.query,
        employee_name=employee_name,
        org_name=org_name
    )

    context_used = ai_service.client is not None
    return AIQueryResponse(answer=answer, context_used=context_used)


# =========================================================================
# AI PROMOTION READYNESS ANALYZER
# =========================================================================

@router.post("/analyze-promotion", response_model=PromotionRecommendationResponse, status_code=status.HTTP_201_CREATED)
async def analyze_employee_promotion(
    employee_id: UUID,
    target_grade: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    _auth = hr_admin_only,
    db: AsyncSession = Depends(get_db)
):
    """
    Run the AI Promotion Readiness score generator. Compiles tenure, LOP history,
    self vs manager rating metrics and returns Llama 3 qualified promotional decisions.
    """
    # 1. Fetch employee
    emp_query = select(Employee).where(
        Employee.id == employee_id,
        Employee.organization_id == current_user.organization_id
    )
    emp_res = await db.execute(emp_query)
    emp = emp_res.scalars().first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee profile not found")

    # 2. Calculate target grade if not passed
    curr_grade = emp.grade if emp.grade else "L1"
    if not target_grade:
        if curr_grade == "L1":
            target_grade = "L2"
        elif curr_grade == "L2":
            target_grade = "L3"
        else:
            target_grade = "L3"  # Cap at L3

    # 3. Calculate Tenure
    tenure_days = (datetime.date.today() - emp.joining_date).days
    tenure_months = float(tenure_days) / 30.44

    # 4. Fetch latest performance reviews
    rev_query = select(PerformanceReview).where(
        PerformanceReview.employee_id == employee_id,
        PerformanceReview.organization_id == current_user.organization_id
    ).order_by(PerformanceReview.created_at.desc())
    rev_res = await db.execute(rev_query)
    reviews = rev_res.scalars().all()

    latest_mgr_rating = 0.0
    latest_self_rating = 0.0
    if reviews:
        latest_mgr_rating = float(reviews[0].manager_rating) if reviews[0].manager_rating else 0.0
        latest_self_rating = float(reviews[0].self_rating) if reviews[0].self_rating else 0.0

    # 5. Fetch attendance LOP days in last 3 months
    three_months_ago = datetime.date.today() - datetime.timedelta(days=90)
    attn_query = select(Attendance).where(
        Attendance.employee_id == employee_id,
        Attendance.organization_id == current_user.organization_id,
        Attendance.date >= three_months_ago
    )
    attn_res = await db.execute(attn_query)
    attendance_logs = attn_res.scalars().all()
    
    late_count = sum(1 for a in attendance_logs if a.late_minutes > 15)
    lop_days = 0.0
    # simple estimate based on attendance logs
    if late_count >= 5:
        lop_days = 1.0
    elif late_count >= 3:
        lop_days = 0.5

    # 6. Gather payload for service
    emp_data = {
        "name": f"{emp.first_name} {emp.last_name}",
        "current_grade": curr_grade,
        "target_grade": target_grade,
        "tenure_months": tenure_months,
        "latest_manager_rating": latest_mgr_rating,
        "latest_self_rating": latest_self_rating,
        "attendance_lop_days": lop_days
    }

    # Run AI evaluation
    result = await ai_service.get_promotion_recommendation(emp_data)

    # 7. Create recommendation entry
    recommender_query = select(Employee).where(Employee.user_id == current_user.id)
    recommender_res = await db.execute(recommender_query)
    recommender = recommender_res.scalars().first()

    rec = PromotionRecommendation(
        organization_id=current_user.organization_id,
        employee_id=emp.id,
        recommended_by=recommender.id if recommender else None,
        current_grade=curr_grade,
        target_grade=target_grade,
        ai_score=Decimal(str(result["score"])),
        ai_summary=result["summary"],
        risk_flags=result["risk_flags"],
        comp_adjustment_pct=Decimal(str(result["comp_adjustment_pct"])),
        status="pending",
        created_at=datetime.datetime.utcnow(),
        updated_at=datetime.datetime.utcnow()
    )
    db.add(rec)
    await db.commit()
    await db.refresh(rec)

    resp = PromotionRecommendationResponse.from_orm(rec)
    resp.employee_name = f"{emp.first_name} {emp.last_name}"
    return resp


@router.get("/promotion-recommendations", response_model=List[PromotionRecommendationResponse])
async def list_promotion_recommendations(
    current_user: User = Depends(get_current_user),
    _auth = hr_admin_only,
    db: AsyncSession = Depends(get_db)
):
    query = select(PromotionRecommendation).where(PromotionRecommendation.organization_id == current_user.organization_id)
    res = await db.execute(query)
    recommendations = res.scalars().all()

    responses = []
    for r in recommendations:
        emp_query = select(Employee).where(Employee.id == r.employee_id)
        emp_res = await db.execute(emp_query)
        emp = emp_res.scalars().first()

        resp = PromotionRecommendationResponse.from_orm(r)
        if emp:
            resp.employee_name = f"{emp.first_name} {emp.last_name}"
        responses.append(resp)
    return responses


@router.put("/promotion-recommendations/{rec_id}/action", response_model=PromotionRecommendationResponse)
async def action_promotion_recommendation(
    rec_id: UUID,
    status_payload: str, # 'approved', 'rejected' passed as query parameter or body
    current_user: User = Depends(get_current_user),
    _auth = hr_admin_only,
    db: AsyncSession = Depends(get_db)
):
    """
    Approve or reject an AI promotion recommendation.
    If approved, the employee's active grade level is dynamically updated in the database.
    """
    query = select(PromotionRecommendation).where(
        PromotionRecommendation.id == rec_id,
        PromotionRecommendation.organization_id == current_user.organization_id
    )
    res = await db.execute(query)
    rec = res.scalars().first()

    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recommendation not found")

    actioner_query = select(Employee).where(Employee.user_id == current_user.id)
    actioner_res = await db.execute(actioner_query)
    actioner = actioner_res.scalars().first()

    rec.status = status_payload
    rec.actioned_by = actioner.id if actioner else None
    rec.actioned_at = datetime.datetime.utcnow()

    emp_query = select(Employee).where(Employee.id == rec.employee_id)
    emp_res = await db.execute(emp_query)
    emp = emp_res.scalars().first()

    if status_payload == "approved" and emp:
        # Dynamically shift employee grade!
        emp.grade = rec.target_grade
        db.add(emp)

    await db.commit()
    await db.refresh(rec)

    resp = PromotionRecommendationResponse.from_orm(rec)
    if emp:
        resp.employee_name = f"{emp.first_name} {emp.last_name}"
    return resp
