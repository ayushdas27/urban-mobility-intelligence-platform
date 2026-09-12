import uuid
import datetime
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import EventModel
from app.services.ai_vision import PRESET_SCENARIOS, analyze_image_bytes
from app.services.routing_engine import assign_department
from app.services.emergency_service import trigger_emergency_dispatch
from app.services.deduplication import find_spatial_cluster

router = APIRouter(prefix="/ai", tags=["AI Vision & Edge Inference"])

@router.get("/presets")
def list_presets():
    """
    Get preset dashcam video/image scenarios for testing AI vision.
    """
    return [
        {
            "id": k,
            "title": v["title"],
            "vehicle_id": v["vehicle_id"],
            "issue_type": v["issue_type"],
            "severity": v["severity"],
            "traffic_density": v["traffic_density"],
            "details": v["details"]
        }
        for k, v in PRESET_SCENARIOS.items()
    ]

@router.post("/analyze-preset/{scenario_key}")
def analyze_preset(scenario_key: str, auto_ingest: bool = True, db: Session = Depends(get_db)):
    """
    Simulate running Edge AI on a preset dashcam frame and routing the result to Cloud.
    """
    if scenario_key not in PRESET_SCENARIOS:
        raise HTTPException(status_code=404, detail="Preset scenario not found")
    
    preset = PRESET_SCENARIOS[scenario_key]
    now_iso = datetime.datetime.now().isoformat()
    
    event_id = str(uuid.uuid4())
    routing = assign_department(preset["issue_type"], preset["severity"])
    
    # Check deduplication
    cluster_id, dedup_count = find_spatial_cluster(
        db, preset["latitude"], preset["longitude"], preset["issue_type"]
    )
    
    # Check emergency dispatch
    emergency_dispatched = False
    if routing["requires_emergency_dispatch"] or preset["severity"] == "CRITICAL":
        emergency_dispatched = True
        trigger_emergency_dispatch(
            db=db,
            event_id=event_id,
            vehicle_id=preset["vehicle_id"],
            issue_type=preset["issue_type"],
            latitude=preset["latitude"],
            longitude=preset["longitude"],
            severity=preset["severity"],
            details=preset["details"]
        )

    if auto_ingest:
        event = EventModel(
            id=event_id,
            vehicle_id=preset["vehicle_id"],
            issue_type=preset["issue_type"],
            confidence=preset["confidence"],
            latitude=preset["latitude"],
            longitude=preset["longitude"],
            timestamp=now_iso,
            severity=preset["severity"],
            assigned_department=routing["department"],
            emergency_contact=routing["emergency_contact"],
            emergency_dispatched=emergency_dispatched,
            status="ESCALATED" if emergency_dispatched else "ASSIGNED",
            details=preset["details"],
            image_evidence=None,
            deduplicated_count=dedup_count,
            deduplication_cluster_id=cluster_id,
            created_at=now_iso
        )
        db.add(event)
        db.commit()

    return {
        "scenario": preset["title"],
        "vehicle_id": preset["vehicle_id"],
        "issue_type": preset["issue_type"],
        "confidence": preset["confidence"],
        "severity": preset["severity"],
        "traffic_density": preset["traffic_density"],
        "latitude": preset["latitude"],
        "longitude": preset["longitude"],
        "detections": preset["detections"],
        "details": preset["details"],
        "assigned_department": routing["department"],
        "emergency_dispatched": emergency_dispatched,
        "cluster_id": cluster_id,
        "event_id": event_id if auto_ingest else None
    }

@router.post("/analyze-upload")
async def analyze_uploaded_image(
    file: UploadFile = File(...),
    vehicle_id: str = Form("BUS-021"),
    latitude: float = Form(13.0827),
    longitude: float = Form(80.2707),
    auto_ingest: bool = Form(True),
    db: Session = Depends(get_db)
):
    """
    Accepts real dashcam image upload, executes YOLOv8 object detection,
    pedestrian & vehicle density estimation, and registers the event.
    """
    image_bytes = await file.read()
    analysis = analyze_image_bytes(image_bytes, vehicle_id=vehicle_id, lat=latitude, lon=longitude)
    
    event_id = str(uuid.uuid4())
    now_iso = datetime.datetime.now().isoformat()
    routing = assign_department(analysis["issue_type"], analysis["severity"])
    
    cluster_id, dedup_count = find_spatial_cluster(
        db, analysis["latitude"], analysis["longitude"], analysis["issue_type"]
    )
    
    emergency_dispatched = False
    if routing["requires_emergency_dispatch"] or analysis["severity"] == "CRITICAL":
        emergency_dispatched = True
        trigger_emergency_dispatch(
            db=db,
            event_id=event_id,
            vehicle_id=vehicle_id,
            issue_type=analysis["issue_type"],
            latitude=latitude,
            longitude=longitude,
            severity=analysis["severity"],
            details=analysis["details"]
        )

    if auto_ingest:
        event = EventModel(
            id=event_id,
            vehicle_id=vehicle_id,
            issue_type=analysis["issue_type"],
            confidence=analysis["confidence"],
            latitude=analysis["latitude"],
            longitude=analysis["longitude"],
            timestamp=now_iso,
            severity=analysis["severity"],
            assigned_department=routing["department"],
            emergency_contact=routing["emergency_contact"],
            emergency_dispatched=emergency_dispatched,
            status="ESCALATED" if emergency_dispatched else "ASSIGNED",
            details=analysis["details"],
            image_evidence=analysis["annotated_image"],
            deduplicated_count=dedup_count,
            deduplication_cluster_id=cluster_id,
            created_at=now_iso
        )
        db.add(event)
        db.commit()

    analysis["event_id"] = event_id if auto_ingest else None
    analysis["assigned_department"] = routing["department"]
    analysis["emergency_dispatched"] = emergency_dispatched
    analysis["deduplicated_count"] = dedup_count
    return analysis
