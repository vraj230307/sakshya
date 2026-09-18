from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/login", response_model=schemas.OfficerResponse)
def login(payload: schemas.OfficerLogin, db: Session = Depends(get_db)):
    officer = db.query(models.Officer).filter(models.Officer.id == payload.badge_id).first()
    if not officer:
        # Create officer on the fly if badge_id given (e.g. IO-0142)
        role = payload.role if payload.role in ["IO", "EXPERT", "ADMIN"] else "IO"
        name = "Inspr. Rajesh Kumar" if role == "IO" else "Dr. Forensic Expert"
        officer = models.Officer(
            id=payload.badge_id,
            name=name,
            role=role,
            badge_number=payload.badge_id
        )
        db.add(officer)
        db.commit()
        db.refresh(officer)
    return officer

@router.get("/me", response_model=schemas.OfficerResponse)
def get_me(officer_id: str = "IO-0142", db: Session = Depends(get_db)):
    officer = db.query(models.Officer).filter(models.Officer.id == officer_id).first()
    if not officer:
        officer = models.Officer(
            id="IO-0142",
            name="Inspr. Rajesh Kumar",
            role="IO",
            badge_number="IO-0142"
        )
        db.add(officer)
        db.commit()
        db.refresh(officer)
    return officer
