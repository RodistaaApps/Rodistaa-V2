/**
 * Local Migration Script
 * 
 * Runs Knex migrations against local database
 */

const knex = require('knex');
const knexConfig = require('../knexfile');

async function runMigrations() {
  const db = knex(knexConfig.local);

  try {
    console.log('🚀 Running migrations...\n');

    // Run migrations
    const [batchNo, migrations] = await db.migrate.latest();

    if (migrations.length === 0) {
      console.log('✅ Already up to date');
    } else {
      console.log(`✅ Batch ${batchNo} run: ${migrations.length} migrations`);
      migrations.forEach((migration) => {
        console.log(`   - ${migration}`);
      });
    }

    console.log('\n📊 Database status:');
    const tables = await db.raw(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);

    console.log(`   Tables created: ${tables.rows.length}`);
    tables.rows.forEach((row) => {
      console.log(`   - ${row.tablename}`);
    });

    console.log('\n✅ Migrations complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

runMigrations();

