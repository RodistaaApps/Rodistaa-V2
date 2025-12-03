# Rodistaa - Complete Testing Script
# Runs: Flow tests → Stress tests → Analysis

param(
    [switch]$SkipFlow,
    [switch]$SkipStress,
    [switch]$Quick,
    [string]$Target = "http://localhost:4000/v1"
)

$ErrorActionPreference = "Continue"

Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host "     RODISTAA COMPLETE TESTING SUITE" -ForegroundColor Yellow
Write-Host "================================================================`n" -ForegroundColor Cyan

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check if backend is running
try {
    $response = Invoke-WebRequest -Uri "$Target/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Backend is running at $Target" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Backend is not running at $Target" -ForegroundColor Red
    Write-Host "  Start backend with: cd packages/backend; pnpm dev" -ForegroundColor Yellow
    exit 1
}

# Check if k6 is installed
try {
    $k6Version = k6 version 2>$null
    if ($k6Version) {
        Write-Host "✓ K6 is installed" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ K6 is not installed" -ForegroundColor Red
    Write-Host "  Install with: choco install k6" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Create results directory
$resultsDir = "test-results"
if (!(Test-Path $resultsDir)) {
    New-Item -ItemType Directory -Path $resultsDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

# ============================================
# STEP 1: Integration Flow Tests
# ============================================
if (!$SkipFlow) {
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "STEP 1: COMPLETE BOOKING FLOW TEST" -ForegroundColor Yellow
    Write-Host "================================================================`n" -ForegroundColor Cyan
    
    Write-Host "Running integration tests..." -ForegroundColor Yellow
    
    cd packages/backend
    $env:API_BASE_URL = $Target
    $env:NODE_ENV = "test"
    
    # Run Jest integration tests
    npx jest tests/integration/complete-booking-flow.test.ts --verbose --json --outputFile="../../$resultsDir/flow-test-$timestamp.json"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Flow tests PASSED" -ForegroundColor Green
    } else {
        Write-Host "✗ Flow tests FAILED" -ForegroundColor Red
        Write-Host "  Check logs in $resultsDir/flow-test-$timestamp.json" -ForegroundColor Yellow
    }
    
    cd ../..
    Write-Host ""
} else {
    Write-Host "Skipping flow tests (--SkipFlow)" -ForegroundColor Yellow
    Write-Host ""
}

# ============================================
# STEP 2: Stress Tests
# ============================================
if (!$SkipStress) {
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "STEP 2: AGGRESSIVE STRESS TEST" -ForegroundColor Yellow
    Write-Host "================================================================`n" -ForegroundColor Cyan
    
    if ($Quick) {
        Write-Host "Running QUICK stress test (5 minutes, 100 users max)..." -ForegroundColor Yellow
        
        # Quick test configuration
        $quickConfig = @"
export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '3m', target: 100 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.05'],
  },
};
"@
        
        # Create quick test file
        $quickTestPath = "tests/stress/quick-stress-test.js"
        $fullTestContent = Get-Content "tests/stress/aggressive-stress-test.js" -Raw
        $fullTestContent -replace "export const options = \{[^}]+\}", $quickConfig | Set-Content $quickTestPath
        
        k6 run -e BASE_URL=$Target `
            --out json="$resultsDir/stress-quick-$timestamp.json" `
            $quickTestPath
        
        Remove-Item $quickTestPath
    } else {
        Write-Host "Running FULL aggressive stress test (30 minutes, 1500 users max)..." -ForegroundColor Yellow
        Write-Host "⚠ This will take ~32 minutes. Press Ctrl+C to cancel." -ForegroundColor Yellow
        Start-Sleep -Seconds 3
        
        k6 run -e BASE_URL=$Target `
            --out json="$resultsDir/stress-full-$timestamp.json" `
            tests/stress/aggressive-stress-test.js
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✓ Stress tests COMPLETED" -ForegroundColor Green
    } else {
        Write-Host "`n⚠ Stress tests completed with warnings" -ForegroundColor Yellow
    }
    
    Write-Host ""
} else {
    Write-Host "Skipping stress tests (--SkipStress)" -ForegroundColor Yellow
    Write-Host ""
}

# ============================================
# STEP 3: Generate Summary Report
# ============================================
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "STEP 3: TEST SUMMARY" -ForegroundColor Yellow
Write-Host "================================================================`n" -ForegroundColor Cyan

Write-Host "Test Results Location: $resultsDir/" -ForegroundColor Cyan
Write-Host ""

# List result files
$resultFiles = Get-ChildItem -Path $resultsDir -Filter "*$timestamp*"
if ($resultFiles.Count -gt 0) {
    Write-Host "Generated Files:" -ForegroundColor Yellow
    foreach ($file in $resultFiles) {
        Write-Host "  - $($file.Name)" -ForegroundColor White
    }
} else {
    Write-Host "No result files generated" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "TESTING COMPLETE!" -ForegroundColor Green
Write-Host "================================================================`n" -ForegroundColor Cyan

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Review test results in $resultsDir/" -ForegroundColor White
Write-Host "  2. Check for any failures or warnings" -ForegroundColor White
Write-Host "  3. Optimize based on performance metrics" -ForegroundColor White
Write-Host "  4. Re-run tests after optimization" -ForegroundColor White
Write-Host ""

# Show quick stats if stress test ran
$stressFile = Get-ChildItem -Path $resultsDir -Filter "stress-*-$timestamp.json" | Select-Object -First 1
if ($stressFile) {
    Write-Host "Quick Stats from Stress Test:" -ForegroundColor Yellow
    try {
        $json = Get-Content $stressFile.FullName | ConvertFrom-Json
        $httpReqs = $json.metrics.http_reqs.values.count
        $httpFailed = $json.metrics.http_req_failed.values.passes
        $avgDuration = [math]::Round($json.metrics.http_req_duration.values.avg, 2)
        $p95Duration = [math]::Round($json.metrics.http_req_duration.values.'p(95)', 2)
        
        Write-Host "  Total Requests: $httpReqs" -ForegroundColor White
        Write-Host "  Failed Requests: $httpFailed" -ForegroundColor White
        Write-Host "  Avg Response Time: ${avgDuration}ms" -ForegroundColor White
        Write-Host "  P95 Response Time: ${p95Duration}ms" -ForegroundColor White
    } catch {
        Write-Host "  (Could not parse results)" -ForegroundColor Gray
    }
    Write-Host ""
}

Write-Host "For detailed analysis, see: tests/COMPLETE_TESTING_GUIDE.md" -ForegroundColor Cyan
Write-Host ""

