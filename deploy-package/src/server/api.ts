import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection, initializeDatabase } from '../lib/database';
import { 
  getStartups, 
  getStartupsByCategory, 
  getLeaderboard, 
  addStartup, 
  updateStartup, 
  deleteStartup, 
  addTeamMembers, 
  getTeamMembers, 
  getStartupsByStatus, 
  updateStartupStatus,
  getUserById,
  createUser,
  logUserActivity,
  getUserActivities,
  createUserInteraction,
  getUserInteractions,
  updateInteractionStatus,
  getStartupSupport,
  createStartupSupport
} from '../lib/api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const isConnected = await testConnection();
    res.json({ 
      status: 'ok', 
      database: isConnected ? 'connected' : 'disconnected',
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

// Initialize database endpoint
app.post('/init-db', async (req, res) => {
  try {
    const success = await initializeDatabase();
    if (success) {
      res.json({ message: 'Database initialized successfully' });
    } else {
      res.status(500).json({ message: 'Database initialization failed' });
    }
  } catch (error) {
    res.status(500).json({ 
      message: 'Database initialization failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Startups endpoints
app.get('/api/startups', async (req, res) => {
  try {
    const startups = await getStartups();
    res.json(startups);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch startups',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/api/startups/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const startups = await getStartupsByCategory(category);
    res.json(startups);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch startups by category',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/startups', async (req, res) => {
  try {
    const { teamMembers, ...startupData } = req.body;
    const startup = await addStartup(startupData);
    
    // Add team members if provided
    if (teamMembers && teamMembers.length > 0) {
      await addTeamMembers(startup.id, teamMembers);
    }
    
    res.status(201).json(startup);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to create startup',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.put('/api/startups/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const startup = await updateStartup(parseInt(id), req.body);
    res.json(startup);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to update startup',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.delete('/api/startups/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deleteStartup(parseInt(id));
    res.json({ message: 'Startup deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to delete startup',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Team members endpoints
app.get('/api/startups/:id/team', async (req, res) => {
  try {
    const { id } = req.params;
    const teamMembers = await getTeamMembers(parseInt(id));
    res.json(teamMembers);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch team members',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Status management endpoints
app.get('/api/startups/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const startups = await getStartupsByStatus(parseInt(status));
    res.json(startups);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch startups by status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.put('/api/startups/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminFeedback, reviewedBy } = req.body;
    const startup = await updateStartupStatus(parseInt(id), status, adminFeedback, reviewedBy);
    res.json(startup);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to update startup status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Leaderboard endpoint
app.get('/api/leaderboard', async (req, res) => {
  try {
    const leaderboard = await getLeaderboard();
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch leaderboard',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// User Management endpoints
app.get('/api/user/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await getUserById(userId);
    res.json(user);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/user', async (req, res) => {
  try {
    const { name, email, bio } = req.body;
    const user = await createUser(name, email, bio);
    res.json(user);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to create user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// User Activity endpoints
app.get('/api/user/:id/activities', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const activities = await getUserActivities(userId);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch user activities',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/user/:id/activities', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { startup_id, activity_type, activity_data } = req.body;
    const activity = await logUserActivity(userId, startup_id, activity_type, activity_data);
    res.json(activity);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to log user activity',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// User Interaction endpoints
app.get('/api/user/:id/interactions', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const interactions = await getUserInteractions(userId);
    res.json(interactions);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch user interactions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/user/:id/interactions', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { startup_id, interaction_type, interaction_data } = req.body;
    const interaction = await createUserInteraction(userId, startup_id, interaction_type, interaction_data);
    res.json(interaction);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to create user interaction',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.put('/api/interactions/:id/status', async (req, res) => {
  try {
    const interactionId = parseInt(req.params.id);
    const { status } = req.body;
    const interaction = await updateInteractionStatus(interactionId, status);
    res.json(interaction);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to update interaction status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Startup Support endpoints
app.get('/api/startup/:id/support', async (req, res) => {
  try {
    const startupId = parseInt(req.params.id);
    const support = await getStartupSupport(startupId);
    res.json(support);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch startup support',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/startup/:id/support', async (req, res) => {
  try {
    const startupId = parseInt(req.params.id);
    const { support_type, title, description, requirements, contact_info } = req.body;
    const support = await createStartupSupport(startupId, support_type, title, description, requirements, contact_info);
    res.json(support);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to create startup support',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🗄️  Initialize DB: POST http://localhost:${PORT}/init-db`);
});

export default app;
