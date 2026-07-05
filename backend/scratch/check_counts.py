import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

async def run():
    engine = create_async_engine(os.getenv('DATABASE_URL'))
    
    tables = [
        "employees", "talent_candidates", "recruitment_positions",
        "assets", "induction_tasks", "project_mappings", "support_tickets"
    ]
    
    async with engine.begin() as conn:
        print("--- Table Counts ---")
        for table in tables:
            # Public schema count
            try:
                pub_res = await conn.execute(text(f'SELECT COUNT(*) FROM public."{table}"'))
                pub_cnt = pub_res.scalar()
            except Exception as e:
                pub_cnt = f"Error: {e}"
                
            # Orient schema count
            try:
                wk_res = await conn.execute(text(f'SELECT COUNT(*) FROM "orient-ts"."{table}"'))
                wk_cnt = wk_res.scalar()
            except Exception as e:
                wk_cnt = f"Error: {e}"
                
            print(f"{table:25} | Public: {pub_cnt:10} | Orient: {wk_cnt:10}")

if __name__ == "__main__":
    asyncio.run(run())
