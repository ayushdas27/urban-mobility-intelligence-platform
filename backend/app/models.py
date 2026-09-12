import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class EventModel(Base):
    __tablename__ = "events"

    id = Column(String(64), primary_key=True, index=True)
    vehicle_id = Column(String(32), index=True, nullable=False)
    issue_type = Column(String(64), index=True, nullable=False)
    confidence = Column(Float, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    timestamp = Column(String(64), nullable=False)
    severity = Column(String(32), nullable=False, default="MEDIUM")
    assigned_department = Column(String(128), nullable=False)
    emergency_contact = Column(String(128), nullable=True)
    emergency_dispatched = Column(Boolean, default=False)
    status = Column(String(32), default="ASSIGNED")
    details = Column(Text, nullable=True)
    image_evidence = Column(Text, nullable=True)
    deduplicated_count = Column(Integer, default=1)
    deduplication_cluster_id = Column(String(64), nullable=True, index=True)
    created_at = Column(String(64), default=lambda: datetime.datetime.now().isoformat())

class VehicleModel(Base):
    __tablename__ = "vehicles"

    vehicle_id = Column(String(32), primary_key=True, index=True)
    route_name = Column(String(64), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    speed_kmh = Column(Float, default=30.0)
    heading = Column(Float, default=0.0)
    status = Column(String(32), default="ACTIVE")
    last_updated = Column(String(64), default=lambda: datetime.datetime.now().isoformat())

class EmergencyLogModel(Base):
    __tablename__ = "emergency_logs"

    id = Column(String(64), primary_key=True, index=True)
    event_id = Column(String(64), index=True, nullable=False)
    vehicle_id = Column(String(32), index=True, nullable=False)
    target_agency = Column(String(128), nullable=False)
    contact_number = Column(String(64), nullable=False)
    incident_type = Column(String(64), nullable=False)
    location_str = Column(String(128), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    timestamp = Column(String(64), nullable=False)
    action_type = Column(String(64), nullable=False)
    message_content = Column(Text, nullable=False)
    status = Column(String(32), default="SENT")

class LetterDraftModel(Base):
    __tablename__ = "letter_drafts"

    id = Column(String(64), primary_key=True, index=True)
    event_id = Column(String(64), index=True, nullable=False)
    reference_no = Column(String(64), unique=True, index=True, nullable=False)
    department = Column(String(128), nullable=False)
    recipient_name = Column(String(256), nullable=False)
    recipient_address = Column(Text, nullable=False)
    subject = Column(String(256), nullable=False)
    statutory_ref = Column(String(256), nullable=True)
    letter_body = Column(Text, nullable=False)
    requested_action = Column(Text, nullable=False)
    priority = Column(String(32), default="HIGH")
    status = Column(String(32), default="DRAFT_PENDING_APPROVAL")  # DRAFT_PENDING_APPROVAL, APPROVED_AND_DISPATCHED, REJECTED
    dispatch_channel = Column(String(64), default="E_GOVERNANCE_PORTAL")
    created_at = Column(String(64), default=lambda: datetime.datetime.now().isoformat())
    dispatched_at = Column(String(64), nullable=True)

