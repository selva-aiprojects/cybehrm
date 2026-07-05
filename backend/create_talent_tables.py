import asyncio
import os
from dotenv import load_dotenv
load_dotenv()
from app.db.session import engine
from app.models.models import Base, TalentInterview, OfferLetter

async def main():
    async with engine.begin() as conn:
        print("Provisioning missing tables...")
        await conn.run_sync(Base.metadata.create_all, tables=[
            TalentInterview.__table__,
            OfferLetter.__table__
        ])
        print("Done!")

if __name__ == "__main__":
    asyncio.run(main())
