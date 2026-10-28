import os
import shutil
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from app.config import UPLOAD_DIR
from app.database import db
from app.security import get_current_user, require_role
from app.services.hashing import compute_sha256_bytes

router = APIRouter(prefix="/api/records", tags=["Medical Records"])

@router.get("")
def list_records(
    q: Optional[str] = Query(None),
    record_type: Optional[str] = Query(None, alias="type"),
    status: Optional[str] = Query(None),
    user: dict = Depends(get_current_user)
):
    role = user.get("role", "doctor")
    # Patients only see shared records for demo patient p1
    if role == "patient":
        base = [r for r in db.records if r.get("patientId") == "p1" and r.get("status") == "Shared"]
    else:
        base = db.records

    results = []
    for r in base:
        if record_type and record_type != "All" and r.get("type") != record_type:
            continue
        if status and status != "All" and r.get("status") != status:
            continue
        if q:
            term = q.lower()
            p_name = next((p["name"] for p in db.patients if p["id"] == r.get("patientId")), "")
            combined = (r.get("title", "") + r.get("id", "") + p_name).lower()
            if term not in combined:
                continue
        results.append(r)
    return results

@router.post("")
async def upload_record(
    patient: str = Form(...),
    title: str = Form(...),
    type: str = Form("Medical Image"),
    notes: Optional[str] = Form(""),
    file: UploadFile = File(...),
    user: dict = Depends(require_role(["doctor"]))
):
    if len(title.strip()) < 3:
        raise HTTPException(status_code=400, detail="Title must be at least 3 characters.")
    
    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")
    
    # Compute SHA-256 integrity hash
    file_hash = compute_sha256_bytes(file_bytes)
    
    # Save file to uploads folder
    new_id = f"REC-{1000 + len(db.records) + 1}"
    safe_filename = f"{new_id}_{os.path.basename(file.filename)}"
    dest_path = UPLOAD_DIR / safe_filename
    with open(dest_path, "wb") as f:
        f.write(file_bytes)

    size_mb = len(file_bytes) / (1024 * 1024)
    size_str = f"{size_mb:.1f} MB" if size_mb >= 1 else f"{len(file_bytes) // 1024} KB"

    new_record = {
        "id": new_id,
        "title": title,
        "type": type,
        "patientId": patient,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "status": "Private",
        "size": size_str,
        "protection": ["Hash"],
        "hash": file_hash,
        "notes": notes,
        "filePath": str(dest_path)
    }
    db.records.insert(0, new_record)
    db.log_audit(user.get("name", "Doctor"), "RECORD_UPLOAD", new_id, "Success")

    return {
        "message": "Medical record uploaded and hashed successfully.",
        "record": new_record
    }

@router.get("/{record_id}")
def get_record(record_id: str, user: dict = Depends(get_current_user)):
    rec = next((r for r in db.records if r["id"] == record_id), None)
    if not rec:
        raise HTTPException(status_code=404, detail="Record not found")
    return rec

@router.get("/{record_id}/download")
def download_record(record_id: str, user: dict = Depends(get_current_user)):
    rec = next((r for r in db.records if r["id"] == record_id), None)
    if not rec:
        raise HTTPException(status_code=404, detail="Record not found")
    
    file_path = rec.get("filePath")
    if file_path and os.path.exists(file_path):
        db.log_audit(user.get("name", "User"), "RECORD_DOWNLOAD", record_id, "Success")
        return FileResponse(file_path, filename=f"{record_id}_{os.path.basename(file_path)}")
    else:
        # Generate dummy demonstration payload if no disk file was stored
        raise HTTPException(status_code=404, detail="Original record file is not present on disk.")
