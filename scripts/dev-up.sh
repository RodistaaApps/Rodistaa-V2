#!/usr/bin/env bash

set -euo pipefail

echo "🚀 Starting Rodistaa development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker and try again."
  exit 1
fi

# Start Docker Compose services
echo "📦 Starting Postgres and Redis..."
docker-compose up -d

# Wait for Postgres to be ready
echo "⏳ Waiting for Postgres to be ready..."
until docker exec rodistaa-postgres pg_isready -U rodistaa > /dev/null 2>&1; do
  echo "   Postgres is unavailable - sleeping..."
  sleep 1
done

echo "✅ Postgres is ready!"

# Wait for Redis to be ready
echo "⏳ Waiting for Redis to be ready..."
until docker exec rodistaa-redis redis-cli ping > /dev/null 2>&1; do
  echo "   Redis is unavailable - sleeping..."
  sleep 1
done

echo "✅ Redis is ready!"

# Run migrations
echo "🗄️  Running database migrations..."
cd packages/backend
pnpm migrate:local || echo "⚠️  Migrations failed or already applied"
cd ../..

# Start all services in parallel
echo "🚀 Starting all services..."
pnpm dev:all

