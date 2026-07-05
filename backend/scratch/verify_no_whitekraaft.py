import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.config import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async with engine.connect() as conn:
        print("--- DATABASE SANITY CHECK ---")
        
        # 1. Schemas check
        res = await conn.execute(text("SELECT schema_name FROM information_schema.schemata"))
        schemas = [r[0] for r in res.fetchall()]
        print(f"All schemas: {schemas}")
        wk_schemas = [s for s in schemas if "whitekraaft" in s.lower()]
        print(f"Schemas containing 'whitekraaft': {wk_schemas}")
        
        # 2. Organizations check
        res = await conn.execute(text("SELECT id, name, subdomain FROM public.organizations"))
        orgs = res.fetchall()
        wk_orgs = [o for o in orgs if "whitekraaft" in o[1].lower() or "whitekraaft" in o[2].lower()]
        print(f"Organizations containing 'whitekraaft': {wk_orgs}")
        print(f"Total organizations registered: {len(orgs)}")
        for o in orgs:
            print(f"  - ID: {o[0]}, Name: {o[1]}, Subdomain: {o[2]}")
            
        # 3. Users check
        res = await conn.execute(text("SELECT email FROM public.users"))
        emails = [r[0] for r in res.fetchall()]
        wk_emails = [e for e in emails if "whitekraaft" in e.lower()]
        print(f"User emails containing 'whitekraaft': {wk_emails}")
        print(f"Total user count: {len(emails)}")

if __name__ == "__main__":
    asyncio.run(main())
