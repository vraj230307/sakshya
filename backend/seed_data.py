import hashlib
import uuid
from datetime import datetime, timedelta
from database import SessionLocal, Base, engine
import models
from services.audit import log_audit_event

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(models.Officer).first():
            print("Database already seeded.")
            return

        print("Seeding Sakshya digital forensics database...")

        # 1. Officers
        officer1 = models.Officer(
            id="IO-0142",
            name="Inspr. Rajesh Kumar",
            role="IO",
            badge_number="POL-DELHI-8891"
        )
        officer2 = models.Officer(
            id="EXPERT-901",
            name="Dr. Ananya Sharma",
            role="EXPERT",
            badge_number="CFSL-DELHI-4401"
        )
        db.add_all([officer1, officer2])
        db.commit()

        # 2. Case 1: Active FIR
        case1_id = "c1001-forensic-case-delhi"
        case1 = models.Case(
            id=case1_id,
            fir_number="FIR-2026/0491-CYBER",
            case_type="Financial Cyber Fraud & Data Theft",
            officer_id="IO-0142",
            description="Seized digital storage media during raid on unauthorized call center operating in Rohini Sector 11.",
            status="IN_PROGRESS",
            created_at=datetime.utcnow() - timedelta(days=2)
        )
        db.add(case1)
        db.commit()

        # Audit event 1
        log_audit_event(
            db,
            case1_id,
            "IO-0142",
            "CASE_CREATED",
            "FIR registered and digital evidence intake opened under FIR No. FIR-2026/0491-CYBER."
        )

        # Device 1
        dev1 = models.Device(
            id=str(uuid.uuid4()),
            case_id=case1_id,
            serial_number="NVME-SAMSUNG-980PRO-512GB-SN90214",
            make_model="Samsung NVMe SSD 980 PRO (512GB)",
            media_type="SSD_NVME",
            identifier_extra="UID-NVME-0091-AF41",
            is_sed_capable=True,
            acquisition_hash="a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
            acquisition_hash_algo="SHA-256",
            acquired_at=datetime.utcnow() - timedelta(days=2)
        )
        db.add(dev1)
        db.commit()

        log_audit_event(
            db,
            case1_id,
            "IO-0142",
            "DEVICE_ACQUIRED",
            "Acquired Samsung NVMe SSD 980 PRO (S/N: NVME-SAMSUNG-980PRO-512GB-SN90214). SHA-256 Hash verified."
        )

        # Operation 1: Completed Sanitization
        op1 = models.Operation(
            id=str(uuid.uuid4()),
            case_id=case1_id,
            device_id=dev1.id,
            type="SANITIZE",
            method="PURGE",
            status="COMPLETE",
            progress_pct=100,
            verification_result="VERIFIED: NIST SP 800-88 Rev.1 Purge (0.00% Remanence)",
            started_at=datetime.utcnow() - timedelta(hours=5),
            completed_at=datetime.utcnow() - timedelta(hours=4, minutes=58)
        )
        db.add(op1)
        db.commit()

        log_audit_event(
            db,
            case1_id,
            "IO-0142",
            "SANITIZE_COMPLETED",
            "NIST SP 800-88 Purge firmware command executed successfully on Samsung NVMe SSD. Remanence: 0.00%."
        )

        # Certificates
        cert1 = models.Certificate(
            id=str(uuid.uuid4()),
            case_id=case1_id,
            operation_id=op1.id,
            type="SANITIZATION",
            status="PREVIEW"
        )
        cert2 = models.Certificate(
            id=str(uuid.uuid4()),
            case_id=case1_id,
            operation_id=op1.id,
            type="EVIDENCE_PARTY",
            status="DRAFT"
        )
        cert3 = models.Certificate(
            id=str(uuid.uuid4()),
            case_id=case1_id,
            operation_id=op1.id,
            type="EVIDENCE_EXPERT",
            status="DRAFT"
        )
        db.add_all([cert1, cert2, cert3])
        db.commit()

        # Case 2: Historical Case
        case2_id = "c2002-forensic-case-mumbai"
        case2 = models.Case(
            id=case2_id,
            fir_number="FIR-2026/0118-BSA",
            case_type="Unauthorized Data Carving & Ransomware",
            officer_id="IO-0142",
            description="Investigating compromised enterprise storage drive.",
            status="OPEN",
            created_at=datetime.utcnow() - timedelta(days=1)
        )
        db.add(case2)
        db.commit()

        log_audit_event(
            db,
            case2_id,
            "IO-0142",
            "CASE_CREATED",
            "FIR registered under FIR-2026/0118-BSA. Awaiting carving operation."
        )

        dev2 = models.Device(
            id=str(uuid.uuid4()),
            case_id=case2_id,
            serial_number="SEAGATE-BARRACUDA-2TB-S390012",
            make_model="Seagate BarraCuda 2TB 3.5\" HDD",
            media_type="HDD",
            identifier_extra="MAC-00:1B:44:11:3A:B7",
            is_sed_capable=False,
            acquisition_hash="8f4e3c2b1a9087654321fedcba0987654321890abcdef1234567890abcdef123",
            acquisition_hash_algo="SHA-256",
            acquired_at=datetime.utcnow() - timedelta(days=1)
        )
        db.add(dev2)
        db.commit()

        log_audit_event(
            db,
            case2_id,
            "IO-0142",
            "DEVICE_ACQUIRED",
            "Acquired Seagate BarraCuda 2TB HDD. Baseline acquisition hash recorded."
        )

        print("Database successfully seeded with demo cases, devices, and tamper-evident audit history!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
