#!/bin/bash
# Rodistaa Production Rollback Script
# Usage: ./scripts/rollback-production.sh

set -e

echo "⚠️  RODISTAA PRODUCTION ROLLBACK"
echo "===================================="
echo ""
echo "This will rollback the production deployment!"
echo ""
read -p "Are you ABSOLUTELY SURE? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Rollback cancelled."
    exit 0
fi

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
AWS_REGION=${AWS_REGION:-ap-south-1}
ECS_CLUSTER=${ECS_CLUSTER:-rodistaa-production}
BACKEND_SERVICE=${BACKEND_SERVICE:-rodistaa-backend-prod}
PORTAL_SERVICE=${PORTAL_SERVICE:-rodistaa-portal-prod}

echo ""
echo -e "${YELLOW}Finding previous task definitions...${NC}"

# Get previous task definition revisions
BACKEND_PREV=$(aws ecs describe-services \
    --cluster $ECS_CLUSTER \
    --services $BACKEND_SERVICE \
    --region $AWS_REGION \
    --query 'services[0].deployments[1].taskDefinition' \
    --output text)

PORTAL_PREV=$(aws ecs describe-services \
    --cluster $ECS_CLUSTER \
    --services $PORTAL_SERVICE \
    --region $AWS_REGION \
    --query 'services[0].deployments[1].taskDefinition' \
    --output text)

if [[ "$BACKEND_PREV" == "None" ]] || [[ "$PORTAL_PREV" == "None" ]]; then
    echo -e "${RED}✗ No previous deployment found to rollback to${NC}"
    exit 1
fi

echo "Previous backend task definition: $BACKEND_PREV"
echo "Previous portal task definition: $PORTAL_PREV"
echo ""

read -p "Rollback to these versions? (yes/no): " version_confirm
if [ "$version_confirm" != "yes" ]; then
    exit 0
fi

echo ""
echo -e "${YELLOW}Rolling back backend service...${NC}"
aws ecs update-service \
    --cluster $ECS_CLUSTER \
    --service $BACKEND_SERVICE \
    --task-definition $BACKEND_PREV \
    --region $AWS_REGION \
    > /dev/null

echo "Waiting for backend to stabilize..."
aws ecs wait services-stable \
    --cluster $ECS_CLUSTER \
    --services $BACKEND_SERVICE \
    --region $AWS_REGION

echo -e "${GREEN}✓ Backend rolled back${NC}"

echo ""
echo -e "${YELLOW}Rolling back portal service...${NC}"
aws ecs update-service \
    --cluster $ECS_CLUSTER \
    --service $PORTAL_SERVICE \
    --task-definition $PORTAL_PREV \
    --region $AWS_REGION \
    > /dev/null

echo "Waiting for portal to stabilize..."
aws ecs wait services-stable \
    --cluster $ECS_CLUSTER \
    --services $PORTAL_SERVICE \
    --region $AWS_REGION

echo -e "${GREEN}✓ Portal rolled back${NC}"

echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✓ ROLLBACK COMPLETE${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""
echo "Services have been rolled back to previous versions."
echo ""
echo "Next steps:"
echo "  1. Verify services are working"
echo "  2. Investigate what went wrong"
echo "  3. Fix issues before next deployment"
echo ""

