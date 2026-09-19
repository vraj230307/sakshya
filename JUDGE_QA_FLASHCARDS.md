# 🎯 Sakshya (સાક્ષ્ય) — Evaluator & Judge Q&A Flashcards
**Smart India Hackathon 2026**  
*Defense & Judicial Compliance Quick-Reference for Project Presentation & Judging*

---

> 💡 **Quick Printing Guide:**  
> For the visual printable document with cut lines, folding guidelines, and 2-sided flashcard preview, open [`judge_qa_flashcards.html`](./judge_qa_flashcards.html) in your web browser and click **"Print / Save PDF"** (`Ctrl+P` / `Cmd+P`).

---

## 🃏 Flashcard Deck (Question on Front / Answer on Back)

```
+-----------------------------------------------------------------------------------+
|  FRONT (Question Side)                              BACK (Answer Side)            |
|  - Card Number & Category Tag                       - Official Technical Response |
|  - Judge's Inquiring Question                       - Statutory / Standard Basis  |
|  - Key Insight Clue                                 - High-Impact Soundbite       |
+-----------------------------------------------------------------------------------+
```

---

### 📇 FLASHCARD #01

#### 🔵 FRONT (Question Side)
* **Card:** #01
* **Category:** `Cryptographic Integrity & Audit Trail`
* **Judge Question:**
  > **"Show me the Merkle Tree or explain your audit trail structure."**
* **Core Concept:** Append-only linear SHA-256 hash chaining vs. Merkle trees in digital custody.

---

#### 🟢 BACK (Answer Side)
* **Official Answer:**
  > *"Our audit trail is built as a **sequential cryptographic SHA-256 hash chain** (`this_hash = SHA-256(prev_hash || actor || event_type || description || timestamp)`), rooted at a genesis hash.*
  >
  > *In sequential digital evidence custody, an **append-only hash chain** is the legally robust pattern because evidence logs are chronological linear sequences of custody handoffs.*
  >
  > *A **Merkle tree** is designed for parallel subset proofs across large distributed blocks, whereas an append-only hash chain provides deterministic, unforgeable verification that zero intermediate events were modified, deleted, or injected."*
* **⚡ High-Impact Soundbite:**
  > *"Merkle trees prove subset inclusion in batches; linear hash chains prove unforgeable chronological custody order without tampering or omissions."*

---

### 📇 FLASHCARD #02

#### 🔵 FRONT (Question Side)
* **Card:** #02
* **Category:** `Hardware Sanitization & Evaluation Safety`
* **Judge Question:**
  > **"Is the web demo wiping real physical drives?"**
* **Core Concept:** Evaluator browser sandbox protection vs. production laboratory kernel wrappers.

---

#### 🟢 BACK (Answer Side)
* **Official Answer:**
  > *"In the live web evaluation sandbox, sanitization and carving telemetry are **simulated to ensure safety**.*
  >
  > *It would be dangerous and poor practice to execute raw low-level ATA Secure Erase or `nvme format` commands against an evaluator's personal computer storage over a browser session.*
  >
  > *However, in our backend engine (`backend/services/sanitizer.py`), we have implemented the underlying platform command wrappers designed to run within an isolated forensic laboratory workstation."*
* **⚡ High-Impact Soundbite:**
  > *"The web demo safely simulates telemetry to safeguard evaluator devices; `backend/services/sanitizer.py` houses the genuine ATA/NVMe kernel commands for forensic lab workstations."*

---

### 📇 FLASHCARD #03

#### 🔵 FRONT (Question Side)
* **Card:** #03
* **Category:** `Statutory Law & Competitive Differentiation`
* **Judge Question:**
  > **"How does your platform differ from other teams addressing digital forensics?"**
* **Core Concept:** Dual partitioning under BSA 2023 Sec 63(4), NIST SP 800-88 taxonomy, and air-gapped readiness.

---

#### 🟢 BACK (Answer Side)
* **Official Answer:**
  > *"Three key differentiators:*
  > 1. ***True BSA 2023 Section 63(4) Dual Partitioning:*** *Most platforms produce a single generic 'forensic report' or still cite the repealed Section 65B of the Indian Evidence Act. Sakshya strictly separates the legal custody attestation (Part A - Officer in lawful charge) from the technical diagnostics attestation (Part B - Forensic Expert), matching the exact statutory text of the new criminal laws.*
  > 2. ***Strict NIST SP 800-88 Rev. 1 Taxonomy:*** *We explicitly implement Clear, Purge, and Crypto-Erase with statistical remanence verification protocols, rather than arbitrary zero-filling.*
  > 3. ***Offline Zero-Dependency Reliability:*** *Forensic labs in remote police districts frequently operate in air-gapped or intermittent connectivity environments. Our architecture operates both in connected multi-tenant environments and standalone local stations."*
* **⚡ High-Impact Soundbite:**
  > *"1) Dual statutory certification under new criminal laws (Part A & B). 2) NIST SP 800-88 Clear/Purge/Crypto-Erase remanence tests. 3) 100% air-gap ready."*

---

### 📇 FLASHCARD #04

#### 🔵 FRONT (Question Side)
* **Card:** #04
* **Category:** `System Architecture & Deployment Topology`
* **Judge Question:**
  > **"Is your backend deployed to a server right now?"**
* **Core Concept:** 100% SLA client simulation on Google Firebase Hosting vs. production on-premise FastAPI backend.

---

#### 🟢 BACK (Answer Side)
* **Official Answer:**
  > *"For the public web deployment, the frontend is hosted on **Google Firebase Hosting with a high-fidelity client simulation engine**, ensuring 100% uptime and instant loading without relying on cold-starting free-tier cloud containers.*
  >
  > *The complete **Python FastAPI backend** is provided in the repository with a Dockerfile and full SQLAlchemy ORM support for on-premise LEA laboratory server deployment."*
* **⚡ High-Impact Soundbite:**
  > *"100% SLA web sandbox eliminates cloud cold-starts during evaluation; full containerized FastAPI backend is packaged for on-premise LEA forensic deployments."*

---

## 📜 Statutory & Technical Quick-Reference Anchor

| Statutory / Technical Dimension | Standard Reference | Operational Implementation in Sakshya |
|:---|:---|:---|
| **Legal Evidence Certificate (Part A)** | Bharatiya Sakshya Adhiniyam 2023, Sec 63(4) | Signed by Investigating Officer certifying lawful charge and seizure circumstances |
| **Technical Expert Certificate (Part B)** | Bharatiya Sakshya Adhiniyam 2023, Sec 63(4) | Signed by Forensic Technical Expert certifying software hash integrity and device diagnostics |
| **Media Sanitization Taxonomy** | NIST SP 800-88 Revision 1 | Clear (Logical Overwrite), Purge (Firmware ATA/NVMe sanitize), Crypto-Erase (SED MEK purge) |
| **Remanence Verification** | NIST SP 800-88 Section 4.7 | Statistical block sampling reporting 0.00% residual data target |
| **Audit Log Integrity** | Sequential Cryptographic Hash Chain | `this_hash = SHA256(prev_hash \|\| actor \|\| event_type \|\| description \|\| timestamp)` |
| **File Carving Magic Bytes** | File Format Specifications | PDF (`%PDF-1.`), JPEG (`FF D8 FF`), PNG (`89 50 4E 47`), ZIP/DOCX (`PK\x03\x04`) |
