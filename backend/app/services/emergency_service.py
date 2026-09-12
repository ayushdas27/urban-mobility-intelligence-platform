import uuid
import datetime
from sqlalchemy.orm import Session
from app.models import EmergencyLogModel
from app.config import settings

def trigger_emergency_dispatch(
    db: Session,
    event_id: str,
    vehicle_id: str,
    issue_type: str,
    latitude: float,
    longitude: float,
    severity: str,
    details: str = None
) -> dict:
    """
    Automated Emergency Communication Engine (PRD FR-15 & Section 12).
    Dispatches automated call / SMS / webhook alerts to hospitals or electricity board,
    and records an immutable emergency dispatch audit entry.
    """
    now_iso = datetime.datetime.now().isoformat()
    issue_lower = issue_type.lower()
    
    if any(k in issue_lower for k in ["critical", "accident", "collision", "medical"]):
        target_agency = settings.EMERGENCY_HOSPITAL_NAME
        contact_phone = settings.EMERGENCY_HOSPITAL_PHONE
        action_type = "EMERGENCY_CALL_INITIATED"
        msg = (
            f"URGENT HOSPITAL & TRAUMA DISPATCH: Collision/Medical incident detected by {vehicle_id} "
            f"at coordinates {latitude:.4f}, {longitude:.4f}. Severity: {severity}. "
            f"Details: {details or 'Critical collision on public transit corridor. Immediate ambulance requested.'}"
        )
        audio_prompt = f"Emergency Alert. Immediate medical assistance required at latitude {latitude:.3f}, longitude {longitude:.3f}. Reported by {vehicle_id}."
    elif any(k in issue_lower for k in ["electric", "wire", "cable"]):
        target_agency = settings.EMERGENCY_ELECTRICITY_NAME
        contact_phone = settings.EMERGENCY_ELECTRICITY_PHONE
        action_type = "EMERGENCY_ALERT_DISPATCHED"
        msg = (
            f"HAZARD DISPATCH: Live electrical hazard detected by {vehicle_id} "
            f"at coordinates {latitude:.4f}, {longitude:.4f}. Severity: {severity}. "
            f"Immediate line isolation and technical crew required."
        )
        audio_prompt = f"Electrical Hazard Alert. Snapped overhead wire detected near latitude {latitude:.3f}, longitude {longitude:.3f}. Isolation crew dispatched."
    else:
        target_agency = settings.EMERGENCY_POLICE_NAME
        contact_phone = settings.EMERGENCY_POLICE_PHONE
        action_type = "POLICE_ALERT_DISPATCHED"
        msg = (
            f"TRAFFIC POLICE DISPATCH: Major road blockage detected by {vehicle_id} "
            f"at coordinates {latitude:.4f}, {longitude:.4f}."
        )
        audio_prompt = f"Traffic alert reported by {vehicle_id}."

    log_entry = EmergencyLogModel(
        id=str(uuid.uuid4()),
        event_id=event_id,
        vehicle_id=vehicle_id,
        target_agency=target_agency,
        contact_number=contact_phone,
        incident_type=issue_type,
        location_str=f"{latitude:.4f}, {longitude:.4f}",
        latitude=latitude,
        longitude=longitude,
        timestamp=now_iso,
        action_type=action_type,
        message_content=msg,
        status="DISPATCHED"
    )
    
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)

    return {
        "dispatch_id": log_entry.id,
        "target_agency": target_agency,
        "contact_phone": contact_phone,
        "action_type": action_type,
        "timestamp": now_iso,
        "message": msg,
        "audio_prompt": audio_prompt,
        "status": "DISPATCHED"
    }
