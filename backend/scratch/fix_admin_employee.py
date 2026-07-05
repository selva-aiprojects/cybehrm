import asyncio
import datetime
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import select, text
from app.config import settings
from app.models.models import Employee, LeaveBalance

async def main():
    print(f"Connecting to database to fix admin user employee link...")
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        try:
            # 1. Get admin user
            res_user = await conn.execute(text("SELECT id, organization_id FROM users WHERE email = 'admin@orient-ts.com'"))
            user = res_user.fetchone()
            if not user:
                print("User admin@orient-ts.com not found! Run seeding first.")
                return
            
            user_id, org_id = user
            print(f"Admin User found: ID={user_id}, OrgID={org_id}")

            # 2. Check if employee profile already exists
            res_emp = await conn.execute(text(f"SELECT id FROM employees WHERE user_id = '{user_id}'"))
            emp = res_emp.fetchone()
            
            if not emp:
                print("Creating Employee profile for admin@orient-ts.com...")
                emp_id = "WK-1000"
                # Insert employee profile
                # Note: UUIDs on SQLite can be inserted as strings
                await conn.execute(text(f"""
                    INSERT INTO employees (id, organization_id, user_id, employee_id, first_name, last_name, joining_date, employment_type, employment_status, grade, created_at, updated_at)
                    VALUES (
                        '3343cfb0-f7a3-4ee1-8dcc-0dc2863a91e1',
                        '{org_id}',
                        '{user_id}',
                        '{emp_id}',
                        'Admin',
                        'User',
                        '2025-01-01',
                        'full-time',
                        'active',
                        'L3',
                        CURRENT_TIMESTAMP,
                        CURRENT_TIMESTAMP
                    )
                """))
                emp_id_db = '3343cfb0-f7a3-4ee1-8dcc-0dc2863a91e1'
                print("Employee profile created successfully!")
            else:
                emp_id_db = emp[0]
                print(f"Employee profile already exists with ID: {emp_id_db}")

            # 3. Seed leave balances for current year
            current_year = datetime.datetime.utcnow().year
            print(f"Seeding Leave Balances for year {current_year}...")
            
            leave_types = [
                ("casual", 12.0),
                ("sick", 10.0),
                ("earned", 15.0),
                ("unpaid", 30.0)
            ]
            
            for l_type, allocated in leave_types:
                # Check if balance already exists
                res_bal = await conn.execute(text(f"""
                    SELECT id FROM leave_balances 
                    WHERE employee_id = '{emp_id_db}' AND year = {current_year} AND leave_type = '{l_type}'
                """))
                bal = res_bal.fetchone()
                
                if not bal:
                    import uuid
                    new_bal_id = str(uuid.uuid4())
                    await conn.execute(text(f"""
                        INSERT INTO leave_balances (id, organization_id, employee_id, year, leave_type, allocated, used, created_at, updated_at)
                        VALUES (
                            '{new_bal_id}',
                            '{org_id}',
                            '{emp_id_db}',
                            {current_year},
                            '{l_type}',
                            {allocated},
                            0.0,
                            CURRENT_TIMESTAMP,
                            CURRENT_TIMESTAMP
                        )
                    """))
                    print(f" - Created balance for {l_type} leave: {allocated} days")
                else:
                    print(f" - Balance for {l_type} leave already exists.")

            print("Database fix completed successfully!")

        except Exception as e:
            print("Error executing database query:", e)

if __name__ == "__main__":
    asyncio.run(main())
