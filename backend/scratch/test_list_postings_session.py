import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, selectinload
from sqlalchemy import select, text
from app.models.models import JobPosting

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

async def main():
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as db:
        # Set search path to orqo
        await db.execute(text('SET search_path TO "orqo", public'))
        
        # Test query
        query = select(JobPosting).options(selectinload(JobPosting.position)).where(JobPosting.organization_id == "9ffd810e-7b72-4a0c-aef8-580616759482")
        res = await db.execute(query)
        postings = res.scalars().all()
        print(f"Query returned {len(postings)} postings:")
        for p in postings:
            print(f"  Post ID: {p.id} | Org ID: {p.organization_id} | Position ID: {p.position_id}")
            if p.position:
                print(f"    Position Title: {p.position.title} | Status: {p.position.status}")
            else:
                print(f"    No position relationship loaded!")

if __name__ == "__main__":
    asyncio.run(main())
