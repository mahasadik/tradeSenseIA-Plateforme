import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-dev")
    JWT_CSRF_CHECK_FORM = False
    JWT_COOKIE_CSRF_PROTECT = False
    
    # Support both DATABASE_URL and fallback to SQLite for local dev
    database_url = os.getenv("DATABASE_URL", "sqlite:///tradesense.db")
    
    # Render uses postgres:// but SQLAlchemy needs postgresql://
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    
    SQLALCHEMY_DATABASE_URI = database_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:8080")
