-- ============================================================================
-- Rodistaa Platform - Payment Infrastructure Schema
-- Migration: 003_payment_infrastructure.sql
-- Description: Win-based fee, UPI Autopay, Wallet, Commission splits
-- Created: December 4, 2025
-- Week 1 Deliverable
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. OPERATOR WALLETS
-- ============================================================================

CREATE TABLE IF NOT EXISTS operator_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id VARCHAR(255) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  locked_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00, -- Amount locked for pending charges
  currency VARCHAR(3) DEFAULT 'INR',
  status VARCHAR(32) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_wallet_status CHECK (status IN ('ACTIVE', 'SUSPENDED', 'FROZEN')),
  CONSTRAINT positive_balance CHECK (balance >= 0),
  CONSTRAINT positive_locked CHECK (locked_amount >= 0)
);

CREATE INDEX idx_operator_wallets_operator ON operator_wallets(operator_id);
CREATE INDEX idx_operator_wallets_status ON operator_wallets(status);

-- ============================================================================
-- 2. UPI AUTOPAY MANDATES
-- ============================================================================

CREATE TABLE IF NOT EXISTS upi_mandates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id VARCHAR(100) UNIQUE NOT NULL, -- External mandate ID from UPI gateway
  operator_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Mandate details
  upi_id VARCHAR(100) NOT NULL, -- UPI VPA (e.g., operator@upi)
  bank_account_number_encrypted TEXT, -- Encrypted account number
  ifsc_code VARCHAR(20),
  account_holder_name VARCHAR(200),
  
  -- Mandate configuration
  max_amount DECIMAL(10, 2) NOT NULL, -- Maximum amount per transaction
  frequency VARCHAR(32) DEFAULT 'AS_PRESENTED', -- AS_PRESENTED, DAILY, WEEKLY, etc.
  start_date DATE NOT NULL,
  end_date DATE, -- NULL for until_cancelled
  
  -- Status tracking
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  
  -- Failure tracking
  failure_count INTEGER DEFAULT 0,
  last_failure_reason TEXT,
  last_failure_at TIMESTAMPTZ,
  
  -- Metadata
  gateway_reference VARCHAR(200), -- Gateway-specific reference
  metadata JSONB, -- Additional gateway-specific data
  
  CONSTRAINT valid_mandate_status CHECK (status IN ('PENDING', 'ACTIVE', 'PAUSED', 'REVOKED', 'EXPIRED', 'FAILED')),
  CONSTRAINT valid_mandate_frequency CHECK (frequency IN ('AS_PRESENTED', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY')),
  CONSTRAINT valid_amount CHECK (max_amount > 0)
);

CREATE INDEX idx_upi_mandates_operator ON upi_mandates(operator_id);
CREATE INDEX idx_upi_mandates_status ON upi_mandates(status);
CREATE INDEX idx_upi_mandates_mandate_id ON upi_mandates(mandate_id);

-- ============================================================================
-- 3. TRANSACTIONS (All payment-related transactions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id VARCHAR(100) UNIQUE NOT NULL, -- TXN-<ulid>
  
  -- Parties
  from_user_id VARCHAR(255) REFERENCES users(id),
  to_user_id VARCHAR(255) REFERENCES users(id),
  operator_id VARCHAR(255) REFERENCES users(id), -- For reference
  
  -- Transaction details
  type VARCHAR(32) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  
  -- Payment method
  payment_method VARCHAR(32) NOT NULL,
  upi_mandate_id UUID REFERENCES upi_mandates(id),
  
  -- References
  shipment_id VARCHAR(255), -- If related to shipment
  booking_id VARCHAR(255), -- If related to booking
  bid_id UUID, -- If related to bid win
  
  -- Gateway details
  gateway_transaction_id VARCHAR(200),
  gateway_reference VARCHAR(200),
  gateway_response JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  settled_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  
  -- Failure handling
  failure_reason TEXT,
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB,
  
  CONSTRAINT valid_transaction_type CHECK (type IN (
    'WIN_FEE', -- Fee charged on winning bid
    'WALLET_RECHARGE', -- Add money to wallet
    'WALLET_DEDUCTION', -- Deduct from wallet
    'COMMISSION_PAYOUT', -- Franchise commission payout
    'REFUND', -- Refund to operator
    'PENALTY', -- Penalty charge
    'DRIVER_PAYMENT', -- Payment to driver
    'ADVANCE_PAYMENT' -- Advance payment from shipper
  )),
  CONSTRAINT valid_transaction_status CHECK (status IN (
    'PENDING', -- Initiated
    'PROCESSING', -- Being processed
    'SUCCESS', -- Completed successfully
    'FAILED', -- Failed
    'CANCELLED', -- Cancelled by user/system
    'REFUNDED' -- Refunded
  )),
  CONSTRAINT valid_payment_method CHECK (payment_method IN (
    'UPI_AUTOPAY', -- UPI Autopay mandate
    'WALLET', -- Wallet balance
    'UPI', -- One-time UPI
    'NETBANKING', -- Net banking
    'CARD', -- Credit/debit card
    'CASH' -- Cash (for some scenarios)
  )),
  CONSTRAINT positive_amount CHECK (amount > 0)
);

CREATE INDEX idx_transactions_from_user ON transactions(from_user_id);
CREATE INDEX idx_transactions_to_user ON transactions(to_user_id);
CREATE INDEX idx_transactions_operator ON transactions(operator_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_shipment ON transactions(shipment_id);
CREATE INDEX idx_transactions_booking ON transactions(booking_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_gateway_id ON transactions(gateway_transaction_id);

-- ============================================================================
-- 4. WALLET TRANSACTIONS (Detailed wallet ledger)
-- ============================================================================

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES operator_wallets(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id),
  
  -- Transaction details
  type VARCHAR(32) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL, -- Positive for credit, negative for debit
  balance_before DECIMAL(12, 2) NOT NULL,
  balance_after DECIMAL(12, 2) NOT NULL,
  
  -- Description
  description TEXT,
  reference_id VARCHAR(255), -- Shipment, booking, or other reference
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_wallet_txn_type CHECK (type IN (
    'CREDIT', -- Money added
    'DEBIT', -- Money deducted
    'LOCK', -- Amount locked
    'UNLOCK', -- Amount unlocked
    'REFUND' -- Refund credited
  ))
);

CREATE INDEX idx_wallet_txns_wallet ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_txns_transaction ON wallet_transactions(transaction_id);
CREATE INDEX idx_wallet_txns_created_at ON wallet_transactions(created_at);

-- ============================================================================
-- 5. WIN-BASED FEE CONFIGURATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS fee_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Configuration scope
  scope VARCHAR(32) NOT NULL, -- 'GLOBAL', 'REGION', 'DISTRICT', 'OPERATOR'
  scope_id VARCHAR(255), -- NULL for GLOBAL, region/district ID, or operator ID
  
  -- Fee structure
  fee_type VARCHAR(32) NOT NULL DEFAULT 'PERCENTAGE',
  fee_percentage DECIMAL(5, 2), -- e.g., 5.00 for 5%
  fee_fixed DECIMAL(10, 2), -- Fixed fee amount
  minimum_fee DECIMAL(10, 2), -- Minimum fee to charge
  maximum_fee DECIMAL(10, 2), -- Maximum fee cap
  
  -- Win-based fee rules
  charge_on VARCHAR(32) NOT NULL DEFAULT 'TRIP_START', -- When to charge
  allow_wallet BOOLEAN DEFAULT TRUE, -- Allow wallet payment
  allow_autopay BOOLEAN DEFAULT TRUE, -- Allow UPI Autopay
  require_advance BOOLEAN DEFAULT FALSE, -- Require advance payment
  
  -- Validity
  valid_from DATE NOT NULL,
  valid_until DATE,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_fee_type CHECK (fee_type IN ('PERCENTAGE', 'FIXED', 'HYBRID')),
  CONSTRAINT valid_charge_on CHECK (charge_on IN ('BID_WIN', 'TRIP_START', 'TRIP_COMPLETE', 'POD_UPLOAD')),
  CONSTRAINT valid_scope CHECK (scope IN ('GLOBAL', 'REGION', 'DISTRICT', 'OPERATOR'))
);

CREATE INDEX idx_fee_config_scope ON fee_configurations(scope, scope_id);
CREATE INDEX idx_fee_config_active ON fee_configurations(is_active);
CREATE INDEX idx_fee_config_dates ON fee_configurations(valid_from, valid_until);

-- ============================================================================
-- 6. FRANCHISE COMMISSION CONFIGURATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS franchise_commission_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Franchise hierarchy
  hq_split_percentage DECIMAL(5, 2) NOT NULL DEFAULT 40.00, -- HQ share
  regional_split_percentage DECIMAL(5, 2) NOT NULL DEFAULT 30.00, -- Regional franchise
  unit_split_percentage DECIMAL(5, 2) NOT NULL DEFAULT 30.00, -- Unit franchise
  
  -- Validation
  CONSTRAINT valid_split_total CHECK (
    hq_split_percentage + regional_split_percentage + unit_split_percentage = 100.00
  ),
  
  -- Scope
  region_id VARCHAR(255), -- NULL for global config
  district_id VARCHAR(255), -- NULL for regional/global
  
  -- Validity
  valid_from DATE NOT NULL,
  valid_until DATE,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_franchise_commission_region ON franchise_commission_config(region_id);
CREATE INDEX idx_franchise_commission_district ON franchise_commission_config(district_id);

-- ============================================================================
-- 7. COMMISSION SETTLEMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS commission_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement_id VARCHAR(100) UNIQUE NOT NULL, -- SET-<date>-<ulid>
  
  -- Settlement period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Franchise details
  franchise_id VARCHAR(255) NOT NULL REFERENCES users(id),
  franchise_type VARCHAR(32) NOT NULL, -- 'HQ', 'REGIONAL', 'UNIT'
  
  -- Amounts
  total_fees_collected DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  commission_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  commission_percentage DECIMAL(5, 2) NOT NULL,
  
  -- Transaction count
  transaction_count INTEGER NOT NULL DEFAULT 0,
  
  -- Status
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  
  -- Payment details
  payment_method VARCHAR(32),
  payment_reference VARCHAR(200),
  payment_utr VARCHAR(100), -- Unique Transaction Reference
  
  -- File export
  csv_file_url TEXT, -- URL to generated CSV file
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_franchise_type CHECK (franchise_type IN ('HQ', 'REGIONAL', 'UNIT')),
  CONSTRAINT valid_settlement_status CHECK (status IN ('PENDING', 'APPROVED', 'PAID', 'REJECTED', 'ON_HOLD'))
);

CREATE INDEX idx_commission_settlements_franchise ON commission_settlements(franchise_id);
CREATE INDEX idx_commission_settlements_period ON commission_settlements(period_start, period_end);
CREATE INDEX idx_commission_settlements_status ON commission_settlements(status);

-- ============================================================================
-- 8. PAYMENT RETRY QUEUE
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_retry_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  
  -- Retry configuration
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  next_retry_at TIMESTAMPTZ NOT NULL,
  
  -- Backoff strategy
  backoff_strategy VARCHAR(32) DEFAULT 'EXPONENTIAL', -- LINEAR, EXPONENTIAL, FIXED
  initial_delay_seconds INTEGER DEFAULT 300, -- 5 minutes
  
  -- Status
  status VARCHAR(32) NOT NULL DEFAULT 'QUEUED',
  last_retry_at TIMESTAMPTZ,
  last_error TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  CONSTRAINT valid_retry_status CHECK (status IN ('QUEUED', 'RETRYING', 'COMPLETED', 'FAILED', 'CANCELLED')),
  CONSTRAINT valid_backoff CHECK (backoff_strategy IN ('LINEAR', 'EXPONENTIAL', 'FIXED'))
);

CREATE INDEX idx_payment_retry_transaction ON payment_retry_queue(transaction_id);
CREATE INDEX idx_payment_retry_next_at ON payment_retry_queue(next_retry_at);
CREATE INDEX idx_payment_retry_status ON payment_retry_queue(status);

-- ============================================================================
-- 9. WIN-BASED FEE CHARGES
-- ============================================================================

CREATE TABLE IF NOT EXISTS win_fee_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  charge_id VARCHAR(100) UNIQUE NOT NULL, -- FEE-<ulid>
  
  -- Related entities
  operator_id VARCHAR(255) NOT NULL REFERENCES users(id),
  booking_id VARCHAR(255) NOT NULL,
  bid_id UUID NOT NULL,
  shipment_id VARCHAR(255),
  
  -- Fee calculation
  bid_amount DECIMAL(12, 2) NOT NULL,
  fee_percentage DECIMAL(5, 2) NOT NULL,
  fee_amount DECIMAL(12, 2) NOT NULL,
  
  -- Payment details
  transaction_id UUID REFERENCES transactions(id),
  payment_method VARCHAR(32),
  payment_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  
  -- Trigger details
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  trigger_event VARCHAR(32) NOT NULL, -- 'BID_WIN', 'TRIP_START', etc.
  charged_at TIMESTAMPTZ,
  
  -- Failure handling
  failure_reason TEXT,
  retry_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_win_fee_payment_status CHECK (payment_status IN (
    'PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'WAIVED'
  )),
  CONSTRAINT valid_trigger_event CHECK (trigger_event IN (
    'BID_WIN', 'TRIP_START', 'TRIP_COMPLETE', 'POD_UPLOAD'
  ))
);

CREATE INDEX idx_win_fee_operator ON win_fee_charges(operator_id);
CREATE INDEX idx_win_fee_booking ON win_fee_charges(booking_id);
CREATE INDEX idx_win_fee_shipment ON win_fee_charges(shipment_id);
CREATE INDEX idx_win_fee_status ON win_fee_charges(payment_status);
CREATE INDEX idx_win_fee_triggered_at ON win_fee_charges(triggered_at);

-- ============================================================================
-- 10. PAYMENT GATEWAY LOGS (For debugging and reconciliation)
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_gateway_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  
  -- Request/Response
  request_type VARCHAR(50) NOT NULL, -- 'CREATE_MANDATE', 'CHARGE', 'REFUND', etc.
  request_payload JSONB NOT NULL,
  response_payload JSONB,
  
  -- Status
  status_code INTEGER,
  status_message TEXT,
  is_success BOOLEAN,
  
  -- Timing
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  duration_ms INTEGER,
  
  -- Gateway details
  gateway_name VARCHAR(50) NOT NULL, -- 'RAZORPAY_MOCK', 'PAYTM_MOCK', etc.
  gateway_endpoint VARCHAR(500),
  
  -- Metadata
  ip_address VARCHAR(45),
  user_agent TEXT
);

CREATE INDEX idx_gateway_logs_transaction ON payment_gateway_logs(transaction_id);
CREATE INDEX idx_gateway_logs_requested_at ON payment_gateway_logs(requested_at);
CREATE INDEX idx_gateway_logs_status ON payment_gateway_logs(is_success);

-- ============================================================================
-- 11. COMMISSION TRANSACTION DETAILS
-- ============================================================================

CREATE TABLE IF NOT EXISTS commission_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Parent transaction
  win_fee_charge_id UUID NOT NULL REFERENCES win_fee_charges(id),
  settlement_id UUID REFERENCES commission_settlements(id),
  
  -- Commission breakdown
  franchise_id VARCHAR(255) NOT NULL REFERENCES users(id),
  franchise_type VARCHAR(32) NOT NULL,
  commission_amount DECIMAL(12, 2) NOT NULL,
  commission_percentage DECIMAL(5, 2) NOT NULL,
  
  -- Status
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  paid_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_comm_franchise_type CHECK (franchise_type IN ('HQ', 'REGIONAL', 'UNIT')),
  CONSTRAINT valid_comm_status CHECK (status IN ('PENDING', 'APPROVED', 'PAID', 'ON_HOLD'))
);

CREATE INDEX idx_commission_txns_franchise ON commission_transactions(franchise_id);
CREATE INDEX idx_commission_txns_settlement ON commission_transactions(settlement_id);
CREATE INDEX idx_commission_txns_win_fee ON commission_transactions(win_fee_charge_id);

-- ============================================================================
-- 12. WALLET TRANSACTION TRIGGERS
-- ============================================================================

-- Trigger to update wallet balance
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE operator_wallets
  SET 
    balance = balance + NEW.amount,
    updated_at = NOW()
  WHERE id = NEW.wallet_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wallet_balance_update
AFTER INSERT ON wallet_transactions
FOR EACH ROW
EXECUTE FUNCTION update_wallet_balance();

-- ============================================================================
-- 13. VIEWS FOR REPORTING
-- ============================================================================

-- Operator payment summary view
CREATE OR REPLACE VIEW operator_payment_summary AS
SELECT 
  u.id AS operator_id,
  u.name AS operator_name,
  w.balance AS current_balance,
  w.locked_amount,
  COUNT(DISTINCT wf.id) AS total_fees_charged,
  COALESCE(SUM(wf.fee_amount), 0) AS total_fee_amount,
  COUNT(DISTINCT CASE WHEN wf.payment_status = 'SUCCESS' THEN wf.id END) AS successful_payments,
  COUNT(DISTINCT CASE WHEN wf.payment_status = 'FAILED' THEN wf.id END) AS failed_payments,
  COUNT(DISTINCT m.id) AS active_mandates
FROM users u
LEFT JOIN operator_wallets w ON w.operator_id = u.id
LEFT JOIN win_fee_charges wf ON wf.operator_id = u.id
LEFT JOIN upi_mandates m ON m.operator_id = u.id AND m.status = 'ACTIVE'
WHERE u.role = 'OP'
GROUP BY u.id, u.name, w.balance, w.locked_amount;

COMMIT;

-- ============================================================================
-- Migration Complete: Payment Infrastructure
-- ============================================================================

