import math
import uuid
from typing import Optional, Tuple, List
from sqlalchemy.orm import Session
from app.models import EventModel
from app.config import settings

def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance between two points in meters using Haversine formula."""
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    return R * c

def find_spatial_cluster(
    db: Session,
    latitude: float,
    longitude: float,
    issue_type: str,
    radius_meters: float = settings.DEDUPLICATION_RADIUS_METERS
) -> Tuple[Optional[str], int]:
    """
    Find existing event cluster within radius for the same issue type.
    Returns (cluster_id, report_count).
    """
    # Look for matching issue types in the database
    candidates = db.query(EventModel).filter(
        EventModel.issue_type == issue_type
    ).all()

    for cand in candidates:
        dist = haversine_distance_meters(latitude, longitude, cand.latitude, cand.longitude)
        if dist <= radius_meters:
            # Found spatial match!
            cluster_id = cand.deduplication_cluster_id or f"cluster-{uuid.uuid4().hex[:8]}"
            if not cand.deduplication_cluster_id:
                cand.deduplication_cluster_id = cluster_id
                db.commit()
            
            # Count existing members in this cluster
            count = db.query(EventModel).filter(
                EventModel.deduplication_cluster_id == cluster_id
            ).count()
            return cluster_id, count + 1

    # No existing cluster found; create a new one
    new_cluster_id = f"cluster-{uuid.uuid4().hex[:8]}"
    return new_cluster_id, 1

def get_consolidated_issues(db: Session) -> List[dict]:
    """
    Groups all events into consolidated physical issues as requested in PRD Section 18.
    Turns multiple vehicle detections of the same pothole/issue into 1 actionable item.
    """
    events = db.query(EventModel).all()
    clusters = {}

    for ev in events:
        c_id = ev.deduplication_cluster_id or f"single-{ev.id}"
        if c_id not in clusters:
            clusters[c_id] = {
                "cluster_id": c_id,
                "issue_type": ev.issue_type,
                "representative_latitude": ev.latitude,
                "representative_longitude": ev.longitude,
                "severity": ev.severity,
                "confidence": ev.confidence,
                "assigned_department": ev.assigned_department,
                "reporting_vehicles": set([ev.vehicle_id]),
                "first_reported": ev.timestamp,
                "last_reported": ev.timestamp,
                "status": ev.status,
                "report_count": 0,
                "events": []
            }
        
        clusters[c_id]["report_count"] += 1
        clusters[c_id]["reporting_vehicles"].add(ev.vehicle_id)
        clusters[c_id]["events"].append(ev.id)
        # Update representative confidence & severity if higher
        if ev.confidence > clusters[c_id]["confidence"]:
            clusters[c_id]["confidence"] = ev.confidence
        if ev.timestamp > clusters[c_id]["last_reported"]:
            clusters[c_id]["last_reported"] = ev.timestamp

    # Compute priority score: count * severity_weight * confidence
    severity_weights = {"LOW": 1.0, "MEDIUM": 1.5, "HIGH": 2.5, "CRITICAL": 4.0}
    result = []
    for c_id, data in clusters.items():
        weight = severity_weights.get(data["severity"], 1.0)
        vehicle_count = len(data["reporting_vehicles"])
        # Multiple vehicles reporting the same issue boosts priority exponentially!
        priority = round((data["report_count"] * 1.5 + vehicle_count * 2.0) * weight * data["confidence"], 2)
        
        result.append({
            "cluster_id": c_id,
            "issue_type": data["issue_type"],
            "representative_latitude": round(data["representative_latitude"], 5),
            "representative_longitude": round(data["representative_longitude"], 5),
            "severity": data["severity"],
            "confidence": round(data["confidence"], 2),
            "assigned_department": data["assigned_department"],
            "report_count": data["report_count"],
            "reporting_vehicles": sorted(list(data["reporting_vehicles"])),
            "first_reported": data["first_reported"],
            "last_reported": data["last_reported"],
            "status": data["status"],
            "priority_score": priority
        })

    # Sort by priority score descending
    result.sort(key=lambda x: x["priority_score"], reverse=True)
    return result
