# ⚠️ ACTION REQUIRED: Figma API Credentials

**Before using `pnpm figma:sync` or `pnpm token:full`, you MUST configure Figma API credentials.**

---

## 🔑 Required Environment Variables

### 1. `FIGMA_TOKEN`
**Purpose**: Personal access token with read access to Figma file

**How to Get**:
1. Visit: https://www.figma.com/settings
2. Scroll to "Personal access tokens"
3. Click "Generate new token"
4. Name: `Rodistaa Token Sync`
5. **Minimum scope**: ✅ `file:read`
6. Click "Generate token"
7. **Copy immediately** (you can only see it once!)

**Format**: `figd_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

### 2. `FIGMA_FILE_KEY`
**Purpose**: Identifies which Figma file to sync from

**How to Get**:
1. Open your Figma file with design tokens
2. Look at the URL:
   ```
   https://www.figma.com/design/{FILE_KEY}/Rodistaa-Design-System
                                ^^^^^^^^^^^^
                                This is your FILE_KEY
   ```
3. Copy the file key

**Example**: `aBc123XyZ456`

---

## 📝 Local Setup (Development)

### Step 1: Create .env File
```bash
cd packages/design-system-automation
cp ENV_TEMPLATE.txt .env
```

### Step 2: Edit .env
```bash
# .env (NEVER COMMIT THIS FILE!)
FIGMA_TOKEN=figd_YOUR_ACTUAL_TOKEN_HERE
FIGMA_FILE_KEY=YOUR_ACTUAL_FILE_KEY_HERE
```

### Step 3: Verify .env is Ignored
```bash
# .env should NOT appear in git status
git status

# If it appears, it's NOT in .gitignore (FIX IMMEDIATELY!)
```

### Step 4: Test Connection
```bash
pnpm figma:sync
# ✅ Should fetch tokens successfully
```

---

## 🏢 CI/CD Setup (GitHub Actions)

### Step 1: Add Secrets to GitHub Repository

1. **Go to Repository Settings**:
   - GitHub repo → **Settings** → **Secrets and variables** → **Actions**

2. **Add `FIGMA_TOKEN` Secret**:
   - Click **"New repository secret"**
   - Name: `FIGMA_TOKEN`
   - Value: `figd_your_actual_token`
   - Click **"Add secret"**

3. **Add `FIGMA_FILE_KEY` Secret**:
   - Click **"New repository secret"**
   - Name: `FIGMA_FILE_KEY`
   - Value: `your_actual_file_key`
   - Click **"Add secret"**

### Step 2: Verify Secrets
- Go to: Settings → Secrets → Actions
- Should see:
  - ✅ `FIGMA_TOKEN` (shows as ***)
  - ✅ `FIGMA_FILE_KEY` (shows as ***)

### Step 3: Test Workflow
- Go to: **Actions** tab
- Select: "Figma Token Sync (Automated)"
- Click: **"Run workflow"**
- Verify: ✅ Workflow completes successfully

---

## 🔒 Security Requirements

### ❌ NEVER:
- ❌ Commit `.env` file
- ❌ Commit tokens in code
- ❌ Share tokens via email/Slack
- ❌ Use tokens with excessive permissions
- ❌ Keep expired tokens active

### ✅ ALWAYS:
- ✅ Use `.env` file (local development)
- ✅ Use GitHub Secrets (CI/CD)
- ✅ Use minimum required scope (`file:read`)
- ✅ Rotate tokens quarterly
- ✅ Verify `.env` is in `.gitignore`
- ✅ Revoke tokens when no longer needed

---

## ✅ Setup Checklist

### Local Development
- [ ] Figma personal access token generated
- [ ] Token has `file:read` scope (minimum)
- [ ] Figma file key extracted from URL
- [ ] `.env` file created from `ENV_TEMPLATE.txt`
- [ ] `FIGMA_TOKEN` added to `.env`
- [ ] `FIGMA_FILE_KEY` added to `.env`
- [ ] Verified `.env` is in `.gitignore`
- [ ] Tested with `pnpm figma:sync`

### CI/CD (GitHub Actions)
- [ ] `FIGMA_TOKEN` added to GitHub Secrets
- [ ] `FIGMA_FILE_KEY` added to GitHub Secrets
- [ ] Workflow file exists (`.github/workflows/figma-token-sync.yml`)
- [ ] Tested manual workflow trigger
- [ ] Verified PR creation works

---

## 🧪 Testing Your Setup

### Test 1: Check Environment Variables
```bash
cd packages/design-system-automation

# Should print SET for both
node -e "require('dotenv').config(); console.log('FIGMA_TOKEN:', process.env.FIGMA_TOKEN ? 'SET' : 'NOT SET'); console.log('FIGMA_FILE_KEY:', process.env.FIGMA_FILE_KEY ? 'SET' : 'NOT SET');"
```

**Expected Output**:
```
FIGMA_TOKEN: SET
FIGMA_FILE_KEY: SET
```

### Test 2: Test Figma API Connection
```bash
pnpm figma:sync
```

**Expected Output**:
```
Fetching variables from Figma file: {your_file_key}
✅ Written tokens JSON to ../design-system/tokens/tokens.json
📊 Synced X variables from Figma
```

### Test 3: Run Full Workflow
```bash
pnpm token:full
```

**Expected**: All steps complete successfully ✅

---

## 🚨 Troubleshooting

### Error: "Missing FIGMA_TOKEN or FIGMA_FILE_KEY"
**Fix**: Create `.env` file with both variables

### Error: "401 Unauthorized"
**Fix**: Check token is valid, regenerate if expired

### Error: "403 Forbidden"
**Fix**: Ensure token has `file:read` scope

### Error: "404 Not Found"
**Fix**: Verify file key is correct from Figma URL

---

## 📞 Support

**Need Help?**

1. Read: `FIGMA_CREDENTIALS_SETUP.md` (complete guide)
2. Read: `GITHUB_SECRETS_SETUP.md` (CI/CD setup)
3. Check: `.env` file exists and has correct format
4. Verify: Token hasn't expired
5. Test: `pnpm figma:sync` with verbose output

---

## 🎯 Quick Reference

### Environment Variables
```bash
# Required (use one of these names):
FIGMA_TOKEN=figd_xxxxx              # Preferred
FIGMA_ACCESS_TOKEN=figd_xxxxx       # Alternative (both work)

# Required:
FIGMA_FILE_KEY=aBc123XyZ456
```

### Commands
```bash
pnpm figma:sync        # Test connection
pnpm token:full        # Complete workflow
pnpm tokens:validate   # Validate only
```

### GitHub Secrets
```
Name: FIGMA_TOKEN
Name: FIGMA_FILE_KEY
```

---

**⚠️ REMINDER**: Figma API credentials MUST be provided as environment variables to run figma-sync.

**Security**: 
- ✅ Do NOT commit tokens to repo
- ✅ Use GitHub Secrets for CI/CD
- ✅ `.env` is in `.gitignore`

---

*ACTION_REQUIRED.md v1.0*  
*Last Updated: December 3, 2025*  
*Critical: Configure before using Figma sync*

