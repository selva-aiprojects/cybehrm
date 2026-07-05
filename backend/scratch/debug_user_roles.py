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
        res = await conn.execute(text("SELECT id, email, role, organization_id, is_active FROM public.users"))
        users = res.fetchall()
        print(f"Found {len(users)} users:")
        for u in users:
            print(f"  ID: {u[0]} | Email: {u[1]} | Role: {u[2]} | Org ID: {u[3]} | Active: {u[4]}")

if __name__ == "__main__":
    asyncio.run(main())
