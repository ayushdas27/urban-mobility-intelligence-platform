import os

class Settings:
    PROJECT_NAME: str = "AI-Powered Mobile Urban Intelligence Platform"
    API_V1_STR: str = "/api"
    
    # Storage settings: MongoDB or SQLite fallback
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    MONGODB_URI: str = os.getenv("MONGODB_URI", "")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "urban_intelligence_db")
    SQLITE_URL: str = f"sqlite:///{os.path.join(BASE_DIR, 'urban_intelligence.db').replace('\\', '/')}"
    
    # Default city configuration (Chennai, Tamil Nadu per PRD Section 23)
    DEFAULT_CITY: str = "Chennai"
    DEFAULT_LATITUDE: float = 13.0827
    DEFAULT_LONGITUDE: float = 80.2707
    
    # Deduplication radius in meters (PRD Section 18)
    DEDUPLICATION_RADIUS_METERS: float = 60.0
    
    # Emergency communication toggle
    ENABLE_REAL_COMMUNICATION: bool = False
    
    # Default emergency contacts
    EMERGENCY_HOSPITAL_PHONE: str = "+91-44-2530-5000"  # Rajiv Gandhi Govt General Hospital, Chennai
    EMERGENCY_HOSPITAL_NAME: str = "Rajiv Gandhi Govt General Hospital / Emergency Center"
    EMERGENCY_ELECTRICITY_PHONE: str = "+91-94458-50811"  # TANGEDCO Central Emergency
    EMERGENCY_ELECTRICITY_NAME: str = "TANGEDCO Electricity Board Emergency Dispatch"
    EMERGENCY_POLICE_PHONE: str = "103"  # Chennai Traffic Police Control Room
    EMERGENCY_POLICE_NAME: str = "Chennai City Traffic Police Central Control Room"

settings = Settings()
