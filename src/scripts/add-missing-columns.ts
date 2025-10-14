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

const addMissingColumns = async () => {
  console.log('🔧 Adding missing columns to startups table...');
  
  try {
    const client = await pool.connect();
    
    // List of columns that should exist based on the database schema
    const columnsToAdd = [
      { name: 'tagline', type: 'VARCHAR(500)' },
      { name: 'founded_date', type: 'DATE' },
      { name: 'status', type: 'INTEGER DEFAULT 1' },
      { name: 'founder_name', type: 'VARCHAR(255)' },
      { name: 'founder_email', type: 'VARCHAR(255)' },
      { name: 'founder_bio', type: 'TEXT' },
      { name: 'team_size', type: 'VARCHAR(50)' },
      { name: 'problem', type: 'TEXT' },
      { name: 'solution', type: 'TEXT' },
      { name: 'target_market', type: 'TEXT' },
      { name: 'business_model', type: 'TEXT' },
      { name: 'revenue', type: 'VARCHAR(50)' },
      { name: 'funding', type: 'VARCHAR(50)' },
      { name: 'website', type: 'VARCHAR(255)' },
      { name: 'email', type: 'VARCHAR(255)' },
      { name: 'twitter', type: 'VARCHAR(255)' },
      { name: 'linkedin', type: 'VARCHAR(255)' },
      { name: 'github', type: 'VARCHAR(255)' },
      { name: 'milestones', type: 'TEXT' },
      { name: 'challenges', type: 'TEXT' },
      { name: 'vision', type: 'TEXT' },
      { name: 'admin_feedback', type: 'TEXT' },
      { name: 'reviewed_at', type: 'TIMESTAMP' },
      { name: 'reviewed_by', type: 'VARCHAR(255)' },
      { name: 'updated_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ];
    
    // Check which columns already exist
    const existingColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'startups' 
      AND table_schema = 'public'
    `);
    
    const existingColumnNames = existingColumns.rows.map(row => row.column_name);
    console.log('📋 Existing columns:', existingColumnNames);
    
    // Add missing columns
    for (const column of columnsToAdd) {
      if (!existingColumnNames.includes(column.name)) {
        try {
          await client.query(`ALTER TABLE startups ADD COLUMN ${column.name} ${column.type}`);
          console.log(`✅ Added column: ${column.name}`);
        } catch (error) {
          console.log(`⚠️  Column ${column.name} might already exist or error occurred:`, error.message);
        }
      } else {
        console.log(`ℹ️  Column ${column.name} already exists`);
      }
    }
    
    client.release();
    console.log('✅ Database schema update complete!');
    return true;
  } catch (error) {
    console.error('❌ Error updating database schema:', error);
    return false;
  } finally {
    await pool.end();
  }
};

addMissingColumns().then((success) => {
  if (success) {
    console.log('🎉 Database schema update successful!');
    process.exit(0);
  } else {
    console.error('❌ Database schema update failed');
    process.exit(1);
  }
}).catch((error) => {
  console.error('❌ Database schema update failed:', error);
  process.exit(1);
});
