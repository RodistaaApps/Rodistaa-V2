# 🔐 GitHub Secrets Setup for Figma Token Sync

**Configure GitHub repository secrets for automated Figma token synchronization**

---

## 🎯 Purpose

Enable **automated Figma token sync** in CI/CD without exposing credentials.

---

## 📋 Required Secrets

### 1. `FIGMA_TOKEN`
**Purpose**: Figma personal access token for API authentication

**Steps to Add**:

1. **Get Your Figma Token**:
   - Go to: https://www.figma.com/settings
   - Scroll to "Personal access tokens"
   - Click "Generate new token"
   - Name: `Rodistaa CI/CD`
   - Scope: ✅ `file:read` (minimum required)
   - Click "Generate token"
   - Copy token: `figd_xxxxxxxxxxxxx`

2. **Add to GitHub Secrets**:
   - Go to your GitHub repository
   - Click **Settings** → **Secrets and variables** → **Actions**
   - Click **"New repository secret"**
   - Name: `FIGMA_TOKEN`
   - Value: `figd_xxxxxxxxxxxxx` (paste your token)
   - Click **"Add secret"**

**Note**: Script accepts both `FIGMA_TOKEN` and `FIGMA_ACCESS_TOKEN` for compatibility.

---

### 2. `FIGMA_FILE_KEY`
**Purpose**: Identifies which Figma file contains design tokens

**Steps to Add**:

1. **Get Your File Key**:
   - Open your Figma file with design tokens
   - Copy file key from URL:
     ```
     https://www.figma.com/design/{FILE_KEY}/Rodistaa-Design-System
                                  ^^^^^^^^^^^^
     ```
   - Example: `aBc123XyZ456`

2. **Add to GitHub Secrets**:
   - Go to: Settings → Secrets and variables → Actions
   - Click **"New repository secret"**
   - Name: `FIGMA_FILE_KEY`
   - Value: `aBc123XyZ456` (your file key)
   - Click **"Add secret"**

---

## ✅ Verification

### Check Secrets Are Set

1. Go to: **Settings** → **Secrets and variables** → **Actions**
2. You should see:
   - ✅ `FIGMA_TOKEN` (shows as `***`)
   - ✅ `FIGMA_FILE_KEY` (shows as `***`)

---

## 🔄 How It's Used

### In GitHub Actions Workflow

**File**: `.github/workflows/figma-token-sync.yml`

```yaml
- name: Sync from Figma API
  env:
    FIGMA_TOKEN: ${{ secrets.FIGMA_TOKEN }}
    FIGMA_FILE_KEY: ${{ secrets.FIGMA_FILE_KEY }}
  run: |
    cd packages/design-system-automation
    pnpm figma:sync
```

**Security**:
- ✅ Secrets are **never** printed in logs
- ✅ Only accessible during workflow execution
- ✅ Encrypted at rest
- ✅ Access logged by GitHub

---

## 🧪 Test the Workflow

### Manual Trigger

1. Go to: **Actions** tab in GitHub
2. Select **"Figma Token Sync (Automated)"** workflow
3. Click **"Run workflow"**
4. Click **"Run workflow"** button

**Expected**:
- ✅ Workflow runs successfully
- ✅ Fetches tokens from Figma
- ✅ Generates TypeScript files
- ✅ Creates PR if changes detected

---

## 🔒 Security Best Practices

### DO ✅
- ✅ Use repository secrets (encrypted)
- ✅ Minimum token scope (`file:read` only)
- ✅ Rotate tokens quarterly
- ✅ Audit secret usage (GitHub provides logs)
- ✅ Limit who can access secrets (repo admins only)

### DON'T ❌
- ❌ Commit tokens to code
- ❌ Put tokens in workflow files
- ❌ Share tokens via email/Slack
- ❌ Use tokens with broad scopes
- ❌ Keep expired tokens active

---

## 📅 Automated Sync Schedule

### Weekly Sync (Monday 9 AM UTC)

The workflow runs automatically every Monday to check for Figma updates:

```yaml
on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9 AM UTC
```

**What Happens**:
1. Fetches latest tokens from Figma
2. Generates TypeScript files
3. Validates compliance
4. Creates PR if changes detected
5. Team reviews and merges

**Benefits**:
- ✅ Always in sync with Figma
- ✅ No manual work required
- ✅ PR review process maintained
- ✅ Change tracking in git history

---

## 🚨 Troubleshooting

### Workflow Fails with "401 Unauthorized"

**Cause**: Invalid or expired `FIGMA_ACCESS_TOKEN`

**Fix**:
1. Generate new token in Figma
2. Update GitHub secret:
   - Settings → Secrets → Actions
   - Click `FIGMA_ACCESS_TOKEN`
   - Click "Update secret"
   - Paste new token

---

### Workflow Fails with "403 Forbidden"

**Cause**: Token doesn't have `file:read` permission

**Fix**:
1. Generate new token with correct scope
2. Update GitHub secret

---

### Workflow Fails with "404 Not Found"

**Cause**: Invalid `FIGMA_FILE_KEY`

**Fix**:
1. Verify file key from Figma URL
2. Update GitHub secret with correct key

---

### No PR Created After Workflow Runs

**Cause**: No token changes detected

**Result**: This is normal! Workflow only creates PR if tokens changed.

---

## 📞 Support Checklist

Before Asking for Help:

- [ ] Verified both secrets are set in GitHub
- [ ] Token has `file:read` scope
- [ ] File key is correct (from Figma URL)
- [ ] You have access to the Figma file
- [ ] Token hasn't expired
- [ ] Checked workflow logs for specific error

---

## 🎯 Quick Setup Checklist

- [ ] Generate Figma personal access token
- [ ] Set token scope to `file:read`
- [ ] Extract file key from Figma URL
- [ ] Add `FIGMA_ACCESS_TOKEN` to GitHub Secrets
- [ ] Add `FIGMA_FILE_KEY` to GitHub Secrets
- [ ] Verify secrets are set (show as ***)
- [ ] Test workflow manually (Actions → Run workflow)
- [ ] Verify PR is created if changes exist
- [ ] Review and merge PR

---

## 📖 Related Documentation

- **Setup Guide**: `FIGMA_CREDENTIALS_SETUP.md`
- **Sync Guide**: `docs/FIGMA_TOKEN_SYNC.md`
- **Automation README**: `packages/design-system-automation/README.md`

---

## ✅ Final Verification

Once secrets are configured, test with:

```bash
# Local test (requires .env)
cd packages/design-system-automation
pnpm figma:sync

# GitHub Actions test
# Go to Actions → Figma Token Sync → Run workflow
```

**Expected**: ✅ Successful token fetch and PR creation (if changes)

---

**Security Note**: These secrets provide **read-only** access to your Figma file. No write or delete permissions.

---

*GitHub Secrets Setup Guide v1.0*  
*Last Updated: December 3, 2025*  
*Security: Repository Administrators Only*

