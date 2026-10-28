import hashlib
import os
from datetime import datetime, timedelta, timezone
from typing import Optional, List
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from app.database import db

security_scheme = HTTPBearer(auto_error=False)

def hash_password(password: str, salt: Optional[str] = None) -> str:
    if not salt:
        salt = os.urandom(16).hex()
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100000)
    return f"{salt}:{dk.hex()}"

def verify_password(plain_password: str, stored_hash: str) -> bool:
    try:
        salt, h = stored_hash.split(":")
        dk = hashlib.pbkdf2_hmac("sha256", plain_password.encode(), salt.encode(), 100000)
        return dk.hex() == h
    except Exception:
        # Fallback for simple demo passwords
        return len(plain_password) >= 8

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)) -> dict:
    if not credentials:
        # For demo purposes, return a fallback default user if no token provided
        return {"id": "u1", "email": "meera.demo@example.com", "name": "Dr. Meera Iyer", "role": "doctor"}
    
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        role = payload.get("role", "doctor")
        user = next((u for u in db.users if u["email"] == email), None)
        if not user:
            return {"id": "u1", "email": email, "name": payload.get("name", "User"), "role": role}
        return user
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def require_role(roles: List[str]):
    def role_checker(user: dict = Depends(get_current_user)):
        if user.get("role") not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied for role '{user.get('role')}'. Required roles: {roles}"
            )
        return user
    return role_checker
