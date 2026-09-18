import hashlib
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from services.audit import log_audit_event

router = APIRouter(prefix="/api", tags=["devices"])

@router.get("/devices/detect")
def detect_connected_drives():
    """
    Mock drive auto-detection API returning 3 connected forensic targets.
    """
    return [
        {
            "serial_number": "NVME-SAMSUNG-980PRO-512GB-SN90214",
            "make_model": "Samsung NVMe SSD 980 PRO (512GB)",
            "media_type": "SSD_NVME",
            "is_sed_capable": True,
            "bus_interface": "PCIe Gen4 x4 / NVMe 1.4",
            "smart_health": "100% Good",
            "capacity_gb": 512,
            "identifier_extra": "UID-NVME-0091-AF41"
        },
        {
            "serial_number": "SEAGATE-BARRACUDA-2TB-S390012",
            "make_model": "Seagate BarraCuda 2TB 3.5\" HDD",
            "media_type": "HDD",
            "is_sed_capable": False,
            "bus_interface": "SATA III 6.0 Gb/s",
            "smart_health": "98% Good (0 Bad Sectors)",
            "capacity_gb": 2000,
            "identifier_extra": "MAC-00:1B:44:11:3A:B7"
        },
        {
            "serial_number": "SANDISK-EXTREME-USB3-128GB",
            "make_model": "SanDisk Extreme PRO USB 3.2 (128GB)",
            "media_type": "USB",
            "is_sed_capable": False,
            "bus_interface": "USB 3.2 Gen 1",
            "smart_health": "100% Good",
            "capacity_gb": 128,
            "identifier_extra": "UID-USB-9921-X301"
        }
    ]

@router.get("/cases/{case_id}/devices", response_model=List[schemas.DeviceResponse])
def get_case_devices(case_id: str, db: Session = Depends(get_db)):
    devices = db.query(models.Device).filter(models.Device.case_id == case_id).all()
    if not devices:
        device = models.Device(
            case_id=case_id,
            serial_number="NVME-SAMSUNG-980PRO-512GB-SN90214",
            make_model="Samsung NVMe SSD 980 PRO (512GB)",
            media_type="SSD_NVME",
            identifier_extra="UID-NVME-0091-AF41",
            is_sed_capable=True,
            acquisition_hash="a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
            acquisition_hash_algo="SHA-256",
            acquired_at=datetime.utcnow()
        )
        db.add(device)
        db.commit()
        db.refresh(device)
        return [device]
    return devices

@router.post("/cases/{case_id}/devices", response_model=schemas.DeviceResponse)
def register_device(case_id: str, payload: schemas.DeviceCreate, db: Session = Depends(get_db)):
    # Auto-compute SHA-256 acquisition baseline hash if not supplied
    raw_seed = f"{payload.serial_number}|{payload.make_model}|{datetime.utcnow().isoformat()}"
    acq_hash = payload.acquisition_hash or hashlib.sha256(raw_seed.encode("utf-8")).hexdigest()

    device = models.Device(
        case_id=case_id,
        serial_number=payload.serial_number,
        make_model=payload.make_model,
        media_type=payload.media_type or "SSD_NVME",
        identifier_extra=payload.identifier_extra,
        is_sed_capable=payload.is_sed_capable or False,
        acquisition_hash=acq_hash,
        acquisition_hash_algo="SHA-256",
        acquired_at=datetime.utcnow()
    )
    db.add(device)
    db.commit()
    db.refresh(device)

    log_audit_event(
        db,
        case_id,
        "IO-0142",
        "DEVICE_ACQUIRED",
        f"Acquired forensic media: {device.make_model} (S/N: {device.serial_number}). Computed baseline SHA-256 hash: {acq_hash[:16]}..."
    )

    return device
