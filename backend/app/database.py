import os
import uuid
import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings
from app.models import Base, EventModel, VehicleModel, EmergencyLogModel, LetterDraftModel

# Initialize SQLite database engine
engine = create_engine(
    settings.SQLITE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, expire_on_commit=False)

# Optional MongoDB Client Support
mongo_db = None
if settings.MONGODB_URI:
    try:
        from pymongo import MongoClient
        mongo_client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=2000)
        mongo_db = mongo_client[settings.DATABASE_NAME]
        print(f"[MongoDB] Connected successfully to {settings.DATABASE_NAME}")
    except Exception as e:
        print(f"[MongoDB] Warning: Could not connect to MongoDB ({e}). Falling back to SQLite.")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Create all tables and seed initial vehicles and sample urban events."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Seed Public Transport Bus Fleet (PRD Section 9, FR-01)
    if db.query(VehicleModel).count() == 0:
        sample_vehicles = [
            VehicleModel(
                vehicle_id="BUS-001",
                route_name="Route 18A (Broadway - Tambaram via Mount Road)",
                latitude=13.0478,
                longitude=80.2090,
                speed_kmh=34.5,
                heading=210.0,
                status="ACTIVE",
                last_updated=datetime.datetime.now().isoformat()
            ),
            VehicleModel(
                vehicle_id="BUS-008",
                route_name="Route 21G (Broadway - Vandalur Zoo via Marina)",
                latitude=13.0520,
                longitude=80.2820,
                speed_kmh=28.0,
                heading=180.0,
                status="ACTIVE",
                last_updated=datetime.datetime.now().isoformat()
            ),
            VehicleModel(
                vehicle_id="BUS-015",
                route_name="Route 570 (Koyambedu - Siruseri via OMR IT Corridor)",
                latitude=12.9719,
                longitude=80.2464,
                speed_kmh=42.0,
                heading=175.0,
                status="ACTIVE",
                last_updated=datetime.datetime.now().isoformat()
            ),
            VehicleModel(
                vehicle_id="BUS-021",
                route_name="Route 29C (Perambur - Besant Nagar via T.Nagar)",
                latitude=13.0418,
                longitude=80.2341,
                speed_kmh=22.0,
                heading=145.0,
                status="ACTIVE",
                last_updated=datetime.datetime.now().isoformat()
            ),
            VehicleModel(
                vehicle_id="BUS-034",
                route_name="Route 47D (Avadi - T.Nagar via Poonamallee High Rd)",
                latitude=13.0784,
                longitude=80.2056,
                speed_kmh=31.0,
                heading=120.0,
                status="ACTIVE",
                last_updated=datetime.datetime.now().isoformat()
            )
        ]
        for v in sample_vehicles:
            db.add(v)
        db.commit()
        print("[Database] Seeded 5 initial public transport fleet vehicles.")

    # Seed Sample Urban Events (PRD FR-03 - FR-12)
    if db.query(EventModel).count() == 0:
        now = datetime.datetime.now()
        sample_events = [
            EventModel(
                id=str(uuid.uuid4()),
                vehicle_id="BUS-021",
                issue_type="Pothole",
                confidence=0.94,
                latitude=13.0478,
                longitude=80.2090,
                timestamp=(now - datetime.timedelta(minutes=15)).isoformat(),
                severity="HIGH",
                assigned_department="Road Maintenance Department",
                emergency_contact=None,
                emergency_dispatched=False,
                status="ASSIGNED",
                details="Deep 35cm pothole on inner lane near Anna Salai flyover. Causes sudden braking.",
                deduplicated_count=3,
                deduplication_cluster_id="cluster-pothole-annasalai",
                created_at=(now - datetime.timedelta(minutes=15)).isoformat()
            ),
            EventModel(
                id=str(uuid.uuid4()),
                vehicle_id="BUS-001",
                issue_type="Traffic Congestion",
                confidence=0.89,
                latitude=13.0418,
                longitude=80.2341,
                timestamp=(now - datetime.timedelta(minutes=8)).isoformat(),
                severity="MEDIUM",
                assigned_department="Traffic Police Department",
                emergency_contact=settings.EMERGENCY_POLICE_PHONE,
                emergency_dispatched=False,
                status="ASSIGNED",
                details="Heavy bottleneck at T. Nagar junction. Vehicle density estimated HIGH, 14 vehicles in 50m frame.",
                deduplicated_count=1,
                deduplication_cluster_id="cluster-traffic-tnagar",
                created_at=(now - datetime.timedelta(minutes=8)).isoformat()
            ),
            EventModel(
                id=str(uuid.uuid4()),
                vehicle_id="BUS-015",
                issue_type="Waterlogging",
                confidence=0.91,
                latitude=12.9719,
                longitude=80.2464,
                timestamp=(now - datetime.timedelta(minutes=25)).isoformat(),
                severity="HIGH",
                assigned_department="Municipal Drainage & Flood Control",
                emergency_contact=None,
                emergency_dispatched=False,
                status="IN_PROGRESS",
                details="Submerged road segment (20cm water depth) on OMR Sholinganallur junction due to blocked stormwater drain.",
                deduplicated_count=2,
                deduplication_cluster_id="cluster-waterlog-omr",
                created_at=(now - datetime.timedelta(minutes=25)).isoformat()
            ),
            EventModel(
                id=str(uuid.uuid4()),
                vehicle_id="BUS-008",
                issue_type="Electricity Hazard",
                confidence=0.96,
                latitude=13.0550,
                longitude=80.2780,
                timestamp=(now - datetime.timedelta(minutes=5)).isoformat(),
                severity="CRITICAL",
                assigned_department="Electricity Board (TANGEDCO)",
                emergency_contact=settings.EMERGENCY_ELECTRICITY_PHONE,
                emergency_dispatched=True,
                status="ESCALATED",
                details="Snapped high-tension overhead cable hanging 1.5m above road surface on Marina Beach service lane.",
                deduplicated_count=1,
                deduplication_cluster_id=None,
                created_at=(now - datetime.timedelta(minutes=5)).isoformat()
            ),
            EventModel(
                id=str(uuid.uuid4()),
                vehicle_id="BUS-034",
                issue_type="Critical Incident",
                confidence=0.95,
                latitude=13.0784,
                longitude=80.2056,
                timestamp=(now - datetime.timedelta(minutes=2)).isoformat(),
                severity="CRITICAL",
                assigned_department="Emergency Medical Services & Hospital",
                emergency_contact=settings.EMERGENCY_HOSPITAL_PHONE,
                emergency_dispatched=True,
                status="ESCALATED",
                details="Multi-vehicle collision involving two-wheeler with potential injured passenger. Emergency dispatch triggered.",
                deduplicated_count=1,
                deduplication_cluster_id=None,
                created_at=(now - datetime.timedelta(minutes=2)).isoformat()
            ),
            EventModel(
                id=str(uuid.uuid4()),
                vehicle_id="BUS-001",
                issue_type="Damaged Road",
                confidence=0.87,
                latitude=13.0612,
                longitude=80.2520,
                timestamp=(now - datetime.timedelta(minutes=45)).isoformat(),
                severity="LOW",
                assigned_department="Road Maintenance Department",
                emergency_contact=None,
                emergency_dispatched=False,
                status="ASSIGNED",
                details="Extensive surface alligator cracking across 12-meter stretch near Gemini Circle.",
                deduplicated_count=1,
                deduplication_cluster_id=None,
                created_at=(now - datetime.timedelta(minutes=45)).isoformat()
            )
        ]
        for e in sample_events:
            db.add(e)
            
        # Also seed Emergency Log entry for the critical incidents
        sample_logs = [
            EmergencyLogModel(
                id=str(uuid.uuid4()),
                event_id=sample_events[3].id,
                vehicle_id="BUS-008",
                target_agency=settings.EMERGENCY_ELECTRICITY_NAME,
                contact_number=settings.EMERGENCY_ELECTRICITY_PHONE,
                incident_type="Electricity Hazard",
                location_str="13.0550, 80.2780 (Marina Beach)",
                latitude=13.0550,
                longitude=80.2780,
                timestamp=(now - datetime.timedelta(minutes=5)).isoformat(),
                action_type="EMERGENCY_ALERT_DISPATCHED",
                message_content="CRITICAL ALERT: Snapped overhead power line detected by BUS-008 on Marina Beach service lane. Urgent repair team dispatched.",
                status="DELIVERED"
            ),
            EmergencyLogModel(
                id=str(uuid.uuid4()),
                event_id=sample_events[4].id,
                vehicle_id="BUS-034",
                target_agency=settings.EMERGENCY_HOSPITAL_NAME,
                contact_number=settings.EMERGENCY_HOSPITAL_PHONE,
                incident_type="Critical Incident",
                location_str="13.0784, 80.2056 (Poonamallee High Rd)",
                latitude=13.0784,
                longitude=80.2056,
                timestamp=(now - datetime.timedelta(minutes=2)).isoformat(),
                action_type="EMERGENCY_CALL_INITIATED",
                message_content="URGENT MEDICAL AMBULANCE DISPATCH: Road collision detected by BUS-034 at Poonamallee High Rd. Coordinates: 13.0784, 80.2056.",
                status="CALL_CONNECTED"
            )
        ]
        for l in sample_logs:
            db.add(l)

        db.commit()
        print("[Database] Seeded sample urban events and emergency logs.")

    # Seed Initial Letter Drafts for events (PRD: Automated Letter Generation)
    if db.query(LetterDraftModel).count() == 0:
        from app.services.letter_generator import create_letter_draft_for_event
        all_events = db.query(EventModel).all()
        for ev in all_events:
            create_letter_draft_for_event({
                "id": ev.id,
                "issue_type": ev.issue_type,
                "severity": ev.severity,
                "vehicle_id": ev.vehicle_id,
                "latitude": ev.latitude,
                "longitude": ev.longitude,
                "confidence": ev.confidence,
                "details": ev.details
            }, db=db)
        print("[Database] Seeded initial official letter drafts for urban events.")

    db.close()

