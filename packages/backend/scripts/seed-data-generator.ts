/**
 * Comprehensive Data Seeder for Rodistaa Platform
 * Generates realistic seed data for Andhra Pradesh districts
 * 
 * Usage: npm run seed or ts-node scripts/seed-data-generator.ts
 */

import { query } from '../src/db';
import { v4 as uuid } from 'uuid';
import { ulid } from 'ulid';

// Andhra Pradesh districts as per training spec
const AP_DISTRICTS = [
  { id: 'KURNOOL', name: 'Kurnool', region: 'RAYALASEEMA' },
  { id: 'NANDYAL', name: 'Nandyal', region: 'RAYALASEEMA' },
  { id: 'GUNTUR', name: 'Guntur', region: 'COASTAL' },
  { id: 'VIJAYAWADA', name: 'Vijayawada', region: 'COASTAL' },
];

// Indian names for realistic data
const INDIAN_FIRST_NAMES = [
  'Ramesh', 'Suresh', 'Rajesh', 'Mahesh', 'Ganesh', 'Venkat', 'Krishna', 'Ravi',
  'Srinivas', 'Naresh', 'Vijay', 'Kumar', 'Prakash', 'Anand', 'Mohan', 'Sanjay',
];

const INDIAN_LAST_NAMES = [
  'Kumar', 'Reddy', 'Rao', 'Naidu', 'Patel', 'Singh', 'Sharma', 'Gupta',
  'Verma', 'Babu', 'Chowdary', 'Goud', 'Varma',
];

// Truck registration patterns
const TRUCK_REGISTRATIONS = [
  'AP09', 'AP10', 'AP11', 'AP12', 'AP13', 'AP14', 'AP15', 'AP16',
  'TN01', 'TN09', 'TN12', 'KA01', 'KA03', 'TG01', 'TG09',
];

/**
 * Main seeder function
 */
export async function seedDatabase(): Promise<void> {
  console.log('🌱 Starting Rodistaa database seeding...\n');

  try {
    // 1. Seed operators (100 operators)
    console.log('Creating operators...');
    const operators = await seedOperators(100);
    console.log(`✅ Created ${operators.length} operators\n`);

    // 2. Seed trucks (500 trucks across operators)
    console.log('Creating trucks...');
    const trucks = await seedTrucks(operators, 500);
    console.log(`✅ Created ${trucks.length} trucks\n`);

    // 3. Seed drivers (100 drivers)
    console.log('Creating drivers...');
    const drivers = await seedDrivers(100);
    console.log(`✅ Created ${drivers.length} drivers\n`);

    // 4. Seed shippers (50 shippers)
    console.log('Creating shippers...');
    const shippers = await seedShippers(50);
    console.log(`✅ Created ${shippers.length} shippers\n`);

    // 5. Seed bookings (200 loads)
    console.log('Creating bookings...');
    const bookings = await seedBookings(shippers, 200);
    console.log(`✅ Created ${bookings.length} bookings\n`);

    // 6. Seed bids (500 bids across bookings)
    console.log('Creating bids...');
    const bids = await seedBids(operators, trucks, bookings, 500);
    console.log(`✅ Created ${bids.length} bids\n`);

    // 7. Seed some active shipments
    console.log('Creating active shipments...');
    const shipments = await seedShipments(bookings.slice(0, 50), drivers, trucks);
    console.log(`✅ Created ${shipments.length} shipments\n`);

    // 8. Seed certified yards
    console.log('Creating certified yards...');
    const yards = await seedCertifiedYards();
    console.log(`✅ Created ${yards.length} yards\n`);

    // 9. Seed admin users
    console.log('Creating admin users...');
    await seedAdminUsers();
    console.log(`✅ Created admin users\n`);

    console.log('🎊 Database seeding complete!');
    console.log('\n📊 Summary:');
    console.log(`   Operators: ${operators.length}`);
    console.log(`   Trucks: ${trucks.length}`);
    console.log(`   Drivers: ${drivers.length}`);
    console.log(`   Shippers: ${shippers.length}`);
    console.log(`   Bookings: ${bookings.length}`);
    console.log(`   Bids: ${bids.length}`);
    console.log(`   Shipments: ${shipments.length}`);
    console.log(`   Yards: ${yards.length}\n`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

/**
 * Seed operators
 */
async function seedOperators(count: number): Promise<string[]> {
  const operators: string[] = [];

  for (let i = 0; i < count; i++) {
    const id = `USR-OP-${ulid()}`;
    const firstName = INDIAN_FIRST_NAMES[Math.floor(Math.random() * INDIAN_FIRST_NAMES.length)];
    const lastName = INDIAN_LAST_NAMES[Math.floor(Math.random() * INDIAN_LAST_NAMES.length)];
    const name = `${firstName} ${lastName}`;
    const mobile = `+91${9000000000 + i}`;
    const district = AP_DISTRICTS[Math.floor(Math.random() * AP_DISTRICTS.length)];

    await query(
      `INSERT INTO users (id, role, name, mobile_masked, mobile_full_encrypted, kyc_status, is_active, created_at)
       VALUES ($1, 'OP', $2, $3, $4, $5, TRUE, NOW() - INTERVAL '${Math.floor(Math.random() * 180)} days')`,
      [id, name, `+91XXXXXX${mobile.slice(-4)}`, mobile, i < 80 ? 'VERIFIED' : 'PENDING']
    );

    // Create wallet for operator
    await query(
      `INSERT INTO operator_wallets (id, operator_id, balance, locked_amount, currency, status)
       VALUES ($1, $2, $3, 0, 'INR', 'ACTIVE')`,
      [uuid(), id, Math.floor(Math.random() * 50000)]
    );

    operators.push(id);
  }

  return operators;
}

/**
 * Seed trucks
 */
async function seedTrucks(operators: string[], count: number): Promise<string[]> {
  const trucks: string[] = [];
  const truckTypes = ['Container 20ft', 'Container 40ft', 'Open Body', 'Flatbed', 'Tanker'];

  for (let i = 0; i < count; i++) {
    const operatorId = operators[Math.floor(Math.random() * operators.length)];
    const regPrefix = TRUCK_REGISTRATIONS[Math.floor(Math.random() * TRUCK_REGISTRATIONS.length)];
    const regNo = `${regPrefix}-AB-${1000 + i}`;
    const id = `TRK-${regNo}-${ulid()}`;
    const truckType = truckTypes[Math.floor(Math.random() * truckTypes.length)];
    
    const status = Math.random() < 0.8 ? 'ACTIVE' : 'PENDING_INSPECTION';

    await query(
      `INSERT INTO trucks (id, operator_id, reg_no, model_year, bs_type, vehicle_type, tonnage, status, created_at)
       VALUES ($1, $2, $3, $4, 'BS6', $5, $6, $7, NOW() - INTERVAL '${Math.floor(Math.random() * 365)} days')`,
      [
        id,
        operatorId,
        regNo,
        2020 + Math.floor(Math.random() * 5),
        truckType,
        10 + Math.floor(Math.random() * 20),
        status,
      ]
    );

    trucks.push(id);
  }

  return trucks;
}

/**
 * Seed drivers
 */
async function seedDrivers(count: number): Promise<string[]> {
  const drivers: string[] = [];

  for (let i = 0; i < count; i++) {
    const id = `USR-DR-${ulid()}`;
    const firstName = INDIAN_FIRST_NAMES[Math.floor(Math.random() * INDIAN_FIRST_NAMES.length)];
    const lastName = INDIAN_LAST_NAMES[Math.floor(Math.random() * INDIAN_LAST_NAMES.length)];
    const name = `${firstName} ${lastName}`;
    const mobile = `+91${8000000000 + i}`;

    await query(
      `INSERT INTO users (id, role, name, mobile_masked, mobile_full_encrypted, kyc_status, is_active, created_at)
       VALUES ($1, 'DR', $2, $3, $4, $5, TRUE, NOW() - INTERVAL '${Math.floor(Math.random() * 120)} days')`,
      [id, name, `+91XXXXXX${mobile.slice(-4)}`, mobile, i < 85 ? 'VERIFIED' : 'PENDING']
    );

    drivers.push(id);
  }

  return drivers;
}

/**
 * Seed shippers
 */
async function seedShippers(count: number): Promise<string[]> {
  const shippers: string[] = [];
  const companyNames = ['Exports', 'Industries', 'Trading', 'Logistics', 'Corporation', 'Enterprises'];

  for (let i = 0; i < count; i++) {
    const id = `USR-SH-${ulid()}`;
    const baseName = INDIAN_LAST_NAMES[Math.floor(Math.random() * INDIAN_LAST_NAMES.length)];
    const companyType = companyNames[Math.floor(Math.random() * companyNames.length)];
    const name = `${baseName} ${companyType}`;
    const mobile = `+91${7000000000 + i}`;

    await query(
      `INSERT INTO users (id, role, name, mobile_masked, mobile_full_encrypted, kyc_status, is_active, created_at)
       VALUES ($1, 'SH', $2, $3, $4, 'VERIFIED', TRUE, NOW() - INTERVAL '${Math.floor(Math.random() * 90)} days')`,
      [id, name, `+91XXXXXX${mobile.slice(-4)}`, mobile]
    );

    shippers.push(id);
  }

  return shippers;
}

/**
 * Seed bookings
 */
async function seedBookings(shippers: string[], count: number): Promise<string[]> {
  const bookings: string[] = [];
  const locations = ['Chennai', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Kolkata'];

  for (let i = 0; i < count; i++) {
    const id = `BKG-${ulid()}`;
    const shipperId = shippers[Math.floor(Math.random() * shippers.length)];
    const fromLocation = locations[Math.floor(Math.random() * locations.length)];
    let toLocation = locations[Math.floor(Math.random() * locations.length)];
    while (toLocation === fromLocation) {
      toLocation = locations[Math.floor(Math.random() * locations.length)];
    }

    const status = Math.random() < 0.3 ? 'OPEN' : (Math.random() < 0.5 ? 'ASSIGNED' : 'COMPLETED');

    await query(
      `INSERT INTO bookings (id, shipper_id, pickup_location, drop_location, weight, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW() - INTERVAL '${Math.floor(Math.random() * 30)} days')`,
      [id, shipperId, fromLocation, toLocation, 5 + Math.floor(Math.random() * 20), status]
    );

    bookings.push(id);
  }

  return bookings;
}

/**
 * Seed bids
 */
async function seedBids(
  operators: string[],
  trucks: string[],
  bookings: string[],
  count: number
): Promise<string[]> {
  const bids: string[] = [];

  for (let i = 0; i < count; i++) {
    const id = uuid();
    const bookingId = bookings[Math.floor(Math.random() * bookings.length)];
    const operatorId = operators[Math.floor(Math.random() * operators.length)];
    const truckId = trucks[Math.floor(Math.random() * trucks.length)];
    const bidAmount = 10000 + Math.floor(Math.random() * 40000);
    const status = Math.random() < 0.7 ? 'PENDING' : (Math.random() < 0.5 ? 'ACCEPTED' : 'REJECTED');

    await query(
      `INSERT INTO bids (id, booking_id, operator_id, truck_id, bid_amount, eta_hours, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL '${Math.floor(Math.random() * 10)} days')`,
      [id, bookingId, operatorId, truckId, bidAmount, 12 + Math.floor(Math.random() * 36), status]
    );

    bids.push(id);
  }

  return bids;
}

/**
 * Seed shipments
 */
async function seedShipments(
  bookings: string[],
  drivers: string[],
  trucks: string[]
): Promise<string[]> {
  const shipments: string[] = [];

  for (const bookingId of bookings) {
    const id = `SHP-${ulid()}`;
    const driverId = drivers[Math.floor(Math.random() * drivers.length)];
    const truckId = trucks[Math.floor(Math.random() * trucks.length)];
    const status = ['ASSIGNED', 'IN_TRANSIT', 'COMPLETED'][Math.floor(Math.random() * 3)];

    await query(
      `INSERT INTO shipments (id, booking_id, driver_id, truck_id, status, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '${Math.floor(Math.random() * 15)} days')`,
      [id, bookingId, driverId, truckId, status]
    );

    shipments.push(id);
  }

  return shipments;
}

/**
 * Seed certified yards
 */
async function seedCertifiedYards(): Promise<string[]> {
  const yards: string[] = [];

  for (const district of AP_DISTRICTS) {
    const yardId = `RCY-${district.id}-001`;
    const id = uuid();

    await query(
      `INSERT INTO certified_yards 
       (id, yard_id, yard_name, address, latitude, longitude, district_id, region_id, status, has_weighbridge)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ACTIVE', TRUE)`,
      [
        id,
        yardId,
        `Rodistaa Certified Yard - ${district.name}`,
        `Industrial Area, ${district.name}, Andhra Pradesh`,
        15.0 + Math.random() * 2,
        78.0 + Math.random() * 2,
        district.id,
        district.region,
      ]
    );

    yards.push(yardId);
  }

  return yards;
}

/**
 * Seed admin users
 */
async function seedAdminUsers(): Promise<void> {
  // Create HQ admin
  await query(
    `INSERT INTO users (id, role, name, mobile_masked, mobile_full_encrypted, kyc_status, is_active)
     VALUES ('USR-AD-HQ001', 'AD', 'Rodistaa Admin', '+91XXXXXX9999', '+919999999999', 'VERIFIED', TRUE)
     ON CONFLICT (id) DO NOTHING`
  );

  // Create franchise users
  await query(
    `INSERT INTO users (id, role, name, mobile_masked, mobile_full_encrypted, kyc_status, is_active)
     VALUES 
       ('USR-FU-HQ001', 'FU', 'Rodistaa HQ Franchise', '+91XXXXXX0001', '+919999990001', 'VERIFIED', TRUE),
       ('USR-FD-AP', 'FD', 'AP Regional Franchise', '+91XXXXXX0002', '+919999990002', 'VERIFIED', TRUE),
       ('USR-FD-VIJAYAWADA', 'FD', 'Vijayawada Unit Franchise', '+91XXXXXX0003', '+919999990003', 'VERIFIED', TRUE)
     ON CONFLICT (id) DO NOTHING`
  );
}

// Run seeder if executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('\n✅ Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Seeding failed:', error);
      process.exit(1);
    });
}

