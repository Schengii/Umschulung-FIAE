Set WshShell = CreateObject("WScript.Shell")

' Get project root directory (two levels up from scripts\windows)
strScriptPath = Replace(WScript.ScriptFullName, WScript.ScriptName, "")
strRootDir = WshShell.CurrentDirectory
If InStr(strScriptPath, "\scripts\windows\") > 0 Then
  strRootDir = Left(strScriptPath, InStr(strScriptPath, "\scripts\windows\") - 1)
End If

' Start Backend silently
WshShell.Run "cmd.exe /c ""cd /d """ & strRootDir & "\backend"" && node server.js""", 0, false

' Start Frontend silently
WshShell.Run "cmd.exe /c ""cd /d """ & strRootDir & "\frontend"" && npm run dev""", 0, false
