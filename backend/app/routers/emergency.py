import uuid
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import EmergencyLogModel
from app.schemas import EmergencyDispatchLog
from app.config import settings

router = APIRouter(prefix="/emergency", tags=["Emergency Communication"])

class EmergencyTriggerRequest(BaseModel):
    incident_type: str
    vehicle_id: str = "BUS-021"
    latitude: float = 13.0478
    longitude: float = 80.2090
    severity: str = "CRITICAL"
    details: Optional[str] = "Manual emergency alert initiated from Command Center."

class ContactUpdate(BaseModel):
    hospital_phone: Optional[str] = None
    hospital_name: Optional[str] = None
    electricity_phone: Optional[str] = None
    electricity_name: Optional[str] = None
    police_phone: Optional[str] = None

@router.get("/logs", response_model=List[EmergencyDispatchLog])
def get_emergency_logs(limit: int = 50, db: Session = Depends(get_db)):
    """
    Retrieve emergency dispatch logs and call audit trail (PRD FR-15, Section 20).
    """
    logs = db.query(EmergencyLogModel).order_by(EmergencyLogModel.timestamp.desc()).limit(limit).all()
    return logs

@router.get("/contacts")
def get_emergency_contacts():
    """
    Get configured emergency contacts for hospitals, electricity board, and police (PRD Section 6).
    """
    return {
        "hospital": {
            "name": settings.EMERGENCY_HOSPITAL_NAME,
            "phone": settings.EMERGENCY_HOSPITAL_PHONE,
            "type": "MEDICAL_TRAUMA",
            "active": True
        },
        "electricity": {
            "name": settings.EMERGENCY_ELECTRICITY_NAME,
            "phone": settings.EMERGENCY_ELECTRICITY_PHONE,
            "type": "POWER_GRID_HAZARD",
            "active": True
        },
        "police": {
            "name": settings.EMERGENCY_POLICE_NAME,
            "phone": settings.EMERGENCY_POLICE_PHONE,
            "type": "TRAFFIC_LAW_ENFORCEMENT",
            "active": True
        }
    }

@router.post("/trigger", response_model=EmergencyDispatchLog)
def trigger_emergency(req: EmergencyTriggerRequest, db: Session = Depends(get_db)):
    """
    Initiates emergency communication workflow, logs call/SMS, and simulates emergency dispatch (PRD FR-15).
    """
    from app.services.emergency_service import trigger_emergency_dispatch
    result = trigger_emergency_dispatch(
        db=db,
        event_id=f"manual-{uuid.uuid4().hex[:6]}",
        vehicle_id=req.vehicle_id,
        issue_type=req.incident_type,
        latitude=req.latitude,
        longitude=req.longitude,
        severity=req.severity,
        details=req.details
    )
    log = db.query(EmergencyLogModel).filter(EmergencyLogModel.id == result["dispatch_id"]).first()
    return log
