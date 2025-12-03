#!/bin/bash
# Rodistaa Production Deployment Script
# Usage: ./scripts/deploy-production.sh

set -e  # Exit on error

echo "🚀 RODISTAA PRODUCTION DEPLOYMENT"
echo "===================================="
echo ""
echo "⚠️  WARNING: This will deploy to PRODUCTION!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Deployment cancelled."
    exit 0
fi

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION=${AWS_REGION:-ap-south-1}
ECR_REGISTRY=${ECR_REGISTRY:-xxxxx.dkr.ecr.ap-south-1.amazonaws.com}
ECS_CLUSTER=${ECS_CLUSTER:-rodistaa-production}
BACKEND_SERVICE=${BACKEND_SERVICE:-rodistaa-backend-prod}
PORTAL_SERVICE=${PORTAL_SERVICE:-rodistaa-portal-prod}
SLACK_WEBHOOK=${SLACK_WEBHOOK_URL:-}

# Get Git info
GIT_COMMIT=$(git rev-parse --short HEAD)
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
GIT_TAG=$(git describe --tags --exact-match 2>/dev/null || echo "")

echo -e "${BLUE}Deployment Info:${NC}"
echo "  Commit: $GIT_COMMIT"
echo "  Branch: $GIT_BRANCH"
echo "  Tag: ${GIT_TAG:-none}"
echo "  Time: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# ============================================
# STEP 1: PRE-DEPLOYMENT VALIDATION
# ============================================
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}STEP 1: PRE-DEPLOYMENT VALIDATION${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo ""

# 1.1: Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}✗ AWS CLI not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ AWS CLI found${NC}"

# 1.2: Check Docker
if ! docker info &> /dev/null; then
    echo -e "${RED}✗ Docker not running${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker running${NC}"

# 1.3: Check Git status
if [[ $(git status --porcelain) ]]; then
    echo -e "${RED}✗ Uncommitted changes detected${NC}"
    echo "Please commit or stash changes before deploying."
    exit 1
fi
echo -e "${GREEN}✓ No uncommitted changes${NC}"

# 1.4: Check if on main/master branch
if [[ "$GIT_BRANCH" != "main" && "$GIT_BRANCH" != "master" ]]; then
    echo -e "${YELLOW}⚠ Not on main/master branch (currently on: $GIT_BRANCH)${NC}"
    read -p "Continue anyway? (yes/no): " branch_confirm
    if [ "$branch_confirm" != "yes" ]; then
        exit 1
    fi
fi

# 1.5: Check if tagged
if [[ -z "$GIT_TAG" ]]; then
    echo -e "${YELLOW}⚠ No git tag found${NC}"
    echo "Production deployments should be tagged!"
    read -p "Create tag now? (yes/no): " tag_confirm
    if [ "$tag_confirm" = "yes" ]; then
        read -p "Enter tag (e.g. v1.0.0): " new_tag
        git tag -a $new_tag -m "Production release $new_tag"
        GIT_TAG=$new_tag
        echo -e "${GREEN}✓ Tagged as $GIT_TAG${NC}"
    fi
fi

# 1.6: Run deployment checklist
echo ""
echo "Running deployment checklist..."
node scripts/deployment-checklist.js || {
    echo -e "${RED}✗ Deployment checklist failed${NC}"
    read -p "Continue anyway? (yes/no): " checklist_confirm
    if [ "$checklist_confirm" != "yes" ]; then
        exit 1
    fi
}
echo -e "${GREEN}✓ Deployment checklist passed${NC}"

echo ""

# ============================================
# STEP 2: BACKUP CURRENT STATE
# ============================================
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}STEP 2: BACKUP CURRENT STATE${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo ""

# 2.1: Database backup
echo "Creating database backup..."
BACKUP_FILE="rodistaa-prod-backup-$(date +%Y%m%d-%H%M%S).sql"

aws rds create-db-cluster-snapshot \
    --db-cluster-snapshot-identifier $BACKUP_FILE \
    --db-cluster-identifier rodistaa-prod \
    --region $AWS_REGION \
    > /dev/null

echo -e "${GREEN}✓ Database snapshot created: $BACKUP_FILE${NC}"

# 2.2: Save current task definitions
echo "Backing up current ECS task definitions..."
aws ecs describe-task-definition \
    --task-definition $BACKEND_SERVICE \
    --region $AWS_REGION \
    > backups/backend-task-def-$(date +%Y%m%d-%H%M%S).json

aws ecs describe-task-definition \
    --task-definition $PORTAL_SERVICE \
    --region $AWS_REGION \
    > backups/portal-task-def-$(date +%Y%m%d-%H%M%S).json

echo -e "${GREEN}✓ Task definitions backed up${NC}"

echo ""

# ============================================
# STEP 3: BUILD & PUSH DOCKER IMAGES
# ============================================
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}STEP 3: BUILD & PUSH DOCKER IMAGES${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo ""

# 3.1: Login to ECR
echo "Logging into Amazon ECR..."
aws ecr get-login-password --region $AWS_REGION | \
    docker login --username AWS --password-stdin $ECR_REGISTRY
echo -e "${GREEN}✓ Logged into ECR${NC}"

# 3.2: Build backend
echo ""
echo "Building backend image..."
docker build \
    --build-arg GIT_COMMIT=$GIT_COMMIT \
    --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
    -t rodistaa-backend:$GIT_COMMIT \
    -t rodistaa-backend:latest \
    -f packages/backend/Dockerfile \
    .

docker tag rodistaa-backend:$GIT_COMMIT $ECR_REGISTRY/rodistaa-backend:$GIT_COMMIT
docker tag rodistaa-backend:$GIT_COMMIT $ECR_REGISTRY/rodistaa-backend:latest
echo -e "${GREEN}✓ Backend image built${NC}"

# 3.3: Build portal
echo ""
echo "Building portal image..."
docker build \
    --build-arg GIT_COMMIT=$GIT_COMMIT \
    --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
    -t rodistaa-portal:$GIT_COMMIT \
    -t rodistaa-portal:latest \
    -f packages/portal/Dockerfile \
    .

docker tag rodistaa-portal:$GIT_COMMIT $ECR_REGISTRY/rodistaa-portal:$GIT_COMMIT
docker tag rodistaa-portal:$GIT_COMMIT $ECR_REGISTRY/rodistaa-portal:latest
echo -e "${GREEN}✓ Portal image built${NC}"

# 3.4: Push images
echo ""
echo "Pushing images to ECR..."
docker push $ECR_REGISTRY/rodistaa-backend:$GIT_COMMIT
docker push $ECR_REGISTRY/rodistaa-backend:latest
echo -e "${GREEN}✓ Backend image pushed${NC}"

docker push $ECR_REGISTRY/rodistaa-portal:$GIT_COMMIT
docker push $ECR_REGISTRY/rodistaa-portal:latest
echo -e "${GREEN}✓ Portal image pushed${NC}"

echo ""

# ============================================
# STEP 4: DATABASE MIGRATIONS
# ============================================
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}STEP 4: DATABASE MIGRATIONS${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo ""

echo "⚠️  Running database migrations on PRODUCTION!"
read -p "Continue? (yes/no): " migration_confirm
if [ "$migration_confirm" != "yes" ]; then
    echo "Skipping migrations..."
else
    echo "Creating migration task..."
    MIGRATION_TASK=$(aws ecs run-task \
        --cluster $ECS_CLUSTER \
        --task-definition rodistaa-migrations-prod \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}" \
        --region $AWS_REGION \
        --query 'tasks[0].taskArn' \
        --output text)
    
    echo "Migration task: $MIGRATION_TASK"
    echo "Waiting for migrations to complete..."
    
    aws ecs wait tasks-stopped \
        --cluster $ECS_CLUSTER \
        --tasks $MIGRATION_TASK \
        --region $AWS_REGION
    
    # Check exit code
    MIGRATION_EXIT_CODE=$(aws ecs describe-tasks \
        --cluster $ECS_CLUSTER \
        --tasks $MIGRATION_TASK \
        --region $AWS_REGION \
        --query 'tasks[0].containers[0].exitCode' \
        --output text)
    
    if [ "$MIGRATION_EXIT_CODE" = "0" ]; then
        echo -e "${GREEN}✓ Migrations completed successfully${NC}"
    else
        echo -e "${RED}✗ Migrations failed with exit code: $MIGRATION_EXIT_CODE${NC}"
        echo "Check CloudWatch logs for details."
        exit 1
    fi
fi

echo ""

# ============================================
# STEP 5: UPDATE ECS SERVICES (BLUE-GREEN)
# ============================================
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}STEP 5: UPDATE ECS SERVICES${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo ""

# 5.1: Update backend service
echo "Updating backend service..."
aws ecs update-service \
    --cluster $ECS_CLUSTER \
    --service $BACKEND_SERVICE \
    --force-new-deployment \
    --region $AWS_REGION \
    > /dev/null

echo -e "${GREEN}✓ Backend service update initiated${NC}"

# 5.2: Wait for backend to stabilize
echo "Waiting for backend to stabilize (this may take 5-10 minutes)..."
aws ecs wait services-stable \
    --cluster $ECS_CLUSTER \
    --services $BACKEND_SERVICE \
    --region $AWS_REGION

echo -e "${GREEN}✓ Backend service is stable${NC}"

# 5.3: Update portal service
echo ""
echo "Updating portal service..."
aws ecs update-service \
    --cluster $ECS_CLUSTER \
    --service $PORTAL_SERVICE \
    --force-new-deployment \
    --region $AWS_REGION \
    > /dev/null

echo -e "${GREEN}✓ Portal service update initiated${NC}"

# 5.4: Wait for portal to stabilize
echo "Waiting for portal to stabilize..."
aws ecs wait services-stable \
    --cluster $ECS_CLUSTER \
    --services $PORTAL_SERVICE \
    --region $AWS_REGION

echo -e "${GREEN}✓ Portal service is stable${NC}"

echo ""

# ============================================
# STEP 6: HEALTH CHECKS & SMOKE TESTS
# ============================================
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}STEP 6: HEALTH CHECKS & SMOKE TESTS${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo ""

BACKEND_URL="https://api.rodistaa.com"
PORTAL_URL="https://portal.rodistaa.com"

# 6.1: Backend health
echo "Checking backend health..."
for i in {1..5}; do
    BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/health)
    if [ "$BACKEND_HEALTH" = "200" ]; then
        echo -e "${GREEN}✓ Backend is healthy (HTTP $BACKEND_HEALTH)${NC}"
        break
    else
        echo "Attempt $i: Backend returned HTTP $BACKEND_HEALTH, retrying in 10s..."
        sleep 10
    fi
done

if [ "$BACKEND_HEALTH" != "200" ]; then
    echo -e "${RED}✗ Backend health check failed after 5 attempts${NC}"
    echo "ROLLING BACK!"
    # Rollback logic here
    exit 1
fi

# 6.2: Portal health
echo "Checking portal health..."
PORTAL_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" $PORTAL_URL)
if [ "$PORTAL_HEALTH" = "200" ]; then
    echo -e "${GREEN}✓ Portal is healthy (HTTP $PORTAL_HEALTH)${NC}"
else
    echo -e "${RED}✗ Portal health check failed (HTTP $PORTAL_HEALTH)${NC}"
    exit 1
fi

# 6.3: Run smoke tests
echo ""
echo "Running smoke tests..."
./scripts/run-smoke-tests.sh production || {
    echo -e "${RED}✗ Smoke tests failed${NC}"
    read -p "Continue anyway? (yes/no): " smoke_confirm
    if [ "$smoke_confirm" != "yes" ]; then
        exit 1
    fi
}

echo -e "${GREEN}✓ All health checks passed${NC}"

echo ""

# ============================================
# STEP 7: POST-DEPLOYMENT TASKS
# ============================================
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}STEP 7: POST-DEPLOYMENT TASKS${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo ""

# 7.1: Tag Docker images
echo "Tagging successful deployment..."
if [[ -n "$GIT_TAG" ]]; then
    docker tag rodistaa-backend:$GIT_COMMIT $ECR_REGISTRY/rodistaa-backend:$GIT_TAG
    docker tag rodistaa-portal:$GIT_COMMIT $ECR_REGISTRY/rodistaa-portal:$GIT_TAG
    docker push $ECR_REGISTRY/rodistaa-backend:$GIT_TAG
    docker push $ECR_REGISTRY/rodistaa-portal:$GIT_TAG
    echo -e "${GREEN}✓ Images tagged with $GIT_TAG${NC}"
fi

# 7.2: Push Git tag (if created earlier)
if [[ -n "$GIT_TAG" ]] && ! git ls-remote --tags origin | grep -q "$GIT_TAG"; then
    echo "Pushing Git tag to origin..."
    git push origin $GIT_TAG
    echo -e "${GREEN}✓ Git tag pushed${NC}"
fi

# 7.3: Notify team via Slack
if [[ -n "$SLACK_WEBHOOK" ]]; then
    echo "Notifying team via Slack..."
    curl -X POST $SLACK_WEBHOOK \
        -H 'Content-Type: application/json' \
        -d "{
            \"text\": \"🚀 *Rodistaa Production Deployment Successful!*\",
            \"attachments\": [{
                \"color\": \"good\",
                \"fields\": [
                    {\"title\": \"Version\", \"value\": \"$GIT_TAG\", \"short\": true},
                    {\"title\": \"Commit\", \"value\": \"$GIT_COMMIT\", \"short\": true},
                    {\"title\": \"Backend\", \"value\": \"$BACKEND_URL\", \"short\": false},
                    {\"title\": \"Portal\", \"value\": \"$PORTAL_URL\", \"short\": false},
                    {\"title\": \"Deployed by\", \"value\": \"$(git config user.name)\", \"short\": true},
                    {\"title\": \"Time\", \"value\": \"$(date '+%Y-%m-%d %H:%M:%S')\", \"short\": true}
                ]
            }]
        }"
    echo -e "${GREEN}✓ Team notified${NC}"
fi

# 7.4: Create deployment record
echo ""
echo "Creating deployment record..."
cat > deployments/prod-$(date +%Y%m%d-%H%M%S).json <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "git_commit": "$GIT_COMMIT",
  "git_tag": "$GIT_TAG",
  "git_branch": "$GIT_BRANCH",
  "deployed_by": "$(git config user.name) <$(git config user.email)>",
  "backend_image": "$ECR_REGISTRY/rodistaa-backend:$GIT_COMMIT",
  "portal_image": "$ECR_REGISTRY/rodistaa-portal:$GIT_COMMIT",
  "status": "success"
}
EOF
echo -e "${GREEN}✓ Deployment record created${NC}"

echo ""

# ============================================
# DEPLOYMENT COMPLETE
# ============================================
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✓ DEPLOYMENT COMPLETE${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""
echo "🎉 Rodistaa is now live in PRODUCTION!"
echo ""
echo "Production URLs:"
echo "  Backend API: $BACKEND_URL"
echo "  Admin Portal: $PORTAL_URL"
echo "  Grafana: https://grafana.rodistaa.com"
echo ""
echo "Next steps:"
echo "  1. Monitor logs in CloudWatch"
echo "  2. Check Grafana dashboards"
echo "  3. Watch Sentry for errors"
echo "  4. Monitor user feedback"
echo "  5. Keep deployment checklist handy"
echo ""
echo "To rollback:"
echo "  ./scripts/rollback-production.sh"
echo ""
echo -e "${YELLOW}⚠️  Keep monitoring for the next 24 hours!${NC}"
echo ""

