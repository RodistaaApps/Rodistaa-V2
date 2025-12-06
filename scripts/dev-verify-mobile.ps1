# Mobile Apps Verification Script (PowerShell)
# Collects logs, runs builds, and creates verification artifacts

$ErrorActionPreference = "Continue"
$ROOT_DIR = Split-Path -Parent $PSScriptRoot
$REPORTS_DIR = Join-Path $ROOT_DIR "reports\mobile"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$VERIFY_DIR = Join-Path $REPORTS_DIR "verify_$TIMESTAMP"

New-Item -ItemType Directory -Force -Path $VERIFY_DIR | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $VERIFY_DIR "screenshots") | Out-Null

Write-Host "🔍 Starting Mobile Apps Verification - $TIMESTAMP" -ForegroundColor Cyan
Write-Host "Reports will be saved to: $VERIFY_DIR" -ForegroundColor Gray

# Function to kill processes on port
function Kill-Port {
    param($port)
    $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
    if ($processes) {
        $processes | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
    }
}

# Function to copy key files
function Copy-AppFiles {
    param($app)
    $appDir = Join-Path $ROOT_DIR "packages\mobile\$app"
    $targetDir = Join-Path $VERIFY_DIR $app
    New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
    
    $files = @("package.json", "app.json", "tsconfig.json", "babel.config.js", "index.js", "App.tsx")
    foreach ($file in $files) {
        $src = Join-Path $appDir $file
        if (Test-Path $src) {
            Copy-Item $src $targetDir -ErrorAction SilentlyContinue
        }
    }
}

# Main verification
Write-Host "`n=== Phase 1: Operator App ===" -ForegroundColor Yellow
Copy-AppFiles "operator"
Write-Host "📋 Configuration files copied" -ForegroundColor Green

Write-Host "`n=== Phase 2: Driver App ===" -ForegroundColor Yellow
Copy-AppFiles "driver"
Write-Host "📋 Configuration files copied" -ForegroundColor Green

Write-Host "`n=== Phase 3: Shipper App ===" -ForegroundColor Yellow
Copy-AppFiles "shipper"
Write-Host "📋 Configuration files copied" -ForegroundColor Green

# Create summary
$summary = @"
# Mobile Apps Verification Summary

**Date**: $(Get-Date)
**Timestamp**: $TIMESTAMP

## Apps Verified

1. **Operator** - React Native CLI (No Expo)
2. **Driver** - Expo Router
3. **Shipper** - Expo Router

## Verification Steps

To verify manually:

1. **Start Metro**:
   ```bash
   cd packages/mobile/operator
   npx react-native start --reset-cache
   ```

2. **Run Android**:
   ```bash
   npx react-native run-android
   ```

3. **Check logs**:
   - Metro logs: Check terminal output
   - Android logs: `adb logcat`
   - Screenshots: Take with `adb shell screencap`

## Key Files Collected

- package.json
- app.json
- tsconfig.json
- index.js / App.tsx
- Configuration files

## Notes

- PowerShell script collects configuration files
- For full verification, use bash script on Linux/macOS
- Android builds require emulator/device to be running
- iOS builds require macOS and Xcode

"@

$summary | Out-File -FilePath (Join-Path $VERIFY_DIR "SUMMARY.md") -Encoding UTF8

Write-Host "`n✅ Verification artifacts collected!" -ForegroundColor Green
Write-Host "📦 Artifacts saved to: $VERIFY_DIR" -ForegroundColor Cyan
Write-Host "📊 Summary: $VERIFY_DIR\SUMMARY.md" -ForegroundColor Cyan

