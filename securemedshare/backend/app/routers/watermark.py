import base64
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from fastapi.responses import Response
from app.database import db
from app.security import get_current_user, require_role
from app.services.watermarking import embed_visible_watermark, embed_invisible_watermark, extract_watermark

router = APIRouter(prefix="/api/watermark", tags=["Digital Watermarking"])

@router.post("/embed")
async def embed_watermark_endpoint(
    marker: str = Form(...),
    method: str = Form("visible"),
    file: UploadFile = File(...),
    user: dict = Depends(require_role(["doctor"]))
):
    if not (3 <= len(marker) <= 40):
        raise HTTPException(status_code=400, detail="Marker must be 3-40 characters.")
    
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    
    try:
        if method == "invisible":
            watermarked_bytes, metrics = embed_invisible_watermark(file_bytes, marker)
        else:
            watermarked_bytes, metrics = embed_visible_watermark(file_bytes, marker)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to embed watermark: {str(e)}")

    b64_img = base64.b64encode(watermarked_bytes).decode("utf-8")
    data_url = f"data:image/png;base64,{b64_img}"
    
    db.log_audit(user.get("name", "Doctor"), "WATERMARK_EMBED", marker, "Success")

    return {
        "success": True,
        "marker": marker,
        "method": method,
        "metrics": metrics,
        "data_url": data_url
    }

@router.post("/verify")
async def verify_watermark_endpoint(
    expected_marker: str = Form(None),
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user)
):
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    
    result = extract_watermark(file_bytes, expected_marker)
    db.log_audit(user.get("name", "User"), "WATERMARK_VERIFY", expected_marker or "-", "Success" if result["detected"] else "Failure")
    
    return result
