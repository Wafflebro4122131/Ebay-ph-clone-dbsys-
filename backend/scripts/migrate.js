import fs from 'fs/promises';
import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const sqlPath = path.resolve(process.cwd(), '../supabase/migrations/000001_init_tables.sql');
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('Error: DATABASE_URL is required in backend/.env to run migrations.');
  process.exit(1);
}

async function runMigration() {
  const sql = await fs.readFile(sqlPath, 'utf-8');
  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log('Connected to database. Running migration...');
    await client.query(sql);
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
