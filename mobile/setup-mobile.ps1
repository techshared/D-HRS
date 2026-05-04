$ErrorActionPreference = "Stop"
$projectRoot = "C:\Projects\AI\Decentralized\D-HRS\mobile"

# ============================================
# 1. Install CMake via Android SDK Manager
# ============================================
$sdkRoot = "$env:LOCALAPPDATA\Android\Sdk"
$sdkManager = "$sdkRoot\cmdline-tools\latest\bin\sdkmanager.bat"

Write-Host "`n=== Installing CMake 3.22.1 ===" -ForegroundColor Cyan
echo "y" | & $sdkManager --licenses 2>&1 | Out-Null
& $sdkManager "cmake;3.22.1" 2>&1

if (Test-Path "$sdkRoot\cmake\3.22.1") {
    Write-Host "CMake installed successfully" -ForegroundColor Green
} else {
    Write-Host "CMake installation failed - install manually via Android Studio SDK Manager" -ForegroundColor Yellow
}

# ============================================
# 2. Install wagmi v2 + viem v2 dependencies
# ============================================
Write-Host "`n=== Installing wagmi v2 dependencies ===" -ForegroundColor Cyan
Set-Location $projectRoot
npm install 2>&1

# ============================================
# 3. Rebuild the app
# ============================================
Write-Host "`n=== Starting web build ===" -ForegroundColor Cyan
npx expo start --web --port 8082 2>&1
