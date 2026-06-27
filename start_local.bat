@echo off
echo Starting Lakshmi Steels AI Local Development...

:: Start the Python backend in a new command window
echo Starting Backend (FastAPI)...
start "Backend (FastAPI)" cmd /k "cd api && run.bat"

:: Start the Next.js frontend in a new command window
echo Starting Frontend (Next.js)...
start "Frontend (Next.js)" cmd /k "run.bat"

echo.
echo Both servers are starting in separate windows.
echo Frontend will be available at http://localhost:3000
pause
