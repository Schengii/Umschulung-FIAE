@echo off
pause

echo.
echo === Wohnungssuche KI - Installation ===
echo.

cd /d "%~dp0backend"
npm install
if errorlevel 1 (
    echo.
    echo FEHLER bei Backend!
    pause
    exit /b 1
)

cd /d "%~dp0frontend"
npm install
if errorlevel 1 (
    echo.
    echo FEHLER bei Frontend!
    pause
    exit /b 1
)

echo.
echo Fertig! Alle Pakete installiert.
pause

