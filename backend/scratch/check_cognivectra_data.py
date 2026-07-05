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
        res_org = await conn.execute(text("SELECT id, name, subdomain FROM public.organizations WHERE subdomain = 'cognivectra'"))
        org = res_org.fetchone()
        if not org:
            print("Cognivectra organization not found!")
            return
        
        org_id, name, subdomain = org
        print(f"Cognivectra Org ID: {org_id}, Subdomain: {subdomain}")
        
        # Check counts in public schema
        print("\n--- Counts in PUBLIC schema for Cognivectra ---")
        for table in ["employees", "recruitment_positions", "talent_candidates", "payslips", "project_mappings"]:
            try:
                res = await conn.execute(text(f"SELECT COUNT(*) FROM public.{table} WHERE organization_id = :org_id"), {"org_id": org_id})
                print(f"public.{table}: {res.scalar()}")
            except Exception as e:
                print(f"Error checking public.{table}: {e}")
                
        # Check counts in cognivectra schema
        print(f"\n--- Counts in {subdomain} schema ---")
        for table in ["employees", "recruitment_positions", "talent_candidates", "payslips", "project_mappings"]:
            try:
                res = await conn.execute(text(f'SELECT COUNT(*) FROM "{subdomain}".{table} WHERE organization_id = :org_id'), {"org_id": org_id})
                print(f'"{subdomain}".{table}: {res.scalar()}')
            except Exception as e:
                print(f'Error checking "{subdomain}".{table}: {e}')

if __name__ == "__main__":
    asyncio.run(main())
