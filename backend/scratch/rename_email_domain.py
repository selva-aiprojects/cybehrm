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
            org_id = "11111111-1111-1111-1111-111111111111"

            # Update user emails for Orient Technology Solutions
            print("Updating user emails from @orient-ts.com to @oriend-ts.com...")
            result = await conn.execute(text("""
                UPDATE users
                SET email = replace(email, '@orient-ts.com', '@oriend-ts.com')
                WHERE organization_id = :org_id AND email LIKE '%@orient-ts.com'
            """), {"org_id": org_id})
            print(f"Updated {result.rowcount} user emails.")

            print("Done!")
        except Exception as e:
            print("Error:", e)

if __name__ == "__main__":
    asyncio.run(main())
