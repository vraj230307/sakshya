import asyncio
from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from database import get_db, SessionLocal
import models, schemas
from services.sanitizer import run_sanitization_operation
from services.carver import run_carving_operation

router = APIRouter(prefix="/api", tags=["operations"])

class WebSocketManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, op_id: str, websocket: WebSocket):
        await websocket.accept()
        if op_id not in self.active_connections:
            self.active_connections[op_id] = []
        self.active_connections[op_id].append(websocket)

    def disconnect(self, op_id: str, websocket: WebSocket):
        if op_id in self.active_connections:
            if websocket in self.active_connections[op_id]:
                self.active_connections[op_id].remove(websocket)

    async def broadcast_progress(self, op_id: str, data: dict):
        if op_id in self.active_connections:
            for ws in self.active_connections[op_id]:
                try:
                    await ws.send_json(data)
                except Exception:
                    pass

ws_manager = WebSocketManager()

@router.post("/cases/{case_id}/operations", response_model=schemas.OperationResponse)
def create_operation(case_id: str, payload: schemas.OperationCreate, db: Session = Depends(get_db)):
    device = db.query(models.Device).filter(models.Device.id == payload.device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Target device not found")

    op_type = payload.type.upper()
    method = payload.method.upper() if payload.method else ("CLEAR" if op_type == "SANITIZE" else None)

    # Validate Crypto-Erase on SED check
    if method == "CRYPTO_ERASE" and not device.is_sed_capable:
        raise HTTPException(
            status_code=400,
            detail="Crypto-Erase requires a Self-Encrypting Drive (SED). Selected device is not SED capable."
        )

    operation = models.Operation(
        case_id=case_id,
        device_id=payload.device_id,
        type=op_type,
        method=method,
        status="PENDING",
        progress_pct=0
    )
    db.add(operation)
    db.commit()
    db.refresh(operation)

    # Spawn background async task for real progress stream
    if op_type == "SANITIZE":
        asyncio.create_task(run_sanitization_operation(operation.id, SessionLocal, ws_manager))
    elif op_type == "RECOVER":
        asyncio.create_task(run_carving_operation(operation.id, SessionLocal, ws_manager))

    return operation

@router.get("/operations/{op_id}", response_model=schemas.OperationResponse)
def get_operation(op_id: str, db: Session = Depends(get_db)):
    op = db.query(models.Operation).filter(models.Operation.id == op_id).first()
    if not op:
        raise HTTPException(status_code=404, detail="Operation not found")
    return op

@router.get("/operations/{op_id}/files", response_model=List[schemas.RecoveredFileResponse])
def get_operation_files(op_id: str, db: Session = Depends(get_db)):
    return db.query(models.RecoveredFile).filter(models.RecoveredFile.operation_id == op_id).all()

@router.websocket("/operations/{op_id}/stream")
async def websocket_endpoint(websocket: WebSocket, op_id: str):
    await ws_manager.connect(op_id, websocket)
    try:
        while True:
            # Keep socket alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(op_id, websocket)
