# 🤖 AI Agent Git-First Workflow

## CRITICAL WORKFLOW RULES

**From now on, ALL code operations must follow this workflow:**

### 1. BEFORE ANY CODE CHANGES
```bash
# Always pull latest from git first
git fetch origin
git pull origin main
```

### 2. AFTER ANY CODE CHANGES
```bash
# Always commit and push immediately
git add .
git commit -m "Description of changes"
git push origin main
```

### 3. PERIODIC SYNC (Every 30 minutes or after major operations)
```bash
# Sync with remote repository
git fetch origin
git pull origin main
git push origin main  # if there are local changes
```

## Workflow Scripts

### Quick Commands
- **Pull before work**: `.\scripts\git-pull-before-work.ps1`
- **Push after work**: `.\scripts\git-push-after-work.ps1`
- **Full sync**: `.\scripts\git-sync.ps1`

### Manual Commands
```powershell
# Pull latest
cd C:\Rodistaa
git fetch origin
git pull origin main

# Commit and push
git add .
git commit -m "Your commit message"
git push origin main
```

## Important Notes

1. **Never work on local files without syncing with git first**
2. **Always pull before making changes** to avoid conflicts
3. **Always push after making changes** to save work to git
4. **If push fails**, pull first, resolve conflicts, then push again
5. **Repository is the source of truth**, not local storage

## Current Repository
- **Location**: C:\Rodistaa
- **Remote**: https://github.com/RodistaaApps/Rodistaa-V2.git
- **Branch**: main

## Status Check
```bash
git status          # Check current status
git log --oneline -5  # See recent commits
git remote -v       # Verify remote URL
```

