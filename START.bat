@echo off
setlocal EnableDelayedExpansion

:: ============================================================
::  AD Report Hub - Smart Launcher
::  Usage:
::    START.bat          -> production mode (PM2 if available)
::    START.bat dev      -> development mode (hot-reload)
::    START.bat setup    -> first-time PM2 install + setup
:: ============================================================

cd /d "%~dp0"

:: ── Prerequisite: Node.js ────────────────────────────────────
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo         Download from https://nodejs.org
    pause & exit /b 1
)

:: ── Prerequisite: node_modules ───────────────────────────────
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    call npm install
    if %errorLevel% neq 0 (
        echo [ERROR] npm install failed.
        pause & exit /b 1
    )
)

:: ── Ensure logs folder exists ────────────────────────────────
if not exist "logs" mkdir logs

:: ── Route by argument ────────────────────────────────────────
if /i "%~1"=="dev"   goto :dev
if /i "%~1"=="setup" goto :setup

:: ── Production mode (default) ────────────────────────────────
:prod
where pm2 >nul 2>&1
if %errorLevel% neq 0 (
    echo [WARN] PM2 not found. Falling back to direct Node launch.
    echo        Run  START.bat setup  to install PM2 for full process management.
    echo.
    goto :direct
)

echo.
echo ============================================================
echo    AD Report Hub - Production Mode (PM2)
echo ============================================================
echo.

:: Check if already running under PM2
pm2 describe ad-report-hub >nul 2>&1
if %errorLevel% == 0 (
    echo [INFO] Process already managed by PM2 - reloading...
    call pm2 reload ad-report-hub
) else (
    echo [INFO] Building React app...
    call npm run build
    if %errorLevel% neq 0 (
        echo [ERROR] React build failed.
        pause & exit /b 1
    )
    echo [INFO] Starting via PM2...
    call pm2 start ecosystem.config.js --env production
    call pm2 save
)

echo.
echo  App:  http://localhost:5000
echo  Logs: npm run pm2:logs
echo  Stop: STOP.bat
echo.
goto :end

:: ── Direct Node launch (no PM2) ──────────────────────────────
:direct
echo.
echo ============================================================
echo    AD Report Hub - Production Mode (Direct Node)
echo ============================================================
echo.
echo [INFO] Building React app...
call npm run build
if %errorLevel% neq 0 (
    echo [ERROR] React build failed.
    pause & exit /b 1
)
echo.
echo  App:  http://localhost:5000
echo  Press Ctrl+C to stop.
echo.
call npm run start:prod
goto :end

:: ── Development mode ─────────────────────────────────────────
:dev
echo.
echo ============================================================
echo    AD Report Hub - Development Mode
echo ============================================================
echo.
echo  Frontend: http://localhost:3000  (hot-reload)
echo  Backend:  http://localhost:5000
echo  Press Ctrl+C to stop BOTH servers.
echo.
call npm start
goto :end

:: ── First-time setup ─────────────────────────────────────────
:setup
echo.
echo ============================================================
echo    AD Report Hub - First-Time Setup
echo ============================================================
echo.

:: Install PM2 globally
where pm2 >nul 2>&1
if %errorLevel% neq 0 (
    echo [INFO] Installing PM2 globally...
    call npm install -g pm2
    if %errorLevel% neq 0 (
        echo [ERROR] PM2 install failed. Check npm permissions.
        pause & exit /b 1
    )
)

:: Install cross-env (needed for start:prod script)
echo [INFO] Ensuring cross-env is available...
call npm install --save-dev cross-env >nul 2>&1

:: Register PM2 as a Windows startup service
echo [INFO] Registering PM2 as a Windows startup service...
call pm2 startup
call pm2 save

echo.
echo [OK] Setup complete. Run  START.bat  to launch in production mode.
echo.

:end
endlocal
