import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

async def main():
    engine = create_async_engine(DATABASE_URL)
    org_id = '11111111-1111-1111-1111-111111111111'
    
    # Tables in order of dependencies (child first)
    tables = [
        "project_mappings", "projects", "clients",
        "leave_requests", "leave_balances", "attendance", "payslips", "payroll_runs",
        "tax_declarations", "fbp_declarations", "salary_structures", "performance_kras",
        "performance_reviews", "vehicle_leases", "insurance_enrollments",
        "offer_letters", "talent_interviews", "call_letters", "talent_candidates",
        "talent_profiles", "job_postings", "recruitment_positions",
        "employees", "designations", "departments", "salary_bands",
        "induction_tasks", "assets"
    ]
    
    async with engine.begin() as conn:
        print("Setting search path to public...")
        await conn.execute(text("SET search_path TO public;"))
        
        # Clean users first
        try:
            res = await conn.execute(text(f"DELETE FROM users WHERE organization_id = '{org_id}' AND email != 'admin@orient-ts.com'"))
            print(f"Deleted from users: {res.rowcount} rows")
        except Exception as e:
            print("Failed to delete from users:", e)
            
        for table in tables:
            try:
                res = await conn.execute(text(f"DELETE FROM {table} WHERE organization_id = '{org_id}'"))
                print(f"Deleted from {table}: {res.rowcount} rows")
            except Exception as e:
                print(f"Failed to delete from {table}: {e}")

if __name__ == "__main__":
    asyncio.run(main())
