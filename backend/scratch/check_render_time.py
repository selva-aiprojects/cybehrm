import urllib.request
import json
import jwt
import time
from datetime import datetime

login_url = "https://cybehrm-backend.onrender.com/auth/login"
payload = {
    "email": "admin@orient-ts.com",
    "password": "Password123",
    "organization_id": "11111111-1111-1111-1111-111111111111",
    "login_origin": "Tenant"
}

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
        print("Login successful on Render.")
        
    # 2. Decode token
    unverified = jwt.decode(token, options={"verify_signature": False})
    print("Unverified payload from Render:", unverified)
    
    exp = unverified.get("exp")
    now_ts = int(time.time())
    print(f"Exp: {exp}")
    print(f"Current local system timestamp: {now_ts}")
    print(f"Diff (exp - now): {exp - now_ts} seconds")
    
    # 3. Call auth/me
    me_url = "https://cybehrm-backend.onrender.com/auth/me"
    req_me = urllib.request.Request(
        me_url,
        headers={'Authorization': f'Bearer {token}', 'User-Agent': 'Mozilla/5.0'}
    )
    with urllib.request.urlopen(req_me, timeout=10) as response_me:
        print("Render auth/me call status:", response_me.status)
        print("Render auth/me body:", json.loads(response_me.read().decode('utf-8'))['email'])

except Exception as e:
    print("Error:", e)
    if hasattr(e, 'read'):
        print("Error body:", e.read().decode('utf-8'))
