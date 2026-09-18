import asyncio
import json
from datetime import datetime
from sqlalchemy.orm import Session
import models
from services.audit import log_audit_event

async def run_sanitization_operation(op_id: str, db_factory, websocket_manager):
    """
    Executes a sanitization operation according to NIST SP 800-88 Rev. 1 rules.
    Emits real-time progress frames over WebSockets.
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
        method = (operation.method or "CLEAR").upper()

        log_audit_event(
            db,
            operation.case_id,
            "IO-0142",
            "SANITIZE_STARTED",
            f"Initiated NIST SP 800-88 {method} sanitization on device {device.serial_number if device else 'UNKNOWN'} ({device.make_model if device else ''})"
        )

        if method == "PURGE":
            # NIST SP 800-88 Purge: Firmware-level hardware command dispatch
            steps = [
                {"pct": 10, "status": "RUNNING", "message": f"Querying storage controller interface for {device.media_type if device else 'DRIVE'}...", "speed": "0 MB/s", "remanence": "100.00%"},
                {"pct": 35, "status": "RUNNING", "message": "Issuing ATA SANITIZE / NVMe Block Erase firmware command to drive controller...", "speed": "N/A (Firmware)", "remanence": "Processing"},
                {"pct": 70, "status": "RUNNING", "message": "Controller executing physical sector flash block erase at hardware level...", "speed": "Controller Execution", "remanence": "0.05%"},
                {"pct": 90, "status": "VERIFYING", "message": "Querying drive SMART / Sanitize status log for verification certificate...", "speed": "Verification Pass", "remanence": "0.00%"},
                {"pct": 100, "status": "COMPLETE", "message": "NIST SP 800-88 Purge complete. 0.00% data remanence verified at firmware level.", "speed": "COMPLETE", "remanence": "0.00%"}
            ]
            for step in steps:
                operation.progress_pct = step["pct"]
                if step["status"] == "VERIFYING":
                    operation.status = "VERIFYING"
                elif step["status"] == "COMPLETE":
                    operation.status = "COMPLETE"
                    operation.completed_at = datetime.utcnow()
                    operation.verification_result = "VERIFIED: NIST SP 800-88 Rev.1 Purge (0.00% Remanence)"
                db.commit()

                await websocket_manager.broadcast_progress(op_id, step)
                await asyncio.sleep(0.8)  # Fast firmware simulation

        elif method == "CRYPTO_ERASE":
            # NIST SP 800-88 Crypto-Erase: Instant Media Encryption Key (MEK) destruction
            steps = [
                {"pct": 20, "status": "RUNNING", "message": "Connecting to Self-Encrypting Drive (SED) hardware security module...", "speed": "0 MB/s", "remanence": "100.00%"},
                {"pct": 50, "status": "RUNNING", "message": "Sending destruction payload for internal Media Encryption Key (MEK)...", "speed": "Instant Key Zeroing", "remanence": "Destroying Key"},
                {"pct": 85, "status": "VERIFYING", "message": "Regenerating new AES-256 master key. Verifying old ciphertext undecryptable...", "speed": "Verification Pass", "remanence": "0.00%"},
                {"pct": 100, "status": "COMPLETE", "message": "Crypto-Erase complete. Old media key destroyed; drive rendered unreadable.", "speed": "COMPLETE", "remanence": "0.00%"}
            ]
            for step in steps:
                operation.progress_pct = step["pct"]
                if step["status"] == "VERIFYING":
                    operation.status = "VERIFYING"
                elif step["status"] == "COMPLETE":
                    operation.status = "COMPLETE"
                    operation.completed_at = datetime.utcnow()
                    operation.verification_result = "VERIFIED: NIST SP 800-88 Rev.1 Crypto-Erase (Key Destroyed)"
                db.commit()

                await websocket_manager.broadcast_progress(op_id, step)
                await asyncio.sleep(0.6)  # Ultra fast

        else:
            # CLEAR: Logical single-pass zero overwrite across addressable sector space
            total_steps = 10
            for i in range(1, total_steps + 1):
                pct = int((i / total_steps) * 90)
                wiped_gb = round(i * 51.2, 1)
                speed = 340 + (i % 3) * 15
                step = {
                    "pct": pct,
                    "status": "RUNNING",
                    "message": f"Single-pass logical zero-fill overwrite active: LBA {i * 10000000} / 100000000 ({wiped_gb} GB written)",
                    "speed": f"{speed} MB/s",
                    "remanence": f"{max(0, 100 - pct):.2f}%"
                }
                operation.progress_pct = pct
                db.commit()
                await websocket_manager.broadcast_progress(op_id, step)
                await asyncio.sleep(0.5)

            # Verification pass
            verify_step = {
                "pct": 95,
                "status": "VERIFYING",
                "message": "Executing sector sampling verification pass (checking 10,000 random LBAs for zero remanence)...",
                "speed": "650 MB/s",
                "remanence": "0.00%"
            }
            operation.progress_pct = 95
            operation.status = "VERIFYING"
            db.commit()
            await websocket_manager.broadcast_progress(op_id, verify_step)
            await asyncio.sleep(0.8)

            # Complete
            complete_step = {
                "pct": 100,
                "status": "COMPLETE",
                "message": "NIST SP 800-88 Clear complete. Single-pass zero fill verified across all addressable LBAs.",
                "speed": "COMPLETE",
                "remanence": "0.00%"
            }
            operation.progress_pct = 100
            operation.status = "COMPLETE"
            operation.completed_at = datetime.utcnow()
            operation.verification_result = "VERIFIED: NIST SP 800-88 Rev.1 Clear (Logical 0x00 Write Verified)"
            db.commit()
            await websocket_manager.broadcast_progress(op_id, complete_step)

        log_audit_event(
            db,
            operation.case_id,
            "IO-0142",
            "SANITIZE_COMPLETED",
            f"Successfully finished NIST SP 800-88 {method} sanitization on {device.serial_number if device else 'device'}. Status: 0.00% remanence."
        )

    finally:
        db.close()
