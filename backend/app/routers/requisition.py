# app/routers/requisition.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.session import get_db
from app.models.models import (
    User, Employee, ResourceRequisition, RecruitmentPosition, Department
)
from app.schemas.schemas import (
    ResourceRequisitionCreate, ResourceRequisitionAction,
    ResourceRequisitionResponse, TokenData, RecruitmentPositionResponse
)
from app.routers.dependencies import get_current_user, get_current_user_claims, RoleChecker
from typing import List, Optional
import datetime

router = APIRouter(prefix="/requisitions", tags=["Resource Requisition"])

hr_or_manager = Depends(RoleChecker(["hr_admin", "manager", "HR Team"]))


def _make_req_number(org_id: str, count: int) -> str:
    """Generate human-readable requisition number."""
    year = datetime.datetime.utcnow().year
    return f"REQ-{year}-{str(count + 1).zfill(4)}"


async def _enrich_response(req: ResourceRequisition, db: AsyncSession) -> ResourceRequisitionResponse:
    """Enrich requisition with human-readable names."""
    resp = ResourceRequisitionResponse.from_orm(req)
    if req.department:
        resp.department_name = req.department.name
    if req.requested_by_employee:
        emp = req.requested_by_employee
        resp.requested_by_name = f"{emp.first_name} {emp.last_name}"
    return resp


@router.get("", response_model=List[ResourceRequisitionResponse])
async def list_requisitions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List requisitions. HR admins see all. Managers see their own + pending_hr ones.
    Employees only see their own.
    """
    from sqlalchemy.orm import selectinload
    query = select(ResourceRequisition).options(
        selectinload(ResourceRequisition.department),
        selectinload(ResourceRequisition.requested_by_employee),
        selectinload(ResourceRequisition.manager_approver),
        selectinload(ResourceRequisition.hr_approver),
    ).where(ResourceRequisition.organization_id == current_user.organization_id)

    if current_user.role not in ["hr_admin", "super_admin"]:
        # Non-admins see only their own submitted or ones they need to approve
        if current_user.employee:
            query = query.where(
                (ResourceRequisition.requested_by == current_user.employee.id) |
                (ResourceRequisition.status.in_(["pending_manager", "pending_hr"]))
            )

    query = query.order_by(ResourceRequisition.created_at.desc())
    result = await db.execute(query)
    reqs = result.scalars().all()

    responses = []
    for req in reqs:
        responses.append(await _enrich_response(req, db))
    return responses


@router.post("", response_model=ResourceRequisitionResponse, status_code=status.HTTP_201_CREATED)
async def create_requisition(
    payload: ResourceRequisitionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new resource requisition (saved as draft)."""
    # Count existing to generate sequential number
    count_result = await db.execute(
        select(func.count(ResourceRequisition.id)).where(
            ResourceRequisition.organization_id == current_user.organization_id
        )
    )
    count = count_result.scalar() or 0
    req_number = _make_req_number(str(current_user.organization_id), count)

    # Resolve requesting employee id
    requesting_employee_id = None
    if current_user.employee:
        requesting_employee_id = current_user.employee.id

    new_req = ResourceRequisition(
        organization_id=current_user.organization_id,
        requisition_number=req_number,
        title=payload.title,
        department_id=payload.department_id,
        requested_by=requesting_employee_id,
        num_positions=payload.num_positions,
        employment_type=payload.employment_type,
        justification=payload.justification,
        expected_joining_date=payload.expected_joining_date,
        budget_range=payload.budget_range,
        skills_required=payload.skills_required,
        status="draft"
    )
    db.add(new_req)
    await db.commit()

    from sqlalchemy.orm import selectinload
    refreshed = await db.execute(
        select(ResourceRequisition).options(
            selectinload(ResourceRequisition.department),
            selectinload(ResourceRequisition.requested_by_employee),
            selectinload(ResourceRequisition.manager_approver),
            selectinload(ResourceRequisition.hr_approver),
        ).where(ResourceRequisition.id == new_req.id)
    )
    req = refreshed.scalars().first()
    return await _enrich_response(req, db)


@router.post("/{req_id}/submit", response_model=ResourceRequisitionResponse)
async def submit_requisition(
    req_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Submit a draft requisition for manager approval."""
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(ResourceRequisition).options(
            selectinload(ResourceRequisition.department),
            selectinload(ResourceRequisition.requested_by_employee),
            selectinload(ResourceRequisition.manager_approver),
            selectinload(ResourceRequisition.hr_approver),
        ).where(
            ResourceRequisition.id == req_id,
            ResourceRequisition.organization_id == current_user.organization_id
        )
    )
    req = result.scalars().first()
    if not req:
        raise HTTPException(status_code=404, detail="Requisition not found")
    if req.status != "draft":
        raise HTTPException(status_code=400, detail=f"Only draft requisitions can be submitted (current: {req.status})")

    req.status = "pending_manager"
    req.updated_at = datetime.datetime.utcnow()
    await db.commit()
    await db.refresh(req)
    return await _enrich_response(req, db)


@router.post("/{req_id}/approve-manager", response_model=ResourceRequisitionResponse)
async def approve_manager(
    req_id: str,
    payload: ResourceRequisitionAction,
    current_user: User = Depends(get_current_user),
    _auth=Depends(RoleChecker(["hr_admin", "manager"])),
    db: AsyncSession = Depends(get_db)
):
    """Manager approves the requisition — moves it to HR approval."""
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(ResourceRequisition).options(
            selectinload(ResourceRequisition.department),
            selectinload(ResourceRequisition.requested_by_employee),
            selectinload(ResourceRequisition.manager_approver),
            selectinload(ResourceRequisition.hr_approver),
        ).where(
            ResourceRequisition.id == req_id,
            ResourceRequisition.organization_id == current_user.organization_id
        )
    )
    req = result.scalars().first()
    if not req:
        raise HTTPException(status_code=404, detail="Requisition not found")
    if req.status != "pending_manager":
        raise HTTPException(status_code=400, detail=f"Requisition is not pending manager approval (current: {req.status})")

    manager_emp_id = current_user.employee.id if current_user.employee else None
    req.status = "pending_hr"
    req.manager_approved_by = manager_emp_id
    req.manager_approved_at = datetime.datetime.utcnow()
    req.updated_at = datetime.datetime.utcnow()
    await db.commit()
    await db.refresh(req)
    return await _enrich_response(req, db)


@router.post("/{req_id}/approve-hr", response_model=ResourceRequisitionResponse)
async def approve_hr(
    req_id: str,
    payload: ResourceRequisitionAction,
    current_user: User = Depends(get_current_user),
    _auth=Depends(RoleChecker(["hr_admin"])),
    db: AsyncSession = Depends(get_db)
):
    """HR approves the requisition — it becomes fully approved."""
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(ResourceRequisition).options(
            selectinload(ResourceRequisition.department),
            selectinload(ResourceRequisition.requested_by_employee),
            selectinload(ResourceRequisition.manager_approver),
            selectinload(ResourceRequisition.hr_approver),
        ).where(
            ResourceRequisition.id == req_id,
            ResourceRequisition.organization_id == current_user.organization_id
        )
    )
    req = result.scalars().first()
    if not req:
        raise HTTPException(status_code=404, detail="Requisition not found")
    if req.status != "pending_hr":
        raise HTTPException(status_code=400, detail=f"Requisition is not pending HR approval (current: {req.status})")

    hr_emp_id = current_user.employee.id if current_user.employee else None
    req.status = "approved"
    req.hr_approved_by = hr_emp_id
    req.hr_approved_at = datetime.datetime.utcnow()
    req.updated_at = datetime.datetime.utcnow()
    await db.commit()
    await db.refresh(req)
    return await _enrich_response(req, db)


@router.post("/{req_id}/reject", response_model=ResourceRequisitionResponse)
async def reject_requisition(
    req_id: str,
    payload: ResourceRequisitionAction,
    current_user: User = Depends(get_current_user),
    _auth=Depends(RoleChecker(["hr_admin", "manager"])),
    db: AsyncSession = Depends(get_db)
):
    """Reject a requisition at any approval stage."""
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(ResourceRequisition).options(
            selectinload(ResourceRequisition.department),
            selectinload(ResourceRequisition.requested_by_employee),
        ).where(
            ResourceRequisition.id == req_id,
            ResourceRequisition.organization_id == current_user.organization_id
        )
    )
    req = result.scalars().first()
    if not req:
        raise HTTPException(status_code=404, detail="Requisition not found")
    if req.status in ["approved", "converted", "rejected"]:
        raise HTTPException(status_code=400, detail=f"Cannot reject requisition in '{req.status}' state")

    req.status = "rejected"
    req.rejection_reason = payload.notes
    req.updated_at = datetime.datetime.utcnow()
    await db.commit()
    await db.refresh(req)
    return await _enrich_response(req, db)


@router.post("/{req_id}/convert-to-position", response_model=ResourceRequisitionResponse)
async def convert_to_position(
    req_id: str,
    current_user: User = Depends(get_current_user),
    _auth=Depends(RoleChecker(["hr_admin"])),
    db: AsyncSession = Depends(get_db)
):
    """
    Convert an approved requisition into a Recruitment Position.
    This bridges the requisition workflow with the Recruitment Hub.
    """
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(ResourceRequisition).options(
            selectinload(ResourceRequisition.department),
            selectinload(ResourceRequisition.requested_by_employee),
        ).where(
            ResourceRequisition.id == req_id,
            ResourceRequisition.organization_id == current_user.organization_id
        )
    )
    req = result.scalars().first()
    if not req:
        raise HTTPException(status_code=404, detail="Requisition not found")
    if req.status != "approved":
        raise HTTPException(status_code=400, detail="Only approved requisitions can be converted to recruitment positions")
    if req.position_id:
        raise HTTPException(status_code=400, detail="This requisition has already been converted to a recruitment position")

    # Create Recruitment Position
    new_position = RecruitmentPosition(
        organization_id=current_user.organization_id,
        title=req.title,
        department_id=req.department_id,
        vacancies=req.num_positions,
        status="open"
    )
    db.add(new_position)
    await db.flush()

    # Link the position back to the requisition
    req.position_id = new_position.id
    req.status = "converted"
    req.updated_at = datetime.datetime.utcnow()

    await db.commit()
    await db.refresh(req)
    return await _enrich_response(req, db)
