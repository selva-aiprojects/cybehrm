import urllib.request
import time
import concurrent.futures

url = "https://cybehrm-backend.onrender.com/"

def make_req(i):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            return i, response.status
    except Exception as e:
        return i, str(e)

print("Sending 20 concurrent requests to test production rate limiting...")
with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
    results = list(executor.map(make_req, range(20)))

for i, status in results:
    print(f"Request {i}: {status}")
