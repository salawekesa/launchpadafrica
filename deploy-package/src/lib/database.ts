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

// Test database connection
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

// Initialize database tables
export const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    
    // Create startups table with comprehensive fields
    await client.query(`
      CREATE TABLE IF NOT EXISTS startups (
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

    // Create leaderboard table
    await client.query(`
      CREATE TABLE IF NOT EXISTS leaderboard (
        id SERIAL PRIMARY KEY,
        startup_id INTEGER REFERENCES startups(id),
        rank INTEGER NOT NULL,
        growth_rate VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create users table for user management
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        avatar_url VARCHAR(500),
        bio TEXT,
        role VARCHAR(50) DEFAULT 'user',
        preferences JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user activities table for tracking user interactions
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_activities (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        startup_id INTEGER REFERENCES startups(id) ON DELETE CASCADE,
        activity_type VARCHAR(50) NOT NULL,
        activity_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user interactions table for support features
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_interactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        startup_id INTEGER REFERENCES startups(id) ON DELETE CASCADE,
        interaction_type VARCHAR(50) NOT NULL,
        interaction_data JSONB,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create startup support features table
    await client.query(`
      CREATE TABLE IF NOT EXISTS startup_support (
        id SERIAL PRIMARY KEY,
        startup_id INTEGER REFERENCES startups(id) ON DELETE CASCADE,
        support_type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        requirements TEXT,
        contact_info JSONB,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert sample data if tables are empty
    const startupCount = await client.query('SELECT COUNT(*) FROM startups');
    if (parseInt(startupCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO startups (name, description, category, stage, users, growth) VALUES
        ('NexTech Solutions', 'Revolutionary AI-powered analytics platform for enterprise blockchain integration and data insights.', 'Web3', 'Series A', '50K+', '+245%'),
        ('CloudFlow Analytics', 'Real-time cloud infrastructure monitoring and optimization platform for modern development teams.', 'Web2', 'Seed', '25K+', '+198%'),
        ('ChainVault Finance', 'Decentralized finance protocol enabling secure cross-chain asset management and yield optimization.', 'Web3', 'Pre-Seed', '15K+', '+176%'),
        ('DataStream Pro', 'Advanced data pipeline automation and ETL platform for enterprise data warehousing solutions.', 'Web2', 'Series A', '40K+', '+142%'),
        ('MetaSpace Labs', 'Building the next generation of immersive Web3 experiences and virtual collaboration spaces.', 'Web3', 'Seed', '30K+', '+128%'),
        ('SecureAuth Hub', 'Enterprise-grade authentication and identity management solution with zero-trust architecture.', 'Web2', 'Series B', '100K+', '+95%')
      `);

      await client.query(`
        INSERT INTO leaderboard (startup_id, rank, growth_rate) VALUES
        (1, 1, '+245%'),
        (2, 2, '+198%'),
        (3, 3, '+176%'),
        (4, 4, '+142%'),
        (5, 5, '+128%')
      `);

      // Insert sample user
      await client.query(`
        INSERT INTO users (name, email, bio, role) VALUES
        ('John Doe', 'john@example.com', 'Passionate entrepreneur and startup enthusiast', 'user')
      `);

      // Insert sample support features for startups
      await client.query(`
        INSERT INTO startup_support (startup_id, support_type, title, description, requirements, contact_info) VALUES
        (1, 'investment', 'Investment Opportunity', 'We are seeking Series A funding to scale our AI platform globally', 'Minimum investment: $50K, Accredited investors only', '{"email": "invest@nextech.com", "phone": "+1-555-0123"}'),
        (1, 'hiring', 'Join Our Team', 'Looking for talented developers and data scientists', '3+ years experience in AI/ML, Python, React', '{"email": "careers@nextech.com", "website": "nextech.com/careers"}'),
        (1, 'mentorship', 'Seeking Mentorship', 'Need guidance on scaling and market expansion', 'Experience in B2B SaaS, international expansion', '{"email": "mentor@nextech.com", "linkedin": "linkedin.com/company/nextech"}'),
        (1, 'partnership', 'Strategic Partnership', 'Open to partnerships with enterprise clients', 'Enterprise clients, complementary technology', '{"email": "partnerships@nextech.com", "website": "nextech.com/partners"}')
      `);
    }

    client.release();
    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
};

export default pool;
