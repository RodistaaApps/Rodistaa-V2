# Git Push After Work - Commit and push changes after work
# This should be run after making any changes

param(
    [Parameter(Mandatory=$false)]
    [string]$Message = ""
)

Write-Host "=== Committing and Pushing Changes ===" -ForegroundColor Cyan
Write-Host ""

# Navigate to repository root
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "Error: Not a git repository!" -ForegroundColor Red
    exit 1
}

# Check for changes
$status = git status --porcelain
if (-not $status) {
    Write-Host "No changes to commit." -ForegroundColor Yellow
    exit 0
}

Write-Host "Changes detected:" -ForegroundColor Yellow
Write-Host $status
Write-Host ""

# Stage all changes
Write-Host "Staging all changes..." -ForegroundColor Yellow
git add .

# Get commit message
if ([string]::IsNullOrWhiteSpace($Message)) {
    $Message = Read-Host "Enter commit message"
    if ([string]::IsNullOrWhiteSpace($Message)) {
        $Message = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    }
}

# Commit changes
Write-Host "Committing changes..." -ForegroundColor Yellow
git commit -m $Message

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Commit failed" -ForegroundColor Red
    exit 1
}

# Push to remote
Write-Host "Pushing to remote repository..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Successfully pushed changes to git" -ForegroundColor Green
    Write-Host ""
    Write-Host "=== Latest Commit ===" -ForegroundColor Cyan
    git log --oneline -1
} else {
    Write-Host "Error: Push failed. Please check your connection and try again." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "All changes have been saved to git!" -ForegroundColor Green

