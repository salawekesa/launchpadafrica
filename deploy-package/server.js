import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { dbService } from './src/lib/db-service.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Get all startups
app.get('/api/startups', async (req, res) => {
  try {
    const startups = await dbService.getAllStartups();
    res.json(startups);
  } catch (error) {
    console.error('Error fetching startups:', error);
    res.status(500).json({ error: 'Failed to fetch startups' });
  }
});

// Add new startup
app.post('/api/startups', async (req, res) => {
  try {
    const startupData = req.body;
    console.log('New startup submitted:', startupData);
    
    const newStartup = await dbService.createStartup(startupData);
    res.status(201).json(newStartup);
  } catch (error) {
    console.error('Error creating startup:', error);
    res.status(500).json({ error: 'Failed to create startup' });
  }
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const startups = await dbService.getAllStartups();
    // Sort by growth rate and create leaderboard entries
    const leaderboard = startups
      .sort((a, b) => {
        const aGrowth = parseFloat(a.growth?.replace('%', '') || '0');
        const bGrowth = parseFloat(b.growth?.replace('%', '') || '0');
        return bGrowth - aGrowth;
      })
      .map((startup, index) => ({
        id: index + 1,
        startup_id: startup.id,
        rank: index + 1,
        growth_rate: startup.growth || '+0%',
        startup: startup
      }));
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Serve static files from dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React Router - send all other requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 API endpoints available at /api/*`);
});

export default app;

