@echo off
echo =======================================================
echo Wohnungssuche KI - ADB Port Forwarding fuer Smartphone
echo =======================================================
echo.
echo Dieses Skript richtet die Portweiterleitung ueber USB ein.
echo Stellen Sie sicher, dass Ihr Android-Smartphone angeschlossen ist
echo und USB-Debugging in den Entwickleroptionen aktiviert ist.
echo.
echo Suche nach angeschlossenen ADB-Geraeten...
adb devices
echo.
echo Leite Port 5222 (Frontend) weiter...
adb reverse tcp:5222 tcp:5222
echo Leite Port 5000 (Backend) weiter...
adb reverse tcp:5000 tcp:5000
echo.
echo =======================================================
echo Portweiterleitung aktiv!
echo Sie koennen die Anwendung jetzt auf Ihrem Smartphone unter:
echo http://localhost:5222 oeffnen.
echo.
echo Druecken Sie eine beliebige Taste, um dieses Fenster zu schliessen.
pause > nul
