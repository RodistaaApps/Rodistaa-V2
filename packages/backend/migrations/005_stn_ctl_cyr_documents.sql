-- ============================================================================
-- Rodistaa Platform - STN/CTL/CYR Document System
-- Migration: 005_stn_ctl_cyr_documents.sql
-- Description: Transport compliance documents for Indian freight
-- Created: December 4, 2025
-- Week 4 Deliverable
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. TRANSPORT DOCUMENTS (STN, CTL, CYR)
-- ============================================================================

CREATE TABLE IF NOT EXISTS transport_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id VARCHAR(100) UNIQUE NOT NULL, -- STN-xxx, CTL-xxx, CYR-xxx
  
  -- Document type
  document_type VARCHAR(16) NOT NULL,
  
  -- Related entities
  booking_id VARCHAR(255) NOT NULL,
  shipment_id VARCHAR(255),
  operator_id VARCHAR(255) NOT NULL REFERENCES users(id),
  shipper_id VARCHAR(255) NOT NULL REFERENCES users(id),
  driver_id VARCHAR(255) REFERENCES users(id),
  
  -- Document status and verification
  status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
  verification_status VARCHAR(32) DEFAULT 'UNVERIFIED',
  
  -- Document data (JSON structure)
  document_data JSONB NOT NULL,
  
  -- PDF generation
  pdf_url TEXT, -- S3 URL or file path
  pdf_generated_at TIMESTAMPTZ,
  
  -- Versioning
  version INTEGER DEFAULT 1,
  parent_document_id UUID REFERENCES transport_documents(id),
  is_latest_version BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  issued_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  -- Verification details
  verified_by VARCHAR(255) REFERENCES users(id),
  verification_method VARCHAR(32),
  verification_notes TEXT,
  
  -- Audit trail
  created_by VARCHAR(255) NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Digital signature (future)
  digital_signature TEXT,
  signature_algorithm VARCHAR(32),
  
  CONSTRAINT valid_document_type CHECK (document_type IN ('STN', 'CTL', 'CYR')),
  CONSTRAINT valid_document_status CHECK (status IN (
    'DRAFT', 'ISSUED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED'
  )),
  CONSTRAINT valid_verification_status CHECK (verification_status IN (
    'UNVERIFIED', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED', 'EXPIRED'
  )),
  CONSTRAINT valid_verification_method CHECK (verification_method IN (
    'CYM', 'RVA', 'RLV', 'MANUAL', 'AUTOMATIC', 'NONE'
  ))
);

CREATE INDEX idx_transport_docs_document_id ON transport_documents(document_id);
CREATE INDEX idx_transport_docs_type ON transport_documents(document_type);
CREATE INDEX idx_transport_docs_booking ON transport_documents(booking_id);
CREATE INDEX idx_transport_docs_shipment ON transport_documents(shipment_id);
CREATE INDEX idx_transport_docs_status ON transport_documents(status);
CREATE INDEX idx_transport_docs_verification ON transport_documents(verification_status);
CREATE INDEX idx_transport_docs_operator ON transport_documents(operator_id);
CREATE INDEX idx_transport_docs_shipper ON transport_documents(shipper_id);
CREATE INDEX idx_transport_docs_latest ON transport_documents(is_latest_version, document_type);

-- ============================================================================
-- 2. DOCUMENT VERIFICATION HISTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_verification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES transport_documents(id) ON DELETE CASCADE,
  
  -- Verification details
  verification_type VARCHAR(32) NOT NULL,
  previous_status VARCHAR(32) NOT NULL,
  new_status VARCHAR(32) NOT NULL,
  
  -- Verifier
  verified_by VARCHAR(255) REFERENCES users(id),
  verifier_role VARCHAR(32),
  
  -- Verification data
  verification_method VARCHAR(32),
  verification_evidence JSONB, -- Photos, documents, etc.
  notes TEXT,
  
  -- Timestamp
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_verification_type CHECK (verification_type IN (
    'INITIAL', 'RE_VERIFICATION', 'REJECTION', 'APPROVAL', 'EXPIRY_CHECK', 'AMENDMENT'
  ))
);

CREATE INDEX idx_doc_verification_history_document ON document_verification_history(document_id, verified_at DESC);
CREATE INDEX idx_doc_verification_history_verifier ON document_verification_history(verified_by);

-- ============================================================================
-- 3. VERIFICATION MODES CONFIGURATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS verification_modes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mode_code VARCHAR(16) UNIQUE NOT NULL, -- CYM, RVA, RLV
  
  -- Mode details
  mode_name VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Applicability
  mandatory_categories TEXT[], -- Categories where this mode is mandatory
  recommended_categories TEXT[],
  
  -- Requirements
  requires_yard BOOLEAN DEFAULT FALSE,
  requires_agency BOOLEAN DEFAULT FALSE,
  requires_photos BOOLEAN DEFAULT TRUE,
  requires_weight_check BOOLEAN DEFAULT FALSE,
  
  -- Pricing
  verification_fee DECIMAL(10, 2),
  fee_paid_by VARCHAR(32), -- SHIPPER, OPERATOR, PLATFORM
  
  -- SLA
  max_verification_time_hours INTEGER,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  available_regions TEXT[], -- NULL for all regions
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_fee_paid_by CHECK (fee_paid_by IN ('SHIPPER', 'OPERATOR', 'PLATFORM', 'FREE'))
);

-- Insert default verification modes
INSERT INTO verification_modes (id, mode_code, mode_name, description, requires_yard, requires_agency, verification_fee, fee_paid_by, max_verification_time_hours, is_active)
VALUES 
  (gen_random_uuid(), 'NONE', 'No Verification', 'Standard transport without special verification', FALSE, FALSE, 0, 'FREE', NULL, TRUE),
  (gen_random_uuid(), 'CYM', 'Certified Yard Method', 'Goods verified at Rodistaa Certified Yard', TRUE, FALSE, 500, 'SHIPPER', 2, TRUE),
  (gen_random_uuid(), 'RVA', 'Registered Verification Agency', 'Third-party registered agency verification', FALSE, TRUE, 750, 'SHIPPER', 4, TRUE),
  (gen_random_uuid(), 'RLV', 'Rodistaa Live Verification', 'Rodistaa staff live verification', FALSE, FALSE, 300, 'PLATFORM', 2, TRUE);

-- ============================================================================
-- 4. CERTIFIED YARDS (For CYM)
-- ============================================================================

CREATE TABLE IF NOT EXISTS certified_yards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  yard_id VARCHAR(100) UNIQUE NOT NULL, -- RCY-<district>-<number>
  
  -- Yard details
  yard_name VARCHAR(200) NOT NULL,
  yard_type VARCHAR(32) DEFAULT 'STANDARD',
  
  -- Location
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  district_id VARCHAR(100) NOT NULL,
  region_id VARCHAR(100) NOT NULL,
  pincode VARCHAR(10),
  
  -- Capacity
  max_capacity_sqft DECIMAL(10, 2),
  current_utilization_sqft DECIMAL(10, 2) DEFAULT 0,
  
  -- Operations
  operating_hours JSONB, -- {mon: {open, close}, tue: ...}
  contact_person VARCHAR(200),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(200),
  
  -- Approval
  status VARCHAR(32) DEFAULT 'PENDING_APPROVAL',
  approved_by VARCHAR(255) REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  
  -- Capabilities
  has_weighbridge BOOLEAN DEFAULT FALSE,
  has_security_cameras BOOLEAN DEFAULT FALSE,
  has_covered_storage BOOLEAN DEFAULT FALSE,
  
  -- Geofence
  geofence_id UUID REFERENCES geofences(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_yard_type CHECK (yard_type IN ('STANDARD', 'PREMIUM', 'SPECIALIZED')),
  CONSTRAINT valid_yard_status CHECK (status IN ('PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED', 'CLOSED'))
);

CREATE INDEX idx_certified_yards_yard_id ON certified_yards(yard_id);
CREATE INDEX idx_certified_yards_district ON certified_yards(district_id);
CREATE INDEX idx_certified_yards_status ON certified_yards(status);

-- ============================================================================
-- 5. REGISTERED VERIFICATION AGENCIES (For RVA)
-- ============================================================================

CREATE TABLE IF NOT EXISTS registered_agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id VARCHAR(100) UNIQUE NOT NULL, -- RVA-<state>-<number>
  
  -- Agency details
  agency_name VARCHAR(200) NOT NULL,
  registration_number VARCHAR(100) UNIQUE NOT NULL,
  
  -- Contact
  address TEXT NOT NULL,
  district_id VARCHAR(100),
  region_id VARCHAR(100),
  contact_person VARCHAR(200) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  contact_email VARCHAR(200) NOT NULL,
  
  -- Approval
  status VARCHAR(32) DEFAULT 'PENDING_APPROVAL',
  approved_by VARCHAR(255) REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  license_expiry DATE,
  
  -- Service areas
  service_districts TEXT[],
  service_categories TEXT[], -- What types of goods they can verify
  
  -- Performance
  total_verifications INTEGER DEFAULT 0,
  avg_verification_time_minutes INTEGER,
  rating DECIMAL(3, 2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_agency_status CHECK (status IN ('PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED', 'REVOKED'))
);

CREATE INDEX idx_agencies_agency_id ON registered_agencies(agency_id);
CREATE INDEX idx_agencies_status ON registered_agencies(status);
CREATE INDEX idx_agencies_district ON registered_agencies USING GIN(service_districts);

-- ============================================================================
-- 6. VERIFICATION REQUESTS (For RVA/RLV)
-- ============================================================================

CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id VARCHAR(100) UNIQUE NOT NULL, -- VRQ-<ulid>
  
  -- Related document
  document_id UUID NOT NULL REFERENCES transport_documents(id),
  booking_id VARCHAR(255) NOT NULL,
  
  -- Requestor
  requested_by VARCHAR(255) NOT NULL REFERENCES users(id),
  requester_role VARCHAR(32) NOT NULL,
  
  -- Verification mode
  verification_mode VARCHAR(16) NOT NULL,
  
  -- Assignment (for RVA/RLV)
  assigned_to VARCHAR(255) REFERENCES users(id), -- Verifier user ID
  agency_id UUID REFERENCES registered_agencies(id), -- For RVA
  assigned_at TIMESTAMPTZ,
  
  -- Scheduling
  scheduled_at TIMESTAMPTZ,
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  location_address TEXT,
  
  -- Status
  status VARCHAR(32) DEFAULT 'PENDING',
  
  -- Completion
  completed_at TIMESTAMPTZ,
  verification_result VARCHAR(32),
  verification_evidence JSONB, -- Photos, documents, measurements
  verifier_notes TEXT,
  
  -- SLA tracking
  sla_deadline TIMESTAMPTZ,
  is_overdue BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_verification_mode CHECK (verification_mode IN ('CYM', 'RVA', 'RLV')),
  CONSTRAINT valid_request_status CHECK (status IN (
    'PENDING', 'ASSIGNED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED'
  )),
  CONSTRAINT valid_verification_result CHECK (verification_result IN (
    'APPROVED', 'REJECTED', 'CONDITIONAL', 'PENDING_INFO'
  ))
);

CREATE INDEX idx_verification_requests_request_id ON verification_requests(request_id);
CREATE INDEX idx_verification_requests_document ON verification_requests(document_id);
CREATE INDEX idx_verification_requests_status ON verification_requests(status);
CREATE INDEX idx_verification_requests_assigned_to ON verification_requests(assigned_to);
CREATE INDEX idx_verification_requests_agency ON verification_requests(agency_id);
CREATE INDEX idx_verification_requests_overdue ON verification_requests(is_overdue, sla_deadline);

-- ============================================================================
-- 7. DOCUMENT TEMPLATES
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id VARCHAR(100) UNIQUE NOT NULL,
  
  -- Template details
  document_type VARCHAR(16) NOT NULL,
  template_name VARCHAR(200) NOT NULL,
  version VARCHAR(20) NOT NULL,
  
  -- Template content
  html_template TEXT NOT NULL, -- HTML template with placeholders
  css_styles TEXT, -- CSS for PDF generation
  
  -- Metadata
  required_fields TEXT[] NOT NULL, -- Fields that must be present
  optional_fields TEXT[],
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_template_doc_type CHECK (document_type IN ('STN', 'CTL', 'CYR', 'POD', 'INVOICE'))
);

CREATE INDEX idx_document_templates_type ON document_templates(document_type, is_active);

-- ============================================================================
-- 8. CATEGORY REQUIREMENTS (Goods categories and verification requirements)
-- ============================================================================

CREATE TABLE IF NOT EXISTS goods_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_code VARCHAR(50) UNIQUE NOT NULL,
  category_name VARCHAR(200) NOT NULL,
  
  -- Parent category (for hierarchy)
  parent_category_id UUID REFERENCES goods_categories(id),
  
  -- Verification requirements
  requires_verification BOOLEAN DEFAULT FALSE,
  mandatory_verification_modes TEXT[], -- ['CYM'], ['RVA', 'RLV'], etc.
  
  -- Special handling
  is_hazardous BOOLEAN DEFAULT FALSE,
  is_perishable BOOLEAN DEFAULT FALSE,
  is_high_value BOOLEAN DEFAULT FALSE,
  requires_temperature_control BOOLEAN DEFAULT FALSE,
  
  -- Compliance
  requires_special_permit BOOLEAN DEFAULT FALSE,
  max_weight_per_vehicle DECIMAL(10, 2),
  
  -- Insurance
  min_insurance_coverage DECIMAL(12, 2),
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert common categories
INSERT INTO goods_categories (id, category_code, category_name, requires_verification, mandatory_verification_modes, is_high_value)
VALUES 
  (gen_random_uuid(), 'ELECTRONICS', 'Electronics & Appliances', TRUE, ARRAY['CYM', 'RVA'], TRUE),
  (gen_random_uuid(), 'PHARMA', 'Pharmaceutical Products', TRUE, ARRAY['CYM'], FALSE),
  (gen_random_uuid(), 'FMCG', 'Fast Moving Consumer Goods', FALSE, NULL, FALSE),
  (gen_random_uuid(), 'CONSTRUCTION', 'Construction Materials', FALSE, NULL, FALSE),
  (gen_random_uuid(), 'TEXTILES', 'Textiles & Garments', FALSE, NULL, FALSE),
  (gen_random_uuid(), 'AUTO_PARTS', 'Automobile Parts', TRUE, ARRAY['RVA', 'RLV'], TRUE);

-- ============================================================================
-- 9. DOCUMENT CONVERSION LOG (CTL → STN conversion)
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source and target documents
  source_document_id UUID NOT NULL REFERENCES transport_documents(id),
  target_document_id UUID NOT NULL REFERENCES transport_documents(id),
  
  -- Conversion details
  conversion_type VARCHAR(32) NOT NULL, -- CTL_TO_STN, STN_TO_CTL, AMENDMENT
  conversion_reason TEXT,
  
  -- Triggered by
  triggered_by VARCHAR(255) NOT NULL REFERENCES users(id),
  trigger_event VARCHAR(32),
  
  -- Status
  status VARCHAR(32) DEFAULT 'COMPLETED',
  
  converted_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_conversion_type CHECK (conversion_type IN (
    'CTL_TO_STN', 'STN_TO_CTL', 'AMENDMENT', 'REISSUE'
  )),
  CONSTRAINT valid_conversion_status CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED'))
);

CREATE INDEX idx_document_conversions_source ON document_conversions(source_document_id);
CREATE INDEX idx_document_conversions_target ON document_conversions(target_document_id);

-- ============================================================================
-- 10. VIEWS FOR REPORTING
-- ============================================================================

-- Active transport documents view
CREATE OR REPLACE VIEW active_transport_documents AS
SELECT 
  d.document_id,
  d.document_type,
  d.status,
  d.verification_status,
  d.booking_id,
  b.pickup_location,
  b.drop_location,
  d.operator_id,
  o.name AS operator_name,
  d.shipper_id,
  s.name AS shipper_name,
  d.issued_at,
  d.expires_at
FROM transport_documents d
LEFT JOIN bookings b ON b.id = d.booking_id
LEFT JOIN users o ON o.id = d.operator_id
LEFT JOIN users s ON s.id = d.shipper_id
WHERE d.is_latest_version = TRUE
AND d.status IN ('ISSUED', 'ACTIVE');

-- Pending verifications view
CREATE OR REPLACE VIEW pending_verifications AS
SELECT 
  vr.request_id,
  vr.verification_mode,
  vr.status,
  vr.scheduled_at,
  vr.sla_deadline,
  vr.is_overdue,
  d.document_id,
  d.document_type,
  b.id AS booking_id,
  b.pickup_location,
  b.drop_location
FROM verification_requests vr
JOIN transport_documents d ON d.id = vr.document_id
JOIN bookings b ON b.id = vr.booking_id
WHERE vr.status IN ('PENDING', 'ASSIGNED', 'SCHEDULED', 'IN_PROGRESS')
ORDER BY vr.sla_deadline ASC NULLS LAST;

COMMIT;

-- ============================================================================
-- Migration Complete: STN/CTL/CYR Document System
-- ============================================================================

