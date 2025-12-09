# Mobile UI Wireframes & Interaction Notes

## 1. QUICK BOOK — Single-Screen Fast Path

**Purpose:** Get a shipper from intent → quoted price → confirm in under 20 seconds.

### Layout (Mobile Portrait)

```
| Rodistaa (top nav)    | My Bookings 🔔 |
-----------------------------------------
| Quick Book                     [Help ?]|
|---------------------------------------|
| PICKUP                             >  |
| [Autocomplete address input]        |
| Contact: [Ravi]  Ph: [91-XXXXXXXX]   |
|---------------------------------------|
| DROP                               > |
| [Autocomplete address input]        |
| Contact: [Kumar]  Ph: [91-YYYYYYYY]  |
|---------------------------------------|
| PICKUP WINDOW                       >
| [ASAP • Select date/time picker]    |
|---------------------------------------|
| CARGO                                |
| Weight (ton): [  12.5 ]  [calc icon] |
| Type: [General ▼]  [Fragile][High]  |
| Body preference: [OPEN] [CONTAINER]  |
| Special: [Forklift][Permit]          |
|---------------------------------------|
| SUGGESTED TRUCK                      |
| Heavy Truck • 12-tyre • 28 ft • Open |
| Est. Distance: 152 km • ETA: 6 hrs   |
|---------------------------------------|
| PRICE (instant quote)                |
| ₹ 1,245  (breakdown ▾)               |
| [Tonnage ₹ 375] [Distance ₹ 600]     |
| Min fee applied: No                  |
|---------------------------------------|
| [Book Now — PREPAY]  [Request Quote] |
|---------------------------------------|
| Footer: Terms • Cancellation • Help  |
```

### Interaction Notes

- Address fields: Google/Mapbox autocomplete; allow map pin drop
- Weight input: kg/tonne toggle; calc icon suggests truck based on weight
- Suggested Truck: Derived from capacity estimate (tyre_count & body_length_ft)
- Price computed via POST /api/bookings (OpenAPI)
- Primary CTA: Book Now (PREPAID) → payment flow
- Secondary CTA: Request Quote → creates tender
- Error handling: Inline field errors, block CTA on validation failure
- Accessibility: Labelled form elements, large tap targets

---

## 2. BOOKING DETAIL — Active Booking Screen

**Purpose:** Shows booking info, driver assignment, ETA, and actions.

### Layout

```
| ← Bookings     Booking B-20251208-01  |
-----------------------------------------
| STATUS: CONFIRMED • ETA: Driver in 3h |
|---------------------------------------|
| PICKUP → [Short address line]         |
| Contact • Ravi  91-XXXXXXX   [Call]   |
|---------------------------------------|
| DROP → [Short address line]           |
| Contact • Kumar  91-YYYYYYY   [Call]  |
|---------------------------------------|
| CARGO                                |
| 12.5 ton • Open • Forklift required   |
| Notes: Fragile pallets                |
|---------------------------------------|
| PRICE                                 |
| ₹ 1,245  (View breakdown ▸)           |
|---------------------------------------|
| ASSIGNMENT                            |
| Assigned Truck: HCV-TR-2389           |
| Operator: Sri Transport               |
| Driver: Ramesh (Contact masked)       |
| ETA at pickup: 03:20 PM (3h 10m)      |
| [Message Driver]  [Request Early]     |
|---------------------------------------|
| TIMELINE                              |
| Created: 09:00 AM                     |
| Assigned: 09:05 AM                    |
| Driver ETA updated: 10:20 AM          |
|---------------------------------------|
| ACTIONS                               |
| [Track Live]  [Cancel Booking]        |
| [Upload Documents]  [Request Support] |
|---------------------------------------|
| Footer: Franchise Contact • Support   |
```

### Interaction Notes

- Assignment block: GET /api/bookings/{bookingId}
- Message Driver: Secure in-app chat (no phone sharing)
- Request Early: Priority ticket to franchise
- Timeline: Event feed from GET /api/bookings/{id}/events
- Cancellation: POST /api/bookings/{id}/cancel with penalty estimate
- If assignment pending: Show "Searching..." with SLA threshold
- Replacement guarantee if driver declines after SLA

---

## 3. LIVE TRACKING — In-Transit View

**Purpose:** Real-time, map-first screen with status, milestones, exceptions.

### Layout

```
| ← Booking B-20251208-01   [Share] [⋮] |
-----------------------------------------
| STATUS RIBBON: IN TRANSIT  •  580 km left |
|---------------------------------------|
| MAP (full-width) showing truck pin, route,
| pickup marker, drop marker, ETA bubble |
|---------------------------------------|
| TRUCK CARD (overlay bottom)            |
| HCV-TR-2389 • 12-tyre • Open           |
| Driver: Ramesh (mask)  ETA: 5h         |
| Live Speed: 48 km/h • Last ping: 2m    |
| [Call Driver] [Message]  [Share ETA]  |
|---------------------------------------|
| MILESTONES                              |
| • Picked up: 12:25 PM (photo)          |
| • Reached Hwy 65 toll: 03:30 PM        |
| • Delay reported: 04:10 PM (traffic)   |
|---------------------------------------|
| EXCEPTIONS / ALERTS                     |
| • GPS offline 25 min [Request Photo]   |
| • Route deviation 8 km                  |
|---------------------------------------|
| POD (on arrival)                        |
| [Upload POD] [Capture Signature]       |
|---------------------------------------|
| Footer: Invoice status • Raise Dispute |
```

### Interaction Notes

- Map updates: WebSocket/SSE for low-latency location pings
- Share: Creates short-lived tracking link (masked driver number)
- Milestones: Events in booking timeline with photos/GPS
- Exceptions: Quick actions (request photo, contact franchise)
- POD upload: POST /api/bookings/{id}/complete (multipart)
- Validation: Signature capture, consignee phone format
- Offline recovery: Escalate to franchise if no driver response

---

## UX + Interaction Rules (Cross-Screen)

1. **Minimal typing** — Use dropdowns, autocomplete, defaults
2. **Progress indicators** — Clear "Quote computed", "Assignment in progress"
3. **Timeouts & fallbacks** — Matching SLA (default 12 min) then expand pool
4. **Transparency** — Show pricing breakdown, policies inline
5. **Franchise preference** — Show franchise contact for catchment areas
6. **Error states** — Inline field errors, non-blocking toast for warnings
7. **Accessibility** — Large text, high-contrast CTAs, ALT text
8. **Internationalization** — Labels localizable (English + Telugu)

---

## API Touchpoints

- Quick Book → POST /api/bookings → returns booking_id + quote
- Confirm → POST /api/bookings/{id}/confirm → triggers matching
- Booking detail → GET /api/bookings/{id} & events
- Assignment → POST /api/bookings/{id}/assign (internal)
- Pickup start → POST /api/bookings/{id}/start (multipart)
- Complete → POST /api/bookings/{id}/complete
- Cancel → POST /api/bookings/{id}/cancel
- Webhooks: booking.assigned, booking.started, booking.completed

---

## Edge Flows & Exception Handling

1. **No trucks found** — Show "expanding coverage" + franchise-assist
2. **Driver decline** — Automated re-match + compensate if SLA breached
3. **Weight mismatch** — Require weighbridge slip + dispute flow
4. **GPS tampering** — Request photo with GPS, escalate if no response
5. **High-value cargo** — Require additional KYC & insurance
6. **Cross-state permits** — Route to franchise for manual permit check
