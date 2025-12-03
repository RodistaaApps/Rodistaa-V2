# 🎨 CURSOR IDE - MASTER UI/UX ENFORCEMENT PROMPT (FINAL)

**Complete, production-grade UI/UX instruction prompt for Cursor IDE**

---

## 🚀 MASTER UI/UX ENFORCEMENT PROMPT FOR CURSOR IDE

(Copy–paste this into Cursor as-is)

---

**CURSOR — YOU ARE THE AUTONOMOUS UI/UX SYSTEM ARCHITECT FOR RODISTAA**

Your responsibility:
Implement one unified, consistent, pixel-perfect Rodistaa UI/UX system across:

- Rodistaa Shipper App (React Native)
- Rodistaa Operator App (React Native)
- Rodistaa Driver App (React Native)
- Rodistaa Admin Portal (Next.js + Ant Design)
- Rodistaa Franchise Portal (Next.js + Ant Design)

You must design, build, enforce, test, and maintain the complete design system across all surfaces.

**Follow the instructions below with zero deviations.**

---

## 🎨 1. GLOBAL BRAND & THEME (STRICT)

### Colors:
- **Rodistaa Red (Primary)**: `#C90D0D`
- **White**: `#FFFFFF`
- **Black**: `#1A1A1A`
- **Gray**: `#4F4F4F`
- **Light Gray**: `#F4F4F4`
- **Success**: `#17B169`
- **Warning**: `#FDBA21`
- **Error**: `#E03131`
- **Info**: `#2F80ED`

### Typography:
- **Headings**: Baloo Bhai (official Rodistaa asset only)
- **Body Font**: Times New Roman
- **NO substitutions allowed**

### Spacing Scale:
- Use ONLY → **4 / 8 / 12 / 16 / 24 / 32 px**

### Corner Radius:
- Use ONLY → **6px or 8px**

### Shadows:
- Use → `rgba(0, 0, 0, 0.08)` soft shadows

### Brand rules (non-negotiable):
- ❌ Never change Rodistaa red
- ❌ Never replace Baloo Bhai font
- ❌ Never approximate the logo
- ✅ All text must respect the brand hierarchy

---

## 📱 2. MOBILE (React Native) — GLOBAL UI RULES

### Implement unified shared library in:
`packages/mobile/shared`

### Required Mobile Components:
1. RButton
2. RInput
3. RCard
4. RListItem
5. RSectionHeader
6. RModal
7. RBadge (statuses)
8. RDivider
9. RAppBar
10. RBottomTabs
11. RToast
12. RLoader
13. RForm
14. RPhotoCapture
15. RPDFViewer
16. RStatusChip

### Navigation:
- Expo Router
- Forward → slide-in-right
- Back → slide-out-left

### Behavior rules:
- Touch targets ≥ **44px**
- Font size ≥ **14px**
- Inline errors + toast errors
- Red border for invalid fields
- Form validations on blur & submit
- Skeleton for <500ms delays
- Spinner for >500ms delays

---

## 🧩 3. PORTALS (Next.js + Ant Design)

### Implement:
- `packages/portal/admin`
- `packages/portal/franchise`
- `packages/portal/common`

### Ant Design Theme Override:
```javascript
{
  primaryColor: "#C90D0D",
  borderRadius: 8,
  fontFamily: "Times New Roman",
}
```

Use Baloo Bhai for headings (CSS import).

### Required Portal Components:
1. RButtonWeb
2. RCardWeb
3. RTableWeb
4. RModalWeb
5. RFormWeb
6. RStatusTagWeb
7. RPhotoGallery
8. RDataBadge
9. RSideNav
10. RAppHeader
11. RSearchBar
12. RTabs
13. RMetricsCard

### Layout:
- Left sidebar (red accents)
- Top header (user menu)
- Content container max-width 1400px
- Consistent padding 24px

---

## 🧑‍💻 4. PAGE-SPECIFIC UX REQUIREMENTS

### Admin Portal:
- Dashboard with KPI metric cards
- Live ACS alerts feed
- KYC masked by default → "Decrypt & View" modal
- Truck detail gallery + inspection photos
- Block/unblock flows
- Override approval queue
- Shipment map view + POD PDF viewer

### Franchise Portal — District:
- Targets management
- Unit franchise performance tiles
- Inspection review queue

### Franchise Portal — Unit:
- Truck inspection upload workflow
- Inspection history timeline
- Targets assigned by district

---

## 🔄 5. UI INTERACTION BEHAVIOR GUIDELINES

### Buttons:
- **Primary** = Red background + white text
- **Secondary** = White background + red border + red text
- **Disabled** = gray bg + gray text

### Errors:
- Red border
- Red caption under input
- Toast confirmation

### Modals:
- Animation: fade-in 140ms
- Sizes:
  - Small = 400px
  - Medium = 600px
  - Large = 800px

### Accessibility:
- Contrast ratio ≥ **4.5**
- All icons ≥ **22px**
- All controls ≥ **44px**

### Animations:
- Keep minimal
- Duration: **120–180ms**
- No bounce transitions

---

## 🧪 6. UI ACCEPTANCE CRITERIA (STRICT)

**Cursor must validate UI using these rules:**

- ✅ Every screen uses Rodistaa red #C90D0D as primary
- ✅ All headings use Baloo Bhai font
- ✅ All body text uses Times New Roman
- ✅ Spacing strictly follows 4/8/12/16/24/32 px scale
- ✅ All input fields have consistent margins & error states
- ✅ All screens show consistent corner-radius (6 or 8px)
- ✅ No unstyled defaults
- ✅ No inconsistent icons
- ✅ No mixed fonts
- ✅ No deviations in button styles
- ✅ All actions use consistent modals
- ✅ Screenshot comparison must match sample screens

**Cursor must include:**
- UI linting
- Screenshot verification
- Manual screenshots inside VERIFY_UI.md

---

## 📦 7. DELIVERABLES (MANDATORY)

**Cursor must generate:**

### 1. Unified Design System
`packages/design-system/` containing:
- Colors
- Typography
- Component tokens
- Shared RN components
- Shared Web components
- Layout utils
- Assets (logo, icons)

### 2. Storybook for Web
Located at:
`packages/portal/.storybook/`

### 3. Sample Screens (all apps)
For verification:
- **Shipper**: Create Booking, Bids, Tracking
- **Operator**: Add Truck, Inspection, Bid Entry
- **Driver**: Trip, Pickup/Drop, POD Upload
- **Admin**: Dashboard, Truck detail, Override queue
- **Franchise**: Targets, Inspection workflow

### 4. VERIFY_UI.md
Containing:
- Screenshots (base64 acceptable)
- Theme application proof
- Accessibility checks
- List of components completed
- Known UI exceptions (if any)

### 5. New PR
**Title:**
```
feat(uiux): implement unified Rodistaa UI/UX design system across all apps and portals
```

---

## 🧠 8. CURSOR EXECUTION RULES

- ✅ Apply the theme everywhere
- ✅ Refactor existing inconsistent UI
- ✅ Replace all default styling with Rodistaa components
- ✅ Enforce spacing and typography strictly
- ✅ Reject patterns that violate brand identity
- ✅ Generate missing screens where needed
- ✅ Update docs and examples
- ✅ Provide code + screenshots in PR

---

## 🔚 END OF PROMPT

**Cursor:**
Implement the full Rodistaa unified UI/UX system exactly as specified above.
Open the UI/UX PR with all deliverables and attach VERIFY_UI.md.

---


