# 🎨 CURSOR IDE - RODISTAA UI/UX MASTER ENFORCEMENT PROMPT

**Complete, production-grade UI/UX instruction prompt for Cursor IDE**

Copy this entire prompt and paste into Cursor to implement the unified Rodistaa design system.

---

## 🎯 YOUR MISSION

You are the **Autonomous AI CTO + Lead UI/UX System Architect** for Rodistaa.

Your task is to design, implement, enforce, and maintain the **complete Rodistaa UI/UX system** across:
- **3 Mobile Apps** (React Native): Shipper, Operator, Driver
- **2 Web Portals** (Next.js + Ant Design): Admin, Franchise

All UI must be fully consistent, theme-aligned, and follow enterprise-grade usability patterns.

**Follow these instructions EXACTLY.**

---

## 📐 PILLAR 1: UI ACCEPTANCE CRITERIA (STRICT ENFORCEMENT)

### ✅ You MUST enforce these rules like QA gates:

#### Spacing & Layout
- ✅ All screens follow Rodistaa spacing scale: **4 / 8 / 12 / 16 / 24 / 32 px ONLY**
- ✅ Screen padding: **16px** (mobile) / **24px** (portal)
- ✅ Component margins: **12px** bottom spacing between components
- ✅ Section gaps: **24px** between major sections
- ✅ Form field gaps: **16px** between inputs
- ✅ Zero custom spacing values outside the scale
- ✅ Zero inconsistent padding/margins across screens

#### Colors & Branding
- ✅ All primary actions use **Rodistaa Red (#C90D0D)**
- ✅ All buttons must use **exact same button style** per variant
- ✅ All status badges use **predefined status colors** (never custom)
- ✅ Zero hardcoded colors - use tokens only
- ✅ Zero Ant Design blue - override to Rodistaa Red
- ✅ All branding from **official assets only** (no recreating logos)

#### Typography
- ✅ All headings use **Baloo Bhai** (weights: 400, 600, 700)
- ✅ All body text uses **Times New Roman**
- ✅ Zero mixed fonts on same screen
- ✅ Zero system default fonts (override all)
- ✅ Font sizes from **typography tokens only**
- ✅ Minimum text size: **14px** (mobile) / **14px** (web)

#### Touch Targets & Accessibility
- ✅ All mobile touchables: **minimum 44px × 44px**
- ✅ All buttons: **minimum 48px height**
- ✅ All icon buttons: **44px × 44px** minimum
- ✅ All text contrast ratio: **≥ 4.5:1** (WCAG AA)
- ✅ All form fields: **labels + helper text + error message**
- ✅ All images: **alt text** (web) / **accessibilityLabel** (mobile)

#### Component Consistency
- ✅ Zero unstyled system components (Button, Input, etc.)
- ✅ All components use design system tokens
- ✅ All components follow naming convention (R* prefix)
- ✅ Zero inline styles - use StyleSheet (mobile) / styled components (web)
- ✅ All icons same size within context (24px default, 32px large, 20px small)

#### Forms
- ✅ All form fields MUST have:
  - Label (above or left)
  - Helper text (optional, below)
  - Error message (red, below)
  - Validation states (default, focus, error, success, disabled)
- ✅ All forms show loading state during submission
- ✅ All forms disable inputs while loading
- ✅ All required fields marked with asterisk (*)

#### Visual Validation
- ✅ Screenshot-based comparison in PR (before/after)
- ✅ Visual regression testing with Playwright/Detox
- ✅ Component screenshot in Storybook
- ✅ No visual inconsistencies between apps

#### Forbidden Violations
- ❌ NEVER use colors outside token system
- ❌ NEVER use spacing outside 4/8/12/16/24/32 scale
- ❌ NEVER mix fonts on same screen
- ❌ NEVER use unstyled system components
- ❌ NEVER create components without tokens
- ❌ NEVER skip accessibility attributes
- ❌ NEVER hardcode dimensions

---

## 📋 PILLAR 2: COMPONENT INVENTORY SPECIFICATION

### ✅ This is the CANONICAL LIST you MUST implement:

#### Mobile Shared Components (20 components)
**Location**: `packages/design-system/src/components/mobile/`

**MUST IMPLEMENT EXACTLY:**
1. **RButton** - Primary, Secondary, Text, Danger variants ✅ (Already done)
2. **RInput** - Text input with label + validation
3. **RCard** - Container with shadow elevation
4. **RListItem** - Icon + Title + Subtitle + Right element
5. **RSectionHeader** - Baloo Bhai heading with red underline
6. **RModal** - Slide-up modal with overlay
7. **RBadge** - Status badge (PENDING, VERIFIED, BLOCKED, etc.)
8. **RDivider** - Horizontal/vertical divider
9. **RAppBar** - Top navigation bar (title + back + actions)
10. **RBottomTabs** - Bottom tab navigation (5 tab variants)
11. **RToast** - Toast notification service
12. **RForm** - Form container with validation
13. **RLoader** - Loading spinner + skeleton loader
14. **RPhotoCapture** - Camera/gallery picker
15. **RPdfViewer** - PDF document viewer
16. **RStatusChip** - Small status indicator
17. **RCheckbox** - Checkbox with label
18. **RRadio** - Radio button with label
19. **RSwitch** - Toggle switch
20. **RSelect** - Dropdown picker
21. **RDatePicker** - Date/time picker
22. **RText** - Styled text component (h1, h2, body, caption)
23. **RIcon** - Icon wrapper (consistent sizing)
24. **GPSIndicator** - Live GPS ping animation icon

#### Portal Shared Components (15 components)
**Location**: `packages/design-system/src/components/web/`

**MUST IMPLEMENT EXACTLY:**
1. **RButtonWeb** - Ant Design Button with Rodistaa theme
2. **RCardWeb** - Card component with shadow
3. **RTableWeb** - Data table (Ant Table wrapped)
4. **RFormWeb** - Form components (Ant Form wrapped)
5. **RModalWeb** - Modal dialogs
6. **RStatusTagWeb** - Status tag with colors
7. **RPhotoGallery** - Image gallery viewer
8. **RDataBadge** - Numerical badge
9. **RSideNav** - Sidebar navigation with Rodistaa branding
10. **RAppHeader** - Top bar with user menu
11. **RSearchBar** - Search input with filters
12. **RTag** - Tag component
13. **RConfirmDialog** - Confirmation modal
14. **RTabs** - Tab navigation
15. **RMetricsCard** - KPI card for dashboard
16. **RChartWrapper** - Chart component (Recharts wrapped)

#### Specialized Components (5 components)
**Location**: `packages/design-system/src/components/specialized/`

1. **KYCDecryptViewer** - Masked data with decrypt button (Admin)
2. **TruckInspectionForm** - Photo grid + checklist (Franchise)
3. **BidComparisonCard** - Side-by-side bid comparison (Shipper)
4. **LiveMapTracker** - Real-time GPS map (All apps)
5. **PODUploadFlow** - Multi-step POD capture (Driver)

**Total Components: 44** (Must implement ALL)

---

## 🎭 PILLAR 3: INTERACTION BEHAVIOR RULES

### ✅ STRICT: Enforce these behaviors everywhere:

#### Button Behavior
**Primary Button:**
- Background: **#C90D0D** (Rodistaa Red)
- Text: **#FFFFFF** (White)
- Height: **48px**
- Padding: **24px horizontal**
- Border radius: **8px**
- Shadow: `0 2px 4px rgba(0,0,0,0.08)`
- **Hover**: Background → **#E85454** (lighter red)
- **Press**: Background → **#A10A0A** (darker red)
- **Disabled**: Background → **#E0E0E0**, Text → **#999999**
- **Loading**: Show spinner, text → "Processing..."

**Secondary Button:**
- Background: **#FFFFFF** (White)
- Border: **2px solid #C90D0D**
- Text: **#C90D0D** (Rodistaa Red)
- Height: **48px**
- Other properties: same as primary
- **Hover**: Background → **#FFF5F5** (very light red tint)
- **Press**: Border → **#A10A0A**

**Text Button:**
- Background: **transparent**
- Text: **#C90D0D**
- No shadow
- **Hover**: Text → **#E85454**
- **Press**: Text → **#A10A0A**

**Danger Button:**
- Background: **#E03131** (Error Red)
- Text: **#FFFFFF**
- Same sizing as primary

#### Loading States
**Rules:**
- **0-500ms delay**: Show skeleton loader (gray animated blocks)
- **>500ms delay**: Show loading spinner (centered)
- **Button loading**: Disable button + show spinner + text "Processing..."
- **List loading**: Show 3-5 skeleton items
- **Screen loading**: Full-screen spinner with "Loading..." text

**Skeleton Loader:**
- Background: **#F4F4F4**
- Animation: Shimmer effect (left-to-right sweep)
- Duration: **1200ms** continuous
- Border radius: **8px**

#### Error States
**Input Error:**
- Border: **2px solid #E03131** (Error Red)
- Error text: **#E03131**, below input, 12px font
- Error icon: Red exclamation mark (left of message)
- Clear button: Show (×) to reset input

**Form Error:**
- Show inline error below each field
- **AND** show toast notification (top-right portal / bottom-center mobile)
- Scroll to first error field
- Focus first error field

**Fatal Error Screen:**
- Full-page error with:
  - Error icon (centered)
  - Heading: "Something went wrong"
  - Message: User-friendly explanation
  - **Two buttons**: "Retry" (primary) / "Contact Support" (secondary)
- No stack traces (hide in production)

**Toast Notifications:**
- **Mobile**: Bottom-center, slide-up animation
- **Portal**: Top-right, slide-in-left animation
- **Duration**: 3 seconds (success/info), 5 seconds (error/warning)
- **Dismissible**: Yes, with (×) button
- **Max visible**: 3 toasts stacked

#### Success States
- Show green checkmark icon
- Show success toast: "Action completed successfully"
- For forms: Green border flash (300ms) → revert to default
- For buttons: Brief green background flash (200ms) → revert

#### Navigation Behavior
**Mobile (React Native):**
- **Forward navigation**: Slide-in from right (250ms, ease-out)
- **Back navigation**: Slide-out to right (250ms, ease-out)
- **Modal open**: Slide-up from bottom (250ms, ease-out)
- **Modal close**: Slide-down to bottom (200ms, ease-in)
- **Tab switch**: Fade transition (120ms)

**Portal (Next.js):**
- **Page transitions**: Fade (120ms, ease-in-out)
- **Modal open**: Scale in + fade (250ms, ease-out)
- **Modal close**: Scale out + fade (200ms, ease-in)
- **No page jank**: Use Suspense boundaries
- **Breadcrumb trail**: Always visible on content pages

#### Animation Constraints
- **Maximum duration**: 400ms
- **Preferred duration**: 120-180ms
- **Easing**: `ease-out` (entry), `ease-in` (exit), `ease-in-out` (state changes)
- **NO bounce animations**
- **NO overshoot animations**
- **NO parallax effects**
- **Micro-interactions only**: Button press, fade, slide

#### Form Behavior
**On Input Focus:**
- Border: **2px solid #C90D0D** (Rodistaa Red focus state)
- Label: Float up (if using floating labels)
- Helper text: Fade in (if applicable)

**On Validation:**
- **Real-time validation**: After first blur
- **Submit validation**: On submit button click
- **Show errors**: Immediately after detection
- **Clear errors**: When input becomes valid

**On Submit:**
- Disable all inputs
- Change button text: "Submit" → "Processing..."
- Show loading spinner in button
- Scroll to top of form on success
- Stay on form on error (scroll to first error)

#### Data Display Behavior
**Lists:**
- **Empty state**: Show illustration + "No items yet" message + CTA button
- **Loading**: Show 5 skeleton items
- **Error**: Show error message + "Retry" button
- **Pagination**: Bottom-right, show "X-Y of Z items"
- **Infinite scroll**: Load more on scroll (mobile only)

**Tables (Portal):**
- **Sticky header**: Header stays visible on scroll
- **Row hover**: Light gray background (#F9F9F9)
- **Row selection**: Checkbox + highlight row (#FFF5F5 - light red tint)
- **Sortable columns**: Show sort icon, toggle asc/desc
- **Filters**: Top-right filter button → dropdown panel
- **Empty state**: Center message "No data available"

#### Status Indicators
**Status Badges:**
- **DRAFT**: Gray background (#888888)
- **PUBLISHED**: Blue background (#2F80ED)
- **CONFIRMED**: Green background (#17B169)
- **PENDING**: Yellow background (#FDBA21)
- **ACCEPTED**: Green background (#17B169)
- **REJECTED**: Red background (#E03131)
- **IN_TRANSIT**: Blue background (#2F80ED)
- **DELIVERED**: Green background (#17B169)
- **COMPLETED**: Dark green (#128A51)
- **CANCELLED**: Red background (#E03131)
- **BLOCKED**: Red background (#E03131), warning icon

**Badge Style:**
- Padding: **4px 12px**
- Border radius: **12px** (pill shape)
- Font: **Baloo Bhai, 12px, semibold**
- Text: **White** (all statuses)
- Minimum width: **80px**, centered text

---

## 📦 PILLAR 2: COMPONENT INVENTORY SPECIFICATION

### ✅ CANONICAL LIST - Implement EXACTLY these components:

#### Mobile Shared Components (24 components)
**Location**: `packages/design-system/src/components/mobile/`

**MUST IMPLEMENT:**
1. ✅ **RButton** - Primary/Secondary/Text/Danger *(Already implemented)*
2. **RInput** - Text input with label + validation + icon support
3. **RCard** - Container with shadow (sm/md/lg variants)
4. **RListItem** - Icon + Title + Subtitle + Right element (arrow/badge)
5. **RSectionHeader** - Baloo Bhai heading with red underline (2px, 40px wide)
6. **RModal** - Slide-up modal with overlay backdrop
7. **RBadge** - Status badge (uses status colors above)
8. **RDivider** - Horizontal/vertical divider (1px, #E0E0E0)
9. **RAppBar** - Top nav (title + back button + right actions)
10. **RBottomTabs** - Bottom tab nav (5 icons, active = Rodistaa Red)
11. **RToast** - Toast notification (success/error/info/warning)
12. **RForm** - Form container with validation context
13. **RLoader** - Loading spinner (Rodistaa Red) + skeleton loader
14. **RPhotoCapture** - Camera/gallery picker with preview
15. **RPdfViewer** - PDF viewer component
16. **RStatusChip** - Small pill status indicator
17. **RCheckbox** - Checkbox with label (Rodistaa Red when checked)
18. **RRadio** - Radio button with label
19. **RSwitch** - Toggle switch (Rodistaa Red when ON)
20. **RSelect** - Dropdown picker (iOS/Android native)
21. **RDatePicker** - Date/time picker
22. **RText** - Styled text (h1/h2/h3/body/caption variants)
23. **RIcon** - Icon wrapper (ensures consistent sizing)
24. **GPSIndicator** - Live GPS ping animation (green pulse)

#### Portal Shared Components (16 components)
**Location**: `packages/design-system/src/components/web/`

**MUST IMPLEMENT:**
1. **RButtonWeb** - Ant Design Button styled with Rodistaa theme
2. **RCardWeb** - Card with header/body/footer sections
3. **RTableWeb** - Ant Table with Rodistaa styling + sticky header
4. **RFormWeb** - Ant Form with Rodistaa validation styling
5. **RModalWeb** - Ant Modal with Rodistaa branding
6. **RStatusTagWeb** - Status tag (uses status colors)
7. **RPhotoGallery** - Image gallery with lightbox
8. **RDataBadge** - Numerical badge for metrics
9. **RSideNav** - Sidebar navigation (Rodistaa Red accents)
10. **RAppHeader** - Top bar with logo + user menu + notifications
11. **RSearchBar** - Search input with filters
12. **RTag** - Generic tag component
13. **RConfirmDialog** - Confirmation modal with Yes/No
14. **RTabs** - Tab navigation (Ant Tabs styled)
15. **RMetricsCard** - Dashboard KPI card (number + trend + icon)
16. **RChartWrapper** - Recharts with Rodistaa color palette

#### Specialized Components (5 components)
**Location**: `packages/design-system/src/components/specialized/`

1. **KYCDecryptViewer** - Masked field (•••••) + "Decrypt & View" button (Admin Portal)
2. **TruckInspectionForm** - Photo grid (3 columns) + checklist (Franchise Portal)
3. **BidComparisonCard** - Side-by-side bid cards with highlight (Shipper App)
4. **LiveMapTracker** - Google Maps with route + live truck icon (All apps)
5. **PODUploadFlow** - Multi-step: Photo → Signature → OTP → Submit (Driver App)

**Total: 45 components** *(You MUST implement ALL)*

---

## 🎭 PILLAR 3: INTERACTION BEHAVIOR RULES

### ✅ STRICT: Enforce these behaviors EVERYWHERE:

#### Animation Rules
**Duration:**
- Micro-interactions: **120ms**
- Standard transitions: **250ms**
- Modal open/close: **250ms**
- Maximum duration: **400ms** (never exceed)

**Easing:**
- Entry animations: **ease-out**
- Exit animations: **ease-in**
- State changes: **ease-in-out**
- Custom: **cubic-bezier(0.4, 0, 0.2, 1)**

**Forbidden:**
- ❌ No bounce animations
- ❌ No spring/overshoot
- ❌ No parallax effects
- ❌ No excessive motion

#### Loading Behavior
**Short Wait (0-500ms):**
- Show skeleton loader
- Animate shimmer effect
- Preserve layout (no jank)

**Long Wait (>500ms):**
- Show spinner (centered)
- Show "Loading..." text below spinner
- Disable all interactive elements
- Optional: Show progress percentage

**Button Loading:**
- Disable button immediately on click
- Change text: "Submit" → "Processing..."
- Show spinner (left of text)
- Spinner color: White (primary button) or Rodistaa Red (secondary)

**List Loading:**
- Show 3-5 skeleton items
- Each skeleton:
  - Gray blocks (#F4F4F4)
  - Shimmer animation
  - Match actual item layout

#### Error Handling Behavior
**Input Validation Error:**
```
[Input Field - Red Border]
▼
Error Icon + "This field is required" (Red text, 12px)
```

**Form Submission Error:**
1. Scroll to first error field
2. Focus first error field
3. Show inline error messages (all fields)
4. **AND** show toast: "Please fix errors and try again"
5. Re-enable submit button

**Network/Server Error:**
1. Show toast: "Connection error. Please try again."
2. Re-enable form
3. Log error to Sentry
4. Don't expose stack trace to user

**Fatal Error (Crash):**
```
┌─────────────────────────────────┐
│    [Error Icon - Red]           │
│                                 │
│    Something went wrong         │
│                                 │
│    We're sorry for the          │
│    inconvenience.               │
│                                 │
│  [Retry] [Contact Support]      │
└─────────────────────────────────┘
```

#### Success Feedback
**After Successful Action:**
1. Show success toast: "Booking created successfully!"
2. Brief green flash on button (200ms)
3. Navigate to next screen (if applicable)
4. Clear form (if applicable)
5. Scroll to top

**Visual Feedback:**
- Green checkmark icon (animated in, 250ms)
- Success toast (3 seconds)
- Haptic feedback (mobile only, if available)

#### Navigation Behavior
**Mobile Navigation:**
- **Push screen**: Slide in from right (250ms, ease-out)
- **Pop screen**: Slide out to right (250ms, ease-out)
- **Modal present**: Slide up from bottom (250ms, ease-out)
- **Modal dismiss**: Slide down to bottom (200ms, ease-in)
- **Tab switch**: Crossfade (120ms, ease-in-out)
- **Back button**: Hardware back → pop screen

**Portal Navigation:**
- **Page change**: Fade transition (120ms, ease-in-out)
- **Sidebar navigation**: Instant (no animation)
- **Breadcrumbs**: Always show current path
- **Tab switch**: Slide panel (150ms, ease-out)
- **Modal**: Scale in + fade (250ms, ease-out)

#### Form Interaction Flow
**User Flow:**
```
1. User focuses input
   → Border becomes Rodistaa Red (2px)
   → Label floats up (if floating label design)

2. User types
   → Real-time character count (if max length)
   → No validation yet

3. User blurs input (leaves field)
   → Run validation
   → If error: Show error message + red border
   → If success: Show green checkmark (optional)

4. User corrects error
   → Error clears immediately when valid
   → Green border flash (200ms) → default border

5. User submits form
   → Validate all fields
   → If errors: Focus first error + show toast
   → If valid: Disable form + show loading + submit
```

#### Data Table Interaction (Portal)
**Sorting:**
- Click column header → toggle sort (asc/desc/none)
- Show sort icon (↑ ↓) in header
- Animate row reorder (fade-out-in, 200ms)

**Filtering:**
- Filter button (top-right) → dropdown panel
- Apply filters → reload table with skeleton
- Show active filter count badge on button

**Row Selection:**
- Checkbox in first column
- Select all checkbox in header
- Selected rows: Light red background (#FFF5F5)
- Bulk actions appear when >0 selected

**Pagination:**
- Bottom-right alignment
- Show: "Showing 1-20 of 156 items"
- Page size selector: [20, 50, 100]
- Next/Previous buttons + page numbers

#### Modal Behavior
**Open Animation:**
- Overlay: Fade in (150ms)
- Modal: Slide up (mobile) / Scale in (web) (250ms, ease-out)

**Close Triggers:**
- (×) button (top-right)
- Cancel button
- Overlay click (optional, configurable)
- ESC key (web only)

**Close Animation:**
- Modal: Slide down / Scale out (200ms, ease-in)
- Overlay: Fade out (150ms)

**Focus Trap:**
- Tab navigation stays within modal
- First focusable element auto-focused
- Return focus to trigger element on close

---

## 🎨 MASTER BRANDING RULES

### Color Usage (STRICT)
**Primary Actions:**
- Rodistaa Red (#C90D0D) ONLY
- Create, Submit, Confirm, Accept, Save, etc.

**Secondary Actions:**
- White background, Red border
- Cancel, Back, Skip, etc.

**Destructive Actions:**
- Error Red (#E03131)
- Delete, Block, Reject, Remove, etc.

**Neutral Actions:**
- Text button (red text)
- View, Learn More, Details, etc.

**Never:**
- ❌ Blue for primary actions (it's Ant Design default - override it!)
- ❌ Green for primary actions
- ❌ Purple/orange for brand actions
- ❌ Any color not in token system

### Typography Usage (STRICT)
**Headings (Baloo Bhai):**
- Screen titles
- Section headers
- Card titles
- Button text
- Tab labels
- Badge text
- KPI numbers

**Body (Times New Roman):**
- Paragraph text
- List items
- Form labels
- Help text
- Descriptions
- Table content
- Input placeholder

**Monospace (Courier New):**
- Booking IDs (BK-XXXXX)
- Shipment IDs (SH-XXXXX)
- Truck reg numbers
- Codes only

### Spacing Usage (STRICT)
**Screen Layout:**
```
┌─────────────────────────────────┐
│ [AppBar - 56px height]          │ ← 0px top
├─────────────────────────────────┤
│ ┌─ 16px padding ──────────────┐ │
│ │                              │ │
│ │ [Section Header]             │ │
│ │ ↓ 12px gap                   │ │
│ │ [Card]                       │ │
│ │ ↓ 12px gap                   │ │
│ │ [Card]                       │ │
│ │ ↓ 24px gap (new section)    │ │
│ │ [Section Header]             │ │
│ │ ↓ 12px gap                   │ │
│ │ [List]                       │ │
│ │                              │ │
│ └──────────────────────────────┘ │
├─────────────────────────────────┤
│ [Bottom Nav - 60px height]      │ ← 0px bottom
└─────────────────────────────────┘
```

**Component Padding:**
- Card: **16px** all sides
- List item: **16px horizontal**, **12px vertical**
- Button: **24px horizontal**, **12px vertical**
- Input: **16px horizontal**, **12px vertical**
- Modal: **24px** all sides

---

## 🧪 VERIFICATION REQUIREMENTS

### Before Submitting PR, You MUST:

1. **Screenshot ALL screens** (mobile + web)
   - Before/after comparison
   - Show on multiple devices/breakpoints
   - Include in PR description

2. **Run Visual Regression Tests**
   - Playwright (web portals)
   - Detox (mobile apps)
   - Compare snapshots

3. **Verify Spacing with Ruler**
   - Use browser DevTools / React DevTools
   - Measure padding/margins
   - Confirm matches spacing scale

4. **Verify Colors with Picker**
   - Use color picker tool
   - Check all red colors are #C90D0D
   - No hardcoded colors

5. **Check Fonts**
   - Inspect element → verify font-family
   - Headings = Baloo Bhai
   - Body = Times New Roman

6. **Accessibility Audit**
   - Run Lighthouse (web)
   - Check contrast ratios
   - Verify touch targets ≥ 44px
   - Test with screen reader

7. **Create VERIFY_UI.md**
   - List all components implemented
   - Screenshot of each component
   - Checklist of acceptance criteria
   - Known issues / future enhancements

---

## 📝 DELIVERABLES CHECKLIST

### You MUST deliver:

#### Code
- [ ] All 45 components implemented
- [ ] All components use design tokens (no hardcoded values)
- [ ] All components exported from design-system package
- [ ] TypeScript types for all component props
- [ ] PropTypes/validation for all components

#### Documentation
- [ ] Component README for each component
- [ ] Usage examples for each component
- [ ] Props documentation
- [ ] Storybook story for each component
- [ ] VERIFY_UI.md with screenshots

#### Testing
- [ ] Unit tests for components (Jest)
- [ ] Visual regression tests (Playwright/Detox)
- [ ] Accessibility tests (Lighthouse)
- [ ] Cross-device testing (iOS/Android/browsers)

#### Implementation
- [ ] All mobile app screens themed
- [ ] All portal screens themed
- [ ] Ant Design ConfigProvider configured
- [ ] Fonts loaded (Baloo Bhai, Times New Roman)
- [ ] Theme applied consistently

---

## 🚀 EXECUTION INSTRUCTIONS FOR CURSOR

### Step 1: Create Design System Package
1. Set up `packages/design-system/` with all tokens (colors, typography, spacing, animations)
2. Create component folders (mobile/, web/, specialized/)
3. Set up build configuration (TypeScript)

### Step 2: Implement Mobile Components (Priority Order)
1. RButton ✅ (done)
2. RInput (critical - used everywhere)
3. RCard (critical - used everywhere)
4. RModal (critical - confirmations)
5. RText (critical - typography)
6. RForm (needed for forms)
7. RLoader (needed for loading states)
8. RAppBar (needed for navigation)
9. RBottomTabs (needed for navigation)
10. ... (remaining components)

### Step 3: Implement Web Components
1. RButtonWeb
2. RCardWeb
3. RTableWeb
4. RFormWeb
5. ... (all 16 components)

### Step 4: Apply to Applications
1. Mobile: Theme login screens (all 3 apps)
2. Mobile: Theme primary flows (booking, bidding)
3. Portal: Configure Ant Design theme
4. Portal: Apply custom components
5. Test on all devices/browsers

### Step 5: Documentation
1. Create Storybook
2. Add all components to Storybook
3. Generate VERIFY_UI.md with screenshots
4. Document any issues/limitations

---

## ✅ SUCCESS CRITERIA

**You've succeeded when:**
- [ ] All 45 components implemented and tested
- [ ] All screens use design system (zero hardcoded values)
- [ ] Baloo Bhai used for all headings
- [ ] Times New Roman used for all body text
- [ ] Rodistaa Red (#C90D0D) used for all primary actions
- [ ] All spacing uses 4/8/12/16/24/32 scale
- [ ] All touch targets ≥ 44px
- [ ] All contrast ratios ≥ 4.5:1
- [ ] Screenshots show visual consistency
- [ ] Storybook deployed and accessible
- [ ] VERIFY_UI.md complete with evidence

---

## 🎉 FINAL NOTES

**This is the COMPLETE prompt.**

Everything Cursor needs to implement the unified Rodistaa UI/UX system is here:
- ✅ Design tokens
- ✅ Component inventory
- ✅ Behavior rules
- ✅ Acceptance criteria
- ✅ Verification requirements

**Tell Cursor:**

> "Implement the Rodistaa unified UI/UX system exactly as specified in this prompt. Follow all three pillars: Acceptance Criteria, Component Inventory, and Interaction Behavior Rules. Deliver all 45 components with complete documentation and screenshots."

---

**GO BUILD! 🚀🎨**


