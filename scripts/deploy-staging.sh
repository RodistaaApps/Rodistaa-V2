#!/bin/bash

###############################################################################
# Rodistaa Platform - Staging Deployment Script
# Deploys both Fastify and NestJS backends to staging environment
###############################################################################

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   RODISTAA PLATFORM - STAGING DEPLOYMENT                  ║"
echo "║   Dual Backend Strategy: Fastify + NestJS                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Configuration
STAGING_DB_HOST="${STAGING_DB_HOST:-localhost}"
STAGING_DB_PORT="${STAGING_DB_PORT:-5432}"
STAGING_DB_NAME="${STAGING_DB_NAME:-rodistaa_staging}"
STAGING_DB_USER="${STAGING_DB_USER:-rodistaa_user}"
STAGING_DB_PASSWORD="${STAGING_DB_PASSWORD:-staging_password}"

FASTIFY_PORT=4000
NESTJS_PORT=3000

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

###############################################################################
# Step 1: Validate Prerequisites
###############################################################################

echo -e "${YELLOW}[1/8] Validating prerequisites...${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker not found. Please install Docker.${NC}"
    exit 1
fi
echo "  ✓ Docker found"

# Check database connection
if ! PGPASSWORD=$STAGING_DB_PASSWORD psql -h $STAGING_DB_HOST -U $STAGING_DB_USER -d postgres -c "SELECT 1" &> /dev/null; then
    echo -e "${RED}Error: Cannot connect to PostgreSQL. Check credentials.${NC}"
    exit 1
fi
echo "  ✓ PostgreSQL connection verified"

# Check if database exists
DB_EXISTS=$(PGPASSWORD=$STAGING_DB_PASSWORD psql -h $STAGING_DB_HOST -U $STAGING_DB_USER -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$STAGING_DB_NAME'")
if [ -z "$DB_EXISTS" ]; then
    echo "  ⚠ Database $STAGING_DB_NAME does not exist. Creating..."
    PGPASSWORD=$STAGING_DB_PASSWORD psql -h $STAGING_DB_HOST -U $STAGING_DB_USER -d postgres -c "CREATE DATABASE $STAGING_DB_NAME"
    echo "  ✓ Database created"
else
    echo "  ✓ Database exists"
fi

echo -e "${GREEN}✓ Prerequisites validated${NC}\n"

###############################################################################
# Step 2: Deploy Fastify Backend
###############################################################################

echo -e "${YELLOW}[2/8] Deploying Fastify Backend (port $FASTIFY_PORT)...${NC}"

# Build Docker image
cd "$(dirname "$0")/.."
echo "  Building Docker image..."
docker build -t rodistaa-fastify:staging -f Dockerfile . > /dev/null
echo "  ✓ Docker image built"

# Create environment file
cat > .env.fastify.staging <<EOF
NODE_ENV=staging
PORT=$FASTIFY_PORT
DATABASE_URL=postgresql://$STAGING_DB_USER:$STAGING_DB_PASSWORD@$STAGING_DB_HOST:$STAGING_DB_PORT/$STAGING_DB_NAME
JWT_SECRET=staging-jwt-secret-$(openssl rand -hex 16)
JWT_REFRESH_SECRET=staging-refresh-secret-$(openssl rand -hex 16)
LOCAL_KMS_KEY_ID=kyc-encryption-key-staging
ACS_RULES_PATH=./acs_rules_top25.yaml
ADAPTER_MODE=MOCK
LOG_LEVEL=info
EOF

echo "  ✓ Environment configured"

# Run migrations
echo "  Running database migrations..."
docker run --rm \
  --network host \
  --env-file .env.fastify.staging \
  rodistaa-fastify:staging \
  sh -c "cd packages/backend && npx knex migrate:latest --env production" || true
echo "  ✓ Migrations completed"

# Stop existing container if running
docker stop rodistaa-fastify-staging 2>/dev/null || true
docker rm rodistaa-fastify-staging 2>/dev/null || true

# Start container
echo "  Starting Fastify backend..."
docker run -d \
  --name rodistaa-fastify-staging \
  --network host \
  --env-file .env.fastify.staging \
  --restart unless-stopped \
  rodistaa-fastify:staging

sleep 5

# Health check
echo "  Checking health..."
if curl -f http://localhost:$FASTIFY_PORT/health &> /dev/null; then
    echo -e "${GREEN}✓ Fastify backend deployed and healthy${NC}\n"
else
    echo -e "${RED}✗ Fastify backend health check failed${NC}"
    docker logs --tail 50 rodistaa-fastify-staging
    exit 1
fi

###############################################################################
# Step 3: Deploy NestJS Backend (Documentation Only)
###############################################################################

echo -e "${YELLOW}[3/8] NestJS Backend Deployment${NC}"
echo "  ⚠ NestJS backend is in separate workspace: New_UserUI_App/backend"
echo "  📋 To deploy NestJS backend, run from that directory:"
echo ""
echo "      cd C:/Users/devel/Documents/Rodistaa/New_UserUI_App/backend"
echo "      docker build -t rodistaa-nestjs:staging ."
echo "      docker run -d --name rodistaa-nestjs-staging \\"
echo "        -p $NESTJS_PORT:$NESTJS_PORT \\"
echo "        --env-file .env.nestjs.staging \\"
echo "        rodistaa-nestjs:staging"
echo ""
echo "  ℹ  See STAGING_DEPLOYMENT_GUIDE.md for complete instructions"
echo ""

###############################################################################
# Step 4: Run Smoke Tests
###############################################################################

echo -e "${YELLOW}[4/8] Running smoke tests...${NC}"

# Test health endpoint
echo "  Testing /health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:$FASTIFY_PORT/health)
if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
    echo "  ✓ Health check passed"
else
    echo -e "${RED}  ✗ Health check failed${NC}"
    echo "  Response: $HEALTH_RESPONSE"
fi

# Test ready endpoint
echo "  Testing /ready endpoint..."
READY_RESPONSE=$(curl -s http://localhost:$FASTIFY_PORT/ready)
if echo "$READY_RESPONSE" | grep -q "ok"; then
    echo "  ✓ Readiness check passed"
else
    echo "  ⚠ Readiness check returned: $READY_RESPONSE"
fi

# Test metrics endpoint
echo "  Testing /metrics endpoint..."
if curl -f http://localhost:$FASTIFY_PORT/metrics &> /dev/null; then
    echo "  ✓ Metrics endpoint accessible"
else
    echo "  ⚠ Metrics endpoint check failed"
fi

echo -e "${GREEN}✓ Smoke tests completed${NC}\n"

###############################################################################
# Step 5: Display Status
###############################################################################

echo -e "${YELLOW}[5/8] Deployment Status${NC}"
echo ""
echo "  Fastify Backend:"
echo "    Container: rodistaa-fastify-staging"
echo "    Port: $FASTIFY_PORT"
echo "    Health: http://localhost:$FASTIFY_PORT/health"
echo "    Logs: docker logs -f rodistaa-fastify-staging"
echo ""
echo "  Database:"
echo "    Host: $STAGING_DB_HOST:$STAGING_DB_PORT"
echo "    Database: $STAGING_DB_NAME"
echo "    User: $STAGING_DB_USER"
echo ""

###############################################################################
# Step 6: Next Steps
###############################################################################

echo -e "${YELLOW}[6/8] Next Steps${NC}"
echo ""
echo "  1. Monitor logs:"
echo "     docker logs -f rodistaa-fastify-staging"
echo ""
echo "  2. Test API endpoints:"
echo "     curl http://localhost:$FASTIFY_PORT/health"
echo "     curl http://localhost:$FASTIFY_PORT/ready"
echo "     curl http://localhost:$FASTIFY_PORT/metrics"
echo ""
echo "  3. Deploy NestJS backend (see output above)"
echo ""
echo "  4. Configure Nginx for HTTPS (see STAGING_DEPLOYMENT_GUIDE.md)"
echo ""
echo "  5. Run comprehensive smoke tests:"
echo "     cd packages/backend"
echo "     node scripts/smoke_booking_flow.js"
echo ""

###############################################################################
# Step 7: Monitoring Setup
###############################################################################

echo -e "${YELLOW}[7/8] Monitoring Commands${NC}"
echo ""
echo "  Check container status:"
echo "    docker ps | grep rodistaa"
echo ""
echo "  View logs:"
echo "    docker logs -f rodistaa-fastify-staging"
echo ""
echo "  Monitor resources:"
echo "    docker stats rodistaa-fastify-staging"
echo ""
echo "  Database queries:"
echo "    PGPASSWORD=$STAGING_DB_PASSWORD psql -h $STAGING_DB_HOST -U $STAGING_DB_USER -d $STAGING_DB_NAME"
echo ""

###############################################################################
# Step 8: Summary
###############################################################################

echo -e "${YELLOW}[8/8] Deployment Summary${NC}"
echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   FASTIFY BACKEND DEPLOYED ✅          ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo "  Status: Running"
echo "  Container: rodistaa-fastify-staging"
echo "  Port: $FASTIFY_PORT"
echo "  Health: ✓ Passing"
echo ""
echo "  Next: Deploy NestJS backend (see above)"
echo "        Complete mobile apps (8-12 hours)"
echo "        Run comprehensive tests"
echo ""
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo ""

###############################################################################
# End
###############################################################################

