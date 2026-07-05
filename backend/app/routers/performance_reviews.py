# app/routers/performance_reviews.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.models import User, Employee, PerformanceKRA, PerformanceReview
from app.schemas.schemas import (
    PerformanceKRACreate, PerformanceKRAResponse,
    PerformanceReviewCreate, PerformanceReviewResponse,
    PerformanceReviewAction, PerformanceCycleInitiate, PerformanceTeamReminder
)
from app.services.email_service import (
    send_kra_cycle_initiation_email,
    send_manager_kra_reminder_email,
    send_self_review_submitted_email,
    send_manager_review_completed_email,
    send_final_ratings_published_email
)
from app.routers.dependencies import get_current_user, get_current_employee, RoleChecker, require_subscription, require_feature_permission
import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

router = APIRouter(prefix="/performance", tags=["Performance & Appraisals"], dependencies=[Depends(require_subscription("resource_mgmt")), Depends(require_feature_permission("appraisals"))])

manager_or_admin = Depends(RoleChecker(["hr_admin", "manager"]))

# =========================================================================
# 0. CYCLE INITIATION & EMAIL COMMUNICATION (HR & MANAGER FLOWS)
# =========================================================================

@router.post("/cycles/initiate", status_code=status.HTTP_200_OK)
async def initiate_kra_cycle(
    payload: PerformanceCycleInitiate,
    current_user: User = Depends(get_current_user),
    _auth = Depends(RoleChecker(["super_admin", "hr_admin"])),
    db: AsyncSession = Depends(get_db)
):
    """
    1. HR Operations initiates Goal/KRA settings for each 6 months period.
    Broadcasts email notification to all employees in the organization.
    """
    query = select(Employee).where(
        Employee.organization_id == current_user.organization_id,
        Employee.employment_status == "active"
    )
    res = await db.execute(query)
    employees = res.scalars().all()

    sent_count = 0
    target_str = payload.target_date.strftime("%Y-%m-%d") if payload.target_date else "As soon as possible"

    for emp in employees:
        email = None
        if emp.user_id:
            user_q = select(User).where(User.id == emp.user_id)
            user_res = await db.execute(user_q)
            u = user_res.scalars().first()
            if u:
                email = u.email
        if not email:
            email = f"{emp.first_name.lower()}.{emp.last_name.lower()}@organization.com"

        emp_name = f"{emp.first_name} {emp.last_name}"
        sent = send_kra_cycle_initiation_email(
            to_email=email,
            employee_name=emp_name,
            cycle_name=payload.cycle_name,
            target_date=target_str,
            custom_message=payload.custom_message
        )
        if sent:
            sent_count += 1

    return {
        "status": "success",
        "message": f"KRA/Goal cycle '{payload.cycle_name}' initiated successfully.",
        "total_employees": len(employees),
        "emails_sent": sent_count
    }


@router.post("/kras/initiate-team", status_code=status.HTTP_200_OK)
async def initiate_team_kras(
    payload: PerformanceTeamReminder,
    employee: Employee = Depends(get_current_employee),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    2. Manager initiates KRA settings for their team.
    Sends formal communication email to team members to complete goal settings.
    """
    if current_user.role in ["super_admin", "hr_admin"]:
        query = select(Employee).where(
            Employee.organization_id == employee.organization_id,
            Employee.id != employee.id,
            Employee.employment_status == "active"
        )
    else:
        query = select(Employee).where(
            Employee.manager_id == employee.id,
            Employee.employment_status == "active"
        )
    
    res = await db.execute(query)
    reports = res.scalars().all()

    sent_count = 0
    manager_name = f"{employee.first_name} {employee.last_name}"
    target_str = payload.target_date.strftime("%Y-%m-%d") if payload.target_date else "Within 7 days"

    for rep in reports:
        email = None
        if rep.user_id:
            user_q = select(User).where(User.id == rep.user_id)
            user_res = await db.execute(user_q)
            u = user_res.scalars().first()
            if u:
                email = u.email
        if not email:
            email = f"{rep.first_name.lower()}.{rep.last_name.lower()}@organization.com"

        rep_name = f"{rep.first_name} {rep.last_name}"
        sent = send_manager_kra_reminder_email(
            to_email=email,
            employee_name=rep_name,
            manager_name=manager_name,
            cycle_name=payload.cycle_name,
            target_date=target_str,
            custom_message=payload.custom_message
        )
        if sent:
            sent_count += 1

    return {
        "status": "success",
        "message": f"Formal KRA goal setting reminder sent to team members.",
        "team_members": len(reports),
        "emails_sent": sent_count
    }


# =========================================================================
# 1. KRA MANAGEMENT
# =========================================================================

@router.post("/kras", response_model=PerformanceKRAResponse, status_code=status.HTTP_201_CREATED)
async def create_kra(
    payload: PerformanceKRACreate,
    employee: Employee = Depends(get_current_employee),
    db: AsyncSession = Depends(get_db)
):
    """
    Configure a key result area (KRA) with a weightage (e.g. 25 for 25%).
    """
    # Check total weightage so far
    weight_query = select(PerformanceKRA).where(PerformanceKRA.employee_id == employee.id)
    weight_res = await db.execute(weight_query)
    existing_kras = weight_res.scalars().all()
    
    total_weight = sum(k.weightage for k in existing_kras) + payload.weightage
    if total_weight > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Total KRA weightage cannot exceed 100%. Current sum: {total_weight - payload.weightage}%"
        )

    kra = PerformanceKRA(
        organization_id=employee.organization_id,
        employee_id=employee.id,
        title=payload.title,
        description=payload.description,
        weightage=payload.weightage,
        target_date=payload.target_date,
        created_at=datetime.datetime.utcnow(),
        updated_at=datetime.datetime.utcnow()
    )
    db.add(kra)
    await db.commit()
    await db.refresh(kra)
    return kra


@router.get("/kras/me", response_model=List[PerformanceKRAResponse])
async def get_my_kras(
    employee: Employee = Depends(get_current_employee),
    db: AsyncSession = Depends(get_db)
):
    query = select(PerformanceKRA).where(PerformanceKRA.employee_id == employee.id)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/kras/{emp_id}", response_model=List[PerformanceKRAResponse])
async def get_employee_kras(
    emp_id: UUID,
    current_user: User = Depends(get_current_user),
    _auth = manager_or_admin,
    db: AsyncSession = Depends(get_db)
):
    """
    HR/Manager view to retrieve specific employee KRAs.
    """
    query = select(PerformanceKRA).where(
        PerformanceKRA.employee_id == emp_id,
        PerformanceKRA.organization_id == current_user.organization_id
    )
    result = await db.execute(query)
    return result.scalars().all()


# =========================================================================
# 2. PERFORMANCE APPRAISAL REVIEWS & BELL CURVE
# =========================================================================

@router.post("/reviews", response_model=PerformanceReviewResponse, status_code=status.HTTP_201_CREATED)
async def submit_self_review(
    payload: PerformanceReviewCreate,
    employee: Employee = Depends(get_current_employee),
    db: AsyncSession = Depends(get_db)
):
    """
    Employee submits quarterly appraisal self-ratings and qualitative feedback.
    """
    query = select(PerformanceReview).where(
        PerformanceReview.employee_id == employee.id,
        PerformanceReview.review_cycle == payload.review_cycle
    )
    res = await db.execute(query)
    review = res.scalars().first()

    if review:
        review.self_rating = payload.self_rating
        review.self_feedback = payload.self_feedback
        review.status = "self_reviewed"
    else:
        review = PerformanceReview(
            organization_id=employee.organization_id,
            employee_id=employee.id,
            review_cycle=payload.review_cycle,
            self_rating=payload.self_rating,
            self_feedback=payload.self_feedback,
            status="self_reviewed",
            created_at=datetime.datetime.utcnow(),
            updated_at=datetime.datetime.utcnow()
        )
        db.add(review)

    await db.commit()
    await db.refresh(review)
    
    # 3. Trigger notification email to employee and their manager
    emp_name = f"{employee.first_name} {employee.last_name}"
    emp_email = None
    if employee.user_id:
        u_q = select(User).where(User.id == employee.user_id)
        u_res = await db.execute(u_q)
        u = u_res.scalars().first()
        if u:
            emp_email = u.email
    if not emp_email:
        emp_email = f"{employee.first_name.lower()}.{employee.last_name.lower()}@organization.com"
    
    send_self_review_submitted_email(emp_email, emp_name, emp_name, payload.review_cycle, is_to_manager=False)

    if employee.manager_id:
        mgr_q = select(Employee).where(Employee.id == employee.manager_id)
        mgr_res = await db.execute(mgr_q)
        mgr = mgr_res.scalars().first()
        if mgr:
            mgr_name = f"{mgr.first_name} {mgr.last_name}"
            mgr_email = None
            if mgr.user_id:
                mu_q = select(User).where(User.id == mgr.user_id)
                mu_res = await db.execute(mu_q)
                mu = mu_res.scalars().first()
                if mu:
                    mgr_email = mu.email
            if not mgr_email:
                mgr_email = f"{mgr.first_name.lower()}.{mgr.last_name.lower()}@organization.com"
            send_self_review_submitted_email(mgr_email, mgr_name, emp_name, payload.review_cycle, is_to_manager=True)

    resp = PerformanceReviewResponse.from_orm(review)
    resp.employee_name = emp_name
    return resp


@router.get("/reviews/me", response_model=List[PerformanceReviewResponse])
async def get_my_reviews(
    employee: Employee = Depends(get_current_employee),
    db: AsyncSession = Depends(get_db)
):
    query = select(PerformanceReview).where(PerformanceReview.employee_id == employee.id)
    res = await db.execute(query)
    reviews = res.scalars().all()

    responses = []
    for r in reviews:
        resp = PerformanceReviewResponse.from_orm(r)
        resp.employee_name = f"{employee.first_name} {employee.last_name}"
        responses.append(resp)
    return responses


@router.get("/reviews", response_model=List[PerformanceReviewResponse])
async def list_all_reviews(
    current_user: User = Depends(get_current_user),
    _auth = manager_or_admin,
    db: AsyncSession = Depends(get_db)
):
    """
    Manager/HR Dashboard listing all appraisal reviews for normalization.
    """
    query = select(PerformanceReview).where(PerformanceReview.organization_id == current_user.organization_id)
    res = await db.execute(query)
    reviews = res.scalars().all()

    responses = []
    for r in reviews:
        emp_query = select(Employee).where(Employee.id == r.employee_id)
        emp_res = await db.execute(emp_query)
        emp = emp_res.scalars().first()
        
        resp = PerformanceReviewResponse.from_orm(r)
        if emp:
            resp.employee_name = f"{emp.first_name} {emp.last_name}"
        responses.append(resp)
    return responses


@router.put("/reviews/{review_id}/manager-review", response_model=PerformanceReviewResponse)
async def submit_manager_review(
    review_id: UUID,
    payload: PerformanceReviewAction,
    current_user: User = Depends(get_current_user),
    _auth = manager_or_admin,
    db: AsyncSession = Depends(get_db)
):
    """
    Manager submits final score, feedback, and assigns a Bell Curve Normalization category (Top, Core, Low).
    """
    query = select(PerformanceReview).where(
        PerformanceReview.id == review_id,
        PerformanceReview.organization_id == current_user.organization_id
    )
    res = await db.execute(query)
    review = res.scalars().first()

    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appraisal review record not found")

    # Automate default categorization if not explicitly overwritten
    norm_cat = "Core"
    if payload.manager_rating >= Decimal("4.00"):
        norm_cat = "Top"
    elif payload.manager_rating < Decimal("2.50"):
        norm_cat = "Low"

    review.manager_rating = payload.manager_rating
    review.manager_feedback = payload.manager_feedback
    review.normalized_category = norm_cat
    review.status = "manager_reviewed"

    await db.commit()
    await db.refresh(review)

    emp_query = select(Employee).where(Employee.id == review.employee_id)
    emp_res = await db.execute(emp_query)
    emp = emp_res.scalars().first()

    # 4. Trigger email to employee on manager review completion
    if emp:
        emp_name = f"{emp.first_name} {emp.last_name}"
        emp_email = None
        if emp.user_id:
            u_q = select(User).where(User.id == emp.user_id)
            u_res = await db.execute(u_q)
            u = u_res.scalars().first()
            if u:
                emp_email = u.email
        if not emp_email:
            emp_email = f"{emp.first_name.lower()}.{emp.last_name.lower()}@organization.com"
        
        mgr_name = "Reporting Manager"
        if current_user.employee_id:
            m_q = select(Employee).where(Employee.id == current_user.employee_id)
            m_res = await db.execute(m_q)
            m_obj = m_res.scalars().first()
            if m_obj:
                mgr_name = f"{m_obj.first_name} {m_obj.last_name}"
        
        send_manager_review_completed_email(emp_email, emp_name, mgr_name, review.review_cycle)

    resp = PerformanceReviewResponse.from_orm(review)
    if emp:
        resp.employee_name = f"{emp.first_name} {emp.last_name}"
    return resp


@router.get("/bell-curve")
async def get_bell_curve_analytics(
    current_user: User = Depends(get_current_user),
    _auth = manager_or_admin,
    db: AsyncSession = Depends(get_db)
):
    """
    Provides aggregated analytics for the appraisal period, dividing employees into
    Top, Core, and Low performer groups to fit organizational bell-curve benchmarks.
    """
    query = select(PerformanceReview).where(
        PerformanceReview.organization_id == current_user.organization_id,
        PerformanceReview.status == "manager_reviewed"
    )
    res = await db.execute(query)
    reviews = res.scalars().all()

    top_list = []
    core_list = []
    low_list = []

    for r in reviews:
        emp_query = select(Employee).where(Employee.id == r.employee_id)
        emp_res = await db.execute(emp_query)
        emp = emp_res.scalars().first()
        
        emp_name = f"{emp.first_name} {emp.last_name}" if emp else "Unknown"
        emp_id_str = str(emp.id) if emp else ""
        emp_grade = emp.grade if emp else "L1"

        data = {
            "review_id": str(r.id),
            "employee_id": emp_id_str,
            "employee_name": emp_name,
            "grade": emp_grade,
            "manager_rating": float(r.manager_rating) if r.manager_rating else 0.0,
            "manager_feedback": r.manager_feedback
        }

        if r.normalized_category == "Top":
            top_list.append(data)
        elif r.normalized_category == "Low":
            low_list.append(data)
        else:
            core_list.append(data)

    total = len(reviews)
    return {
        "total_reviewed": total,
        "distribution": {
            "top": {
                "count": len(top_list),
                "percentage": round((len(top_list) / total * 100), 2) if total > 0 else 0.0,
                "employees": top_list
            },
            "core": {
                "count": len(core_list),
                "percentage": round((len(core_list) / total * 100), 2) if total > 0 else 0.0,
                "employees": core_list
            },
            "low": {
                "count": len(low_list),
                "percentage": round((len(low_list) / total * 100), 2) if total > 0 else 0.0,
                "employees": low_list
            }
        }
    }


@router.post("/reviews/publish-all", status_code=status.HTTP_200_OK)
async def publish_final_ratings(
    review_cycle: str,
    current_user: User = Depends(get_current_user),
    _auth = Depends(RoleChecker(["super_admin", "hr_admin"])),
    db: AsyncSession = Depends(get_db)
):
    """
    5. Final rating publish from HR to all the employees.
    """
    query = select(PerformanceReview).where(
        PerformanceReview.organization_id == current_user.organization_id,
        PerformanceReview.review_cycle == review_cycle,
        PerformanceReview.status == "manager_reviewed"
    )
    res = await db.execute(query)
    reviews = res.scalars().all()

    sent_count = 0
    for r in reviews:
        r.status = "completed"
        emp_q = select(Employee).where(Employee.id == r.employee_id)
        emp_res = await db.execute(emp_q)
        emp = emp_res.scalars().first()
        if emp:
            emp_name = f"{emp.first_name} {emp.last_name}"
            emp_email = None
            if emp.user_id:
                u_q = select(User).where(User.id == emp.user_id)
                u_res = await db.execute(u_q)
                u = u_res.scalars().first()
                if u:
                    emp_email = u.email
            if not emp_email:
                emp_email = f"{emp.first_name.lower()}.{emp.last_name.lower()}@organization.com"
            
            sent = send_final_ratings_published_email(
                emp_email, emp_name, review_cycle, r.normalized_category or "Core"
            )
            if sent:
                sent_count += 1

    await db.commit()
    return {
        "status": "success",
        "message": f"Final appraisal ratings published for '{review_cycle}'.",
        "total_published": len(reviews),
        "emails_sent": sent_count
    }

