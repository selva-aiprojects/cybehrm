import asyncio
from app.db.session import engine
from app.models.models import Base

async def reset_db():
    async with engine.begin() as conn:
        print("Dropping all tables...")
        await conn.run_sync(Base.metadata.drop_all)
        print("Creating all tables...")
        await conn.run_sync(Base.metadata.create_all)
    print("Database reset complete.")

if __name__ == "__main__":
    asyncio.run(reset_db())
