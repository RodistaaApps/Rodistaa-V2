# Git Pull Before Work - Always pull latest before making changes
# This should be run before any development work

Write-Host "=== Pulling Latest from Git ===" -ForegroundColor Cyan
Write-Host ""

# Navigate to repository root
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "Error: Not a git repository!" -ForegroundColor Red
    exit 1
}

# Fetch and pull latest changes
Write-Host "Fetching latest changes..." -ForegroundColor Yellow
git fetch origin

Write-Host "Pulling from main branch..." -ForegroundColor Yellow
git pull origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Successfully pulled latest changes" -ForegroundColor Green
    Write-Host ""
    Write-Host "=== Latest Changes ===" -ForegroundColor Cyan
    git log --oneline -3
} else {
    Write-Host "⚠ Warning: Pull had conflicts or errors" -ForegroundColor Yellow
    Write-Host "Please resolve conflicts before continuing" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Repository is ready for work!" -ForegroundColor Green

