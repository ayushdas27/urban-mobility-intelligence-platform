import datetime
import random
from typing import List, Dict
from sqlalchemy.orm import Session
from app.models import VehicleModel, EventModel
from app.schemas import VehicleStatus, RouteDelay
from app.services.routing_engine import assign_department
from app.services.emergency_service import trigger_emergency_dispatch
from app.services.deduplication import find_spatial_cluster

# Realistic bus routes in Chennai with coordinate waypoints
BUS_ROUTES = {
    "BUS-001": {
        "route_name": "Route 18A (Broadway - Tambaram via Mount Road)",
        "expected_duration_min": 50,
        "observed_duration_min": 68,
        "waypoints": [
            (13.0836, 80.2825),  # Central / Broadway
            (13.0718, 80.2642),  # Thousand Lights
            (13.0560, 80.2480),  # Gemini Flyover
            (13.0478, 80.2090),  # Saidapet
            (13.0102, 80.2158),  # Guindy
            (12.9815, 80.1990),  # Meenambakkam Airport
            (12.9249, 80.1190)   # Tambaram
        ],
        "current_idx": 3,
        "direction": 1
    },
    "BUS-008": {
        "route_name": "Route 21G (Broadway - Vandalur Zoo via Marina)",
        "expected_duration_min": 42,
        "observed_duration_min": 61,
        "waypoints": [
            (13.0836, 80.2825),  # Broadway
            (13.0620, 80.2850),  # Marina Beach / Presidency
            (13.0520, 80.2820),  # Santhome
            (13.0280, 80.2720),  # Adyar
            (12.9800, 80.2400),  # Thiruvanmiyur
            (12.9300, 80.1800),  # Medavakkam
            (12.8900, 80.1400)   # Vandalur
        ],
        "current_idx": 2,
        "direction": 1
    },
    "BUS-015": {
        "route_name": "Route 570 (Koyambedu - Siruseri via OMR IT Corridor)",
        "expected_duration_min": 65,
        "observed_duration_min": 79,
        "waypoints": [
            (13.0694, 80.1948),  # CMBT Koyambedu
            (13.0200, 80.2200),  # Guindy Industrial
            (12.9820, 80.2430),  # Tidel Park (OMR Start)
            (12.9719, 80.2464),  # Thoraipakkam
            (12.9010, 80.2275),  # Sholinganallur
            (12.8350, 80.2220),  # Siruseri SIPCOT
        ],
        "current_idx": 3,
        "direction": 1
    },
    "BUS-021": {
        "route_name": "Route 29C (Perambur - Besant Nagar via T.Nagar)",
        "expected_duration_min": 45,
        "observed_duration_min": 52,
        "waypoints": [
            (13.1110, 80.2420),  # Perambur
            (13.0800, 80.2300),  # Kilpauk
            (13.0418, 80.2341),  # Panagal Park T.Nagar
            (13.0250, 80.2500),  # Nandanam
            (13.0001, 80.2667)   # Besant Nagar Beach
        ],
        "current_idx": 2,
        "direction": 1
    },
    "BUS-034": {
        "route_name": "Route 47D (Avadi - T.Nagar via Poonamallee High Rd)",
        "expected_duration_min": 55,
        "observed_duration_min": 70,
        "waypoints": [
            (13.1150, 80.1000),  # Avadi
            (13.0890, 80.1600),  # Koyambedu junction
            (13.0784, 80.2056),  # Poonamallee High Rd / Aminjikarai
            (13.0550, 80.2250),  # Kodambakkam
            (13.0418, 80.2341)   # T.Nagar
        ],
        "current_idx": 2,
        "direction": 1
    }
}

def advance_simulation_step(db: Session) -> Dict:
    """
    Advances all simulated buses by one waypoint interval, adjusts speed and heading,
    and returns updated fleet positions and route telemetry.
    """
    now_iso = datetime.datetime.now().isoformat()
    updated_vehicles = []

    for vehicle_id, route_data in BUS_ROUTES.items():
        waypoints = route_data["waypoints"]
        curr_idx = route_data["current_idx"]
        direction = route_data["direction"]

        # Move to next waypoint or ping-pong
        next_idx = curr_idx + direction
        if next_idx >= len(waypoints):
            next_idx = len(waypoints) - 2
            route_data["direction"] = -1
        elif next_idx < 0:
            next_idx = 1
            route_data["direction"] = 1

        route_data["current_idx"] = next_idx
        lat, lon = waypoints[next_idx]

        # Add tiny jitter so buses look lively on the map
        lat += random.uniform(-0.0005, 0.0005)
        lon += random.uniform(-0.0005, 0.0005)
        speed = round(random.uniform(22.0, 48.0), 1)
        heading = random.uniform(0, 360)

        # Update in DB
        veh = db.query(VehicleModel).filter(VehicleModel.vehicle_id == vehicle_id).first()
        if veh:
            veh.latitude = lat
            veh.longitude = lon
            veh.speed_kmh = speed
            veh.heading = heading
            veh.last_updated = now_iso
        else:
            veh = VehicleModel(
                vehicle_id=vehicle_id,
                route_name=route_data["route_name"],
                latitude=lat,
                longitude=lon,
                speed_kmh=speed,
                heading=heading,
                status="ACTIVE",
                last_updated=now_iso
            )
            db.add(veh)

        # Count active issues near vehicle
        active_issues = db.query(EventModel).filter(
            EventModel.vehicle_id == vehicle_id
        ).count()

        updated_vehicles.append({
            "vehicle_id": vehicle_id,
            "route_name": route_data["route_name"],
            "latitude": round(lat, 5),
            "longitude": round(lon, 5),
            "speed_kmh": speed,
            "heading": round(heading, 1),
            "status": "ACTIVE",
            "active_issues_count": active_issues,
            "last_updated": now_iso
        })

    db.commit()
    return {
        "timestamp": now_iso,
        "vehicles": updated_vehicles
    }

def get_route_delays() -> List[RouteDelay]:
    """
    Computes Route Delay Estimation (PRD FR-27).
    Compares expected travel time vs observed travel time and identifies bottlenecks.
    """
    results = []
    for v_id, data in BUS_ROUTES.items():
        expected = data["expected_duration_min"]
        observed = data["observed_duration_min"]
        delay = observed - expected
        congestion = "HIGH" if delay >= 15 else "MEDIUM" if delay >= 7 else "LOW"

        results.append(RouteDelay(
            route_id=v_id,
            route_name=data["route_name"],
            expected_duration_min=expected,
            observed_duration_min=observed,
            delay_min=delay,
            congestion_level=congestion,
            reporting_vehicles=[v_id]
        ))
    return results
