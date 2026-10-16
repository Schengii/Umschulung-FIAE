@echo off
title Wohnungssuche KI - Installation
echo ==============================================
echo   Wohnungssuche KI - Paketinstallation
echo ==============================================
echo.

cd /d "%~dp0"
call npm run install-all
if errorlevel 1 (
    echo.
    echo [FEHLER] Die Installation ist fehlgeschlagen!
    pause
    exit /b 1
)

echo.
echo ==============================================
echo [OK] Alle Pakete wurden erfolgreich installiert.
echo ==============================================
echo.
pause
