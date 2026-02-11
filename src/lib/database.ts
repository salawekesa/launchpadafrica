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

/** Add user columns for KYC and wallet (no-op if column exists) */
async function runUserMigrations(client: { query: (q: string) => Promise<unknown> }) {
  const userCols = [
    { name: 'verification_level', def: "VARCHAR(20) DEFAULT 'unverified'" },
    { name: 'wallet_address', def: 'VARCHAR(255)' },
  ];
  for (const c of userCols) {
    try {
      await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ${c.name} ${c.def}`);
    } catch {
      // ignore
    }
  }
}

/** Add new hackathon/participant columns to existing DBs (no-op if column exists) */
async function runHackathonMigrations(client: { query: (q: string) => Promise<unknown> }) {
  const hackathonCols = [
    { name: 'image', def: 'TEXT' },
    { name: 'total_prize', def: 'VARCHAR(100)' },
    { name: 'tech_stack', def: 'JSONB DEFAULT \'[]\'' },
    { name: 'level', def: 'VARCHAR(50)' },
    { name: 'event_type', def: 'VARCHAR(20)' },
    { name: 'recommended', def: 'BOOLEAN DEFAULT false' },
  ];
  const participantCols = [
    { name: 'pitch_text', def: 'TEXT' },
    { name: 'repo_url', def: 'VARCHAR(500)' },
    { name: 'demo_url', def: 'VARCHAR(500)' },
    { name: 'attachment_url', def: 'VARCHAR(500)' },
  ];
  for (const c of hackathonCols) {
    try {
      await client.query(`ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS ${c.name} ${c.def}`);
    } catch {
      // ignore duplicate column
    }
  }
  for (const c of participantCols) {
    try {
      await client.query(`ALTER TABLE hackathon_participants ADD COLUMN IF NOT EXISTS ${c.name} ${c.def}`);
    } catch {
      // ignore
    }
  }
}

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

    // ----- Hackathon module tables -----
    await client.query(`
      CREATE TABLE IF NOT EXISTS hackathons (
        id TEXT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        location VARCHAR(255),
        host_id TEXT NOT NULL,
        sponsors JSONB DEFAULT '[]',
        status VARCHAR(50) DEFAULT 'draft',
        participants_count INTEGER DEFAULT 0,
        image TEXT,
        total_prize VARCHAR(100),
        tech_stack JSONB DEFAULT '[]',
        level VARCHAR(50),
        event_type VARCHAR(20),
        recommended BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS hackathon_winners (
        id TEXT PRIMARY KEY,
        hackathon_id TEXT NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
        project_id TEXT,
        project_name VARCHAR(255),
        prize VARCHAR(255),
        rank INTEGER NOT NULL,
        advanced_to_launch_pad BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS hackathon_invitations (
        id TEXT PRIMARY KEY,
        hackathon_id TEXT NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        user_id TEXT,
        role VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        responded_at TIMESTAMP,
        invited_by TEXT NOT NULL
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS hackathon_participants (
        id TEXT PRIMARY KEY,
        hackathon_id TEXT NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL,
        project_id TEXT,
        project_name VARCHAR(255),
        team_name VARCHAR(255),
        status VARCHAR(50) DEFAULT 'registered',
        invited_via TEXT,
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        submitted_at TIMESTAMP,
        pitch_text TEXT,
        repo_url VARCHAR(500),
        demo_url VARCHAR(500)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS hackathon_judges (
        id TEXT PRIMARY KEY,
        hackathon_id TEXT NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        avatar VARCHAR(500),
        invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        accepted_at TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS hackathon_awards (
        id TEXT PRIMARY KEY,
        hackathon_id TEXT NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        rank INTEGER NOT NULL,
        prize VARCHAR(255),
        project_id TEXT,
        project_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS hackathon_criteria (
        id TEXT PRIMARY KEY,
        hackathon_id TEXT NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        weight INTEGER NOT NULL DEFAULT 25,
        "order" INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS hackathon_scores (
        id TEXT PRIMARY KEY,
        hackathon_id TEXT NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
        project_id TEXT NOT NULL,
        judge_id TEXT NOT NULL,
        criterion_id TEXT,
        score NUMERIC(5,2) NOT NULL,
        feedback TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await runHackathonMigrations(client);
    await runUserMigrations(client);

    // Notifications (in-app; created e.g. when hackathon invite is sent)
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        body TEXT,
        link VARCHAR(500),
        data JSONB,
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS data JSONB`);

    // Community: rooms (hackathon room, public, forum)
    await client.query(`
      CREATE TABLE IF NOT EXISTS community_rooms (
        id TEXT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        description TEXT,
        hackathon_id TEXT,
        created_by TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS community_room_members (
        id SERIAL PRIMARY KEY,
        room_id TEXT NOT NULL REFERENCES community_rooms(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL,
        role VARCHAR(50) DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(room_id, user_id)
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS community_messages (
        id TEXT PRIMARY KEY,
        room_id TEXT NOT NULL REFERENCES community_rooms(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL,
        user_name VARCHAR(255),
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Investor module: project wallets (where donated/invested funds go)
    await client.query(`
      CREATE TABLE IF NOT EXISTS project_wallets (
        id SERIAL PRIMARY KEY,
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(255) NOT NULL,
        wallet_address VARCHAR(255) NOT NULL,
        network VARCHAR(50) DEFAULT 'ethereum',
        balance_raw VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(entity_type, entity_id)
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS investments (
        id SERIAL PRIMARY KEY,
        investor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        project_wallet_id INTEGER NOT NULL REFERENCES project_wallets(id) ON DELETE CASCADE,
        amount NUMERIC(20, 8) NOT NULL,
        currency VARCHAR(20) DEFAULT 'ETH',
        tx_hash VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed default public/forum rooms if none exist
    const roomCount = await client.query('SELECT COUNT(*) AS c FROM community_rooms');
    if (parseInt(roomCount.rows[0]?.c ?? '0', 10) === 0) {
      const id1 = `room-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const id2 = `room-${Date.now() + 1}-${Math.random().toString(36).slice(2, 9)}`;
      await client.query(
        `INSERT INTO community_rooms (id, name, type, description) VALUES ($1, $2, $3, $4), ($5, $6, $7, $8)`,
        [
          id1,
          'General',
          'public',
          'General chat for builders and the community',
          id2,
          'Investors & Builders',
          'forum',
          'Connect with investors and builders',
        ]
      );
    }

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
