@echo off
echo === Starte Backend (Port 5000) ===
start "Wohnungs KI Backend" cmd /k "pushd "%~dp0backend" && "C:\Program Files\nodejs\node.exe" server.js"

echo === Starte Frontend (Port 5222) ===
start "Wohnungs KI Frontend" cmd /k "pushd "%~dp0frontend" && "C:\Program Files\nodejs\npm.cmd" run dev"

echo.
echo Beide Server wurden in separaten Fenstern gestartet.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5222
