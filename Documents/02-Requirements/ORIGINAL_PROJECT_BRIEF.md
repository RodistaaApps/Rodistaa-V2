# Original Project Brief - Rodistaa Logistics Platform

**Date Received:** December 4, 2025  
**Scope:** MVP → v1 Production-Ready Platform  
**Timeline:** 6-8 weeks (phased)

---

## PROJECT OVERVIEW

Build **Rodistaa**: A freight-first, no-commission truck aggregator for India focused on MCV & HCV trucks.

### Core Value Proposition
- Freight-first approach
- No commission model
- Win-based fee (pay only after winning & starting trip)
- Focus on MCV & HCV trucks
- India-specific compliance (STN/CTL/CYM/RVA/RLV)

---

## TECHNICAL STACK REQUIREMENTS

### Backend
- Node.js + TypeScript
- PostgreSQL for relational data
- Redis for cache/locks
- Kafka or RabbitMQ for events
- Microservices or modular monolith

### Mobile Apps
- React Native (Android-first)
- Operator App
- Driver App (lightweight)

### Web Apps
- React + TypeScript
- Shipper Portal
- Admin Portal
- Franchise Portal

### Authentication
- JWT + refresh tokens
- 2FA option
- KYC flows for all user types

### Infrastructure
- Docker containers
- Kubernetes manifests or EKS/GKE
- GitHub Actions CI/CD
- OpenAPI/Swagger documentation

---

## MVP SCOPE (14 COMPONENTS)

### 1. Auth & KYC
- Signup/login for all user types
- KYC upload + Aadhaar verification (mock)
- Optional GST verification
- Roles & permissions

### 2. Operator App (React Native)
- Profile & fleet management
- Add trucks with photos
- Vahan check (mock)
- Document management
- Truck verification states
- Bid marketplace
- Place bids, view wins
- Win-based fee flow
- UPI Autopay mock + wallet fallback
- Assign driver to trip
- Trip lifecycle management
- Accept, start, on-route, deliver
- POD upload

### 3. Driver App (React Native)
- Lightweight design
- Login & accept assignment
- Start trip (tracking starts)
- Live location send (60s intervals)
- Pause/stop tracking
- Upload POD/photos
- Report issue flow
- Driver scoring system

### 4. Shipper Portal (React Web)
- Create loads
- Choose verification mode (CYM/RVA/RLV/none)
- View bids
- Accept operator
- Generate STN/CTL
- View live tracking
- View POD

### 5. Bidding Engine & Match
- Publish loads
- Receive operator bids
- No fee on lost bids
- Win-based fee on pickup/start
- Priority algorithm:
  - Earliest ETA
  - Price
  - Reliability score

### 6. STN / CTL / CYR Features
- CTL generation for drop-shipping
- STN conversion when verified
- **CYM (Certified Yard):**
  - Sellers bring goods to RCY
  - Create CYR (Certified Yard Report)
  - Mandatory for specified categories
- **RVA/RLV:**
  - Aggregator-managed live verification
  - Mocked flows

### 7. Payments & Fee Collection
- **UPI Autopay Mandate:**
  - Store mandate status
  - Trigger charge when trip starts
  - Handle failures and retries
- Wallet fallback for manual pay
- Franchise split on fee (configurable)
  - HQ / Regional / Unit

### 8. Telematics & Tracking
- Integration layer with OEM telematics
- Mock endpoints
- NMEA/GNSS-like sample stream
- Open-source map integration (OSM or Google Maps)
- Optional ETA
- Geofencing for:
  - Yard
  - Pickup
  - Delivery events

### 9. Fraud Detection & LLM Helpers
- Event-driven fraud detection microservice
- Basic rules:
  - Duplicate POD
  - Unmatched weights
  - Repeated no-show
  - Suspicious route deviations
- **LLM helper (mocked):**
  - Grade image authenticity
  - Verify consistency between proof pack and CYR

### 10. Admin & Franchise Portal
- Operator/Driver/shipment dashboards
- KYC status management
- Dispute resolution queue
- Fraud flags
- Franchise management
- Commission settlement engine
- Daily automated payouts CSV

### 11. Data & Reporting
- Store trip history forever
- Analytics endpoints:
  - Utilization %
  - Avg revenue per truck
  - No-show %

### 12. DevOps/Infra
- Dockerfiles
- Kubernetes manifests or docker-compose
- GitHub Actions pipeline:
  - Run tests
  - Build Docker images
  - Push to registry (mock)

### 13. Security & Compliance
- Encrypt sensitive fields (Aadhaar hashes)
- Log access to PII
- Opt-in data handling for driver tracking
- Privacy: track only during active trips

### 14. Tests
- Unit coverage 70%+
- API integration tests
- E2E workflows:
  - Sign-up → create load → bid → win → payoff → trip lifecycle

---

## DELIVERABLES

### Code
- [ ] Monorepo with organized services
- [ ] Bootstrap scripts for local env
- [ ] Seed data loader (sample data for AP districts)
- [ ] PostgreSQL schema and migrations
- [ ] OpenAPI docs + Postman collection

### Mobile Apps
- [ ] React Native Operator App (Android build succeeds)
- [ ] React Native Driver App (Android build succeeds)

### Web Apps
- [ ] React Shipper Portal
- [ ] React Admin Portal

### Testing
- [ ] Test suite
- [ ] CI workflows

### Documentation
- [ ] Architecture diagram
- [ ] ER diagram
- [ ] Sequence diagrams (STN/CTL & fee collection)
- [ ] Example deployment plan
- [ ] README with start steps
- [ ] Environment variables guide
- [ ] LLM mocks guide
- [ ] Developer runbook
- [ ] QA test plan & checklist

---

## IMPLEMENTATION PHASES

### Phase 0 (48 hours)
- Scaffold monorepo
- Auth service
- Basic DB
- Operator mobile skeleton
- Shipper web skeleton
- CI scaffold

### Phase 1 (2 weeks)
- Full operator workflows
- Fleet management
- Bidding
- Win-fee UPI autopay mock
- Driver app core tracking
- Basic admin

### Phase 2 (4 weeks)
- STN/CTL + CYM + RVA flows
- Fraud detection basic rules
- Telemetry ingestion

### Phase 3 (6-8 weeks)
- LLM helpers
- Full admin/franchise settlement
- Tests
- Docs
- Infra

---

## IMPLEMENTATION RULES

### Code Standards
- TypeScript everywhere (server, web, mobile)
- OpenAPI documentation for all APIs
- PostgreSQL migrations (Knex or TypeORM)
- Feature flags for rollouts
- Privacy-first: tracking strictly trip-based

### Mock Services
- Vahan API mock
- UPI gateway mock
- OEM telematics mock
- LLM verification mock

### Error Handling
- Clear failure & retry behavior for:
  - Payments
  - Telematics
  - Verification steps

### Sample Data
- Realistic data for Andhra Pradesh districts

---

## NON-FUNCTIONAL REQUIREMENTS

### Architecture
- Scalable microservices or modular monolith
- Event-driven where appropriate

### Performance
- Mobile apps: lightweight, fast
- API response times: < 500ms
- Real-time tracking: 60s intervals

### Security
- JWT + refresh tokens
- 2FA option
- Encrypted sensitive data
- PII access logging
- Opt-in tracking

### Testing
- Unit tests: 70%+ coverage
- Integration tests
- E2E tests (Cypress for web, Detox for mobile)

### CI/CD
- GitHub Actions
- Automated build/test/deploy
- Container registry integration

---

*Stored for reference and gap analysis*

