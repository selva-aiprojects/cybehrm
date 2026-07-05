import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import select, func, text
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import AsyncSessionLocal
from app.models.models import (
    User, Employee, Attendance, LeaveRequest, Payslip, Asset,
    InductionTask, ProjectMapping, RecruitmentPosition,
    TalentCandidate, OfferLetter, SupportTicket, RolePermission, Organization
)
import datetime

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

async def main():
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        # Replicate search_path setting
        await conn.execute(text('SET search_path TO "orient-ts", public'))
        
        # Check org_id for orient-ts
        res_org = await conn.execute(text("SELECT id FROM public.organizations WHERE subdomain = 'orient-ts'"))
        org_id = res_org.scalar()
        print(f"Orient Org ID: {org_id}")
        
        # Today
        today = datetime.date.today()
        print(f"Today: {today}")
        
        # 1. Talent Management Metrics
        # Open positions
        pos_q = await conn.execute(
            select(func.count(RecruitmentPosition.id))
            .where(RecruitmentPosition.organization_id == org_id, RecruitmentPosition.status == "open")
        )
        print("Open positions:", pos_q.scalar())

        # Closed positions
        pos_closed_q = await conn.execute(
            select(func.count(RecruitmentPosition.id))
            .where(RecruitmentPosition.organization_id == org_id, RecruitmentPosition.status == "closed")
        )
        print("Closed positions:", pos_closed_q.scalar())

        # Total candidates (excluding rejected or onboarded)
        cand_q = await conn.execute(
            select(func.count(TalentCandidate.id))
            .where(TalentCandidate.organization_id == org_id, TalentCandidate.status.notin_(["rejected", "onboarded"]))
        )
        print("Total candidates (excluding rejected/onboarded):", cand_q.scalar())

        # Pending offers
        offer_q = await conn.execute(
            select(func.count(OfferLetter.id))
            .where(OfferLetter.organization_id == org_id, OfferLetter.offer_status.in_(["sent", "draft"]))
        )
        print("Pending offers:", offer_q.scalar())

        # Scheduled interviews
        int_q = await conn.execute(
            select(func.count(TalentCandidate.id))
            .where(TalentCandidate.organization_id == org_id, TalentCandidate.status == "interview_scheduled")
        )
        print("Scheduled interviews:", int_q.scalar())

        # Total active employees
        emp_q = await conn.execute(
            select(func.count(Employee.id))
            .where(Employee.organization_id == org_id, Employee.employment_status == "active")
        )
        total_employees = emp_q.scalar() or 0
        print("Total active employees:", total_employees)

        # Attendance today
        att_q = await conn.execute(
            select(func.count(Attendance.id))
            .where(Attendance.organization_id == org_id, Attendance.date == today, Attendance.status == "present")
        )
        present_today = att_q.scalar() or 0
        print("Present today:", present_today)

        # Total payslips processed
        payslip_q = await conn.execute(
            select(func.count(Payslip.id))
            .where(Payslip.organization_id == org_id)
        )
        print("Payslips processed:", payslip_q.scalar())

        # Onboarding tasks progress
        tasks_q = await conn.execute(
            select(
                func.count(InductionTask.id),
                func.sum(func.case((InductionTask.status == "completed", 1), else_=0))
            )
            .where(InductionTask.organization_id == org_id)
        )
        tasks_res = tasks_q.first()
        print("Induction tasks (Total, Completed):", tasks_res)

        # Active allocations
        alloc_q = await conn.execute(
            select(func.count(ProjectMapping.id))
            .where(ProjectMapping.organization_id == org_id)
        )
        print("Active project allocations:", alloc_q.scalar())

if __name__ == "__main__":
    asyncio.run(main())
