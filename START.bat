@echo off
setlocal

:: ============================================================
::  AD Report Hub - Start
::  Double-click or run from command prompt.
::  Press Ctrl+C in this window to stop.
:: ============================================================

cd /d "%~dp0"

echo.
echo ============================================================
echo    AD Report Hub - Starting
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
        echo         Try running as Administrator.
        echo.
        pause
        exit /b 1
    )
    echo.
)

:: Create logs folder if it doesn't exist
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
