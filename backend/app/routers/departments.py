from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import EventModel
from app.config import settings

router = APIRouter(prefix="/departments", tags=["Departments & Routing Queues"])

DEPARTMENTS_CONFIG = [
    {
        "id": "dept-road",
        "name": "Road Maintenance Department",
        "jurisdiction": "Asphalt repairs, potholes, pavement cracks, road signage",
        "emergency_contact": None,
        "sla_hours": 48,
        "badge_color": "blue"
    },
    {
        "id": "dept-traffic",
        "name": "Traffic Police Department",
        "jurisdiction": "Congestion management, bottleneck clearing, signal regulation",
        "emergency_contact": settings.EMERGENCY_POLICE_PHONE,
        "sla_hours": 2,
        "badge_color": "amber"
    },
    {
        "id": "dept-flood",
        "name": "Municipal Drainage & Flood Control",
        "jurisdiction": "Submerged roads, stormwater pumping, monsoon flood mitigation",
        "emergency_contact": None,
        "sla_hours": 6,
        "badge_color": "cyan"
    },
    {
        "id": "dept-power",
        "name": "Electricity Board (TANGEDCO)",
        "jurisdiction": "Live wire hazards, fallen street poles, short circuit sparks",
        "emergency_contact": settings.EMERGENCY_ELECTRICITY_PHONE,
        "sla_hours": 1,
        "badge_color": "yellow"
    },
    {
        "id": "dept-medical",
        "name": "Emergency Medical Services & Hospital",
        "jurisdiction": "Road accidents, pedestrian casualties, trauma ambulance response",
        "emergency_contact": settings.EMERGENCY_HOSPITAL_PHONE,
        "sla_hours": 0.25,
        "badge_color": "red"
    },
    {
        "id": "dept-civic",
        "name": "General Municipal Administration",
        "jurisdiction": "Civic monitoring, smart city urban planning, public transport routes",
        "emergency_contact": None,
        "sla_hours": 72,
        "badge_color": "slate"
    }
]

@router.get("")
def get_departments_summary(db: Session = Depends(get_db)):
    """
    List all departments with live incident queues, counts, and response SLAs (PRD FR-14, FR-20).
    """
    result = []
    for dept in DEPARTMENTS_CONFIG:
        events = db.query(EventModel).filter(
            EventModel.assigned_department == dept["name"]
        ).all()
        
        active_count = sum(1 for e in events if e.status in ["ASSIGNED", "IN_PROGRESS", "ESCALATED"])
        escalated_count = sum(1 for e in events if e.status == "ESCALATED" or e.severity == "CRITICAL")
        resolved_count = sum(1 for e in events if e.status == "RESOLVED")

        result.append({
            **dept,
            "total_assigned": len(events),
            "active_issues": active_count,
            "escalated_issues": escalated_count,
            "resolved_issues": resolved_count,
            "latest_events": [
                {
                    "id": e.id,
                    "issue_type": e.issue_type,
                    "severity": e.severity,
                    "vehicle_id": e.vehicle_id,
                    "timestamp": e.timestamp,
                    "status": e.status
                }
                for e in sorted(events, key=lambda x: x.timestamp, reverse=True)[:5]
            ]
        })
    return result
