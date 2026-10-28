import io
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont

def calculate_metrics(img1: Image.Image, img2: Image.Image) -> dict:
    arr1 = np.array(img1.convert("RGB"), dtype=np.float64)
    arr2 = np.array(img2.convert("RGB"), dtype=np.float64)
    
    mse = np.mean((arr1 - arr2) ** 2)
    if mse == 0:
        psnr = 100.0
    else:
        psnr = 20 * math.log10(255.0 / math.sqrt(mse))
    
    return {
        "mse": round(float(mse), 4),
        "psnr_db": round(float(psnr), 2),
        "quality": "Excellent (Clinical grade)" if psnr >= 40 else "Acceptable"
    }

def embed_visible_watermark(image_bytes: bytes, marker: str, opacity: int = 160) -> tuple[bytes, dict]:
    img = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    width, height = img.size

    # Watermark layer
    overlay = Image.new("RGBA", (width, height), (255, 255, 255, 0))
    draw = ImageDraw.Draw(overlay)

    # Use default font or simple text sizing
    font = ImageFont.load_default()
    
    # Bottom-right badge
    text = f"SecureMedShare: {marker}"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    
    pad = 10
    x1 = width - tw - pad * 2 - 20
    y1 = height - th - pad * 2 - 20
    x2 = width - 20
    y2 = height - 20

    # Draw badge background
    draw.rounded_rectangle([x1, y1, x2, y2], radius=6, fill=(15, 43, 82, opacity))
    draw.text((x1 + pad, y1 + pad), text, fill=(255, 255, 255, 230), font=font)

    # Center faint watermark
    center_text = f"CONFIDENTIAL - {marker}"
    c_bbox = draw.textbbox((0, 0), center_text, font=font)
    c_w, c_h = c_bbox[2] - c_bbox[0], c_bbox[3] - c_bbox[1]
    cx = (width - c_w) // 2
    cy = (height - c_h) // 2
    draw.text((cx, cy), center_text, fill=(20, 184, 166, 60), font=font)

    # Composite
    watermarked = Image.alpha_composite(img, overlay).convert("RGB")

    # Also embed dual-layer bit-plane watermark for machine verification
    arr = np.array(watermarked, dtype=np.uint8)
    bits = _str_to_bits(marker)
    total_pixels = arr.shape[0] * arr.shape[1]
    if len(bits) <= total_pixels:
        flat_b = arr[:, :, 2].reshape(-1)
        for i, bit in enumerate(bits):
            flat_b[i] = (int(flat_b[i]) & 0xFE) | bit
        arr[:, :, 2] = flat_b.reshape(arr.shape[0], arr.shape[1])
        watermarked = Image.fromarray(arr, "RGB")

    metrics = calculate_metrics(img.convert("RGB"), watermarked)

    out = io.BytesIO()
    watermarked.save(out, format="PNG")
    return out.getvalue(), {**metrics, "marker": marker, "method": "visible"}

MAGIC_MARKER = b"SMWM"

def _str_to_bits(s: str) -> list[int]:
    data = MAGIC_MARKER + len(s).to_bytes(2, "big") + s.encode("utf-8")
    bits = []
    for b in data:
        for i in range(7, -1, -1):
            bits.append((b >> i) & 1)
    return bits

def _bits_to_str(bits: list[int]) -> str | None:
    bytes_arr = bytearray()
    for i in range(0, len(bits) - 7, 8):
        byte = 0
        for j in range(8):
            byte = (byte << 1) | bits[i + j]
        bytes_arr.append(byte)
    
    if len(bytes_arr) < 6:
        return None
    if bytes_arr[:4] != MAGIC_MARKER:
        return None
    length = int.from_bytes(bytes_arr[4:6], "big")
    if len(bytes_arr) < 6 + length:
        return None
    try:
        return bytes_arr[6:6 + length].decode("utf-8")
    except Exception:
        return None

def embed_invisible_watermark(image_bytes: bytes, marker: str) -> tuple[bytes, dict]:
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    arr = np.array(img, dtype=np.uint8)
    
    bits = _str_to_bits(marker)
    total_pixels = arr.shape[0] * arr.shape[1]
    if len(bits) > total_pixels:
        raise ValueError("Image is too small to embed invisible watermark")

    # Embed in Blue channel LSB
    flat_b = arr[:, :, 2].reshape(-1)
    for i, bit in enumerate(bits):
        flat_b[i] = (int(flat_b[i]) & 0xFE) | bit
    arr[:, :, 2] = flat_b.reshape(arr.shape[0], arr.shape[1])

    watermarked = Image.fromarray(arr, "RGB")
    metrics = calculate_metrics(img, watermarked)

    out = io.BytesIO()
    watermarked.save(out, format="PNG")
    return out.getvalue(), {**metrics, "marker": marker, "method": "invisible"}

def extract_watermark(image_bytes: bytes, expected_marker: str = None) -> dict:
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        arr = np.array(img, dtype=np.uint8)
        flat_b = arr[:, :, 2].reshape(-1)
        
        # Read enough bits for header + potential marker
        max_bits = min(len(flat_b), 4096)
        bits = [int(flat_b[i] & 1) for i in range(max_bits)]
        extracted = _bits_to_str(bits)

        if extracted:
            match = (extracted == expected_marker) if expected_marker else True
            confidence = 100.0 if match else 50.0
            return {
                "detected": True,
                "marker": extracted,
                "match": match,
                "confidence_percent": confidence,
                "status": "Verified authentic marker" if match else "Marker detected (mismatch)"
            }
        else:
            return {
                "detected": False,
                "marker": None,
                "match": False,
                "confidence_percent": 0.0,
                "status": "No valid digital watermark detected or marker corrupted"
            }
    except Exception as e:
        return {
            "detected": False,
            "error": str(e),
            "match": False,
            "confidence_percent": 0.0,
            "status": "Verification error"
        }
