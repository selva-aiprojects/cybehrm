import asyncio
from sqlalchemy import text
from app.db.session import engine

async def main():
    print("Altering offer_letters table...")
    async with engine.begin() as conn:
        await conn.execute(text('ALTER TABLE offer_letters ADD COLUMN IF NOT EXISTS expiry_date DATE'))
        await conn.execute(text('ALTER TABLE offer_letters ADD COLUMN IF NOT EXISTS proof_attachment TEXT'))
        await conn.execute(text('ALTER TABLE offer_letters ADD COLUMN IF NOT EXISTS proof_attachment_name VARCHAR(255)'))
    print('Done successfully!')

if __name__ == '__main__':
    asyncio.run(main())
