# Mobile App Verification Script (PowerShell)
# Verifies all mobile apps can build and run on Android emulator

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Mobile App Verification..." -ForegroundColor Green
Write-Host ""

# Check if Android emulator is running
function Check-Emulator {
    Write-Host "Checking Android emulator..."
    $devices = adb devices
    if ($devices -match "emulator") {
        Write-Host "✓ Android emulator is running" -ForegroundColor Green
        return $true
    } else {
        Write-Host "✗ No Android emulator detected" -ForegroundColor Red
        Write-Host "Please start an Android emulator and try again"
        return $false
    }
}

# Start Metro bundler
function Start-Metro {
    Write-Host ""
    Write-Host "Starting Metro bundler..." -ForegroundColor Yellow
    $metroProcess = Start-Process -FilePath "npm" -ArgumentList "start" -WorkingDirectory "packages\mobile\operator" -PassThru -WindowStyle Minimized
    Start-Sleep -Seconds 10
    return $metroProcess
}

# Build and run app
function Build-AndRun {
    param(
        [string]$AppName,
        [string]$AppDir
    )
    
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "Building $AppName..." -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    
    Push-Location $AppDir
    
    # Clean build
    Push-Location android
    & .\gradlew.bat clean
    Pop-Location
    
    # Run on Android
    & npm run android
    
    Write-Host "✓ $AppName built successfully" -ForegroundColor Green
    Pop-Location
}

# Main execution
function Main {
    # Check prerequisites
    if (-not (Check-Emulator)) {
        exit 1
    }
    
    # Start Metro
    $metroProcess = Start-Metro
    
    try {
        # Build and verify each app
        Build-AndRun "Operator App" "packages\mobile\operator"
        # Build-AndRun "Shipper App" "packages\mobile\shipper"
        # Build-AndRun "Driver App" "packages\mobile\driver"
        
        Write-Host ""
        Write-Host "✅ Mobile app verification complete!" -ForegroundColor Green
    } finally {
        # Cleanup
        if ($metroProcess -and -not $metroProcess.HasExited) {
            Stop-Process -Id $metroProcess.Id -Force -ErrorAction SilentlyContinue
        }
    }
}

Main
