const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:[PASSWORD]@db.rowyjdwzpiyjamtrftuo.supabase.co:5432/postgres';

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  
  console.log('🔌 Connecting to Supabase PostgreSQL...');
  await client.connect();
  
  const res = await client.query('SELECT version()');
  console.log('✅ Connected!', res.rows[0].version.split(',')[0]);
  
  // Run schema
  const schemaPath = path.join(__dirname, 'packages', 'api', 'supabase', 'schema.sql');
  const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');
  
  console.log('\n⏳ Running Schema Migration...');
  try {
    await client.query(schemaSQL);
    console.log('✅ Schema Migration complete!');
  } catch (err) {
    console.error('❌ Schema error:', err.message);
    // Try to continue anyway - some statements might have partially succeeded
  }
  
  // Run seed data
  const seedPath = path.join(__dirname, 'packages', 'api', 'supabase', 'seed.sql');
  const seedSQL = fs.readFileSync(seedPath, 'utf-8');
  
  console.log('\n⏳ Running Seed Data...');
  try {
    await client.query(seedSQL);
    console.log('✅ Seed Data complete!');
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  }
  
  // Verify tables
  console.log('\n🔍 Verifying tables...');
  const tables = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename");
  console.log(`✅ Found ${tables.rows.length} tables:`);
  tables.rows.forEach(t => console.log(`   • ${t.tablename}`));
  
  // Count records
  console.log('\n📊 Record counts:');
  for (const t of tables.rows) {
    try {
      const count = await client.query(`SELECT COUNT(*) FROM ${t.tablename}`);
      console.log(`   • ${t.tablename}: ${count.rows[0].count} rows`);
    } catch (e) {}
  }
  
  await client.end();
  console.log('\n✅ All done!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
