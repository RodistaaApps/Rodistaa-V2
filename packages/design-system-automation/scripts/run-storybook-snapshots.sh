#!/usr/bin/env bash
#
# run-storybook-snapshots.sh
# - Builds Storybook and runs Playwright visual regression tests
# - Usage: pnpm storybook:snap
#

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/../.." || exit 1  # repo root

echo "🎨 Starting Storybook visual regression tests..."
echo ""

# Build Storybook
echo "📦 Building Storybook..."
pnpm --filter @rodistaa/portal build-storybook || pnpm --filter @rodistaa/portal build-storybook

echo "✅ Storybook built successfully"
echo ""

# Run Playwright tests for visual snapshots
echo "📸 Running visual snapshot tests with Playwright..."

npx playwright test packages/design-system-automation/visual-regression.spec.ts --reporter=list || {
  echo "❌ Playwright visual tests failed — exit with non-zero"
  exit 2
}

echo ""
echo "✅ Visual tests passed!"
echo "🎉 Storybook snapshot testing complete!"
echo ""

