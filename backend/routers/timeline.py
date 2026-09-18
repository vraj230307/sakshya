from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from services.audit import verify_audit_chain

router = APIRouter(prefix="/api/cases", tags=["timeline"])

@router.get("/{case_id}/timeline", response_model=List[schemas.AuditEventResponse])
def get_case_timeline(case_id: str, db: Session = Depends(get_db)):
    return (
        db.query(models.AuditEvent)
        .filter(models.AuditEvent.case_id == case_id)
        .order_by(models.AuditEvent.timestamp.asc())
        .all()
    )

@router.get("/{case_id}/timeline/verify")
def verify_case_timeline(case_id: str, db: Session = Depends(get_db)):
    return verify_audit_chain(db, case_id)
