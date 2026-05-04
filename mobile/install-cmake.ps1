$ErrorActionPreference = "Stop"
$sdkRoot = "$env:LOCALAPPDATA\Android\Sdk"
$sdkManager = "$sdkRoot\cmdline-tools\latest\bin\sdkmanager.bat"

# Accept all licenses first
echo "y" | & $sdkManager --licenses 2>&1 | Out-Null

# Install CMake 3.22.1 (required by React Native/Expo)
Write-Host "Installing CMake 3.22.1..."
& $sdkManager "cmake;3.22.1" 2>&1

# Verify installation
if (Test-Path "$sdkRoot\cmake\3.22.1") {
    Write-Host "CMake installed successfully at $sdkRoot\cmake\3.22.1"
    Get-ChildItem "$sdkRoot\cmake\3.22.1" | Select-Object Name
} else {
    Write-Host "CMake installation failed or path not found"
}
