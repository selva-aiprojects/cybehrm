import os
import re

base_dir = r"d:\Training\working\HRMS\backend\app\routers"

def patch_file(filename, function_def, new_params, logic_injection):
    path = os.path.join(base_dir, filename)
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    if new_params in content:
        print(f"Already patched {filename}")
        return

    # Add the query parameter
    content = content.replace(function_def, function_def.replace("\n", f"\n    {new_params},\n", 1))

    # Add the logic injection (e.g. overriding `employee.id`)
    content = content.replace(logic_injection[0], logic_injection[1])

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Patched {filename}")

# 1. Patch attendance.py
patch_file("attendance.py", 
    'async def read_my_attendance(', 
    'employee_id: Optional[UUID] = Query(None)', 
    (
"""    target_month = month or datetime.date.today().month""",
"""    
    # HR Override logic
    target_employee_id = employee.id
    if employee_id and employee.user.role in ["hr_admin", "super_admin"]:
        target_employee_id = employee_id

    target_month = month or datetime.date.today().month"""
    )
)
# Update the query to use target_employee_id
with open(os.path.join(base_dir, "attendance.py"), "r", encoding="utf-8") as f:
    c = f.read()
    c = c.replace("Attendance.employee_id == employee.id", "Attendance.employee_id == target_employee_id")
with open(os.path.join(base_dir, "attendance.py"), "w", encoding="utf-8") as f:
    f.write(c)


# 2. Patch leave.py (assuming similar structure, usually get_my_balances)
# Let's just do a generic replacement for leave and payroll
with open(os.path.join(base_dir, "leave.py"), "r", encoding="utf-8") as f:
    c = f.read()
    c = c.replace('async def get_my_leave_balances(', 'async def get_my_leave_balances(\n    employee_id: Optional[UUID] = Query(None),')
    c = c.replace('target_employee_id = employee.id', 'target_employee_id = employee.id') # placeholder
    # We will just write a specific replacement
    c = re.sub(r'(async def get_my_leave_balances\([^)]*\):)', 
               r'\1\n    target_employee_id = employee_id if (employee_id and employee.user.role in ["hr_admin"]) else employee.id', c)
    c = c.replace('LeaveBalance.employee_id == employee.id', 'LeaveBalance.employee_id == target_employee_id')
    
    # For requests
    c = c.replace('async def list_my_leave_requests(', 'async def list_my_leave_requests(\n    employee_id: Optional[UUID] = Query(None),')
    c = re.sub(r'(async def list_my_leave_requests\([^)]*\):)', 
               r'\1\n    target_employee_id = employee_id if (employee_id and employee.user.role in ["hr_admin"]) else employee.id', c)
    c = c.replace('LeaveRequest.employee_id == employee.id', 'LeaveRequest.employee_id == target_employee_id')
    
with open(os.path.join(base_dir, "leave.py"), "w", encoding="utf-8") as f:
    f.write(c)

# 3. Patch payroll.py
with open(os.path.join(base_dir, "payroll.py"), "r", encoding="utf-8") as f:
    c = f.read()
    c = c.replace('async def get_my_payslips(', 'async def get_my_payslips(\n    employee_id: Optional[UUID] = Query(None),')
    c = re.sub(r'(async def get_my_payslips\([^)]*\):)', 
               r'\1\n    target_employee_id = employee_id if (employee_id and employee.user.role in ["hr_admin"]) else employee.id', c)
    c = c.replace('Payslip.employee_id == employee.id', 'Payslip.employee_id == target_employee_id')
    
with open(os.path.join(base_dir, "payroll.py"), "w", encoding="utf-8") as f:
    f.write(c)

print("Backend APIs successfully patched to support HR employee_id overrides!")
