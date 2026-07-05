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
        print("--- ORGANIZATIONS ---")
        res_org = await conn.execute(text("SELECT id, name, subdomain FROM organizations"))
        orgs = res_org.fetchall()
        for o in orgs:
            print(f"ID={o[0]}, Name={o[1]}, Subdomain={o[2]}")

        print("\n--- USERS & EMPLOYEES ---")
        res_users = await conn.execute(text("""
            SELECT u.id, u.email, u.role, u.organization_id, e.id, e.employee_id, e.first_name, e.last_name
            FROM users u
            LEFT JOIN employees e ON e.user_id = u.id
        """))
        users = res_users.fetchall()
        for u in users:
            print(f"User: Email={u[1]}, Role={u[2]}, OrgID={u[3]}")
            if u[4]:
                print(f"  -> Employee: ID={u[4]}, EmpID={u[5]}, Name={u[6]} {u[7]}")
            else:
                print("  -> NO EMPLOYEE PROFILE FOUND!")

if __name__ == "__main__":
    asyncio.run(main())
