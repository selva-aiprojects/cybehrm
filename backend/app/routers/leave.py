# app/routers/leave.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from app.db.session import get_db
from app.models.models import LeaveRequest, LeaveBalance, User, Employee
from app.schemas.schemas import LeaveRequestCreate, LeaveRequestAction, LeaveRequestResponse, LeaveBalanceResponse
from app.routers.dependencies import get_current_user, get_current_employee, RoleChecker, require_subscription, require_feature_permission
import datetime
from typing import List, Optional
from uuid import UUID

router = APIRouter(prefix="/leave", tags=["Leave Management"], dependencies=[Depends(require_subscription("hr_team")), Depends(require_feature_permission("leave"))])

# Helper role dependencies
admin_or_manager = Depends(RoleChecker(["hr_admin", "manager"]))

@router.post("/request", response_model=LeaveRequestResponse, status_code=status.HTTP_201_CREATED)
async def submit_leave_request(
    payload: LeaveRequestCreate,
    current_user: User = Depends(get_current_user),
    employee: Employee = Depends(get_current_employee),
    db: AsyncSession = Depends(get_db)
):
    """
    Submit a leave request.
    Validates date range (end_date >= start_date) and verifies that the employee's
    active leave balance possesses sufficient unused days for the request.
    """
    if payload.end_date < payload.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End date cannot be prior to start date"
        )

    # 1. Calculate requested days (inclusive)
    delta = payload.end_date - payload.start_date
    requested_days = float(delta.days + 1)

    # 2. Check active leave balance
    current_year = datetime.datetime.utcnow().year
    balance_query = select(LeaveBalance).where(
        LeaveBalance.employee_id == employee.id,
        LeaveBalance.year == current_year,
        LeaveBalance.leave_type == payload.leave_type
    )
    result = await db.execute(balance_query)
    balance = result.scalars().first()

    if not balance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No leave allocation quota exists for '{payload.leave_type}' in the year {current_year}"
        )

    remaining_quota = float(balance.allocated - balance.used)
    if requested_days > remaining_quota:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient balance. Requested {requested_days} days, but you only have {remaining_quota} days remaining"
        )

    # 3. Create the Leave Request
    new_request = LeaveRequest(
        organization_id=current_user.organization_id,
        employee_id=employee.id,
        leave_type=payload.leave_type,
        start_date=payload.start_date,
        end_date=payload.end_date,
        total_days=requested_days,
        reason=payload.reason,
        status="pending"
    )
    db.add(new_request)
    await db.commit()
    await db.refresh(new_request)

    # Log leave request submission event
    from app.services.audit_service import AuditService
    await AuditService.log_action(
        db=db,
        organization_id=current_user.organization_id,
        user_id=current_user.id,
        action="Vacation Request Submitted",
        module="Leave Management",
        details={"leave_type": payload.leave_type, "total_days": requested_days}
    )
    
    # Map to response format
    resp = LeaveRequestResponse.from_orm(new_request)
    resp.employee_name = f"{employee.first_name} {employee.last_name}"
    return resp


@router.put("/requests/{request_id}/action", response_model=LeaveRequestResponse)
async def action_leave_request(
    request_id: UUID,
    payload: LeaveRequestAction,
    current_user: User = Depends(get_current_user),
    _auth = admin_or_manager,
    db: AsyncSession = Depends(get_db)
):
    """
    Approve or Reject a pending leave request.
    Only HR Admins or managers are authorized. If approved, decrements the employee's active leave balance quota.
    """
    # Fetch employee dynamically for whoever is actioning the request (optional, since they might be an external admin)
    emp_query = select(Employee).where(
        Employee.user_id == current_user.id,
        Employee.organization_id == current_user.organization_id
    )
    emp_res = await db.execute(emp_query)
    employee = emp_res.scalars().first()

    # 1. Fetch leave request
    query = select(LeaveRequest).options(selectinload(LeaveRequest.employee)).where(
        LeaveRequest.organization_id == current_user.organization_id,
        LeaveRequest.id == request_id
    )
    result = await db.execute(query)
    leave_req = result.scalars().first()

    if not leave_req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave request not found in your organization"
        )

    if leave_req.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This leave request has already been actioned (Status: {leave_req.status})"
        )

    # 2. Process Approval
    if payload.status == "approved":
        # Decrement employee balance
        year = leave_req.start_date.year
        balance_query = select(LeaveBalance).where(
            LeaveBalance.employee_id == leave_req.employee_id,
            LeaveBalance.year == year,
            LeaveBalance.leave_type == leave_req.leave_type
        )
        bal_result = await db.execute(balance_query)
        balance = bal_result.scalars().first()

        if not balance:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Critical: Employee has no allocated leave balance for type '{leave_req.leave_type}'"
            )

        # Check balance once again just in case
        remaining = float(balance.allocated - balance.used)
        if float(leave_req.total_days) > remaining:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot approve. Employee's remaining balance ({remaining} days) is less than the requested days ({leave_req.total_days} days)"
            )

        # Apply deduction
        balance.used = float(balance.used) + float(leave_req.total_days)
        db.add(balance)
        leave_req.status = "approved"
    else:
        leave_req.status = "rejected"
        leave_req.rejection_reason = payload.rejection_reason

    # Record action details
    leave_req.actioned_by = employee.id if employee else None
    leave_req.actioned_at = datetime.datetime.utcnow()
    db.add(leave_req)

    await db.commit()
    await db.refresh(leave_req)

    # Log leave request action event
    from app.services.audit_service import AuditService
    await AuditService.log_action(
        db=db,
        organization_id=current_user.organization_id,
        user_id=current_user.id,
        action=f"Vacation Request {payload.status.capitalize()}",
        module="Leave Management",
        details={"request_id": str(request_id), "status": payload.status}
    )

    resp = LeaveRequestResponse.from_orm(leave_req)
    resp.employee_name = f"{leave_req.employee.first_name} {leave_req.employee.last_name}"
    return resp


@router.get("/balance", response_model=List[LeaveBalanceResponse])
async def read_my_leave_balances(
    year: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch the currently logged-in employee's active leave balances and remaining quotas.
    """
    emp_query = select(Employee).where(
        Employee.user_id == current_user.id,
        Employee.organization_id == current_user.organization_id
    )
    emp_res = await db.execute(emp_query)
    employee = emp_res.scalars().first()

    if not employee:
        return []

    target_year = year or datetime.datetime.utcnow().year
    
    query = select(LeaveBalance).where(
        LeaveBalance.employee_id == employee.id,
        LeaveBalance.year == target_year
    )
    result = await db.execute(query)
    balances = result.scalars().all()

    responses = []
    for bal in balances:
        resp = LeaveBalanceResponse.from_orm(bal)
        # Calculate remaining quota helper fields manually
        resp.remaining = float(bal.allocated - bal.used)
        responses.append(resp)

    return responses


@router.get("/requests", response_model=List[LeaveRequestResponse])
async def list_leave_requests(
    status_filter: Optional[str] = Query(None, description="Filter by status (pending, approved, rejected)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List leave requests.
    - HR Admins/Managers see all requests in the organization.
    - Employees see only their own requested histories.
    """
    if current_user.role in ["hr_admin", "manager"]:
        # Fetch organization wide
        query = select(LeaveRequest).options(selectinload(LeaveRequest.employee)).where(LeaveRequest.organization_id == current_user.organization_id)
    else:
        # Fetch employee of currently logged in user
        emp_query = select(Employee).where(
            Employee.user_id == current_user.id,
            Employee.organization_id == current_user.organization_id
        )
        emp_res = await db.execute(emp_query)
        employee = emp_res.scalars().first()

        if not employee:
            return []

        # Fetch own profile only
        query = select(LeaveRequest).options(selectinload(LeaveRequest.employee)).where(LeaveRequest.employee_id == employee.id)

    if status_filter:
        query = query.where(LeaveRequest.status == status_filter)

    query = query.order_by(LeaveRequest.applied_at.desc())
    result = await db.execute(query)
    requests = result.scalars().all()

    responses = []
    for req in requests:
        resp = LeaveRequestResponse.from_orm(req)
        resp.employee_name = f"{req.employee.first_name} {req.employee.last_name}"
        responses.append(resp)

    return responses
