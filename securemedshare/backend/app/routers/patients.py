from fastapi import APIRouter, Depends
from app.database import db
from app.security import get_current_user, require_role

router = APIRouter(prefix="/api", tags=["Users & Patients"])

@router.get("/patients")
def list_patients(user: dict = Depends(require_role(["doctor", "admin"]))):
    return db.patients

@router.get("/users")
def list_users(user: dict = Depends(require_role(["admin"]))):
    return db.users

@router.get("/notifications")
def list_notifications(user: dict = Depends(get_current_user)):
    return db.notifications

@router.post("/notifications/mark-read")
def mark_notifications_read(user: dict = Depends(get_current_user)):
    for n in db.notifications:
        n["read"] = True
    return {"message": "All notifications marked as read."}
