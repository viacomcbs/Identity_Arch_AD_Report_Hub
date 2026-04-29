@echo off
setlocal

:: ============================================================
::  AD Report Hub - Graceful Stop
::  Stops all processes and frees ports 3000 and 5000.
:: ============================================================

cd /d "%~dp0"

echo.
echo ============================================================
echo    AD Report Hub - Stopping...
echo ============================================================
echo.

:: ── Try PM2 first ────────────────────────────────────────────
where pm2 >nul 2>&1
if %errorLevel% == 0 (
    pm2 describe ad-report-hub >nul 2>&1
    if %errorLevel% == 0 (
        echo [INFO] Stopping PM2 process...
        call pm2 stop ad-report-hub
        echo [OK]   PM2 process stopped.
        goto :ports
    )
)

:: ── Fall back: kill node processes on the target ports ───────
echo [INFO] Releasing port 5000...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":5000 " ^| findstr "LISTENING"') do (
    taskkill /PID %%p /F >nul 2>&1
    echo [OK]   Killed PID %%p on port 5000.
)

:ports
echo [INFO] Releasing port 3000 (dev server)...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":3000 " ^| findstr "LISTENING"') do (
    taskkill /PID %%p /F >nul 2>&1
    echo [OK]   Killed PID %%p on port 3000.
)

echo.
echo [OK] AD Report Hub stopped. Ports 3000 and 5000 are free.
echo.

endlocal
