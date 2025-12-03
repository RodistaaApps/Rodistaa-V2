# 🎨 Figma ↔ Code Token Synchronization Guide

**Complete guide for maintaining design token sync between Figma and the Rodistaa codebase**

---

## 📋 Overview

This document explains how to keep design tokens synchronized between:
- **Figma**: Design source of truth
- **Code**: `packages/design-system/tokens/tokens.json`

**Goal**: Single source of truth, zero token drift, automated synchronization

---

## 🏗️ Architecture

```
┌─────────────────┐
│     FIGMA       │
│  (Design Tool)  │
└────────┬────────┘
         │
         │ Export (Manual or API)
         ▼
┌─────────────────────────────────┐
│   tokens.json                   │
│   (Single Source of Truth)      │
│   packages/design-system/tokens/│
└────────┬────────────────────────┘
         │
         │ pnpm tokens:generate
         ▼
┌─────────────────────────────────┐
│   TypeScript Files              │
│   - colors.ts                   │
│   - spacing.ts                  │
│   - typography.ts               │
└────────┬────────────────────────┘
         │
         │ Import
         ▼
┌─────────────────────────────────┐
│   React Native + Next.js Apps   │
│   (Use tokens everywhere)       │
└─────────────────────────────────┘
```

---

## 📁 File Structure

```
packages/design-system/
├── tokens/
│   └── tokens.json          # ← Figma sync file (JSON)
├── src/
│   └── tokens/
│       ├── colors.ts        # ← Generated from tokens.json
│       ├── spacing.ts       # ← Generated from tokens.json
│       ├── typography.ts    # ← Generated from tokens.json
│       ├── radius.ts        # ← (future)
│       ├── shadows.ts       # ← (future)
│       └── index.ts         # ← Exports all tokens
└── scripts/
    ├── generate-tokens.js   # Figma → Code
    ├── export-tokens.js     # Code → Figma
    ├── validate-tokens.js   # Drift detection
    └── scan-hardcoded.js    # Find violations
```

---

## 🎯 Token Categories (MUST MATCH EXACTLY)

### 1. Color Tokens
```json
{
  "color": {
    "primary": { "value": "#C90D0D", "type": "color" },
    "white": { "value": "#FFFFFF", "type": "color" },
    "black": { "value": "#1A1A1A", "type": "color" },
    "gray": { "value": "#4F4F4F", "type": "color" },
    "lightGray": { "value": "#F4F4F4", "type": "color" },
    "success": { "value": "#17B169", "type": "color" },
    "warning": { "value": "#FDBA21", "type": "color" },
    "error": { "value": "#E03131", "type": "color" },
    "info": { "value": "#2F80ED", "type": "color" }
  }
}
```

**Usage in Code**:
```typescript
import { RodistaaColors } from '@rodistaa/design-system';

backgroundColor: RodistaaColors.primary.main // #C90D0D
```

### 2. Typography Tokens
```json
{
  "font": {
    "heading": { "value": "Baloo Bhai", "type": "fontFamily" },
    "body": { "value": "Times New Roman", "type": "fontFamily" }
  },
  "fontSize": {
    "12": { "value": "12px", "type": "fontSize" },
    "14": { "value": "14px", "type": "fontSize" },
    "16": { "value": "16px", "type": "fontSize" },
    "18": { "value": "18px", "type": "fontSize" },
    "20": { "value": "20px", "type": "fontSize" },
    "24": { "value": "24px", "type": "fontSize" },
    "32": { "value": "32px", "type": "fontSize" }
  },
  "lineHeight": {
    "tight": { "value": "1.1", "type": "lineHeight" },
    "normal": { "value": "1.4", "type": "lineHeight" },
    "relaxed": { "value": "1.6", "type": "lineHeight" }
  }
}
```

### 3. Spacing Tokens
```json
{
  "space": {
    "4": { "value": "4px", "type": "spacing" },
    "8": { "value": "8px", "type": "spacing" },
    "12": { "value": "12px", "type": "spacing" },
    "16": { "value": "16px", "type": "spacing" },
    "24": { "value": "24px", "type": "spacing" },
    "32": { "value": "32px", "type": "spacing" },
    "48": { "value": "48px", "type": "spacing" }
  }
}
```

### 4. Border Radius Tokens
```json
{
  "radius": {
    "sm": { "value": "4px", "type": "borderRadius" },
    "md": { "value": "6px", "type": "borderRadius" },
    "lg": { "value": "8px", "type": "borderRadius" },
    "xl": { "value": "12px", "type": "borderRadius" }
  }
}
```

### 5. Shadow Tokens
```json
{
  "shadow": {
    "sm": {
      "value": {
        "color": "rgba(0,0,0,0.08)",
        "offsetX": "0px",
        "offsetY": "1px",
        "blur": "3px",
        "spread": "0px"
      },
      "type": "boxShadow"
    }
  }
}
```

### 6. Component Size Tokens
```json
{
  "sizes": {
    "button": {
      "height": { "value": "48px", "type": "sizing" }
    },
    "input": {
      "height": { "value": "44px", "type": "sizing" }
    },
    "icon": {
      "size": { "value": "24px", "type": "sizing" }
    },
    "modal": {
      "padding": { "value": "24px", "type": "spacing" }
    }
  }
}
```

---

## 🔄 Synchronization Workflows

### Workflow 1: Figma → Code (Designer Updates)

**When**: Designer updates tokens in Figma

**Steps**:

1. **In Figma**:
   - Open Figma file
   - Update token values using **Figma Variables** or **Figma Tokens Plugin**
   - Export tokens as JSON

2. **Export from Figma**:
   ```
   Method A: Figma Tokens Plugin
   - Plugins → Figma Tokens → Export
   - Save as tokens.json
   
   Method B: Figma Variables API (advanced)
   - Use Figma API to export variables
   - Convert to tokens.json format
   ```

3. **In Code Repository**:
   ```bash
   # Replace tokens.json with exported file
   cp ~/Downloads/tokens.json packages/design-system/tokens/
   
   # Generate TypeScript files
   cd packages/design-system
   pnpm tokens:generate
   
   # Validate (ensure no drift)
   pnpm tokens:validate
   
   # Commit changes
   git add tokens/ src/tokens/
   git commit -m "chore(tokens): sync from Figma"
   git push
   ```

4. **Result**:
   - ✅ TypeScript files updated
   - ✅ All components automatically use new values
   - ✅ CI/CD validates changes

---

### Workflow 2: Code → Figma (Developer Updates)

**When**: Developer adds new tokens or updates existing ones

**Steps**:

1. **In Code**:
   ```bash
   # Edit tokens.json directly
   cd packages/design-system/tokens
   # Update token values
   
   # Or edit TypeScript files and export
   cd packages/design-system
   pnpm tokens:export
   ```

2. **Validate Changes**:
   ```bash
   pnpm tokens:validate
   pnpm tokens:scan  # Check for hardcoded values
   ```

3. **Import to Figma**:
   ```
   Method A: Figma Tokens Plugin
   - Open Figma
   - Plugins → Figma Tokens
   - Import → Select tokens.json
   - Sync variables
   
   Method B: Manual (if no plugin)
   - Create/update Figma Variables manually
   - Match token names exactly
   ```

4. **Commit & Push**:
   ```bash
   git add tokens/ src/tokens/
   git commit -m "feat(tokens): add new spacing token"
   git push
   ```

---

## 🛠️ Available Scripts

### 1. `pnpm tokens:generate`
**Purpose**: Generate TypeScript files from tokens.json (Figma → Code)

```bash
cd packages/design-system
pnpm tokens:generate
```

**What it does**:
- Reads `tokens/tokens.json`
- Generates `src/tokens/colors.ts`
- Generates `src/tokens/spacing.ts`
- Updates metadata timestamps

**When to use**: After importing tokens from Figma

---

### 2. `pnpm tokens:export`
**Purpose**: Export TypeScript tokens to tokens.json (Code → Figma)

```bash
cd packages/design-system
pnpm tokens:export
```

**What it does**:
- Reads TypeScript token files
- Updates `tokens/tokens.json`
- Updates metadata

**When to use**: Before importing to Figma

---

### 3. `pnpm tokens:validate`
**Purpose**: Validate token integrity and detect drift

```bash
cd packages/design-system
pnpm tokens:validate
```

**What it checks**:
- ✅ All required token categories present
- ✅ Color formats valid (#RRGGBB)
- ✅ Rodistaa brand compliance (#C90D0D, Baloo Bhai, Times New Roman)
- ✅ Spacing scale compliance (4/8/12/16/24/32/48 only)
- ✅ No hardcoded values in components
- ✅ TypeScript files sync with tokens.json

**Exit codes**:
- `0`: All checks passed
- `1`: Validation failed (must fix before commit)

**When to use**: Before committing, in CI/CD

---

### 4. `pnpm tokens:scan`
**Purpose**: Scan entire codebase for hardcoded design values

```bash
cd packages/design-system
pnpm tokens:scan
```

**What it finds**:
- ❌ Hardcoded `#C90D0D` (should use `RodistaaColors.primary.main`)
- ❌ Hardcoded spacing like `padding: 17px` (should use tokens)
- ❌ Hardcoded `border-radius: 5px` (should use tokens)
- ❌ Non-standard fonts
- ❌ Inline box-shadows

**Report format**:
```
❌ HIGH SEVERITY (3):
   src/components/Button.tsx:45
   Found: #C90D0D
   Fix: Use RodistaaColors.primary.main

⚠️  MEDIUM SEVERITY (7):
   src/components/Card.tsx:23
   Found: padding: 17px
   Fix: Use RodistaaSpacing token (closest: 16)
```

**When to use**: Before production, weekly audits

---

### 5. `pnpm tokens:sync`
**Purpose**: Full sync (generate + validate)

```bash
cd packages/design-system
pnpm tokens:sync
```

**What it does**:
- Runs `tokens:generate`
- Runs `tokens:validate`
- Reports any issues

**When to use**: After Figma updates, before committing

---

## 🎨 Figma Setup (Step-by-Step)

### Option A: Using Figma Tokens Plugin (Recommended)

1. **Install Plugin**:
   - Open Figma
   - Plugins → Browse plugins
   - Search "Figma Tokens"
   - Install "Figma Tokens (Tokens Studio)"

2. **Create Token Structure**:
   ```
   /Design Tokens
       /Color
           primary = #C90D0D
           white = #FFFFFF
           black = #1A1A1A
           ...
       /Typography
           heading = Baloo Bhai
           body = Times New Roman
       /Spacing
           4 = 4
           8 = 8
           ...
       /Radii
           sm = 4
           md = 6
           lg = 8
           xl = 12
       /Shadow
           sm = {...}
           md = {...}
           lg = {...}
   ```

3. **Export Tokens**:
   - Plugins → Figma Tokens
   - Export → JSON
   - Save as `tokens.json`

4. **Sync to Code**:
   - Copy `tokens.json` to `packages/design-system/tokens/`
   - Run `pnpm tokens:generate`

---

### Option B: Using Figma Variables (Native)

1. **Create Variables**:
   - Open Figma file
   - Right sidebar → "Local variables"
   - Create collections:
     - Colors
     - Spacing
     - Typography

2. **Define Variables**:
   ```
   Collection: Colors
   - primary = #C90D0D
   - white = #FFFFFF
   - ...
   
   Collection: Spacing
   - space-4 = 4
   - space-8 = 8
   - ...
   ```

3. **Export** (requires script/plugin):
   - Use Figma Variables API
   - Convert to tokens.json format
   - Or use community plugin for export

---

## ✅ Validation Rules

### Enforced Rules (CI/CD Blocks on Failure)

1. **Brand Compliance**:
   - ❌ `color.primary` MUST be `#C90D0D`
   - ❌ `font.heading` MUST be `Baloo Bhai`
   - ❌ `font.body` MUST be `Times New Roman`

2. **Spacing Scale**:
   - ❌ Only allowed: 4, 8, 12, 16, 24, 32, 48
   - ❌ No custom spacing values (e.g., 17px)

3. **Color Format**:
   - ❌ Must be uppercase hex: `#RRGGBB`
   - ❌ No RGB, HSL, or named colors

4. **No Hardcoded Values**:
   - ❌ No `#C90D0D` in code (use tokens)
   - ❌ No hardcoded spacing
   - ❌ No hardcoded border radius

### Warning Rules (Should Fix)

- ⚠️ Non-standard spacing values
- ⚠️ Missing token descriptions
- ⚠️ Unused tokens

---

## 🚨 Drift Prevention

### Automatic Checks

**Pre-commit Hook**:
```bash
# .husky/pre-commit
cd packages/design-system
pnpm tokens:validate || exit 1
```

**CI/CD Pipeline**:
```yaml
# .github/workflows/tokens.yml
- name: Validate Tokens
  run: |
    cd packages/design-system
    pnpm install
    pnpm tokens:validate
```

**Pre-push Validation**:
```bash
git push  # Automatically runs token validation
```

---

## 🧪 Testing Token Changes

### Automated Visual Regression Testing

**NEW: Complete automation package available!**

```bash
cd packages/design-system-automation

# Run complete visual regression test
pnpm storybook:snap
```

**What it does**:
- ✅ Starts Storybook automatically
- ✅ Captures screenshots of all components
- ✅ Compares with baseline
- ✅ Reports visual differences
- ✅ Validates token application

**Test Coverage**:
- 15+ component stories
- Token verification (colors, spacing, fonts)
- Visual difference detection
- Baseline comparison

### Manual Testing

1. **Storybook Visual Inspection**:
   ```bash
   cd packages/portal
   pnpm storybook  # View components
   ```

2. **Mobile App Testing**:
   - Update tokens
   - Run all apps locally
   - Check visual consistency

3. **Portal Testing**:
   - Check Admin Portal
   - Check Franchise Portal
   - Verify Ant Design theme override

---

## 📋 Approval Workflow

### Token Change Process

1. **Designer proposes change in Figma**
2. **Export tokens.json**
3. **Developer creates PR**:
   ```bash
   git checkout -b tokens/update-primary-color
   # Copy new tokens.json
   pnpm tokens:generate
   pnpm tokens:validate
   git add .
   git commit -m "chore(tokens): update primary color shade"
   git push
   ```
4. **CI/CD runs validation**
5. **Team reviews visual changes** (screenshots in PR)
6. **Approve & merge**
7. **Designer imports updated tokens back to Figma** (if needed)

---

## 🔧 Troubleshooting

### Issue: Token validation fails

**Solution**:
```bash
cd packages/design-system
pnpm tokens:validate  # See specific errors
# Fix errors in tokens.json
pnpm tokens:sync
```

---

### Issue: TypeScript files out of sync

**Solution**:
```bash
cd packages/design-system
pnpm tokens:generate  # Regenerate from tokens.json
pnpm build  # Rebuild
```

---

### Issue: Hardcoded values detected

**Solution**:
```bash
cd packages/design-system
pnpm tokens:scan  # Find all violations
# Manually replace hardcoded values with tokens
# Or use find-replace:
# #C90D0D → RodistaaColors.primary.main
```

---

### Issue: Figma and code have different values

**Solution**:
1. Determine source of truth (usually Figma)
2. Export from Figma
3. Run `pnpm tokens:generate`
4. Validate and commit

---

## 📊 Token Naming Conventions

### Strict Rules

1. **Use semantic names**:
   - ✅ `color.primary`
   - ❌ `color.red`

2. **Use consistent casing**:
   - ✅ `color.lightGray`
   - ❌ `color.light-gray`

3. **Group by category**:
   - ✅ `space.16`, `space.24`
   - ❌ `padding16`, `margin24`

4. **Use numbers for scales**:
   - ✅ `fontSize.16`, `fontSize.24`
   - ❌ `fontSize.medium`, `fontSize.large`

---

## 🎯 Component Token Mapping

### Buttons
```typescript
{
  background: RodistaaColors.primary.main,
  padding: RodistaaSpacing.md,
  borderRadius: RodistaaSpacing.borderRadius.lg,
  height: 48, // From sizes.button.height
  fontFamily: RodistaaTypography.fontFamily.heading
}
```

### Inputs
```typescript
{
  padding: RodistaaSpacing.sm,
  borderRadius: RodistaaSpacing.borderRadius.md,
  borderColor: RodistaaColors.border.default,
  height: 44, // From sizes.input.height
}
```

### Cards
```typescript
{
  background: RodistaaColors.background.default,
  borderRadius: RodistaaSpacing.borderRadius.lg,
  padding: RodistaaSpacing.md,
  shadow: RNShadowStyles.md,
}
```

---

## 📈 Best Practices

### DO ✅
- ✅ Always use tokens in components
- ✅ Run `tokens:validate` before committing
- ✅ Keep Figma and code in sync
- ✅ Document token changes in PR
- ✅ Test visually after token updates
- ✅ Use semantic token names

### DON'T ❌
- ❌ Hardcode colors or spacing
- ❌ Skip validation
- ❌ Make breaking token changes without team approval
- ❌ Use non-standard spacing values
- ❌ Commit without running `tokens:sync`

---

## 🚀 Quick Start Checklist

### For Designers
- [ ] Install Figma Tokens plugin
- [ ] Create token structure in Figma
- [ ] Export tokens.json
- [ ] Share with developers
- [ ] Validate visual changes

### For Developers
- [ ] Copy tokens.json to repo
- [ ] Run `pnpm tokens:generate`
- [ ] Run `pnpm tokens:validate`
- [ ] Update components if needed
- [ ] Run `pnpm tokens:scan`
- [ ] Commit and push
- [ ] Share updated tokens.json with designers

---

## 📞 Support

**Questions?**
- Check this document first
- Run `pnpm tokens:validate` for errors
- Ask in #design-system Slack channel
- Create GitHub issue with `[tokens]` prefix

---

**Token Sync Version**: 1.0.0  
**Last Updated**: December 3, 2025  
**Maintained By**: Rodistaa Design System Team

