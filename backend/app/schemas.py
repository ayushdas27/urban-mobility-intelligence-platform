from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class SeverityLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class IssueType(str, Enum):
    POTHOLE = "Pothole"
    DAMAGED_ROAD = "Damaged Road"
    TRAFFIC_CONGESTION = "Traffic Congestion"
    WATERLOGGING = "Waterlogging"
    ELECTRICITY_HAZARD = "Electricity Hazard"
    PEDESTRIAN_HAZARD = "Pedestrian Hazard"
    CRITICAL_INCIDENT = "Critical Incident"
    MISSING_SIGN = "Missing/Damaged Sign"

class DepartmentName(str, Enum):
    ROAD_MAINTENANCE = "Road Maintenance Department"
    TRAFFIC_POLICE = "Traffic Police Department"
    MUNICIPAL_DISASTER = "Municipal Drainage & Flood Control"
    ELECTRICITY_BOARD = "Electricity Board (TANGEDCO)"
    EMERGENCY_MEDICAL = "Emergency Medical Services & Hospital"
    GENERAL_MUNICIPAL = "General Municipal Administration"

class EventStatus(str, Enum):
    REPORTED = "REPORTED"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    ESCALATED = "ESCALATED"
    RESOLVED = "RESOLVED"

class EventBase(BaseModel):
    vehicle_id: str = Field(..., example="BUS-021")
    issue_type: str = Field(..., example="Pothole")
    confidence: float = Field(..., ge=0.0, le=1.0, example=0.93)
    latitude: float = Field(..., example=13.0827)
    longitude: float = Field(..., example=80.2707)
    timestamp: Optional[str] = None
    severity: SeverityLevel = SeverityLevel.MEDIUM
    details: Optional[str] = None
    image_evidence: Optional[str] = None

class EventCreate(EventBase):
    pass

class EventResponse(EventBase):
    id: str
    assigned_department: str
    emergency_contact: Optional[str] = None
    emergency_dispatched: bool = False
    status: EventStatus = EventStatus.ASSIGNED
    deduplicated_count: int = 1
    deduplication_cluster_id: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True

class EventStatusUpdate(BaseModel):
    status: EventStatus
    notes: Optional[str] = None

class VehicleStatus(BaseModel):
    vehicle_id: str
    route_name: str
    latitude: float
    longitude: float
    speed_kmh: float
    heading: float
    status: str
    active_issues_count: int = 0
    last_updated: str

class ConsolidatedIssue(BaseModel):
    cluster_id: str
    issue_type: str
    representative_latitude: float
    representative_longitude: float
    severity: SeverityLevel
    confidence: float
    assigned_department: str
    report_count: int
    reporting_vehicles: List[str]
    first_reported: str
    last_reported: str
    status: EventStatus
    priority_score: float

class EmergencyDispatchLog(BaseModel):
    id: str
    event_id: str
    vehicle_id: str
    target_agency: str
    contact_number: str
    incident_type: str
    location_str: str
    latitude: float
    longitude: float
    timestamp: str
    action_type: str  # "CALL_INITIATED", "SMS_DISPATCHED", "WEBHOOK_TRIGGERED"
    message_content: str
    status: str

class RouteDelay(BaseModel):
    route_id: str
    route_name: str
    expected_duration_min: int
    observed_duration_min: int
    delay_min: int
    congestion_level: str
    reporting_vehicles: List[str]

class AnalyticsSummary(BaseModel):
    total_events: int
    potholes_count: int
    damaged_roads_count: int
    traffic_congestion_count: int
    waterlogging_count: int
    electricity_hazards_count: int
    critical_incidents_count: int
    active_buses: int
    consolidated_issues: int
    emergency_dispatches: int
    department_distribution: dict
    severity_distribution: dict
