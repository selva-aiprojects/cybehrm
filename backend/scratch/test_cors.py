import urllib.request

url = "https://cybehrm-backend.onrender.com/employees"
req = urllib.request.Request(
    url,
    method='OPTIONS',
    headers={
        'Origin': 'https://cybehrm.onrender.com',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'authorization',
        'User-Agent': 'Mozilla/5.0'
    }
)

try:
    with urllib.request.urlopen(req, timeout=10) as response:
        print("Status:", response.status)
        print("Headers:")
        for k, v in response.getheaders():
            print(f"  {k}: {v}")
except Exception as e:
    print("Error:", e)
    if hasattr(e, 'headers'):
        print("Response Headers:")
        for k, v in e.headers.items():
            print(f"  {k}: {v}")
