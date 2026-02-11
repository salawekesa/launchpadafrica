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

const resetDatabase = async () => {
  console.log('🔄 Resetting database with new schema...');
  
  try {
    const client = await pool.connect();
    
    // Drop existing tables
    console.log('🗑️  Dropping existing tables...');
    await client.query('DROP TABLE IF EXISTS team_members CASCADE');
    await client.query('DROP TABLE IF EXISTS leaderboard CASCADE');
    await client.query('DROP TABLE IF EXISTS startups CASCADE');
    
    // Create startups table with comprehensive fields
    console.log('🏗️  Creating startups table...');
    await client.query(`
      CREATE TABLE startups (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        tagline VARCHAR(500),
        description TEXT,
        category VARCHAR(50) NOT NULL,
        stage VARCHAR(50),
        founded_date DATE,
        users VARCHAR(50),
        growth VARCHAR(50),
        status INTEGER DEFAULT 1,
        
        -- Founder information
        founder_name VARCHAR(255),
        founder_email VARCHAR(255),
        founder_bio TEXT,
        team_size VARCHAR(50),
        
        -- Business details
        problem TEXT,
        solution TEXT,
        target_market TEXT,
        business_model TEXT,
        revenue VARCHAR(50),
        funding VARCHAR(50),
        
        -- Contact information
        website VARCHAR(255),
        email VARCHAR(255),
        twitter VARCHAR(255),
        linkedin VARCHAR(255),
        github VARCHAR(255),
        
        -- Additional information
        milestones TEXT,
        challenges TEXT,
        vision TEXT,
        
        -- Admin fields
        admin_feedback TEXT,
        reviewed_at TIMESTAMP,
        reviewed_by VARCHAR(255),
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create team members table
    console.log('👥 Creating team_members table...');
    await client.query(`
      CREATE TABLE team_members (
        id SERIAL PRIMARY KEY,
        startup_id INTEGER REFERENCES startups(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255),
        bio TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create leaderboard table
    console.log('🏆 Creating leaderboard table...');
    await client.query(`
      CREATE TABLE leaderboard (
        id SERIAL PRIMARY KEY,
        startup_id INTEGER REFERENCES startups(id),
        rank INTEGER NOT NULL,
        growth_rate VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert sample data
    console.log('📊 Inserting sample data...');
    await client.query(`
      INSERT INTO startups (name, description, category, stage, users, growth, status) VALUES
      ('NexTech Solutions', 'Revolutionary AI-powered analytics platform for enterprise blockchain integration and data insights.', 'Web3', 'Series A', '50K+', '+245%', 2),
      ('CloudFlow Analytics', 'Real-time cloud infrastructure monitoring and optimization platform for modern development teams.', 'Web2', 'Seed', '25K+', '+198%', 2),
      ('ChainVault Finance', 'Decentralized finance protocol enabling secure cross-chain asset management and yield optimization.', 'Web3', 'Pre-Seed', '15K+', '+176%', 2),
      ('DataStream Pro', 'Advanced data pipeline automation and ETL platform for enterprise data warehousing solutions.', 'Web2', 'Series A', '40K+', '+142%', 2),
      ('MetaSpace Labs', 'Building the next generation of immersive Web3 experiences and virtual collaboration spaces.', 'Web3', 'Seed', '30K+', '+128%', 2),
      ('SecureAuth Hub', 'Enterprise-grade authentication and identity management solution with zero-trust architecture.', 'Web2', 'Series B', '100K+', '+95%', 2)
    `);

    await client.query(`
      INSERT INTO leaderboard (startup_id, rank, growth_rate) VALUES
      (1, 1, '+245%'),
      (2, 2, '+198%'),
      (3, 3, '+176%'),
      (4, 4, '+142%'),
      (5, 5, '+128%')
    `);
    
    client.release();
    console.log('✅ Database reset successfully!');
    console.log('📊 Status codes:');
    console.log('   1 = Pending (default for new submissions)');
    console.log('   2 = Approved');
    console.log('   3 = Under Review');
    console.log('   4 = Rejected');
    
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

resetDatabase();
