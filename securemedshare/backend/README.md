# SecureMedShare - Python FastAPI Backend

FastAPI backend service powering **Secure and Scalable Medical Data Sharing Using Digital Watermarking, Steganography, and Cryptographic Integrity Checks**.

## Features
- **Digital Watermarking**:
  - Visible text badge overlay with alpha blending.
  - Invisible LSB-plane embedding with extraction and bit parity verification.
  - PSNR (Peak Signal-to-Noise Ratio in dB) and MSE (Mean Squared Error) computation to guarantee medical image fidelity (>40 dB).
- **LSB Steganography**:
  - Capacity calculation based on image dimensions and channel bit-planes.
  - Lossless PNG pixel bit embedding.
  - Military-grade AES-256-GCM authenticated encryption for hidden medical payloads.
- **Cryptographic Hashing**:
  - SHA-256 hash generation for all uploaded medical records (images, reports, prescriptions).
  - Multi-check integrity verification comparing uploaded files against trusted stored references.
- **Role-Based Access Control (RBAC)**:
  - Doctor, Patient, and Administrator roles with JWT authentication.
  - Granular access granting and revocation with expiration dates.
- **Append-Only Audit Trail**:
  - Logs all security-critical operations (login, upload, watermarking, steganography, verification, permission changes).

## Installation & Running

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

The API will be available at `http://127.0.0.1:8000`.
Interactive Swagger UI documentation: `http://127.0.0.1:8000/docs`.
ReDoc documentation: `http://127.0.0.1:8000/redoc`.
