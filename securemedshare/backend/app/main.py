from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, records, watermark, stego, verify, sharing, audit, patients

app = FastAPI(
    title="SecureMedShare API",
    description="Secure and Scalable Medical Data Sharing Using Digital Watermarking, Steganography, and Cryptographic Integrity Checks",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for frontend access
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(records.router)
app.include_router(watermark.router)
app.include_router(stego.router)
app.include_router(verify.router)
app.include_router(sharing.router)
app.include_router(audit.router)
app.include_router(patients.router)

@app.get("/")
def root():
    return {
        "project": "SecureMedShare",
        "description": "Scalable Doctor-Patient Watermarking and Steganography Platform",
        "status": "healthy",
        "version": "1.0.0",
        "documentation": "/docs"
    }

@app.get("/health")
def health():
    return {"status": "ok"}
