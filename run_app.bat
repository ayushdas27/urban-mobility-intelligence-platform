@echo off
echo =========================================================================
echo  URBAN MOBILITY & CIVIC MONITORING PORTAL (SIH 2026 - PS #26124)
echo  Command Center & Municipal Notice Portal (Dark Theme)
echo =========================================================================
echo.
echo Starting Streamlit Portal on http://localhost:8501 ...
cd /d %~dp0
python -m streamlit run streamlit_app.py --server.port 8501 --server.headless false
pause
