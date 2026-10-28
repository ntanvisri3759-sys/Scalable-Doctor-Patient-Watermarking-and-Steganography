import hashlib
from typing import BinaryIO

def compute_sha256_bytes(data: bytes) -> str:
    hasher = hashlib.sha256()
    hasher.update(data)
    return hasher.hexdigest()

def compute_sha256_file(file_obj: BinaryIO) -> str:
    hasher = hashlib.sha256()
    file_obj.seek(0)
    while chunk := file_obj.read(65536):
        hasher.update(chunk)
    file_obj.seek(0)
    return hasher.hexdigest()

def verify_hash(data: bytes, reference_hash: str) -> bool:
    computed = compute_sha256_bytes(data)
    return computed.lower() == reference_hash.strip().lower()
