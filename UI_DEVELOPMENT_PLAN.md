# Rodistaa UI Development Plan

**Status**: In Progress  
**Started**: 2025-01-04  
**Target**: Complete UI system across all apps and portals

---

## Phase 1: Design System Foundation ✅ IN PROGRESS

### 1.1 Token System Enhancement
- [x] Primary Red: #C90D0D
- [x] Typography: Baloo Bhai + Times New Roman
- [x] Spacing: 4/8/12/16/24/32
- [ ] Radii: 6px / 8px (verify)
- [x] Motion: 120ms micro-transitions

### 1.2 Atomic Components
- [x] RButton (mobile)
- [x] RInput (mobile)
- [x] RCard (mobile)
- [ ] RTag (mobile) - NEW
- [ ] RStepper (mobile) - NEW
- [ ] RList (mobile) - NEW
- [ ] RNavBar (mobile) - NEW
- [x] RButtonWeb
- [x] RCardWeb
- [ ] RTagWeb - NEW
- [ ] RStepperWeb - NEW

### 1.3 Molecule Components
- [ ] LoadCard (mobile) - NEW
- [ ] TruckCard (mobile) - NEW
- [ ] BidCard (mobile) - NEW
- [ ] Timeline (mobile) - NEW
- [ ] DriverFlowElements (mobile) - NEW
- [ ] LoadCardWeb - NEW
- [ ] TruckCardWeb - NEW
- [ ] BidCardWeb - NEW
- [ ] TimelineWeb - NEW

### 1.4 Organism Components
- [ ] BookingFlow (mobile) - NEW
- [ ] InspectionGrid (web) - NEW
- [ ] KYCViewer (web) - NEW
- [ ] ACSPanel (web) - NEW

---

## Phase 2: Mobile Apps UI

### 2.1 Shipper App (8 screens)
- [ ] Home + CTA
- [ ] Post Load (4-step wizard)
- [ ] Bidding screen + counter-offer sheet
- [ ] Shipment timeline
- [ ] Live tracking
- [ ] POD upload + OTP

### 2.2 Operator App (12 screens)
- [ ] Dashboard
- [ ] Add Truck + photo grid
- [ ] Truck list + detail
- [ ] Bid submission + bottom sheet
- [ ] Driver assignment

### 2.3 Driver App (10 screens)
- [ ] Trip list
- [ ] Trip flow (pickup → route → drop → POD → complete)
- [ ] Photo capture screens
- [ ] Delay/breakdown UI

---

## Phase 3: Portal UI

### 3.1 Admin Portal (8 modules)
- [ ] KPI dashboard
- [ ] Bookings table + detail side panel
- [ ] Bids viewer
- [ ] Shipments timeline + POD viewer
- [ ] Truck inspection gallery
- [ ] KYC decrypt flow
- [ ] ACS override panel
- [ ] Franchise management

### 3.2 Franchise Portal (4 modules)
- [ ] District: Unit performance dashboard
- [ ] District: Target settings
- [ ] District: Inspection summary heatmaps
- [ ] Unit: Pending inspections
- [ ] Unit: Photo checklist grid
- [ ] Unit: Inspection history timeline

---

## Phase 4: Testing & Documentation

### 4.1 Storybook
- [ ] Setup Storybook
- [ ] Stories for all atomic components
- [ ] Stories for all molecule components
- [ ] Stories for all organism components

### 4.2 Tests
- [ ] Playwright visual tests (web)
- [ ] Jest component tests (mobile)
- [ ] Snapshot tests
- [ ] Accessibility tests

### 4.3 Documentation
- [ ] Design system documentation
- [ ] Component usage examples
- [ ] UX flow charts
- [ ] Theme details
- [ ] Architecture overview
- [ ] VERIFY_UI.md

---

## Execution Order

1. ✅ Update token system
2. ⏳ Build missing atomic components
3. ⏳ Build molecule components
4. ⏳ Build organism components
5. ⏳ Build mobile app screens
6. ⏳ Build portal screens
7. ⏳ Setup Storybook
8. ⏳ Create tests
9. ⏳ Create documentation

---

**Current Status**: Phase 1.1 - Token System Enhancement

