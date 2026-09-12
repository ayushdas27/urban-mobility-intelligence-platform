from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import VehicleModel
from app.schemas import VehicleStatus, RouteDelay
from app.services.simulator import advance_simulation_step, get_route_delays

router = APIRouter(prefix="/simulator", tags=["Fleet Simulator"])

@router.get("/vehicles", response_model=List[VehicleStatus])
def get_vehicles(db: Session = Depends(get_db)):
    """
    Get live telemetry for all public transport sensing vehicles (PRD FR-01, FR-25).
    """
    vehicles = db.query(VehicleModel).all()
    res = []
    for v in vehicles:
        res.append(VehicleStatus(
            vehicle_id=v.vehicle_id,
            route_name=v.route_name,
            latitude=v.latitude,
            longitude=v.longitude,
            speed_kmh=v.speed_kmh,
            heading=v.heading,
            status=v.status,
            active_issues_count=0,
            last_updated=v.last_updated
        ))
    return res

@router.post("/tick")
def tick_simulation(db: Session = Depends(get_db)):
    """
    Advance bus positions along real routes by one interval (PRD Phase 4).
    """
    return advance_simulation_step(db)

@router.get("/route-delays", response_model=List[RouteDelay])
def get_delays():
    """
    Retrieve route delay estimations comparing expected vs observed travel time (PRD FR-27).
    """
    return get_route_delays()
