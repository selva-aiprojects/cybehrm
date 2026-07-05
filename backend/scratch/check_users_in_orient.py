import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

async def main():
    engine = create_async_engine(DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        print("--- MATCHING USERS ---")
        res = await conn.execute(text("""
            SELECT u.email, u.role, e.id, e.first_name, e.last_name
            FROM public.users u
            JOIN "Orient".employees e ON e.user_id = u.id
        """))
        for r in res.fetchall():
            print(f"Email={r[0]}, Role={r[1]}, EmpID={r[2]}, Name={r[3]} {r[4]}")

if __name__ == "__main__":
    asyncio.run(main())
