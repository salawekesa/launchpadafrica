import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'lift',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

const checkSchema = async () => {
  try {
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'startups' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Current startups table columns:');
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.column_name} (${row.data_type}) - ${row.is_nullable === 'YES' ? 'nullable' : 'not null'}`);
    });
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('Error checking schema:', error);
    await pool.end();
  }
};

checkSchema();
