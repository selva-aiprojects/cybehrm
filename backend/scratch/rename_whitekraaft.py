import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import sys
import os

# Add parent directory to path so we can import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.config import settings

async def main():
    print(f"Connecting to database: {settings.DATABASE_URL.split('@')[-1]}")
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    async with engine.begin() as conn:
        try:
            # 1. Rename schema
            res = await conn.execute(text("SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'cybelinx'"))
            if res.scalar():
                print("Renaming schema cybelinx to orient-ts...")
                await conn.execute(text('DROP SCHEMA IF EXISTS "orient-ts" CASCADE'))
                await conn.execute(text('ALTER SCHEMA "cybelinx" RENAME TO "orient-ts"'))
            else:
                await conn.execute(text('CREATE SCHEMA IF NOT EXISTS "orient-ts"'))

            # 2. Update organizations
            print("Updating organizations...")
            await conn.execute(text("""
                UPDATE organizations 
                SET name = 'Orient Technology Solutions', subdomain = 'orient-ts' 
                WHERE subdomain = 'cybelinx' OR name = 'Cybelinx Solutions'
            """))

            # 3. Update users
            print("Updating users...")
            await conn.execute(text("""
                UPDATE users 
                SET email = replace(email, '@cybelinx.com', '@orient-ts.com')
                WHERE email LIKE '%@cybelinx.com'
            """))

            print("Database updates completed successfully!")
        except Exception as e:
            print("Error executing database updates:", e)

if __name__ == "__main__":
    asyncio.run(main())
