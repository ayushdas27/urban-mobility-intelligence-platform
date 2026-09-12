import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db

# Initialize database schema and seeds for testing
init_db()

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OPERATIONAL"
    assert data["sih_problem_code"] == "26124"
    print("[PASS] test_root_endpoint")

def test_get_events():
    response = client.get("/api/events")
    assert response.status_code == 200
    events = response.json()
    assert len(events) >= 1
    first = events[0]
    assert "vehicle_id" in first
    assert "issue_type" in first
    assert "confidence" in first
    assert "latitude" in first
    assert "longitude" in first
    assert "assigned_department" in first
    print("[PASS] test_get_events")

def test_automated_department_assignment():
    payload = {
        "vehicle_id": "BUS-021",
        "issue_type": "Pothole",
        "confidence": 0.95,
        "latitude": 13.0800,
        "longitude": 80.2700,
        "severity": "HIGH",
        "details": "Major crater near Central railway terminal"
    }
    response = client.post("/api/events", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["assigned_department"] == "Road Maintenance Department"
    print("[PASS] test_automated_department_assignment")

def test_emergency_workflow_for_critical_incident():
    payload = {
        "vehicle_id": "BUS-008",
        "issue_type": "Critical Incident",
        "confidence": 0.98,
        "latitude": 13.0500,
        "longitude": 80.2800,
        "severity": "CRITICAL",
        "details": "High-impact collision with ambulance needed"
    }
    response = client.post("/api/events", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["assigned_department"] == "Emergency Medical Services & Hospital"
    assert data["emergency_dispatched"] is True
    print("[PASS] test_emergency_workflow_for_critical_incident")

def test_smart_deduplication_consolidation():
    response = client.get("/api/events/consolidated")
    assert response.status_code == 200
    clusters = response.json()
    assert isinstance(clusters, list)
    assert len(clusters) >= 1
    first_cluster = clusters[0]
    assert "priority_score" in first_cluster
    assert "reporting_vehicles" in first_cluster
    print("[PASS] test_smart_deduplication_consolidation")

def test_simulator_vehicles_and_delays():
    veh_response = client.get("/api/simulator/vehicles")
    assert veh_response.status_code == 200
    vehicles = veh_response.json()
    assert len(vehicles) >= 5

    delay_response = client.get("/api/simulator/route-delays")
    assert delay_response.status_code == 200
    delays = delay_response.json()
    assert len(delays) >= 1
    assert "expected_duration_min" in delays[0]
    assert "observed_duration_min" in delays[0]
    assert "delay_min" in delays[0]
    print("[PASS] test_simulator_vehicles_and_delays")

def test_analytics_summary():
    response = client.get("/api/analytics/summary")
    assert response.status_code == 200
    summary = response.json()
    assert summary["total_events"] > 0
    assert summary["active_buses"] >= 5
    assert "department_distribution" in summary
    print("[PASS] test_analytics_summary")

def test_ai_vision_presets():
    response = client.get("/api/ai/presets")
    assert response.status_code == 200
    presets = response.json()
    assert len(presets) >= 4
    print("[PASS] test_ai_vision_presets")

if __name__ == "__main__":
    print("\n--- RUNNING BACKEND INTEGRATION TESTS ---")
    test_root_endpoint()
    test_get_events()
    test_automated_department_assignment()
    test_emergency_workflow_for_critical_incident()
    test_smart_deduplication_consolidation()
    test_simulator_vehicles_and_delays()
    test_analytics_summary()
    test_ai_vision_presets()
    print("\n>>> ALL 8 BACKEND TESTS PASSED SUCCESSFULLY! <<<\n")
