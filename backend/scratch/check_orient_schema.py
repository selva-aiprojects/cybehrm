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
        print("--- SCHEMAS ---")
        res = await conn.execute(text("SELECT schema_name FROM information_schema.schemata"))
        for r in res.fetchall():
            if not r[0].startswith("pg_") and r[0] != "information_schema":
                print(r[0])
                
        print("\n--- PUBLIC EMPLOYEES ---")
        try:
            res_pub = await conn.execute(text("SELECT id, user_id, first_name, last_name FROM public.employees"))
            for r in res_pub.fetchall():
                print(f"Public: ID={r[0]}, UserID={r[1]}, Name={r[2]} {r[3]}")
        except Exception as e:
            print("Failed public.employees:", e)

        print("\n--- ORIENT EMPLOYEES ---")
        try:
            res_orient = await conn.execute(text('SELECT id, user_id, first_name, last_name FROM "Orient".employees'))
            for r in res_orient.fetchall():
                print(f"Orient: ID={r[0]}, UserID={r[1]}, Name={r[2]} {r[3]}")
        except Exception as e:
            print("Failed Orient.employees:", e)

if __name__ == "__main__":
    asyncio.run(main())
