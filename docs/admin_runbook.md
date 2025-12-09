# Fleet Management Admin Portal - Operations Runbook

**Version**: 1.0.0  
**Last Updated**: December 5, 2025  
**Audience**: HQ Compliance Officers, Ops Managers, Support Team

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Common Operations](#common-operations)
3. [Incident Response](#incident-response)
4. [Troubleshooting](#troubleshooting)
5. [Escalation Procedures](#escalation-procedures)
6. [FAQs](#faqs)

---

## Quick Start

### Logging In

1. Navigate to: `https://admin.rodistaa.com/login`
2. Enter admin credentials
3. Complete 2FA (SuperAdmin only)
4. Dashboard loads automatically

### Dashboard Overview

- **Total Fleet**: All registered trucks
- **Allowed**: Trucks passing compliance
- **Blocked**: Trucks blocked from operations
- **Pending**: Trucks awaiting verification
- **Provider Performance**: VAHAN/Surepass success rates
- **Ticket SLA**: % of tickets resolved within SLA

---

## Common Operations

### 1. Block a Truck

**When to use**: Truck fails compliance, suspicious activity, operator dispute

**Steps**:
1. Go to **Fleet Management > Trucks**
2. Search for RC number
3. Click **Actions** > **Block Truck**
4. Enter detailed reason (min 10 characters):
   - ✅ Good: "Vehicle category mismatch between VAHAN (LMV) and actual (HMV). Verified with operator. Blocking pending clarification."
   - ❌ Bad: "Wrong type"
5. Optionally upload evidence (screenshots, reports)
6. Check "Create Ticket" if manual review needed
7. Click **Block Truck**

**Result**:
- ✅ Truck immediately blocked from bidding/shipments
- ✅ Audit log created with your admin ID
- ✅ Operator receives notification
- ✅ Ticket created (if selected)

**Audit Trail**: All block actions are logged. View in truck detail > Audit Trail tab.

---

### 2. Unblock a Truck

**When to use**: Issue resolved, compliance verified, operator provided proof

**Steps**:
1. Find blocked truck in list (filter by Compliance: Blocked)
2. Click **Actions** > **Unblock Truck**
3. Enter reason for unblocking (min 10 characters)
4. Click **Unblock Truck**

**Result**:
- ✅ Truck allowed in operations
- ✅ Audit log created
- ✅ Operator notified

---

### 3. Reverify a Truck

**When to use**: Suspected stale data, provider mismatch, operator requests

**Steps**:
1. Find truck (search by RC)
2. Click **Actions** > **Reverify with VAHAN**
3. Confirm action

**Result**:
- ✅ Reverification job enqueued
- ✅ Fresh VAHAN snapshot fetched (ETA: ~1 minute)
- ✅ Compliance re-evaluated
- ✅ Audit log created

**Note**: Reverify can be triggered in bulk (up to 1000 trucks at once).

---

### 4. Bulk Actions

**When to use**: Mass compliance review, operator-wide actions, emergency blocks

**Steps**:
1. Go to **Fleet Management > Trucks**
2. Apply filters (e.g., operator, city, compliance status)
3. Select trucks using checkboxes
4. Click bulk action button:
   - **Block** - Block all selected (requires reason)
   - **Unblock** - Unblock all selected (requires reason)
   - **Reverify** - Reverify all selected
   - **Export** - Download CSV/PDF

**Limits**:
- Maximum 1000 trucks per bulk action
- Rate limit: 10 bulk actions per minute

**Result**:
- ✅ Each truck processed individually
- ✅ Success/failure summary displayed
- ✅ Correlation ID for tracking all related actions
- ✅ Notification when complete

---

### 5. Resolve a Ticket

**When to use**: Investigation complete, issue fixed, decision made

**Steps**:
1. Go to **Fleet Management > Tickets**
2. Find ticket (filter by priority, status, assigned to me)
3. Click **Resolve**
4. Select resolution type:
   - **Approved** - Request approved
   - **Rejected** - Request rejected
   - **Fixed** - Issue resolved
   - **No Action Needed** - False alarm
5. Enter resolution notes (min 20 characters)
6. Click **Resolve Ticket**

**Result**:
- ✅ Ticket status = RESOLVED
- ✅ SLA timer stopped
- ✅ Audit log created
- ✅ Notifications sent

---

### 6. Link Trailer to Tractor

**When to use**: Tractor-trailer combination for long-haul shipments

**Steps**:
1. Go to truck detail page (tractor)
2. Click **Linked Vehicles** tab
3. Click **Link Trailer**
4. Enter trailer RC number
5. Confirm

**Validation**:
- Tractor must be registered
- Trailer must be registered
- Both must be active
- Trailer cannot already be linked

**Result**:
- ✅ Link created (status: active)
- ✅ Both records updated
- ✅ Audit logs created for both vehicles

---

### 7. Export Fleet Data

**When to use**: Compliance reports, operator audits, data analysis

**Steps**:
1. Go to **Fleet Management > Trucks**
2. Apply filters (optional)
3. Select trucks (or use "Select All")
4. Click **Export** > **CSV** or **PDF**
5. Wait for notification (Export Ready)
6. Download from notification link

**PII Handling**:
- **SuperAdmin**: Exports include owner name, mobile (full data)
- **Others**: PII masked (e.g., `John ***`, `*******1234`)

**Expiration**: Export files auto-delete after 24 hours.

---

## Incident Response

### Scenario 1: Provider Outage Detected

**Alert**: "⚠️ PROVIDER OUTAGE: VAHAN - Error rate at 65%"

**Actions**:
1. Check provider status dashboard
2. Verify outage (not local issue)
3. Notify DevOps team
4. Switch to fallback provider (Surepass) if available
5. Monitor error rate
6. Document in incident log

**Recovery**:
- Wait for provider recovery
- Reverify all failed trucks (bulk action)
- Review and resolve failed tickets

---

### Scenario 2: SLA Breach Alert

**Alert**: "🚨 SLA BREACH: Ticket TKT-001 - Immediate action required"

**Actions**:
1. Open ticket immediately
2. Review ticket details and metadata
3. If assigned to you:
   - Investigate and resolve within 1 hour (P0) or 4 hours (P1)
4. If not assigned:
   - Escalate to assigned admin
   - Or self-assign if urgent

**Escalation**:
- P0: Escalate to SuperAdmin if not resolved in 4 hours
- P1: Escalate if not resolved in 24 hours

---

### Scenario 3: Duplicate Chassis Alert

**Alert**: "Duplicate Chassis Detected - 2 RCs with same chassis hash"

**Actions**:
1. Open duplicate chassis ticket
2. Review both truck records
3. Check provider snapshots (VAHAN raw data)
4. Verify with operators
5. Decision options:
   - One is duplicate → Block fake RC
   - Data entry error → Fix chassis number
   - Provider error → Request fresh snapshot
6. Document decision in ticket resolution

---

### Scenario 4: Mass Blocking Event (100+ trucks in 1 hour)

**Alert**: "🚨 MASS BLOCKING EVENT - 150 trucks blocked in last hour"

**Actions**:
1. Review audit logs (filter by action: BLOCK, last 1 hour)
2. Identify pattern:
   - Same operator? → Operator-level issue
   - Same RTO? → RTO-specific compliance issue
   - Same admin? → Verify admin actions are legitimate
3. Investigate root cause
4. If error/mistake:
   - Use bulk unblock with reason
   - Notify affected operators
5. If legitimate:
   - Document in incident report
   - Notify senior management

---

## Troubleshooting

### Issue: Truck Not Appearing in List

**Possible Causes**:
- Truck not registered in system
- Filters hiding truck (check compliance filter)
- Database sync issue

**Resolution**:
1. Clear all filters
2. Search by exact RC number
3. Check if truck exists in Truck Master
4. If missing, check database logs

---

### Issue: Verification Taking Too Long

**Possible Causes**:
- Provider API latency
- Provider outage
- Network issues

**Resolution**:
1. Check provider status dashboard
2. If provider down, wait for recovery
3. If timeout, retry reverification
4. If persistent, create ticket for DevOps

---

### Issue: Cannot Block Truck (403 Error)

**Possible Causes**:
- Insufficient permissions
- Wrong role

**Resolution**:
1. Check your role (top-right profile)
2. `ReadOnlyAnalyst` cannot block trucks
3. Request role upgrade from SuperAdmin if needed

---

### Issue: Export Missing PII Data

**Possible Causes**:
- You're not SuperAdmin
- PII automatically masked for security

**Resolution**:
- Only `SuperAdmin` can export with PII
- Request SuperAdmin to generate export
- Or use masked data for analysis

---

## Escalation Procedures

### Level 1: Self-Resolution (You)
- Handle routine tickets (P2, P3)
- Block/unblock based on clear compliance rules
- Resolve provider mismatches with documentation

### Level 2: Team Lead
- Complex compliance decisions
- Operator disputes
- SLA breached tickets (P1)

### Level 3: SuperAdmin
- Mass blocking events
- System-wide issues
- Critical SLA breaches (P0)
- Security incidents

### Level 4: Engineering Team
- Provider outages
- Database issues
- Performance problems
- Bug reports

### Level 5: Management
- Legal disputes
- Policy decisions
- Major operator issues

---

## FAQs

### Q: How do I know if a truck is blocked?
**A**: Look for red `BLOCKED` badge in trucks list or detail page.

### Q: Can I unblock my own blocked truck?
**A**: Yes, if you have `trucks:unblock` permission. Reason is required.

### Q: What happens when I block a truck?
**A**: Truck is immediately removed from active fleet, operator is notified, audit log created.

### Q: How long does reverification take?
**A**: Usually 30-60 seconds. Provider API latency may vary.

### Q: What if VAHAN and Surepass disagree?
**A**: System creates `PROVIDER_MISMATCH` ticket automatically. Manual review required.

### Q: Can I export PII data?
**A**: Only if you're SuperAdmin. Others see masked data (e.g., `John ***`, `*******1234`).

### Q: What's the SLA for P0 tickets?
**A**: 4 hours. P1: 24h, P2: 72h, P3: 168h.

### Q: How do I view audit trail for a truck?
**A**: Truck detail page > Audit Trail tab. Shows all admin actions with timestamps and reasons.

### Q: Can I undo a block action?
**A**: Use "Unblock" with reason. Original block remains in audit log (immutable).

### Q: What if I made a mistake?
**A**: Audit logs are immutable. Take corrective action (e.g., unblock if wrongly blocked) and document in ticket.

---

## Best Practices

### ✅ DO:
- ✅ Always provide detailed reasons (min 10 characters)
- ✅ Attach evidence when blocking trucks
- ✅ Review provider snapshots before blocking
- ✅ Resolve tickets within SLA
- ✅ Document decisions thoroughly
- ✅ Use bulk actions for efficiency

### ❌ DON'T:
- ❌ Block without valid reason
- ❌ Use vague reasons ("bad truck")
- ❌ Ignore SLA breaches
- ❌ Bypass audit logging
- ❌ Share admin credentials
- ❌ Export PII without business need

---

## Compliance & Security

### Audit Logging
- **All actions are logged** (immutable)
- Includes: admin ID, timestamp, IP address, reason
- Logs retained for 7 years
- Cannot be deleted or modified

### Data Privacy
- PII masked in exports (non-SuperAdmin)
- Access controlled by RBAC
- All data access logged

### Security Alerts
- Failed login attempts → Notify security team
- Mass actions → Require additional confirmation
- After-hours access → Flag for review

---

## Support Contacts

| Issue Type | Contact | Response Time |
|------------|---------|---------------|
| Technical issues | backend@rodistaa.com | 4 hours |
| Permission issues | admin@rodistaa.com | 24 hours |
| Provider outages | devops@rodistaa.com | Immediate |
| Security incidents | security@rodistaa.com | Immediate |
| Policy questions | compliance@rodistaa.com | 48 hours |

---

## Change Log

### Version 1.0.0 (Dec 5, 2025)
- Initial release
- Database schema deployed
- RBAC configured
- All core features operational

---

**Questions? Contact**: operations@rodistaa.com  
**Documentation**: https://docs.rodistaa.com/admin-portal  
**Training**: Available upon request

