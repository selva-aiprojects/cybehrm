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
        # Check current search path
        path_res = await conn.execute(text("SHOW search_path;"))
        print("Current search path:", path_res.scalar())
        
        # Explicitly set search_path to public
        print("Setting search path to public...")
        await conn.execute(text("SET search_path TO public;"))
        
        print("Altering salary_structures for nps...")
        try:
            await conn.execute(text("ALTER TABLE public.salary_structures ADD COLUMN nps NUMERIC(12, 2) NOT NULL DEFAULT 0.00;"))
            print("Successfully added public.salary_structures.nps")
        except Exception as e:
            print("Failed public.salary_structures.nps:", e)
            
        print("Altering salary_structures for custom_deductions...")
        try:
            await conn.execute(text("ALTER TABLE public.salary_structures ADD COLUMN custom_deductions JSONB DEFAULT '{}';"))
            print("Successfully added public.salary_structures.custom_deductions")
        except Exception as e:
            print("Failed public.salary_structures.custom_deductions:", e)

        print("Altering payslips for nps...")
        try:
            await conn.execute(text("ALTER TABLE public.payslips ADD COLUMN nps NUMERIC(12, 2) NOT NULL DEFAULT 0.00;"))
            print("Successfully added public.payslips.nps")
        except Exception as e:
            print("Failed public.payslips.nps:", e)

        print("Altering payslips for professional_tax...")
        try:
            await conn.execute(text("ALTER TABLE public.payslips ADD COLUMN professional_tax NUMERIC(12, 2) NOT NULL DEFAULT 0.00;"))
            print("Successfully added public.payslips.professional_tax")
        except Exception as e:
            print("Failed public.payslips.professional_tax:", e)

        print("Altering payslips for custom_deductions...")
        try:
            await conn.execute(text("ALTER TABLE public.payslips ADD COLUMN custom_deductions JSONB DEFAULT '{}';"))
            print("Successfully added public.payslips.custom_deductions")
        except Exception as e:
            print("Failed public.payslips.custom_deductions:", e)

if __name__ == "__main__":
    asyncio.run(main())
