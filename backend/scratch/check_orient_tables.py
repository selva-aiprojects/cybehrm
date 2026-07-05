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
        for schema in ["Orient", "orient-ts"]:
            try:
                res = await conn.execute(text(f"SELECT tablename FROM pg_tables WHERE schemaname = '{schema}'"))
                tables = [r[0] for r in res.fetchall()]
                print(f"Schema '{schema}' tables count: {len(tables)}")
                if tables:
                    print(f"  Sample tables: {tables[:5]}")
            except Exception as e:
                print(f"Error checking schema '{schema}': {e}")

if __name__ == "__main__":
    asyncio.run(main())
