import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

async def main():
    if not DATABASE_URL:
        print("DATABASE_URL is not set!")
        return
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        # 1. Get all organizations
        res = await conn.execute(text("SELECT id, name, subdomain FROM public.organizations"))
        orgs = res.fetchall()
        print(f"Found {len(orgs)} organizations:")
        for org in orgs:
            print(f"  ID: {org[0]} | Name: {org[1]} | Subdomain: {org[2]}")

        # 2. Check recruitment_positions and job_postings in public schema
        print("\n--- PUBLIC SCHEMA ---")
        try:
            res = await conn.execute(text("SELECT id, organization_id, title FROM public.recruitment_positions"))
            positions = res.fetchall()
            print(f"public.recruitment_positions count: {len(positions)}")
            for p in positions:
                print(f"  Pos ID: {p[0]} | Org ID: {p[1]} | Title: {p[2]}")
        except Exception as e:
            print(f"Error reading public.recruitment_positions: {e}")

        try:
            res = await conn.execute(text("SELECT id, organization_id, position_id, status FROM public.job_postings"))
            postings = res.fetchall()
            print(f"public.job_postings count: {len(postings)}")
            for p in postings:
                print(f"  Post ID: {p[0]} | Org ID: {p[1]} | Pos ID: {p[2]} | Status: {p[3]}")
        except Exception as e:
            print(f"Error reading public.job_postings: {e}")

        # 3. Check for each tenant schema
        for org in orgs:
            subdomain = org[2]
            if not subdomain or subdomain == 'nexus-central':
                continue
            print(f"\n--- SCHEMA: {subdomain} ---")
            try:
                res = await conn.execute(text(f'SELECT id, organization_id, title FROM "{subdomain}".recruitment_positions'))
                positions = res.fetchall()
                print(f'"{subdomain}".recruitment_positions count: {len(positions)}')
                for p in positions:
                    print(f"  Pos ID: {p[0]} | Org ID: {p[1]} | Title: {p[2]}")
            except Exception as e:
                print(f"Error: {e}")

            try:
                res = await conn.execute(text(f'SELECT id, organization_id, position_id, status FROM "{subdomain}".job_postings'))
                postings = res.fetchall()
                print(f'"{subdomain}".job_postings count: {len(postings)}')
                for p in postings:
                    print(f"  Post ID: {p[0]} | Org ID: {p[1]} | Pos ID: {p[2]} | Status: {p[3]}")
            except Exception as e:
                print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
