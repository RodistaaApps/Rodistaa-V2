# 🔐 Figma API Credentials Setup Guide

**Required for Figma ↔ Code Token Synchronization**

---

## ⚠️ ACTION REQUIRED

Before running `pnpm figma:sync` or `pnpm token:full`, you MUST configure Figma API credentials.

---

## 🔑 Required Environment Variables

### 1. `FIGMA_TOKEN` (or `FIGMA_ACCESS_TOKEN`)
**Purpose**: Personal access token for Figma API authentication

**Required Scope**: `file:read` (minimum)

**Note**: Script accepts both `FIGMA_TOKEN` and `FIGMA_ACCESS_TOKEN` environment variables.

**How to Get**:

1. **Go to Figma Settings**:
   - Navigate to: https://www.figma.com/settings
   - Or: Figma → Settings (⚙️) → Account

2. **Generate Personal Access Token**:
   - Scroll to "Personal access tokens" section
   - Click **"Generate new token"**
   - Name: `Rodistaa Token Sync`
   - Scopes: Select **`file:read`** (required)
   - Click **"Generate token"**

3. **Copy Token Immediately**:
   ```
   figd_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   ⚠️ **You can only see this token once!** Save it securely.

---

### 2. `FIGMA_FILE_KEY`
**Purpose**: Identifies which Figma file to sync from

**How to Get**:

1. **Open Your Figma File**:
   - Open the file containing your design tokens

2. **Extract File Key from URL**:
   ```
   URL Format:
   https://www.figma.com/design/{FILE_KEY}/Project-Name?...
   
   Example:
   https://www.figma.com/design/aBc123XyZ456/Rodistaa-Design-System
                                  ^^^^^^^^^^^^
                                  This is your FILE_KEY
   ```

3. **Copy the File Key**:
   ```
   aBc123XyZ456
   ```

---

## 📝 Setup Instructions

### Local Development Setup

1. **Create `.env` file**:
   ```bash
   cd packages/design-system-automation
   cp ENV_TEMPLATE.txt .env
   ```

2. **Edit `.env` with your credentials**:
   ```bash
   # .env (DO NOT COMMIT!)
   FIGMA_TOKEN=figd_YOUR_ACTUAL_TOKEN_HERE
   FIGMA_FILE_KEY=YOUR_ACTUAL_FILE_KEY_HERE
   
   # Alternative (both work):
   # FIGMA_ACCESS_TOKEN=figd_YOUR_ACTUAL_TOKEN_HERE
   ```

3. **Verify `.env` is in `.gitignore`**:
   ```bash
   # Check that .env is ignored
   git status  # .env should NOT appear
   ```

4. **Test connection**:
   ```bash
   pnpm figma:sync
   # Should fetch tokens successfully ✅
   ```

---

## 🔒 Security Best Practices

### ❌ **NEVER DO THIS**:
```bash
# ❌ DON'T commit .env
git add .env  # NEVER!

# ❌ DON'T hardcode tokens
const token = 'figd_xxxxx';  // NEVER!

# ❌ DON'T share tokens publicly
# ❌ DON'T commit tokens.json with embedded tokens
```

### ✅ **ALWAYS DO THIS**:
```bash
# ✅ Use .env file (gitignored)
# ✅ Use environment variables
# ✅ Use CI/CD secrets (for automation)
# ✅ Rotate tokens quarterly
# ✅ Use minimum required scopes
```

---

## 🏢 CI/CD Setup (GitHub Actions)

### Add Secrets to GitHub

1. **Go to Repository Settings**:
   - GitHub repo → Settings → Secrets and variables → Actions

2. **Add New Repository Secret**:
   - Click **"New repository secret"**
   - Name: `FIGMA_ACCESS_TOKEN`
   - Value: `figd_YOUR_TOKEN`
   - Click **"Add secret"**

3. **Add File Key Secret**:
   - Click **"New repository secret"**
   - Name: `FIGMA_FILE_KEY`
   - Value: `YOUR_FILE_KEY`
   - Click **"Add secret"**

### Use in GitHub Actions

Update `.github/workflows/token-validation.yml`:

```yaml
- name: Sync from Figma
  env:
    FIGMA_ACCESS_TOKEN: ${{ secrets.FIGMA_ACCESS_TOKEN }}
    FIGMA_FILE_KEY: ${{ secrets.FIGMA_FILE_KEY }}
  run: |
    cd packages/design-system-automation
    pnpm figma:sync
```

---

## 🧪 Testing Your Setup

### Test 1: Verify Environment Variables
```bash
cd packages/design-system-automation

# Check .env exists
ls -la .env

# Test loading (should not print token)
node -e "require('dotenv').config(); console.log('✅ FIGMA_ACCESS_TOKEN:', process.env.FIGMA_ACCESS_TOKEN ? 'SET' : 'NOT SET'); console.log('✅ FIGMA_FILE_KEY:', process.env.FIGMA_FILE_KEY ? 'SET' : 'NOT SET');"
```

**Expected Output**:
```
✅ FIGMA_ACCESS_TOKEN: SET
✅ FIGMA_FILE_KEY: SET
```

### Test 2: Test Figma API Connection
```bash
pnpm figma:sync
```

**Expected Output**:
```
🎨 Figma Token Sync - Starting...
📡 Fetching Figma file variables...
✅ Fetched X variables from Figma
🔄 Converting Figma variables to token format...
✅ Token sync complete!
```

**If you see errors**, check:
- ✅ Token is valid (not expired)
- ✅ File key is correct
- ✅ Token has `file:read` permission
- ✅ You have access to the file

---

## 🚨 Troubleshooting

### Error: "401 Unauthorized"
**Cause**: Invalid or expired token

**Fix**:
1. Generate new token in Figma settings
2. Update `.env` with new token
3. Retry `pnpm figma:sync`

---

### Error: "403 Forbidden"
**Cause**: Token doesn't have access to file

**Fix**:
1. Verify token has `file:read` scope
2. Verify you have access to the Figma file
3. Regenerate token if needed

---

### Error: "404 Not Found"
**Cause**: Invalid `FIGMA_FILE_KEY`

**Fix**:
1. Double-check file key from Figma URL
2. Ensure you copied the correct part
3. Verify file exists and you have access

---

### Error: "FIGMA_ACCESS_TOKEN not found"
**Cause**: `.env` file not loaded or missing variable

**Fix**:
```bash
# 1. Verify .env exists
ls -la .env

# 2. Verify content
cat .env

# 3. Ensure variable name is exact
# Must be: FIGMA_ACCESS_TOKEN (not FIGMA_TOKEN)
```

---

## 📋 Credential Checklist

### Before Running `pnpm figma:sync`

- [ ] Figma personal access token generated
- [ ] Token has `file:read` scope
- [ ] Figma file key extracted from URL
- [ ] `.env` file created (from ENV_TEMPLATE.txt)
- [ ] `FIGMA_ACCESS_TOKEN` set in `.env`
- [ ] `FIGMA_FILE_KEY` set in `.env`
- [ ] `.env` is in `.gitignore` (verify!)
- [ ] Tested with `pnpm figma:sync`

### Before CI/CD Automation

- [ ] `FIGMA_ACCESS_TOKEN` added to GitHub Secrets
- [ ] `FIGMA_FILE_KEY` added to GitHub Secrets
- [ ] Workflow file updated to use secrets
- [ ] Tested in CI/CD pipeline

---

## 🔐 Security Checklist

### Local Development
- [x] `.env` file in `.gitignore`
- [x] Tokens never committed to repo
- [x] `.env.template` provided (no actual tokens)
- [x] Tokens stored securely (password manager)

### CI/CD
- [ ] Use GitHub Secrets (not environment variables)
- [ ] Minimum token scope (`file:read` only)
- [ ] Rotate tokens quarterly
- [ ] Audit token usage logs

### Team Access
- [ ] Each developer has own token (not shared)
- [ ] Tokens revoked when team member leaves
- [ ] Token access logged and monitored
- [ ] File access restricted (Figma permissions)

---

## 📞 Support

### If You Need Help

**Token Issues**:
- Check Figma settings → Personal access tokens
- Verify token hasn't expired
- Regenerate if needed

**File Access Issues**:
- Verify you're a member of the Figma file
- Check file permissions
- Contact file owner if needed

**Script Issues**:
- Check `.env` file exists and has correct format
- Verify variable names are exact
- Run with verbose logging (add `DEBUG=*` to `.env`)

---

## 🎯 Quick Reference

### Environment Variables
```bash
# Required
FIGMA_ACCESS_TOKEN=figd_xxxxxxxxxxxxxxxxxxxx
FIGMA_FILE_KEY=aBc123XyZ456

# Optional
FIGMA_PAGE_NAME=Design Tokens  # Specific page to sync
```

### Common Commands
```bash
# Test credentials
pnpm figma:sync

# Full workflow
pnpm token:full

# Validate only
pnpm tokens:validate
```

---

## ✅ Final Verification

Run this to verify everything is set up correctly:

```bash
cd packages/design-system-automation

# 1. Check .env exists
if [ -f .env ]; then echo "✅ .env exists"; else echo "❌ .env missing"; fi

# 2. Load and check variables
node -e "require('dotenv').config(); console.log('FIGMA_ACCESS_TOKEN:', process.env.FIGMA_ACCESS_TOKEN ? '✅ SET' : '❌ NOT SET'); console.log('FIGMA_FILE_KEY:', process.env.FIGMA_FILE_KEY ? '✅ SET' : '❌ NOT SET');"

# 3. Test Figma connection
pnpm figma:sync
```

**Expected**: All ✅ and successful token fetch!

---

**Once configured, you can run `pnpm token:full` to sync everything automatically!** 🚀

---

*Figma Credentials Setup Guide v1.0*  
*Last Updated: December 3, 2025*  
*Security Level: HIGH - Handle with care*

