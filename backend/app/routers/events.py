import uuid
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import EventModel
from app.schemas import EventCreate, EventResponse, EventStatusUpdate, ConsolidatedIssue
from app.services.routing_engine import assign_department
from app.services.emergency_service import trigger_emergency_dispatch
from app.services.deduplication import find_spatial_cluster, get_consolidated_issues

router = APIRouter(prefix="/events", tags=["Events"])

@router.get("", response_model=List[EventResponse])
def get_events(
    vehicle_id: Optional[str] = None,
    issue_type: Optional[str] = None,
    department: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """
    Retrieve urban events with multi-criteria filtering (PRD FR-19, FR-22).
    """
    query = db.query(EventModel)
    if vehicle_id:
        query = query.filter(EventModel.vehicle_id == vehicle_id)
    if issue_type:
        query = query.filter(EventModel.issue_type == issue_type)
    if department:
        query = query.filter(EventModel.assigned_department.ilike(f"%{department}%"))
    if severity:
        query = query.filter(EventModel.severity == severity)
    if status:
        query = query.filter(EventModel.status == status)

    events = query.order_by(EventModel.created_at.desc()).limit(limit).all()
    return events

@router.post("", response_model=EventResponse, status_code=201)
def create_event(event_in: EventCreate, db: Session = Depends(get_db)):
    """
    Ingest analysed edge AI event (PRD FR-13, FR-18).
    Executes automated department assignment, spatial deduplication,
    and automated emergency dispatch if critical.
    """
    event_id = str(uuid.uuid4())
    now_iso = datetime.datetime.now().isoformat()
    timestamp = event_in.timestamp or now_iso

    # 1. Automated Department Assignment (PRD FR-14)
    routing_info = assign_department(event_in.issue_type, event_in.severity)
    assigned_dept = routing_info["department"]
    emergency_contact = routing_info["emergency_contact"]

    # 2. Smart Spatial Deduplication (PRD Section 18)
    cluster_id, deduplicated_count = find_spatial_cluster(
        db=db,
        latitude=event_in.latitude,
        longitude=event_in.longitude,
        issue_type=event_in.issue_type
    )

    # 3. Emergency Dispatch Trigger for Critical Incidents (PRD FR-15)
    emergency_dispatched = False
    if routing_info["requires_emergency_dispatch"] or event_in.severity == "CRITICAL":
        emergency_dispatched = True
        trigger_emergency_dispatch(
            db=db,
            event_id=event_id,
            vehicle_id=event_in.vehicle_id,
            issue_type=event_in.issue_type,
            latitude=event_in.latitude,
            longitude=event_in.longitude,
            severity=event_in.severity,
            details=event_in.details
        )

    # 4. Save Event to DB
    new_event = EventModel(
        id=event_id,
        vehicle_id=event_in.vehicle_id,
        issue_type=event_in.issue_type,
        confidence=event_in.confidence,
        latitude=event_in.latitude,
        longitude=event_in.longitude,
        timestamp=timestamp,
        severity=event_in.severity,
        assigned_department=assigned_dept,
        emergency_contact=emergency_contact,
        emergency_dispatched=emergency_dispatched,
        status="ESCALATED" if emergency_dispatched else "ASSIGNED",
        details=event_in.details,
        image_evidence=event_in.image_evidence,
        deduplicated_count=deduplicated_count,
        deduplication_cluster_id=cluster_id,
        created_at=now_iso
    )

    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    # 5. Automatically create official letter draft for user approval
    try:
        from app.services.letter_generator import create_letter_draft_for_event
        create_letter_draft_for_event({
            "id": event_id,
            "issue_type": event_in.issue_type,
            "severity": event_in.severity,
            "vehicle_id": event_in.vehicle_id,
            "latitude": event_in.latitude,
            "longitude": event_in.longitude,
            "confidence": event_in.confidence,
            "details": event_in.details
        }, db=db)
    except Exception as e:
        print(f"[Events Router] Letter generation warning: {e}")

    return new_event

@router.get("/consolidated", response_model=List[ConsolidatedIssue])
def get_consolidated(db: Session = Depends(get_db)):
    """
    Returns consolidated physical issues derived from smart deduplication (PRD Section 18).
    """
    return get_consolidated_issues(db)


@router.patch("/{event_id}/status", response_model=EventResponse)
def update_event_status(event_id: str, update_in: EventStatusUpdate, db: Session = Depends(get_db)):
    """
    Update lifecycle status of an event (e.g. IN_PROGRESS, RESOLVED) (PRD FR-20).
    """
    event = db.query(EventModel).filter(EventModel.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    event.status = update_in.status
    if update_in.notes:
        event.details = f"{event.details or ''} | Note: {update_in.notes}"
    
    db.commit()
    db.refresh(event)
    return event

@router.delete("/{event_id}")
def delete_event(event_id: str, db: Session = Depends(get_db)):
    """
    Delete a test or invalid event (PRD FR-20).
    """
    event = db.query(EventModel).filter(EventModel.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
    return {"status": "success", "message": f"Event {event_id} removed"}
