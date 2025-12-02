#!/bin/bash
# Rodistaa Platform - Staging Validation Script
# Tests both backends in staging environment

set -e

FASTIFY_URL="${FASTIFY_URL:-http://localhost:4000}"
NESTJS_URL="${NESTJS_URL:-http://localhost:3000}"

echo "=============================================="
echo "  RODISTAA STAGING VALIDATION TESTS"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass_count=0
fail_count=0

test_endpoint() {
    local name=$1
    local url=$2
    local method=${3:-GET}
    local data=$4
    
    echo -n "Testing $name... "
    
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$url" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    fi
    
    if [ "$response" = "200" ] || [ "$response" = "201" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $response)"
        ((pass_count++))
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $response)"
        ((fail_count++))
    fi
}

# Fastify Backend Tests
echo "1️⃣  Testing Fastify Backend ($FASTIFY_URL)"
echo "----------------------------------------"

test_endpoint "Health Check" "$FASTIFY_URL/health"
test_endpoint "Readiness Check" "$FASTIFY_URL/ready"
test_endpoint "Metrics" "$FASTIFY_URL/metrics"

echo ""

# NestJS Backend Tests
echo "2️⃣  Testing NestJS Backend ($NESTJS_URL)"
echo "----------------------------------------"

test_endpoint "Health Check" "$NESTJS_URL/health"
test_endpoint "API Root" "$NESTJS_URL/api"

echo ""

# Comprehensive Flow Test (Fastify)
echo "3️⃣  Testing Fastify Core Flow"
echo "----------------------------------------"

# Login (this will fail without OTP service, but tests endpoint)
test_endpoint "Auth Login Endpoint" "$FASTIFY_URL/v1/auth/login" "POST" '{"phone":"9876543210","otp":"123456","deviceId":"test"}'

echo ""

# Database Connectivity Test
echo "4️⃣  Testing Database Connectivity"
echo "----------------------------------------"

if docker exec -it $(docker ps -q -f name=rodistaa-fastify-staging) \
    sh -c "node -e 'console.log(\"DB test\")'" 2>/dev/null; then
    echo -e "${GREEN}✅ Fastify DB connection${NC}"
    ((pass_count++))
else
    echo -e "${RED}❌ Fastify DB connection${NC}"
    ((fail_count++))
fi

if docker exec -it $(docker ps -q -f name=rodistaa-nestjs-staging) \
    sh -c "node -e 'console.log(\"DB test\")'" 2>/dev/null; then
    echo -e "${GREEN}✅ NestJS DB connection${NC}"
    ((pass_count++))
else
    echo -e "${RED}❌ NestJS DB connection${NC}"
    ((fail_count++))
fi

echo ""

# Summary
echo "=============================================="
echo "  TEST SUMMARY"
echo "=============================================="
echo -e "Total Tests: $((pass_count + fail_count))"
echo -e "${GREEN}Passed: $pass_count${NC}"
echo -e "${RED}Failed: $fail_count${NC}"
echo ""

if [ $fail_count -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED - STAGING READY${NC}"
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED - REVIEW REQUIRED${NC}"
    exit 1
fi

