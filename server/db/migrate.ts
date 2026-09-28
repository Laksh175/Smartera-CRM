import fs from 'fs';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log('ℹ️ No DATABASE_URL provided. Migration skipped (using memory store).');
    return;
  }

  const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    const client = await pool.connect();
    console.log('🚀 Running database migrations...');
    const migrationFilePath = path.join(process.cwd(), 'server', 'migrations', '001_initial_schema.sql');
    const sql = fs.readFileSync(migrationFilePath, 'utf8');
    
    await client.query(sql);
    console.log('✅ Migrations applied successfully!');
    client.release();
  } catch (err: any) {
    console.error('❌ Migration error:', err.message);
  } finally {
    await pool.end();
  }
}

runMigrations();
