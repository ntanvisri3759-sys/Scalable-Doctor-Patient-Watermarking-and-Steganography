from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from app.database import db
from app.security import create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: str = "doctor"

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "patient"

@router.post("/login")
def login(req: LoginRequest):
    if len(req.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")
    
    user = next((u for u in db.users if u["email"].lower() == req.email.lower()), None)
    if not user:
        # Create or adapt demo user
        user = {
            "id": f"u{len(db.users) + 1}",
            "name": req.email.split("@")[0].capitalize(),
            "email": req.email,
            "role": req.role,
            "status": "Active"
        }
        db.users.append(user)
    
    # Update role if demo role passed
    user["role"] = req.role

    token = create_access_token({"sub": user["email"], "role": user["role"], "name": user["name"]})
    db.log_audit(user["name"], "LOGIN", "-", "Success")
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/register")
def register(req: RegisterRequest):
    if len(req.name.strip()) < 2:
        raise HTTPException(status_code=400, detail="Name must be at least 2 characters.")
    if len(req.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")
    
    existing = next((u for u in db.users if u["email"].lower() == req.email.lower()), None)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")
    
    new_user = {
        "id": f"u{len(db.users) + 1}",
        "name": req.name,
        "email": req.email,
        "role": req.role,
        "status": "Active"
    }
    db.users.append(new_user)
    
    token = create_access_token({"sub": new_user["email"], "role": new_user["role"], "name": new_user["name"]})
    db.log_audit(new_user["name"], "REGISTER", "-", "Success")
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": new_user
    }

@router.get("/me")
def me(user: dict = Depends(get_current_user)):
    return user
