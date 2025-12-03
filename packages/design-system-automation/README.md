# @rodistaa/design-system-automation

**Automated Figma ↔ Code token synchronization for Rodistaa Design System**

---

## 🎯 Purpose

This package provides complete automation for:
- 🔄 Bidirectional token sync (Figma ↔ Code)
- ✅ Token validation & drift detection
- 📸 Visual regression testing (Storybook)
- 🚀 One-command full sync workflow

---

## 📦 Installation

```bash
cd packages/design-system-automation
pnpm install
```

---

## ⚙️ Setup

### 1. Configure Figma Access

Create `.env` file (copy from `ENV_TEMPLATE.txt`):

```bash
FIGMA_ACCESS_TOKEN=figd_YOUR_TOKEN
FIGMA_FILE_KEY=YOUR_FILE_KEY
```

**Get Figma Token**:
1. Go to https://www.figma.com/settings
2. Scroll to "Personal access tokens"
3. Click "Generate new token"
4. Copy token to `.env`

**Get File Key**:
- From Figma URL: `https://www.figma.com/file/{FILE_KEY}/...`

---

## 🚀 Available Commands

### 1. `pnpm figma:sync`
**Purpose**: Fetch tokens from Figma API → tokens.json

```bash
pnpm figma:sync
```

**What it does**:
- Connects to Figma API
- Fetches all design variables
- Converts to tokens.json format
- Saves to `../design-system/tokens/tokens.json`

**When to use**: After designer updates tokens in Figma

---

### 2. `pnpm tokens:generate`
**Purpose**: Generate TypeScript files from tokens.json

```bash
pnpm tokens:generate
```

**What it does**:
- Reads `tokens.json`
- Generates `colors.ts`, `spacing.ts`
- Formats with Prettier
- Saves to `../design-system/src/tokens/`

**When to use**: After `figma:sync` or manual `tokens.json` updates

---

### 3. `pnpm tokens:validate`
**Purpose**: Validate token integrity & brand compliance

```bash
pnpm tokens:validate
```

**What it checks**:
- ✅ Token structure complete
- ✅ **Rodistaa Red (#C90D0D)** enforced
- ✅ **Baloo Bhai** font enforced
- ✅ **Times New Roman** font enforced
- ✅ Spacing scale (4/8/12/16/24/32/48) enforced
- ✅ Color formats valid (#RRGGBB)
- ✅ No hardcoded values in components
- ✅ TypeScript files in sync

**Exit code**:
- `0`: All checks passed ✅
- `1`: Validation failed ❌ (blocks commit)

**When to use**: Before committing, in CI/CD

---

### 4. `pnpm storybook:snap`
**Purpose**: Visual regression testing with Playwright

```bash
pnpm storybook:snap
```

**What it does**:
- Starts Storybook (if not running)
- Captures screenshots of all components
- Compares with baseline snapshots
- Reports visual differences

**When to use**: After token updates, before releasing

---

### 5. `pnpm token:full` ⭐ (Recommended)
**Purpose**: Complete token sync workflow

```bash
pnpm token:full
```

**What it does** (in sequence):
1. `figma:sync` - Fetch from Figma
2. `tokens:generate` - Generate TypeScript
3. `tokens:validate` - Validate compliance
4. `storybook:snap` - Visual regression check

**When to use**: Weekly sync, before major releases

---

## 🔄 Workflows

### Workflow 1: Designer Updates Tokens in Figma

```bash
# 1. Designer updates tokens in Figma
# 2. Run full sync
cd packages/design-system-automation
pnpm token:full

# 3. Review changes
git diff ../design-system/tokens/
git diff ../design-system/src/tokens/

# 4. Commit if valid
git add ../design-system/
git commit -m "chore(tokens): sync from Figma"
git push
```

---

### Workflow 2: Developer Updates Tokens in Code

```bash
# 1. Edit tokens.json directly
vim packages/design-system/tokens/tokens.json

# 2. Generate TypeScript
cd packages/design-system-automation
pnpm tokens:generate

# 3. Validate
pnpm tokens:validate

# 4. Push to Figma
# (Import tokens.json in Figma via Figma Tokens plugin)

# 5. Commit
git add ../design-system/
git commit -m "feat(tokens): add new spacing token"
git push
```

---

## 📋 Token Structure in Figma

### Required Figma Variables Structure

```
Design Tokens/
├── Color/
│   ├── primary → #C90D0D
│   ├── white → #FFFFFF
│   ├── black → #1A1A1A
│   ├── gray → #4F4F4F
│   ├── lightGray → #F4F4F4
│   ├── success → #17B169
│   ├── warning → #FDBA21
│   ├── error → #E03131
│   └── info → #2F80ED
├── Typography/
│   ├── heading → Baloo Bhai
│   └── body → Times New Roman
├── Font Size/
│   ├── 12 → 12
│   ├── 14 → 14
│   ├── 16 → 16
│   ├── 18 → 18
│   ├── 20 → 20
│   ├── 24 → 24
│   └── 32 → 32
├── Line Height/
│   ├── tight → 1.1
│   ├── normal → 1.4
│   └── relaxed → 1.6
├── Spacing/
│   ├── 4 → 4
│   ├── 8 → 8
│   ├── 12 → 12
│   ├── 16 → 16
│   ├── 24 → 24
│   ├── 32 → 32
│   └── 48 → 48
├── Border Radius/
│   ├── sm → 4
│   ├── md → 6
│   ├── lg → 8
│   └── xl → 12
└── Shadows/
    ├── sm → 0px 1px 3px rgba(0,0,0,0.08)
    ├── md → 0px 3px 6px rgba(0,0,0,0.1)
    └── lg → 0px 6px 12px rgba(0,0,0,0.12)
```

---

## ✅ Validation Rules

### Brand Compliance (ENFORCED)

| Token | Required Value | Validation |
|-------|----------------|------------|
| `color.primary` | `#C90D0D` | ❌ Blocks commit if violated |
| `font.heading` | `Baloo Bhai` | ❌ Blocks commit if violated |
| `font.body` | `Times New Roman` | ❌ Blocks commit if violated |
| `space.*` | 4/8/12/16/24/32/48 only | ⚠️ Warns on non-standard |

---

## 📸 Visual Regression Testing

### How It Works

1. **Baseline Capture**:
   ```bash
   pnpm storybook:snap  # First run creates baseline
   ```

2. **After Token Changes**:
   ```bash
   pnpm storybook:snap  # Compares with baseline
   ```

3. **Review Differences**:
   - Check `snapshots/current/` vs `snapshots/baseline/`
   - Approve visual changes
   - Update baseline if intentional

---

## 🛠️ Troubleshooting

### Figma API Returns 403
- ✅ Check `FIGMA_ACCESS_TOKEN` is valid
- ✅ Token must have file access permissions
- ✅ Regenerate token if expired

### Validation Fails
```bash
pnpm tokens:validate  # See specific errors
# Fix in tokens.json
pnpm tokens:generate
```

### Hardcoded Values Detected
```bash
pnpm tokens:scan  # From design-system package
# Replace hardcoded values with tokens
```

---

## 📁 Output Files

| File | Purpose |
|------|---------|
| `../design-system/tokens/tokens.json` | Source of truth (Figma sync) |
| `../design-system/src/tokens/colors.ts` | Generated TypeScript (colors) |
| `../design-system/src/tokens/spacing.ts` | Generated TypeScript (spacing) |
| `snapshots/baseline/` | Baseline screenshots |
| `snapshots/current/` | Current screenshots |

---

## 🔗 Integration with CI/CD

### GitHub Actions
The token validation runs automatically on PR:

```yaml
# .github/workflows/token-validation.yml
- run: pnpm tokens:validate
```

### Pre-commit Hook
Validates tokens before commit:

```bash
# .husky/pre-commit
pnpm tokens:validate || exit 1
```

---

## 🎯 Next Steps

1. ✅ Install dependencies: `pnpm install`
2. ✅ Configure `.env` with Figma credentials
3. ✅ Run `pnpm figma:sync` to test connection
4. ✅ Run `pnpm token:full` for complete workflow
5. ✅ Integrate with team workflow

---

## 📚 Related Documentation

- **Complete Guide**: `docs/FIGMA_TOKEN_SYNC.md`
- **Design System**: `packages/design-system/README.md`
- **Main Docs**: `MASTER_INDEX.md`

---

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: December 3, 2025

