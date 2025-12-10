/**
 * Demo/Seed Data for Development
 * Creates sample users, trucks, bookings for testing
 */

import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('shipments').del();
  await knex('bids').del();
  await knex('bookings').del();
  await knex('truck_inspections').del();
  await knex('trucks').del();
  await knex('kyc_documents').del();
  await knex('users').del();

  // Insert users
  await knex('users').insert([
    {
      id: 'user-shipper-001',
      phone: '9876543210',
      email: 'shipper@rodistaa.com',
      role: 'SHIPPER',
      name: 'ABC Corp',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 'user-operator-001',
      phone: '9876543211',
      email: 'operator@rodistaa.com',
      role: 'OPERATOR',
      name: 'XYZ Transport',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 'user-driver-001',
      phone: '9876543212',
      email: 'driver@rodistaa.com',
      role: 'DRIVER',
      name: 'Rajesh Kumar',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 'user-admin-001',
      phone: '9876543213',
      email: 'admin@rodistaa.com',
      role: 'ADMIN',
      name: 'Admin User',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  // Insert trucks
  await knex('trucks').insert([
    {
      id: 'TRK-001',
      registration_no: 'MH-12-AB-1234',
      operator_id: 'user-operator-001',
      model_year: 2020,
      vehicle_type: 'HGV',
      tonnage_capacity: 20,
      status: 'ACTIVE',
      last_inspection: new Date('2024-01-01'),
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 'TRK-002',
      registration_no: 'KA-01-CD-5678',
      operator_id: 'user-operator-001',
      model_year: 2019,
      vehicle_type: 'HGV',
      tonnage_capacity: 25,
      status: 'ACTIVE',
      last_inspection: new Date('2024-01-15'),
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  // Insert bookings
  await knex('bookings').insert([
    {
      id: 'BOOK-001',
      shipper_id: 'user-shipper-001',
      pickup_address: 'Mumbai Port',
      pickup_city: 'Mumbai',
      pickup_state: 'Maharashtra',
      pickup_pincode: '400001',
      drop_address: 'Delhi Warehouse',
      drop_city: 'Delhi',
      drop_state: 'Delhi',
      drop_pincode: '110001',
      goods_type: 'Electronics',
      tonnage: 15,
      price_range_min: 20000,
      price_range_max: 30000,
      status: 'OPEN',
      created_at: new Date('2024-01-02T10:00:00'),
      updated_at: new Date('2024-01-02T10:00:00'),
    },
  ]);

  // Insert bids
  await knex('bids').insert([
    {
      id: 'BID-001',
      booking_id: 'BOOK-001',
      operator_id: 'user-operator-001',
      truck_id: 'TRK-001',
      amount: 25000,
      status: 'PENDING',
      created_at: new Date('2024-01-02T11:00:00'),
      updated_at: new Date('2024-01-02T11:00:00'),
    },
  ]);

  console.log('✅ Demo data seeded successfully');
}

