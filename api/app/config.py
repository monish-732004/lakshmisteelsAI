import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Lakshmi Steels AI"
    API_V1_STR: str = "/api"
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    # Use /tmp for Vercel deployments (read-only filesystem bypass)
    IS_VERCEL: bool = os.getenv("VERCEL", "0") == "1"
    
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:////tmp/lakshmisteels.db" if IS_VERCEL else "sqlite:///./lakshmisteels.db"
    )
    # File upload storage directory (inside backend directory or /tmp for Vercel)
    STORAGE_DIR: str = os.getenv(
        "STORAGE_DIR", 
        "/tmp/storage" if IS_VERCEL else "./storage"
    )
    
    class Config:
        case_sensitive = True

settings = Settings()

# Ensure storage directory exists
os.makedirs(settings.STORAGE_DIR, exist_ok=True)
