import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.routers.talent import list_job_postings
from app.schemas.schemas import TokenData

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
        
        claims = TokenData(
            user_id="8c2ddf1d-14e5-42b5-b515-11a00f8ad6a0", # orqohire@gmail.com ID
            organization_id="9ffd810e-7b72-4a0c-aef8-580616759482", # OrqoHire Org ID
            email="orqohire@gmail.com",
            role="hr_admin"
        )
        
        try:
            print("Calling list_job_postings...")
            responses = await list_job_postings(claims=claims, db=db)
            print(f"Success! Returned {len(responses)} responses:")
            for r in responses:
                print(f"  Response: {r.dict()}")
        except Exception as e:
            import traceback
            print(f"Failed with exception:")
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
