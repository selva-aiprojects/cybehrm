import urllib.request
import json

login_url = "http://127.0.0.1:8000/auth/login"
me_url = "http://127.0.0.1:8000/auth/me"

payload = {
    "email": "john.doe@acme.com",
    "password": "Password123",
    "organization_id": "a8385002-390c-45a8-8e6d-2c8b7468112c",
    "login_origin": "Tenant"
}

print("Testing employee login and me endpoints...")
try:
    # 1. Login
    req = urllib.request.Request(
        login_url,
        data=json.dumps(payload).encode('utf-8'),
        headers={
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0'
        },
        method='POST'
    )
    with urllib.request.urlopen(req, timeout=10) as response:
        res_data = json.loads(response.read().decode('utf-8'))
        token = res_data['access_token']
        print("Login status:", response.status)
        print("Access Token received successfully.")

    # 2. Get profile /auth/me
    req_me = urllib.request.Request(
        me_url,
        headers={
            'Authorization': f'Bearer {token}',
            'User-Agent': 'Mozilla/5.0'
        }
    )
    with urllib.request.urlopen(req_me, timeout=10) as response_me:
        print("Auth me status:", response_me.status)
        print("Auth me body:", json.loads(response_me.read().decode('utf-8')))

except Exception as e:
    print("Error:", e)
    if hasattr(e, 'read'):
        print("Error body:", e.read().decode('utf-8'))
