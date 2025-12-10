# 🚛 Fleet Management Admin Portal - Implementation Plan

**Status**: 🏗️ In Progress  
**Started**: December 5, 2025  
**Target Completion**: Phased rollout  
**Tech Stack**: Next.js 14 + TypeScript + AntD + Node.js + PostgreSQL

---

## 📋 Executive Summary

Building a production-ready Fleet Management module for the Rodistaa Admin Portal that enables HQ compliance, operations, and analytics teams to manage the entire truck master lifecycle with:

- ✅ **RBAC** - 4 role types with granular permissions
- ✅ **Audit Logging** - Immutable audit trail of all actions
- ✅ **Ticketing System** - SLA-driven ticket queue with escalation
- ✅ **Analytics Dashboard** - Real-time fleet health KPIs
- ✅ **Bulk Actions** - High-performance bulk operations
- ✅ **Compliance Management** - Block/unblock with reason tracking
- ✅ **Trailer Linking** - Visual tractor-trailer pairing
- ✅ **Export & Reports** - CSV/PDF with PII masking

---

## 🎯 Objectives (Must Deliver)

### Phase 1: Core Infrastructure ✅
- [x] Database migrations (10 tables + indexes)
- [x] RBAC roles configuration
- [ ] Auth middleware with JWT + role checks
- [ ] Audit service (immutable logging)
- [ ] Notification service (alerts & webhooks)

### Phase 2: Backend API
- [ ] Truck admin controller (list, detail, actions)
- [ ] Ticket controller (CRUD, assignment, resolution)
- [ ] Export service (CSV/PDF with PII masking)
- [ ] Bulk action processor
- [ ] Trailer linking service
- [ ] Analytics aggregation service

### Phase 3: Frontend UI
- [ ] Fleet Dashboard (KPIs + charts)
- [ ] Trucks List (table + filters + bulk actions)
- [ ] Truck Detail (tabs + compliance view)
- [ ] Tickets Queue (SLA management)
- [ ] Analytics page (advanced charts)
- [ ] Reusable components (badges, modals, timelines)

### Phase 4: Testing & Documentation
- [ ] Unit tests (services + controllers)
- [ ] Integration tests (API endpoints)
- [ ] React component tests
- [ ] API documentation
- [ ] Operations runbook
- [ ] Security audit

---

## 🗂️ Project Structure

```
packages/
├── backend/
│   ├── migrations/
│   │   └── 010_admin_fleet_management.sql ✅
│   └── src/
│       ├── config/
│       │   └── roles.json ✅
│       └── admin/
│           ├── middleware/
│           │   └── auth.ts
│           ├── controllers/
│           │   ├── truckAdminController.ts
│           │   ├── ticketController.ts
│           │   └── analyticsController.ts
│           ├── services/
│           │   ├── auditService.ts
│           │   ├── notificationService.ts
│           │   ├── exportService.ts
│           │   ├── bulkActionService.ts
│           │   └── trailerLinkService.ts
│           ├── validators/
│           │   ├── truckValidator.ts
│           │   └── ticketValidator.ts
│           └── routes/
│               └── adminRoutes.ts
│
└── portal/
    └── src/
        ├── pages/admin/fleet/
        │   ├── index.tsx (Dashboard)
        │   ├── trucks.tsx (List)
        │   ├── trucks/[rc].tsx (Detail)
        │   ├── tickets.tsx (Queue)
        │   └── analytics.tsx (Charts)
        ├── modules/fleet/
        │   ├── types.ts
        │   ├── components/
        │   │   ├── ComplianceBadge.tsx
        │   │   ├── TruckRowActions.tsx
        │   │   ├── BulkActionToolbar.tsx
        │   │   ├── TxnViewer.tsx
        │   │   ├── AuditTimeline.tsx
        │   │   └── ConfirmModal.tsx
        │   └── hooks/
        │       ├── useTrucks.ts
        │       └── useTickets.ts
        └── tests/fleet/
            ├── components/
            └── pages/
```

---

## 📊 Database Schema

### Tables Created (10 total)

1. **admin_users** - Admin portal users with RBAC
2. **admin_audit_logs** - Immutable audit trail (no updates/deletes)
3. **admin_notifications** - In-app alerts + webhooks
4. **admin_saved_filters** - User-saved filter configurations
5. **hq_tickets** - Ticket queue with SLA tracking
6. **ticket_comments** - Comments and activity log
7. **fleet_analytics_cache** - Cached metrics for performance
8. **trailer_links** - Tractor-trailer relationships
9. **webhook_subscriptions** - Event notification endpoints
10. **data_retention_policies** - Auto-cleanup rules

### Key Features:
- ✅ Immutable audit logs (rules prevent UPDATE/DELETE)
- ✅ Auto-generated txn_ids
- ✅ GIN indexes for JSONB queries
- ✅ Comprehensive foreign key constraints
- ✅ Automatic timestamp management

---

## 🔐 RBAC System

### Roles & Permissions

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **SuperAdmin** | Full access | All permissions + PII exports |
| **ComplianceOfficer** | Block/unblock trucks | Compliance actions + tickets |
| **OpsManager** | Operational control | Reverify + bulk actions |
| **ReadOnlyAnalyst** | View-only | Dashboards + exports (no PII) |

### Permission Matrix (23 permissions total)

```
trucks:read, trucks:write, trucks:block, trucks:unblock
trucks:reverify, trucks:export, trucks:export_pii
trucks:bulk_action, trailers:link, trailers:unlink
tickets:read, tickets:create, tickets:assign, tickets:resolve
analytics:read, audit:read
users:read, users:write, users:delete
notifications:send, webhooks:manage
```

All destructive actions require reasons and create audit entries.

---

## 🚀 API Endpoints

### Truck Management

```
GET    /admin/trucks                    # Paginated list + filters
GET    /admin/trucks/:rc                # Detail view + compliance
POST   /admin/trucks/:rc/block          # Block with reason
POST   /admin/trucks/:rc/unblock        # Unblock with reason
POST   /admin/trucks/:rc/reverify       # Enqueue reverify
POST   /admin/trucks/bulk-action        # Bulk operations
POST   /admin/trucks/:rc/link-trailer   # Link trailer
```

### Ticket Management

```
GET    /admin/tickets                   # List with filters
GET    /admin/tickets/:id               # Ticket details
POST   /admin/tickets                   # Create ticket
PUT    /admin/tickets/:id/assign        # Assign to admin
POST   /admin/tickets/:id/resolve       # Resolve ticket
POST   /admin/tickets/:id/escalate      # Escalate ticket
```

### Analytics

```
GET    /admin/analytics/dashboard       # KPIs summary
GET    /admin/analytics/fleet-health    # Fleet health metrics
GET    /admin/analytics/provider-stats  # Provider success rates
GET    /admin/analytics/sla-report      # SLA compliance
```

### Audit & Export

```
GET    /admin/audit-logs                # Query audit logs
POST   /admin/export                    # Generate export
GET    /admin/export/:id                # Download export
```

---

## 🎨 UI Components

### Dashboard (pages/admin/fleet/index.tsx)

**KPIs Display:**
- Total Trucks
- Allowed vs Blocked ratio
- Pending Verifications
- Tickets SLA status
- Provider success rate
- Top 10 RTOs by blocked count
- Operator violation leaderboard

**Charts:**
- Daily verification success rate (line chart)
- Compliance distribution (pie chart)
- Provider performance (bar chart)
- Ticket volume trend (area chart)

### Trucks List (pages/admin/fleet/trucks.tsx)

**Features:**
- Server-side pagination (25/50/100 per page)
- Multi-column sorting
- Advanced filters (RC, operator, compliance, provider, etc.)
- Saved filters dropdown
- Bulk select checkboxes
- Bulk action menu (block, unblock, reverify, export)

**Columns:**
- RC Number (clickable → detail)
- Operator Name
- Compliance Badge (color-coded)
- Last Verified (relative time)
- Provider (VAHAN, Surepass, etc.)
- Tyres, Label, Body Type, GVW
- Inferred Length + Fit Score
- Tickets Count (badge)
- Quick Actions (dropdown)

### Truck Detail (pages/admin/fleet/trucks/[rc].tsx)

**Layout:**
- Header card (RC, Label, Compliance, Block/Unblock toggle)
- Action bar (Block, Reverify, Create Ticket, Export)
- Tabs:
  1. **VAHAN Snapshot** - Raw JSON + copy txn_id
  2. **Inference & Confidence** - Trace, rules, candidates
  3. **Compliance History** - Timeline of decisions
  4. **Tickets** - Associated tickets (create, view, resolve)
  5. **Linked Vehicles** - Tractor/trailer relationships
  6. **Operator Details** - Quick link to operator profile
  7. **Audit Trail** - All admin actions on this truck

### Tickets Queue (pages/admin/fleet/tickets.tsx)

**Features:**
- Priority filter (P0/P1/P2/P3)
- Status filter (Open, In Progress, Resolved)
- Assigned to me / Unassigned
- SLA countdown indicators
- Bulk assign
- Quick actions (View, Assign, Resolve)

---

## 🧪 Testing Strategy

### Unit Tests (Jest)
- ✅ Audit service writes immutable logs
- ✅ RBAC checks permissions correctly
- ✅ Export service masks PII for non-superadmin
- ✅ Bulk action processor handles errors gracefully
- ✅ SLA calculator computes correctly

### Integration Tests (Supertest)
- ✅ Block truck → audit log created + notification sent
- ✅ Bulk reverify → jobs enqueued + success summary returned
- ✅ Trailer link → both records updated + audit entries
- ✅ Ticket SLA breach → escalates automatically
- ✅ RBAC enforcement → ReadOnlyAnalyst cannot block

### E2E Tests (Playwright)
- ✅ Admin logs in → sees dashboard
- ✅ Filter trucks by compliance → results correct
- ✅ Block truck → confirmation modal → success → audit visible
- ✅ Create ticket → assign → resolve → status updated
- ✅ Export trucks → download CSV → PII masked

---

## 📈 Performance Considerations

### Database Optimizations
- ✅ Indexes on all query columns (status, created_at, RC, etc.)
- ✅ GIN indexes for JSONB queries
- ✅ Partitioning for audit_logs (by month, 7-year retention)
- ✅ Analytics cache table (5-minute TTL)
- ✅ Cursor-based pagination for large datasets

### Frontend Optimizations
- ✅ Server-side pagination (no client-side loading of all trucks)
- ✅ Debounced search input (300ms)
- ✅ React Query for caching + stale-while-revalidate
- ✅ Virtual scrolling for large tables (react-window)
- ✅ Code splitting per route

---

## 🔒 Security & Compliance

### Authentication
- JWT tokens (1-hour expiry)
- Refresh tokens (7-day expiry)
- 2FA for SuperAdmin (TOTP)
- IP whitelisting option
- Session management (force logout)

### Authorization
- Role-based access control (RBAC)
- Granular permissions (23 permissions)
- Action-level checks (every endpoint)
- Resource-level checks (own tickets vs all)

### Audit & Compliance
- Immutable audit logs (no UPDATE/DELETE)
- Every action tracked (admin_id, IP, timestamp)
- PII masking in exports (non-superadmin)
- Data retention (7 years for audit, 90 days for notifications)
- GDPR-compliant data deletion

### API Security
- Rate limiting (100 req/min per user)
- Input validation (Joi schemas)
- SQL injection prevention (parameterized queries)
- XSS prevention (sanitized outputs)
- CORS configuration (admin domain only)

---

## 📅 Implementation Timeline

### Week 1 (December 5-11, 2025)
- [x] Database migrations ✅
- [x] RBAC configuration ✅
- [ ] Auth middleware + JWT
- [ ] Audit service + tests
- [ ] Notification service + webhooks

### Week 2 (December 12-18, 2025)
- [ ] Truck admin controller
- [ ] Ticket controller
- [ ] Export service
- [ ] Bulk action processor
- [ ] Trailer linking service

### Week 3 (December 19-25, 2025)
- [ ] Dashboard page + KPIs
- [ ] Trucks list + filters
- [ ] Truck detail + tabs
- [ ] Tickets queue
- [ ] UI components

### Week 4 (December 26-31, 2025)
- [ ] Analytics page + charts
- [ ] Integration tests
- [ ] E2E tests
- [ ] API documentation
- [ ] Operations runbook

---

## 🚨 Critical Paths & Dependencies

### Blockers
1. **VAHAN API Integration** - Truck Master /api/truck/:rc endpoint must exist
2. **Operator API** - /api/operator/:id/trucks for linking
3. **Ticket Integration** - HQ ticket system must be operational

### External Dependencies
- Truck Master service (existing)
- VAHAN provider adapters (existing)
- Notification system (email/Slack webhooks)
- Export file storage (S3/local)

---

## 📝 TODO: Action Items

### High Priority
- [ ] Review database migration with DBA
- [ ] Obtain VAHAN API test credentials
- [ ] Set up Slack webhook for critical alerts
- [ ] Configure S3 for export file storage
- [ ] Set up monitoring (Datadog/Prometheus)

### Medium Priority
- [ ] Design wireframes for UI (Figma)
- [ ] Load test bulk actions (1000+ trucks)
- [ ] Security audit (penetration testing)
- [ ] Accessibility review (WCAG 2.1)

### Low Priority
- [ ] Mobile responsiveness (tablet optimization)
- [ ] Dark mode support
- [ ] Keyboard shortcuts
- [ ] Export scheduling (cron jobs)

---

## 📞 Stakeholders & Contacts

| Role | Name | Responsibility |
|------|------|----------------|
| Product Owner | TBD | Requirements + priorities |
| Tech Lead | TBD | Architecture + code review |
| Backend Dev | TBD | API implementation |
| Frontend Dev | TBD | UI implementation |
| QA Engineer | TBD | Testing + validation |
| DevOps | TBD | Deployment + monitoring |

---

## 🎉 Success Metrics

### Technical Metrics
- ✅ 100% test coverage (unit + integration)
- ✅ <200ms API response time (p95)
- ✅ Zero audit log gaps
- ✅ 99.9% uptime
- ✅ <3s page load time

### Business Metrics
- ✅ 95% SLA compliance (ticket resolution)
- ✅ 50% reduction in manual review time
- ✅ 100% audit trail coverage
- ✅ Real-time compliance enforcement
- ✅ Zero unauthorized access incidents

---

## 📚 References

- [Truck Master Documentation](../truck-master/README.md)
- [VAHAN API Specification](../truck-master/docs/VAHAN_API.md)
- [ACS Rules Engine](../acs/README.md)
- [Existing Admin Portal](../portal/README.md)

---

**Last Updated**: December 5, 2025  
**Document Owner**: AI CTO  
**Version**: 1.0.0

