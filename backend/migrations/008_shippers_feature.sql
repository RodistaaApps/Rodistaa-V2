-- Migration: Shippers Feature - Add audit, documents, ACS flags
-- Date: 2025-12-04
-- Description: Tables for shippers management feature with security and audit

-- Add new columns to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ledger_balance DECIMAL(12,2) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS block_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked_until TIMESTAMP;

-- Create audit_logs table for tracking all admin actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  actor_id VARCHAR(36) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id VARCHAR(36) NOT NULL,
  action VARCHAR(100) NOT NULL,
  payload JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- Create acs_flags table for compliance and risk flags
CREATE TABLE IF NOT EXISTS acs_flags (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  summary TEXT NOT NULL,
  rule_id VARCHAR(50),
  evidence JSONB,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'escalated', 'resolved')),
  acknowledged_by VARCHAR(36),
  acknowledged_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (acknowledged_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_acs_flags_user ON acs_flags(user_id);
CREATE INDEX IF NOT EXISTS idx_acs_flags_severity ON acs_flags(severity);
CREATE INDEX IF NOT EXISTS idx_acs_flags_status ON acs_flags(status);
CREATE INDEX IF NOT EXISTS idx_acs_flags_created ON acs_flags(created_at DESC);

-- Create documents table for storing KYC and other documents
CREATE TABLE IF NOT EXISTS documents (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('aadhar', 'gst', 'business_proof', 'pan', 'other')),
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_size BIGINT,
  mime_type VARCHAR(100),
  is_sensitive BOOLEAN DEFAULT FALSE,
  storage_provider VARCHAR(50) DEFAULT 's3',
  storage_meta JSONB,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  uploaded_source VARCHAR(50) CHECK (uploaded_source IN ('app', 'web', 'admin')),
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_by VARCHAR(36),
  verified_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(verification_status);

-- Create document_access_logs for tracking who viewed sensitive documents
CREATE TABLE IF NOT EXISTS document_access_logs (
  id VARCHAR(36) PRIMARY KEY,
  document_id VARCHAR(36) NOT NULL,
  accessed_by VARCHAR(36) NOT NULL,
  reason TEXT NOT NULL,
  access_granted BOOLEAN DEFAULT TRUE,
  ip_address VARCHAR(45),
  accessed_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (accessed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_document_access_document ON document_access_logs(document_id);
CREATE INDEX IF NOT EXISTS idx_document_access_user ON document_access_logs(accessed_by);
CREATE INDEX IF NOT EXISTS idx_document_access_date ON document_access_logs(accessed_at DESC);

-- Create ledger_transactions table for financial tracking
CREATE TABLE IF NOT EXISTS ledger_transactions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('credit', 'debit', 'adjustment', 'fee', 'refund')),
  amount DECIMAL(12,2) NOT NULL,
  balance_before DECIMAL(12,2) NOT NULL,
  balance_after DECIMAL(12,2) NOT NULL,
  reference_type VARCHAR(50),
  reference_id VARCHAR(36),
  description TEXT,
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ledger_user ON ledger_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_type ON ledger_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_ledger_date ON ledger_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_reference ON ledger_transactions(reference_type, reference_id);

-- Create internal_notes table for admin notes
CREATE TABLE IF NOT EXISTS internal_notes (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  note TEXT NOT NULL,
  created_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  visibility VARCHAR(20) DEFAULT 'admin' CHECK (visibility IN ('admin', 'franchise', 'all_staff')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_notes_user ON internal_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_created ON internal_notes(created_at DESC);

-- Create user_activities table for activity tracking
CREATE TABLE IF NOT EXISTS user_activities (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  activity_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  actor_id VARCHAR(36),
  metadata JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_activities_user ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_created ON user_activities(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE audit_logs IS 'Immutable log of all admin actions for compliance and security';
COMMENT ON TABLE acs_flags IS 'Anti-fraud and compliance system flags for users';
COMMENT ON TABLE documents IS 'User documents including KYC with verification status';
COMMENT ON TABLE document_access_logs IS 'Track who accessed sensitive documents and why';
COMMENT ON TABLE ledger_transactions IS 'Financial transaction ledger for users';
COMMENT ON TABLE internal_notes IS 'Admin and franchise internal notes about users';
COMMENT ON TABLE user_activities IS 'User activity tracking for audit and analytics';

