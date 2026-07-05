import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.config import settings

async def main():
    print(f"Connecting to database: {settings.DATABASE_URL.split('@')[-1]}")
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    async with engine.begin() as conn:
        try:
            # 1. Drop empty orient-ts schema
            print("Dropping empty orient-ts schema...")
            await conn.execute(text('DROP SCHEMA IF EXISTS "orient-ts" CASCADE'))
            
            # 2. Rename active Orient schema to orient-ts
            print("Renaming active Orient schema to orient-ts...")
            await conn.execute(text('ALTER SCHEMA "Orient" RENAME TO "orient-ts"'))
            
            # 3. Update subdomain in organizations table
            print("Updating organization subdomain...")
            await conn.execute(text("""
                UPDATE organizations 
                SET subdomain = 'orient-ts' 
                WHERE id = '11111111-1111-1111-1111-111111111111'
            """))
            
            print("Database Orient schema rename complete!")
        except Exception as e:
            print("Error executing database schema rename:", e)

if __name__ == "__main__":
    asyncio.run(main())
