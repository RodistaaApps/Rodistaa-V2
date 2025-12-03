# ============================================================
# RODISTAA - AWS PRODUCTION DEPLOYMENT SCRIPT (PowerShell)
# ============================================================

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "RODISTAA - AWS PRODUCTION DEPLOYMENT" -ForegroundColor Yellow
Write-Host "============================================================`n" -ForegroundColor Cyan

# Configuration
$AWS_REGION = if ($env:AWS_REGION) { $env:AWS_REGION } else { "ap-south-1" }
$AWS_ACCOUNT_ID = $env:AWS_ACCOUNT_ID
$VERSION = (git rev-parse --short HEAD).Trim()
$TIMESTAMP = Get-Date -Format "yyyyMMdd-HHmmss"

if (-not $AWS_ACCOUNT_ID) {
    Write-Host "ERROR: AWS_ACCOUNT_ID not set" -ForegroundColor Red
    Write-Host "Run: `$env:AWS_ACCOUNT_ID='your-account-id'" -ForegroundColor Yellow
    exit 1
}

$ECR_REGISTRY = "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "  Region: $AWS_REGION" -ForegroundColor White
Write-Host "  Account: $AWS_ACCOUNT_ID" -ForegroundColor White
Write-Host "  Version: $VERSION" -ForegroundColor White
Write-Host "  Timestamp: $TIMESTAMP`n" -ForegroundColor White

# Step 1: Login to ECR
Write-Host "Step 1: Logging in to AWS ECR..." -ForegroundColor Yellow
$password = aws ecr get-login-password --region $AWS_REGION
$password | docker login --username AWS --password-stdin $ECR_REGISTRY
Write-Host "  ✅ Logged in to ECR`n" -ForegroundColor Green

# Step 2: Build Backend
Write-Host "Step 2: Building Backend image..." -ForegroundColor Yellow
docker build `
  --platform linux/amd64 `
  -t "rodistaa-backend:$VERSION" `
  -t "rodistaa-backend:latest" `
  -f Dockerfile `
  .
docker tag "rodistaa-backend:$VERSION" "$ECR_REGISTRY/rodistaa-backend:$VERSION"
docker tag "rodistaa-backend:latest" "$ECR_REGISTRY/rodistaa-backend:latest"
Write-Host "  ✅ Backend image built`n" -ForegroundColor Green

# Step 3: Build Admin Portal
Write-Host "Step 3: Building Admin Portal image..." -ForegroundColor Yellow
docker build `
  --platform linux/amd64 `
  -t "rodistaa-admin-portal:$VERSION" `
  -t "rodistaa-admin-portal:latest" `
  -f docker/Dockerfile.admin-portal `
  .
docker tag "rodistaa-admin-portal:$VERSION" "$ECR_REGISTRY/rodistaa-admin-portal:$VERSION"
docker tag "rodistaa-admin-portal:latest" "$ECR_REGISTRY/rodistaa-admin-portal:latest"
Write-Host "  ✅ Admin Portal image built`n" -ForegroundColor Green

# Step 4: Build Franchise Portal
Write-Host "Step 4: Building Franchise Portal image..." -ForegroundColor Yellow
docker build `
  --platform linux/amd64 `
  -t "rodistaa-franchise-portal:$VERSION" `
  -t "rodistaa-franchise-portal:latest" `
  -f docker/Dockerfile.franchise-portal `
  .
docker tag "rodistaa-franchise-portal:$VERSION" "$ECR_REGISTRY/rodistaa-franchise-portal:$VERSION"
docker tag "rodistaa-franchise-portal:latest" "$ECR_REGISTRY/rodistaa-franchise-portal:latest"
Write-Host "  ✅ Franchise Portal image built`n" -ForegroundColor Green

# Step 5: Push to ECR
Write-Host "Step 5: Pushing images to ECR..." -ForegroundColor Yellow
Write-Host "  → Backend..." -ForegroundColor Gray
docker push "$ECR_REGISTRY/rodistaa-backend:$VERSION"
docker push "$ECR_REGISTRY/rodistaa-backend:latest"
Write-Host "  → Admin Portal..." -ForegroundColor Gray
docker push "$ECR_REGISTRY/rodistaa-admin-portal:$VERSION"
docker push "$ECR_REGISTRY/rodistaa-admin-portal:latest"
Write-Host "  → Franchise Portal..." -ForegroundColor Gray
docker push "$ECR_REGISTRY/rodistaa-franchise-portal:$VERSION"
docker push "$ECR_REGISTRY/rodistaa-franchise-portal:latest"
Write-Host "  ✅ All images pushed to ECR`n" -ForegroundColor Green

# Step 6: Update ECS Services
Write-Host "Step 6: Deploying to ECS..." -ForegroundColor Yellow
Write-Host "  → Backend service..." -ForegroundColor Gray
aws ecs update-service `
  --cluster rodistaa-production `
  --service rodistaa-backend `
  --force-new-deployment `
  --region $AWS_REGION | Out-Null

Write-Host "  → Admin Portal service..." -ForegroundColor Gray
aws ecs update-service `
  --cluster rodistaa-production `
  --service rodistaa-admin-portal `
  --force-new-deployment `
  --region $AWS_REGION | Out-Null

Write-Host "  → Franchise Portal service..." -ForegroundColor Gray
aws ecs update-service `
  --cluster rodistaa-production `
  --service rodistaa-franchise-portal `
  --force-new-deployment `
  --region $AWS_REGION | Out-Null

Write-Host "  ✅ ECS services updated`n" -ForegroundColor Green

# Step 7: Wait for deployment
Write-Host "Step 7: Waiting for deployment to stabilize..." -ForegroundColor Yellow
Write-Host "  This may take 2-5 minutes..." -ForegroundColor Gray
aws ecs wait services-stable `
  --cluster rodistaa-production `
  --services rodistaa-backend rodistaa-admin-portal rodistaa-franchise-portal `
  --region $AWS_REGION

Write-Host "  ✅ Deployment stable`n" -ForegroundColor Green

# Step 8: Verify health
Write-Host "Step 8: Verifying deployment health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "https://api.rodistaa.com/health" -TimeoutSec 5
    if ($health.status -eq "healthy") {
        Write-Host "  ✅ Backend API: healthy" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Backend API: degraded" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ❌ Backend API: unreachable" -ForegroundColor Red
}

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Version: $VERSION" -ForegroundColor White
Write-Host "  Timestamp: $TIMESTAMP" -ForegroundColor White
Write-Host "  Backend: https://api.rodistaa.com" -ForegroundColor Cyan
Write-Host "  Admin Portal: https://admin.rodistaa.com" -ForegroundColor Cyan
Write-Host "  Franchise Portal: https://franchise.rodistaa.com" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Monitor CloudWatch logs" -ForegroundColor White
Write-Host "  2. Check Grafana dashboards" -ForegroundColor White
Write-Host "  3. Verify all features working" -ForegroundColor White
Write-Host "  4. Notify team of successful deployment`n" -ForegroundColor White

