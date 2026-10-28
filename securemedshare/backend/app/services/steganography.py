import io
import os
import hashlib
import numpy as np
from PIL import Image
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from app.config import STEGO_DEFAULT_KEY

MAGIC_STEGO = b"SMSS"  # 4 bytes
HEADER_BYTES = 4 + 4   # MAGIC (4) + LENGTH (4)
IV_BYTES = 12          # AESGCM nonce
TAG_BYTES = 16         # AESGCM tag
OVERHEAD = HEADER_BYTES + IV_BYTES + TAG_BYTES  # 36 bytes

def derive_key(passphrase: str, salt: bytes = b"SecureMedShareSalt2026") -> bytes:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    return kdf.derive(passphrase.encode("utf-8"))

def calculate_capacity(img: Image.Image, encrypted: bool = True) -> dict:
    w, h = img.size
    total_bits = w * h * 3  # 1 bit per RGB channel
    total_bytes = total_bits // 8
    usable_bytes = max(0, total_bytes - (OVERHEAD if encrypted else HEADER_BYTES))
    return {
        "width": w,
        "height": h,
        "total_bits": total_bits,
        "max_capacity_bytes": usable_bytes,
        "format_supported": img.format == "PNG" or True
    }

def hide_message(image_bytes: bytes, message: str, key_passphrase: str = STEGO_DEFAULT_KEY, encrypt: bool = True) -> tuple[bytes, dict]:
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    w, h = img.size
    arr = np.array(img, dtype=np.uint8)
    
    msg_bytes = message.encode("utf-8")
    if encrypt:
        aes_key = derive_key(key_passphrase)
        aesgcm = AESGCM(aes_key)
        iv = os.urandom(IV_BYTES)
        # AESGCM.encrypt returns ciphertext + tag appended together
        ciphertext_and_tag = aesgcm.encrypt(iv, msg_bytes, None)
        ciphertext = ciphertext_and_tag[:-TAG_BYTES]
        tag = ciphertext_and_tag[-TAG_BYTES:]
        
        # Header: MAGIC (4) + LEN(ciphertext) (4) + IV (12) + TAG (16) + ciphertext
        payload = MAGIC_STEGO + len(ciphertext).to_bytes(4, "big") + iv + tag + ciphertext
    else:
        payload = MAGIC_STEGO + len(msg_bytes).to_bytes(4, "big") + msg_bytes

    total_bits = len(payload) * 8
    max_bits = w * h * 3
    if total_bits > max_bits:
        raise ValueError(f"Message exceeds image capacity. Needs {len(payload)} bytes, capacity is {max_bits // 8} bytes.")

    # Flatten image channels to 1D
    flat = arr.reshape(-1)
    
    # Pack payload bits into LSBs
    bit_idx = 0
    for byte in payload:
        for i in range(7, -1, -1):
            bit = (byte >> i) & 1
            flat[bit_idx] = (int(flat[bit_idx]) & 0xFE) | bit
            bit_idx += 1

    stego_arr = flat.reshape((h, w, 3))
    stego_img = Image.fromarray(stego_arr, "RGB")

    out = io.BytesIO()
    stego_img.save(out, format="PNG")
    
    return out.getvalue(), {
        "embedded_bytes": len(payload),
        "message_length": len(message),
        "encrypted": encrypt,
        "width": w,
        "height": h
    }

def extract_message(image_bytes: bytes, key_passphrase: str = STEGO_DEFAULT_KEY) -> dict:
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        w, h = img.size
        arr = np.array(img, dtype=np.uint8)
        flat = arr.reshape(-1)

        # Read first 8 bytes (64 bits) for MAGIC and LENGTH
        if len(flat) < 64:
            return {"success": False, "error": "Image too small to contain stego payload"}

        header_bytes = bytearray()
        for i in range(0, 64, 8):
            byte = 0
            for j in range(8):
                byte = (byte << 1) | int(flat[i + j] & 1)
            header_bytes.append(byte)

        if header_bytes[:4] != MAGIC_STEGO:
            return {"success": False, "error": "No valid SecureMedShare steganography payload found"}

        payload_len = int.from_bytes(header_bytes[4:8], "big")
        
        # Check if encrypted (we attempt AES-GCM first)
        # Total bits needed for encrypted: (HEADER + IV + TAG + payload_len) * 8
        enc_total_bytes = OVERHEAD + payload_len
        if len(flat) < enc_total_bytes * 8:
            return {"success": False, "error": "Incomplete stego payload or corrupted image"}

        full_bytes = bytearray()
        for i in range(0, enc_total_bytes * 8, 8):
            byte = 0
            for j in range(8):
                byte = (byte << 1) | int(flat[i + j] & 1)
            full_bytes.append(byte)

        # Parse IV, TAG, ciphertext
        offset = HEADER_BYTES
        iv = bytes(full_bytes[offset:offset + IV_BYTES])
        offset += IV_BYTES
        tag = bytes(full_bytes[offset:offset + TAG_BYTES])
        offset += TAG_BYTES
        ciphertext = bytes(full_bytes[offset:offset + payload_len])

        try:
            aes_key = derive_key(key_passphrase)
            aesgcm = AESGCM(aes_key)
            # Reconstruct ciphertext + tag
            decrypted = aesgcm.decrypt(iv, ciphertext + tag, None)
            return {
                "success": True,
                "message": decrypted.decode("utf-8"),
                "encrypted": True,
                "cipher_algorithm": "AES-256-GCM"
            }
        except Exception:
            # Maybe it was unencrypted? Try decoding unencrypted payload
            unenc_bytes = bytes(full_bytes[HEADER_BYTES:HEADER_BYTES + payload_len])
            try:
                msg = unenc_bytes.decode("utf-8")
                return {
                    "success": True,
                    "message": msg,
                    "encrypted": False
                }
            except Exception:
                return {
                    "success": False,
                    "error": "Failed to decrypt stego payload. Invalid passphrase or damaged bits."
                }
    except Exception as e:
        return {"success": False, "error": str(e)}
