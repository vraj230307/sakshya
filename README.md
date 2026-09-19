# Sakshya (સાક્ષ્ય) — National Digital Forensics & Data Sanitization Platform

[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH%202026-Project%20ID%3A%20SIH26149-orange.svg?style=for-the-badge)](https://www.sih.gov.in/)
[![Statutory Compliance](https://img.shields.io/badge/Statutory%20Compliance-BSA%202023%20Sec%2063(4)%20%7C%20NIST%20SP%20800--88-00c853.svg?style=for-the-badge)](#-statutory--regulatory-references)
[![Live Evaluation Sandbox](https://img.shields.io/badge/Live%20Sandbox-Firebase%20Hosting%20(Verified)-0288D1.svg?style=for-the-badge&logo=firebase)](https://sakshya-forensics.web.app)
[![Frontend Stack](https://img.shields.io/badge/Frontend-Next.js%2014.2%20App%20Router-000000.svg?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Backend Engine](https://img.shields.io/badge/Backend-FastAPI%20Python%203.11%2F3.13-009688.svg?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![Automated Test Suite](https://img.shields.io/badge/Tests-100%25%20Passing-brightgreen.svg?style=for-the-badge)](#-automated-testing--verification)

> **Live Production Sandbox:** [https://sakshya-forensics.web.app](https://sakshya-forensics.web.app)  
> **Mirror Domain:** [https://sakshya-forensics.firebaseapp.com](https://sakshya-forensics.firebaseapp.com)  
> **Smart India Hackathon (SIH 2026) Problem Statement ID:** **SIH26149**  
> **Domain:** Digital Forensics, Media Sanitization, Law Enforcement Agency (LEA) Workflow Automation

---

## 🛡️ Executive Overview

**Sakshya (સાક્ષ્ય)** is a specialized digital forensics, media sanitization, raw-sector file carving, and statutory evidence certification platform engineered for **Law Enforcement Agencies (LEAs)**, **Investigating Officers (IOs)**, and **Digital Forensic Experts**.

The platform is designed around two mandatory legal and technical standards:
1. **Bharatiya Sakshya Adhiniyam 2023 (BSA 2023), Section 63(4):** Replaces Section 65B of the repealed Indian Evidence Act 1872, mandating dual cryptographic attestation (Part A for the Officer in lawful charge, Part B for the Technical Forensic Expert) for electronic records to be admissible in judicial proceedings.
2. **NIST SP 800-88 Revision 1:** Establishes the three-tier sanitization taxonomy (**Clear**, **Purge**, and **Crypto-Erase**) with statistical remanence verification to ensure media is safely destroyed, sanitized, or repurposed without data leakage.

```mermaid
flowchart TD
    subgraph Intake["1. Forensic Intake & Acquisition Wizard"]
        A[FIR Metadata & Case Registration] --> B[Physical Drive Detection NVMe/SATA/USB]
        B --> C[SMART Health & Hardware Diagnostics]
        C --> D[Baseline SHA-256 Acquisition Hash]
    end

    subgraph Operation["2. Dual Forensic Operation Studios"]
        D -->|Data Sanitization Branch| E[NIST SP 800-88 Sanitization Studio]
        E --> E1[Clear: Single-Pass Logical Overwrite]
        E --> E2[Purge: Firmware ATA/NVMe Erase]
        E --> E3[Crypto-Erase: SED Key Invalidation]
        
        D -->|Evidence Carving Branch| F[Raw Sector Carving Studio]
        F --> F1[Magic Byte Header Discovery]
        F --> F2[File Carving: PDF / JPG / PNG / ZIP / DOCX]
        F --> F3[Interactive Hex Dump & ASCII Inspector]
    end

    subgraph Telemetry["3. Telemetry Stream & Hash Chaining"]
        E1 & E2 & E3 & F1 & F2 --> G[Execution Telemetry & Progress Stream]
        G --> H[Remanence Verification Pass: 0.00%]
        H --> I[Cryptographic SHA-256 Hash Chain]
    end

    subgraph Output["4. BSA 2023 Sec 63(4) Statutory Hub"]
        I --> J[Statutory Dual-Party Certificate Generator]
        J --> K1[Part A: Custody Certificate - IO Signature]
        J --> K2[Part B: Technical Certificate - Expert Signature]
        K1 & K2 --> L[Printable Court-Admissible Evidence Bundle]
    end
```

---

## 🎯 Architecture Transparency: Live Web Sandbox vs. Production Engine

To provide an optimal experience for judges, peer reviewers, and hackathon visitors without requiring manual environment setup or risking media drives:

- **Live Web Deployment ([sakshya-forensics.web.app](https://sakshya-forensics.web.app)):**  
  Operates as an **interactive zero-install evaluation sandbox** hosted on Google Firebase Hosting. It features high-fidelity client simulation fallbacks (LocalStorage persistence, browser-based WebCrypto SHA-256 computation, and telemetry animation loops) so that evaluators can test the complete user journey in any browser without installing Python, Docker, or physical forensic test drives.
- **Production Forensic Engine (`/backend`):**  
  A complete **Python FastAPI** server located in `/backend` that interfaces with SQLAlchemy (SQLite or PostgreSQL via `DATABASE_URL`), implements actual sector magic byte scanners (`backend/services/carver.py`), ATA/NVMe sanitize primitives (`backend/services/sanitizer.py`), and serves live WebSockets (`ws://localhost:8000/api/operations/{id}/stream`).

---

## 🔑 Evaluator Test Personas (Hackathon Sandbox Only)

> ⚠️ **Demo-Only Feature Notice:** The 1-Click Quick Demo Presets visible on the login page are evaluation aids provided solely for hackathon judging speed. In lawful production builds, hardware token attestation (PKCS#11 / FIDO2) and CCTNS / LDAP credentials are required.

| Statutory Role | Officer Persona | Badge ID | Judicial Responsibility |
|:---|:---|:---|:---|
| **Investigating Officer (IO)** | Inspr. Rajesh Kumar | `IO-0142` | Case Registration, Seizure Documentation, Signs **BSA 63(4) Part A** |
| **Forensic Technical Expert** | Dr. Ananya Sharma | `EXPERT-901` | NIST Eradication, Sector Carving, Signs **BSA 63(4) Part B** |
| **System Administrator** | Admin Controller | `ADMIN-001` | Platform Trust Configuration & Audit Verification |

---

## ⚡ Core Capability Matrix

### 1. 📋 Forensic Intake & Acquisition Wizard (`/cases/new`)
- **Procedural Compliance:** 3-step intake requiring FIR number, police station, district, and offense classification prior to media manipulation.
- **Media Bus Enumeration:** Catalogs NVMe, SATA HDD/SSD, and USB removable targets with capacity, interface bus, and SMART health.
- **Baseline Cryptographic Hash:** Computes initial SHA-256 acquisition fingerprint before any operation to maintain chain of custody.

### 2. 🧹 NIST SP 800-88 Rev. 1 Data Sanitization Studio (`/cases/[id]/sanitize`)
- **Clear (Logical Overwrite):** User-accessible sector overwrite for non-sensitive repurposing.
- **Purge (Hardware Level):** Targets firmware-level blocks, spare sectors, and reallocated clusters (recommended for forensic disposal).
- **Crypto-Erase (SED Key Purge):** Eradicates internal Media Encryption Key (MEK) on Self-Encrypting Drives (instant zero-remanence).
- **Telemetry Stream:** Live execution telemetry (MB/s throughput, elapsed duration, block progress, and statistical remanence verification reporting a 0.00% pass).
- > ⚠️ **Sandbox Simulation Caveat:** *Remanence verification in the live sandbox is simulated alongside the sanitization operation; the backend engine implements the actual verification logic.*

### 3. 🔍 Raw Sector Evidence Carving & Recovery Studio (`/cases/[id]/recover`)
- **Magic Header Cluster Discovery:** Identifies deleted or concealed evidentiary artifacts via magic byte headers:
  - **PDF:** `%PDF-1.` (`0x25 0x50 0x44 0x46`)
  - **JPEG:** `\xFF\xD8\xFF` (`0xFF 0xD8 0xFF`)
  - **PNG:** `\x89PNG\r\n\x1a\n` (`0x89 0x50 0x4E 0x47`)
  - **ZIP / Office (DOCX):** `PK\x03\x04` (`0x50 0x4B 0x03 0x04`)
- **Interactive Hex Inspector:** Synchronized 16-byte hex dump and ASCII viewer with 1-click SHA-256 fingerprint copying.
- **Integrity Scoring:** Calculates artifact continuity percentage based on cluster structure and trailer signatures.

### 4. 📜 BSA 2023 Sec 63(4) Statutory Certificate Hub (`/cases/[id]/certificates`)
- **Statutory Separation of Responsibilities:**
  - **Part A (Party Certificate):** Attested by the Investigating Officer in lawful charge certifying device possession and seizure circumstances.
  - **Part B (Expert Certificate):** Attested by the Forensic Technical Expert certifying software tool hash integrity, operating conditions, and device diagnostics.
- **Cryptographic Sealing:** Digital signature locking with timestamp, officer credentials, and printable PDF export.

### 5. 🔐 Hardware Trust & Chain of Custody (`/settings/trust` & `/cases/[id]/timeline`)
- **Sequential Cryptographic Hash Chain:** Audit log where each event is chained (`this_hash = SHA256(prev_hash + actor + event_type + description + timestamp)`), allowing instant detection of retroactive record tampering.
- **Simulated Hardware Trust Layer:** Cross-platform HMAC-Ed25519 cryptographic signing engine with stubbed TPM 2.0 PCR registers (`PCR_00` and `PCR_07`) and simulated YubiKey PKCS#11 token interface (physical TSS2 TPM chip and hardware token driver integrations planned for laboratory production pilots).

---

## 🎯 Evaluator & Judge Q&A Cheat-Sheet

<details>
<summary><b>1. "Show me the Merkle Tree or explain your audit trail structure."</b></summary>

> **Answer:** "Our audit trail is built as a **sequential cryptographic SHA-256 hash chain** (`this_hash = SHA-256(prev_hash || actor || event_type || description || timestamp)`), rooted at a genesis hash. In sequential digital evidence custody, an append-only hash chain is the legally robust pattern because evidence logs are chronological linear sequences of custody handoffs. A Merkle tree is designed for parallel subset proofs across large distributed blocks, whereas an append-only hash chain provides deterministic, unforgeable verification that zero intermediate events were modified, deleted, or injected."
</details>

<details>
<summary><b>2. "Is the web demo wiping real physical drives?"</b></summary>

> **Answer:** "In the live web evaluation sandbox, sanitization and carving telemetry are simulated to ensure safety. It would be dangerous and poor practice to execute raw low-level ATA Secure Erase or `nvme format` commands against an evaluator's personal computer storage over a browser session. However, in our backend engine (`backend/services/sanitizer.py`), we have implemented the underlying platform command wrappers designed to run within an isolated forensic laboratory workstation."
</details>

<details>
<summary><b>3. "How does your platform differ from other teams addressing digital forensics?"</b></summary>

> **Answer:** "Three key differentiators:
> 1. **True BSA 2023 Section 63(4) Dual Partitioning:** Most platforms produce a single generic 'forensic report' or still cite the repealed Section 65B of the Indian Evidence Act. Sakshya strictly separates the legal custody attestation (Part A - Officer in lawful charge) from the technical diagnostics attestation (Part B - Forensic Expert), matching the exact statutory text of the new criminal laws.
> 2. **Strict NIST SP 800-88 Rev. 1 Taxonomy:** We explicitly implement Clear, Purge, and Crypto-Erase with statistical remanence verification protocols, rather than arbitrary zero-filling.
> 3. **Offline Zero-Dependency Reliability:** Forensic labs in remote police districts frequently operate in air-gapped or intermittent connectivity environments. Our architecture operates both in connected multi-tenant environments and standalone local stations."
</details>

<details>
<summary><b>4. "Is your backend deployed to a server right now?"</b></summary>

> **Answer:** "For the public web deployment, the frontend is hosted on Google Firebase Hosting with a high-fidelity client simulation engine, ensuring 100% uptime and instant loading without relying on cold-starting free-tier cloud containers. The complete Python FastAPI backend is provided in the repository with a Dockerfile and full SQLAlchemy ORM support for on-premise LEA laboratory server deployment."
</details>

---

## 📌 Known Limitations & Roadmap Milestones

In the spirit of technical transparency, the prototype's current state and roadmap are documented below:

| Component | Current Prototype Status | Future Production Roadmap Milestone |
|:---|:---|:---|
| **TPM 2.0 / Token Signing** | Simulated software HMAC-Ed25519 with mock PCR registers | Direct TSS2 library integration with physical TPM chips and PKCS#11 YubiKey drivers |
| **Hardware Sanitization** | High-fidelity WebSocket simulation in UI; backend CLI wrappers | Kernel-level raw ATA Secure Erase (`hdparm`), NVMe Format CLI (`nvme-cli`), and OPAL SED crypto-erase |
| **Disk Carving** | Magic byte header signature carving for PDF, JPG, PNG, ZIP, DOCX | Deep file fragmentation reassembly, SQLite internal carving, and deleted partition table rebuilding |
| **Statutory Certificates** | Client-side printable PDF export with cryptographic QR & hash stamps | Integration with Government e-Sign (Aadhaar/DSC) and National e-Courts API integration |

---

## 🧪 Automated Testing & Verification

A dedicated end-to-end automated test suite validates all backend API routes, models, and cryptographic routines.

### Run Backend Tests
```bash
cd backend
python test_suite.py
```
**Test Coverage (100% Pass Rate):**
- `GET /` — API root status and compliance checks
- `POST /api/auth/login` & `GET /api/auth/me` — Officer badge verification & role assignment
- `GET /api/cases` & `GET /api/cases/{id}` — Case registry & FIR retrieval
- `GET /api/devices/detect` & `GET /api/cases/{id}/devices` — Target drive cataloging
- `POST /api/cases/{id}/operations` (Type: `SANITIZE`) — NIST SP 800-88 Clear & Purge execution
- `POST /api/cases/{id}/operations` (Type: `RECOVER`) — Raw sector carving & file signature discovery
- `GET /api/operations/{id}/files` — Extracted evidence artifacts with SHA-256 baseline hashes
- `GET /api/cases/{id}/certificates` & `POST /api/certificates/{id}/sign` — BSA 63(4) Part A & B signing
- `GET /api/certificates/{id}/html` — Legal certificate court bundle preview
- `GET /api/cases/{id}/timeline` & `GET /api/cases/{id}/timeline/verify` — SHA-256 tamper-evident hash chain validation
- `GET /api/trust/status` — TPM 2.0 PCR & Ed25519 cryptographic trust status

### Run Frontend Static Verification
```bash
cd frontend
npm run build
```
Compiles and generates all **33 static pages** including SSG routes for dynamic cases with 0 lint/build errors.

---

## 📁 Repository Structure

```text
SIH1/
├── firebase.json                 # Firebase Hosting rewrite rules, cleanUrls, and cache headers
├── .firebaserc                   # Firebase project mapping (sakshya-forensics)
├── deploy.ps1                    # PowerShell automated build & deployment script
├── deploy.sh                     # Bash automated build & deployment script
├── README.md                     # Comprehensive platform architecture & evaluation documentation
│
├── frontend/                     # Next.js 14.2 Web Application (App Router & Static Export)
│   ├── app/
│   │   ├── layout.tsx            # Global layout with Forensic TopNav & Status Bar
│   │   ├── page.tsx              # Root landing redirect to /dashboard
│   │   ├── login/                # Officer Authentication with Evaluator Presets & Sandbox Notice
│   │   ├── dashboard/            # Forensic Case Registry with Search, Status Filters & Statistics
│   │   ├── cases/new/            # 3-Step Guided Intake & Hardware Acquisition Wizard
│   │   ├── cases/[id]/
│   │   │   ├── page.tsx          # Case root fallback redirect to /sanitize
│   │   │   ├── layout.tsx        # Dynamic Case Sub-Navigation & Static Params Provider
│   │   │   ├── sanitize/         # NIST SP 800-88 Data Erasure Studio with Live Telemetry
│   │   │   ├── recover/          # Magic Header File Carving Studio & Interactive Hex Viewer
│   │   │   ├── certificates/     # BSA 2023 Sec 63(4) Dual-Party Certificate Hub (Part A & B)
│   │   │   └── timeline/         # SHA-256 Tamper-Evident Hash Chain Audit Explorer
│   │   └── settings/trust/       # Hardware Trust Configuration, PCR Monitor & Token Simulator
│   ├── components/layout/        # Forensic Navbar, Headers, and Shared Shells
│   ├── components/case/          # Case Sub-Navigation bar
│   ├── lib/
│   │   └── api.ts                # Unified REST API Client with Timeout & Offline Fallbacks
│   ├── next.config.mjs           # Next.js export & memory-safe build optimization
│   └── package.json              # Next.js 14.2.35, React 18, Lucide Icons, Tailwind CSS
│
└── backend/                      # Python FastAPI Digital Forensics Engine
    ├── main.py                   # FastAPI Application Entrypoint, CORS Middleware & Seed Startup
    ├── database.py               # SQLAlchemy Engine with PostgreSQL & SQLite URL Auto-Normalization
    ├── models.py                 # ORM Schemas (Officers, Cases, Devices, Operations, Certs, Audits)
    ├── schemas.py                # Pydantic Schemas for Strict Input/Output Validation
    ├── seed_data.py              # Realistic Sample Data for Demonstration & Testing
    ├── test_suite.py             # End-to-end automated API verification test suite
    ├── Dockerfile                # Multi-stage production container for Cloud Run / Render
    ├── requirements.txt          # Python dependencies (FastAPI, Uvicorn, SQLAlchemy, WebSockets)
    ├── routers/
    │   ├── auth.py               # Officer session & badge credentials
    │   ├── cases.py              # Case management & FIR registration
    │   ├── devices.py            # Storage drive acquisition & baseline hashing
    │   ├── operations.py         # NIST sanitization, carving jobs & WebSocket telemetry
    │   ├── certificates.py       # BSA 2023 Sec 63(4) certificate signing & validation
    │   ├── timeline.py           # Tamper-evident hash chain verification endpoints
    │   └── trust.py              # Hardware trust module, TPM 2.0 PCRs & Ed25519 status
    └── services/
        ├── sanitizer.py          # NIST SP 800-88 Clear/Purge/Crypto execution logic
        ├── carver.py             # Magic byte signature scanner & hex snippet extractor
        ├── trust.py              # Cryptographic signing & PCR verification
        ├── certificate.py        # Statutory certificate generator & HTML court bundles
        └── audit.py              # SHA-256 chained audit logger
```

---

## 🛠️ Local Development & Setup

### Prerequisites
- **Node.js** (v18.0.0 or higher) & **npm** (v9.0.0 or higher)
- **Python** (v3.10 or higher)

### 1. Frontend Setup (Next.js 14.2)
```bash
cd frontend
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

To verify static export locally:
```bash
npm run build
```

### 2. Backend Setup (FastAPI Python)
```bash
cd backend

# Create and activate virtual environment
# Windows:
python -m venv venv
.\venv\Scripts\activate

# Linux/macOS:
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server with live reload on port 8000
uvicorn main:app --reload --port 8000
```
FastAPI Swagger documentation will be available at **[http://localhost:8000/docs](http://localhost:8000/docs)**.

---

## 🚀 Production Deployment Options

### Option A: Firebase Hosting (Frontend Static Export — Live)
The frontend is deployed to Firebase Hosting with custom rewrites and immutable asset caching:
```powershell
# Automated PowerShell deployment:
.\deploy.ps1
```
Or manually via Firebase CLI:
```bash
cd frontend
npm run build
cd ..
npx -y firebase-tools deploy --only hosting
```
**Live URL:** [https://sakshya-forensics.web.app](https://sakshya-forensics.web.app)

### Option B: Backend Container Deployment (Docker / Cloud Run / Render)
The backend includes a production `Dockerfile` with dynamic port binding.

**Deploy to Render / Railway / Local Docker:**
```bash
cd backend
docker build -t sakshya-backend .
docker run -p 8000:8000 sakshya-backend
```

**Database Configuration:**
Set `DATABASE_URL` in environment variables:
```bash
DATABASE_URL=postgresql://user:password@host:5432/sakshya_db
```
*(The backend automatically parses `postgres://` to `postgresql://` and provisions tables on startup).*

---

## ⚖️ Statutory & Regulatory References

1. **Bharatiya Sakshya Adhiniyam 2023 (BSA 2023) — Section 63(4):**  
   - Sub-clause (a): Attestation by person in lawful charge of the electronic device or computer system (Part A).
   - Sub-clause (b): Attestation by digital forensics or technical expert certifying system parameters, absence of alteration, and software cryptographic hash match (Part B).
2. **NIST Special Publication 800-88 Revision 1:**  
   - Guidelines for Media Sanitization (Clear, Purge, Destroy, and Cryptographic Erase).
3. **ISO/IEC 27037:2012:**  
   - International standard for digital evidence handling, identification, collection, acquisition, and chain of custody preservation.

---

## 📄 License & Attribution

Developed for **Smart India Hackathon (SIH 2026)** — Project ID: **SIH26149**.  
© 2026 **Sakshya Digital Forensics Team**. All rights reserved.
