@echo off
chcp 65001 >nul 2>&1
title D-HRS Backend Server
echo ============================================
echo  D-HRS Backend Server
echo  China-Compliant Blockchain HR System
echo ============================================
echo.

REM Check for .env file
if not exist "backend\.env" (
    echo [ERROR] backend\.env not found!
    echo Please copy backend\.env.example to backend\.env and configure it.
    pause
    exit /b 1
)

REM Start the backend server
echo Starting backend server on port 3001...
cd /d "%~dp0"
cd backend
node src/index.js

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Server exited with error code %ERRORLEVEL%
    pause
)