// API route for direct database operations
import { NextRequest, NextResponse } from 'next/server';
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

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM startups ORDER BY created_at DESC');
    client.release();
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching startups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch startups' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, description, category, stage, users, growth, tagline, founded_date, founder_name, founder_email, founder_bio, team_size, problem, solution, target_market, business_model, revenue, funding, website, email, twitter, linkedin, github, milestones, challenges, vision, teamMembers } = data;
    
    const client = await pool.connect();
    
    // Insert startup
    const result = await client.query(`
      INSERT INTO startups (
        name, description, category, stage, users, growth, tagline, founded_date,
        founder_name, founder_email, founder_bio, team_size, problem, solution,
        target_market, business_model, revenue, funding, website, email, twitter,
        linkedin, github, milestones, challenges, vision, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, 1)
      RETURNING *
    `, [
      name, description, category, stage, users || '0', growth || '+0%', tagline, founded_date,
      founder_name, founder_email, founder_bio, team_size, problem, solution,
      target_market, business_model, revenue, funding, website, email, twitter,
      linkedin, github, milestones, challenges, vision
    ]);
    
    const startup = result.rows[0];
    
    // Insert team members if provided
    if (teamMembers && teamMembers.length > 0) {
      for (const member of teamMembers) {
        if (member.name.trim()) {
          await client.query(`
            INSERT INTO team_members (startup_id, name, role, bio)
            VALUES ($1, $2, $3, $4)
          `, [startup.id, member.name, member.role, member.bio]);
        }
      }
    }
    
    client.release();
    return NextResponse.json(startup, { status: 201 });
  } catch (error) {
    console.error('Error creating startup:', error);
    return NextResponse.json(
      { error: 'Failed to create startup' },
      { status: 500 }
    );
  }
}
