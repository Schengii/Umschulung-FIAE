@echo off
title Wohnungs-KI Beenden
echo ==============================================
echo   Beende alle Wohnungs-KI Hintergrunddienste
echo ==============================================
echo.

taskkill /F /IM node.exe

echo.
echo [OK] Alle Node.js und Wohnungs-KI Prozesse wurden beendet.
echo.
pause
