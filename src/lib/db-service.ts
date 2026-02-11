// Direct database service for frontend
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

export interface StartupData {
  name: string;
  description: string;
  category: 'Web2' | 'Web3';
  stage: string;
  users?: string;
  growth?: string;
  tagline?: string;
  founded_date?: string;
  founder_name?: string;
  founder_email?: string;
  founder_bio?: string;
  team_size?: string;
  problem?: string;
  solution?: string;
  target_market?: string;
  business_model?: string;
  revenue?: string;
  funding?: string;
  website?: string;
  email?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  milestones?: string;
  challenges?: string;
  vision?: string;
  created_by?: number;
  teamMembers?: Array<{
    name: string;
    role?: string;
    bio?: string;
  }>;
}

export const dbService = {
  async createStartup(data: StartupData) {
    try {
      const client = await pool.connect();
      
      // Insert startup with all comprehensive data (created_by = logged-in builder)
      const result = await client.query(`
        INSERT INTO startups (
          name, tagline, description, category, stage, founded_date, users, growth, status,
          founder_name, founder_email, founder_bio, team_size,
          problem, solution, target_market, business_model, revenue, funding,
          website, email, twitter, linkedin, github,
          milestones, challenges, vision, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
        RETURNING *
      `, [
        data.name || null,
        data.tagline || null,
        data.description || null,
        data.category || null,
        data.stage || null,
        data.founded_date || null,
        data.users || '0',
        data.growth || '+0%',
        1, // status: pending
        data.founder_name || null,
        data.founder_email || null,
        data.founder_bio || null,
        data.team_size || null,
        data.problem || null,
        data.solution || null,
        data.target_market || null,
        data.business_model || null,
        data.revenue || null,
        data.funding || null,
        data.website || null,
        data.email || null,
        data.twitter || null,
        data.linkedin || null,
        data.github || null,
        data.milestones || null,
        data.challenges || null,
        data.vision || null,
        data.created_by ?? null
      ]);
      
      const startup = result.rows[0];
      
      // Insert team members if provided
      if (data.teamMembers && data.teamMembers.length > 0) {
        for (const member of data.teamMembers) {
          if (member.name.trim()) {
            await client.query(`
              INSERT INTO team_members (startup_id, name, role, bio)
              VALUES ($1, $2, $3, $4)
            `, [startup.id, member.name, member.role, member.bio]);
          }
        }
      }
      
      client.release();
      return startup;
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  },
  
  async getAllStartups() {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM startups ORDER BY created_at DESC');
      return result.rows;
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    } finally {
      client.release();
    }
  },
  
  async getStartupById(id: number) {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM startups WHERE id = $1', [id]);
      client.release();
      return result.rows[0];
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  },

  async getUserById(id: number) {
    try {
      const client = await pool.connect();
      const result = await client.query(
        'SELECT id, name, email, avatar_url, bio, role, created_at, updated_at, verification_level, wallet_address FROM users WHERE id = $1',
        [id]
      );
      client.release();
      return result.rows[0] ?? null;
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  },

  async getUserByEmail(email: string) {
    try {
      const client = await pool.connect();
      const result = await client.query(
        'SELECT id, name, email, avatar_url, bio, role, created_at, updated_at, verification_level, wallet_address FROM users WHERE LOWER(email) = LOWER($1)',
        [email]
      );
      client.release();
      return result.rows[0] ?? null;
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  },

  async updateUser(id: number, data: { verification_level?: string; wallet_address?: string | null }) {
    try {
      const client = await pool.connect();
      const updates: string[] = [];
      const values: unknown[] = [];
      let i = 1;
      if (data.verification_level !== undefined) {
        updates.push(`verification_level = $${i++}`);
        values.push(data.verification_level);
      }
      if (data.wallet_address !== undefined) {
        updates.push(`wallet_address = $${i++}`);
        values.push(data.wallet_address);
      }
      if (updates.length === 0) {
        client.release();
        return (await this.getUserById(id)) ?? null;
      }
      values.push(id);
      const result = await client.query(
        `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${i} RETURNING id, name, email, avatar_url, bio, role, created_at, updated_at, verification_level, wallet_address`,
        values
      );
      client.release();
      return result.rows[0] ?? null;
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  },

  async createUser(data: { name: string; email: string; bio?: string; role?: string }) {
    try {
      const client = await pool.connect();
      const result = await client.query(
        `INSERT INTO users (name, email, bio, role)
         VALUES ($1, $2, $3, COALESCE($4, 'user'))
         RETURNING id, name, email, avatar_url, bio, role, created_at, updated_at, verification_level, wallet_address`,
        [data.name, data.email, data.bio ?? null, data.role ?? 'user']
      );
      client.release();
      return result.rows[0];
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  },

  // Project wallets (where invested/donated funds go)
  async getProjectWallets() {
    try {
      const client = await pool.connect();
      const result = await client.query(
        'SELECT id, entity_type, entity_id, wallet_address, network, balance_raw, created_at FROM project_wallets ORDER BY created_at DESC'
      );
      client.release();
      return result.rows;
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  },

  async getOrCreateProjectWallet(entityType: string, entityId: string) {
    try {
      const client = await pool.connect();
      let row = await client.query(
        'SELECT id, entity_type, entity_id, wallet_address, network FROM project_wallets WHERE entity_type = $1 AND entity_id = $2',
        [entityType, entityId]
      );
      if (row.rows.length > 0) {
        client.release();
        return row.rows[0];
      }
      const walletAddress = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      const insert = await client.query(
        `INSERT INTO project_wallets (entity_type, entity_id, wallet_address, network)
         VALUES ($1, $2, $3, 'ethereum')
         RETURNING id, entity_type, entity_id, wallet_address, network`,
        [entityType, entityId, walletAddress]
      );
      client.release();
      return insert.rows[0];
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  },

  async createInvestment(data: {
    investor_id: number;
    project_wallet_id: number;
    amount: number;
    currency?: string;
    tx_hash?: string;
    status?: string;
  }) {
    try {
      const client = await pool.connect();
      const result = await client.query(
        `INSERT INTO investments (investor_id, project_wallet_id, amount, currency, tx_hash, status)
         VALUES ($1, $2, $3, COALESCE($4, 'ETH'), $5, COALESCE($6, 'confirmed')) RETURNING *`,
        [
          data.investor_id,
          data.project_wallet_id,
          data.amount,
          data.currency ?? 'ETH',
          data.tx_hash ?? null,
          data.status ?? 'confirmed',
        ]
      );
      client.release();
      return result.rows[0];
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  },

  async getInvestmentsByInvestor(userId: number) {
    try {
      const client = await pool.connect();
      const result = await client.query(
        'SELECT id, investor_id, project_wallet_id, amount, currency, tx_hash, status, created_at FROM investments WHERE investor_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      client.release();
      return result.rows;
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  },

  /** Ensure users table has verification_level and wallet_address (run on server startup) */
  async ensureUserColumns() {
    const client = await pool.connect();
    try {
      await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_level VARCHAR(20) DEFAULT 'unverified'`);
      await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(255)`);
    } finally {
      client.release();
    }
  },
};
