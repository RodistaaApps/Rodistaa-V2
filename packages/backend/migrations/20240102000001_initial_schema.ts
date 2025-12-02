/**
 * Initial Schema Migration
 * 
 * Creates all core tables for Rodistaa platform:
 * - users, roles, permissions
 * - kyc_records
 * - trucks, truck_documents, truck_inspections
 * - bookings, bids, shipments
 * - gps_logs, pod_files
 * - audit_logs, acs_blocks, watchlist
 * - ledgers, override_requests
 * - franchises
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // 1. Users table
  await knex.schema.createTable('users', (table) => {
    table.string('id', 50).primary().comment('USR-<role>-<ulid>');
    table.string('mobile', 15).notNullable().unique();
    table.string('name', 255).notNullable();
    table.enum('role', ['SHIPPER', 'OPERATOR', 'DRIVER', 'ADMIN', 'FRANCHISE_UNIT', 'FRANCHISE_DISTRICT', 'KYC_ADMIN']).notNullable();
    table.string('email', 255);
    table.enum('kyc_status', ['PENDING', 'VERIFIED', 'REJECTED']).defaultTo('PENDING');
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_blocked').defaultTo(false);
    table.string('device_id', 255);
    table.timestamp('last_login_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index('mobile');
    table.index('role');
    table.index('kyc_status');
  });

  // 2. KYC Records table
  await knex.schema.createTable('kyc_records', (table) => {
    table.string('id', 50).primary().comment('KYC-<ulid>');
    table.string('user_id', 50).notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.enum('document_type', ['AADHAAR', 'PAN', 'GSTIN', 'LICENSE', 'RC', 'INSURANCE', 'PERMIT', 'FITNESS']).notNullable();
    table.text('encrypted_data').notNullable().comment('AES-256-GCM encrypted KYC data');
    table.string('encryption_key_id', 255).notNullable().comment('KMS key ID');
    table.string('file_url', 500);
    table.enum('status', ['PENDING', 'VERIFIED', 'REJECTED']).defaultTo('PENDING');
    table.string('verified_by', 50).references('id').inTable('users');
    table.timestamp('verified_at');
    table.text('rejection_reason');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.index('user_id');
    table.index('status');
    table.index('document_type');
  });

  // 3. Trucks table
  await knex.schema.createTable('trucks', (table) => {
    table.string('id', 100).primary().comment('TRK-<regno>-<ulid>');
    table.string('operator_id', 50).notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('registration_number', 50).notNullable().unique();
    table.string('vehicle_type', 50);
    table.integer('capacity_tons');
    table.string('body_type', 50);
    table.integer('tyres');
    table.enum('status', ['ACTIVE', 'BLOCKED', 'INACTIVE']).defaultTo('ACTIVE');
    table.string('blocked_reason', 500);
    table.timestamp('blocked_at');
    table.string('blocked_by', 50).references('id').inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index('operator_id');
    table.index('registration_number');
    table.index('status');
  });

  // 4. Truck Documents table
  await knex.schema.createTable('truck_documents', (table) => {
    table.increments('id').primary();
    table.string('truck_id', 100).notNullable().references('id').inTable('trucks').onDelete('CASCADE');
    table.enum('document_type', ['RC', 'INSURANCE', 'PERMIT', 'FITNESS']).notNullable();
    table.string('file_url', 500).notNullable();
    table.date('expiry_date');
    table.enum('status', ['VALID', 'EXPIRING_SOON', 'EXPIRED']).defaultTo('VALID');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index('truck_id');
    table.index('document_type');
    table.index('expiry_date');
  });

  // 5. Truck Inspections table
  await knex.schema.createTable('truck_inspections', (table) => {
    table.string('id', 50).primary().comment('INS-<ulid>');
    table.string('truck_id', 100).notNullable().references('id').inTable('trucks').onDelete('CASCADE');
    table.string('inspector_id', 50).notNullable().references('id').inTable('users');
    table.enum('status', ['PENDING', 'PASSED', 'FAILED']).defaultTo('PENDING');
    table.jsonb('photos').comment('Array of photo URLs');
    table.text('notes');
    table.jsonb('checklist').comment('Inspection checklist results');
    table.timestamp('inspected_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.index('truck_id');
    table.index('inspector_id');
    table.index('status');
  });

  // 6. Bookings table
  await knex.schema.createTable('bookings', (table) => {
    table.string('id', 50).primary().comment('RID-YYYYMMDD-xxxx');
    table.string('shipper_id', 50).notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.jsonb('pickup').notNullable().comment('Location object with address, coordinates');
    table.jsonb('drop').notNullable().comment('Location object with address, coordinates');
    table.jsonb('goods').notNullable().comment('Goods info: type, weight, packaging');
    table.decimal('tonnage', 10, 2).notNullable();
    table.decimal('expected_price', 10, 2).comment('AI-estimated price');
    table.decimal('price_range_min', 10, 2);
    table.decimal('price_range_max', 10, 2);
    table.enum('status', ['OPEN', 'NEGOTIATION', 'AUTO_FINALIZED', 'FINALIZED', 'CANCELLED']).defaultTo('OPEN');
    table.timestamp('auto_finalize_at').comment('Timestamp for auto-finalization');
    table.string('finalized_bid_id', 50);
    table.text('cancellation_reason');
    table.timestamp('cancelled_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index('shipper_id');
    table.index('status');
    table.index('created_at');
    table.index('auto_finalize_at');
  });

  // 7. Bids table
  await knex.schema.createTable('bids', (table) => {
    table.string('id', 50).primary().comment('BK-<ulid>');
    table.string('booking_id', 50).notNullable().references('id').inTable('bookings').onDelete('CASCADE');
    table.string('operator_id', 50).notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.decimal('amount', 10, 2).notNullable();
    table.enum('status', ['ACTIVE', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'WITHDRAWN']).defaultTo('ACTIVE');
    table.integer('rank').comment('Bid ranking (1 = lowest)');
    table.timestamp('expires_at');
    table.timestamp('accepted_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index('booking_id');
    table.index('operator_id');
    table.index('status');
    table.index(['booking_id', 'operator_id']); // Composite index for uniqueness check
  });

  // 8. Shipments table
  await knex.schema.createTable('shipments', (table) => {
    table.string('id', 50).primary().comment('SH-<ulid>');
    table.string('booking_id', 50).notNullable().references('id').inTable('bookings').onDelete('CASCADE');
    table.string('bid_id', 50).notNullable().references('id').inTable('bids');
    table.string('operator_id', 50).notNullable().references('id').inTable('users');
    table.string('driver_id', 50).references('id').inTable('users');
    table.string('truck_id', 100).references('id').inTable('trucks');
    table.enum('status', ['ASSIGNED', 'DRIVER_PENDING_APPROVAL', 'IN_TRANSIT', 'COMPLETED', 'FAILED']).defaultTo('ASSIGNED');
    table.string('otp', 6).comment('6-digit OTP for delivery verification');
    table.timestamp('driver_approved_at');
    table.timestamp('started_at');
    table.timestamp('completed_at');
    table.text('failure_reason');
    table.timestamp('failed_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index('booking_id');
    table.index('operator_id');
    table.index('driver_id');
    table.index('truck_id');
    table.index('status');
  });

  // 9. GPS Logs table
  await knex.schema.createTable('gps_logs', (table) => {
    table.bigIncrements('id').primary();
    table.string('shipment_id', 50).notNullable().references('id').inTable('shipments').onDelete('CASCADE');
    table.decimal('latitude', 10, 7).notNullable();
    table.decimal('longitude', 10, 7).notNullable();
    table.decimal('speed', 5, 2).comment('Speed in km/h');
    table.integer('heading').comment('Heading in degrees (0-359)');
    table.timestamp('recorded_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.index('shipment_id');
    table.index('recorded_at');
  });

  // 10. POD Files table
  await knex.schema.createTable('pod_files', (table) => {
    table.string('id', 50).primary().comment('POD-<ulid>');
    table.string('shipment_id', 50).notNullable().references('id').inTable('shipments').onDelete('CASCADE');
    table.string('file_url', 500).notNullable();
    table.string('file_type', 50);
    table.integer('file_size');
    table.string('uploaded_by', 50).notNullable().references('id').inTable('users');
    table.boolean('verified').defaultTo(false);
    table.string('verification_hash', 64).comment('SHA256 hash for duplicate detection');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.index('shipment_id');
    table.index('verification_hash');
    table.index('uploaded_by');
  });

  // 11. Audit Logs table
  await knex.schema.createTable('audit_logs', (table) => {
    table.string('id', 50).primary().comment('AUD-<ulid>');
    table.string('entity_type', 50).notNullable();
    table.string('entity_id', 100).notNullable();
    table.string('action', 100).notNullable();
    table.string('performed_by', 50).references('id').inTable('users');
    table.jsonb('metadata').comment('Action metadata and context');
    table.string('rule_id', 50).comment('ACS rule that triggered this');
    table.string('audit_hash', 64).notNullable().comment('SHA256 hash of audit entry');
    table.timestamp('timestamp').defaultTo(knex.fn.now());
    
    table.index('entity_type');
    table.index('entity_id');
    table.index(['entity_type', 'entity_id']);
    table.index('performed_by');
    table.index('timestamp');
  });

  // 12. ACS Blocks table
  await knex.schema.createTable('acs_blocks', (table) => {
    table.string('id', 50).primary().comment('BLK-<ulid>');
    table.string('entity_type', 50).notNullable();
    table.string('entity_id', 100).notNullable();
    table.string('rule_id', 50).notNullable().comment('ACS rule that created this block');
    table.enum('severity', ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).notNullable();
    table.text('reason').notNullable();
    table.jsonb('context').comment('Event context that triggered the block');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('expires_at').comment('Auto-unblock timestamp');
    table.string('unblocked_by', 50).references('id').inTable('users');
    table.timestamp('unblocked_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.index('entity_type');
    table.index('entity_id');
    table.index(['entity_type', 'entity_id']);
    table.index('is_active');
    table.index('severity');
  });

  // 13. Watchlist table
  await knex.schema.createTable('watchlist', (table) => {
    table.increments('id').primary();
    table.string('entity_type', 50).notNullable();
    table.string('entity_id', 100).notNullable();
    table.text('reason').notNullable();
    table.string('added_by', 50).notNullable().references('id').inTable('users');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.unique(['entity_type', 'entity_id']);
    table.index('is_active');
  });

  // 14. Ledgers table
  await knex.schema.createTable('ledgers', (table) => {
    table.string('id', 50).primary().comment('LDG-<ulid>');
    table.string('operator_id', 50).notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.enum('type', ['CREDIT', 'DEBIT']).notNullable();
    table.decimal('amount', 10, 2).notNullable();
    table.decimal('balance_after', 10, 2).notNullable().comment('Balance after this transaction');
    table.text('description').notNullable();
    table.string('reference_type', 50).comment('bid, shipment, refund, etc.');
    table.string('reference_id', 50);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.index('operator_id');
    table.index('type');
    table.index(['reference_type', 'reference_id']);
    table.index('created_at');
  });

  // 15. Override Requests table
  await knex.schema.createTable('override_requests', (table) => {
    table.string('id', 50).primary().comment('OVR-<ulid>');
    table.string('entity_type', 50).notNullable();
    table.string('entity_id', 100).notNullable();
    table.string('action', 100).notNullable().comment('unblock, approve, override');
    table.text('reason').notNullable();
    table.enum('status', ['PENDING', 'APPROVED', 'REJECTED']).defaultTo('PENDING');
    table.string('requested_by', 50).notNullable().references('id').inTable('users');
    table.string('approved_by', 50).references('id').inTable('users');
    table.string('rejected_by', 50).references('id').inTable('users');
    table.text('approval_notes');
    table.timestamp('approved_at');
    table.timestamp('rejected_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.index('entity_type');
    table.index('entity_id');
    table.index('status');
    table.index('requested_by');
  });

  // 16. Franchises table
  await knex.schema.createTable('franchises', (table) => {
    table.string('id', 50).primary().comment('FRN-<ulid>');
    table.string('name', 255).notNullable();
    table.enum('type', ['UNIT', 'DISTRICT', 'HQ']).notNullable();
    table.string('parent_id', 50).references('id').inTable('franchises').comment('District ID for units');
    table.string('manager_id', 50).references('id').inTable('users');
    table.jsonb('coverage_area').comment('Geo boundaries or pincodes');
    table.jsonb('targets').comment('Monthly/quarterly targets');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index('type');
    table.index('parent_id');
    table.index('manager_id');
  });

  // 17. Notifications table
  await knex.schema.createTable('notifications', (table) => {
    table.bigIncrements('id').primary();
    table.string('user_id', 50).notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('title', 255).notNullable();
    table.text('body').notNullable();
    table.string('type', 50).comment('booking, bid, shipment, acs, payment');
    table.jsonb('data').comment('Notification payload');
    table.boolean('is_read').defaultTo(false);
    table.timestamp('read_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.index('user_id');
    table.index('is_read');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  // Drop tables in reverse order to handle foreign key constraints
  await knex.schema.dropTableIfExists('notifications');
  await knex.schema.dropTableIfExists('franchises');
  await knex.schema.dropTableIfExists('override_requests');
  await knex.schema.dropTableIfExists('ledgers');
  await knex.schema.dropTableIfExists('watchlist');
  await knex.schema.dropTableIfExists('acs_blocks');
  await knex.schema.dropTableIfExists('audit_logs');
  await knex.schema.dropTableIfExists('pod_files');
  await knex.schema.dropTableIfExists('gps_logs');
  await knex.schema.dropTableIfExists('shipments');
  await knex.schema.dropTableIfExists('bids');
  await knex.schema.dropTableIfExists('bookings');
  await knex.schema.dropTableIfExists('truck_inspections');
  await knex.schema.dropTableIfExists('truck_documents');
  await knex.schema.dropTableIfExists('trucks');
  await knex.schema.dropTableIfExists('kyc_records');
  await knex.schema.dropTableIfExists('users');
}

