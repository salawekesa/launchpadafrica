import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const createDatabase = async () => {
  console.log('🚀 Creating database...');
  
  // Connect to PostgreSQL without specifying a database
  const adminPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: 'postgres', // Connect to default postgres database
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    const client = await adminPool.connect();
    
    // Check if database exists
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME || 'lift']
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Database "lift" already exists');
    } else {
      // Create the database
      await client.query(`CREATE DATABASE ${process.env.DB_NAME || 'lift'}`);
      console.log('✅ Database "lift" created successfully');
    }
    
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Failed to create database:', error);
    return false;
  } finally {
    await adminPool.end();
  }
};

createDatabase().then((success) => {
  if (success) {
    console.log('🎉 Database setup complete!');
    process.exit(0);
  } else {
    console.error('❌ Database setup failed');
    process.exit(1);
  }
}).catch((error) => {
  console.error('❌ Database setup failed:', error);
  process.exit(1);
});
