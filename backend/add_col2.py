import asyncio
from sqlalchemy import text
from app.db.session import engine

async def main():
    async with engine.begin() as conn:
        await conn.execute(text('ALTER TABLE talent_candidates ADD COLUMN IF NOT EXISTS match_score NUMERIC(5, 2);'))
        await conn.execute(text('ALTER TABLE talent_candidates ADD COLUMN IF NOT EXISTS applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;'))
    print('Done')

if __name__ == '__main__':
    asyncio.run(main())
