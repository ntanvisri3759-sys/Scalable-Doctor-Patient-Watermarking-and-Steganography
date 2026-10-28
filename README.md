# Scalable Doctor-Patient Watermarking and Steganography
> **SecureMedShare**: Secure and Scalable Medical Data Sharing Using Digital Watermarking, Steganography, and Cryptographic Integrity Checks.

---

## 📌 Project Overview
SecureMedShare is an end-to-end medical records management and sharing platform engineered to protect patient privacy, preserve medical image diagnostic integrity, and guarantee non-repudiation. It combines:
1. **Digital Watermarking**: Visible doctor/institution credentials and imperceptible LSB watermark markers with PSNR/MSE metrics.
2. **Steganographic Payload Embedding**: Hiding confidential diagnostic notes, prescriptions, and patient metadata inside lossless medical images using AES-256-GCM authenticated encryption.
3. **Cryptographic Integrity Verification**: SHA-256 checksum verification proving that records have not been altered or tampered with.
4. **Role-Based Access Control (RBAC)**: Fine-grained access management (Doctor, Patient, Administrator) with JWT tokens.
5. **Append-Only Security Audit Trail**: Immutable logging for forensic audit and compliance.

---

## 🏗️ Architecture & Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Cryptography & Security**: PyCryptodome (AES-256-GCM, SHA-256), PyJWT, PBKDF2 password hashing
- **Image Processing**: Pillow (PIL), NumPy (pixel matrix manipulation, PSNR/MSE calculation)
- **API Documentation**: OpenAPI / Swagger UI & ReDoc

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router v6

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Python 3.10+** installed
- **Node.js 18+** & npm installed
- **Git**

---

### 2. Backend Setup

```bash
# Navigate to backend directory
cd securemedshare/backend

# Create and activate virtual environment
python -m venv venv

# Windows
.\venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
python run.py
```
- API Base: `http://127.0.0.1:8000`
- Interactive Swagger UI: `http://127.0.0.1:8000/docs`

---

### 3. Frontend Setup

```bash
# In a new terminal, navigate to frontend directory
cd securemedshare/frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 🔐 Default Demo Accounts

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Doctor** | `meera.demo@example.com` | `password123` | Upload, Watermark, Stego, Verify, Audit, Share |
| **Patient** | `aarav.demo@example.com` | `password123` | View Records, Verify Integrity, Grant/Revoke Access |
| **Administrator** | `kiran.demo@example.com` | `password123` | Security Audits, User Management |

---

## 📂 Repository Structure

```
.
├── securemedshare/
│   ├── backend/
│   │   ├── app/
│   │   │   ├── routers/       # API endpoints (auth, records, watermark, stego, verify, audit)
│   │   │   ├── services/      # Steganography, watermarking, hashing logic
│   │   │   ├── config.py      # Environment & JWT settings
│   │   │   ├── database.py    # In-memory medical datastore & audit logging
│   │   │   ├── main.py        # FastAPI app initialization & CORS
│   │   │   └── security.py    # JWT, PBKDF2 hashing, role checking
│   │   ├── requirements.txt   # Python package dependencies
│   │   └── run.py             # Uvicorn entry point
│   └── frontend/
│       ├── src/
│       │   ├── components/    # Reusable UI components & layouts
│       │   ├── context/       # Auth & Toast state contexts
│       │   ├── pages/         # Dashboard, Upload, Watermark, Stego, Verify, etc.
│       │   └── services/      # Axios / Fetch API client
│       ├── package.json
│       └── vite.config.js
├── .gitignore
├── .env.example
└── README.md
```

---

## 📜 License
MIT License. Created for secure medical data exchange research and clinical applications.
