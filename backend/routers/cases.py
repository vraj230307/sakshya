from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from services.audit import log_audit_event

router = APIRouter(prefix="/api/cases", tags=["cases"])

@router.get("", response_model=List[schemas.CaseResponse])
def list_cases(db: Session = Depends(get_db)):
    return db.query(models.Case).order_by(models.Case.created_at.desc()).all()

@router.post("", response_model=schemas.CaseResponse)
def create_case(payload: schemas.CaseCreate, db: Session = Depends(get_db)):
    case = models.Case(
        fir_number=payload.fir_number,
        case_type=payload.case_type,
        officer_id=payload.officer_id,
        description=payload.description,
        status="OPEN"
    )
    db.add(case)
    db.commit()
    db.refresh(case)

    log_audit_event(
        db,
        case.id,
        payload.officer_id,
        "CASE_CREATED",
        f"Case registered under FIR No. {case.fir_number} ({case.case_type}). Initial status: OPEN."
    )

    return case

@router.get("/{case_id}", response_model=schemas.CaseResponse)
def get_case(case_id: str, db: Session = Depends(get_db)):
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case
