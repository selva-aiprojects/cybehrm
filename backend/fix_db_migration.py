import asyncio
from app.db.session import engine
from sqlalchemy import text

async def main():
    async with engine.begin() as conn:
        try:
            await conn.execute(text('ALTER TABLE "HR-Engine".users ADD COLUMN IF NOT EXISTS last_login_origin VARCHAR(50)'))
            print("Successfully added last_login_origin column to users table.")
        except Exception as e:
            print(f"Error altering users table: {e}")

if __name__ == "__main__":
    asyncio.run(main())
