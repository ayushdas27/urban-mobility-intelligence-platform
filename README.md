# 🏛️ Urban Mobility & Civic Monitoring Platform
**Smart India Hackathon 2026 · Problem Statement #26124**  
*AI-Powered Fleet Sensing & Automated Municipal Directive Engine*

[![Streamlit App](https://static.streamlit.io/badges/streamlit_badge_black_white.svg)](https://share.streamlit.io/deploy?repository=ayushdas27/urban-mobility-intelligence-platform&branch=main&mainModule=streamlit_app.py)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?logo=github)](https://github.com/ayushdas27/urban-mobility-intelligence-platform)
[![SIH 2026](https://img.shields.io/badge/SIH-2026_PS_%2326124-blue)](https://sih.gov.in)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

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

## ☁️ 1-Click Cloud Deployment

You can deploy and run this platform on **Streamlit Community Cloud** with one click:

[![Deploy to Streamlit Cloud](https://static.streamlit.io/badges/streamlit_badge_black_white.svg)](https://share.streamlit.io/deploy?repository=ayushdas27/urban-mobility-intelligence-platform&branch=main&mainModule=streamlit_app.py)

1. Click the badge above (or open the [Deploy Link](https://share.streamlit.io/deploy?repository=ayushdas27/urban-mobility-intelligence-platform&branch=main&mainModule=streamlit_app.py)).
2. Sign in with your GitHub account (**ayushdas27**).
3. The repository, branch (main), and app file (streamlit_app.py) are pre-configured.
4. Click **Deploy!** to launch your live public URL.

---

## ⚡ Local Setup

### 1. Prerequisites
`ash
python --version  # Python 3.10+ recommended
pip install -r requirements.txt
`

### 2. Launch Streamlit Command Center
`ash
# Windows One-Click
run_app.bat

# Or Terminal Command
streamlit run streamlit_app.py --server.port 8501
`

Access the portal at http://localhost:8501.

---

## 🐳 Docker Deployment
`ash
docker build -t urban-mobility-platform .
docker run -p 8501:8501 urban-mobility-platform
`

---

## 👥 Team Details
- **Team**: Void Matrix
- **Problem Statement**: SIH 2026 #26124 / #26166
