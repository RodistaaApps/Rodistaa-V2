#!/bin/bash
# Smoke Tests for Staging/Production
# Usage: ./scripts/run-smoke-tests.sh [environment]

set -e

ENVIRONMENT=${1:-staging}

if [ "$ENVIRONMENT" = "production" ]; then
    BASE_URL="https://api.rodistaa.com"
    PORTAL_URL="https://portal.rodistaa.com"
else
    BASE_URL="https://api-staging.rodistaa.com"
    PORTAL_URL="https://portal-staging.rodistaa.com"
fi

echo "🧪 Running Smoke Tests - $ENVIRONMENT Environment"
echo "=================================================="
echo "Base URL: $BASE_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS_COUNT=0
FAIL_COUNT=0

# Helper function to test endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local expected_status=$4
    local data=$5
    
    echo -n "Testing $name... "
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        ((PASS_COUNT++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $http_code)"
        echo "Response: $body"
        ((FAIL_COUNT++))
        return 1
    fi
}

# Test 1: Health Check
test_endpoint "Health Check" "GET" "/health" "200"

# Test 2: API v1 Base
test_endpoint "API v1 Base" "GET" "/v1" "200"

# Test 3: Request OTP
test_endpoint "Request OTP" "POST" "/v1/auth/otp" "200" '{"mobile":"+919876543210"}'

# Test 4: Invalid Login
test_endpoint "Invalid Login (401)" "POST" "/v1/auth/login" "401" '{"mobile":"+919876543210","otp":"000000"}'

# Test 5: Protected Route Without Auth
test_endpoint "Protected Route (401)" "GET" "/v1/bookings" "401"

# Test 6: Admin Portal
echo -n "Testing Admin Portal... "
portal_response=$(curl -s -o /dev/null -w "%{http_code}" "$PORTAL_URL")
if [ "$portal_response" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $portal_response)"
    ((PASS_COUNT++))
else
    echo -e "${RED}✗ FAIL${NC} (Got: $portal_response)"
    ((FAIL_COUNT++))
fi

# Test 7: Database Connection (via backend)
test_endpoint "Database Connection" "GET" "/v1/health/db" "200"

# Test 8: Redis Connection
test_endpoint "Redis Connection" "GET" "/v1/health/redis" "200"

# Test 9: Metrics Endpoint
test_endpoint "Metrics Endpoint" "GET" "/metrics" "200"

echo ""
echo "=================================================="
echo "Test Summary"
echo "=================================================="
echo -e "Passed: ${GREEN}$PASS_COUNT${NC}"
echo -e "Failed: ${RED}$FAIL_COUNT${NC}"
echo "Total: $((PASS_COUNT + FAIL_COUNT))"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}✓ All smoke tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Please investigate.${NC}"
    exit 1
fi

