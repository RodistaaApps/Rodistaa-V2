#!/bin/bash

# Rodistaa Release Package Creator
# Creates a complete release package with all necessary files

set -e

VERSION=${1:-"1.0.0-rc1"}
DATE=$(date +%Y%m%d)
PACKAGE_NAME="rodistaa_release_${DATE}_v${VERSION}.zip"

echo "📦 Creating Rodistaa Release Package"
echo "Version: v${VERSION}"
echo "Package: ${PACKAGE_NAME}"
echo ""

# Ensure we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Must run from project root"
  exit 1
fi

# Clean and build
echo "🧹 Cleaning..."
pnpm -r clean || true

echo "🔨 Building packages..."
pnpm install --frozen-lockfile
pnpm -r build

echo "🧪 Running tests..."
pnpm -r test

echo "✅ All tests passed!"

# Create release package
echo "📦 Creating package..."
zip -r ${PACKAGE_NAME} . \
  -x "node_modules/*" \
  -x ".git/*" \
  -x "*.log" \
  -x "coverage/*" \
  -x ".env*" \
  -x "*.test.ts" \
  -x "*.spec.ts" \
  -x ".github/workflows/e2e.yml" \
  -x "logs/*" \
  -x "tmp/*" \
  -x ".DS_Store" \
  -x "*.swp" \
  -x "*~"

# Verify package
echo ""
echo "📋 Package contents:"
unzip -l ${PACKAGE_NAME} | head -20
echo "..."
echo ""

# Calculate size
SIZE=$(du -h ${PACKAGE_NAME} | cut -f1)
echo "✅ Package created: ${PACKAGE_NAME} (${SIZE})"
echo ""

# Create checksum
SHA256=$(sha256sum ${PACKAGE_NAME} | cut -d' ' -f1)
echo "🔐 SHA256: ${SHA256}"
echo ${SHA256} > ${PACKAGE_NAME}.sha256

echo ""
echo "✅ Release package ready!"
echo ""
echo "Next steps:"
echo "  1. Verify package: unzip -t ${PACKAGE_NAME}"
echo "  2. Upload to GitHub releases"
echo "  3. Update release notes with SHA256 checksum"

