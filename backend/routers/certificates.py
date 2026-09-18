from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from services.certificate import create_or_get_certificate, sign_and_lock_certificate, render_certificate_html

router = APIRouter(prefix="/api", tags=["certificates"])

@router.get("/cases/{case_id}/certificates", response_model=List[schemas.CertificateResponse])
def get_case_certificates(case_id: str, db: Session = Depends(get_db)):
    # Ensure default draft certificates exist for case
    c1 = create_or_get_certificate(db, case_id, "SANITIZATION")
    c2 = create_or_get_certificate(db, case_id, "EVIDENCE_PARTY")
    c3 = create_or_get_certificate(db, case_id, "EVIDENCE_EXPERT")
    return [c1, c2, c3]

@router.post("/cases/{case_id}/certificates", response_model=schemas.CertificateResponse)
def create_certificate(case_id: str, cert_type: str, operation_id: str = None, db: Session = Depends(get_db)):
    return create_or_get_certificate(db, case_id, cert_type, operation_id)

@router.get("/certificates/{cert_id}", response_model=schemas.CertificateResponse)
def get_certificate(cert_id: str, db: Session = Depends(get_db)):
    cert = db.query(models.Certificate).filter(models.Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return cert

@router.get("/certificates/{cert_id}/html")
def get_certificate_html(cert_id: str, db: Session = Depends(get_db)):
    html_content = render_certificate_html(db, cert_id)
    return Response(content=html_content, media_type="text/html")

@router.post("/certificates/{cert_id}/sign", response_model=schemas.CertificateResponse)
def sign_certificate(cert_id: str, officer_id: str = "IO-0142", db: Session = Depends(get_db)):
    try:
        return sign_and_lock_certificate(db, cert_id, officer_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
