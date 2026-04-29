@echo off
setlocal

:: ============================================================
::  AD Report Hub - Start as Administrator
::  Self-elevates if not already running with admin privileges.
:: ============================================================

:: Check if already elevated
net session >nul 2>&1
if not errorlevel 1 goto :run

:: Not elevated - re-launch this script with RunAs
:: Passes the full quoted path so spaces in the path are handled correctly
echo [INFO] Requesting Administrator privileges...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Start-Process -FilePath 'cmd.exe' -Verb RunAs -ArgumentList ('/c \"' + '%~dpnx0' + '\"')"
exit /b

:run
cd /d "%~dp0"

echo.
echo ============================================================
echo    AD Report Hub - Starting (Administrator)
echo ============================================================
echo.

:: Check Node.js
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo         Download from https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: Auto-install dependencies if missing
if not exist "node_modules" (
    echo [INFO] First run detected - installing dependencies...
    echo        This may take a few minutes.
    echo.
    call npm install
    if errorlevel 1 (
        echo [ERROR] Dependency install failed.
        echo.
        pause
        exit /b 1
    )
    echo.
)

if not exist "logs" mkdir logs

echo  Frontend : http://localhost:3000
echo  Backend  : http://localhost:5000
echo  User     : %USERNAME%@%USERDOMAIN%
echo.
echo  Press Ctrl+C to stop both servers.
echo.
echo ============================================================
echo.

call npm start

echo.
echo [INFO] Application stopped.
pause
endlocal
