import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

async def run():
    engine = create_async_engine(os.getenv('DATABASE_URL'))
    async with engine.begin() as conn:
        res = await conn.execute(text('SELECT COUNT(*) FROM employees'))
        print(f'Total employees: {res.scalar()}')

asyncio.run(run())
