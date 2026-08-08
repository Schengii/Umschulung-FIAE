Set WshShell = CreateObject("WScript.Shell")

' Absolute workspace directory of the script
strScriptPath = Replace(WScript.ScriptFullName, WScript.ScriptName, "")

' Start Backend silently (hidden cmd window)
WshShell.Run """C:\Program Files\nodejs\node.exe"" """ & strScriptPath & "backend\server.js""", 0, false

' Start Frontend silently (hidden cmd window)
WshShell.Run "cmd.exe /c ""cd /d """ & strScriptPath & "frontend"" && ""C:\Program Files\nodejs\npm.cmd"" run dev""", 0, false
