/**
 * Local Seed Script
 * 
 * Runs Knex seeds against local database
 */

const knex = require('knex');
const knexConfig = require('../knexfile');

async function runSeeds() {
  const db = knex(knexConfig.local);

  try {
    console.log('🌱 Running seeds...\n');

    // Run seeds
    const [files] = await db.seed.run();

    if (files.length === 0) {
      console.log('⚠️  No seed files found');
    } else {
      console.log(`✅ Executed ${files.length} seed files:`);
      files.forEach((file) => {
        console.log(`   - ${file}`);
      });
    }

    // Show sample data
    console.log('\n📊 Sample data created:');
    
    const users = await db('users').count('* as count');
    console.log(`   Users: ${users[0].count}`);
    
    const trucks = await db('trucks').count('* as count');
    console.log(`   Trucks: ${trucks[0].count}`);
    
    const bookings = await db('bookings').count('* as count');
    console.log(`   Bookings: ${bookings[0].count}`);
    
    const bids = await db('bids').count('* as count');
    console.log(`   Bids: ${bids[0].count}`);

    console.log('\n✅ Seeds complete!');
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

runSeeds();

