# 🏛️ Urban Mobility & Civic Monitoring Platform
**Smart India Hackathon 2026 · Problem Statement #26124**  
*AI-Powered Fleet Sensing & Automated Municipal Directive Engine*

---

## 📌 Executive Overview
Transforming ordinary public transit buses into intelligent, mobile environmental and infrastructural sensor nodes. As buses traverse daily municipal routes, onboard edge AI detects road hazards, waterlogging, electrical hazards, traffic bottlenecks, and collision incidents in real time, automatically compiling formal statutory letters addressed to responsible civic authorities.

---

## 🚀 Key Features

- **🚌 Real-Time Public Fleet Tracking (GIS)**: Live interactive GIS corridor map monitoring transit fleets (e.g., Chennai MTC routes) and geo-tagged urban defects.
- **📍 Precise GPS Pinpointing**: Automated latitude and longitude recording for every physical infrastructure anomaly.
- **✉️ Automated Legal Letter Drafting**: Converts edge detections into official government administrative directives complete with statutory citations (*Section 197 Chennai City Municipal Corporation Act 1919*, *Disaster Management Act 2005*, *Central Electricity Authority Regulations 2023*).
- **🚨 Emergency Hospital Auto-Call Gateway**: For critical collisions and trauma incidents, computes distance and ETA to the nearest trauma hospital (e.g., RGGGH, Apollo Greams Rd, KMC) with a two-step user authorization protocol before initiating emergency ambulance dispatch.
- **🏢 Department Jurisdictions & SLAs**: Automated triaging into Road Maintenance, Traffic Police, Stormwater Drainage, Electricity (TANGEDCO), and Emergency Medical Care.
- **🧬 Spatial Deduplication**: Clustered corroboration across multiple buses to prevent redundant complaints (74.2% noise reduction).

---

## 🛠️ Tech Stack

- **Backend & Inference**: Python 3.11+, FastAPI, SQLAlchemy, SQLite
- **Dashboard & UI**: Streamlit (Executive Dark Command Center Theme)
- **Mapping & Spatial**: Folium, Leaflet, Haversine Geodesic Distance Engine
- **Edge Vision**: MobileNetV3 / YOLOv8 edge simulation pipeline

---

## ⚡ Quick Start

### 1. Prerequisites
`ash
python --version  # Python 3.10+ recommended
pip install -r backend/requirements.txt
pip install streamlit folium streamlit-folium
`

### 2. Launch Streamlit Command Center
`ash
# Windows One-Click
run_app.bat

# Or Manual Command
streamlit run streamlit_app.py --server.port 8501
`

Access the portal at http://localhost:8501.

---

## 👥 Team Details
- **Team**: Void Matrix
- **Problem Statement**: SIH 2026 #26124 / #26166
