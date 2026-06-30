import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Lakshmi Steels AI"
    API_V1_STR: str = "/api"
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    # Fallback to local SQLite DB
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:////tmp/lakshmisteels.db" if os.getenv("VERCEL", "") else "sqlite:///./lakshmisteels.db")
    # File upload storage directory (inside backend directory)
    STORAGE_DIR: str = os.getenv("STORAGE_DIR", "/tmp/storage" if os.getenv("VERCEL", "") else "./storage")
    
    class Config:
        case_sensitive = True

settings = Settings()

# Ensure storage directory exists
os.makedirs(settings.STORAGE_DIR, exist_ok=True)
