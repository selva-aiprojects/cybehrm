with open("app/routers/nexus.py", "r") as f:
    code = f.read()

# Add organization_id to departments
code = code.replace(
    "dept_hr = Department(\n        name=\"Human Resources\",\n        code=\"HR\"\n    )",
    "dept_hr = Department(\n        organization_id=new_org.id,\n        name=\"Human Resources\",\n        code=\"HR\"\n    )"
)
code = code.replace(
    "dept_eng = Department(\n        name=\"Engineering\",\n        code=\"ENG\"\n    )",
    "dept_eng = Department(\n        organization_id=new_org.id,\n        name=\"Engineering\",\n        code=\"ENG\"\n    )"
)

# Add to GradeAllowance
code = code.replace("ga_l1 = GradeAllowance(\n        grade=\"L1\",", "ga_l1 = GradeAllowance(\n        organization_id=new_org.id,\n        grade=\"L1\",")
code = code.replace("ga_l2 = GradeAllowance(\n        grade=\"L2\",", "ga_l2 = GradeAllowance(\n        organization_id=new_org.id,\n        grade=\"L2\",")
code = code.replace("ga_l3 = GradeAllowance(\n        grade=\"L3\",", "ga_l3 = GradeAllowance(\n        organization_id=new_org.id,\n        grade=\"L3\",")

# Add to LeavePolicy
code = code.replace("LeavePolicy(grade=", "LeavePolicy(organization_id=new_org.id, grade=")

# Add to Employee
code = code.replace(
    "new_employee = Employee(\n        user_id=new_user.id,",
    "new_employee = Employee(\n        organization_id=new_org.id,\n        user_id=new_user.id,"
)

# Add to LeaveBalance
code = code.replace(
    "balance = LeaveBalance(\n            employee_id=new_employee.id,",
    "balance = LeaveBalance(\n            organization_id=new_org.id,\n            employee_id=new_employee.id,"
)

with open("app/routers/nexus.py", "w") as f:
    f.write(code)

print("Patched nexus.py")
