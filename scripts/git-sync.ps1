# Git Sync Script - Pull and Push to keep repository in sync
# Run this periodically to sync with remote repository

param(
    [switch]$Force = $false
)

Write-Host "=== Git Sync Script ===" -ForegroundColor Cyan
Write-Host ""

# Navigate to repository root
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "Error: Not a git repository!" -ForegroundColor Red
    exit 1
}

# Fetch latest changes
Write-Host "Fetching latest changes from remote..." -ForegroundColor Yellow
git fetch origin
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to fetch from remote" -ForegroundColor Red
    exit 1
}

# Check for local changes
$status = git status --porcelain
if ($status -and -not $Force) {
    Write-Host "Warning: You have uncommitted changes:" -ForegroundColor Yellow
    Write-Host $status
    Write-Host ""
    $response = Read-Host "Do you want to commit and push these changes? (y/n)"
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Host "Staging all changes..." -ForegroundColor Yellow
        git add .
        $commitMsg = Read-Host "Enter commit message (or press Enter for auto-message)"
        if ([string]::IsNullOrWhiteSpace($commitMsg)) {
            $commitMsg = "Auto-sync: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        }
        git commit -m $commitMsg
        Write-Host "Pushing changes..." -ForegroundColor Yellow
        git push origin main
    } else {
        Write-Host "Skipping commit. Pulling changes only..." -ForegroundColor Yellow
    }
}

# Pull latest changes
Write-Host "Pulling latest changes from main branch..." -ForegroundColor Yellow
git pull origin main --no-edit
if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: Pull had conflicts or errors. Please resolve manually." -ForegroundColor Yellow
}

# Show current status
Write-Host ""
Write-Host "=== Current Git Status ===" -ForegroundColor Cyan
git status

Write-Host ""
Write-Host "=== Recent Commits ===" -ForegroundColor Cyan
git log --oneline -5

Write-Host ""
Write-Host "Sync complete!" -ForegroundColor Green

