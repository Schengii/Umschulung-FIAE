@echo off
title Wohnungs-KI Autostart Einrichtung
echo ==============================================
echo   Wohnungs-KI Autostart Einrichtung
echo ==============================================
echo.
echo Dieses Skript richtet einen automatischen, unsichtbaren
echo Start der Wohnungs-KI beim Windows-Systemstart ein.
echo.

set SCRIPT_PATH=%~dp0start-silent.vbs
set STARTUP_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup

powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%STARTUP_DIR%\WohnungsKI.lnk'); $Shortcut.TargetPath = '%SCRIPT_PATH%'; $Shortcut.Save()"

echo.
echo [OK] Verknuepfung im Windows-Autostart-Ordner erstellt.
echo Die Wohnungs-KI startet ab jetzt automatisch und unsichtbar
echo beim Booten deines PCs.
echo.
pause
