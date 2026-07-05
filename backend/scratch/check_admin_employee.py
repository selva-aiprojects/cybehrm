import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.config import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        try:
            # 1. Fetch user admin@orient-ts.com
            res_user = await conn.execute(text("SELECT id, organization_id, email, role FROM users WHERE email = 'admin@orient-ts.com'"))
            user = res_user.fetchone()
            if not user:
                print("User admin@orient-ts.com not found!")
                return
            
            user_id, org_id, email, role = user
            print(f"User: ID={user_id}, OrgID={org_id}, Email={email}, Role={role}")

            # 2. Fetch employee with this user_id
            res_emp = await conn.execute(text(f"SELECT id, employee_id, first_name, last_name, user_id, organization_id FROM employees WHERE user_id = '{user_id}'"))
            emp = res_emp.fetchone()
            if emp:
                print(f"Employee found: ID={emp[0]}, EmployeeID={emp[1]}, Name={emp[2]} {emp[3]}, EmployeeOrgID={emp[5]}")
            else:
                print("No Employee profile found for user admin@orient-ts.com!")

            # 3. Check Leave Balances for this employee if found
            if emp:
                res_bal = await conn.execute(text(f"SELECT id, leave_type, allocated, used FROM leave_balances WHERE employee_id = '{emp[0]}'"))
                bals = res_bal.fetchall()
                print("Leave Balances:")
                for b in bals:
                    allocated = float(b[2]) if b[2] is not None else 0.0
                    used = float(b[3]) if b[3] is not None else 0.0
                    print(f" - Type: {b[1]}, Allocated: {allocated}, Used: {used}, Remaining: {allocated - used}")
            
        except Exception as e:
            print("Error executing query:", e)

if __name__ == "__main__":
    asyncio.run(main())
