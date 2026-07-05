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
        print("Cleaning up dependent tables in 'Orient' schema...")
        
        tables_to_clean = [
            "attendance",
            "leave_requests",
            "leave_balances",
            "salary_structures",
            "payslips",
            "tax_declarations",
            "fbp_declarations",
            "insurance_enrollments",
            "vehicle_leases",
            "employees"
        ]
        
        for table in tables_to_clean:
            try:
                await conn.execute(text(f'DELETE FROM "Orient".{table}'))
                print(f"  Cleaned 'Orient'.{table}")
            except Exception as e:
                print(f"  Error cleaning 'Orient'.{table}: {e}")
                
        print("\nCopying employees from public.employees to 'Orient'.employees...")
        
        # We fetch all columns from public.employees for this organization
        # To avoid hardcoding columns, we can use dynamic SQL or look up table columns.
        # Let's dynamically get the columns of public.employees
        res_cols = await conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'employees'
        """))
        cols = [r[0] for r in res_cols.fetchall()]
        cols_str = ", ".join([f'"{c}"' for c in cols])
        
        insert_sql = f"""
            INSERT INTO "Orient".employees ({cols_str})
            SELECT {cols_str} FROM public.employees
            WHERE organization_id = '11111111-1111-1111-1111-111111111111'
        """
        
        await conn.execute(text(insert_sql))
        print("Successfully synchronized all employees into 'Orient'.employees!")

if __name__ == "__main__":
    asyncio.run(main())
