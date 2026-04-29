@echo off
setlocal

:: ============================================================
::  AD Report Hub - Stop
::  Kills all processes on ports 3000 and 5000 and frees them.
:: ============================================================

cd /d "%~dp0"

echo.
echo ============================================================
echo    AD Report Hub - Stopping
echo ============================================================
echo.

:: Use PowerShell for reliable port-based process lookup
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ports = @(3000, 5000); " ^
  "foreach ($port in $ports) { " ^
  "  $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue; " ^
  "  if ($conn) { " ^
  "    $pid = $conn.OwningProcess; " ^
  "    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue; " ^
  "    Write-Host \"[OK]   Port $port released (PID $pid)\" " ^
  "  } else { " ^
  "    Write-Host \"[INFO] Port $port was not in use\" " ^
  "  } " ^
  "}"

echo.
echo [OK] Done.
echo.
pause
endlocal
