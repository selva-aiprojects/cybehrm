import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

async def main():
    engine = create_async_engine(DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        res = await conn.execute(text("SELECT * FROM employees WHERE id = '3343cfb0-f7a3-4ee1-8dcc-0dc2863a91e1'"))
        row = res.fetchone()
        if row:
            print("Employee keys:", res.keys())
            print("Employee values:", row)
        else:
            print("No employee found with id '3343cfb0-f7a3-4ee1-8dcc-0dc2863a91e1'")

if __name__ == "__main__":
    asyncio.run(main())
