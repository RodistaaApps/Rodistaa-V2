#!/bin/bash
set -euo pipefail

# ============================================================
# RODISTAA - AWS PRODUCTION DEPLOYMENT SCRIPT
# ============================================================

echo "============================================================"
echo "RODISTAA - AWS PRODUCTION DEPLOYMENT"
echo "============================================================"

# Configuration
AWS_REGION="${AWS_REGION:-ap-south-1}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-}"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
VERSION=$(git rev-parse --short HEAD)
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Validate AWS credentials
if [ -z "$AWS_ACCOUNT_ID" ]; then
  echo "ERROR: AWS_ACCOUNT_ID not set"
  echo "Run: export AWS_ACCOUNT_ID=your-account-id"
  exit 1
fi

echo "Configuration:"
echo "  Region: ${AWS_REGION}"
echo "  Account: ${AWS_ACCOUNT_ID}"
echo "  Version: ${VERSION}"
echo "  Timestamp: ${TIMESTAMP}"
echo ""

# Step 1: Login to ECR
echo "Step 1: Logging in to AWS ECR..."
aws ecr get-login-password --region ${AWS_REGION} | \
  docker login --username AWS --password-stdin ${ECR_REGISTRY}
echo "  ✅ Logged in to ECR"
echo ""

# Step 2: Build Backend
echo "Step 2: Building Backend image..."
docker build \
  --platform linux/amd64 \
  -t rodistaa-backend:${VERSION} \
  -t rodistaa-backend:latest \
  -f Dockerfile \
  .
docker tag rodistaa-backend:${VERSION} ${ECR_REGISTRY}/rodistaa-backend:${VERSION}
docker tag rodistaa-backend:latest ${ECR_REGISTRY}/rodistaa-backend:latest
echo "  ✅ Backend image built"
echo ""

# Step 3: Build Admin Portal
echo "Step 3: Building Admin Portal image..."
docker build \
  --platform linux/amd64 \
  -t rodistaa-admin-portal:${VERSION} \
  -t rodistaa-admin-portal:latest \
  -f docker/Dockerfile.admin-portal \
  .
docker tag rodistaa-admin-portal:${VERSION} ${ECR_REGISTRY}/rodistaa-admin-portal:${VERSION}
docker tag rodistaa-admin-portal:latest ${ECR_REGISTRY}/rodistaa-admin-portal:latest
echo "  ✅ Admin Portal image built"
echo ""

# Step 4: Build Franchise Portal
echo "Step 4: Building Franchise Portal image..."
docker build \
  --platform linux/amd64 \
  -t rodistaa-franchise-portal:${VERSION} \
  -t rodistaa-franchise-portal:latest \
  -f docker/Dockerfile.franchise-portal \
  .
docker tag rodistaa-franchise-portal:${VERSION} ${ECR_REGISTRY}/rodistaa-franchise-portal:${VERSION}
docker tag rodistaa-franchise-portal:latest ${ECR_REGISTRY}/rodistaa-franchise-portal:latest
echo "  ✅ Franchise Portal image built"
echo ""

# Step 5: Push to ECR
echo "Step 5: Pushing images to ECR..."
echo "  → Backend..."
docker push ${ECR_REGISTRY}/rodistaa-backend:${VERSION}
docker push ${ECR_REGISTRY}/rodistaa-backend:latest
echo "  → Admin Portal..."
docker push ${ECR_REGISTRY}/rodistaa-admin-portal:${VERSION}
docker push ${ECR_REGISTRY}/rodistaa-admin-portal:latest
echo "  → Franchise Portal..."
docker push ${ECR_REGISTRY}/rodistaa-franchise-portal:${VERSION}
docker push ${ECR_REGISTRY}/rodistaa-franchise-portal:latest
echo "  ✅ All images pushed to ECR"
echo ""

# Step 6: Update ECS Services
echo "Step 6: Deploying to ECS..."
echo "  → Backend service..."
aws ecs update-service \
  --cluster rodistaa-production \
  --service rodistaa-backend \
  --force-new-deployment \
  --region ${AWS_REGION} \
  > /dev/null

echo "  → Admin Portal service..."
aws ecs update-service \
  --cluster rodistaa-production \
  --service rodistaa-admin-portal \
  --force-new-deployment \
  --region ${AWS_REGION} \
  > /dev/null

echo "  → Franchise Portal service..."
aws ecs update-service \
  --cluster rodistaa-production \
  --service rodistaa-franchise-portal \
  --force-new-deployment \
  --region ${AWS_REGION} \
  > /dev/null

echo "  ✅ ECS services updated"
echo ""

# Step 7: Wait for deployment to stabilize
echo "Step 7: Waiting for deployment to stabilize..."
echo "  This may take 2-5 minutes..."
aws ecs wait services-stable \
  --cluster rodistaa-production \
  --services rodistaa-backend rodistaa-admin-portal rodistaa-franchise-portal \
  --region ${AWS_REGION}

echo "  ✅ Deployment stable"
echo ""

# Step 8: Verify health
echo "Step 8: Verifying deployment health..."
BACKEND_HEALTH=$(curl -s https://api.rodistaa.com/health | jq -r '.status')
if [ "$BACKEND_HEALTH" = "healthy" ]; then
  echo "  ✅ Backend API: healthy"
else
  echo "  ❌ Backend API: unhealthy"
fi

echo ""
echo "============================================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "============================================================"
echo "  Version: ${VERSION}"
echo "  Timestamp: ${TIMESTAMP}"
echo "  Backend: https://api.rodistaa.com"
echo "  Admin Portal: https://admin.rodistaa.com"
echo "  Franchise Portal: https://franchise.rodistaa.com"
echo "============================================================"
echo ""
echo "Next steps:"
echo "  1. Monitor CloudWatch logs"
echo "  2. Check Grafana dashboards"
echo "  3. Verify all features working"
echo "  4. Notify team of successful deployment"
echo ""

