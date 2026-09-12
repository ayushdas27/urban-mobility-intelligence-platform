from collections import Counter
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import EventModel, VehicleModel, EmergencyLogModel
from app.schemas import AnalyticsSummary
from app.services.deduplication import get_consolidated_issues

router = APIRouter(prefix="/analytics", tags=["Analytics & Heatmaps"])

@router.get("/summary", response_model=AnalyticsSummary)
def get_analytics_summary(db: Session = Depends(get_db)):
    """
    Event and Fleet Analytics dashboard metrics (PRD FR-24, FR-25).
    """
    events = db.query(EventModel).all()
    total_events = len(events)
    
    potholes = sum(1 for e in events if "pothole" in e.issue_type.lower())
    damaged_roads = sum(1 for e in events if "damaged" in e.issue_type.lower() or "crack" in e.issue_type.lower())
    traffic_events = sum(1 for e in events if "traffic" in e.issue_type.lower() or "congestion" in e.issue_type.lower())
    waterlogging = sum(1 for e in events if "water" in e.issue_type.lower() or "flood" in e.issue_type.lower())
    electricity = sum(1 for e in events if "electric" in e.issue_type.lower() or "wire" in e.issue_type.lower())
    critical = sum(1 for e in events if e.severity == "CRITICAL" or "critical" in e.issue_type.lower() or "accident" in e.issue_type.lower())
    
    active_buses = db.query(VehicleModel).filter(VehicleModel.status == "ACTIVE").count()
    consolidated = len(get_consolidated_issues(db))
    emergency_dispatches = db.query(EmergencyLogModel).count()

    dept_counts = Counter(e.assigned_department for e in events)
    severity_counts = Counter(e.severity for e in events)

    return AnalyticsSummary(
        total_events=total_events,
        potholes_count=potholes,
        damaged_roads_count=damaged_roads,
        traffic_congestion_count=traffic_events,
        waterlogging_count=waterlogging,
        electricity_hazards_count=electricity,
        critical_incidents_count=critical,
        active_buses=active_buses,
        consolidated_issues=consolidated,
        emergency_dispatches=emergency_dispatches,
        department_distribution=dict(dept_counts),
        severity_distribution=dict(severity_counts)
    )

@router.get("/heatmaps")
def get_heatmap_points(db: Session = Depends(get_db)):
    """
    Generate weighted geospatial coordinate points for GIS heatmaps (PRD FR-23).
    Categories: traffic, road_defects, waterlogging, critical_hazards.
    """
    events = db.query(EventModel).all()
    
    traffic_points = []
    defect_points = []
    water_points = []
    hazard_points = []

    severity_intensity = {
        "LOW": 0.4,
        "MEDIUM": 0.7,
        "HIGH": 0.9,
        "CRITICAL": 1.0
    }

    for e in events:
        intensity = severity_intensity.get(e.severity, 0.5)
        point = [e.latitude, e.longitude, intensity]
        issue_lower = e.issue_type.lower()

        if "traffic" in issue_lower or "congestion" in issue_lower:
            traffic_points.append(point)
        elif "pothole" in issue_lower or "damage" in issue_lower or "crack" in issue_lower:
            defect_points.append(point)
        elif "water" in issue_lower or "flood" in issue_lower:
            water_points.append(point)
        
        if e.severity in ["HIGH", "CRITICAL"] or "electric" in issue_lower or "critical" in issue_lower:
            hazard_points.append(point)

    return {
        "traffic_heatmap": traffic_points,
        "road_defects_heatmap": defect_points,
        "waterlogging_heatmap": water_points,
        "critical_hazards_heatmap": hazard_points
    }
