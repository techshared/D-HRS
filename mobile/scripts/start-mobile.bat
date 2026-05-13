@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title D-HRS Mobile Launcher

set ADB=C:\Users\cstec\AppData\Local\Android\Sdk\platform-tools\adb.exe
set BACKEND_DIR=C:\Projects\AI\Decentralized\D-HRS\backend
set APK_DIR=C:\Projects\AI\Decentralized\D-HRS\mobile\android\app\build\outputs\apk\debug
set LOG_DIR=C:\Projects\AI\Decentralized\D-HRS\.logs
set APK_FILE=%APK_DIR%\app-debug.apk

if not exist %LOG_DIR% mkdir %LOG_DIR%

echo ============================================
echo   D-HRS Mobile - 一键启动
echo ============================================
echo.

:: ── Step 1: Kill any existing backend on port 3001 ──
echo [1/5] 清理端口 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001 " ^| findstr LISTENING') do (
    if not "%%a"=="" (
        taskkill /F /PID %%a >nul 2>&1 && echo   ✓ 已停止进程 PID %%a
    )
)
timeout /t 2 /nobreak >nul

:: ── Step 2: Start backend ──
echo [2/5] 启动后端服务...
start "D-HRS Backend" /B node "%BACKEND_DIR%\src\index.js" > "%LOG_DIR%\backend.log" 2>&1

:: Wait for backend to be ready
set BACKEND_READY=0
for /l %%i in (1,1,15) do (
    timeout /t 1 /nobreak >nul
    curl -s http://localhost:3001/api/v1/health >nul 2>&1
    if !errorlevel! equ 0 (
        set BACKEND_READY=1
        goto :backend_ok
    )
)
:backend_ok
if !BACKEND_READY! equ 1 (
    echo   ✓ 后端已启动 (http://localhost:3001)
) else (
    echo   ✗ 后端启动失败，检查 %LOG_DIR%\backend.log
    goto :error
)

:: ── Step 3: Check device connection ──
echo [3/5] 检查设备连接...
%ADB% get-state >nul 2>&1
if !errorlevel! neq 0 (
    echo   ✗ 未检测到设备，请连接 USB
    goto :error
)
for /f %%a in ('%ADB% shell getprop ro.product.model 2^>nul') do echo   ✓ 已连接: %%a

:: ── Step 4: ADB reverse proxy ──
echo [4/5] 设置 ADB 反向代理...
%ADB% reverse tcp:3001 tcp:3001 >nul 2>&1
if !errorlevel! equ 0 (
    echo   ✓ ADB reverse: device:3001 ^<-> host:3001
) else (
    echo   ⚠ ADB reverse 失败，尝试重新连接...
    %ADB% reverse --remove-all >nul 2>&1
    %ADB% reverse tcp:3001 tcp:3001 >nul 2>&1
)

:: ── Step 5: Install and launch ──
echo [5/5] 安装并启动 App...

:: Check if APK exists
if not exist "%APK_FILE%" (
    echo   ! 未找到 APK，请先构建: cd ..\android ^&^& gradlew.bat assembleDebug
    goto :error
)

:: Push APK to device
%ADB% push "%APK_FILE%" /data/local/tmp/app-release.apk >nul
if !errorlevel! neq 0 (
    echo   ✗ APK 推送失败
    goto :error
)

:: Session install (required for Flyme PRD firmware)
for /f "tokens=2 delims=[]" %%a in ('%ADB% shell pm install-create -r -t 2^>nul') do set SESSION_ID=%%a
if "!SESSION_ID!"=="" (
    echo   ✗ 安装会话创建失败
    goto :error
)

for /f %%s in ('%ADB% shell stat -c %%s /data/local/tmp/app-release.apk 2^>nul') do set APK_SIZE=%%s
%ADB% shell pm install-write -S !APK_SIZE! !SESSION_ID! base.apk /data/local/tmp/app-release.apk >nul
%ADB% shell pm install-commit !SESSION_ID! >nul
if !errorlevel! equ 0 (
    echo   ✓ App 安装成功
) else (
    echo   ✗ App 安装失败
    goto :error
)

:: Launch
%ADB% shell am force-stop com.dhrs.mobile >nul 2>&1
timeout /t 2 /nobreak >nul
%ADB% shell am start -n com.dhrs.mobile/.MainActivity >nul
echo   ✓ App 已启动

:: ── Done ──
echo.
echo ============================================
echo   ✅ D-HRS Mobile 启动完成!
echo ============================================
echo.
echo   后端日志: %LOG_DIR%\backend.log
echo   App 日志: adb logcat -s ReactNativeJS
echo.
echo   按任意键查看实时日志 (Ctrl+C 退出)
echo ============================================
pause >nul

echo.
echo 实时日志 (ReactNativeJS)...
%ADB% logcat -s ReactNativeJS

goto :eof

:error
echo.
echo ❌ 启动失败，请检查以上输出
pause
