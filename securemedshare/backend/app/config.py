import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

SECRET_KEY = os.getenv("SECRET_KEY", "securemedshare-super-secret-jwt-key-2026-btech-project")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours
STEGO_DEFAULT_KEY = "SecureMedShareDefaultAesKey2026!"
