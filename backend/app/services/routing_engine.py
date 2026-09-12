from app.config import settings

def assign_department(issue_type: str, severity: str) -> dict:
    """
    Automated Department Assignment Engine (PRD FR-14 & Section 8).
    Evaluates issue type and severity to route each incident to the appropriate municipal,
    police, or emergency agency, and selects emergency escalation contacts.
    """
    issue_type_lower = issue_type.lower()
    
    # 1. Critical Emergency / Road Collision / Medical Incident
    if any(k in issue_type_lower for k in ["critical", "accident", "collision", "medical", "injury"]):
        return {
            "department": "Emergency Medical Services & Hospital",
            "emergency_contact": settings.EMERGENCY_HOSPITAL_PHONE,
            "emergency_agency": settings.EMERGENCY_HOSPITAL_NAME,
            "requires_emergency_dispatch": True,
            "routing_reason": "High-severity collision or medical emergency requiring ambulance and hospital trauma care."
        }
        
    # 2. Electricity-Related Hazards
    if any(k in issue_type_lower for k in ["electric", "wire", "cable", "pole", "transformer"]):
        return {
            "department": "Electricity Board (TANGEDCO)",
            "emergency_contact": settings.EMERGENCY_ELECTRICITY_PHONE,
            "emergency_agency": settings.EMERGENCY_ELECTRICITY_NAME,
            "requires_emergency_dispatch": (severity in ["HIGH", "CRITICAL"]),
            "routing_reason": "Electrical infrastructure hazard requiring urgent isolation by electricity department."
        }
        
    # 3. Waterlogging / Drainage Deficiencies
    if any(k in issue_type_lower for k in ["water", "flood", "drain", "drainage"]):
        return {
            "department": "Municipal Drainage & Flood Control",
            "emergency_contact": None,
            "emergency_agency": "Greater Chennai Corporation Stormwater Drainage Wing",
            "requires_emergency_dispatch": (severity == "CRITICAL"),
            "routing_reason": "Standing water or submerged road segment requiring stormwater pump deployment."
        }
        
    # 4. Traffic Congestion & Obstructions
    if any(k in issue_type_lower for k in ["traffic", "congestion", "bottleneck", "jam"]):
        return {
            "department": "Traffic Police Department",
            "emergency_contact": settings.EMERGENCY_POLICE_PHONE if severity in ["HIGH", "CRITICAL"] else None,
            "emergency_agency": settings.EMERGENCY_POLICE_NAME,
            "requires_emergency_dispatch": False,
            "routing_reason": "Traffic flow bottleneck requiring traffic signal regulation and ward patrol."
        }
        
    # 5. Potholes, Cracks, Damaged Pavement, Missing Signs
    if any(k in issue_type_lower for k in ["pothole", "damage", "crack", "asphalt", "sign", "marking"]):
        return {
            "department": "Road Maintenance Department",
            "emergency_contact": None,
            "emergency_agency": "Highways & Municipal Road Maintenance Wing",
            "requires_emergency_dispatch": False,
            "routing_reason": "Road structural defect requiring asphalt patching and civil maintenance."
        }

    # Default fallback
    return {
        "department": "General Municipal Administration",
        "emergency_contact": None,
        "emergency_agency": "City Civic Control Center",
        "requires_emergency_dispatch": False,
        "routing_reason": "General civic issue routed to municipal monitoring."
    }
