from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class OfficerLogin(BaseModel):
    badge_id: str
    role: str

class OfficerResponse(BaseModel):
    id: str
    name: str
    role: str
    badge_number: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class CaseCreate(BaseModel):
    fir_number: str
    case_type: str
    officer_id: str
    description: Optional[str] = None

class CaseResponse(BaseModel):
    id: str
    fir_number: str
    case_type: str
    officer_id: str
    description: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DeviceCreate(BaseModel):
    serial_number: str
    make_model: Optional[str] = None
    media_type: Optional[str] = None
    identifier_extra: Optional[str] = None
    is_sed_capable: Optional[bool] = False
    acquisition_hash: Optional[str] = None

class DeviceResponse(BaseModel):
    id: str
    case_id: str
    serial_number: str
    make_model: Optional[str] = None
    media_type: Optional[str] = None
    identifier_extra: Optional[str] = None
    is_sed_capable: bool
    acquisition_hash: Optional[str] = None
    acquisition_hash_algo: str
    acquired_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class OperationCreate(BaseModel):
    device_id: str
    type: str  # SANITIZE, RECOVER
    method: Optional[str] = None  # CLEAR, PURGE, CRYPTO_ERASE

class OperationResponse(BaseModel):
    id: str
    case_id: str
    device_id: str
    type: str
    method: Optional[str] = None
    status: str
    progress_pct: int
    verification_result: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class RecoveredFileResponse(BaseModel):
    id: str
    operation_id: str
    filename: Optional[str] = None
    file_type: Optional[str] = None
    file_path: str
    thumbnail_path: Optional[str] = None
    integrity_score: float
    sha256: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class CertificateResponse(BaseModel):
    id: str
    case_id: str
    operation_id: Optional[str] = None
    type: str
    pdf_path: Optional[str] = None
    signed_hash: Optional[str] = None
    signed_by: Optional[str] = None
    signed_at: Optional[datetime] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class AuditEventResponse(BaseModel):
    id: str
    case_id: str
    actor_id: Optional[str] = None
    event_type: str
    description: str
    prev_hash: Optional[str] = None
    this_hash: str
    timestamp: datetime

    class Config:
        from_attributes = True
