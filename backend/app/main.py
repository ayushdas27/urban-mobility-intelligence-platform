import asyncio
import json
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db, SessionLocal
from app.routers import events, simulator, ai_vision, emergency, analytics, departments
from app.services.simulator import advance_simulation_step

# WebSocket active client connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

# Background task to gently tick the simulation and broadcast bus locations to web clients
async def simulation_background_loop():
    while True:
        try:
            await asyncio.sleep(4.0)
            db = SessionLocal()
            try:
                update_data = advance_simulation_step(db)
                if manager.active_connections:
                    await manager.broadcast({
                        "type": "FLEET_TELEMETRY_UPDATE",
                        "data": update_data
                    })
            finally:
                db.close()
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"[Simulation Worker] Tick warning: {e}")
            await asyncio.sleep(5.0)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database tables and seeds
    print("[Startup] Initializing database and tables...")
    init_db()
    print("[Startup] Starting live fleet simulation background worker...")
    sim_task = asyncio.create_task(simulation_background_loop())
    yield
    # Shutdown
    sim_task.cancel()
    try:
        await sim_task
    except asyncio.CancelledError:
        pass
    print("[Shutdown] Cleaned up background tasks.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Smart India Hackathon 2026 - Problem Statement 26124: AI-Powered Mobile Urban Intelligence Platform",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(events.router, prefix=settings.API_V1_STR)
app.include_router(simulator.router, prefix=settings.API_V1_STR)
app.include_router(ai_vision.router, prefix=settings.API_V1_STR)
app.include_router(emergency.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(departments.router, prefix=settings.API_V1_STR)

@app.get("/")
def root_endpoint():
    return {
        "platform": settings.PROJECT_NAME,
        "sih_problem_code": "26124",
        "status": "OPERATIONAL",
        "api_documentation": "/docs",
        "default_city": settings.DEFAULT_CITY,
        "endpoints": {
            "events": "/api/events",
            "simulator": "/api/simulator/vehicles",
            "ai_vision": "/api/ai/presets",
            "emergency": "/api/emergency/logs",
            "analytics": "/api/analytics/summary",
            "departments": "/api/departments"
        }
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": settings.PROJECT_NAME}

@app.websocket("/ws/telemetry")
async def websocket_telemetry_feed(websocket: WebSocket):
    """
    Live real-time WebSocket channel streaming bus GPS coordinates,
    speed, heading, and emergency broadcast alerts.
    """
    await manager.connect(websocket)
    try:
        while True:
            # Keepalive / handle client pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
