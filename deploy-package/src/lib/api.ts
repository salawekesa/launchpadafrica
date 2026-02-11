import pool from './database';

export interface Startup {
  id: number;
  name: string;
  tagline?: string;
  description: string;
  category: 'Web2' | 'Web3';
  stage: string;
  founded_date?: string;
  users: string;
  growth: string;
  status: number;
  
  // Founder information
  founder_name?: string;
  founder_email?: string;
  founder_bio?: string;
  team_size?: string;
  
  // Business details
  problem?: string;
  solution?: string;
  target_market?: string;
  business_model?: string;
  revenue?: string;
  funding?: string;
  
  // Contact information
  website?: string;
  email?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  
  // Additional information
  milestones?: string;
  challenges?: string;
  vision?: string;
  
  // Admin fields
  admin_feedback?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: number;
  startup_id: number;
  name: string;
  role?: string;
  bio?: string;
  created_at: string;
}

export interface LeaderboardEntry {
  id: number;
  startup_id: number;
  rank: number;
  growth_rate: string;
  startup: Startup;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  role: string;
  preferences?: any;
  created_at: string;
  updated_at: string;
}

export interface UserActivity {
  id: number;
  user_id: number;
  startup_id: number;
  activity_type: string;
  activity_data?: any;
  created_at: string;
}

export interface UserInteraction {
  id: number;
  user_id: number;
  startup_id: number;
  interaction_type: string;
  interaction_data?: any;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface StartupSupport {
  id: number;
  startup_id: number;
  support_type: string;
  title: string;
  description?: string;
  requirements?: string;
  contact_info?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Get all startups
export const getStartups = async (): Promise<Startup[]> => {
  try {
    const result = await pool.query('SELECT * FROM startups ORDER BY created_at DESC');
    return result.rows;
  } catch (error) {
    console.error('Error fetching startups:', error);
    throw error;
  }
};

// Get startups by category
export const getStartupsByCategory = async (category: string): Promise<Startup[]> => {
  try {
    const result = await pool.query(
      'SELECT * FROM startups WHERE category = $1 ORDER BY created_at DESC',
      [category]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching startups by category:', error);
    throw error;
  }
};

// Get leaderboard
export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    const result = await pool.query(`
      SELECT 
        l.id,
        l.startup_id,
        l.rank,
        l.growth_rate,
        s.name,
        s.description,
        s.category,
        s.stage,
        s.users,
        s.growth,
        s.created_at,
        s.updated_at
      FROM leaderboard l
      JOIN startups s ON l.startup_id = s.id
      ORDER BY l.rank ASC
    `);
    
    return result.rows.map(row => ({
      id: row.id,
      startup_id: row.startup_id,
      rank: row.rank,
      growth_rate: row.growth_rate,
      startup: {
        id: row.startup_id,
        name: row.name,
        description: row.description,
        category: row.category,
        stage: row.stage,
        users: row.users,
        growth: row.growth,
        status: row.status || 1,
        created_at: row.created_at,
        updated_at: row.updated_at
      }
    }));
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
};

// Add new startup with comprehensive data
export const addStartup = async (startup: Omit<Startup, 'id' | 'created_at' | 'updated_at'>): Promise<Startup> => {
  try {
    // First try with all columns
    try {
      const result = await pool.query(`
        INSERT INTO startups (
          name, tagline, description, category, stage, founded_date, users, growth, status,
          founder_name, founder_email, founder_bio, team_size,
          problem, solution, target_market, business_model, revenue, funding,
          website, email, twitter, linkedin, github,
          milestones, challenges, vision
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
        RETURNING *
      `, [
        startup.name, startup.tagline, startup.description, startup.category, startup.stage, 
        startup.founded_date, startup.users, startup.growth, startup.status || 1,
        startup.founder_name, startup.founder_email, startup.founder_bio, startup.team_size,
        startup.problem, startup.solution, startup.target_market, startup.business_model, 
        startup.revenue, startup.funding, startup.website, startup.email, startup.twitter, 
        startup.linkedin, startup.github, startup.milestones, startup.challenges, startup.vision
      ]);
      
      return result.rows[0];
    } catch (error) {
      // If the comprehensive insert fails, try with basic columns only (without status)
      console.log('Falling back to basic columns...');
      const result = await pool.query(`
        INSERT INTO startups (name, description, category, stage, users, growth)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        startup.name, 
        startup.description, 
        startup.category, 
        startup.stage, 
        startup.users, 
        startup.growth
      ]);
      
      return result.rows[0];
    }
  } catch (error) {
    console.error('Error adding startup:', error);
    throw error;
  }
};

// Add team members for a startup
export const addTeamMembers = async (startupId: number, teamMembers: Omit<TeamMember, 'id' | 'startup_id' | 'created_at'>[]): Promise<TeamMember[]> => {
  try {
    const results: TeamMember[] = [];
    
    for (const member of teamMembers) {
      if (member.name.trim()) { // Only add if name is provided
        const result = await pool.query(`
          INSERT INTO team_members (startup_id, name, role, bio)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `, [startupId, member.name, member.role, member.bio]);
        
        results.push(result.rows[0]);
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error adding team members:', error);
    throw error;
  }
};

// Get team members for a startup
export const getTeamMembers = async (startupId: number): Promise<TeamMember[]> => {
  try {
    const result = await pool.query(
      'SELECT * FROM team_members WHERE startup_id = $1 ORDER BY created_at ASC',
      [startupId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching team members:', error);
    throw error;
  }
};

// Get startups by status
export const getStartupsByStatus = async (status: number): Promise<Startup[]> => {
  try {
    const result = await pool.query(
      'SELECT * FROM startups WHERE status = $1 ORDER BY created_at DESC',
      [status]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching startups by status:', error);
    throw error;
  }
};

// Update startup status (for admin review)
export const updateStartupStatus = async (id: number, status: number, adminFeedback?: string, reviewedBy?: string): Promise<Startup> => {
  try {
    const result = await pool.query(`
      UPDATE startups 
      SET status = $1, admin_feedback = $2, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `, [status, adminFeedback, reviewedBy, id]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating startup status:', error);
    throw error;
  }
};

// User Management Functions
export const getUserById = async (id: number): Promise<User> => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const createUser = async (name: string, email: string, bio?: string): Promise<User> => {
  try {
    const result = await pool.query(`
      INSERT INTO users (name, email, bio) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `, [name, email, bio]);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// User Activity Functions
export const logUserActivity = async (userId: number, startupId: number, activityType: string, activityData?: any): Promise<UserActivity> => {
  try {
    const result = await pool.query(`
      INSERT INTO user_activities (user_id, startup_id, activity_type, activity_data) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `, [userId, startupId, activityType, JSON.stringify(activityData)]);
    return result.rows[0];
  } catch (error) {
    console.error('Error logging user activity:', error);
    throw error;
  }
};

export const getUserActivities = async (userId: number): Promise<UserActivity[]> => {
  try {
    const result = await pool.query(`
      SELECT ua.*, s.name as startup_name, s.category 
      FROM user_activities ua 
      JOIN startups s ON ua.startup_id = s.id 
      WHERE ua.user_id = $1 
      ORDER BY ua.created_at DESC
    `, [userId]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching user activities:', error);
    throw error;
  }
};

// User Interaction Functions
export const createUserInteraction = async (userId: number, startupId: number, interactionType: string, interactionData?: any): Promise<UserInteraction> => {
  try {
    const result = await pool.query(`
      INSERT INTO user_interactions (user_id, startup_id, interaction_type, interaction_data) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `, [userId, startupId, interactionType, JSON.stringify(interactionData)]);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user interaction:', error);
    throw error;
  }
};

export const getUserInteractions = async (userId: number): Promise<UserInteraction[]> => {
  try {
    const result = await pool.query(`
      SELECT ui.*, s.name as startup_name, s.category 
      FROM user_interactions ui 
      JOIN startups s ON ui.startup_id = s.id 
      WHERE ui.user_id = $1 
      ORDER BY ui.created_at DESC
    `, [userId]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching user interactions:', error);
    throw error;
  }
};

export const updateInteractionStatus = async (id: number, status: string): Promise<UserInteraction> => {
  try {
    const result = await pool.query(`
      UPDATE user_interactions 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *
    `, [status, id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating interaction status:', error);
    throw error;
  }
};

// Startup Support Functions
export const getStartupSupport = async (startupId: number): Promise<StartupSupport[]> => {
  try {
    const result = await pool.query(`
      SELECT * FROM startup_support 
      WHERE startup_id = $1 AND is_active = true 
      ORDER BY created_at DESC
    `, [startupId]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching startup support:', error);
    throw error;
  }
};

export const createStartupSupport = async (startupId: number, supportType: string, title: string, description?: string, requirements?: string, contactInfo?: any): Promise<StartupSupport> => {
  try {
    const result = await pool.query(`
      INSERT INTO startup_support (startup_id, support_type, title, description, requirements, contact_info) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *
    `, [startupId, supportType, title, description, requirements, JSON.stringify(contactInfo)]);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating startup support:', error);
    throw error;
  }
};

// Update startup
export const updateStartup = async (id: number, startup: Partial<Startup>): Promise<Startup> => {
  try {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(startup).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(`
      UPDATE startups 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    return result.rows[0];
  } catch (error) {
    console.error('Error updating startup:', error);
    throw error;
  }
};

// Delete startup
export const deleteStartup = async (id: number): Promise<boolean> => {
  try {
    await pool.query('DELETE FROM startups WHERE id = $1', [id]);
    return true;
  } catch (error) {
    console.error('Error deleting startup:', error);
    throw error;
  }
};
