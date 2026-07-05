# app/routers/tax_fbp_insurance_car.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.models import (
    User, Employee, TaxDeclaration, GradeAllowance, FBPDeclaration,
    InsuranceEnrollment, VehicleLease
)
from app.schemas.schemas import (
    TaxDeclarationCreate, TaxDeclarationResponse, TaxDeclarationAction,
    GradeAllowanceResponse, FBPDeclarationCreate, FBPDeclarationResponse,
    InsuranceEnrollmentCreate, InsuranceEnrollmentResponse,
    VehicleLeaseCreate, VehicleLeaseResponse
)
from app.routers.dependencies import get_current_user, get_current_employee, RoleChecker, require_subscription, require_feature_permission
import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID
import random

router = APIRouter(tags=["Tax, FBP, Insurance & Car Lease"], dependencies=[Depends(require_subscription("hr_team"))])

payroll_admin_only = Depends(RoleChecker(["hr_admin", "payroll_admin"]))

# =========================================================================
# 1. TAX DECLARATIONS
# =========================================================================

@router.post("/tax-declarations", response_model=TaxDeclarationResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_feature_permission("fbp-tax"))])
async def declare_taxes(
    payload: TaxDeclarationCreate,
    employee: Employee = Depends(get_current_employee),
    db: AsyncSession = Depends(get_db)
):
    """
    Submit or update tax declarations under Section 80C, 80D, and HRA rent.
    If HRA rent is > 100,000, a valid 10-character Landlord PAN is strictly validated.
    """
    if payload.hra_rent_paid > Decimal("100000.00"):
        if not payload.landlord_pan or len(payload.landlord_pan.strip()) != 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A valid 10-character Landlord PAN is mandatory when HRA rent exceeds ₹1,00,000."
            )

    # Check if a declaration already exists for this financial year
    query = select(TaxDeclaration).where(
        TaxDeclaration.employee_id == employee.id,
        TaxDeclaration.financial_year == payload.financial_year
    )
    result = await db.execute(query)
    declaration = result.scalars().first()

    if declaration:
        declaration.regime = payload.regime
        declaration.section_80c = payload.section_80c
        declaration.section_80d = payload.section_80d
        declaration.hra_rent_paid = payload.hra_rent_paid
        declaration.landlord_pan = payload.landlord_pan
        declaration.landlord_name = payload.landlord_name
        declaration.evidence_url = payload.evidence_url
        declaration.status = "pending"  # Reset status on update
        declaration.updated_at = datetime.datetime.utcnow()
        if declaration.created_at is None:
            declaration.created_at = datetime.datetime.utcnow()
    else:
        declaration = TaxDeclaration(
            organization_id=employee.organization_id,
            employee_id=employee.id,
            financial_year=payload.financial_year,
            regime=payload.regime,
            section_80c=payload.section_80c,
            section_80d=payload.section_80d,
            hra_rent_paid=payload.hra_rent_paid,
            landlord_pan=payload.landlord_pan,
            landlord_name=payload.landlord_name,
            evidence_url=payload.evidence_url,
            status="pending",
            created_at=datetime.datetime.utcnow(),
            updated_at=datetime.datetime.utcnow()
        )
        db.add(declaration)

    await db.commit()
    await db.refresh(declaration)
    
    resp = TaxDeclarationResponse.from_orm(declaration)
    resp.employee_name = f"{employee.first_name} {employee.last_name}"
    return resp


@router.get("/tax-declarations/me", response_model=List[TaxDeclarationResponse], dependencies=[Depends(require_feature_permission("fbp-tax"))])
async def get_my_tax_declarations(
    employee: Employee = Depends(get_current_employee),
    db: AsyncSession = Depends(get_db)
):
    query = select(TaxDeclaration).where(TaxDeclaration.employee_id == employee.id)
    result = await db.execute(query)
    declarations = result.scalars().all()
    
    responses = []
    for d in declarations:
        r = TaxDeclarationResponse.from_orm(d)
        r.employee_name = f"{employee.first_name} {employee.last_name}"
        responses.append(r)
    return responses


@router.get("/tax-declarations", response_model=List[TaxDeclarationResponse], dependencies=[Depends(require_feature_permission("fbp-tax"))])
async def list_all_tax_declarations(
    current_user: User = Depends(get_current_user),
    _auth = payroll_admin_only,
    db: AsyncSession = Depends(get_db)
):
    query = select(TaxDeclaration).where(TaxDeclaration.organization_id == current_user.organization_id)
    result = await db.execute(query)
    declarations = result.scalars().all()
    
    responses = []
    for d in declarations:
        emp_query = select(Employee).where(Employee.id == d.employee_id)
        emp_res = await db.execute(emp_query)
        emp = emp_res.scalars().first()
        r = TaxDeclarationResponse.from_orm(d)
        if emp:
            r.employee_name = f"{emp.first_name} {emp.last_name}"
        responses.append(r)
    return responses


@router.put("/tax-declarations/{decl_id}/action", response_model=TaxDeclarationResponse, dependencies=[Depends(require_feature_permission("fbp-tax"))])
async def review_tax_declaration(
    decl_id: UUID,
    payload: TaxDeclarationAction,
    current_user: User = Depends(get_current_user),
    _auth = payroll_admin_only,
    db: AsyncSession = Depends(get_db)
):
    query = select(TaxDeclaration).where(
        TaxDeclaration.id == decl_id,
        TaxDeclaration.organization_id == current_user.organization_id
    )
    result = await db.execute(query)
    declaration = result.scalars().first()

    if not declaration:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tax declaration not found")

    emp_query = select(Employee).where(Employee.user_id == current_user.id)
    emp_res = await db.execute(emp_query)
    reviewer = emp_res.scalars().first()

    declaration.status = payload.status
    declaration.rejection_reason = payload.rejection_reason
    declaration.reviewed_by = reviewer.id if reviewer else None
    declaration.reviewed_at = datetime.datetime.utcnow()

    await db.commit()
    await db.refresh(declaration)

    target_emp_query = select(Employee).where(Employee.id == declaration.employee_id)
    target_emp_res = await db.execute(target_emp_query)
    target_emp = target_emp_res.scalars().first()

    resp = TaxDeclarationResponse.from_orm(declaration)
    if target_emp:
        resp.employee_name = f"{target_emp.first_name} {target_emp.last_name}"
    return resp


# =========================================================================
# 2. GRADE ALLOWANCES & FLEXIBLE BENEFITS (FBP)
# =========================================================================

@router.get("/grade-allowances/me", response_model=GradeAllowanceResponse, dependencies=[Depends(require_feature_permission("fbp-tax"))])
async def get_my_grade_allowances(
    employee: Employee = Depends(get_current_employee),
    db: AsyncSession = Depends(get_db)
):
    query = select(GradeAllowance).where(
        GradeAllowance.organization_id == employee.organization_id,
        GradeAllowance.grade == employee.grade
    )
    result = await db.execute(query)
    allowance = result.scalars().first()

    if not allowance:
        # Provide clean, safe fallback bounds
        return GradeAllowanceResponse(
            id=employee.id,
            organization_id=employee.organization_id,
            grade=employee.grade,
            fuel_cap=Decimal("5000.00"),
            lta_cap=Decimal("15000.00"),
            phone_cap=Decimal("2000.00"),
            food_cap=Decimal("3000.00"),
            car_lease_cap=Decimal("25000.00"),
            insurance_cover=Decimal("300000.00")
        )
    return allowance


@router.post("/fbp-declarations", response_model=FBPDeclarationResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_feature_permission("fbp-tax"))])
async def submit_fbp_declaration(
    payload: FBPDeclarationCreate,
    employee: Employee = Depends(get_current_employee),
    db: AsyncSession = Depends(get_db)
):
    """
    Submit or restructure salary allowances into tax-exempt Flexible Benefits (FBP).
    Restructuring amounts are validated against the employee's Grade Allowance limits.
    """
    grade_query = select(GradeAllowance).where(
        GradeAllowance.organization_id == employee.organization_id,
        GradeAllowance.grade == employee.grade
    )
    grade_res = await db.execute(grade_query)
    grade_allowance = grade_res.scalars().first()

    if grade_allowance:
        if payload.fuel_amount > grade_allowance.fuel_cap:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Fuel FBP exceeds cap of ₹{grade_allowance.fuel_cap}")
        if payload.lta_amount > grade_allowance.lta_cap:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"LTA FBP exceeds cap of ₹{grade_allowance.lta_cap}")
        if payload.phone_amount > grade_allowance.phone_cap:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Phone FBP exceeds cap of ₹{grade_allowance.phone_cap}")
        if payload.food_amount > grade_allowance.food_cap:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Food FBP exceeds cap of ₹{grade_allowance.food_cap}")

    # Check for existing FBP declaration
    fbp_query = select(FBPDeclaration).where(FBPDeclaration.employee_id == employee.id)
    fbp_res = await db.execute(fbp_query)
    fbp = fbp_res.scalars().first()

    if fbp:
        fbp.fuel_amount = payload.fuel_amount
        fbp.lta_amount = payload.lta_amount
        fbp.phone_amount = payload.phone_amount
        fbp.food_amount = payload.food_amount
        fbp.status = "approved"  # Auto-approve for convenience or mock
    else:
        fbp = FBPDeclaration(
            organization_id=employee.organization_id,
            employee_id=employee.id,
            fuel_amount=payload.fuel_amount,
            lta_amount=payload.lta_amount,
            phone_amount=payload.phone_amount,
            food_amount=payload.food_amount,
            status="approved",
            created_at=datetime.datetime.utcnow(),
            updated_at=datetime.datetime.utcnow()
        )
        db.add(fbp)

    await db.commit()
    await db.refresh(fbp)
    return fbp


@router.get("/fbp-declarations/me", response_model=FBPDeclarationResponse, dependencies=[Depends(require_feature_permission("fbp-tax"))])
async def get_my_fbp(
    employee: Employee = Depends(get_current_employee),
    db: AsyncSession = Depends(get_db)
):
    query = select(FBPDeclaration).where(FBPDeclaration.employee_id == employee.id)
    result = await db.execute(query)
    fbp = result.scalars().first()
    if not fbp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No FBP declaration found")
    return fbp


# =========================================================================
# 3. CORPORATE GROUP HEALTH INSURANCE
# =========================================================================

@router.post("/insurance/enroll", response_model=InsuranceEnrollmentResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_feature_permission("insurance"))])
async def enroll_corporate_insurance(
    payload: InsuranceEnrollmentCreate,
    employee: Employee = Depends(get_current_employee),
    db: AsyncSession = Depends(get_db)
):
    """
    Enroll or update Corporate Group Medical Insurance.
    Surcharge is calculated dynamically based on:
    - Tier: base (0), silver (500/mo), gold (1200/mo)
    - Dependents: Spouse (300/mo), Parents (800/mo), Children (200/mo per child)
    - Top-up sum insured: 0.5% annual premium pro-rated monthly: (top_up * 0.005) / 12
    """
    # Calculate premium surcharge
    tier_base = Decimal("0.00")
    if payload.tier == "silver":
        tier_base = Decimal("500.00")
    elif payload.tier == "gold":
        tier_base = Decimal("1200.00")

    spouse_addon = Decimal("300.00") if payload.has_spouse else Decimal("0.00")
    parents_addon = Decimal("800.00") if payload.has_parents else Decimal("0.00")
    children_addon = Decimal("200.00") * Decimal(payload.children_count)
    top_up_addon = (payload.top_up_sum_insured * Decimal("0.005")) / Decimal("12.00")

    total_surcharge = tier_base + spouse_addon + parents_addon + children_addon + top_up_addon

    # Check existing enrollment
    query = select(InsuranceEnrollment).where(InsuranceEnrollment.employee_id == employee.id)
    res = await db.execute(query)
    enrollment = res.scalars().first()

    card_num = f"CH-{random.randint(100000, 999999)}"

    if enrollment:
        enrollment.tier = payload.tier
        enrollment.has_parents = payload.has_parents
        enrollment.has_spouse = payload.has_spouse
        enrollment.children_count = payload.children_count
        enrollment.top_up_sum_insured = payload.top_up_sum_insured
        enrollment.monthly_surcharge = total_surcharge
        enrollment.status = "active"
        if not enrollment.health_card_number:
            enrollment.health_card_number = card_num
    else:
        enrollment = InsuranceEnrollment(
            organization_id=employee.organization_id,
            employee_id=employee.id,
            tier=payload.tier,
            has_parents=payload.has_parents,
            has_spouse=payload.has_spouse,
            children_count=payload.children_count,
            top_up_sum_insured=payload.top_up_sum_insured,
            monthly_surcharge=total_surcharge,
            status="active",
            health_card_number=card_num,
            created_at=datetime.datetime.utcnow(),
            updated_at=datetime.datetime.utcnow()
        )
        db.add(enrollment)

    await db.commit()
    await db.refresh(enrollment)
    return enrollment


@router.get("/insurance/me", response_model=InsuranceEnrollmentResponse, dependencies=[Depends(require_feature_permission("insurance"))])
async def get_my_insurance(
    employee: Employee = Depends(get_current_employee),
    db: AsyncSession = Depends(get_db)
):
    query = select(InsuranceEnrollment).where(InsuranceEnrollment.employee_id == employee.id)
    res = await db.execute(query)
    enrollment = res.scalars().first()
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active insurance enrollment found")
    return enrollment


# =========================================================================
# 4. VEHICLE LEASING
# =========================================================================

@router.post("/vehicle-lease", response_model=VehicleLeaseResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_feature_permission("car-lease"))])
async def declare_vehicle_lease(
    payload: VehicleLeaseCreate,
    employee: Employee = Depends(get_current_employee),
    db: AsyncSession = Depends(get_db)
):
    """
    Opt for a Corporate Car Lease. Computes pre-tax monthly EMI (2.5% of ex-showroom price)
    and Income Tax Rule 3 taxable perquisite value based on engine capacity.
    """
    # Grade Allowance Car Cap validation
    grade_query = select(GradeAllowance).where(
        GradeAllowance.organization_id == employee.organization_id,
        GradeAllowance.grade == employee.grade
    )
    grade_res = await db.execute(grade_query)
    grade_allowance = grade_res.scalars().first()

    monthly_emi = (payload.ex_showroom_price * Decimal("0.025"))
    if grade_allowance and payload.lease_type == "lease":
        if monthly_emi > grade_allowance.car_lease_cap:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Calculated Lease EMI of ₹{monthly_emi:.2f} exceeds Grade Cap of ₹{grade_allowance.car_lease_cap}"
            )

    # Determine Engine Capacity mock from price
    engine_cc = 1200
    if payload.ex_showroom_price > Decimal("1000000.00"):
        engine_cc = 1800

    # Rule 3 Perquisite Math
    perk_base = Decimal("1800.00") if engine_cc <= 1600 else Decimal("2400.00")
    driver_surcharge = Decimal("900.00") if payload.has_driver else Decimal("0.00")
    perk_val = perk_base + driver_surcharge

    if payload.lease_type == "oyt":
        # Own your car has no perk value and no EMI pre-tax deduction
        monthly_emi = Decimal("0.00")
        perk_val = Decimal("0.00")

    # Check existing lease
    query = select(VehicleLease).where(VehicleLease.employee_id == employee.id)
    res = await db.execute(query)
    lease = res.scalars().first()

    if lease:
        lease.lease_type = payload.lease_type
        lease.car_model = payload.car_model
        lease.ex_showroom_price = payload.ex_showroom_price
        lease.lease_tenure_months = payload.lease_tenure_months
        lease.monthly_emi = monthly_emi
        lease.engine_capacity_cc = engine_cc
        lease.has_driver = payload.has_driver
        lease.perk_value = perk_val
        lease.status = "active"
    else:
        lease = VehicleLease(
            organization_id=employee.organization_id,
            employee_id=employee.id,
            lease_type=payload.lease_type,
            car_model=payload.car_model,
            ex_showroom_price=payload.ex_showroom_price,
            lease_tenure_months=payload.lease_tenure_months,
            monthly_emi=monthly_emi,
            engine_capacity_cc=engine_cc,
            has_driver=payload.has_driver,
            perk_value=perk_val,
            status="active",
            created_at=datetime.datetime.utcnow(),
            updated_at=datetime.datetime.utcnow()
        )
        db.add(lease)

    await db.commit()
    await db.refresh(lease)
    return lease


@router.get("/vehicle-lease/me", response_model=VehicleLeaseResponse, dependencies=[Depends(require_feature_permission("car-lease"))])
async def get_my_vehicle_lease(
    employee: Employee = Depends(get_current_employee),
    db: AsyncSession = Depends(get_db)
):
    query = select(VehicleLease).where(VehicleLease.employee_id == employee.id)
    res = await db.execute(query)
    lease = res.scalars().first()
    if not lease:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active vehicle lease found")
    return lease
