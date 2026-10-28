from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from app.database import db
from app.security import get_current_user
from app.services.hashing import compute_sha256_bytes
from app.services.watermarking import extract_watermark

from typing import Optional

router = APIRouter(prefix="/api/verify", tags=["Integrity & Verification"])

@router.post("/file")
async def verify_record_file(
    recordId: Optional[str] = Form(None),
    record_id: Optional[str] = Form(None),
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user)
):
    target_id = recordId or record_id
    if not target_id:
        raise HTTPException(status_code=400, detail="Missing record ID parameter.")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    
    computed_hash = compute_sha256_bytes(file_bytes)
    
    rec = next((r for r in db.records if r["id"] == target_id), None)
    if not rec:
        raise HTTPException(status_code=404, detail="Medical record reference not found in database.")

    ref_hash = rec.get("hash")
    if not ref_hash:
        state = "unavailable"
        hash_match = False
    elif computed_hash.lower() == ref_hash.lower():
        state = "verified"
        hash_match = True
    else:
        state = "mismatch"
        hash_match = False

    # Check watermark if supported
    wm_res = None
    if "Watermark" in rec.get("protection", []):
        try:
            wm_res = extract_watermark(file_bytes, rec.get("watermarkMarker"))
        except Exception:
            wm_res = {"detected": False, "status": "Not an image or watermark damaged"}

    db.log_audit(user.get("name", "User"), "INTEGRITY_VERIFY", target_id, "Success" if hash_match else "Mismatch")

    return {
        "record_id": target_id,
        "title": rec.get("title"),
        "state": state,
        "hash_match": hash_match,
        "computed_hash": computed_hash,
        "reference_hash": ref_hash,
        "protections": rec.get("protection", []),
        "watermark_verification": wm_res or {
            "status": "No watermark registered on this record."
        },
        "stego_extraction_status": {
            "status": "Payload extraction protected. Requires authorized decryption key." if "Stego" in rec.get("protection", []) else "No steganography payload attached."
        }
    }
