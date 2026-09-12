@echo off
echo =========================================================================
echo  AI-POWERED MOBILE URBAN INTELLIGENCE PLATFORM (SIH 2026 - PS #26124)
echo =========================================================================
echo.
echo Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "Urban Intelligence Backend (FastAPI)" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting Vite Frontend on http://localhost:5173 ...
start "Urban Intelligence Frontend (Vite)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo =========================================================================
echo Services are launching in separate console windows!
echo - Command Center UI:  http://localhost:5173
echo - Backend API Docs:   http://127.0.0.1:8000/docs
echo =========================================================================
