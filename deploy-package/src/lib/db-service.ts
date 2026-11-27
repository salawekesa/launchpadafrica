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
      
      // Insert startup with all comprehensive data
      const result = await client.query(`
        INSERT INTO startups (
          name, tagline, description, category, stage, founded_date, users, growth, status,
          founder_name, founder_email, founder_bio, team_size,
          problem, solution, target_market, business_model, revenue, funding,
          website, email, twitter, linkedin, github,
          milestones, challenges, vision
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
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
        data.vision || null
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
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM startups ORDER BY created_at DESC');
      client.release();
      return result.rows;
    } catch (error) {
      console.error('Database error:', error);
      throw error;
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
  }
};
