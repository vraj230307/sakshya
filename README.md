# Sakshya (સાક્ષ્ય) — National Digital Forensics & Data Sanitization Platform

> **Smart India Hackathon (SIH 2026) Project ID: SIH26149**  
> **Statutory Compliance:** Bharatiya Sakshya Adhiniyam 2023 (BSA 2023) Sec 63(4) Dual Certification & NIST SP 800-88 Rev. 1 Media Sanitization Standards.

Live Demo: [https://sakshya-forensics.web.app](https://sakshya-forensics.web.app)

---

## 🛡️ Executive Summary

**Sakshya (સાક્ષ્ય)** is a national-grade digital forensics, media sanitization, and evidence carving workspace built for Law Enforcement Agencies (LEAs), Investigating Officers (IOs), and Digital Forensic Experts. 

It provides an end-to-end statutory workflow for handling digital evidence seized under law, ensuring strict compliance with:
1. **Bharatiya Sakshya Adhiniyam 2023 Section 63(4)** — Dual cryptographic certification (Part A: Officer in Lawful Charge, Part B: Technical Expert).
2. **NIST SP 800-88 Rev. 1** — Guidelines for Media Sanitization (Clear, Purge, and Crypto-Erase).
3. **Cryptographic Chain of Custody** — Immutable SHA-256 audit timeline signed via TPM 2.0 / HMAC-Ed25519 hardware trust engines.

---

## ⚡ Key Features & Capability Matrix

### 1. 📋 Forensic Intake & Acquisition Wizard
- **Linear 3-Step Workflow:** FIR Metadata intake -> Drive Auto-Detection -> Action Selection.
- **Physical Bus Scanning:** Detects NVMe, SATA HDD, and USB targets with SMART health & capacity diagnostics.
- **Baseline Hardware Hashing:** Calculates baseline SHA-256 acquisition hashes prior to media operations.

### 2. 🧹 NIST SP 800-88 Rev. 1 Data Erasure Studio
- **Logical Overwrite (Clear):** Single-pass zero-fill for non-sensitive storage drives.
- **Hardware Firmware Sanitize (Purge):** ATA/NVMe hardware-level erasure preventing laboratory data remanence.
- **Cryptographic Erase (Crypto-Erase):** Instant media key zeroing on Self-Encrypting Drives (SEDs).
- **Live Telemetry Stream:** Real-time WebSocket execution telemetry with speed, progress, and remanence verification (0.00% Remanence Pass).

### 3. 🔍 Raw Sector Evidence Carving & Recovery Studio
- **Magic Header Signature Carving:** Cluster-level sector scanning for PDF, JPG, PNG, ZIP, and DOCX evidence.
- **Integrity Scoring & SHA-256 Hashes:** Automatically evaluates evidence file integrity and records cryptographic fingerprints.
- **Embedded Hex Inspector:** Interactive hex viewer with ASCII dump inspection and 1-click hash copying.

### 4. 📜 BSA 2023 Sec 63(4) Statutory Certificate Hub
- **Dual Certification Framework:**
  - **Part A (Party Certificate):** Signed by Investigating Officer (IO) in lawful charge of evidence.
  - **Part B (Expert Certificate):** Technical expert attestation of system operating parameters.
- **Cryptographic Stamping:** Digital signature locking with printable legal preview and PDF export.

### 5. 🔐 Hardware Trust & Digital Signing Engine
- **Hardware Token Integration:** TPM 2.0 Platform Configuration Register (PCR_00 & PCR_07) attestation and YubiKey PKCS#11 token support.
- **Simulated Hardware Module:** Software-isolated HMAC-Ed25519 keypair engine for field deployment readiness.

---

## 📁 Repository Directory Structure

```
SIH1/
├── firebase.json            # Firebase Hosting configuration (cleanUrls, trailingSlash)
├── .firebaserc              # Firebase target project mapping (sakshya-forensics)
├── deploy.ps1               # PowerShell deployment automation script
├── deploy.sh                # Shell deployment script
├── README.md                # Platform documentation
│
├── frontend/                # Next.js 14 App Router Web Application
│   ├── app/                 # Application routes (App Router)
│   │   ├── cases/new/       # Intake & Acquisition Wizard
│   │   ├── cases/[id]/      # Case Workspaces (Sanitize, Carve, Certs, Timeline)
│   │   ├── dashboard/       # Active Forensic Case Intake Dashboard
│   │   ├── login/           # Officer Authentication & Role Selector
│   │   └── settings/trust/  # Hardware Trust & Signing Engine Settings
│   ├── components/          # Navigation, Layout, and UI Components
│   ├── lib/                 # API Abstraction & Static Demo Fallbacks
│   ├── next.config.mjs      # Next.js export & trailingSlash configuration
│   └── package.json         # Frontend dependencies & build scripts
│
└── backend/                 # Python FastAPI Forensic Core Engine
    ├── main.py              # FastAPI server entrypoint & CORS middleware
    ├── database.py          # SQLAlchemy SQLite / PostgreSQL database connection
    ├── models.py            # Database schemas (Cases, Devices, Operations, Audits)
    ├── schemas.py           # Pydantic request/response validation schemas
    ├── routers/             # API Endpoint Controllers (cases, devices, ops, certs, trust)
    └── services/            # Core Forensic Engines (sanitization, carving, audit, trust)
```

---

## 🛠️ Local Development & Setup Instructions

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **Python** (v3.10 or higher)
- **Firebase CLI** (`npm i -g firebase-tools`) — optional for deployment

---

### 1. Frontend Setup (Next.js)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run dev server on http://localhost:3000
npm run dev
```

To build and verify static export locally:
```bash
npm run build
```

---

### 2. Backend Setup (FastAPI Python)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Run FastAPI server on http://localhost:8000
uvicorn main:app --reload --port 8000
```

---

## 🚀 Deployment to Firebase Hosting

The platform is configured for zero-downtime deployment to Firebase Hosting.

### Automated Deployment (PowerShell)
```powershell
.\deploy.ps1
```

### Manual Deployment Steps
```bash
# 1. Build frontend static export
cd frontend
npm run build
cd ..

# 2. Deploy to Firebase Hosting
npx firebase-tools deploy --only hosting
```

---

## ⚖️ Statutory & Compliance References

- **Bharatiya Sakshya Adhiniyam 2023 (BSA 2023), Section 63(4):** Replaces Section 65B of Indian Evidence Act 1872 for admissibility of electronic records in judicial proceedings.
- **NIST SP 800-88 Revision 1:** Guidelines for Media Sanitization (National Institute of Standards and Technology).
- **ISO/IEC 27037:2012:** Guidelines for identification, collection, acquisition, and preservation of digital evidence.

---

## 📄 License & Attribution

Developed for **Smart India Hackathon (SIH 2026)**.  
All Rights Reserved © 2026 **Sakshya Digital Forensics Team**.
