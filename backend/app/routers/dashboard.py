# app/routers/dashboard.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case, text
from app.db.session import get_db
from app.models.models import (
    User, Employee, Attendance, LeaveRequest, Payslip, Asset, SalaryStructure,
    InductionTask, ProjectMapping, RecruitmentPosition,
    TalentCandidate, OfferLetter, SupportTicket, RolePermission, Organization, Project, Department
)
from app.schemas.schemas import DashboardMetricsResponse
from app.routers.dependencies import get_current_user
import datetime

router = APIRouter(prefix="/dashboard", tags=["Dashboard Management"])

@router.get("/metrics", response_model=DashboardMetricsResponse)
async def get_dashboard_metrics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    org_id = current_user.organization_id
    today = datetime.date.today()

    # 1. Talent Management Metrics
    # Open positions
    pos_open_q = await db.execute(
        select(func.count(RecruitmentPosition.id))
        .where(RecruitmentPosition.organization_id == org_id, RecruitmentPosition.status == "open")
    )
    open_positions = pos_open_q.scalar() or 0

    # Closed positions
    pos_closed_q = await db.execute(
        select(func.count(RecruitmentPosition.id))
        .where(RecruitmentPosition.organization_id == org_id, RecruitmentPosition.status == "closed")
    )
    closed_positions = pos_closed_q.scalar() or 0

    # Total candidates (excluding rejected or onboarded)
    cand_q = await db.execute(
        select(func.count(TalentCandidate.id))
        .where(TalentCandidate.organization_id == org_id, TalentCandidate.status.notin_(["rejected", "onboarded"]))
    )
    total_candidates = cand_q.scalar() or 0

    # Pending offers
    offer_q = await db.execute(
        select(func.count(OfferLetter.id))
        .where(OfferLetter.organization_id == org_id, OfferLetter.offer_status.in_(["sent", "draft"]))
    )
    pending_offers = offer_q.scalar() or 0

    # Scheduled interviews
    int_q = await db.execute(
        select(func.count(TalentCandidate.id))
        .where(TalentCandidate.organization_id == org_id, TalentCandidate.status == "interview_scheduled")
    )
    interviews_scheduled = int_q.scalar() or 0

    # Resources onboarding (status is 'offered' or 'accepted')
    onboarding_q = await db.execute(
        select(func.count(TalentCandidate.id))
        .where(TalentCandidate.organization_id == org_id, TalentCandidate.status.in_(["offered", "accepted"]))
    )
    resources_onboarding = onboarding_q.scalar() or 0

    # Target pipeline statuses
    pipeline_status_q = await db.execute(
        select(TalentCandidate.status, func.count(TalentCandidate.id))
        .where(TalentCandidate.organization_id == org_id)
        .group_by(TalentCandidate.status)
    )
    pipeline_statuses = {r[0]: r[1] for r in pipeline_status_q.fetchall()}

    # 2. HR Management Metrics
    # Total active employees
    emp_q = await db.execute(
        select(func.count(Employee.id))
        .where(Employee.organization_id == org_id, Employee.employment_status == "active")
    )
    total_employees = emp_q.scalar() or 0

    # Attendance today
    att_q = await db.execute(
        select(func.count(Attendance.id))
        .where(Attendance.organization_id == org_id, Attendance.date == today, Attendance.status == "present")
    )
    present_today = att_q.scalar() or 0
    daily_attendance_pct = round((present_today / total_employees) * 100, 1) if total_employees > 0 else 0.0

    # Pending leaves
    leave_q = await db.execute(
        select(func.count(LeaveRequest.id))
        .where(LeaveRequest.organization_id == org_id, LeaveRequest.status == "pending")
    )
    pending_leaves = leave_q.scalar() or 0

    # Total payslips processed
    payslip_q = await db.execute(
        select(func.count(Payslip.id))
        .where(Payslip.organization_id == org_id)
    )
    payslips_processed = payslip_q.scalar() or 0

    # Attrition rate (terminated / total historical)
    terminated_q = await db.execute(
        select(func.count(Employee.id))
        .where(Employee.organization_id == org_id, Employee.employment_status == "terminated")
    )
    terminated_count = terminated_q.scalar() or 0
    total_all_emp = total_employees + terminated_count
    attrition_rate = round((terminated_count / total_all_emp) * 100, 1) if total_all_emp > 0 else 0.0

    # Leave usage % (approved leaves today / total employees)
    leave_today_q = await db.execute(
        select(func.count(LeaveRequest.id))
        .where(
            LeaveRequest.organization_id == org_id,
            LeaveRequest.status == "approved",
            LeaveRequest.start_date <= today,
            LeaveRequest.end_date >= today
        )
    )
    leave_today_count = leave_today_q.scalar() or 0
    leave_usage_pct = round((leave_today_count / total_employees) * 100, 1) if total_employees > 0 else 0.0

    # Payroll cost (sum of net pay for latest month)
    payroll_q = await db.execute(
        select(func.sum(Payslip.net_salary))
        .where(Payslip.organization_id == org_id)
    )
    payroll_cost = float(payroll_q.scalar() or 0.0)

    # Headcount by department
    dept_q = await db.execute(
        select(Department.name, func.count(Employee.id))
        .join(Department, Employee.department_id == Department.id)
        .where(Employee.organization_id == org_id, Employee.employment_status == "active")
        .group_by(Department.name)
    )
    headcount_by_dept = {r[0]: r[1] for r in dept_q.fetchall()}

    # Monthly payroll trend (last 6 months)
    six_months_ago = today - datetime.timedelta(days=180)
    monthly_pay_q = await db.execute(
        select(
            func.date_trunc(text("'month'"), Payslip.created_at).label('month'),
            func.sum(Payslip.net_salary).label('total')
        )
        .where(
            Payslip.organization_id == org_id,
            Payslip.created_at >= six_months_ago
        )
        .group_by(func.date_trunc(text("'month'"), Payslip.created_at))
        .order_by(func.date_trunc(text("'month'"), Payslip.created_at))
    )
    monthly_payroll = [{"month": str(r[0]), "total": float(r[1])} for r in monthly_pay_q.fetchall()]

    # 3. Resource Management Metrics
    # Total assets
    assets_tot_q = await db.execute(
        select(func.count(Asset.id))
        .where(Asset.organization_id == org_id)
    )
    total_assets = assets_tot_q.scalar() or 0

    # Assigned assets
    assets_ass_q = await db.execute(
        select(func.count(Asset.id))
        .where(Asset.organization_id == org_id, Asset.employee_id.isnot(None))
    )
    assigned_assets = assets_ass_q.scalar() or 0

    # Onboarding tasks progress
    tasks_q = await db.execute(
        select(
            func.count(InductionTask.id),
            func.sum(case((InductionTask.status == "completed", 1), else_=0))
        )
        .where(InductionTask.organization_id == org_id)
    )
    tasks_res = tasks_q.first()
    tasks_tot = tasks_res[0] if tasks_res else 0
    tasks_done = tasks_res[1] if tasks_res else 0
    tasks_tot = tasks_tot or 0
    tasks_done = tasks_done or 0
    induction_progress_pct = round((tasks_done / tasks_tot) * 100, 1) if tasks_tot > 0 else 0.0

    # Active allocations (billing_status != 'Bench')
    alloc_q = await db.execute(
        select(func.count(ProjectMapping.id))
        .where(ProjectMapping.organization_id == org_id, ProjectMapping.billing_status != "Bench")
    )
    active_allocations = alloc_q.scalar() or 0

    # Project resources — employees with at least one non-Bench project mapping (subquery)
    proj_sub = (
        select(ProjectMapping.employee_id)
        .where(
            ProjectMapping.organization_id == org_id,
            ProjectMapping.billing_status != "Bench"
        )
        .distinct()
        .correlate()
        .scalar_subquery()
    )
    proj_res_q = await db.execute(
        select(func.count(Employee.id)).where(
            Employee.organization_id == org_id,
            Employee.employment_status == "active",
            Employee.id.in_(proj_sub)
        )
    )
    project_resources = proj_res_q.scalar() or 0

    # Bench resources — active employees with NO non-Bench project mapping
    bench_sub = (
        select(ProjectMapping.employee_id)
        .where(
            ProjectMapping.organization_id == org_id,
            ProjectMapping.billing_status != "Bench"
        )
        .distinct()
        .correlate()
        .scalar_subquery()
    )
    bench_res_q = await db.execute(
        select(func.count(Employee.id)).where(
            Employee.organization_id == org_id,
            Employee.employment_status == "active",
            Employee.id.notin_(bench_sub)
        )
    )
    bench_resources = bench_res_q.scalar() or 0

    # Expecting to bench (on active project ending within 30 days)
    thirty_days_later = today + datetime.timedelta(days=30)
    exp_bench_q = await db.execute(
        select(func.count(func.distinct(ProjectMapping.employee_id)))
        .join(Project, ProjectMapping.project_id == Project.id)
        .where(
            ProjectMapping.organization_id == org_id,
            ProjectMapping.billing_status != "Bench",
            Project.end_date >= today,
            Project.end_date <= thirty_days_later
        )
    )
    expecting_to_bench = exp_bench_q.scalar() or 0

    # Pipeline projects (starting in the future)
    pipeline_proj_q = await db.execute(
        select(func.count(Project.id))
        .where(
            Project.organization_id == org_id,
            Project.start_date > today
        )
    )
    pipeline_projects = pipeline_proj_q.scalar() or 0

    # 4. Administration Metrics
    # Total users
    users_q = await db.execute(
        select(func.count(User.id))
        .where(User.organization_id == org_id)
    )
    total_users = users_q.scalar() or 0

    # Active support tickets
    ticket_q = await db.execute(
        select(func.count(SupportTicket.id))
        .where(SupportTicket.organization_id == org_id, SupportTicket.status.in_(["open", "in_progress"]))
    )
    active_support_tickets = ticket_q.scalar() or 0

    # Custom role permissions count
    perm_q = await db.execute(
        select(func.count(RolePermission.id))
        .where(RolePermission.organization_id == org_id)
    )
    custom_role_permissions = perm_q.scalar() or 0

    # Subscription plan
    org_q = await db.execute(
        select(Organization.subscription_plan)
        .where(Organization.id == org_id)
    )
    subscription_plan = org_q.scalar() or "growth"

    return {
        "talent": {
            "open_positions": open_positions,
            "closed_positions": closed_positions,
            "total_candidates": total_candidates,
            "pending_offers": pending_offers,
            "interviews_scheduled": interviews_scheduled,
            "resources_onboarding": resources_onboarding,
            "pipeline_statuses": pipeline_statuses
        },
        "hr": {
            "total_employees": total_employees,
            "daily_attendance_pct": daily_attendance_pct,
            "pending_leaves": pending_leaves,
            "payslips_processed": payslips_processed,
            "attrition_rate": attrition_rate,
            "leave_usage_pct": leave_usage_pct,
            "payroll_cost": payroll_cost,
            "headcount_by_dept": headcount_by_dept,
            "monthly_payroll": monthly_payroll
        },
        "resource": {
            "assigned_assets": assigned_assets,
            "total_assets": total_assets,
            "induction_progress_pct": induction_progress_pct,
            "active_allocations": active_allocations,
            "bench_resources": bench_resources,
            "project_resources": project_resources,
            "expecting_to_bench": expecting_to_bench,
            "pipeline_projects": pipeline_projects
        },
        "administration": {
            "total_users": total_users,
            "active_support_tickets": active_support_tickets,
            "custom_role_permissions": custom_role_permissions,
            "subscription_plan": subscription_plan
        }
    }
