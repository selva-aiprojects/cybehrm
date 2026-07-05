import asyncio
import os
import datetime
from dotenv import load_dotenv
load_dotenv()

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def check():
    async with AsyncSessionLocal() as s:
        # 1. Find Orient org
        r = await s.execute(text("SELECT id, name FROM organizations WHERE LOWER(name) LIKE '%whitekra%'"))
        org = r.fetchone()
        if not org:
            print('ORG NOT FOUND')
            return
        org_id = org[0]
        print(f"\nOrg: {org[1]} => {org_id}\n")

        # 2. Employee counts
        r = await s.execute(text("SELECT COUNT(*) FROM employees WHERE organization_id = :oid AND employment_status='active'"), {'oid': org_id})
        print(f"Active employees: {r.scalar()}")

        # 3. Total project_mappings
        r = await s.execute(text("SELECT COUNT(*) FROM project_mappings WHERE organization_id = :oid"), {'oid': org_id})
        total_pm = r.scalar()
        print(f"Total project_mappings rows: {total_pm}")

        if total_pm == 0:
            print("\n*** NO PROJECT MAPPINGS FOUND - this is why dashboard shows all as bench! ***")
        
        # 4. Billing status breakdown
        r = await s.execute(text("SELECT billing_status, COUNT(*) FROM project_mappings WHERE organization_id = :oid GROUP BY billing_status"), {'oid': org_id})
        rows = r.fetchall()
        print("Billing status breakdown in project_mappings:")
        for row in rows:
            print(f"  [{row[0]}]: {row[1]}")

        # 5. Distinct employees on active projects
        r = await s.execute(text("SELECT COUNT(DISTINCT employee_id) FROM project_mappings WHERE organization_id = :oid AND billing_status != 'Bench'"), {'oid': org_id})
        print(f"\nDistinct employees on projects (non-Bench): {r.scalar()}")

        r = await s.execute(text("SELECT COUNT(DISTINCT employee_id) FROM project_mappings WHERE organization_id = :oid AND billing_status = 'Bench'"), {'oid': org_id})
        print(f"Distinct employees with Bench billing_status: {r.scalar()}")

        # 6. Employees with NO mapping (true bench)
        r = await s.execute(text("""
            SELECT COUNT(*) FROM employees e
            WHERE e.organization_id = :oid
              AND e.employment_status = 'active'
              AND NOT EXISTS (
                SELECT 1 FROM project_mappings pm
                WHERE pm.employee_id = e.id
              )
        """), {'oid': org_id})
        print(f"Employees with NO project mapping (true bench): {r.scalar()}")

        # 7. Projects
        r = await s.execute(text("SELECT name, start_date, end_date FROM projects WHERE organization_id = :oid ORDER BY start_date"), {'oid': org_id})
        print("\nProjects:")
        today = datetime.date.today()
        proj_rows = r.fetchall()
        if not proj_rows:
            print("  *** NO PROJECTS FOUND ***")
        for row in proj_rows:
            status = "ACTIVE" if row[1] and row[1] <= today else "PIPELINE"
            print(f"  {status}: {row[0]} | {row[1]} -> {row[2]}")

        # 8. Department/designation coverage
        r = await s.execute(text("SELECT COUNT(*) FROM employees WHERE organization_id = :oid AND department_id IS NULL"), {'oid': org_id})
        print(f"\nEmployees with NULL department_id: {r.scalar()}")
        r = await s.execute(text("SELECT COUNT(*) FROM employees WHERE organization_id = :oid AND designation_id IS NULL"), {'oid': org_id})
        print(f"Employees with NULL designation_id: {r.scalar()}")

asyncio.run(check())
