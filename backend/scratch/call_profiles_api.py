import requests

# We will use the local server running on port 8000
base_url = "http://localhost:8000"

print("Logging in...")
login_res = requests.post(f"{base_url}/auth/login", json={
    "email": "admin@acme.com",
    "password": "Password123",
    "organization_id": "a8385002-390c-45a8-8e6d-2c8b7468112c"
})

if login_res.status_code == 200:
    token = login_res.json()["access_token"]
    print(f"Login success. Token obtained.")
    
    headers = {"Authorization": f"Bearer {token}"}
    profiles_res = requests.get(f"{base_url}/talent/profiles", headers=headers)
    print(f"Profiles Response Code: {profiles_res.status_code}")
    print("Profiles JSON:")
    import json
    print(json.dumps(profiles_res.json(), indent=2))
else:
    print(f"Login failed: {login_res.status_code} | {login_res.text}")
