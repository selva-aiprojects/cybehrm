import urllib.request
import json
import time

login_url = "https://cybehrm-backend.onrender.com/auth/login"
me_url = "https://cybehrm-backend.onrender.com/auth/me"

payload = {
    "email": "admin@orient-ts.com",
    "password": "Password123",
    "organization_id": "11111111-1111-1111-1111-111111111111",
    "login_origin": "Tenant"
}

print("Logging in to PROD Render...")
try:
    req = urllib.request.Request(
        login_url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        method='POST'
    )
    with urllib.request.urlopen(req, timeout=30) as response:
        res_data = json.loads(response.read().decode('utf-8'))
        token = res_data['access_token']
        print("Login successful. Token acquired.")

    for i in range(10):
        print(f"Waiting 3 seconds (iteration {i+1})...")
        time.sleep(3)
        req_me = urllib.request.Request(
            me_url,
            headers={'Authorization': f'Bearer {token}', 'User-Agent': 'Mozilla/5.0'}
        )
        try:
            with urllib.request.urlopen(req_me, timeout=10) as response_me:
                print("Status:", response_me.status)
                print("Body:", json.loads(response_me.read().decode('utf-8'))['email'])
        except Exception as e_me:
            print("Error during iteration:", e_me)
            if hasattr(e_me, 'read'):
                print("Error body:", e_me.read().decode('utf-8'))
            break

except Exception as e:
    print("Error:", e)
    if hasattr(e, 'read'):
        print("Error body:", e.read().decode('utf-8'))
