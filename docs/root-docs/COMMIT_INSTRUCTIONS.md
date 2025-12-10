# Commit Instructions for Git Bash

## Quick Commands

Run these commands in your Git Bash terminal:

```bash
cd /c/Rodistaa/Rodistaa-V2

# Stage all changes
git add -A

# Check what will be committed
git status

# Commit
git commit -m "feat: Complete freight estimation system, pricing engine, booking API, and design specs"

# Push (will prompt for authentication)
git push origin HEAD
```

## Or Use the Script

I've created a script for you. Run:

```bash
cd /c/Rodistaa/Rodistaa-V2
bash commit-all.sh
```

## If Push Requires Authentication

### Option 1: Personal Access Token (Easiest)

1. Go to GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name like "Rodistaa-V2"
4. Select scope: `repo` (full control of private repositories)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again)
7. When `git push` asks for password, paste the token (not your GitHub password)

### Option 2: GitHub CLI

```bash
# Install GitHub CLI first, then:
gh auth login
git push origin HEAD
```

### Option 3: SSH Key

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub: Settings → SSH and GPG keys → New SSH key

# Change remote to SSH
git remote set-url origin git@github.com:YOUR_USERNAME/YOUR_REPO.git

# Test
ssh -T git@github.com

# Push
git push origin HEAD
```

## Files Being Committed

- `docs/design-specs/` - All design specifications
- `docs/architecture/freight-estimation-engine-blueprint.md`
- `packages/backend/src/services/pricing/` - Pricing engine
- `packages/backend/src/services/freight-estimator/` - Freight estimator service
- `packages/backend/migrations/014_freight_estimation_corridors.sql`
- `packages/mobile-shared/src/types/booking-api.ts`
- `packages/mobile-shared/src/api/booking-client.ts`
- `packages/mobile-shared/src/api/booking-hooks.ts`
- And all other changes from today
