import express from 'express';
import cors from 'cors';
import { dbService } from '../lib/db-service.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString()
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Minimal API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
