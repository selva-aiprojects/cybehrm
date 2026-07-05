import urllib.request
import urllib.parse
import json
import sys

BASE_URL = "http://localhost:8000"
EMAIL = "olivia.anderson419@oriend-ts.com"
PASSWORD = "Password123"
ORG_ID = "11111111-1111-1111-1111-111111111111"

def make_request(url, method="GET", data=None, token=None):
    headers = {
        "Content-Type": "application/json",
        "Bypass-Tunnel-Reminder": "true"
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    req_data = None
    if data:
        req_data = json.dumps(data).encode("utf-8")
        
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            status = response.status
            body = response.read().decode("utf-8")
            return status, json.loads(body)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            err_json = json.loads(body)
        except Exception:
            err_json = body
        return e.code, err_json
    except Exception as e:
        return 0, str(e)

def main():
    print(f"Connecting to backend at {BASE_URL}...", flush=True)
    
    # 1. Login
    login_url = f"{BASE_URL}/auth/login"
    login_payload = {
        "email": EMAIL,
        "password": PASSWORD,
        "organization_id": ORG_ID
    }
    print(f"\n[POST] Logging in as {EMAIL}...", flush=True)
    status, res = make_request(login_url, method="POST", data=login_payload)
    if status != 200:
        print(f"Login failed: status={status}, response={res}", flush=True)
        sys.exit(1)
        
    token = res.get("access_token")
    print(f"Login successful! Received token.", flush=True)
    
    endpoints = [
        ("/auth/me", "GET", None),
        ("/leave/balance", "GET", None),
        ("/attendance/me", "GET", None),
        ("/payroll/payslips/me", "GET", None),
        ("/tax-declarations/me", "GET", None),
        ("/grade-allowances/me", "GET", None),
        ("/fbp-declarations/me", "GET", None),
        ("/insurance/me", "GET", None),
        ("/vehicle-lease/me", "GET", None),
        ("/offboarding/me", "GET", None),
        ("/onboarding/assets/me", "GET", None),
        ("/nexus/tickets/tenant", "GET", None),
    ]
    
    all_success = True
    for path, method, payload in endpoints:
        url = f"{BASE_URL}{path}"
        print(f"\n[{method}] Calling {path}...", flush=True)
        status, response_body = make_request(url, method=method, data=payload, token=token)
        if status == 200:
            print(f"SUCCESS: status={status}", flush=True)
            # print snippet of data
            data_str = json.dumps(response_body)
            snippet = data_str[:120] + ("..." if len(data_str) > 120 else "")
            print(f"  Response: {snippet}", flush=True)
        else:
            print(f"FAILED: status={status}, error={response_body}", flush=True)
            all_success = False
            
    if all_success:
        print("\nAll mobile endpoints verified successfully!", flush=True)
        sys.exit(0)
    else:
        print("\nSome endpoints returned non-200 status codes.", flush=True)
        sys.exit(1)

if __name__ == "__main__":
    main()
