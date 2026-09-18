from fastapi import APIRouter
from services.trust import get_trust_engine_status

router = APIRouter(prefix="/api/trust", tags=["trust"])

@router.get("/status")
def get_status():
    return get_trust_engine_status()
