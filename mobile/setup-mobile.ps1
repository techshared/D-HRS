$ErrorActionPreference = "Continue"
$projectRoot = "C:\Projects\AI\Decentralized\D-HRS\mobile"

# ============================================
# 1. Check/Install CMake via Android SDK Manager
# ============================================
$sdkRoot = "$env:LOCALAPPDATA\Android\Sdk"
$sdkManager = "$sdkRoot\cmdline-tools\latest\bin\sdkmanager.bat"

Write-Host "`n=== Checking CMake installation ===" -ForegroundColor Cyan
if (Test-Path "$sdkRoot\cmake\3.22.1") {
    Write-Host "CMake 3.22.1 already installed" -ForegroundColor Green
} else {
    Write-Host "Installing CMake 3.22.1..." -ForegroundColor Yellow
    echo "y" | & $sdkManager --licenses 2>&1 | Out-Null
    & $sdkManager "cmake;3.22.1" 2>&1
    
    if (Test-Path "$sdkRoot\cmake\3.22.1") {
        Write-Host "CMake installed successfully" -ForegroundColor Green
    } else {
        Write-Host "WARNING: CMake not found. Install via Android Studio SDK Manager" -ForegroundColor Yellow
    }
}

# ============================================
# 2. Install wagmi v2 + viem v2 dependencies (Chinese mirror)
# ============================================
Write-Host "`n=== Installing wagmi v2 dependencies ===" -ForegroundColor Cyan
Set-Location $projectRoot

# Use taobao mirror for faster downloads in China
$env:NPM_CONFIG_REGISTRY = "https://registry.npmmirror.com"

Write-Host "Using npm mirror: $env:NPM_CONFIG_REGISTRY" -ForegroundColor Gray
npm install --verbose 2>&1 | ForEach-Object { 
    Write-Host $_ -ForegroundColor DarkGray
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nFailed to install dependencies. Trying without mirror..." -ForegroundColor Yellow
    Remove-Item env:NPM_CONFIG_REGISTRY
    npm install 2>&1
}

# ============================================
# 3. Start the web build
# ============================================
Write-Host "`n=== Starting web build ===" -ForegroundColor Cyan
npx expo start --web --port 8082 2>&1
