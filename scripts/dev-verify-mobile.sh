#!/bin/bash
# Mobile Apps Verification Script
# Collects logs, runs builds, and creates verification artifacts

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPORTS_DIR="$ROOT_DIR/reports/mobile"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
VERIFY_DIR="$REPORTS_DIR/verify_$TIMESTAMP"

mkdir -p "$VERIFY_DIR"
mkdir -p "$VERIFY_DIR/screenshots"

echo "🔍 Starting Mobile Apps Verification - $TIMESTAMP"
echo "Reports will be saved to: $VERIFY_DIR"

# Function to kill processes on port
kill_port() {
  local port=$1
  lsof -ti:$port | xargs kill -9 2>/dev/null || true
}

# Function to run Metro and capture logs
run_metro() {
  local app=$1
  local port=${2:-8081}
  echo "📱 Starting Metro for $app on port $port..."
  
  kill_port $port
  
  cd "$ROOT_DIR/packages/mobile/$app"
  npx react-native start --reset-cache --port $port > "$VERIFY_DIR/${app}-metro.log" 2>&1 &
  METRO_PID=$!
  echo $METRO_PID > "$VERIFY_DIR/${app}-metro.pid"
  
  sleep 5
  echo "✅ Metro started for $app (PID: $METRO_PID)"
}

# Function to run Android build
run_android() {
  local app=$1
  echo "🤖 Building Android app: $app"
  
  cd "$ROOT_DIR/packages/mobile/$app"
  
  # Run build and capture logs
  npx react-native run-android > "$VERIFY_DIR/${app}-android-run.log" 2>&1 || {
    echo "⚠️  Android build failed for $app, check logs"
  }
  
  # Capture adb logs
  adb logcat -d > "$VERIFY_DIR/${app}-adb.log" 2>&1 || {
    echo "⚠️  Could not capture adb logcat"
  }
  
  # Wait 30s for app to start
  sleep 30
  
  # Take screenshot
  adb shell screencap -p > "$VERIFY_DIR/screenshots/${app}-android.png" 2>&1 || {
    echo "⚠️  Could not take screenshot"
  }
  
  echo "✅ Android verification complete for $app"
}

# Function to run iOS build (macOS only)
run_ios() {
  local app=$1
  if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "⏭️  Skipping iOS (not on macOS)"
    return
  fi
  
  echo "🍎 Building iOS app: $app"
  
  cd "$ROOT_DIR/packages/mobile/$app"
  
  # Run build and capture logs
  npx react-native run-ios > "$VERIFY_DIR/${app}-ios-run.log" 2>&1 || {
    echo "⚠️  iOS build failed for $app, check logs"
  }
  
  # Wait 30s for app to start
  sleep 30
  
  echo "✅ iOS verification complete for $app"
}

# Copy key files
copy_files() {
  local app=$1
  local app_dir="$ROOT_DIR/packages/mobile/$app"
  
  mkdir -p "$VERIFY_DIR/$app"
  
  # Copy key configuration files
  cp "$app_dir/package.json" "$VERIFY_DIR/$app/" 2>/dev/null || true
  cp "$app_dir/app.json" "$VERIFY_DIR/$app/" 2>/dev/null || true
  cp "$app_dir/tsconfig.json" "$VERIFY_DIR/$app/" 2>/dev/null || true
  
  if [ -f "$app_dir/babel.config.js" ]; then
    cp "$app_dir/babel.config.js" "$VERIFY_DIR/$app/" 2>/dev/null || true
  fi
  
  if [ -f "$app_dir/index.js" ]; then
    cp "$app_dir/index.js" "$VERIFY_DIR/$app/" 2>/dev/null || true
  fi
  
  if [ -f "$app_dir/App.tsx" ]; then
    cp "$app_dir/App.tsx" "$VERIFY_DIR/$app/" 2>/dev/null || true
  fi
}

# Main verification flow
echo ""
echo "=== Phase 1: Operator App ==="
copy_files "operator"
run_metro "operator" 8081
run_android "operator"
# run_ios "operator" # Uncomment if on macOS
kill_port 8081

echo ""
echo "=== Phase 2: Driver App ==="
copy_files "driver"
run_metro "driver" 8082
run_android "driver"
# run_ios "driver" # Uncomment if on macOS
kill_port 8082

echo ""
echo "=== Phase 3: Shipper App ==="
copy_files "shipper"
run_metro "shipper" 8083
run_android "shipper"
# run_ios "shipper" # Uncomment if on macOS
kill_port 8083

# Create summary
cat > "$VERIFY_DIR/SUMMARY.md" <<EOF
# Mobile Apps Verification Summary

**Date**: $(date)
**Timestamp**: $TIMESTAMP

## Apps Verified

1. **Operator** - React Native CLI
2. **Driver** - Expo Router
3. **Shipper** - Expo Router

## Artifacts

- Metro logs: \`${app}-metro.log\`
- Android build logs: \`${app}-android-run.log\`
- ADB logs: \`${app}-adb.log\`
- Screenshots: \`screenshots/${app}-android.png\`
- Configuration files: \`${app}/*.json\`

## Next Steps

1. Review logs for errors
2. Check screenshots for blank screens
3. Verify app functionality manually
4. Address any issues found

EOF

# Create zip archive
cd "$REPORTS_DIR"
zip -r "verify_${TIMESTAMP}.zip" "verify_${TIMESTAMP}" > /dev/null 2>&1 || {
  echo "⚠️  Could not create zip archive (zip command not available)"
}

echo ""
echo "✅ Verification complete!"
echo "📦 Artifacts saved to: $VERIFY_DIR"
echo "📊 Summary: $VERIFY_DIR/SUMMARY.md"

# Cleanup Metro processes
kill_port 8081
kill_port 8082
kill_port 8083

echo "🧹 Cleaned up Metro processes"

