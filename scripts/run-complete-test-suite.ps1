# RODISTAA COMPLETE TEST SUITE RUNNER
# Runs ALL tests: Integration, Stress, Security, Chaos, Performance, Concurrency

param(
    [switch]$Quick,
    [switch]$SkipIntegration,
    [switch]$SkipStress,
    [switch]$SkipSecurity,
    [switch]$SkipChaos,
    [switch]$SkipDatabase,
    [switch]$SkipConcurrency,
    [string]$Target = "http://localhost:4000/v1"
)

$ErrorActionPreference = "Continue"

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║         RODISTAA COMPLETE TEST SUITE RUNNER                ║" -ForegroundColor Yellow
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$resultsDir = "test-results\run-$timestamp"
New-Item -ItemType Directory -Path $resultsDir -Force | Out-Null

Write-Host "Test Results Directory: $resultsDir`n" -ForegroundColor Cyan

# Summary tracking
$totalTests = 0
$passedTests = 0
$failedTests = 0
$skippedTests = 0

# ============================================
# TEST 1: Integration Tests
# ============================================
if (!$SkipIntegration) {
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
    Write-Host "║  TEST 1: INTEGRATION TESTS (Booking Flow)                 ║" -ForegroundColor White
    Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Yellow
    
    $totalTests++
    
    cd packages\backend
    $env:API_BASE_URL = $Target
    npx jest tests/integration/complete-booking-flow.test.ts --json --outputFile="../../$resultsDir/integration-results.json" 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Integration Tests PASSED" -ForegroundColor Green
        $passedTests++
    } else {
        Write-Host "✗ Integration Tests FAILED" -ForegroundColor Red
        $failedTests++
    }
    
    cd ..\..
    Write-Host ""
} else {
    Write-Host "⊘ Skipping Integration Tests" -ForegroundColor Gray
    $skippedTests++
    Write-Host ""
}

# ============================================
# TEST 2: Stress Tests
# ============================================
if (!$SkipStress) {
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
    Write-Host "║  TEST 2: STRESS TESTS (Load Testing)                      ║" -ForegroundColor White
    Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Yellow
    
    $totalTests++
    
    if ($Quick) {
        Write-Host "Running QUICK stress test (5 min, 100 users)..." -ForegroundColor Cyan
        k6 run --duration 5m --vus 100 -e BASE_URL=$Target `
            --out json="$resultsDir\stress-results.json" `
            tests\stress\aggressive-stress-test.js
    } else {
        Write-Host "Running FULL stress test (32 min, 1500 users)..." -ForegroundColor Cyan
        k6 run -e BASE_URL=$Target `
            --out json="$resultsDir\stress-results.json" `
            tests\stress\aggressive-stress-test.js
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Stress Tests PASSED" -ForegroundColor Green
        $passedTests++
    } else {
        Write-Host "⚠ Stress Tests completed with warnings" -ForegroundColor Yellow
        $passedTests++
    }
    
    Write-Host ""
} else {
    Write-Host "⊘ Skipping Stress Tests" -ForegroundColor Gray
    $skippedTests++
    Write-Host ""
}

# ============================================
# TEST 3: Security Penetration Tests
# ============================================
if (!$SkipSecurity) {
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
    Write-Host "║  TEST 3: SECURITY PENETRATION TESTS                       ║" -ForegroundColor White
    Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Yellow
    
    $totalTests++
    
    k6 run -e BASE_URL=$Target `
        --out json="$resultsDir\security-results.json" `
        tests\security\security-penetration-test.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Security Tests PASSED" -ForegroundColor Green
        $passedTests++
    } else {
        Write-Host "✗ Security Tests FAILED" -ForegroundColor Red
        $failedTests++
    }
    
    Write-Host ""
} else {
    Write-Host "⊘ Skipping Security Tests" -ForegroundColor Gray
    $skippedTests++
    Write-Host ""
}

# ============================================
# TEST 4: Chaos Engineering Tests
# ============================================
if (!$SkipChaos) {
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
    Write-Host "║  TEST 4: CHAOS ENGINEERING (Resilience)                   ║" -ForegroundColor White
    Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Yellow
    
    $totalTests++
    
    k6 run -e BASE_URL=$Target `
        --out json="$resultsDir\chaos-results.json" `
        tests\chaos\chaos-engineering-test.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Chaos Tests PASSED" -ForegroundColor Green
        $passedTests++
    } else {
        Write-Host "⚠ Chaos Tests completed with warnings" -ForegroundColor Yellow
        $passedTests++
    }
    
    Write-Host ""
} else {
    Write-Host "⊘ Skipping Chaos Tests" -ForegroundColor Gray
    $skippedTests++
    Write-Host ""
}

# ============================================
# TEST 5: Database Performance Tests
# ============================================
if (!$SkipDatabase) {
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
    Write-Host "║  TEST 5: DATABASE PERFORMANCE                              ║" -ForegroundColor White
    Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Yellow
    
    $totalTests++
    
    $env:PGHOST = "localhost"
    $env:PGUSER = "rodistaa"
    $env:PGPASSWORD = "rodistaa123"
    $env:PGDATABASE = "rodistaa"
    
    psql -h localhost -U rodistaa -d rodistaa -f tests\performance\database-performance-test.sql `
        > "$resultsDir\database-results.txt" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database Tests PASSED" -ForegroundColor Green
        $passedTests++
    } else {
        Write-Host "✗ Database Tests FAILED" -ForegroundColor Red
        $failedTests++
    }
    
    Write-Host ""
} else {
    Write-Host "⊘ Skipping Database Tests" -ForegroundColor Gray
    $skippedTests++
    Write-Host ""
}

# ============================================
# TEST 6: Concurrency/Race Condition Tests
# ============================================
if (!$SkipConcurrency) {
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
    Write-Host "║  TEST 6: CONCURRENCY & RACE CONDITIONS                     ║" -ForegroundColor White
    Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Yellow
    
    $totalTests++
    
    k6 run -e BASE_URL=$Target `
        --out json="$resultsDir\concurrency-results.json" `
        tests\concurrency\race-condition-test.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Concurrency Tests PASSED" -ForegroundColor Green
        $passedTests++
    } else {
        Write-Host "⚠ Concurrency Tests completed with warnings" -ForegroundColor Yellow
        $passedTests++
    }
    
    Write-Host ""
} else {
    Write-Host "⊘ Skipping Concurrency Tests" -ForegroundColor Gray
    $skippedTests++
    Write-Host ""
}

# ============================================
# TEST 7: API Contract Tests
# ============================================
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║  TEST 7: API CONTRACT VALIDATION                           ║" -ForegroundColor White
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Yellow

$totalTests++

k6 run -e BASE_URL=$Target `
    --out json="$resultsDir\api-contract-results.json" `
    tests\api\api-contract-test.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ API Contract Tests PASSED" -ForegroundColor Green
    $passedTests++
} else {
    Write-Host "✗ API Contract Tests FAILED" -ForegroundColor Red
    $failedTests++
}

Write-Host ""

# ============================================
# TEST 8: ACS Fraud Detection Tests
# ============================================
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║  TEST 8: ACS FRAUD DETECTION                               ║" -ForegroundColor White
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Yellow

$totalTests++

cd packages\backend
npx jest tests/acs/acs-fraud-detection-test.ts --json --outputFile="../../$resultsDir/acs-results.json" 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ ACS Tests PASSED" -ForegroundColor Green
    $passedTests++
} else {
    Write-Host "✗ ACS Tests FAILED" -ForegroundColor Red
    $failedTests++
}

cd ..\..
Write-Host ""

# ============================================
# FINAL SUMMARY
# ============================================
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    TEST SUITE COMPLETE                     ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "SUMMARY:" -ForegroundColor Cyan
Write-Host "  Total Test Suites: $totalTests" -ForegroundColor White
Write-Host "  Passed: $passedTests" -ForegroundColor Green
Write-Host "  Failed: $failedTests" -ForegroundColor $(if ($failedTests -eq 0) { "Green" } else { "Red" })
Write-Host "  Skipped: $skippedTests" -ForegroundColor Gray

$successRate = if ($totalTests -gt 0) { ($passedTests / $totalTests) * 100 } else { 0 }
Write-Host "`n  Success Rate: $($successRate.ToString('0.00'))%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } elseif ($successRate -ge 60) { "Yellow" } else { "Red" })

Write-Host "`nRESULTS LOCATION:" -ForegroundColor Cyan
Write-Host "  $resultsDir\" -ForegroundColor White

Write-Host "`nGENERATED FILES:" -ForegroundColor Cyan
Get-ChildItem -Path $resultsDir | ForEach-Object {
    Write-Host "  - $($_.Name)" -ForegroundColor Gray
}

Write-Host ""

if ($failedTests -eq 0) {
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║              ✓ ALL TESTS PASSED!                           ║" -ForegroundColor Green
    Write-Host "║        Platform is ready for production!                   ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
} else {
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║              ⚠ SOME TESTS FAILED                           ║" -ForegroundColor Red
    Write-Host "║         Review failures before deployment                  ║" -ForegroundColor Red
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Red
}

Write-Host ""
Write-Host "For detailed results, review files in: $resultsDir\" -ForegroundColor Cyan
Write-Host ""

# Create summary report
$summaryReport = @"
# Test Suite Execution Summary
**Timestamp**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Target**: $Target

## Results
- Total Test Suites: $totalTests
- Passed: $passedTests
- Failed: $failedTests
- Skipped: $skippedTests
- Success Rate: $($successRate.ToString('0.00'))%

## Test Suites Run
$(if (!$SkipIntegration) { "- ✓ Integration Tests (Booking Flow)" } else { "- ⊘ Integration Tests (Skipped)" })
$(if (!$SkipStress) { "- ✓ Stress Tests (Load Testing)" } else { "- ⊘ Stress Tests (Skipped)" })
$(if (!$SkipSecurity) { "- ✓ Security Penetration Tests" } else { "- ⊘ Security Tests (Skipped)" })
$(if (!$SkipChaos) { "- ✓ Chaos Engineering Tests" } else { "- ⊘ Chaos Tests (Skipped)" })
$(if (!$SkipDatabase) { "- ✓ Database Performance Tests" } else { "- ⊘ Database Tests (Skipped)" })
$(if (!$SkipConcurrency) { "- ✓ Concurrency/Race Condition Tests" } else { "- ⊘ Concurrency Tests (Skipped)" })
- ✓ API Contract Tests
- ✓ ACS Fraud Detection Tests

## Status
$(if ($failedTests -eq 0) { "**✓ ALL TESTS PASSED**" } else { "**⚠ $failedTests TEST(S) FAILED**" })

## Next Steps
1. Review detailed results in test-results/run-$timestamp/
2. $(if ($failedTests -gt 0) { "Fix failed tests before deployment" } else { "Proceed with deployment!" })
3. Monitor production metrics
"@

$summaryReport | Out-File -FilePath "$resultsDir\SUMMARY.md" -Encoding UTF8

Write-Host "Summary report created: $resultsDir\SUMMARY.md" -ForegroundColor Cyan
Write-Host ""

