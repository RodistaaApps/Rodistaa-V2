# ================================================================
# RODISTAA PRODUCTION ENVIRONMENT VERIFICATION
# PowerShell Version for Windows
# ================================================================

Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host "RODISTAA PRODUCTION ENVIRONMENT VERIFICATION" -ForegroundColor Yellow
Write-Host "================================================================`n" -ForegroundColor Cyan

$ErrorCount = 0

# Check AWS CLI
Write-Host "Checking AWS CLI..." -ForegroundColor Cyan
try {
    $awsVersion = aws --version 2>&1
    Write-Host "  ✅ AWS CLI installed: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ AWS CLI not found - Install with: winget install Amazon.AWSCLI" -ForegroundColor Red
    $ErrorCount++
}

# Check secrets exist
Write-Host "`nChecking AWS Secrets Manager..." -ForegroundColor Cyan
$secrets = @(
    "rodistaa/production/database/password",
    "rodistaa/production/jwt/secret",
    "rodistaa/production/jwt/refresh-secret",
    "rodistaa/production/razorpay/credentials",
    "rodistaa/production/firebase/service-account",
    "rodistaa/production/twilio/credentials",
    "rodistaa/production/google-maps/api-key",
    "rodistaa/production/sentry/dsn"
)

foreach ($secret in $secrets) {
    try {
        $result = aws secretsmanager describe-secret --secret-id $secret --region ap-south-1 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ $secret" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $secret (NOT FOUND)" -ForegroundColor Red
            $ErrorCount++
        }
    } catch {
        Write-Host "  ❌ $secret (ERROR)" -ForegroundColor Red
        $ErrorCount++
    }
}

# Check RDS instance
Write-Host "`nChecking RDS instance..." -ForegroundColor Cyan
try {
    $result = aws rds describe-db-instances --db-instance-identifier rodistaa-prod --region ap-south-1 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ RDS instance 'rodistaa-prod' exists" -ForegroundColor Green
    } else {
        Write-Host "  ❌ RDS instance 'rodistaa-prod' not found" -ForegroundColor Yellow
        Write-Host "     (Expected if not yet created)" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ⚠️  RDS check skipped (instance may not exist yet)" -ForegroundColor Yellow
}

# Check ElastiCache
Write-Host "`nChecking ElastiCache..." -ForegroundColor Cyan
try {
    $result = aws elasticache describe-cache-clusters --cache-cluster-id rodistaa-prod --region ap-south-1 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ ElastiCache cluster 'rodistaa-prod' exists" -ForegroundColor Green
    } else {
        Write-Host "  ❌ ElastiCache cluster 'rodistaa-prod' not found" -ForegroundColor Yellow
        Write-Host "     (Expected if not yet created)" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ⚠️  ElastiCache check skipped (cluster may not exist yet)" -ForegroundColor Yellow
}

# Check S3 buckets
Write-Host "`nChecking S3 buckets..." -ForegroundColor Cyan
$buckets = @("rodistaa-prod-documents", "rodistaa-prod-images", "rodistaa-prod-pod", "rodistaa-prod-backups")
foreach ($bucket in $buckets) {
    try {
        $result = aws s3 ls "s3://$bucket" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ $bucket" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $bucket (NOT FOUND)" -ForegroundColor Yellow
            Write-Host "     (Expected if not yet created)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  ⚠️  $bucket check skipped" -ForegroundColor Yellow
    }
}

# Check ECS cluster
Write-Host "`nChecking ECS cluster..." -ForegroundColor Cyan
try {
    $result = aws ecs describe-clusters --clusters rodistaa-production --region ap-south-1 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ ECS cluster 'rodistaa-production' exists" -ForegroundColor Green
    } else {
        Write-Host "  ❌ ECS cluster 'rodistaa-production' not found" -ForegroundColor Yellow
        Write-Host "     (Expected if not yet created)" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ⚠️  ECS check skipped (cluster may not exist yet)" -ForegroundColor Yellow
}

# Summary
Write-Host "`n================================================================" -ForegroundColor Cyan
if ($ErrorCount -eq 0) {
    Write-Host "VERIFICATION COMPLETE - ALL CHECKS PASSED ✅" -ForegroundColor Green
} else {
    Write-Host "VERIFICATION COMPLETE - $ErrorCount ERRORS FOUND ⚠️" -ForegroundColor Yellow
    Write-Host "Review errors above and create missing resources" -ForegroundColor Yellow
}
Write-Host "================================================================`n" -ForegroundColor Cyan

exit $ErrorCount

