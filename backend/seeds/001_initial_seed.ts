/**
 * Initial Seed Data for Local Development
 * 
 * Creates sample data for QA and testing:
 * - 4 users (shipper, operator, driver, admin)
 * - 3 trucks
 * - 3 bookings
 * - Sample bids and shipments
 */

import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data (in reverse order of dependencies)
  await knex('gps_logs').del();
  await knex('pod_files').del();
  await knex('shipments').del();
  await knex('bids').del();
  await knex('bookings').del();
  await knex('truck_inspections').del();
  await knex('truck_documents').del();
  await knex('trucks').del();
  await knex('notifications').del();
  await knex('ledgers').del();
  await knex('override_requests').del();
  await knex('acs_blocks').del();
  await knex('watchlist').del();
  await knex('audit_logs').del();
  await knex('kyc_records').del();
  await knex('franchises').del();
  await knex('users').del();

  // 1. Insert Users
  await knex('users').insert([
    {
      id: 'USR-SH-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      mobile: '+919876543210',
      name: 'John Shipper',
      role: 'SHIPPER',
      email: 'john@example.com',
      kyc_status: 'VERIFIED',
      is_active: true,
      created_at: new Date('2024-01-01T00:00:00Z'),
    },
    {
      id: 'USR-OP-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      mobile: '+919876543211',
      name: 'Raj Operator',
      role: 'OPERATOR',
      email: 'raj@example.com',
      kyc_status: 'VERIFIED',
      is_active: true,
      created_at: new Date('2024-01-01T00:00:00Z'),
    },
    {
      id: 'USR-DR-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      mobile: '+919876543212',
      name: 'Kumar Driver',
      role: 'DRIVER',
      kyc_status: 'VERIFIED',
      is_active: true,
      created_at: new Date('2024-01-01T00:00:00Z'),
    },
    {
      id: 'USR-AD-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      mobile: '+919876543213',
      name: 'Admin User',
      role: 'ADMIN',
      email: 'admin@rodistaa.com',
      kyc_status: 'VERIFIED',
      is_active: true,
      created_at: new Date('2024-01-01T00:00:00Z'),
    },
  ]);

  // 2. Insert Trucks
  await knex('trucks').insert([
    {
      id: 'TRK-MH01AB1234-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      operator_id: 'USR-OP-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      registration_number: 'MH01AB1234',
      vehicle_type: 'HGV',
      capacity_tons: 10,
      body_type: 'Open',
      tyres: 10,
      status: 'ACTIVE',
      created_at: new Date('2024-01-02T00:00:00Z'),
    },
    {
      id: 'TRK-KA05CD5678-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      operator_id: 'USR-OP-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      registration_number: 'KA05CD5678',
      vehicle_type: 'HGV',
      capacity_tons: 12,
      body_type: 'Container',
      tyres: 12,
      status: 'ACTIVE',
      created_at: new Date('2024-01-02T00:00:00Z'),
    },
    {
      id: 'TRK-TN10EF9012-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      operator_id: 'USR-OP-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      registration_number: 'TN10EF9012',
      vehicle_type: 'LGV',
      capacity_tons: 5,
      body_type: 'Closed',
      tyres: 6,
      status: 'ACTIVE',
      created_at: new Date('2024-01-02T00:00:00Z'),
    },
  ]);

  // 3. Insert Truck Documents
  await knex('truck_documents').insert([
    {
      truck_id: 'TRK-MH01AB1234-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      document_type: 'RC',
      file_url: 'https://storage.rodistaa.com/docs/rc-mh01ab1234.pdf',
      expiry_date: new Date('2026-01-15'),
      status: 'VALID',
    },
    {
      truck_id: 'TRK-MH01AB1234-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      document_type: 'INSURANCE',
      file_url: 'https://storage.rodistaa.com/docs/ins-mh01ab1234.pdf',
      expiry_date: new Date('2025-06-30'),
      status: 'VALID',
    },
    {
      truck_id: 'TRK-MH01AB1234-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      document_type: 'FITNESS',
      file_url: 'https://storage.rodistaa.com/docs/fit-mh01ab1234.pdf',
      expiry_date: new Date('2025-12-31'),
      status: 'VALID',
    },
  ]);

  // 4. Insert Bookings
  await knex('bookings').insert([
    {
      id: 'RID-20240115-0001',
      shipper_id: 'USR-SH-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      pickup: JSON.stringify({
        address: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        coordinates: { lat: 19.0760, lng: 72.8777 },
      }),
      drop: JSON.stringify({
        address: '456 Park Avenue',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        coordinates: { lat: 28.6139, lng: 77.2090 },
      }),
      goods: JSON.stringify({
        type: 'Cement',
        weight: 5000,
        packaging: 'Bags',
      }),
      tonnage: 5.0,
      expected_price: 17500,
      price_range_min: 15000,
      price_range_max: 20000,
      status: 'OPEN',
      auto_finalize_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      created_at: new Date('2024-01-15T10:00:00Z'),
    },
    {
      id: 'RID-20240115-0002',
      shipper_id: 'USR-SH-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      pickup: JSON.stringify({
        address: '789 Industrial Area',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        coordinates: { lat: 12.9716, lng: 77.5946 },
      }),
      drop: JSON.stringify({
        address: '321 Warehouse Zone',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600001',
        coordinates: { lat: 13.0827, lng: 80.2707 },
      }),
      goods: JSON.stringify({
        type: 'Steel',
        weight: 8000,
        packaging: 'Bundles',
      }),
      tonnage: 8.0,
      expected_price: 25000,
      price_range_min: 22000,
      price_range_max: 28000,
      status: 'NEGOTIATION',
      auto_finalize_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      created_at: new Date('2024-01-15T11:00:00Z'),
    },
    {
      id: 'RID-20240115-0003',
      shipper_id: 'USR-SH-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      pickup: JSON.stringify({
        address: '555 Market Road',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
        coordinates: { lat: 18.5204, lng: 73.8567 },
      }),
      drop: JSON.stringify({
        address: '777 Port Area',
        city: 'Kochi',
        state: 'Kerala',
        pincode: '682001',
        coordinates: { lat: 9.9312, lng: 76.2673 },
      }),
      goods: JSON.stringify({
        type: 'Electronics',
        weight: 3000,
        packaging: 'Boxes',
      }),
      tonnage: 3.0,
      expected_price: 30000,
      price_range_min: 28000,
      price_range_max: 35000,
      status: 'OPEN',
      auto_finalize_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      created_at: new Date('2024-01-15T12:00:00Z'),
    },
  ]);

  // 5. Insert Bids
  await knex('bids').insert([
    {
      id: 'BK-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      booking_id: 'RID-20240115-0001',
      operator_id: 'USR-OP-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      amount: 16500,
      status: 'ACTIVE',
      rank: 1,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      created_at: new Date('2024-01-15T10:30:00Z'),
    },
    {
      id: 'BK-01ARZ3NDEKTSV4RRFFQ69G5FBV',
      booking_id: 'RID-20240115-0002',
      operator_id: 'USR-OP-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      amount: 24000,
      status: 'ACTIVE',
      rank: 1,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      created_at: new Date('2024-01-15T11:30:00Z'),
    },
  ]);

  // 6. Insert Ledger Entries
  await knex('ledgers').insert([
    {
      id: 'LDG-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      operator_id: 'USR-OP-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      type: 'CREDIT',
      amount: 100000,
      balance_after: 100000,
      description: 'Initial deposit',
      created_at: new Date('2024-01-01T00:00:00Z'),
    },
    {
      id: 'LDG-01ARZ3NDEKTSV4RRFFQ69G5FBV',
      operator_id: 'USR-OP-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      type: 'DEBIT',
      amount: 500,
      balance_after: 99500,
      description: 'Bid deposit for RID-20240115-0001',
      reference_type: 'bid',
      reference_id: 'BK-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      created_at: new Date('2024-01-15T10:30:00Z'),
    },
  ]);

  // 7. Insert Franchises
  await knex('franchises').insert([
    {
      id: 'FRN-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      name: 'Rodistaa HQ',
      type: 'HQ',
      parent_id: null,
      is_active: true,
      created_at: new Date('2024-01-01T00:00:00Z'),
    },
    {
      id: 'FRN-01ARZ3NDEKTSV4RRFFQ69G5FBV',
      name: 'Maharashtra District',
      type: 'DISTRICT',
      parent_id: 'FRN-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      coverage_area: JSON.stringify({ state: 'Maharashtra', districts: ['Mumbai', 'Pune', 'Nagpur'] }),
      is_active: true,
      created_at: new Date('2024-01-01T00:00:00Z'),
    },
    {
      id: 'FRN-01ARZ3NDEKTSV4RRFFQ69G5FCV',
      name: 'Mumbai Unit',
      type: 'UNIT',
      parent_id: 'FRN-01ARZ3NDEKTSV4RRFFQ69G5FBV',
      coverage_area: JSON.stringify({ city: 'Mumbai', pincodes: ['400001', '400002', '400003'] }),
      targets: JSON.stringify({ monthly_inspections: 50, monthly_bookings: 100 }),
      is_active: true,
      created_at: new Date('2024-01-01T00:00:00Z'),
    },
  ]);

  // 8. Insert sample notifications
  await knex('notifications').insert([
    {
      user_id: 'USR-SH-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      title: 'New Bid Received',
      body: 'You have received a bid of ₹16,500 for RID-20240115-0001',
      type: 'bid',
      data: JSON.stringify({ booking_id: 'RID-20240115-0001', bid_id: 'BK-01ARZ3NDEKTSV4RRFFQ69G5FAV' }),
      is_read: false,
      created_at: new Date('2024-01-15T10:30:00Z'),
    },
    {
      user_id: 'USR-OP-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      title: 'Bid Placed Successfully',
      body: 'Your bid of ₹16,500 for RID-20240115-0001 has been placed',
      type: 'bid',
      data: JSON.stringify({ booking_id: 'RID-20240115-0001', bid_id: 'BK-01ARZ3NDEKTSV4RRFFQ69G5FAV' }),
      is_read: false,
      created_at: new Date('2024-01-15T10:30:00Z'),
    },
  ]);
}

