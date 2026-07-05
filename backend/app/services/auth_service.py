# app/services/auth_service.py
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import jwt
import bcrypt
from app.config import settings

class AuthService:
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a raw text password using bcrypt directly."""
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        return hashed.decode('utf-8')

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a plain password against its bcrypt hash directly."""
        try:
            return bcrypt.checkpw(
                plain_password.encode('utf-8'),
                hashed_password.encode('utf-8')
            )
        except Exception:
            return False

    @staticmethod
    def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """
        Generate a secure JWT Access Token.
        Includes claims like user_id, organization_id, email, and role.
        """
        to_encode = data.copy()
        
        # Calculate expiration
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            
        # Add standard expiration claim
        to_encode.update({"exp": expire})
        
        # Encode JWT token
        encoded_jwt = jwt.encode(
            to_encode, 
            settings.JWT_SECRET, 
            algorithm=settings.JWT_ALGORITHM
        )
        return encoded_jwt

    @staticmethod
    def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
        """
        Decode and validate a JWT Access Token.
        Returns the decoded payload if valid, otherwise None.
        """
        try:
            payload = jwt.decode(
                token, 
                settings.JWT_SECRET, 
                algorithms=[settings.JWT_ALGORITHM]
            )
            return payload
        except jwt.PyJWTError:
            return None
