import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'lift',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const fixDatabase = async () => {
  console.log('🔧 Fixing database schema...');
  
  try {
    const client = await pool.connect();
    
    // Check if status column exists
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'startups' AND column_name = 'status'
    `);
    
    if (columnCheck.rows.length === 0) {
      console.log('➕ Adding status column...');
      await client.query('ALTER TABLE startups ADD COLUMN status INTEGER DEFAULT 1');
    } else {
      console.log('✅ Status column already exists');
    }
    
    // Check if tagline column exists
    const taglineCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'startups' AND column_name = 'tagline'
    `);
    
    if (taglineCheck.rows.length === 0) {
      console.log('➕ Adding tagline column...');
      await client.query('ALTER TABLE startups ADD COLUMN tagline VARCHAR(500)');
    } else {
      console.log('✅ Tagline column already exists');
    }
    
    client.release();
    console.log('✅ Database schema fixed successfully!');
    
  } catch (error) {
    console.error('❌ Failed to fix database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

fixDatabase();
