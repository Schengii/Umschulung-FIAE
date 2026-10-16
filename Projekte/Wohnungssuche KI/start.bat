@echo off
title Wohnungssuche KI - Starter
echo ==============================================
echo   Wohnungssuche KI - Startet Services
echo ==============================================
echo.

echo [1/2] Starte Backend Server (Port 5000)...
start "Wohnungssuche KI Backend" cmd /k "cd /d "%~dp0backend" && node server.js"

echo [2/2] Starte Frontend Vite Server (Port 5222)...
start "Wohnungssuche KI Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ==============================================
echo [OK] Beide Dienste wurden gestartet:
echo   - Backend API:  http://localhost:5000
echo   - Frontend Web: http://localhost:5222
echo ==============================================
echo.
