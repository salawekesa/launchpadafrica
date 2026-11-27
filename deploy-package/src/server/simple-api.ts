import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
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

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', async (req, res) => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    res.json({ 
      status: 'ok', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all startups
app.get('/api/startups', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM startups ORDER BY created_at DESC');
    client.release();
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch startups',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Add new startup (basic version)
app.post('/api/startups', async (req, res) => {
  try {
    const { name, description, category, stage, users, growth } = req.body;
    
    const client = await pool.connect();
    const result = await client.query(`
      INSERT INTO startups (name, description, category, stage, users, growth)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [name, description, category, stage, users, growth]);
    
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding startup:', error);
    res.status(500).json({ 
      message: 'Failed to create startup',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
