# app/routers/reports.py
"""
HRMS-Engine HR Reports Engine
Generates structured analytical reports across all HR modules.
All reports are scoped to the requesting user's organization (multi-tenant safe).
HR Admin / Finance Admin only.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, extract
from app.db.session import get_db
from app.models.models import (
    User, Employee, Department, Designation,
    Attendance, LeaveBalance, LeaveRequest,
    SalaryStructure, PayrollRun, Payslip,
    InsuranceEnrollment, VehicleLease,
    PerformanceReview, PerformanceKRA,
    PromotionRecommendation,
    OffboardingRequest, FinalSettlement,
    TaxDeclaration, FBPDeclaration
)
from app.routers.dependencies import get_current_user, RoleChecker
import datetime
from decimal import Decimal
from typing import List, Optional, Dict, Any

router = APIRouter(prefix="/reports", tags=["HR Reports & Analytics"])

hr_admin_only = Depends(RoleChecker(["hr_admin", "finance_admin", "payroll_admin"]))


# ─────────────────────────────────────────────────────────────────────────────
# UTILITY
# ─────────────────────────────────────────────────────────────────────────────
def _fmt(val) -> float:
    if val is None:
        return 0.0
    try:
        return float(val)
    except Exception:
        return 0.0


# ─────────────────────────────────────────────────────────────────────────────
# 1. WORKFORCE HEADCOUNT REPORT
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/workforce/headcount")
async def headcount_report(
    current_user: User = Depends(get_current_user),
    _auth=hr_admin_only,
    db: AsyncSession = Depends(get_db),
):
    """
    Workforce headcount breakdown by department, grade, gender, employment type,
    and employment status. Includes attrition and new joiner counts for the current year.
    """
    org_id = current_user.organization_id
    current_year = datetime.date.today().year

    # All active employees in org
    emp_q = await db.execute(
        select(Employee).where(Employee.organization_id == org_id)
    )
    employees = emp_q.scalars().all()

    # Department map
    dept_q = await db.execute(
        select(Department).where(Department.organization_id == org_id)
    )
    departments = {d.id: d.name for d in dept_q.scalars().all()}

    total = len(employees)
    active = sum(1 for e in employees if e.employment_status == "active")
    inactive = total - active

    # By department
    dept_counts: Dict[str, int] = {}
    for e in employees:
        if e.employment_status != "active":
            continue
        dname = departments.get(e.department_id, "Unassigned") if e.department_id else "Unassigned"
        dept_counts[dname] = dept_counts.get(dname, 0) + 1

    # By grade
    grade_counts: Dict[str, int] = {}
    for e in employees:
        if e.employment_status != "active":
            continue
        g = e.grade or "Unknown"
        grade_counts[g] = grade_counts.get(g, 0) + 1

    # By gender
    gender_counts: Dict[str, int] = {}
    for e in employees:
        if e.employment_status != "active":
            continue
        gn = (e.gender or "Not Specified").capitalize()
        gender_counts[gn] = gender_counts.get(gn, 0) + 1

    # By employment type
    type_counts: Dict[str, int] = {}
    for e in employees:
        if e.employment_status != "active":
            continue
        t = e.employment_type or "Unknown"
        type_counts[t] = type_counts.get(t, 0) + 1

    # New joiners this year
    new_joiners = sum(
        1 for e in employees
        if e.joining_date and e.joining_date.year == current_year
    )

    # Exits this year
    exits_this_year = sum(
        1 for e in employees
        if e.exit_date and e.exit_date.year == current_year
    )

    # Monthly joiner trend (last 6 months)
    today = datetime.date.today()
    monthly_trend = []
    for i in range(5, -1, -1):
        month_dt = (today.replace(day=1) - datetime.timedelta(days=i * 28))
        m, y = month_dt.month, month_dt.year
        count = sum(
            1 for e in employees
            if e.joining_date and e.joining_date.year == y and e.joining_date.month == m
        )
        monthly_trend.append({
            "month": datetime.date(y, m, 1).strftime("%b %Y"),
            "count": count
        })

    return {
        "report_name": "Workforce Headcount Report",
        "generated_at": datetime.datetime.utcnow().isoformat(),
        "summary": {
            "total_employees": total,
            "active": active,
            "inactive": inactive,
            "new_joiners_ytd": new_joiners,
            "exits_ytd": exits_this_year,
            "attrition_rate_pct": round((exits_this_year / max(total, 1)) * 100, 1)
        },
        "by_department": [{"department": k, "count": v} for k, v in sorted(dept_counts.items(), key=lambda x: -x[1])],
        "by_grade": [{"grade": k, "count": v} for k, v in sorted(grade_counts.items())],
        "by_gender": [{"gender": k, "count": v} for k, v in gender_counts.items()],
        "by_employment_type": [{"type": k, "count": v} for k, v in type_counts.items()],
        "monthly_joiner_trend": monthly_trend
    }


# ─────────────────────────────────────────────────────────────────────────────
# 2. PAYROLL COST REPORT
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/payroll/cost-summary")
async def payroll_cost_report(
    year: int = Query(default=2026),
    current_user: User = Depends(get_current_user),
    _auth=hr_admin_only,
    db: AsyncSession = Depends(get_db),
):
    """
    Monthly payroll cost summary for the year: gross payroll, total PF contributions,
    total TDS deductions, net payout, department-wise cost breakdown.
    """
    org_id = current_user.organization_id

    # All payroll runs for the year
    runs_q = await db.execute(
        select(PayrollRun).where(
            PayrollRun.organization_id == org_id,
            PayrollRun.year == year
        )
    )
    runs = runs_q.scalars().all()
    run_ids = [r.id for r in runs]

    if not run_ids:
        return {
            "report_name": "Payroll Cost Report",
            "year": year,
            "generated_at": datetime.datetime.utcnow().isoformat(),
            "summary": {"total_gross": 0, "total_pf": 0, "total_tds": 0, "total_net": 0},
            "monthly_breakdown": [],
            "department_cost": []
        }

    # Payslips for these runs
    slips_q = await db.execute(
        select(Payslip).where(
            Payslip.payroll_run_id.in_(run_ids)
        )
    )
    payslips = slips_q.scalars().all()

    # Build run_id -> month map
    run_month = {r.id: r.month for r in runs}

    # Monthly aggregates
    monthly: Dict[int, Dict] = {}
    for ps in payslips:
        m = run_month.get(ps.payroll_run_id, 0)
        if m not in monthly:
            monthly[m] = {"gross": 0.0, "pf": 0.0, "tds": 0.0, "net": 0.0, "count": 0}
        monthly[m]["gross"] += _fmt(ps.gross_salary)
        monthly[m]["pf"]    += _fmt(ps.pf)
        monthly[m]["tds"]   += _fmt(ps.tax)
        monthly[m]["net"]   += _fmt(ps.net_salary)
        monthly[m]["count"] += 1

    monthly_breakdown = [
        {
            "month": datetime.date(year, m, 1).strftime("%b"),
            "month_num": m,
            "gross_payroll": round(monthly[m]["gross"], 2),
            "total_pf": round(monthly[m]["pf"], 2),
            "total_tds": round(monthly[m]["tds"], 2),
            "net_payout": round(monthly[m]["net"], 2),
            "employee_count": monthly[m]["count"]
        }
        for m in sorted(monthly.keys())
    ]

    # Department cost (from salary structure)
    emps_q = await db.execute(
        select(Employee).where(
            Employee.organization_id == org_id,
            Employee.employment_status == "active"
        )
    )
    employees = emps_q.scalars().all()

    dept_q = await db.execute(
        select(Department).where(Department.organization_id == org_id)
    )
    departments = {d.id: d.name for d in dept_q.scalars().all()}

    sal_q = await db.execute(
        select(SalaryStructure).where(SalaryStructure.organization_id == org_id)
    )
    salary_map = {s.employee_id: s for s in sal_q.scalars().all()}

    dept_cost: Dict[str, float] = {}
    for e in employees:
        dname = departments.get(e.department_id, "Unassigned") if e.department_id else "Unassigned"
        sal = salary_map.get(e.id)
        if sal:
            gross = _fmt(sal.basic) + _fmt(sal.hra) + _fmt(sal.allowances)
            dept_cost[dname] = dept_cost.get(dname, 0.0) + gross

    total_gross = sum(m["gross"] for m in monthly.values())
    total_pf    = sum(m["pf"]    for m in monthly.values())
    total_tds   = sum(m["tds"]   for m in monthly.values())
    total_net   = sum(m["net"]   for m in monthly.values())

    return {
        "report_name": "Payroll Cost Report",
        "year": year,
        "generated_at": datetime.datetime.utcnow().isoformat(),
        "summary": {
            "total_gross": round(total_gross, 2),
            "total_pf": round(total_pf, 2),
            "total_tds": round(total_tds, 2),
            "total_net": round(total_net, 2),
            "months_processed": len(monthly)
        },
        "monthly_breakdown": monthly_breakdown,
        "department_cost": [
            {"department": k, "monthly_cost": round(v, 2)}
            for k, v in sorted(dept_cost.items(), key=lambda x: -x[1])
        ]
    }


# ─────────────────────────────────────────────────────────────────────────────
# 3. LEAVE UTILIZATION REPORT
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/leave/utilization")
async def leave_utilization_report(
    year: int = Query(default=2026),
    current_user: User = Depends(get_current_user),
    _auth=hr_admin_only,
    db: AsyncSession = Depends(get_db),
):
    """
    Leave utilization: allocation vs used vs remaining per employee and leave type.
    Highlights employees with high unused leave liability.
    """
    org_id = current_user.organization_id

    # Employees
    emps_q = await db.execute(
        select(Employee).where(
            Employee.organization_id == org_id,
            Employee.employment_status == "active"
        )
    )
    employees = {e.id: e for e in emps_q.scalars().all()}

    # Leave balances
    bal_q = await db.execute(
        select(LeaveBalance).where(
            LeaveBalance.organization_id == org_id,
            LeaveBalance.year == year
        )
    )
    balances = bal_q.scalars().all()

    # Leave requests (approved)
    req_q = await db.execute(
        select(LeaveRequest).where(
            LeaveRequest.organization_id == org_id,
            LeaveRequest.status == "approved"
        )
    )
    requests = req_q.scalars().all()

    # By leave type aggregates
    type_agg: Dict[str, Dict] = {}
    for b in balances:
        lt = b.leave_type
        if lt not in type_agg:
            type_agg[lt] = {"allocated": 0.0, "used": 0.0}
        type_agg[lt]["allocated"] += _fmt(b.allocated)
        type_agg[lt]["used"]      += _fmt(b.used)

    # Per employee utilization
    emp_utilization = []
    emp_bal_map: Dict[str, Dict[str, LeaveBalance]] = {}
    for b in balances:
        eid = str(b.employee_id)
        if eid not in emp_bal_map:
            emp_bal_map[eid] = {}
        emp_bal_map[eid][b.leave_type] = b

    for emp_id_str, type_map in emp_bal_map.items():
        import uuid
        try:
            emp_uuid = uuid.UUID(emp_id_str)
        except Exception:
            continue
        emp = employees.get(emp_uuid)
        if not emp:
            continue
        total_alloc = sum(_fmt(b.allocated) for b in type_map.values())
        total_used  = sum(_fmt(b.used) for b in type_map.values())
        util_pct    = round((total_used / max(total_alloc, 1)) * 100, 1)
        emp_utilization.append({
            "employee_id": emp.employee_id,
            "employee_name": f"{emp.first_name} {emp.last_name}",
            "grade": emp.grade,
            "total_allocated": total_alloc,
            "total_used": total_used,
            "total_remaining": round(total_alloc - total_used, 1),
            "utilization_pct": util_pct
        })

    emp_utilization.sort(key=lambda x: -x["utilization_pct"])

    # Pending requests count
    pending_q = await db.execute(
        select(LeaveRequest).where(
            LeaveRequest.organization_id == org_id,
            LeaveRequest.status == "pending"
        )
    )
    pending_count = len(pending_q.scalars().all())

    return {
        "report_name": "Leave Utilization Report",
        "year": year,
        "generated_at": datetime.datetime.utcnow().isoformat(),
        "summary": {
            "total_leave_days_allocated": round(sum(a["allocated"] for a in type_agg.values()), 1),
            "total_leave_days_used": round(sum(a["used"] for a in type_agg.values()), 1),
            "pending_requests": pending_count,
            "overall_utilization_pct": round(
                sum(a["used"] for a in type_agg.values()) /
                max(sum(a["allocated"] for a in type_agg.values()), 1) * 100, 1
            )
        },
        "by_leave_type": [
            {
                "leave_type": lt,
                "allocated": round(v["allocated"], 1),
                "used": round(v["used"], 1),
                "remaining": round(v["allocated"] - v["used"], 1),
                "utilization_pct": round(v["used"] / max(v["allocated"], 1) * 100, 1)
            }
            for lt, v in type_agg.items()
        ],
        "employee_utilization": emp_utilization
    }


# ─────────────────────────────────────────────────────────────────────────────
# 4. INSURANCE COVERAGE REPORT
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/insurance/coverage")
async def insurance_coverage_report(
    current_user: User = Depends(get_current_user),
    _auth=hr_admin_only,
    db: AsyncSession = Depends(get_db),
):
    """
    Corporate health insurance enrollment summary: coverage tiers, dependent counts,
    top-up adoption rates, and total annual premium liability.
    """
    org_id = current_user.organization_id

    emps_q = await db.execute(
        select(Employee).where(
            Employee.organization_id == org_id,
            Employee.employment_status == "active"
        )
    )
    employees = emps_q.scalars().all()
    total_active = len(employees)

    enroll_q = await db.execute(
        select(InsuranceEnrollment).where(InsuranceEnrollment.organization_id == org_id)
    )
    enrollments = enroll_q.scalars().all()
    enrolled_ids = {e.employee_id for e in enrollments}

    emp_map = {e.id: e for e in employees}

    unenrolled = total_active - len([e for e in enrollments if e.employee_id in {emp.id for emp in employees}])

    # Tier distribution
    tier_counts: Dict[str, int] = {}
    total_dependents = 0
    topup_count = 0
    total_premium = 0.0

    enrollment_details = []
    for enr in enrollments:
        emp = emp_map.get(enr.employee_id)
        if not emp:
            continue
        tier = enr.coverage_tier or "Basic"
        tier_counts[tier] = tier_counts.get(tier, 0) + 1
        deps = enr.dependents_count or 0
        total_dependents += deps
        has_topup = bool(enr.topup_plan)
        if has_topup:
            topup_count += 1
        premium = _fmt(enr.annual_premium) + _fmt(getattr(enr, "topup_premium", None) or 0)
        total_premium += premium
        enrollment_details.append({
            "employee_id": emp.employee_id,
            "employee_name": f"{emp.first_name} {emp.last_name}",
            "grade": emp.grade,
            "coverage_tier": tier,
            "dependents": deps,
            "has_topup": has_topup,
            "topup_plan": enr.topup_plan,
            "annual_premium": round(premium, 2),
            "enrollment_status": enr.status
        })

    enrollment_details.sort(key=lambda x: x["employee_name"])

    return {
        "report_name": "Insurance Coverage Report",
        "generated_at": datetime.datetime.utcnow().isoformat(),
        "summary": {
            "total_active_employees": total_active,
            "enrolled": len(enrollments),
            "unenrolled": max(unenrolled, 0),
            "enrollment_rate_pct": round(len(enrollments) / max(total_active, 1) * 100, 1),
            "total_dependents_covered": total_dependents,
            "topup_adopters": topup_count,
            "topup_adoption_pct": round(topup_count / max(len(enrollments), 1) * 100, 1),
            "total_annual_premium": round(total_premium, 2)
        },
        "by_tier": [{"tier": k, "count": v} for k, v in sorted(tier_counts.items())],
        "enrollment_details": enrollment_details
    }


# ─────────────────────────────────────────────────────────────────────────────
# 5. VEHICLE / CAR LEASE REPORT
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/vehicle-lease/portfolio")
async def car_lease_portfolio_report(
    current_user: User = Depends(get_current_user),
    _auth=hr_admin_only,
    db: AsyncSession = Depends(get_db),
):
    """
    Active corporate car lease portfolio: lease type distribution, perquisite value
    tax liability summary, EMI totals, and upcoming lease expiry alerts.
    """
    org_id = current_user.organization_id

    emps_q = await db.execute(
        select(Employee).where(
            Employee.organization_id == org_id,
            Employee.employment_status == "active"
        )
    )
    emp_map = {e.id: e for e in emps_q.scalars().all()}
    total_active = len(emp_map)

    lease_q = await db.execute(
        select(VehicleLease).where(VehicleLease.organization_id == org_id)
    )
    leases = lease_q.scalars().all()

    active_leases   = [l for l in leases if l.status == "active"]
    expired_leases  = [l for l in leases if l.status == "expired"]
    pending_leases  = [l for l in leases if l.status in ("pending", "draft")]

    total_emi       = sum(_fmt(l.monthly_emi) for l in active_leases)
    total_perq      = sum(_fmt(getattr(l, "perquisite_value", None) or 0) for l in active_leases)
    total_tax_liab  = sum(_fmt(getattr(l, "annual_perquisite_tax", None) or 0) for l in active_leases)

    # By lease type
    lease_type_counts: Dict[str, int] = {}
    for l in active_leases:
        lt = l.lease_type or "Corporate"
        lease_type_counts[lt] = lease_type_counts.get(lt, 0) + 1

    today = datetime.date.today()
    expiring_soon = []
    for l in active_leases:
        if l.lease_end_date:
            days_left = (l.lease_end_date - today).days
            if 0 < days_left <= 90:
                emp = emp_map.get(l.employee_id)
                expiring_soon.append({
                    "employee_id": emp.employee_id if emp else "N/A",
                    "employee_name": f"{emp.first_name} {emp.last_name}" if emp else "Unknown",
                    "vehicle_model": l.vehicle_model or "N/A",
                    "lease_end_date": l.lease_end_date.isoformat(),
                    "days_remaining": days_left
                })

    lease_details = []
    for l in active_leases:
        emp = emp_map.get(l.employee_id)
        if not emp:
            continue
        lease_details.append({
            "employee_id": emp.employee_id,
            "employee_name": f"{emp.first_name} {emp.last_name}",
            "grade": emp.grade,
            "vehicle_model": l.vehicle_model or "N/A",
            "lease_type": l.lease_type or "Corporate",
            "monthly_emi": _fmt(l.monthly_emi),
            "perquisite_value": _fmt(getattr(l, "perquisite_value", None) or 0),
            "lease_start": l.lease_start_date.isoformat() if l.lease_start_date else None,
            "lease_end": l.lease_end_date.isoformat() if l.lease_end_date else None,
            "status": l.status
        })

    return {
        "report_name": "Vehicle Lease Portfolio Report",
        "generated_at": datetime.datetime.utcnow().isoformat(),
        "summary": {
            "total_active_employees": total_active,
            "active_leases": len(active_leases),
            "pending_leases": len(pending_leases),
            "expired_leases": len(expired_leases),
            "adoption_rate_pct": round(len(active_leases) / max(total_active, 1) * 100, 1),
            "total_monthly_emi": round(total_emi, 2),
            "total_annual_perquisite_value": round(total_perq * 12, 2),
            "total_annual_perquisite_tax_liability": round(total_tax_liab, 2)
        },
        "by_lease_type": [{"type": k, "count": v} for k, v in lease_type_counts.items()],
        "expiring_within_90_days": sorted(expiring_soon, key=lambda x: x["days_remaining"]),
        "lease_details": lease_details
    }


# ─────────────────────────────────────────────────────────────────────────────
# 6. PERFORMANCE & APPRAISAL REPORT
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/performance/appraisal-summary")
async def performance_appraisal_report(
    review_cycle: str = Query(default="Q1-2026"),
    current_user: User = Depends(get_current_user),
    _auth=hr_admin_only,
    db: AsyncSession = Depends(get_db),
):
    """
    Appraisal completion rates, bell curve distribution, self vs manager rating gaps,
    and top/bottom performers for a given review cycle.
    """
    org_id = current_user.organization_id

    emps_q = await db.execute(
        select(Employee).where(
            Employee.organization_id == org_id,
            Employee.employment_status == "active"
        )
    )
    employees = {e.id: e for e in emps_q.scalars().all()}
    total_active = len(employees)

    rev_q = await db.execute(
        select(PerformanceReview).where(
            PerformanceReview.organization_id == org_id,
            PerformanceReview.review_cycle == review_cycle
        )
    )
    reviews = rev_q.scalars().all()

    submitted   = [r for r in reviews if r.self_rating is not None]
    manager_rev = [r for r in reviews if r.manager_rating is not None]

    # Bell curve distribution
    bell_curve: Dict[str, int] = {"Top Performer": 0, "High Performer": 0, "Core Performer": 0, "Needs Improvement": 0}
    for r in manager_rev:
        cat = r.bell_curve_category or "Core Performer"
        if cat in bell_curve:
            bell_curve[cat] += 1
        else:
            bell_curve["Core Performer"] += 1

    # Rating gap analysis
    rating_gaps = []
    for r in manager_rev:
        if r.self_rating and r.manager_rating:
            emp = employees.get(r.employee_id)
            if emp:
                gap = _fmt(r.self_rating) - _fmt(r.manager_rating)
                rating_gaps.append({
                    "employee_id": emp.employee_id,
                    "employee_name": f"{emp.first_name} {emp.last_name}",
                    "grade": emp.grade,
                    "self_rating": _fmt(r.self_rating),
                    "manager_rating": _fmt(r.manager_rating),
                    "gap": round(gap, 2),
                    "bell_curve_category": r.bell_curve_category or "Core Performer"
                })

    rating_gaps.sort(key=lambda x: abs(x["gap"]), reverse=True)

    avg_self    = round(sum(_fmt(r.self_rating) for r in submitted if r.self_rating) / max(len(submitted), 1), 2)
    avg_manager = round(sum(_fmt(r.manager_rating) for r in manager_rev if r.manager_rating) / max(len(manager_rev), 1), 2)

    # Top performers
    top = sorted(rating_gaps, key=lambda x: -x["manager_rating"])[:3]
    bottom = sorted(rating_gaps, key=lambda x: x["manager_rating"])[:3]

    return {
        "report_name": "Performance Appraisal Report",
        "review_cycle": review_cycle,
        "generated_at": datetime.datetime.utcnow().isoformat(),
        "summary": {
            "total_active_employees": total_active,
            "self_reviews_submitted": len(submitted),
            "manager_reviews_completed": len(manager_rev),
            "completion_rate_pct": round(len(submitted) / max(total_active, 1) * 100, 1),
            "average_self_rating": avg_self,
            "average_manager_rating": avg_manager,
            "rating_inflation": round(avg_self - avg_manager, 2)
        },
        "bell_curve_distribution": [
            {"category": k, "count": v, "pct": round(v / max(len(manager_rev), 1) * 100, 1)}
            for k, v in bell_curve.items()
        ],
        "top_performers": top,
        "bottom_performers": bottom,
        "rating_gap_analysis": rating_gaps
    }


# ─────────────────────────────────────────────────────────────────────────────
# 7. AI PROMOTION PIPELINE REPORT
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/promotions/pipeline")
async def promotion_pipeline_report(
    current_user: User = Depends(get_current_user),
    _auth=hr_admin_only,
    db: AsyncSession = Depends(get_db),
):
    """
    AI-powered promotion readiness pipeline: grade-wise talent distribution,
    average readiness scores, compensation impact, and high-readiness candidates.
    """
    org_id = current_user.organization_id

    emps_q = await db.execute(
        select(Employee).where(
            Employee.organization_id == org_id,
            Employee.employment_status == "active"
        )
    )
    employees = {e.id: e for e in emps_q.scalars().all()}

    promo_q = await db.execute(
        select(PromotionRecommendation).where(
            PromotionRecommendation.organization_id == org_id
        )
    )
    recommendations = promo_q.scalars().all()

    # Latest recommendation per employee
    latest: Dict[str, PromotionRecommendation] = {}
    for r in recommendations:
        eid = str(r.employee_id)
        if eid not in latest or r.created_at > latest[eid].created_at:
            latest[eid] = r

    # Grade pipeline
    grade_pipeline: Dict[str, Dict] = {}
    high_readiness = []
    total_comp_impact = 0.0

    for eid_str, rec in latest.items():
        import uuid
        try:
            emp_uuid = uuid.UUID(eid_str)
        except Exception:
            continue
        emp = employees.get(emp_uuid)
        if not emp:
            continue

        grade = emp.grade or "Unknown"
        if grade not in grade_pipeline:
            grade_pipeline[grade] = {"count": 0, "scores": [], "ready_count": 0}
        grade_pipeline[grade]["count"] += 1

        score = _fmt(rec.ai_score)
        grade_pipeline[grade]["scores"].append(score)

        comp_pct = _fmt(rec.comp_adjustment_pct)
        if score >= 70:
            grade_pipeline[grade]["ready_count"] += 1
            comp_impact = _fmt(
                next((s.basic for s in [] if True), 0)  # placeholder
            )
            high_readiness.append({
                "employee_id": emp.employee_id,
                "employee_name": f"{emp.first_name} {emp.last_name}",
                "current_grade": emp.grade,
                "target_grade": rec.target_grade,
                "ai_score": round(score, 1),
                "comp_adjustment_pct": comp_pct,
                "recommendation_status": rec.status,
                "ai_summary": (rec.ai_summary or "")[:120] + "..." if rec.ai_summary and len(rec.ai_summary) > 120 else (rec.ai_summary or "")
            })
        total_comp_impact += comp_pct

    pipeline_summary = [
        {
            "grade": g,
            "total": v["count"],
            "analyzed": len(v["scores"]),
            "promotion_ready": v["ready_count"],
            "avg_readiness_score": round(sum(v["scores"]) / max(len(v["scores"]), 1), 1),
            "readiness_rate_pct": round(v["ready_count"] / max(v["count"], 1) * 100, 1)
        }
        for g, v in sorted(grade_pipeline.items())
    ]

    high_readiness.sort(key=lambda x: -x["ai_score"])

    return {
        "report_name": "AI Promotion Pipeline Report",
        "generated_at": datetime.datetime.utcnow().isoformat(),
        "summary": {
            "total_employees_analyzed": len(latest),
            "promotion_ready_count": sum(1 for r in high_readiness),
            "avg_organization_readiness_score": round(
                sum(_fmt(r.ai_score) for r in recommendations) / max(len(recommendations), 1), 1
            ),
            "total_recommendations": len(recommendations)
        },
        "grade_pipeline": pipeline_summary,
        "high_readiness_candidates": high_readiness
    }


# ─────────────────────────────────────────────────────────────────────────────
# 8. EXIT & ATTRITION REPORT
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/exit/attrition-summary")
async def exit_attrition_report(
    year: int = Query(default=2026),
    current_user: User = Depends(get_current_user),
    _auth=hr_admin_only,
    db: AsyncSession = Depends(get_db),
):
    """
    Exit & attrition summary: resignation trends, average tenure at exit,
    F&F settlement total liability, gratuity payouts, and pending clearances.
    """
    org_id = current_user.organization_id

    emps_q = await db.execute(
        select(Employee).where(Employee.organization_id == org_id)
    )
    employees = {e.id: e for e in emps_q.scalars().all()}

    exit_q = await db.execute(
        select(OffboardingRequest).where(
            OffboardingRequest.organization_id == org_id
        )
    )
    exits = exit_q.scalars().all()

    settle_q = await db.execute(
        select(FinalSettlement).where(
            FinalSettlement.organization_id == org_id
        )
    )
    settlements = settle_q.scalars().all()
    settle_map = {str(s.offboarding_request_id): s for s in settlements}

    # Filter exits for the year
    year_exits = [
        e for e in exits
        if e.resignation_date and e.resignation_date.year == year
    ]

    status_counts: Dict[str, int] = {}
    for e in exits:
        status_counts[e.status] = status_counts.get(e.status, 0) + 1

    # Tenure at exit
    tenures = []
    for ex in year_exits:
        emp = employees.get(ex.employee_id)
        if emp and emp.joining_date:
            resign_date = ex.resignation_date
            tenure_days = (resign_date - emp.joining_date).days
            tenures.append(tenure_days / 365.25)

    avg_tenure = round(sum(tenures) / max(len(tenures), 1), 1) if tenures else 0.0

    # Settlement financials
    total_gratuity = sum(_fmt(s.gratuity_amount) for s in settlements)
    total_encash = sum(_fmt(s.leave_encashment_amount) for s in settlements)
    total_ff = sum(_fmt(s.total_settlement_amount) for s in settlements)
    pending_ff = sum(1 for s in settlements if s.status == "draft")
    paid_ff    = sum(1 for s in settlements if s.status == "paid")

    # Clearance bottlenecks
    pending_it = sum(1 for e in exits if e.it_clearance_status == "pending" and e.status not in ("completed", "rejected"))
    pending_hr = sum(1 for e in exits if e.hr_clearance_status == "pending" and e.status not in ("completed", "rejected"))
    pending_fin = sum(1 for e in exits if e.finance_clearance_status == "pending" and e.status not in ("completed", "rejected"))

    # Exit detail list
    exit_details = []
    for ex in exits:
        emp = employees.get(ex.employee_id)
        if not emp:
            continue
        settle = settle_map.get(str(ex.id))
        tenure_days = (ex.resignation_date - emp.joining_date).days if emp.joining_date else 0
        exit_details.append({
            "employee_id": emp.employee_id,
            "employee_name": f"{emp.first_name} {emp.last_name}",
            "grade": emp.grade,
            "resignation_date": ex.resignation_date.isoformat() if ex.resignation_date else None,
            "tenure_years": round(tenure_days / 365.25, 1),
            "status": ex.status,
            "gratuity": _fmt(settle.gratuity_amount) if settle else 0.0,
            "total_settlement": _fmt(settle.total_settlement_amount) if settle else 0.0,
            "it_clearance": ex.it_clearance_status,
            "hr_clearance": ex.hr_clearance_status,
            "finance_clearance": ex.finance_clearance_status,
            "initiation_type": getattr(ex, "initiation_type", "employee")
        })

    return {
        "report_name": "Exit & Attrition Report",
        "year": year,
        "generated_at": datetime.datetime.utcnow().isoformat(),
        "summary": {
            "total_exits": len(exits),
            "exits_this_year": len(year_exits),
            "average_tenure_at_exit_years": avg_tenure,
            "total_gratuity_paid": round(total_gratuity, 2),
            "total_leave_encashment": round(total_encash, 2),
            "total_ff_liability": round(total_ff, 2),
            "pending_ff_settlements": pending_ff,
            "paid_ff_settlements": paid_ff
        },
        "by_status": [{"status": k, "count": v} for k, v in status_counts.items()],
        "clearance_bottlenecks": {
            "it_pending": pending_it,
            "hr_pending": pending_hr,
            "finance_pending": pending_fin
        },
        "exit_details": sorted(exit_details, key=lambda x: x["resignation_date"] or "", reverse=True)
    }


# ─────────────────────────────────────────────────────────────────────────────
# 9. STATUTORY COMPLIANCE REPORT (EPF + PT + TDS)
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/compliance/statutory")
async def statutory_compliance_report(
    month: int = Query(default=datetime.date.today().month),
    year: int = Query(default=datetime.date.today().year),
    current_user: User = Depends(get_current_user),
    _auth=hr_admin_only,
    db: AsyncSession = Depends(get_db),
):
    """
    Monthly statutory compliance report: EPF challan data (employee + employer contributions),
    Professional Tax deductions, and TDS (Income Tax) liability per employee.
    Ready for filing with EPFO, state PT authorities, and Income Tax department.
    """
    org_id = current_user.organization_id

    emps_q = await db.execute(
        select(Employee).where(
            Employee.organization_id == org_id,
            Employee.employment_status == "active"
        )
    )
    emp_map = {e.id: e for e in emps_q.scalars().all()}

    run_q = await db.execute(
        select(PayrollRun).where(
            PayrollRun.organization_id == org_id,
            PayrollRun.month == month,
            PayrollRun.year == year
        )
    )
    run = run_q.scalars().first()

    if not run:
        return {
            "report_name": "Statutory Compliance Report",
            "month": month, "year": year,
            "generated_at": datetime.datetime.utcnow().isoformat(),
            "message": f"No payroll run found for {month}/{year}. Process payroll first.",
            "epf_challan": [], "pt_register": [], "tds_register": [],
            "summary": {"total_epf_employee": 0, "total_epf_employer": 0, "total_pt": 0, "total_tds": 0}
        }

    slips_q = await db.execute(
        select(Payslip).where(Payslip.payroll_run_id == run.id)
    )
    payslips = slips_q.scalars().all()

    sal_q = await db.execute(
        select(SalaryStructure).where(SalaryStructure.organization_id == org_id)
    )
    sal_map = {s.employee_id: s for s in sal_q.scalars().all()}

    epf_challan = []
    pt_register = []
    tds_register = []

    total_epf_emp = 0.0
    total_epf_er  = 0.0
    total_pt      = 0.0
    total_tds     = 0.0

    # PT slab: Feb = 250 else 200 if gross > 15000
    is_feb = (month == 2)

    for ps in payslips:
        emp = emp_map.get(ps.employee_id)
        if not emp:
            continue
        sal = sal_map.get(ps.employee_id)

        basic = _fmt(ps.basic)
        gross = _fmt(ps.gross_salary)
        pf_deduction = _fmt(ps.pf)  # employee PF (12% of basic, capped on 15k)

        # EPF ceiling
        epf_basic = min(basic, 15000.0)
        emp_pf = round(epf_basic * 0.12, 2)
        # Employer: 12% split as EPS (8.33%, max 1250) + EPF (diff)
        eps = min(round(epf_basic * 0.0833, 2), 1250.0)
        er_epf = round(epf_basic * 0.12 - eps, 2)
        er_total = round(eps + er_epf, 2)

        total_epf_emp += emp_pf
        total_epf_er  += er_total

        epf_challan.append({
            "employee_id": emp.employee_id,
            "employee_name": f"{emp.first_name} {emp.last_name}",
            "uan": f"10{emp.employee_id.replace('EMP-', '')}0001",  # mock UAN
            "epf_basic": epf_basic,
            "employee_pf_12pct": emp_pf,
            "employer_eps_8_33pct": eps,
            "employer_epf_diff": er_epf,
            "total_employer_contribution": er_total,
            "total_challan_amount": round(emp_pf + er_total, 2)
        })

        # Professional Tax
        pt = 250.0 if is_feb and gross > 15000 else (200.0 if gross > 15000 else 0.0)
        total_pt += pt
        pt_register.append({
            "employee_id": emp.employee_id,
            "employee_name": f"{emp.first_name} {emp.last_name}",
            "gross_monthly": gross,
            "pt_deducted": pt
        })

        # TDS (tax field in payslip = monthly TDS)
        tds = _fmt(ps.tax)
        total_tds += tds
        tds_register.append({
            "employee_id": emp.employee_id,
            "employee_name": f"{emp.first_name} {emp.last_name}",
            "gross_monthly": gross,
            "monthly_tds": tds,
            "annual_tds_projection": round(tds * 12, 2),
            "pan": f"ABCDE{emp.employee_id.replace('EMP-', '').zfill(4)}F"  # mock PAN
        })

    return {
        "report_name": "Statutory Compliance Report",
        "month": month,
        "year": year,
        "period": f"{datetime.date(year, month, 1).strftime('%B %Y')}",
        "generated_at": datetime.datetime.utcnow().isoformat(),
        "summary": {
            "total_epf_employee_contribution": round(total_epf_emp, 2),
            "total_epf_employer_contribution": round(total_epf_er, 2),
            "total_epf_challan": round(total_epf_emp + total_epf_er, 2),
            "total_professional_tax": round(total_pt, 2),
            "total_tds_deducted": round(total_tds, 2),
            "total_statutory_liability": round(total_epf_emp + total_epf_er + total_pt + total_tds, 2)
        },
        "epf_challan": epf_challan,
        "pt_register": pt_register,
        "tds_register": tds_register
    }
