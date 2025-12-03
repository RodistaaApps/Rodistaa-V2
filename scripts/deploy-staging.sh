#!/bin/bash
# Rodistaa Staging Deployment Script
# Usage: ./scripts/deploy-staging.sh

set -e  # Exit on error

echo "🚀 RODISTAA STAGING DEPLOYMENT"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION=${AWS_REGION:-ap-south-1}
ECR_REGISTRY=${ECR_REGISTRY:-xxxxx.dkr.ecr.ap-south-1.amazonaws.com}
ECS_CLUSTER=${ECS_CLUSTER:-rodistaa-staging}
BACKEND_SERVICE=${BACKEND_SERVICE:-rodistaa-backend-staging}
PORTAL_SERVICE=${PORTAL_SERVICE:-rodistaa-portal-staging}

# Step 1: Pre-deployment checks
echo -e "${YELLOW}Step 1: Pre-deployment checks${NC}"
echo "--------------------------------"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}✗ AWS CLI not found. Please install it.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ AWS CLI found${NC}"

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}✗ Docker is not running. Please start Docker.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"

# Check if logged into ECR
echo "Logging into Amazon ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY
echo -e "${GREEN}✓ Logged into ECR${NC}"

echo ""

# Step 2: Build Docker images
echo -e "${YELLOW}Step 2: Building Docker images${NC}"
echo "--------------------------------"

# Build backend
echo "Building backend image..."
docker build -t rodistaa-backend:staging -f packages/backend/Dockerfile .
docker tag rodistaa-backend:staging $ECR_REGISTRY/rodistaa-backend:staging
echo -e "${GREEN}✓ Backend image built${NC}"

# Build portal
echo "Building portal image..."
docker build -t rodistaa-portal:staging -f packages/portal/Dockerfile .
docker tag rodistaa-portal:staging $ECR_REGISTRY/rodistaa-portal:staging
echo -e "${GREEN}✓ Portal image built${NC}"

echo ""

# Step 3: Push images to ECR
echo -e "${YELLOW}Step 3: Pushing images to ECR${NC}"
echo "--------------------------------"

docker push $ECR_REGISTRY/rodistaa-backend:staging
echo -e "${GREEN}✓ Backend image pushed${NC}"

docker push $ECR_REGISTRY/rodistaa-portal:staging
echo -e "${GREEN}✓ Portal image pushed${NC}"

echo ""

# Step 4: Run database migrations
echo -e "${YELLOW}Step 4: Running database migrations${NC}"
echo "--------------------------------"

# Create a task to run migrations
echo "Creating migration task..."
aws ecs run-task \
  --cluster $ECS_CLUSTER \
  --task-definition rodistaa-migrations-staging \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}" \
  --region $AWS_REGION

echo -e "${GREEN}✓ Migration task started${NC}"
echo "Waiting for migrations to complete (30 seconds)..."
sleep 30

echo ""

# Step 5: Update ECS services
echo -e "${YELLOW}Step 5: Updating ECS services${NC}"
echo "--------------------------------"

# Update backend service
echo "Updating backend service..."
aws ecs update-service \
  --cluster $ECS_CLUSTER \
  --service $BACKEND_SERVICE \
  --force-new-deployment \
  --region $AWS_REGION \
  > /dev/null

echo -e "${GREEN}✓ Backend service update initiated${NC}"

# Update portal service
echo "Updating portal service..."
aws ecs update-service \
  --cluster $ECS_CLUSTER \
  --service $PORTAL_SERVICE \
  --force-new-deployment \
  --region $AWS_REGION \
  > /dev/null

echo -e "${GREEN}✓ Portal service update initiated${NC}"

echo ""

# Step 6: Wait for deployment
echo -e "${YELLOW}Step 6: Waiting for services to stabilize${NC}"
echo "--------------------------------"

echo "Waiting for backend service..."
aws ecs wait services-stable \
  --cluster $ECS_CLUSTER \
  --services $BACKEND_SERVICE \
  --region $AWS_REGION

echo -e "${GREEN}✓ Backend service is stable${NC}"

echo "Waiting for portal service..."
aws ecs wait services-stable \
  --cluster $ECS_CLUSTER \
  --services $PORTAL_SERVICE \
  --region $AWS_REGION

echo -e "${GREEN}✓ Portal service is stable${NC}"

echo ""

# Step 7: Health checks
echo -e "${YELLOW}Step 7: Running health checks${NC}"
echo "--------------------------------"

BACKEND_URL="https://api-staging.rodistaa.com"
PORTAL_URL="https://portal-staging.rodistaa.com"

echo "Checking backend health..."
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/health)
if [ "$BACKEND_HEALTH" = "200" ]; then
    echo -e "${GREEN}✓ Backend is healthy (HTTP $BACKEND_HEALTH)${NC}"
else
    echo -e "${RED}✗ Backend health check failed (HTTP $BACKEND_HEALTH)${NC}"
    exit 1
fi

echo "Checking portal health..."
PORTAL_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" $PORTAL_URL)
if [ "$PORTAL_HEALTH" = "200" ]; then
    echo -e "${GREEN}✓ Portal is healthy (HTTP $PORTAL_HEALTH)${NC}"
else
    echo -e "${RED}✗ Portal health check failed (HTTP $PORTAL_HEALTH)${NC}"
    exit 1
fi

echo ""

# Step 8: Post-deployment tasks
echo -e "${YELLOW}Step 8: Post-deployment tasks${NC}"
echo "--------------------------------"

# Notify team (Slack webhook example)
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST $SLACK_WEBHOOK_URL \
      -H 'Content-Type: application/json' \
      -d "{\"text\":\"🚀 Rodistaa Staging Deployment Successful!\n\nBackend: $BACKEND_URL\nPortal: $PORTAL_URL\"}"
    echo -e "${GREEN}✓ Team notified${NC}"
fi

# Tag Git commit
GIT_COMMIT=$(git rev-parse --short HEAD)
GIT_TAG="staging-$(date +%Y%m%d-%H%M%S)-$GIT_COMMIT"
git tag -a $GIT_TAG -m "Staging deployment"
# git push origin $GIT_TAG  # Uncomment to push tag

echo -e "${GREEN}✓ Git tagged: $GIT_TAG${NC}"

echo ""

# Summary
echo "================================"
echo -e "${GREEN}✓ DEPLOYMENT COMPLETE${NC}"
echo "================================"
echo ""
echo "Staging URLs:"
echo "  Backend API: $BACKEND_URL"
echo "  Admin Portal: $PORTAL_URL"
echo "  Grafana: https://grafana-staging.rodistaa.com"
echo ""
echo "Next steps:"
echo "  1. Run smoke tests"
echo "  2. Execute UAT testing"
echo "  3. Monitor logs in CloudWatch"
echo "  4. Check Grafana dashboards"
echo ""
echo "To rollback:"
echo "  ./scripts/rollback-staging.sh"
echo ""
