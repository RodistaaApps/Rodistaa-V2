#!/usr/bin/env bash
# Rodistaa Local Verification Script
# Runs comprehensive verification of the local development environment

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Timestamp for reports
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_DIR="reports/local_run_${TIMESTAMP}"
mkdir -p "$REPORT_DIR"

log_info() {
    echo -e "${BLUE}ℹ${NC} $1" | tee -a "$REPORT_DIR/verification.log"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1" | tee -a "$REPORT_DIR/verification.log"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1" | tee -a "$REPORT_DIR/verification.log"
}

log_error() {
    echo -e "${RED}✗${NC} $1" | tee -a "$REPORT_DIR/verification.log"
}

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

test_pass() {
    TESTS_PASSED=$((TESTS_PASSED + 1))
    log_success "$1"
}

test_fail() {
    TESTS_FAILED=$((TESTS_FAILED + 1))
    log_error "$1"
}

# Start verification
log_info "Starting Rodistaa Local Verification"
log_info "Report directory: $REPORT_DIR"
echo ""

# 1. Build & Lint
log_info "=== Step 1: Build & Lint ==="
if pnpm run build:all > "$REPORT_DIR/build.log" 2>&1; then
    test_pass "Build successful"
else
    test_fail "Build failed - check $REPORT_DIR/build.log"
fi

if pnpm run lint:all > "$REPORT_DIR/lint.log" 2>&1; then
    test_pass "Lint passed"
else
    test_fail "Lint failed - check $REPORT_DIR/lint.log"
fi
echo ""

# 2. Unit Tests
log_info "=== Step 2: Unit Tests ==="
if pnpm run test:all > "$REPORT_DIR/unit-tests.log" 2>&1; then
    test_pass "Unit tests passed"
else
    test_fail "Unit tests failed - check $REPORT_DIR/unit-tests.log"
fi
echo ""

# 3. Service Health Checks
log_info "=== Step 3: Service Health Checks ==="
services=(
    "http://localhost:4000/health:Backend API"
    "http://localhost:3001/health:Admin Portal"
    "http://localhost:3002/health:Franchise Portal"
    "http://localhost:5000/health:Mocks Service"
    "http://localhost:6006:Storybook"
)

for service in "${services[@]}"; do
    url=$(echo "$service" | cut -d: -f1-3)
    name=$(echo "$service" | cut -d: -f4)
    
    if curl -sf "$url" > /dev/null 2>&1; then
        test_pass "$name is healthy"
    else
        test_fail "$name is not responding"
    fi
done
echo ""

# 4. Database Verification
log_info "=== Step 4: Database Verification ==="
if command -v psql > /dev/null 2>&1; then
    if PGPASSWORD=postgres psql -h localhost -U postgres -d rodistaa_local -c "SELECT COUNT(*) FROM users;" > "$REPORT_DIR/db-check.log" 2>&1; then
        test_pass "Database accessible"
        
        # Check seeded data
        USER_COUNT=$(PGPASSWORD=postgres psql -h localhost -U postgres -d rodistaa_local -t -c "SELECT COUNT(*) FROM users;" | tr -d ' ')
        if [ "$USER_COUNT" -gt "0" ]; then
            test_pass "Users seeded ($USER_COUNT users)"
        else
            test_fail "No users found in database"
        fi
        
        TRUCK_COUNT=$(PGPASSWORD=postgres psql -h localhost -U postgres -d rodistaa_local -t -c "SELECT COUNT(*) FROM trucks;" | tr -d ' ')
        if [ "$TRUCK_COUNT" -gt "0" ]; then
            test_pass "Trucks seeded ($TRUCK_COUNT trucks)"
        else
            test_fail "No trucks found in database"
        fi
    else
        test_fail "Database not accessible"
    fi
else
    log_warn "psql not found - skipping database checks"
fi
echo ""

# 5. API Smoke Tests
log_info "=== Step 5: API Smoke Tests ==="
if curl -sf http://localhost:4000/api/bookings > "$REPORT_DIR/api-bookings.json" 2>&1; then
    BOOKING_COUNT=$(jq '. | length' "$REPORT_DIR/api-bookings.json" 2>/dev/null || echo "0")
    if [ "$BOOKING_COUNT" -gt "0" ]; then
        test_pass "Bookings API working ($BOOKING_COUNT bookings)"
    else
        test_fail "Bookings API returned empty"
    fi
else
    test_fail "Bookings API not accessible"
fi
echo ""

# 6. Playwright Portal Tests
log_info "=== Step 6: Playwright Portal Tests ==="
if [ -d "packages/portal/tests" ]; then
    cd packages/portal
    if pnpm run test:e2e > "$SCRIPT_DIR/$REPORT_DIR/playwright.log" 2>&1; then
        test_pass "Playwright tests passed"
        # Copy Playwright report if exists
        if [ -d "test-results" ]; then
            cp -r test-results "$SCRIPT_DIR/$REPORT_DIR/playwright-report" 2>/dev/null || true
        fi
    else
        test_fail "Playwright tests failed - check $REPORT_DIR/playwright.log"
    fi
    cd "$SCRIPT_DIR"
else
    log_warn "Playwright tests not found - skipping"
fi
echo ""

# 7. Design System Token Validation
log_info "=== Step 7: Design System Token Validation ==="
if [ -f "packages/design-system/scripts/validate-tokens.js" ]; then
    cd packages/design-system
    if node scripts/validate-tokens.js > "$SCRIPT_DIR/$REPORT_DIR/token-validation.log" 2>&1; then
        test_pass "Token validation passed"
    else
        test_fail "Token validation failed - check $REPORT_DIR/token-validation.log"
    fi
    cd "$SCRIPT_DIR"
else
    log_warn "Token validation script not found - skipping"
fi
echo ""

# 8. Security Check (no secrets in code)
log_info "=== Step 8: Security Check ==="
if command -v git-secrets > /dev/null 2>&1; then
    if git-secrets --scan > "$REPORT_DIR/security-scan.log" 2>&1; then
        test_pass "No secrets found in code"
    else
        test_fail "Potential secrets found - check $REPORT_DIR/security-scan.log"
    fi
else
    log_warn "git-secrets not installed - skipping security scan"
    # Basic check for common patterns
    if ! grep -r "password.*=.*['\"].*[a-zA-Z0-9]" --include="*.ts" --include="*.js" packages/ 2>/dev/null | grep -v "example\|mock\|test" > "$REPORT_DIR/security-basic.log"; then
        test_pass "Basic security check passed"
    else
        test_fail "Potential hardcoded credentials found"
    fi
fi
echo ""

# 9. Backend Logs (last 200 lines)
log_info "=== Step 9: Collecting Backend Logs ==="
if [ -f "logs/backend.log" ]; then
    tail -n 200 logs/backend.log > "$REPORT_DIR/backend-logs.txt"
    test_pass "Backend logs collected"
else
    log_warn "Backend logs not found"
fi
echo ""

# 10. Database Snapshot (latest 20 audit rows)
log_info "=== Step 10: Database Snapshot ==="
if command -v psql > /dev/null 2>&1; then
    PGPASSWORD=postgres psql -h localhost -U postgres -d rodistaa_local -c "SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 20;" > "$REPORT_DIR/db-snapshot.txt" 2>&1 || true
    test_pass "Database snapshot collected"
fi
echo ""

# Summary
log_info "=== Verification Summary ==="
echo "Tests Passed: $TESTS_PASSED" | tee -a "$REPORT_DIR/verification.log"
echo "Tests Failed: $TESTS_FAILED" | tee -a "$REPORT_DIR/verification.log"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    log_success "All verifications passed!"
    
    # Create ZIP archive
    log_info "Creating report archive..."
    cd reports
    zip -r "local_run_${TIMESTAMP}.zip" "local_run_${TIMESTAMP}" > /dev/null 2>&1
    cd "$SCRIPT_DIR"
    
    log_success "Report archive created: reports/local_run_${TIMESTAMP}.zip"
    exit 0
else
    log_error "Some verifications failed. Check $REPORT_DIR for details."
    
    # Still create ZIP archive
    cd reports
    zip -r "local_run_${TIMESTAMP}.zip" "local_run_${TIMESTAMP}" > /dev/null 2>&1
    cd "$SCRIPT_DIR"
    
    exit 1
fi

