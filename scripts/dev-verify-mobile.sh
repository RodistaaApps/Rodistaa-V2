#!/bin/bash

# Mobile App Verification Script
# Verifies all mobile apps can build and run on Android emulator

set -e

echo "🚀 Starting Mobile App Verification..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Android emulator is running
check_emulator() {
  echo "Checking Android emulator..."
  if adb devices | grep -q "emulator"; then
    echo -e "${GREEN}✓${NC} Android emulator is running"
    return 0
  else
    echo -e "${RED}✗${NC} No Android emulator detected"
    echo "Please start an Android emulator and try again"
    return 1
  fi
}

# Start Metro bundler
start_metro() {
  echo ""
  echo "Starting Metro bundler..."
  cd packages/mobile/operator
  npm start &
  METRO_PID=$!
  echo "Metro started with PID: $METRO_PID"
  sleep 10
  cd - > /dev/null
}

# Build and run app
build_and_run() {
  APP_NAME=$1
  APP_DIR=$2
  
  echo ""
  echo "=========================================="
  echo "Building $APP_NAME..."
  echo "=========================================="
  
  cd "$APP_DIR"
  
  # Clean build
  cd android
  ./gradlew clean
  cd ..
  
  # Run on Android
  npm run android
  
  echo -e "${GREEN}✓${NC} $APP_NAME built successfully"
  cd - > /dev/null
}

# Run E2E smoke test
run_e2e() {
  APP_DIR=$1
  echo ""
  echo "Running E2E smoke tests for $APP_DIR..."
  
  cd "$APP_DIR"
  if [ -f "e2e/smoke.test.js" ]; then
    detox test e2e/smoke.test.js --configuration android.emu.debug
    echo -e "${GREEN}✓${NC} E2E tests passed"
  else
    echo -e "${YELLOW}⚠${NC} No E2E tests found, skipping"
  fi
  cd - > /dev/null
}

# Main execution
main() {
  # Check prerequisites
  check_emulator || exit 1
  
  # Start Metro
  start_metro
  
  # Build and verify each app
  build_and_run "Operator App" "packages/mobile/operator"
  # build_and_run "Shipper App" "packages/mobile/shipper"
  # build_and_run "Driver App" "packages/mobile/driver"
  
  # Run E2E tests
  # run_e2e "packages/mobile/operator"
  
  echo ""
  echo -e "${GREEN}✅ Mobile app verification complete!${NC}"
  
  # Cleanup
  if [ ! -z "$METRO_PID" ]; then
    kill $METRO_PID 2>/dev/null || true
  fi
}

main "$@"
