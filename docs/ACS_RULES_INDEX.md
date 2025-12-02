# 📋 ACS Rules Index - Top 25 Declarative Policy Rules

**Rodistaa Anti-Corruption Shield (ACS) - Declarative Rule Set**

**Version**: 1.0  
**Date**: December 19, 2024  
**Status**: ✅ **PRODUCTION-READY**

---

## 🎯 PURPOSE

This index provides a quick reference to all 25 ACS declarative policy rules defined in `acs_rules_top25.yaml`.

These rules are designed to be:
- **Declarative**: YAML-based, human-readable
- **Actionable**: Direct mapping to enforcement actions
- **Auditable**: All rules create immutable audit entries
- **Prioritized**: Rules execute by priority (1000 = highest)

---

## 📊 RULES SUMMARY

| Rule ID | Priority | Severity | Category | Description |
|---------|----------|----------|----------|-------------|
| RF01_KYC_MANDATORY | 1000 | Critical | Identity | Block transactions without KYC |
| RF02_TRUCK_DOCS_EXPIRED | 995 | Critical | Compliance | Auto-block trucks with expired docs |
| RF03_OTP_MANDATORY_COMPLETION | 990 | Critical | Security | Require valid OTP for completion |
| RF04_OTP_BRUTE_FORCE_PROTECTION | 989 | Critical | Security | Lock on OTP brute-force attempts |
| RF05_GPS_JUMP_ANOMALY | 980 | High | Tracking | Detect impossible GPS jumps |
| RF06_GPS_SPOOF_SIGNATURE | 975 | High | Tracking | Detect GPS spoofing patterns |
| RF07_POD_DUPLICATE_HASH | 970 | High | Fraud | Reject duplicate POD files |
| RF08_POD_METADATA_MISMATCH | 965 | High | Fraud | Reject POD timestamp mismatches |
| RF09_INSPECTION_GEO_MISSING | 960 | High | Compliance | Require geotagged inspections |
| RF10_INSPECTION_DUPLICATE_PHOTO | 955 | High | Fraud | Flag duplicate inspection photos |
| RF11_TRUCK_OWNER_MISMATCH | 950 | High | Compliance | Block chassis number mismatches |
| RF12_OPERATOR_MAX_TRUCKS_LIMIT | 945 | Medium | Limits | Enforce max trucks per operator |
| RF13_LEDGER_NEGATIVE_PREVENTION | 940 | High | Finance | Prevent negative ledger balances |
| RF14_AUTO_FINALIZATION_LEDGER_RACE | 935 | High | Finance | Re-check ledger on auto-finalize |
| RF15_BID_TIE_BREAKER | 930 | Medium | Business | Deterministic tie-breaking logic |
| RF16_PII_LEAK_REDACTION | 925 | High | Privacy | Detect and redact PII leaks |
| RF17_DEVICE_ACCOUNT_COLLISION | 920 | High | Fraud | Prevent device-account collisions |
| RF18_ADMIN_OVERRIDE_NO_JUSTIFICATION | 915 | Critical | Governance | Require 2FA for critical overrides |
| RF19_COLLUSION_TRIAD_FREQ | 910 | Critical | Fraud | Detect repeated triad patterns |
| RF20_BID_FLOOD_RATE_LIMIT | 905 | Medium | Abuse | Throttle high-frequency bid mods |
| RF21_PREDATORY_BID_DETECT | 900 | High | Business | Flag predatory low bids |
| RF22_MAINTENANCE_WINDOW_BLOCK | 895 | Medium | Operations | Respect maintenance windows |
| RF23_ROUTING_PROVIDER_FALLBACK | 890 | Medium | Operations | Handle routing provider failures |
| RF24_INSPECTION_OUT_OF_ZONE | 885 | High | Compliance | Reject out-of-zone inspections |
| RF25_BATCH_KYC_INGEST_INCONSISTENT | 880 | High | Operations | Handle bulk KYC ingest failures |

---

## 🔍 RULES BY CATEGORY

### Identity & KYC (2 rules)
- **RF01_KYC_MANDATORY** (Critical)
- **RF25_BATCH_KYC_INGEST_INCONSISTENT** (High)

### Compliance & Documents (4 rules)
- **RF02_TRUCK_DOCS_EXPIRED** (Critical)
- **RF09_INSPECTION_GEO_MISSING** (High)
- **RF11_TRUCK_OWNER_MISMATCH** (High)
- **RF24_INSPECTION_OUT_OF_ZONE** (High)

### Security & OTP (2 rules)
- **RF03_OTP_MANDATORY_COMPLETION** (Critical)
- **RF04_OTP_BRUTE_FORCE_PROTECTION** (Critical)

### Tracking & GPS (2 rules)
- **RF05_GPS_JUMP_ANOMALY** (High)
- **RF06_GPS_SPOOF_SIGNATURE** (High)

### Fraud Detection (5 rules)
- **RF07_POD_DUPLICATE_HASH** (High)
- **RF08_POD_METADATA_MISMATCH** (High)
- **RF10_INSPECTION_DUPLICATE_PHOTO** (High)
- **RF17_DEVICE_ACCOUNT_COLLISION** (High)
- **RF19_COLLUSION_TRIAD_FREQ** (Critical)

### Finance & Ledger (2 rules)
- **RF13_LEDGER_NEGATIVE_PREVENTION** (High)
- **RF14_AUTO_FINALIZATION_LEDGER_RACE** (High)

### Business Logic (3 rules)
- **RF12_OPERATOR_MAX_TRUCKS_LIMIT** (Medium)
- **RF15_BID_TIE_BREAKER** (Medium)
- **RF21_PREDATORY_BID_DETECT** (High)

### Privacy & PII (1 rule)
- **RF16_PII_LEAK_REDACTION** (High)

### Governance & Override (1 rule)
- **RF18_ADMIN_OVERRIDE_NO_JUSTIFICATION** (Critical)

### Abuse Prevention (1 rule)
- **RF20_BID_FLOOD_RATE_LIMIT** (Medium)

### Operations (2 rules)
- **RF22_MAINTENANCE_WINDOW_BLOCK** (Medium)
- **RF23_ROUTING_PROVIDER_FALLBACK** (Medium)

---

## 🎯 RULES BY SEVERITY

### Critical (6 rules)
- RF01, RF02, RF03, RF04, RF18, RF19

### High (16 rules)
- RF05, RF06, RF07, RF08, RF09, RF10, RF11, RF13, RF14, RF16, RF17, RF21, RF24, RF25

### Medium (3 rules)
- RF12, RF15, RF20, RF22, RF23

---

## 📝 RULE STRUCTURE

Each rule follows this structure:

```yaml
- id: RULE_ID
  priority: NUMBER (1000 = highest)
  severity: critical|high|medium|low
  description: "Human-readable description"
  condition: "DSL expression evaluating to true/false"
  action:
    - actionType: { parameters }
    - actionType: { parameters }
  audit: true|false
```

### Condition DSL

Simple expression language supporting:
- `event.*` fields (event type, payload)
- `ctx.*` fields (user context, role, device)
- `db.*` lookups (database queries)
- `system.config.*` (configuration values)
- Logical operators: `&&`, `||`, `!`, `in`
- Comparison operators: `==`, `!=`, `>=`, `<=`, `<`, `>`

### Supported Actions

- `freezeShipment` - Freeze shipment
- `blockEntity` - Block user/device/truck/IP
- `flagWatchlist` - Add to watchlist
- `emitEvent` - Emit event to event bus
- `requireManualReview` - Create manual review ticket
- `redactField` - Redact PII/data
- `rejectRequest` - Reject API request
- `throttle` - Apply rate limiting
- `createTicket` - Create support/fraud ticket
- `suspendAccount` - Suspend user account
- `notifyRole` - Send notification to role
- `proceed` - Allow with outcome tracking

---

## 🔗 FILE LOCATION

**Rules File**: `docs/acs_rules_top25.yaml`

**Usage**: Load into ACS Policy Engine for runtime enforcement

**Format**: YAML (human-readable, version-controlled)

---

## ✅ VALIDATION

All rules must:
- ✅ Have unique ID
- ✅ Have priority (1-1000)
- ✅ Have severity classification
- ✅ Have valid condition DSL
- ✅ Have at least one action
- ✅ Have audit flag set

---

## 📚 RELATED DOCUMENTATION

- **ACS Part 2**: `docs/RODISTAA_ANTI_CORRUPTION_SHIELD_v1.0_PART2.md`
- **Policy Engine**: See Section 4 of ACS Part 2
- **Enforcement Rules**: See Section 1 of ACS Part 2 (ER-01 to ER-15)
- **Event Hooks**: See Section 3 of ACS Part 2

---

**Status**: ✅ **25 RULES DEFINED AND READY FOR IMPLEMENTATION**

**Version**: 1.0  
**Last Updated**: December 19, 2024

