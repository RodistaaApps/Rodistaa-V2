# 🎨 Figma Token Sync - Quick Reference

**Complete bidirectional token synchronization between Figma and Code**

---

## 🚀 Quick Start

### Figma → Code (Designer Updates)
```bash
# 1. Export tokens from Figma to tokens.json
# 2. Copy to repo
cp ~/Downloads/tokens.json packages/design-system/tokens/

# 3. Generate TypeScript files
cd packages/design-system
pnpm tokens:generate

# 4. Validate
pnpm tokens:validate

# 5. Commit
git add tokens/ src/tokens/
git commit -m "chore(tokens): sync from Figma"
```

### Code → Figma (Developer Updates)
```bash
# 1. Update tokens.json
cd packages/design-system/tokens
# Edit tokens.json

# 2. Generate & validate
cd ..
pnpm tokens:sync

# 3. Import to Figma
# Use Figma Tokens plugin to import tokens.json

# 4. Commit
git add tokens/
git commit -m "feat(tokens): add new color"
```

---

## 📦 Available Commands

| Command | Purpose |
|---------|---------|
| `pnpm tokens:generate` | Figma → Code (generate TS from JSON) |
| `pnpm tokens:export` | Code → Figma (update JSON from TS) |
| `pnpm tokens:validate` | Check for drift & compliance |
| `pnpm tokens:scan` | Find hardcoded values |
| `pnpm tokens:sync` | Generate + Validate (full sync) |

---

## ✅ Token Categories

**All tokens MUST be defined in `tokens/tokens.json`:**

1. ✅ **Colors** - `color.primary` = `#C90D0D`
2. ✅ **Fonts** - `font.heading` = `Baloo Bhai`
3. ✅ **Spacing** - `space.4` through `space.48`
4. ✅ **Radius** - `radius.sm` through `radius.xl`
5. ✅ **Shadows** - `shadow.sm` through `shadow.lg`
6. ✅ **Sizes** - `sizes.button.height` = `48px`

---

## 🚨 Validation Rules

**Enforced by CI/CD:**

- ❌ `color.primary` MUST be `#C90D0D` (Rodistaa Red)
- ❌ `font.heading` MUST be `Baloo Bhai`
- ❌ `font.body` MUST be `Times New Roman`
- ❌ Spacing MUST be 4/8/12/16/24/32/48 only
- ❌ NO hardcoded values in components

---

## 📁 File Structure

```
packages/design-system/
├── tokens/
│   └── tokens.json          ← Figma sync file
├── src/tokens/
│   ├── colors.ts            ← Auto-generated
│   ├── spacing.ts           ← Auto-generated
│   └── index.ts
└── scripts/
    ├── generate-tokens.js   ← Figma → Code
    ├── export-tokens.js     ← Code → Figma
    ├── validate-tokens.js   ← Drift detection
    └── scan-hardcoded.js    ← Find violations
```

---

## 🔄 Workflow

```
┌────────────┐
│   FIGMA    │  Designer updates
└─────┬──────┘
      │ Export JSON
      ▼
┌──────────────┐
│ tokens.json  │  Single source of truth
└─────┬────────┘
      │ pnpm tokens:generate
      ▼
┌──────────────┐
│  colors.ts   │  Auto-generated TypeScript
│  spacing.ts  │
└─────┬────────┘
      │ Import
      ▼
┌──────────────┐
│  Components  │  Use tokens everywhere
└──────────────┘
```

---

## 🎯 Usage in Components

### React Native
```typescript
import { RodistaaColors, RodistaaSpacing } from '@rodistaa/design-system';

const styles = StyleSheet.create({
  button: {
    backgroundColor: RodistaaColors.primary.main,  // #C90D0D
    padding: RodistaaSpacing.md,                   // 16px
    borderRadius: RodistaaSpacing.borderRadius.lg, // 8px
  }
});
```

### Next.js (Web)
```typescript
import { RodistaaColors, RodistaaSpacing } from '@rodistaa/design-system';

const buttonStyles: CSSProperties = {
  backgroundColor: RodistaaColors.primary.main,
  padding: `${RodistaaSpacing.md}px`,
  borderRadius: `${RodistaaSpacing.borderRadius.lg}px`,
};
```

---

## 🧪 Testing

### Before Committing
```bash
cd packages/design-system

# 1. Validate tokens
pnpm tokens:validate

# 2. Scan for violations
pnpm tokens:scan

# 3. Build to ensure no errors
pnpm build
```

### CI/CD Checks
- ✅ Token structure validation
- ✅ Brand compliance check
- ✅ Hardcoded value scan
- ✅ TypeScript compilation

---

## 📖 Full Documentation

See **[docs/FIGMA_TOKEN_SYNC.md](../../docs/FIGMA_TOKEN_SYNC.md)** for:
- Complete setup guide
- Detailed workflows
- Troubleshooting
- Best practices
- Component token mapping

---

## 🆘 Quick Troubleshooting

### Validation fails?
```bash
pnpm tokens:validate  # See specific errors
# Fix in tokens.json
pnpm tokens:sync
```

### TypeScript files out of sync?
```bash
pnpm tokens:generate  # Regenerate from tokens.json
```

### Hardcoded values detected?
```bash
pnpm tokens:scan      # Find all violations
# Replace with tokens manually
```

---

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: December 3, 2025

