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
        # Get all organizations
        res_orgs = await conn.execute(text("SELECT id, subdomain FROM organizations"))
        orgs = res_orgs.fetchall()
        
        for org_id, subdomain in orgs:
            if not subdomain or subdomain == "nexus-central":
                continue
                
            print(f"\nProcessing tenant: subdomain='{subdomain}', org_id='{org_id}'")
            
            # Check if {subdomain}.employees exists
            check_table = await conn.execute(text(f"""
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.tables 
                    WHERE table_schema = '{subdomain}' AND table_name = 'employees'
                )
            """))
            if not check_table.scalar():
                print(f"  Table '{subdomain}.employees' does not exist. Skipping.")
                continue
                
            # Fetch public employees for this organization (join with users to get email for printing)
            res_pub = await conn.execute(text(f"""
                SELECT e.id, e.employee_id, e.user_id, e.first_name, e.last_name, u.email, 
                       e.department_id, e.designation_id, e.joining_date, e.employment_type, e.employment_status, e.grade
                FROM public.employees e
                LEFT JOIN public.users u ON e.user_id = u.id
                WHERE e.organization_id = '{org_id}'
            """))
            pub_emps = res_pub.fetchall()
            print(f"  Found {len(pub_emps)} public employees for this tenant.")
            
            for emp in pub_emps:
                emp_id, employee_num, user_id, first_name, last_name, email, dept_id, designation_id, joining_date, emp_type, status, grade = emp
                
                # Check if this employee already exists in the tenant schema by employee_id
                res_check = await conn.execute(text(f"""
                    SELECT id FROM "{subdomain}".employees 
                    WHERE employee_id = :employee_id
                """), {"employee_id": employee_num})
                row = res_check.fetchone()
                
                if row:
                    tenant_emp_id = row[0]
                    # Update existing record's user_id and other details to match public
                    await conn.execute(text(f"""
                        UPDATE "{subdomain}".employees
                        SET user_id = :user_id,
                            first_name = :first_name,
                            last_name = :last_name,
                            department_id = :dept_id,
                            designation_id = :designation_id,
                            joining_date = :joining_date,
                            employment_type = :emp_type,
                            employment_status = :status,
                            grade = :grade
                        WHERE id = :id
                    """), {
                        "user_id": user_id,
                        "first_name": first_name,
                        "last_name": last_name,
                        "dept_id": dept_id,
                        "designation_id": designation_id,
                        "joining_date": joining_date,
                        "emp_type": emp_type,
                        "status": status,
                        "grade": grade,
                        "id": tenant_emp_id
                    })
                    print(f"  Updated existing tenant employee: {first_name} {last_name} ({email}) (User ID synced to {user_id})")
                else:
                    # Insert new record in tenant schema
                    # Ensure department/designation exist in tenant schema if specified, else set to null
                    tenant_dept_id = dept_id
                    if dept_id:
                        res_dept = await conn.execute(text(f"""
                            SELECT id FROM "{subdomain}".departments WHERE id = :dept_id
                        """), {"dept_id": dept_id})
                        if not res_dept.fetchone():
                            tenant_dept_id = None
                            
                    tenant_designation_id = designation_id
                    if designation_id:
                        res_desg = await conn.execute(text(f"""
                            SELECT id FROM "{subdomain}".designations WHERE id = :desg_id
                        """), {"desg_id": designation_id})
                        if not res_desg.fetchone():
                            tenant_designation_id = None
                            
                    await conn.execute(text(f"""
                        INSERT INTO "{subdomain}".employees (
                            id, employee_id, user_id, organization_id, first_name, last_name, 
                            department_id, designation_id, joining_date, employment_type, employment_status, grade
                        ) VALUES (
                            :id, :employee_id, :user_id, :org_id, :first_name, :last_name, 
                            :dept_id, :designation_id, :joining_date, :emp_type, :status, :grade
                        )
                    """), {
                        "id": emp_id,
                        "employee_id": employee_num,
                        "user_id": user_id,
                        "org_id": org_id,
                        "first_name": first_name,
                        "last_name": last_name,
                        "dept_id": tenant_dept_id,
                        "designation_id": tenant_designation_id,
                        "joining_date": joining_date,
                        "emp_type": emp_type,
                        "status": status,
                        "grade": grade
                    })
                    print(f"  Inserted new tenant employee: {first_name} {last_name} ({email}) (User ID: {user_id})")

    print("\nDatabase synchronization completed successfully!")

if __name__ == "__main__":
    asyncio.run(main())
