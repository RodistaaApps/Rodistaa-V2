/**
 * Bookings & Shipments Seeder
 * 
 * Generates 20 bookings with varied statuses and 5 active shipments
 * for local development and testing.
 */

import { Pool } from 'pg';

const statuses = ['posted', 'bidding', 'finalized', 'cancelled', 'converted'];
const materials = [
  'Electronics',
  'Machinery Parts',
  'Textiles',
  'Food Grains',
  'Construction Materials',
  'Furniture',
  'Pharmaceuticals',
  'Automotive Parts',
];

const routes = [
  { pickup: 'Mumbai', pickupState: 'Maharashtra', drop: 'Delhi', dropState: 'Delhi', distance: 1420 },
  { pickup: 'Delhi', pickupState: 'Delhi', drop: 'Bangalore', dropState: 'Karnataka', distance: 2150 },
  { pickup: 'Hyderabad', pickupState: 'Telangana', drop: 'Mumbai', dropState: 'Maharashtra', distance: 710 },
  { pickup: 'Chennai', pickupState: 'Tamil Nadu', drop: 'Kolkata', dropState: 'West Bengal', distance: 1670 },
  { pickup: 'Bangalore', pickupState: 'Karnataka', drop: 'Hyderabad', dropState: 'Telangana', distance: 570 },
  { pickup: 'Pune', pickupState: 'Maharashtra', drop: 'Ahmedabad', dropState: 'Gujarat', distance: 670 },
  { pickup: 'Kolkata', pickupState: 'West Bengal', drop: 'Mumbai', dropState: 'Maharashtra', distance: 2010 },
];

const generateBookings = (count: number) => {
  const bookings = [];
  
  for (let i = 1; i <= count; i++) {
    const route = routes[Math.floor(Math.random() * routes.length)];
    const material = materials[Math.floor(Math.random() * materials.length)];
    const weight = Math.floor(Math.random() * 15000) + 3000;
    const expectedMin = Math.floor((route.distance * 30) + (weight * 5));
    const expectedMax = expectedMin + Math.floor(expectedMin * 0.2);
    
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const postedDate = new Date();
    postedDate.setDate(postedDate.getDate() - Math.floor(Math.random() * 7));
    
    const booking = {
      id: `BKG-${String(i).padStart(3, '0')}`,
      shipper_id: `USR-202${Math.floor(Math.random() * 50) + 1}`,
      franchise_id: `FR-00${Math.floor(Math.random() * 5) + 1}`,
      pickup_address: `Warehouse ${Math.floor(Math.random() * 50) + 1}, ${route.pickup}`,
      pickup_city: route.pickup,
      pickup_state: route.pickupState,
      pickup_lat: 18.5204 + (Math.random() - 0.5) * 10,
      pickup_lng: 73.8567 + (Math.random() - 0.5) * 10,
      drop_address: `Industrial Area ${Math.floor(Math.random() * 20) + 1}, ${route.drop}`,
      drop_city: route.drop,
      drop_state: route.dropState,
      drop_lat: 18.5204 + (Math.random() - 0.5) * 10,
      drop_lng: 73.8567 + (Math.random() - 0.5) * 10,
      distance_km: route.distance,
      material,
      weight_kg: weight,
      dimensions: {
        length: Math.floor(Math.random() * 30) + 10,
        width: 8,
        height: 8,
      },
      special_instructions: Math.random() > 0.5 ? 'Handle with care. Temperature controlled preferred.' : null,
      attachments: [],
      expected_price_min: expectedMin,
      expected_price_max: expectedMax,
      payment_mode: Math.random() > 0.3 ? 'online' : 'cash',
      posted_at: postedDate.toISOString(),
      auto_finalize_at: status === 'bidding' ? new Date(postedDate.getTime() + 24 * 60 * 60 * 1000).toISOString() : null,
      status,
      is_reopened: false,
      winning_bid_id: status === 'finalized' ? `BID-${String(i * 2).padStart(3, '0')}` : null,
      created_shipment_id: status === 'converted' ? `SHP-${String(Math.floor(i / 4) + 1).padStart(3, '0')}` : null,
      finalized_at: status === 'finalized' || status === 'converted' ? new Date(postedDate.getTime() + 4 * 60 * 60 * 1000).toISOString() : null,
      cancelled_at: status === 'cancelled' ? new Date(postedDate.getTime() + 2 * 60 * 60 * 1000).toISOString() : null,
    };
    
    bookings.push(booking);
  }
  
  return bookings;
};

const generateBids = (bookingIds: string[]) => {
  const bids = [];
  let bidCounter = 1;
  
  for (const bookingId of bookingIds) {
    const numBids = Math.floor(Math.random() * 6) + 1;
    
    for (let i = 0; i < numBids; i++) {
      const isCounter = i > 0 && Math.random() > 0.6;
      const placedDate = new Date();
      placedDate.setHours(placedDate.getHours() - Math.floor(Math.random() * 24));
      
      const bid = {
        id: `BID-${String(bidCounter++).padStart(3, '0')}`,
        booking_id: bookingId,
        operator_id: `OP-00${Math.floor(Math.random() * 10) + 1}`,
        truck_id: `DL0${Math.floor(Math.random() * 9) + 1}AB${Math.floor(Math.random() * 9000) + 1000}`,
        driver_id: `DR-00${Math.floor(Math.random() * 20) + 1}`,
        amount: Math.floor(Math.random() * 50000) + 40000,
        original_amount: Math.floor(Math.random() * 50000) + 40000,
        is_counter: isCounter,
        counter_to_bid_id: isCounter ? `BID-${String(bidCounter - 2).padStart(3, '0')}` : null,
        status: 'active',
        metadata: {
          estimated_hours: Math.floor(Math.random() * 24) + 12,
          fuel_included: Math.random() > 0.5,
        },
        placed_at: placedDate.toISOString(),
        modified_at: isCounter ? new Date(placedDate.getTime() + 30 * 60 * 1000).toISOString() : null,
      };
      
      bids.push(bid);
    }
  }
  
  return bids;
};

const generateShipments = (count: number) => {
  const shipments = [];
  const shipmentStatuses = ['assigned', 'started', 'in_transit', 'delivered', 'delayed'];
  
  for (let i = 1; i <= count; i++) {
    const route = routes[Math.floor(Math.random() * routes.length)];
    const status = shipmentStatuses[Math.floor(Math.random() * shipmentStatuses.length)];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 3));
    
    const freightAmount = Math.floor(Math.random() * 50000) + 40000;
    const advancePaid = Math.floor(freightAmount * 0.4);
    
    const shipment = {
      id: `SHP-${String(i).padStart(3, '0')}`,
      booking_id: `BKG-${String(i * 4).padStart(3, '0')}`,
      operator_id: `OP-00${Math.floor(Math.random() * 10) + 1}`,
      truck_id: `DL0${Math.floor(Math.random() * 9) + 1}AB${Math.floor(Math.random() * 9000) + 1000}`,
      driver_id: `DR-00${Math.floor(Math.random() * 20) + 1}`,
      pickup_address: `Warehouse ${Math.floor(Math.random() * 50) + 1}, ${route.pickup}`,
      pickup_city: route.pickup,
      drop_address: `Industrial Area ${Math.floor(Math.random() * 20) + 1}, ${route.drop}`,
      drop_city: route.drop,
      distance_km: route.distance,
      start_at: startDate.toISOString(),
      estimated_arrival: new Date(startDate.getTime() + 40 * 60 * 60 * 1000).toISOString(),
      actual_arrival: status === 'delivered' ? new Date(startDate.getTime() + 42 * 60 * 60 * 1000).toISOString() : null,
      delivered_at: status === 'delivered' ? new Date(startDate.getTime() + 43 * 60 * 60 * 1000).toISOString() : null,
      status,
      pod_uploaded: status === 'delivered',
      pod_photos: status === 'delivered' ? ['/uploads/pod/sample1.jpg', '/uploads/pod/sample2.jpg'] : [],
      pod_pdf_url: status === 'delivered' ? '/uploads/pod/pod-sample.pdf' : null,
      pod_verified: status === 'delivered',
      otp_verified: status === 'delivered',
      shipper_otp_hash: status === 'delivered' ? 'hashed_otp_value' : null,
      freight_amount: freightAmount,
      advance_paid: advancePaid,
      balance_amount: freightAmount - advancePaid,
      payment_state: status === 'delivered' ? 'settled' : 'advance_paid',
      settlement_reference: status === 'delivered' ? `REF-${Date.now()}` : null,
      settlement_notes: null,
      has_dispute: false,
      exceptions: [],
      last_known_lat: 18.5204 + (Math.random() - 0.5) * 10,
      last_known_lng: 73.8567 + (Math.random() - 0.5) * 10,
      last_ping_at: new Date(Date.now() - Math.floor(Math.random() * 60) * 60 * 1000).toISOString(),
      total_distance_traveled: Math.floor(route.distance * (Math.random() * 0.5 + 0.3)),
    };
    
    shipments.push(shipment);
  }
  
  return shipments;
};

const generateEvents = (bookingIds: string[], shipmentIds: string[]) => {
  const events = [];
  let eventId = 1;
  
  // Booking events
  for (const bookingId of bookingIds.slice(0, 10)) {
    events.push({
      id: eventId++,
      target_type: 'booking',
      target_id: bookingId,
      event_type: 'BOOKING_POSTED',
      actor_id: `USR-${Math.floor(Math.random() * 50) + 201}`,
      actor_role: 'shipper',
      payload: { expected_price: 50000 },
      geo_lat: null,
      geo_lng: null,
      created_at: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
    });
    
    events.push({
      id: eventId++,
      target_type: 'booking',
      target_id: bookingId,
      event_type: 'BID_PLACED',
      actor_id: `OP-00${Math.floor(Math.random() * 10) + 1}`,
      actor_role: 'operator',
      payload: { bid_amount: 48000 },
      geo_lat: null,
      geo_lng: null,
      created_at: new Date(Date.now() - Math.floor(Math.random() * 6) * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
  
  // Shipment events
  for (const shipmentId of shipmentIds) {
    events.push({
      id: eventId++,
      target_type: 'shipment',
      target_id: shipmentId,
      event_type: 'BOOKING_CONVERTED',
      actor_id: 'SYSTEM',
      actor_role: 'system',
      payload: { booking_id: `BKG-${shipmentId.split('-')[1]}` },
      geo_lat: null,
      geo_lng: null,
      created_at: new Date(Date.now() - Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000).toISOString(),
    });
    
    events.push({
      id: eventId++,
      target_type: 'shipment',
      target_id: shipmentId,
      event_type: 'DRIVER_STARTED_TRIP',
      actor_id: `DR-00${Math.floor(Math.random() * 20) + 1}`,
      actor_role: 'driver',
      payload: {},
      geo_lat: 28.7041,
      geo_lng: 77.1025,
      created_at: new Date(Date.now() - Math.floor(Math.random() * 2) * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
  
  return events;
};

export const seedBookingsShipments = async (pool: Pool) => {
  console.log('🌱 Seeding bookings & shipments...');
  
  try {
    // Generate data
    const bookings = generateBookings(20);
    const bids = generateBids(bookings.map(b => b.id));
    const shipments = generateShipments(5);
    const events = generateEvents(bookings.map(b => b.id), shipments.map(s => s.id));
    
    // Insert bookings
    for (const booking of bookings) {
      await pool.query(`
        INSERT INTO bookings (
          id, shipper_id, franchise_id, pickup_address, pickup_city, pickup_state,
          pickup_lat, pickup_lng, drop_address, drop_city, drop_state, drop_lat, drop_lng,
          distance_km, material, weight_kg, dimensions, special_instructions, attachments,
          expected_price_min, expected_price_max, payment_mode, posted_at, auto_finalize_at,
          status, is_reopened, winning_bid_id, created_shipment_id, finalized_at, cancelled_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30)
        ON CONFLICT (id) DO NOTHING
      `, [
        booking.id, booking.shipper_id, booking.franchise_id, booking.pickup_address,
        booking.pickup_city, booking.pickup_state, booking.pickup_lat, booking.pickup_lng,
        booking.drop_address, booking.drop_city, booking.drop_state, booking.drop_lat,
        booking.drop_lng, booking.distance_km, booking.material, booking.weight_kg,
        JSON.stringify(booking.dimensions), booking.special_instructions, booking.attachments,
        booking.expected_price_min, booking.expected_price_max, booking.payment_mode,
        booking.posted_at, booking.auto_finalize_at, booking.status, booking.is_reopened,
        booking.winning_bid_id, booking.created_shipment_id, booking.finalized_at, booking.cancelled_at,
      ]);
    }
    
    console.log(`✅ Inserted ${bookings.length} bookings`);
    
    // Insert bids
    for (const bid of bids) {
      await pool.query(`
        INSERT INTO bids (
          id, booking_id, operator_id, truck_id, driver_id, amount, original_amount,
          is_counter, counter_to_bid_id, status, metadata, placed_at, modified_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO NOTHING
      `, [
        bid.id, bid.booking_id, bid.operator_id, bid.truck_id, bid.driver_id,
        bid.amount, bid.original_amount, bid.is_counter, bid.counter_to_bid_id,
        bid.status, JSON.stringify(bid.metadata), bid.placed_at, bid.modified_at,
      ]);
    }
    
    console.log(`✅ Inserted ${bids.length} bids`);
    
    // Insert shipments
    for (const shipment of shipments) {
      await pool.query(`
        INSERT INTO shipments (
          id, booking_id, operator_id, truck_id, driver_id, pickup_address, pickup_city,
          drop_address, drop_city, distance_km, start_at, estimated_arrival, actual_arrival,
          delivered_at, status, pod_uploaded, pod_photos, pod_pdf_url, pod_verified,
          otp_verified, shipper_otp_hash, freight_amount, advance_paid, balance_amount,
          payment_state, settlement_reference, settlement_notes, has_dispute, exceptions,
          last_known_lat, last_known_lng, last_ping_at, total_distance_traveled
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33)
        ON CONFLICT (id) DO NOTHING
      `, [
        shipment.id, shipment.booking_id, shipment.operator_id, shipment.truck_id,
        shipment.driver_id, shipment.pickup_address, shipment.pickup_city,
        shipment.drop_address, shipment.drop_city, shipment.distance_km,
        shipment.start_at, shipment.estimated_arrival, shipment.actual_arrival,
        shipment.delivered_at, shipment.status, shipment.pod_uploaded,
        shipment.pod_photos, shipment.pod_pdf_url, shipment.pod_verified,
        shipment.otp_verified, shipment.shipper_otp_hash, shipment.freight_amount,
        shipment.advance_paid, shipment.balance_amount, shipment.payment_state,
        shipment.settlement_reference, shipment.settlement_notes, shipment.has_dispute,
        JSON.stringify(shipment.exceptions), shipment.last_known_lat, shipment.last_known_lng,
        shipment.last_ping_at, shipment.total_distance_traveled,
      ]);
    }
    
    console.log(`✅ Inserted ${shipments.length} shipments`);
    
    // Insert events
    for (const event of events) {
      await pool.query(`
        INSERT INTO booking_shipment_events (
          id, target_type, target_id, event_type, actor_id, actor_role, payload, geo_lat, geo_lng, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO NOTHING
      `, [
        event.id, event.target_type, event.target_id, event.event_type,
        event.actor_id, event.actor_role, JSON.stringify(event.payload),
        event.geo_lat, event.geo_lng, event.created_at,
      ]);
    }
    
    console.log(`✅ Inserted ${events.length} events`);
    console.log('🎉 Bookings & shipments seeding complete!');
    
  } catch (error) {
    console.error('❌ Error seeding bookings & shipments:', error);
    throw error;
  }
};

// Run directly if called as script
if (require.main === module) {
  const { Pool } = require('pg');
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'rodistaa',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });
  
  seedBookingsShipments(pool)
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed:', error);
      process.exit(1);
    });
}

