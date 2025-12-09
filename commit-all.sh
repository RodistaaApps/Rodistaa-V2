#!/bin/bash
# Git Commit Script for Git Bash

cd /c/Rodistaa/Rodistaa-V2 || exit 1

echo "========================================"
echo "Git Commit Script"
echo "========================================"
echo ""

# Check if we're in a git repo
if [ ! -d .git ]; then
    echo "ERROR: Not a git repository!"
    exit 1
fi

echo "1. Current directory:"
pwd
echo ""

echo "2. Checking git status..."
git status --short | head -30
echo ""

echo "3. Staging all files..."
git add -A
echo "✓ Files staged"
echo ""

echo "4. Files to be committed:"
git status --short | head -30
echo ""

echo "5. Committing..."
git commit -m "feat: Complete freight estimation system, pricing engine, booking API, and design specs

- Mobile app verification reports and hardening
- Booking API integration from OpenAPI spec
- Design specs for Quick Book, Booking Detail, Live Tracking screens
- Pricing engine implementation (₹3/ton + ₹0.30/km)
- Freight estimation engine blueprint
- Database migration for freight estimation
- Freight estimator service microservice"

if [ $? -eq 0 ]; then
    echo "✓ Commit successful!"
else
    echo "✗ Commit failed"
    exit 1
fi

echo ""
echo "6. Latest commit:"
git log -1 --oneline --stat | head -30
echo ""

echo "7. Remote repository:"
git remote -v
echo ""

echo "8. Current branch:"
git branch --show-current
echo ""

echo "9. Attempting to push..."
echo "   (You may need to authenticate)"
git push origin HEAD

if [ $? -eq 0 ]; then
    echo "✓ Push successful!"
else
    echo ""
    echo "⚠ Push failed - authentication may be required"
    echo ""
    echo "To push manually, run:"
    echo "  git push origin HEAD"
    echo ""
    echo "Or set up authentication:"
    echo "  - Use GitHub CLI: gh auth login"
    echo "  - Or use Personal Access Token"
    echo "  - Or set up SSH key"
fi

echo ""
echo "========================================"
echo "Done!"
echo "========================================"

