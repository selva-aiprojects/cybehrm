import urllib.request
import json

login_url = "https://cognihr-backend.onrender.com/auth/login"
emp_url = "https://cognihr-backend.onrender.com/employees"

payload = {
    "email": "admin@acme.com",
    "password": "Password123",
    "organization_id": "a8385002-390c-45a8-8e6d-2c8b7468112c",
    "login_origin": "Tenant"
}

print("Testing production Acme Admin authentication & employee fetch...")
try:
    # 1. Login
    req = urllib.request.Request(
        login_url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        method='POST'
    )
    with urllib.request.urlopen(req, timeout=15) as response:
        res_data = json.loads(response.read().decode('utf-8'))
        token = res_data['access_token']
        print("Login status:", response.status)

    # 2. Get employees
    req_emp = urllib.request.Request(
        emp_url,
        headers={
            'Authorization': f'Bearer {token}',
            'User-Agent': 'Mozilla/5.0'
        }
    )
    with urllib.request.urlopen(req_emp, timeout=15) as response_emp:
        print("Employees fetch status:", response_emp.status)
        employees = json.loads(response_emp.read().decode('utf-8'))
        print(f"Successfully retrieved {len(employees)} employees.")
        for emp in employees[:3]:
            print(f"- {emp.get('first_name')} {emp.get('last_name')} ({emp.get('employee_id')})")

except Exception as e:
    print("Error:", e)
    if hasattr(e, 'read'):
        try:
            print("Error body:", e.read().decode('utf-8'))
        except Exception:
            pass
