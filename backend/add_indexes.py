import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("Error: DATABASE_URL not found in environment.")
    exit(1)

engine = create_async_engine(DATABASE_URL, echo=True, pool_pre_ping=True)

INDEX_QUERIES = [
    # Tenant Isolation Indexes
    "CREATE INDEX IF NOT EXISTS ix_users_organization_id ON users(organization_id)",
    "CREATE INDEX IF NOT EXISTS ix_employees_organization_id ON employees(organization_id)",
    "CREATE INDEX IF NOT EXISTS ix_attendance_organization_id ON attendance(organization_id)",
    "CREATE INDEX IF NOT EXISTS ix_payslips_organization_id ON payslips(organization_id)",
    "CREATE INDEX IF NOT EXISTS ix_talent_candidates_organization_id ON talent_candidates(organization_id)",
    "CREATE INDEX IF NOT EXISTS ix_job_postings_organization_id ON job_postings(organization_id)",
    "CREATE INDEX IF NOT EXISTS ix_talent_profiles_organization_id ON talent_profiles(organization_id)",
    
    # Frequently Queried Foreign Keys and Search Columns
    "CREATE INDEX IF NOT EXISTS ix_employees_employee_id ON employees(employee_id)",
    "CREATE INDEX IF NOT EXISTS ix_attendance_employee_id ON attendance(employee_id)",
    "CREATE INDEX IF NOT EXISTS ix_payslips_employee_id ON payslips(employee_id)",
    "CREATE INDEX IF NOT EXISTS ix_talent_candidates_position_id ON talent_candidates(position_id)",
    "CREATE INDEX IF NOT EXISTS ix_talent_interviews_candidate_id ON talent_interviews(candidate_id)",
    "CREATE INDEX IF NOT EXISTS ix_offer_letters_candidate_id ON offer_letters(candidate_id)",
    "CREATE INDEX IF NOT EXISTS ix_leave_requests_employee_id ON leave_requests(employee_id)"
]

async def apply_indexes():
    print("Applying performance indexes to the database...")
    async with engine.begin() as conn:
        for query in INDEX_QUERIES:
            print(f"Executing: {query}")
            await conn.execute(text(query))
    print("Successfully applied all database indexes!")

if __name__ == "__main__":
    asyncio.run(apply_indexes())
