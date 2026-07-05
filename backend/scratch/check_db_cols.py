import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

async def main():
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        # Get all tables and columns matching salary_structures
        query = text("""
            SELECT table_schema, table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name IN ('salary_structures', 'payslips')
            ORDER BY table_schema, table_name, column_name;
        """)
        res = await conn.execute(query)
        rows = res.fetchall()
        print("Columns in database:")
        for r in rows:
            print(f"Schema: {r[0]} | Table: {r[1]} | Column: {r[2]} | Type: {r[3]}")

if __name__ == "__main__":
    asyncio.run(main())
