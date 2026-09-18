import asyncio
import hashlib
import uuid
from datetime import datetime
from sqlalchemy.orm import Session
import models
from services.audit import log_audit_event

SAMPLE_CARVED_TEMPLATES = [
    {
        "filename": "EVIDENCE_DOC_FIR_402.pdf",
        "file_type": "pdf",
        "integrity_score": 0.98,
        "sample_hex": "25 50 44 46 2D 31 2E 37 0D 0A 25 E2 E3 CF D3 0D 0A 31 20 30 20 6F 62 6A 0D 0A 3C 3C 2F 54 79 70 65 2F 43 61 74 61 6C 6F 67",
        "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    },
    {
        "filename": "SEIZED_CRIME_SCENE_01.jpg",
        "file_type": "jpg",
        "integrity_score": 0.95,
        "sample_hex": "FF D8 FF E0 00 10 4A 46 49 46 00 01 01 01 00 60 00 60 00 00 FF DB 00 43 00 08 06 06 07 06 05 08 07 07 07 09 09 08 0A 0C 14",
        "sha256": "1f8252207b9736c075f10255b5d5d99ed50b6911b332d96c80875e538ef5a4e5"
    },
    {
        "filename": "BANK_STATEMENT_STAMPED.png",
        "file_type": "png",
        "integrity_score": 0.92,
        "sample_hex": "89 50 4E 47 0D 0A 1A 0A 00 00 00 0D 49 48 44 52 00 00 04 00 00 00 03 00 08 06 00 00 00 D8 33 B2 BF 00 00 00 01 73 52 47 42",
        "sha256": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
    },
    {
        "filename": "ENCRYPTED_BACKUP_VOL.zip",
        "file_type": "zip",
        "integrity_score": 0.88,
        "sample_hex": "50 4B 03 04 14 00 00 00 08 00 53 79 C4 58 E8 C3 FA 1A 34 1E 00 00 F2 48 00 00 0E 00 1C 00 63 61 73 65 5F 65 76 69 64 65 6E 63 65",
        "sha256": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"
    },
    {
        "filename": "CALL_LOGS_EXCEL_EXPORT.docx",
        "file_type": "docx",
        "integrity_score": 0.96,
        "sample_hex": "50 4B 03 04 14 00 06 00 08 00 00 00 21 00 A1 2B C7 AB A4 01 00 00 High-Integrity-Docx-Header-Extracted",
        "sha256": "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b"
    }
]

async def run_carving_operation(op_id: str, db_factory, websocket_manager):
    """
    Executes deep file carving simulation with signature matching (Magic Bytes).
    """
    db: Session = db_factory()
    try:
        operation = db.query(models.Operation).filter(models.Operation.id == op_id).first()
        if not operation:
            return

        operation.status = "RUNNING"
        operation.started_at = datetime.utcnow()
        db.commit()

        device = db.query(models.Device).filter(models.Device.id == operation.device_id).first()

        log_audit_event(
            db,
            operation.case_id,
            "IO-0142",
            "CARVE_STARTED",
            f"Initiated deep file carving on raw media {device.serial_number if device else 'DEVICE'}"
        )

        steps = [
            {"pct": 10, "status": "RUNNING", "message": "Analyzing Partition Table & Unallocated Sectors...", "speed": "480 MB/s", "found": 0},
            {"pct": 30, "status": "RUNNING", "message": "Scanning magic headers: %PDF, \xFF\xD8\xFF, \x89PNG, PK\x03\x04...", "speed": "520 MB/s", "found": 2},
            {"pct": 60, "status": "RUNNING", "message": "Reconstructing fragmented file clusters & computing integrity scores...", "speed": "590 MB/s", "found": 4},
            {"pct": 85, "status": "VERIFYING", "message": "Computing SHA-256 baseline hashes for carved evidence artifacts...", "speed": "Verification", "found": 5},
        ]

        for step in steps:
            operation.progress_pct = step["pct"]
            db.commit()
            await websocket_manager.broadcast_progress(op_id, step)
            await asyncio.sleep(0.7)

        # Populate carved files into DB
        for item in SAMPLE_CARVED_TEMPLATES:
            rf = models.RecoveredFile(
                id=str(uuid.uuid4()),
                operation_id=operation.id,
                filename=item["filename"],
                file_type=item["file_type"],
                file_path=f"/evidence/carved/{item['filename']}",
                thumbnail_path=f"/evidence/thumbnails/{item['file_type']}.png",
                integrity_score=item["integrity_score"],
                sha256=item["sha256"]
            )
            db.add(rf)

        operation.progress_pct = 100
        operation.status = "COMPLETE"
        operation.completed_at = datetime.utcnow()
        operation.verification_result = f"COMPLETE: Carved 5 evidence artifacts (Avg Integrity: 0.94)"
        db.commit()

        log_audit_event(
            db,
            operation.case_id,
            "IO-0142",
            "RECOVER_COMPLETED",
            f"Completed file carving on device. Extracted 5 intact evidence files with SHA-256 hashes."
        )

        await websocket_manager.broadcast_progress(op_id, {
            "pct": 100,
            "status": "COMPLETE",
            "message": "Carving finished. 5 intact evidence files recovered.",
            "speed": "COMPLETE",
            "found": 5
        })

    finally:
        db.close()
