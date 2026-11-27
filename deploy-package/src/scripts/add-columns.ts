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

const addColumns = async () => {
  console.log('🔧 Adding missing columns to startups table...');
  
  try {
    const client = await pool.connect();
    
    // Add missing columns one by one
    const columns = [
      'ALTER TABLE startups ADD COLUMN IF NOT EXISTS tagline VARCHAR(500)',
      'ALTER TABLE startups ADD COLUMN IF NOT EXISTS founded_date DATE',
      'ALTER TABLE startups ADD COLUMN IF NOT EXISTS status INTEGER DEFAULT 1',
      'ALTER TABLE startups ADD COLUMN IF NOT EXISTS founder_name VARCHAR(255)',
      'ALTER TABLE startups ADD COLUMN IF NOT EXISTS founder_email VARCHAR(255)',
      'ALTER TABLE startups ADD COLUMN IF NOT EXISTS founder_bio TEXT',
      'ALTER TABLE startups ADD COLUMN IF NOT EXISTS team_size VARCHAR(50)',
      'ALTER TABLE startups ADD COLUMN IF NOT EXISTS problem TEXT',
      'ALTER TABLE startups ADD COLUMN IF NOT EXISTS solution TEXT',
      'ALTER TABLE startups ADD COLUMN IF NOT EXISTS target_market TEXT',
      'ALTER TABLE startups ADD COLUMN IF NOT EXISTS business_model TEXT',
      'ALTER TABLE startups ADD COLUMN IF NOT EXISTS revenue VARCHAR(50)',
      'ALTER TABLE startups ADD COLUMN IF NOT EXISTS funding VARCHAR(50)',
      'ALTER TABLE startups ADD COLUMN IF NOT EXISTS website VARCHAR(255)',
      'ALTER TABLE startups ADD COLUMN IF NOT EXISTS email VARCHAR(255)',
      'ALTER TABLE startups ADD COLUMN IF NOT EXISTS twitter VARCHAR(255)',
      'ALTER TABLE startups ADD COLUMN IF NOT EXISTS linkedin VARCHAR(255)',
      'ALTER TABLE startups ADD COLUMN IF NOT EXISTS github VARCHAR(255)',
      'ALTER TABLE startups ADD COLUMN IF NOT EXISTS milestones TEXT',
      'ALTER TABLE startups ADD COLUMN IF NOT EXISTS challenges TEXT',
      'ALTER TABLE startups ADD COLUMN IF NOT EXISTS vision TEXT',
      'ALTER TABLE startups ADD COLUMN IF NOT EXISTS admin_feedback TEXT',
      'ALTER TABLE startups ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP',
      'ALTER TABLE startups ADD COLUMN IF NOT EXISTS reviewed_by VARCHAR(255)'
    ];
    
    for (const column of columns) {
      try {
        await client.query(column);
        console.log(`✅ Added column: ${column.split(' ')[5]}`);
      } catch (error) {
        console.log(`⚠️  Column might already exist: ${column.split(' ')[5]}`);
      }
    }
    
    // Create team_members table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id SERIAL PRIMARY KEY,
        startup_id INTEGER REFERENCES startups(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255),
        bio TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    client.release();
    console.log('✅ Database schema updated successfully!');
    
  } catch (error) {
    console.error('❌ Failed to add columns:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

addColumns();
