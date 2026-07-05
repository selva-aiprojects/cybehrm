import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

async def main():
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        # Get Orient Org
        res_org = await conn.execute(text("SELECT id, name, subdomain FROM public.organizations WHERE subdomain = 'orient-ts'"))
        org = res_org.fetchone()
        if not org:
            print("Orient organization not found in public.organizations!")
            return
        
        org_id, name, subdomain = org
        print(f"Orient Org ID: {org_id}, Subdomain: {subdomain}")
        
        # Check counts in public schema
        print("\n--- Counts in PUBLIC schema ---")
        for table in ["employees", "recruitment_positions", "talent_candidates", "payslips", "project_mappings"]:
            try:
                res = await conn.execute(text(f"SELECT COUNT(*) FROM public.{table} WHERE organization_id = :org_id"), {"org_id": org_id})
                print(f"public.{table}: {res.scalar()}")
            except Exception as e:
                print(f"Error checking public.{table}: {e}")
                
        # Check counts in orient-ts schema
        print(f"\n--- Counts in {subdomain} schema ---")
        for table in ["employees", "recruitment_positions", "talent_candidates", "payslips", "project_mappings"]:
            try:
                res = await conn.execute(text(f'SELECT COUNT(*) FROM "{subdomain}".{table} WHERE organization_id = :org_id'), {"org_id": org_id})
                print(f'"{subdomain}".{table}: {res.scalar()}')
            except Exception as e:
                print(f'Error checking "{subdomain}".{table}: {e}')

        # Let's inspect some status values
        print("\n--- RecruitmentPosition statuses in orient-ts schema ---")
        try:
            res = await conn.execute(text(f'SELECT status, COUNT(*) FROM "{subdomain}".recruitment_positions GROUP BY status'))
            for r in res.fetchall():
                print(f"Status: {r[0]} | Count: {r[1]}")
        except Exception as e:
            print("Error checking recruitment_positions status:", e)

        print("\n--- Employee status values in orient-ts schema ---")
        try:
            res = await conn.execute(text(f'SELECT employment_status, COUNT(*) FROM "{subdomain}".employees GROUP BY employment_status'))
            for r in res.fetchall():
                print(f"Employment Status: {r[0]} | Count: {r[1]}")
        except Exception as e:
            print("Error checking employee status:", e)

if __name__ == "__main__":
    asyncio.run(main())
