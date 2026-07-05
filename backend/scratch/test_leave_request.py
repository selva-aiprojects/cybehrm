import requests
import json

login_url = "http://127.0.0.1:8000/auth/login"
leave_url = "http://127.0.0.1:8000/leave/request"

payload = {
    "email": "admin@orient-ts.com",
    "password": "Password123",
    "organization_id": "11111111-1111-1111-1111-111111111111"
}

print("Testing admin login...")
try:
    r = requests.post(login_url, json=payload, timeout=15)
    print("Login Status Code:", r.status_code)
    if r.status_code != 200:
        print("Login Failed Response:", r.text)
        exit(1)
        
    token = r.json()['access_token']
    print("Login successful. Access token received.")

    headers = {
        'Authorization': f'Bearer {token}'
    }

    # Fetch /auth/me
    print("\nFetching /auth/me...")
    r_me = requests.get("http://127.0.0.1:8000/auth/me", headers=headers, timeout=15)
    print("Auth me status:", r_me.status_code)
    print("Auth me response:", r_me.text)

    # Get Leave Balance
    print("\nFetching leave balances...")
    r_bal = requests.get("http://127.0.0.1:8000/leave/balance", headers=headers, timeout=15)
    print("Leave balance status:", r_bal.status_code)
    print("Leave balance response:", r_bal.text)

    # Post Leave Request
    print("\nSubmitting leave request...")
    leave_payload = {
        "leave_type": "casual",
        "start_date": "2026-06-15",
        "end_date": "2026-06-16",
        "reason": "Test leave request from python script"
    }
    r_leave = requests.post(leave_url, json=leave_payload, headers=headers, timeout=15)
    print("Submit leave status:", r_leave.status_code)
    print("Submit leave response:", r_leave.text)

except Exception as e:
    print("Error occurred:", e)
