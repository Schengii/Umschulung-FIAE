@echo off
title Wohnungssuche KI - Dienste Beenden
echo ==============================================
echo   Beende Wohnungssuche KI Hintergrunddienste
echo ==============================================
echo.

echo Beende Prozesse auf Port 5000 (Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Beende Prozesse auf Port 5222 (Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5222" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo ==============================================
echo [OK] Hintergrunddienste auf Ports 5000 und 5222 beendet.
echo ==============================================
echo.
pause
