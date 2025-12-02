#!/bin/bash
# Rodistaa Platform - Staging Deployment Script
# Deploys both Fastify and NestJS backends to staging

set -e

echo "=============================================="
echo "  RODISTAA PLATFORM - STAGING DEPLOYMENT"
echo "=============================================="
echo ""

# Configuration
FASTIFY_PORT=4000
NESTJS_PORT=3000
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="rodistaa_staging"
DB_USER="rodistaa_user"
STAGING_DOMAIN_V1="${STAGING_DOMAIN_V1:-staging-api-v1.rodistaa.com}"
STAGING_DOMAIN_V2="${STAGING_DOMAIN_V2:-staging-api-v2.rodistaa.com}"

echo "📋 Configuration:"
echo "  - Fastify Backend: Port $FASTIFY_PORT"
echo "  - NestJS Backend: Port $NESTJS_PORT"
echo "  - Database: $DB_HOST:$DB_PORT/$DB_NAME"
echo "  - Domain V1: $STAGING_DOMAIN_V1"
echo "  - Domain V2: $STAGING_DOMAIN_V2"
echo ""

# Step 1: Database Setup
echo "1️⃣  Setting up database..."
psql -U postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "Database already exists"
psql -U postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || echo "User already exists"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

# Create schemas
psql -U $DB_USER -d $DB_NAME -c "CREATE SCHEMA IF NOT EXISTS fastify;"
psql -U $DB_USER -d $DB_NAME -c "CREATE SCHEMA IF NOT EXISTS nestjs;"
echo "✅ Database ready"
echo ""

# Step 2: Deploy Fastify Backend
echo "2️⃣  Deploying Fastify Backend..."
cd ~/rodistaa-fastify || {
    echo "Cloning Fastify backend repository..."
    git clone https://github.com/rodistaa/rodistaa.git ~/rodistaa-fastify
    cd ~/rodistaa-fastify
}

git checkout develop
git pull origin develop

# Build Docker image
echo "Building Fastify Docker image..."
docker build -t rodistaa-fastify:staging -f Dockerfile .

# Create environment file
cat > .env.staging << EOF
NODE_ENV=staging
PORT=$FASTIFY_PORT
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?schema=fastify
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
LOCAL_KMS_KEY_ID=kyc-encryption-key-staging
ACS_RULES_PATH=./acs_rules_top25.yaml
ADAPTER_MODE=MOCK
LOG_LEVEL=info
EOF

# Run migrations
echo "Running Fastify migrations..."
docker run --rm \
  --env-file .env.staging \
  --network host \
  rodistaa-fastify:staging \
  sh -c "cd packages/backend && node dist/scripts/migrate-latest.js"

# Stop old container if exists
docker stop rodistaa-fastify-staging 2>/dev/null || true
docker rm rodistaa-fastify-staging 2>/dev/null || true

# Start container
echo "Starting Fastify container..."
docker run -d \
  --name rodistaa-fastify-staging \
  --env-file .env.staging \
  --network host \
  --restart unless-stopped \
  rodistaa-fastify:staging

# Wait for startup
echo "Waiting for Fastify to start..."
sleep 10

# Test health
if curl -f http://localhost:$FASTIFY_PORT/health; then
    echo "✅ Fastify Backend deployed successfully"
else
    echo "❌ Fastify Backend health check failed"
    docker logs rodistaa-fastify-staging
    exit 1
fi
echo ""

# Step 3: Deploy NestJS Backend
echo "3️⃣  Deploying NestJS Backend..."
cd ~/rodistaa-nestjs || {
    echo "Cloning NestJS backend repository..."
    git clone https://github.com/rodistaa/new-userui-app.git ~/rodistaa-nestjs
    cd ~/rodistaa-nestjs/backend
}

cd backend
git checkout main
git pull origin main

# Build Docker image
echo "Building NestJS Docker image..."
docker build -t rodistaa-nestjs:staging -f Dockerfile ..

# Create environment file
cat > .env.staging << EOF
NODE_ENV=staging
PORT=$NESTJS_PORT
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?schema=nestjs
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
REDIS_URL=redis://localhost:6379
LOG_LEVEL=info
EOF

# Run Prisma migrations
echo "Running NestJS/Prisma migrations..."
docker run --rm \
  --env-file .env.staging \
  --network host \
  rodistaa-nestjs:staging \
  npx prisma migrate deploy

# Stop old container if exists
docker stop rodistaa-nestjs-staging 2>/dev/null || true
docker rm rodistaa-nestjs-staging 2>/dev/null || true

# Start container
echo "Starting NestJS container..."
docker run -d \
  --name rodistaa-nestjs-staging \
  --env-file .env.staging \
  --network host \
  --restart unless-stopped \
  rodistaa-nestjs:staging

# Wait for startup
echo "Waiting for NestJS to start..."
sleep 15

# Test health
if curl -f http://localhost:$NESTJS_PORT/health; then
    echo "✅ NestJS Backend deployed successfully"
else
    echo "❌ NestJS Backend health check failed"
    docker logs rodistaa-nestjs-staging
    exit 1
fi
echo ""

# Step 4: Run Smoke Tests
echo "4️⃣  Running smoke tests..."

echo "Testing Fastify backend..."
curl -f http://localhost:$FASTIFY_PORT/health || exit 1
curl -f http://localhost:$FASTIFY_PORT/ready || exit 1
echo "✅ Fastify smoke tests passed"

echo "Testing NestJS backend..."
curl -f http://localhost:$NESTJS_PORT/health || exit 1
echo "✅ NestJS smoke tests passed"

echo ""
echo "=============================================="
echo "  ✅ STAGING DEPLOYMENT COMPLETE"
echo "=============================================="
echo ""
echo "Fastify Backend: http://localhost:$FASTIFY_PORT"
echo "NestJS Backend: http://localhost:$NESTJS_PORT"
echo ""
echo "Next steps:"
echo "1. Monitor logs for 1 hour"
echo "2. Run comprehensive testing"
echo "3. Validate mobile app connections"
echo ""
echo "Monitoring commands:"
echo "  docker logs -f rodistaa-fastify-staging"
echo "  docker logs -f rodistaa-nestjs-staging"
echo ""

