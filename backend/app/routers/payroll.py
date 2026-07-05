# app/routers/payroll.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.db.session import get_db
from app.models.models import (
    PayrollRun, Payslip, SalaryStructure, User, Employee,
    Attendance, FBPDeclaration, GradeAllowance, VehicleLease,
    TaxDeclaration, InsuranceEnrollment
)
from app.schemas.schemas import PayrollRunCreate, PayrollRunResponse, PayslipResponse, SalaryStructureCreate, SalaryStructureResponse
from app.routers.dependencies import get_current_user, get_current_employee, RoleChecker, require_subscription, require_feature_permission
import datetime
from datetime import date
import calendar
from typing import List, Optional
from uuid import UUID
from decimal import Decimal

router = APIRouter(prefix="/payroll", tags=["Payroll Management"], dependencies=[Depends(require_subscription("hr_team"))])

# Helper role dependencies
payroll_admin_only = Depends(RoleChecker(["hr_admin", "payroll_admin"]))

@router.post("/salary-structure", response_model=SalaryStructureResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_feature_permission("payroll"))])
async def create_or_update_salary_structure(
    payload: SalaryStructureCreate,
    current_user: User = Depends(get_current_user),
    _auth = payroll_admin_only,
    db: AsyncSession = Depends(get_db)
):
    """
    Configure or update the base salary structure (basic, HRA, allowances, deductions)
    for a specific employee within the organization.
    """
    # 1. Verify that employee exists in the organization
    emp_query = select(Employee).where(
        Employee.organization_id == current_user.organization_id,
        Employee.id == payload.employee_id
    )
    emp_result = await db.execute(emp_query)
    employee = emp_result.scalars().first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee profile not found in your organization"
        )

    # 2. Check if structure already exists
    struct_query = select(SalaryStructure).where(SalaryStructure.employee_id == payload.employee_id)
    struct_result = await db.execute(struct_query)
    existing_structure = struct_result.scalars().first()

    if existing_structure:
        existing_structure.basic = payload.basic
        existing_structure.hra = payload.hra
        existing_structure.allowances = payload.allowances
        existing_structure.pf = payload.pf
        existing_structure.tax = payload.tax
        existing_structure.nps = payload.nps
        existing_structure.other_deductions = payload.other_deductions
        existing_structure.custom_deductions = payload.custom_deductions
        structure = existing_structure
    else:
        structure = SalaryStructure(
            organization_id=current_user.organization_id,
            employee_id=payload.employee_id,
            basic=payload.basic,
            hra=payload.hra,
            allowances=payload.allowances,
            pf=payload.pf,
            tax=payload.tax,
            nps=payload.nps,
            other_deductions=payload.other_deductions,
            custom_deductions=payload.custom_deductions
        )
        db.add(structure)

    await db.commit()
    await db.refresh(structure)
    return structure


@router.post("/process", response_model=PayrollRunResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_feature_permission("payroll"))])
async def process_monthly_payroll(
    payload: PayrollRunCreate,
    current_user: User = Depends(get_current_user),
    _auth = payroll_admin_only,
    db: AsyncSession = Depends(get_db)
):
    """
    Run automated payroll math calculations for all active employees for a given month and year.
    Generates single payroll run batch with individual payslip records for auditing.
    """
    # 1. Prevent duplicate runs for the same month/year
    duplicate_query = select(PayrollRun).where(
        PayrollRun.organization_id == current_user.organization_id,
        PayrollRun.month == payload.month,
        PayrollRun.year == payload.year
    )
    dup_result = await db.execute(duplicate_query)
    if dup_result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payroll has already been processed for the period {payload.month}/{payload.year}"
        )

    # 2. Create Payroll Run Entry
    new_run = PayrollRun(
        organization_id=current_user.organization_id,
        month=payload.month,
        year=payload.year,
        status="processed",
        processed_by=current_user.id,
        processed_at=datetime.datetime.utcnow()
    )
    db.add(new_run)
    await db.flush()

    # 3. Retrieve all active employees in organization
    emp_query = select(Employee).where(
        Employee.organization_id == current_user.organization_id,
        Employee.employment_status == "active"
    )
    emp_result = await db.execute(emp_query)
    employees = emp_result.scalars().all()

    # 4. Generate Payslips
    payslips_count = 0
    days_in_month = calendar.monthrange(payload.year, payload.month)[1]
    start_date = date(payload.year, payload.month, 1)
    end_date = date(payload.year, payload.month, days_in_month)

    # Calculate financial year string (e.g. '2025-2026')
    if payload.month >= 4:
        fin_year = f"{payload.year}-{payload.year+1}"
    else:
        fin_year = f"{payload.year-1}-{payload.year}"

    for emp in employees:
        # Fetch their salary structure
        sal_query = select(SalaryStructure).where(SalaryStructure.employee_id == emp.id)
        sal_result = await db.execute(sal_query)
        salary = sal_result.scalars().first()

        if not salary:
            # Skip employees with unconfigured structures
            continue

        # A. Late Arrival Loss of Pay (LOP) Calculation
        attn_query = select(Attendance).where(
            Attendance.employee_id == emp.id,
            Attendance.organization_id == current_user.organization_id,
            Attendance.date >= start_date,
            Attendance.date <= end_date
        )
        attn_result = await db.execute(attn_query)
        attendance_logs = attn_result.scalars().all()
        
        late_count = sum(1 for a in attendance_logs if a.late_minutes > 15)
        lop_days = Decimal("0.0")
        if late_count >= 5:
            lop_days = Decimal("1.0")
        elif late_count >= 3:
            lop_days = Decimal("0.5")

        lop_deduction_basic = (lop_days / Decimal(days_in_month)) * salary.basic
        basic_earned = max(Decimal("0.00"), salary.basic - lop_deduction_basic)

        # B. EPF / FPF Split Calculation (Employer share & Employee PF deduction)
        # FPF is 8.33% of Basic Salary up to 15,000 ceiling (max 1250)
        pf_basis = min(basic_earned, Decimal("15000.00"))
        employee_pf = Decimal("0.12") * pf_basis
        fpf_share = Decimal("0.0833") * pf_basis
        employer_epf_share = (Decimal("0.12") * pf_basis) - fpf_share

        # C. Professional Tax (PT) Slab (standard slab: > 15000 Gross => 200, Feb => 250)
        # Gross before deductions (standard gross check)
        gross_payout_temp = basic_earned + salary.hra + salary.allowances
        pt_amount = Decimal("0.00")
        if gross_payout_temp > Decimal("15000.00"):
            if payload.month == 2:
                pt_amount = Decimal("250.00")
            else:
                pt_amount = Decimal("200.00")

        # D. FBP & Perks Exemption
        # Fetch approved FBP declaration for employee
        fbp_query = select(FBPDeclaration).where(
            FBPDeclaration.employee_id == emp.id,
            FBPDeclaration.organization_id == current_user.organization_id,
            FBPDeclaration.status == "approved"
        )
        fbp_result = await db.execute(fbp_query)
        fbp = fbp_result.scalars().first()

        fbp_claims = Decimal("0.00")
        if fbp:
            # Check grade allowance caps
            grade_query = select(GradeAllowance).where(
                GradeAllowance.organization_id == current_user.organization_id,
                GradeAllowance.grade == emp.grade
            )
            grade_result = await db.execute(grade_query)
            grade_allowance = grade_result.scalars().first()
            
            if grade_allowance:
                fuel_claim = min(fbp.fuel_amount, grade_allowance.fuel_cap)
                lta_claim = min(fbp.lta_amount, grade_allowance.lta_cap)
                phone_claim = min(fbp.phone_amount, grade_allowance.phone_cap)
                food_claim = min(fbp.food_amount, grade_allowance.food_cap)
                fbp_claims = fuel_claim + lta_claim + phone_claim + food_claim

        # E. Vehicle Lease Deduction & Car Perquisite
        lease_query = select(VehicleLease).where(
            VehicleLease.employee_id == emp.id,
            VehicleLease.organization_id == current_user.organization_id,
            VehicleLease.status == "active"
        )
        lease_result = await db.execute(lease_query)
        lease = lease_result.scalars().first()

        pre_tax_emi = Decimal("0.00")
        perk_value = Decimal("0.00")
        if lease:
            if lease.lease_type == "lease":
                pre_tax_emi = lease.monthly_emi
                
                # Rule 3 Car Perquisite Math
                base_perk = Decimal("1800.00") if lease.engine_capacity_cc <= 1600 else Decimal("2400.00")
                driver_surcharge = Decimal("900.00") if lease.has_driver else Decimal("0.00")
                perk_value = base_perk + driver_surcharge
                
                if lease.perk_value != perk_value:
                    lease.perk_value = perk_value
                    db.add(lease)

        # F. TDS Slabs Calculation (Old vs New Regime)
        tax_query = select(TaxDeclaration).where(
            TaxDeclaration.employee_id == emp.id,
            TaxDeclaration.organization_id == current_user.organization_id,
            TaxDeclaration.financial_year == fin_year,
            TaxDeclaration.status == "approved"
        )
        tax_result = await db.execute(tax_query)
        tax_declaration = tax_result.scalars().first()

        regime = "new"
        sec_80c = Decimal("0.00")
        sec_80d = Decimal("0.00")
        hra_rent = Decimal("0.00")
        landlord_pan = None
        
        if tax_declaration:
            regime = tax_declaration.regime
            sec_80c = tax_declaration.section_80c
            sec_80d = tax_declaration.section_80d
            hra_rent = tax_declaration.hra_rent_paid
            landlord_pan = tax_declaration.landlord_pan

        # Annualize Gross and taxable income
        # Pre-tax vehicle EMI reduces the gross taxable income
        annual_gross = (basic_earned + salary.hra + salary.allowances - pre_tax_emi) * 12
        annual_perk = perk_value * 12
        annual_taxable_gross = annual_gross + annual_perk

        annual_tax = Decimal("0.00")
        if regime == "old":
            # standard deduction 50k
            std_ded = Decimal("50000.00")
            
            # HRA Exemption Math (minimum of actual HRA, rent - 10% basic, or 50% basic)
            # If rent > 100k, landlord PAN is required. If missing, cap rent at 100k
            effective_rent = hra_rent
            if hra_rent > Decimal("100000.00") and (not landlord_pan or len(landlord_pan.strip()) != 10):
                effective_rent = Decimal("100000.00")
            
            basic_annual = basic_earned * 12
            hra_annual = salary.hra * 12
            hra_exemption = Decimal("0.00")
            if effective_rent > Decimal("0.00"):
                hra_exemption = max(
                    Decimal("0.00"),
                    min(
                        hra_annual,
                        effective_rent - (Decimal("0.10") * basic_annual),
                        Decimal("0.50") * basic_annual
                    )
                )

            ded_80c = min(sec_80c, Decimal("150000.00"))
            ded_80d = min(sec_80d, Decimal("25000.00"))
            annual_fbp_claims = fbp_claims * 12

            net_taxable_income = max(
                Decimal("0.00"),
                annual_taxable_gross - std_ded - ded_80c - ded_80d - hra_exemption - annual_fbp_claims
            )

            # Old Regime Slabs (2.5L, 5L, 10L)
            if net_taxable_income <= Decimal("500000.00"):
                # Tax rebate under 87A makes tax 0 for taxable income <= 5L
                tax_before_cess = Decimal("0.00")
            else:
                tax_before_cess = Decimal("0.00")
                remaining = net_taxable_income
                
                # 2.5L to 5L @ 5%
                if remaining > Decimal("250000.00"):
                    slab_amt = min(remaining - Decimal("250000.00"), Decimal("250000.00"))
                    tax_before_cess += slab_amt * Decimal("0.05")
                
                # 5L to 10L @ 20%
                if remaining > Decimal("500000.00"):
                    slab_amt = min(remaining - Decimal("500000.00"), Decimal("500000.00"))
                    tax_before_cess += slab_amt * Decimal("0.20")
                
                # Above 10L @ 30%
                if remaining > Decimal("1000000.00"):
                    slab_amt = remaining - Decimal("1000000.00")
                    tax_before_cess += slab_amt * Decimal("0.30")

            annual_tax = tax_before_cess * Decimal("1.04") # Add 4% Cess
        
        else: # New Regime
            # Standard deduction 75k
            std_ded = Decimal("75000.00")
            net_taxable_income = max(Decimal("0.00"), annual_taxable_gross - std_ded)
            
            if net_taxable_income <= Decimal("700000.00"):
                # Tax rebate under 87A for New Regime up to 7L
                tax_before_cess = Decimal("0.00")
            else:
                tax_before_cess = Decimal("0.00")
                remaining = net_taxable_income
                
                # 3L to 6L @ 5%
                if remaining > Decimal("300000.00"):
                    slab_amt = min(remaining - Decimal("300000.00"), Decimal("300000.00"))
                    tax_before_cess += slab_amt * Decimal("0.05")
                
                # 6L to 9L @ 10%
                if remaining > Decimal("600000.00"):
                    slab_amt = min(remaining - Decimal("600000.00"), Decimal("300000.00"))
                    tax_before_cess += slab_amt * Decimal("0.10")
                
                # 9L to 12L @ 15%
                if remaining > Decimal("900000.00"):
                    slab_amt = min(remaining - Decimal("900000.00"), Decimal("300000.00"))
                    tax_before_cess += slab_amt * Decimal("0.15")
                
                # 12L to 15L @ 20%
                if remaining > Decimal("1200000.00"):
                    slab_amt = min(remaining - Decimal("1200000.00"), Decimal("300000.00"))
                    tax_before_cess += slab_amt * Decimal("0.20")
                
                # Above 15L @ 30%
                if remaining > Decimal("1500000.00"):
                    slab_amt = remaining - Decimal("1500000.00")
                    tax_before_cess += slab_amt * Decimal("0.30")

            annual_tax = tax_before_cess * Decimal("1.04") # Add 4% Cess

        monthly_tds = annual_tax / Decimal("12.00")

        # G. Post-Tax Insurance Surcharge
        ins_query = select(InsuranceEnrollment).where(
            InsuranceEnrollment.employee_id == emp.id,
            InsuranceEnrollment.organization_id == current_user.organization_id,
            InsuranceEnrollment.status == "active"
        )
        ins_result = await db.execute(ins_query)
        ins_enrollment = ins_result.scalars().first()
        insurance_surcharge = Decimal("0.00")
        if ins_enrollment:
            insurance_surcharge = ins_enrollment.monthly_surcharge

        # H. Final Math
        gross_salary = basic_earned + salary.hra + salary.allowances
        
        # Calculate custom deductions sum
        custom_deductions_sum = Decimal("0.00")
        custom_deductions_dict = {}
        if salary.custom_deductions and isinstance(salary.custom_deductions, dict):
            for k, v in salary.custom_deductions.items():
                try:
                    val = Decimal(str(v))
                    custom_deductions_sum += val
                    custom_deductions_dict[k] = val
                except Exception:
                    pass

        # Deductions total: PF + Tax (TDS) + PT + Pre-tax Car Lease EMI + Post-tax Insurance Top-up Surcharge + Other base deductions + NPS + Custom deductions
        # Also include LOP deduction in total deductions to represent it transparently
        deductions = (
            employee_pf + monthly_tds + pt_amount + pre_tax_emi + 
            insurance_surcharge + salary.other_deductions + lop_deduction_basic +
            salary.nps + custom_deductions_sum
        )
        
        net_salary = max(Decimal("0.00"), gross_salary - deductions)

        new_payslip = Payslip(
            organization_id=current_user.organization_id,
            payroll_run_id=new_run.id,
            employee_id=emp.id,
            basic=basic_earned,
            hra=salary.hra,
            allowances=salary.allowances,
            bonus=Decimal("0.00"),
            gross_salary=gross_salary,
            pf=employee_pf,
            tax=monthly_tds,
            nps=salary.nps,
            professional_tax=pt_amount,
            deductions=deductions,
            net_salary=net_salary,
            custom_deductions=salary.custom_deductions,
            status="unpaid"
        )
        db.add(new_payslip)
        payslips_count += 1

    if payslips_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot process payroll. No employees in your organization have a configured Salary Structure."
        )

    await db.commit()
    await db.refresh(new_run)
    return new_run


@router.get("/runs", response_model=List[PayrollRunResponse], dependencies=[Depends(require_feature_permission("payroll"))])
async def list_payroll_runs(
    current_user: User = Depends(get_current_user),
    _auth = payroll_admin_only,
    db: AsyncSession = Depends(get_db)
):
    """
    List all historical payroll runs processed in the organization.
    """
    query = select(PayrollRun).where(PayrollRun.organization_id == current_user.organization_id).order_by(PayrollRun.year.desc(), PayrollRun.month.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/runs/{run_id}/payslips", response_model=List[PayslipResponse], dependencies=[Depends(require_feature_permission("payroll"))])
async def list_payslips_for_run(
    run_id: UUID,
    current_user: User = Depends(get_current_user),
    _auth = payroll_admin_only,
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch all generated payslips inside a specific payroll run.
    """
    query = select(Payslip).options(selectinload(Payslip.employee)).where(
        Payslip.organization_id == current_user.organization_id,
        Payslip.payroll_run_id == run_id
    )
    result = await db.execute(query)
    payslips = result.scalars().all()

    responses = []
    for p in payslips:
        resp = PayslipResponse.from_orm(p)
        resp.employee_name = f"{p.employee.first_name} {p.employee.last_name}"
        responses.append(resp)

    return responses


@router.get("/payslips/me", response_model=List[PayslipResponse])
async def read_my_payslips(
    employee: Employee = Depends(get_current_employee),
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch the currently logged-in employee's own payroll history payslips.
    """
    query = select(Payslip).where(Payslip.employee_id == employee.id).order_by(Payslip.created_at.desc())
    result = await db.execute(query)
    payslips = result.scalars().all()

    responses = []
    for p in payslips:
        resp = PayslipResponse.from_orm(p)
        resp.employee_name = f"{employee.first_name} {employee.last_name}"
        responses.append(resp)

    return responses
