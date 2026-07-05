# app/routers/offboarding.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.models import (
    User, Employee, OffboardingRequest, FinalSettlement,
    SalaryStructure, LeaveBalance
)
from app.schemas.schemas import (
    OffboardingRequestCreate, OffboardingRequestResponse,
    OffboardingRequestAction, OffboardingClearanceAction,
    FinalSettlementResponse, OffboardingAdminInitiate
)
from app.routers.dependencies import get_current_user, get_current_employee, RoleChecker, require_subscription, require_feature_permission
import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

router = APIRouter(prefix="/offboarding", tags=["Offboarding & F&F Exit Settlement"], dependencies=[Depends(require_subscription("resource_mgmt")), Depends(require_feature_permission("offboarding"))])

exit_admin_only = Depends(RoleChecker(["hr_admin", "finance_admin"]))

# =========================================================================
# 1. EMPLOYEE EXIT APPLICATIONS
# =========================================================================

@router.post("/apply", response_model=OffboardingRequestResponse, status_code=status.HTTP_201_CREATED)
async def submit_resignation(
    payload: OffboardingRequestCreate,
    employee: Employee = Depends(get_current_employee),
    db: AsyncSession = Depends(get_db)
):
    """
    Employee submits resignation. Default notice period is 90 days.
    """
    # Check if resignation is already active
    query = select(OffboardingRequest).where(OffboardingRequest.employee_id == employee.id)
    res = await db.execute(query)
    existing_req = res.scalars().first()

    if existing_req and existing_req.status != "rejected":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have an active offboarding request."
        )

    # Compute target relieving date (90 days notice by default if not approved yet)
    target_relieving = payload.requested_relieving_date
    if not target_relieving:
        target_relieving = payload.resignation_date + datetime.timedelta(days=90)

    req = OffboardingRequest(
        organization_id=employee.organization_id,
        employee_id=employee.id,
        resignation_date=payload.resignation_date,
        requested_relieving_date=target_relieving,
        reason=payload.reason,
        status="pending",
        initiation_type="employee",
        notice_period_days=90,
        notice_buyout_days=0,
        it_clearance_status="pending",
        hr_clearance_status="pending",
        finance_clearance_status="pending",
        created_at=datetime.datetime.utcnow(),
        updated_at=datetime.datetime.utcnow()
    )
    db.add(req)
    await db.commit()
    await db.refresh(req)

    resp = OffboardingRequestResponse.from_orm(req)
    resp.employee_name = f"{employee.first_name} {employee.last_name}"
    return resp


@router.post("/admin/initiate", response_model=OffboardingRequestResponse, status_code=status.HTTP_201_CREATED)
async def admin_initiate_separation(
    payload: OffboardingAdminInitiate,
    current_user: User = Depends(get_current_user),
    _auth = exit_admin_only,
    db: AsyncSession = Depends(get_db)
):
    """
    HR Admin initiates employee exit (either due to Employee decision i.e. resignation,
    or Organization decision i.e. Termination, Layoff, Retirement).
    """
    # Check if offboarding request already exists
    query = select(OffboardingRequest).where(OffboardingRequest.employee_id == payload.employee_id)
    res = await db.execute(query)
    existing_req = res.scalars().first()

    if existing_req and existing_req.status != "rejected":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee already has an active offboarding request."
        )

    # Fetch employee
    emp_query = select(Employee).where(
        Employee.id == payload.employee_id,
        Employee.organization_id == current_user.organization_id
    )
    emp_res = await db.execute(emp_query)
    employee = emp_res.scalars().first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found or doesn't belong to your organization."
        )

    # Compute target relieving date
    target_relieving = payload.requested_relieving_date
    if not target_relieving:
        target_relieving = payload.resignation_date + datetime.timedelta(days=payload.notice_period_days or 90)

    req = OffboardingRequest(
        organization_id=current_user.organization_id,
        employee_id=payload.employee_id,
        resignation_date=payload.resignation_date,
        requested_relieving_date=target_relieving,
        reason=payload.reason,
        status="pending",
        initiation_type=payload.initiation_type,
        notice_period_days=payload.notice_period_days or 90,
        notice_buyout_days=0,
        it_clearance_status="pending",
        hr_clearance_status="pending",
        finance_clearance_status="pending",
        created_at=datetime.datetime.utcnow(),
        updated_at=datetime.datetime.utcnow()
    )
    db.add(req)
    await db.commit()
    await db.refresh(req)

    resp = OffboardingRequestResponse.from_orm(req)
    resp.employee_name = f"{employee.first_name} {employee.last_name}"
    return resp


@router.get("/me", response_model=OffboardingRequestResponse)
async def get_my_resignation(
    employee: Employee = Depends(get_current_employee),
    db: AsyncSession = Depends(get_db)
):
    query = select(OffboardingRequest).where(OffboardingRequest.employee_id == employee.id)
    res = await db.execute(query)
    req = res.scalars().first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No resignation request found.")
    
    resp = OffboardingRequestResponse.from_orm(req)
    resp.employee_name = f"{employee.first_name} {employee.last_name}"
    return resp


# =========================================================================
# 2. ADMIN EXIT MANAGEMENT & CLEARANCES
# =========================================================================

@router.get("/requests", response_model=List[OffboardingRequestResponse])
async def list_all_resignations(
    current_user: User = Depends(get_current_user),
    _auth = exit_admin_only,
    db: AsyncSession = Depends(get_db)
):
    query = select(OffboardingRequest).where(OffboardingRequest.organization_id == current_user.organization_id)
    res = await db.execute(query)
    requests = res.scalars().all()

    responses = []
    for r in requests:
        emp_query = select(Employee).where(Employee.id == r.employee_id)
        emp_res = await db.execute(emp_query)
        emp = emp_res.scalars().first()

        resp = OffboardingRequestResponse.from_orm(r)
        if emp:
            resp.employee_name = f"{emp.first_name} {emp.last_name}"
        responses.append(resp)
    return responses


@router.put("/requests/{req_id}/action", response_model=OffboardingRequestResponse)
async def review_resignation(
    req_id: UUID,
    payload: OffboardingRequestAction,
    current_user: User = Depends(get_current_user),
    _auth = exit_admin_only,
    db: AsyncSession = Depends(get_db)
):
    """
    Approve/Reject resignation and adjust notice buyout parameters.
    """
    query = select(OffboardingRequest).where(
        OffboardingRequest.id == req_id,
        OffboardingRequest.organization_id == current_user.organization_id
    )
    res = await db.execute(query)
    req = res.scalars().first()

    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resignation request not found.")

    req.status = payload.status
    if payload.approved_relieving_date:
        req.approved_relieving_date = payload.approved_relieving_date
    else:
        req.approved_relieving_date = req.requested_relieving_date

    req.notice_buyout_days = payload.notice_buyout_days
    
    if payload.status == "approved":
        req.status = "in_clearance"

    await db.commit()
    await db.refresh(req)

    emp_query = select(Employee).where(Employee.id == req.employee_id)
    emp_res = await db.execute(emp_query)
    emp = emp_res.scalars().first()

    resp = OffboardingRequestResponse.from_orm(req)
    if emp:
        resp.employee_name = f"{emp.first_name} {emp.last_name}"
    return resp


@router.put("/requests/{req_id}/clearance", response_model=OffboardingRequestResponse)
async def update_clearance_status(
    req_id: UUID,
    payload: OffboardingClearanceAction,
    current_user: User = Depends(get_current_user),
    _auth = exit_admin_only,
    db: AsyncSession = Depends(get_db)
):
    """
    Mark clearance checklists as completed for IT, HR, and Finance.
    """
    query = select(OffboardingRequest).where(
        OffboardingRequest.id == req_id,
        OffboardingRequest.organization_id == current_user.organization_id
    )
    res = await db.execute(query)
    req = res.scalars().first()

    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resignation request not found.")

    dept = payload.department.lower()
    if dept == "it":
        req.it_clearance_status = payload.status
    elif dept == "hr":
        req.hr_clearance_status = payload.status
    elif dept == "finance":
        req.finance_clearance_status = payload.status
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid department. Choose 'it', 'hr', or 'finance'.")

    # If all departments are cleared, transition to completed
    if (req.it_clearance_status == "completed" and 
        req.hr_clearance_status == "completed" and 
        req.finance_clearance_status == "completed"):
        req.status = "completed"

    await db.commit()
    await db.refresh(req)

    emp_query = select(Employee).where(Employee.id == req.employee_id)
    emp_res = await db.execute(emp_query)
    emp = emp_res.scalars().first()

    resp = OffboardingRequestResponse.from_orm(req)
    if emp:
        resp.employee_name = f"{emp.first_name} {emp.last_name}"
    return resp


# =========================================================================
# 3. FULL & FINAL (F&F) SETTLEMENT GENERATION
# =========================================================================

@router.get("/requests/{req_id}/settlement", response_model=FinalSettlementResponse)
async def calculate_or_retrieve_ff_settlement(
    req_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Compute Full & Final settlement including statutory calculations:
    - Gratuity: Payment of Gratuity Act formula (15 * Basic * Years) / 26 (Requires minimum 5 years / 60 months service)
    - Leave Encashment: Unused earned leave encashed as (earned_leaves / 30) * Basic
    - Notice Buyout Charge: Pro-rata basic deduction (buyout_days / 30) * Basic
    """
    # 1. Retrieve resignation request
    req_query = select(OffboardingRequest).where(
        OffboardingRequest.id == req_id,
        OffboardingRequest.organization_id == current_user.organization_id
    )
    req_res = await db.execute(req_query)
    req = req_res.scalars().first()

    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resignation request not found.")

    # Authorize: user must be admin (hr_admin / finance_admin) OR the employee owning the request
    is_admin = current_user.role in ["hr_admin", "finance_admin"]
    emp_user_query = select(Employee).where(Employee.user_id == current_user.id)
    emp_user_res = await db.execute(emp_user_query)
    current_employee = emp_user_res.scalars().first()
    is_owner = current_employee and req.employee_id == current_employee.id

    if not is_admin and not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You do not have permissions to view this settlement statement."
        )

    # 2. Check if final settlement already exists in database
    settle_query = select(FinalSettlement).where(FinalSettlement.offboarding_request_id == req.id)
    settle_res = await db.execute(settle_query)
    settlement = settle_res.scalars().first()

    emp_query = select(Employee).where(Employee.id == req.employee_id)
    emp_res = await db.execute(emp_query)
    employee = emp_res.scalars().first()

    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    # Fetch salary structure
    sal_query = select(SalaryStructure).where(SalaryStructure.employee_id == employee.id)
    sal_res = await db.execute(sal_query)
    salary = sal_res.scalars().first()
    
    basic_val = salary.basic if salary else Decimal("30000.00")

    if settlement:
        resp = FinalSettlementResponse.from_orm(settlement)
        resp.employee_name = f"{employee.first_name} {employee.last_name}"
        return resp

    # 3. Calculate Statutory Gratuity (5-year continuous service rule)
    relieving_date = req.approved_relieving_date if req.approved_relieving_date else (req.requested_relieving_date if req.requested_relieving_date else datetime.date.today())
    tenure_days = (relieving_date - employee.joining_date).days
    tenure_years = tenure_days / 365.25

    gratuity_amount = Decimal("0.00")
    if tenure_years >= 4.9: # Continuous service requirement (5 years)
        completed_years = int(tenure_days // 365)
        remaining_days = tenure_days % 365
        gratuity_years = completed_years
        if remaining_days > 182: # Part thereof in excess of 6 months counts as 1 full year
            gratuity_years += 1
            
        if gratuity_years >= 5:
            gratuity_amount = (Decimal("15") * basic_val * Decimal(gratuity_years)) / Decimal("26")
            gratuity_amount = gratuity_amount.quantize(Decimal("0.01"))

    # 4. Calculate Leave Encashment
    leave_query = select(LeaveBalance).where(
        LeaveBalance.employee_id == employee.id,
        LeaveBalance.leave_type == "earned"
    )
    leave_res = await db.execute(leave_query)
    balance = leave_res.scalars().first()
    remaining_earned = Decimal(str(balance.allocated - balance.used)) if balance else Decimal("10.0")
    leave_encashment_amount = (remaining_earned / Decimal("30.00")) * basic_val
    leave_encashment_amount = leave_encashment_amount.quantize(Decimal("0.01"))

    # 5. Notice Buyout Charge
    notice_buyout_charge = (Decimal(req.notice_buyout_days) / Decimal("30.00")) * basic_val
    notice_buyout_charge = notice_buyout_charge.quantize(Decimal("0.01"))

    # 6. Unpaid Salary (1 month basic as mock draft default)
    unpaid_salary = basic_val

    # 7. Final Math
    total_amount = gratuity_amount + leave_encashment_amount + unpaid_salary - notice_buyout_charge
    total_amount = max(Decimal("0.00"), total_amount)

    # 8. Create draft settlement in database
    settlement = FinalSettlement(
        organization_id=current_user.organization_id,
        offboarding_request_id=req.id,
        gratuity_amount=gratuity_amount,
        leave_encashment_amount=leave_encashment_amount,
        notice_buyout_charge=notice_buyout_charge,
        unpaid_salary=unpaid_salary,
        other_additions=Decimal("0.00"),
        other_deductions=Decimal("0.00"),
        total_settlement_amount=total_amount,
        settlement_date=relieving_date,
        status="draft",
        notes=f"Draft F&F Settlement. Tenure: {tenure_years:.2f} years ({tenure_days} days).",
        created_at=datetime.datetime.utcnow(),
        updated_at=datetime.datetime.utcnow()
    )
    db.add(settlement)
    await db.commit()
    await db.refresh(settlement)

    resp = FinalSettlementResponse.from_orm(settlement)
    resp.employee_name = f"{employee.first_name} {employee.last_name}"
    return resp


@router.post("/requests/{req_id}/settlement/save", response_model=FinalSettlementResponse)
async def save_or_update_settlement(
    req_id: UUID,
    payload: FinalSettlementResponse, # We can use the same model fields to receive edits
    current_user: User = Depends(get_current_user),
    _auth = exit_admin_only,
    db: AsyncSession = Depends(get_db)
):
    """
    Manually override and finalize F&F statement details.
    """
    query = select(FinalSettlement).where(
        FinalSettlement.offboarding_request_id == req_id,
        FinalSettlement.organization_id == current_user.organization_id
    )
    res = await db.execute(query)
    settlement = res.scalars().first()

    if not settlement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No settlement statement exists to save.")

    # Override values
    settlement.gratuity_amount = payload.gratuity_amount
    settlement.leave_encashment_amount = payload.leave_encashment_amount
    settlement.notice_buyout_charge = payload.notice_buyout_charge
    settlement.unpaid_salary = payload.unpaid_salary
    settlement.other_additions = payload.other_additions
    settlement.other_deductions = payload.other_deductions
    
    # Recalculate total
    total = (payload.gratuity_amount + payload.leave_encashment_amount + 
             payload.unpaid_salary + payload.other_additions - 
             payload.notice_buyout_charge - payload.other_deductions)
    settlement.total_settlement_amount = max(Decimal("0.00"), total)
    settlement.status = "approved"

    await db.commit()
    await db.refresh(settlement)

    # Fetch employee name
    req_query = select(OffboardingRequest).where(OffboardingRequest.id == settlement.offboarding_request_id)
    req_res = await db.execute(req_query)
    req = req_res.scalars().first()
    
    employee_name = "Unknown"
    if req:
        emp_query = select(Employee).where(Employee.id == req.employee_id)
        emp_res = await db.execute(emp_query)
        emp = emp_res.scalars().first()
        if emp:
            employee_name = f"{emp.first_name} {emp.last_name}"

    resp = FinalSettlementResponse.from_orm(settlement)
    resp.employee_name = employee_name
    return resp


@router.put("/requests/{req_id}/settlement/pay", response_model=FinalSettlementResponse)
async def payout_final_settlement(
    req_id: UUID,
    current_user: User = Depends(get_current_user),
    _auth = exit_admin_only,
    db: AsyncSession = Depends(get_db)
):
    query = select(FinalSettlement).where(
        FinalSettlement.offboarding_request_id == req_id,
        FinalSettlement.organization_id == current_user.organization_id
    )
    res = await db.execute(query)
    settlement = res.scalars().first()

    if not settlement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Settlement not found")

    settlement.status = "paid"
    
    # Mark the resignation offboarding request as fully completed
    req_query = select(OffboardingRequest).where(OffboardingRequest.id == settlement.offboarding_request_id)
    req_res = await db.execute(req_query)
    req = req_res.scalars().first()
    if req:
        req.status = "completed"
        req.it_clearance_status = "completed"
        req.hr_clearance_status = "completed"
        req.finance_clearance_status = "completed"
        db.add(req)

        # Mark employee as inactive and set exit date
        emp_query = select(Employee).where(Employee.id == req.employee_id)
        emp_res = await db.execute(emp_query)
        emp = emp_res.scalars().first()
        if emp:
            emp.employment_status = "inactive"
            emp.exit_date = datetime.date.today()
            db.add(emp)

    await db.commit()
    await db.refresh(settlement)

    employee_name = "Unknown"
    if req and emp:
        employee_name = f"{emp.first_name} {emp.last_name}"

    resp = FinalSettlementResponse.from_orm(settlement)
    resp.employee_name = employee_name
    return resp
