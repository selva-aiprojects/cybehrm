# app/config.py
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    PROJECT_NAME: str = "HRMS-Engine API"
    VERSION: str = "1.0.0"
    
    # Server Config
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # Database Config
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql+asyncpg://postgres:postgres@localhost:5432/hrms-engine"
    )
    
    # Security/JWT Config
    JWT_SECRET: str = os.getenv(
        "JWT_SECRET", 
        "8bfd8b8e05cbbdf12a52efc15ffad045479b4cd3b5bdf47321e02a0a2df3324d"
    )
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    
    # AI Config
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    AI_MODEL: str = os.getenv("AI_MODEL", "llama3-8b-8192")

    # Email Config
    RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "")
    RESEND_FROM: str = os.getenv("RESEND_FROM", "HIMS Onboarding <onboarding@cognivectra.com>")

settings = Settings()
