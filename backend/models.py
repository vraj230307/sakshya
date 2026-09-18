import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Officer(Base):
    __tablename__ = "officers"

    id = Column(String, primary_key=True, default=generate_uuid)  # e.g., "IO-0142"
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # IO, EXPERT, ADMIN
    badge_number = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    cases = relationship("Case", back_populates="officer")

class Case(Base):
    __tablename__ = "cases"

    id = Column(String, primary_key=True, default=generate_uuid)
    fir_number = Column(String, nullable=False)
    case_type = Column(String, nullable=False)
    officer_id = Column(String, ForeignKey("officers.id"), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="OPEN")  # OPEN, IN_PROGRESS, CLOSED
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    officer = relationship("Officer", back_populates="cases")
    devices = relationship("Device", back_populates="case", cascade="all, delete-orphan")
    operations = relationship("Operation", back_populates="case", cascade="all, delete-orphan")
    certificates = relationship("Certificate", back_populates="case", cascade="all, delete-orphan")
    audit_events = relationship("AuditEvent", back_populates="case", cascade="all, delete-orphan")

class Device(Base):
    __tablename__ = "devices"

    id = Column(String, primary_key=True, default=generate_uuid)
    case_id = Column(String, ForeignKey("cases.id"), nullable=False)
    serial_number = Column(String, nullable=False)
    make_model = Column(String, nullable=True)
    media_type = Column(String, nullable=True)  # HDD, SSD_SATA, SSD_NVME, USB, SD_CARD, OTHER
    identifier_extra = Column(String, nullable=True)  # IMEI/UID/MAC
    is_sed_capable = Column(Boolean, default=False)
    acquisition_hash = Column(String, nullable=True)  # SHA-256 baseline
    acquisition_hash_algo = Column(String, default="SHA-256")
    acquired_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    case = relationship("Case", back_populates="devices")
    operations = relationship("Operation", back_populates="device", cascade="all, delete-orphan")

class Operation(Base):
    __tablename__ = "operations"

    id = Column(String, primary_key=True, default=generate_uuid)
    case_id = Column(String, ForeignKey("cases.id"), nullable=False)
    device_id = Column(String, ForeignKey("devices.id"), nullable=False)
    type = Column(String, nullable=False)  # SANITIZE, RECOVER
    method = Column(String, nullable=True)  # CLEAR, PURGE, CRYPTO_ERASE, FILE_SHRED
    status = Column(String, default="PENDING")  # PENDING, RUNNING, VERIFYING, COMPLETE, FAILED
    progress_pct = Column(Integer, default=0)
    verification_result = Column(Text, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    case = relationship("Case", back_populates="operations")
    device = relationship("Device", back_populates="operations")
    recovered_files = relationship("RecoveredFile", back_populates="operation", cascade="all, delete-orphan")
    certificates = relationship("Certificate", back_populates="operation")

class RecoveredFile(Base):
    __tablename__ = "recovered_files"

    id = Column(String, primary_key=True, default=generate_uuid)
    operation_id = Column(String, ForeignKey("operations.id"), nullable=False)
    filename = Column(String, nullable=True)
    file_type = Column(String, nullable=True)  # jpg, png, pdf, zip, docx
    file_path = Column(String, nullable=False)
    thumbnail_path = Column(String, nullable=True)
    integrity_score = Column(Float, default=1.0)  # 0.0 - 1.0
    sha256 = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    operation = relationship("Operation", back_populates="recovered_files")

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(String, primary_key=True, default=generate_uuid)
    case_id = Column(String, ForeignKey("cases.id"), nullable=False)
    operation_id = Column(String, ForeignKey("operations.id"), nullable=True)
    type = Column(String, nullable=False)  # SANITIZATION, EVIDENCE_PARTY, EVIDENCE_EXPERT
    pdf_path = Column(String, nullable=True)
    signed_hash = Column(String, nullable=True)
    signed_by = Column(String, ForeignKey("officers.id"), nullable=True)
    signed_at = Column(DateTime, nullable=True)
    status = Column(String, default="DRAFT")  # DRAFT, PREVIEW, SIGNED
    created_at = Column(DateTime, default=datetime.utcnow)

    case = relationship("Case", back_populates="certificates")
    operation = relationship("Operation", back_populates="certificates")
    signer = relationship("Officer")

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String, primary_key=True, default=generate_uuid)
    case_id = Column(String, ForeignKey("cases.id"), nullable=False)
    actor_id = Column(String, ForeignKey("officers.id"), nullable=True)
    event_type = Column(String, nullable=False)  # CASE_CREATED, DEVICE_ACQUIRED, SANITIZE_STARTED, SANITIZE_COMPLETED, RECOVER_COMPLETED, CERT_SIGNED
    description = Column(Text, nullable=False)  # human-readable narrative
    prev_hash = Column(String, nullable=True)
    this_hash = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    case = relationship("Case", back_populates="audit_events")
    actor = relationship("Officer")
