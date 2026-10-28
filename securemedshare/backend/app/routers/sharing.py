from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel
from app.database import db
from app.security import get_current_user, require_role

router = APIRouter(prefix="/api/sharing", tags=["Sharing & Permissions"])

class GrantRequest(BaseModel):
    patientId: str
    recordId: str
    expires: str

@router.get("/permissions")
def list_permissions(user: dict = Depends(get_current_user)):
    role = user.get("role", "doctor")
    if role == "patient":
        return [p for p in db.permissions if p.get("patientId") == "p1"]
    return db.permissions

@router.post("/grant")
def grant_permission(req: GrantRequest, user: dict = Depends(require_role(["doctor"]))):
    if not req.patientId or not req.recordId or not req.expires:
        raise HTTPException(status_code=400, detail="Missing required grant fields.")
    
    new_id = f"PRM-{str(len(db.permissions) + 1).zfill(2)}"
    new_perm = {
        "id": new_id,
        "recordId": req.recordId,
        "patientId": req.patientId,
        "granted": datetime.now().strftime("%Y-%m-%d"),
        "expires": req.expires,
        "status": "Active"
    }
    db.permissions.insert(0, new_perm)
    
    # Also mark the record status as Shared
    for r in db.records:
        if r["id"] == req.recordId:
            r["status"] = "Shared"
            break

    db.log_audit(user.get("name", "Doctor"), "PERMISSION_GRANT", new_id, "Success")
    return {"message": "Permission granted successfully.", "permission": new_perm}

@router.post("/revoke/{perm_id}")
def revoke_permission(perm_id: str, user: dict = Depends(require_role(["doctor"]))):
    perm = next((p for p in db.permissions if p["id"] == perm_id), None)
    if not perm:
        raise HTTPException(status_code=404, detail="Permission not found.")
    
    perm["status"] = "Revoked"
    db.log_audit(user.get("name", "Doctor"), "PERMISSION_REVOKE", perm_id, "Success")
    return {"message": "Permission revoked successfully.", "permission": perm}
