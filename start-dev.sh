#!/bin/bash

# Rodistaa Platform - Development Startup Script
# Starts all services for local development

set -e

echo "🚀 Starting Rodistaa Platform (Local Development)"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found${NC}"
    echo "Please install Docker Desktop: https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo -e "${GREEN}✅ Docker found${NC}"

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running${NC}"
    echo "Please start Docker Desktop"
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Start services with docker-compose
echo -e "${YELLOW}Starting services with docker-compose...${NC}"
docker-compose up -d

# Wait for services to be healthy
echo ""
echo -e "${YELLOW}Waiting for services to be ready...${NC}"

# Wait for PostgreSQL
echo -n "PostgreSQL: "
until docker-compose exec -T postgres pg_isready -U rodistaa &> /dev/null; do
    echo -n "."
    sleep 1
done
echo -e " ${GREEN}Ready ✅${NC}"

# Wait for Backend
echo -n "Backend API: "
for i in {1..30}; do
    if curl -f http://localhost:4000/health &> /dev/null; then
        echo -e " ${GREEN}Ready ✅${NC}"
        break
    fi
    echo -n "."
    sleep 2
done

# Wait for ACS
echo -n "ACS Service: "
for i in {1..20}; do
    if curl -f http://localhost:5000/health &> /dev/null; then
        echo -e " ${GREEN}Ready ✅${NC}"
        break
    fi
    echo -n "."
    sleep 2
done

# Wait for Portal
echo -n "Portal: "
for i in {1..30}; do
    if curl -f http://localhost:3001 &> /dev/null; then
        echo -e " ${GREEN}Ready ✅${NC}"
        break
    fi
    echo -n "."
    sleep 2
done

echo ""
echo "=================================================="
echo -e "${GREEN}✅ All services are running!${NC}"
echo "=================================================="
echo ""
echo "Services:"
echo "  🔧 Backend API:    http://localhost:4000"
echo "  🛡️  ACS Service:    http://localhost:5000"
echo "  🌐 Admin Portal:   http://localhost:3001"
echo "  📊 API Docs:       http://localhost:4000/docs"
echo "  🗄️  PostgreSQL:     localhost:5432"
echo "  📦 Redis:          localhost:6379"
echo ""
echo "Test Credentials:"
echo "  Phone: 9876543210"
echo "  OTP: 123456 (mock)"
echo ""
echo "To stop services:"
echo "  docker-compose down"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f [service-name]"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"

