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
        schemas = [r[0] for r in res.fetchall()]
        for s in schemas:
            if not s.startswith("pg_") and s != "information_schema":
                print(s)
                
        if "orient-ts" in schemas:
            print("\n--- ORIENT EMPLOYEES ---")
            try:
                res_wk = await conn.execute(text('SELECT id, user_id, first_name, last_name FROM "orient-ts".employees'))
                rows = res_wk.fetchall()
                print(f"Found {len(rows)} employees in orient-ts schema.")
                for r in rows[:10]:
                    print(f"  WK: ID={r[0]}, UserID={r[1]}, Name={r[2]} {r[3]}")
            except Exception as e:
                print("Failed orient-ts.employees:", e)
        else:
            print("\n'orient-ts' schema does not exist.")

if __name__ == "__main__":
    asyncio.run(main())
