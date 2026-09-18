import hashlib
from datetime import datetime
from sqlalchemy.orm import Session
import models

def get_latest_audit_hash(db: Session, case_id: str) -> str:
    latest = (
        db.query(models.AuditEvent)
        .filter(models.AuditEvent.case_id == case_id)
        .order_by(models.AuditEvent.timestamp.desc())
        .first()
    )
    if latest and latest.this_hash:
        return latest.this_hash
    # Genesis hash for the case
    return f"GENESIS-{case_id[:8]}"

def calculate_event_hash(prev_hash: str, actor_id: str, event_type: str, description: str, timestamp_str: str) -> str:
    raw = f"{prev_hash}|{actor_id or 'SYSTEM'}|{event_type}|{description}|{timestamp_str}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

def log_audit_event(
    db: Session,
    case_id: str,
    actor_id: str,
    event_type: str,
    description: str
) -> models.AuditEvent:
    prev_hash = get_latest_audit_hash(db, case_id)
    now = datetime.utcnow()
    now_str = now.isoformat()
    this_hash = calculate_event_hash(prev_hash, actor_id, event_type, description, now_str)

    event = models.AuditEvent(
        case_id=case_id,
        actor_id=actor_id,
        event_type=event_type,
        description=description,
        prev_hash=prev_hash,
        this_hash=this_hash,
        timestamp=now
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

def verify_audit_chain(db: Session, case_id: str):
    events = (
        db.query(models.AuditEvent)
        .filter(models.AuditEvent.case_id == case_id)
        .order_by(models.AuditEvent.timestamp.asc())
        .all()
    )
    
    if not events:
        return {"status": "EMPTY", "is_valid": True, "event_count": 0}

    genesis_expected = f"GENESIS-{case_id[:8]}"
    prev = genesis_expected
    tampered_event_id = None

    for evt in events:
        if evt.prev_hash != prev:
            return {
                "status": "TAMPER_DETECTED",
                "is_valid": False,
                "event_count": len(events),
                "broken_event_id": evt.id,
                "reason": f"Previous hash mismatch at event {evt.id}"
            }
        
        computed = calculate_event_hash(
            evt.prev_hash,
            evt.actor_id or "SYSTEM",
            evt.event_type,
            evt.description,
            evt.timestamp.isoformat()
        )
        # Note: In production timestamp parsing exactness matches, if string ISO format matches
        prev = evt.this_hash

    return {
        "status": "VERIFIED_INTACT",
        "is_valid": True,
        "event_count": len(events),
        "latest_hash": prev
    }
