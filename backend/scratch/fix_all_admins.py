import asyncio
import datetime
import uuid
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.config import settings

async def main():
    print(f"Connecting to database to fix all admin user employee profiles...")
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        try:
            # 1. Fetch all hr_admin users
            res_users = await conn.execute(text("SELECT id, email, organization_id FROM public.users WHERE role = 'hr_admin'"))
            users = res_users.fetchall()
            print(f"Found {len(users)} admin users in public.users")

            for user_id, email, org_id in users:
                print(f"\nProcessing User: email={email}, id={user_id}, org_id={org_id}")
                
                # Get subdomain of organization
                res_org = await conn.execute(text(f"SELECT subdomain FROM public.organizations WHERE id = '{org_id}'"))
                org = res_org.fetchone()
                if not org:
                    print(f"  Warning: Organization not found for OrgID={org_id}")
                    continue
                subdomain = org[0]
                print(f"  Organization Subdomain: {subdomain}")

                # Check if employee record exists in tenant schema or public
                schema_prefix = f'"{subdomain}".' if subdomain and subdomain != "nexus-central" else ''
                
                # Check if employee table exists in this schema
                try:
                    res_emp = await conn.execute(text(f"SELECT id FROM {schema_prefix}employees WHERE user_id = '{user_id}'"))
                    emp = res_emp.fetchone()
                except Exception as e:
                    print(f"  Error checking employees in schema {subdomain}: {e}")
                    continue

                emp_id_db = None
                if not emp:
                    # Create Employee
                    new_emp_id = str(uuid.uuid4())
                    emp_code = f"EMP-{email.split('@')[0][:4].upper()}-{datetime.date.today().year}"
                    print(f"  Creating Employee profile in {schema_prefix}employees with EmpID={emp_code}...")
                    
                    await conn.execute(text(f"""
                        INSERT INTO {schema_prefix}employees (
                            id, organization_id, user_id, employee_id, first_name, last_name, 
                            joining_date, employment_type, employment_status, grade, created_at, updated_at
                        ) VALUES (
                            '{new_emp_id}', '{org_id}', '{user_id}', '{emp_code}', 'Admin', 'User',
                            '{datetime.date.today().isoformat()}', 'full-time', 'active', 'L3', 
                            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                        )
                    """))
                    emp_id_db = new_emp_id
                    print("  Employee profile created successfully!")
                else:
                    emp_id_db = emp[0]
                    print(f"  Employee profile already exists: ID={emp_id_db}")

                # Seed leave balances
                current_year = datetime.datetime.utcnow().year
                leave_types = [
                    ("casual", 12.0),
                    ("sick", 10.0),
                    ("earned", 15.0),
                    ("unpaid", 30.0)
                ]
                
                for l_type, allocated in leave_types:
                    res_bal = await conn.execute(text(f"""
                        SELECT id FROM {schema_prefix}leave_balances 
                        WHERE employee_id = '{emp_id_db}' AND year = {current_year} AND leave_type = '{l_type}'
                    """))
                    bal = res_bal.fetchone()
                    if not bal:
                        new_bal_id = str(uuid.uuid4())
                        await conn.execute(text(f"""
                            INSERT INTO {schema_prefix}leave_balances (
                                id, organization_id, employee_id, year, leave_type, allocated, used, created_at, updated_at
                            ) VALUES (
                                '{new_bal_id}', '{org_id}', '{emp_id_db}', {current_year}, '{l_type}', {allocated}, 0.0, 
                                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                            )
                        """))
                        print(f"   - Created leave balance for {l_type}: {allocated} days")

            print("\nDatabase correction completed!")

        except Exception as e:
            print("Error executing database query:", e)

if __name__ == "__main__":
    asyncio.run(main())
