import asyncio
from app.db.session import engine, Base
from app.models import models # Ensure models are imported so they register

async def main():
    print("Tables in metadata:", Base.metadata.tables.keys())
    async with engine.begin() as conn:
        print("Running create_all...")
        await conn.run_sync(Base.metadata.create_all)
        print("Done!")

if __name__ == "__main__":
    asyncio.run(main())
