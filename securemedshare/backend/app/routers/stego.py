import io
import base64
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from PIL import Image
from app.database import db
from app.security import get_current_user, require_role
from app.config import STEGO_DEFAULT_KEY
from app.services.steganography import calculate_capacity, hide_message, extract_message

router = APIRouter(prefix="/api/stego", tags=["LSB Steganography"])

@router.post("/capacity")
async def get_stego_capacity(
    file: UploadFile = File(...),
    encrypt: bool = Form(True)
):
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    try:
        img = Image.open(io.BytesIO(file_bytes))
        return calculate_capacity(img, encrypted=encrypt)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Cannot read image: {str(e)}")

@router.post("/hide")
async def hide_secret_message(
    message: str = Form(...),
    passphrase: str = Form(STEGO_DEFAULT_KEY),
    encrypt: bool = Form(True),
    file: UploadFile = File(...),
    user: dict = Depends(require_role(["doctor"]))
):
    if not message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    
    try:
        stego_bytes, stats = hide_message(file_bytes, message, key_passphrase=passphrase, encrypt=encrypt)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    b64_img = base64.b64encode(stego_bytes).decode("utf-8")
    data_url = f"data:image/png;base64,{b64_img}"
    
    db.log_audit(user.get("name", "Doctor"), "STEGO_ENCODE", "-", "Success")

    return {
        "success": True,
        "stats": stats,
        "data_url": data_url
    }

@router.post("/extract")
async def extract_secret_message(
    passphrase: str = Form(STEGO_DEFAULT_KEY),
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user)
):
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    
    res = extract_message(file_bytes, key_passphrase=passphrase)
    db.log_audit(user.get("name", "User"), "STEGO_EXTRACT", "-", "Success" if res.get("success") else "Failure")
    
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Extraction failed"))
    
    return res
