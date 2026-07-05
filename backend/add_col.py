import asyncio
from sqlalchemy import text
from app.db.session import engine

async def main():
    async with engine.begin() as conn:
        await conn.execute(text('ALTER TABLE talent_candidates ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES talent_profiles(id) ON DELETE SET NULL'))
    print('Done')

if __name__ == '__main__':
    asyncio.run(main())
