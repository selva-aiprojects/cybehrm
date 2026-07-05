import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.services.auth_service import AuthService
from app.config import settings
import time
import jwt

print("JWT Secret:", settings.JWT_SECRET)
print("JWT Algorithm:", settings.JWT_ALGORITHM)
print("Access token expire minutes:", settings.ACCESS_TOKEN_EXPIRE_MINUTES)

claims = {
    "user_id": "00000000-0000-0000-0000-000000000000",
    "organization_id": "11111111-1111-1111-1111-111111111111",
    "email": "test@example.com",
    "role": "employee"
}

token = AuthService.create_access_token(claims)
print("Generated Token:", token)

# Decode token immediately
decoded = AuthService.decode_access_token(token)
print("Decoded immediately:", decoded)

# Inspect payload details directly without verifying expiration
unverified_payload = jwt.decode(token, options={"verify_signature": False})
print("Unverified payload:", unverified_payload)
print("Exp claim timestamp:", unverified_payload.get("exp"))
print("Current time timestamp:", int(time.time()))
print("Diff (exp - current):", unverified_payload.get("exp") - int(time.time()))
