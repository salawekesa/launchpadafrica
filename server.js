import http from 'http';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { dbService } from './src/lib/db-service.ts';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Log all errors with full stack
function logError(context, error) {
  const err = error instanceof Error ? error : new Error(String(error));
  console.error(`[${new Date().toISOString()}] ${context}:`, error);
  return err;
}

// API Routes
function positiveId(value) {
  if (typeof value !== 'number' && (typeof value !== 'string' || !/^\d+$/.test(value))) return undefined;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
}

function numericValue(value) {
  return typeof value === 'number' || (typeof value === 'string' && value.trim() !== '') ? Number(value) : NaN;
}

// Health check
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await dbService.getAllStartups();
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development',
      database: 'connected'
    });
  } catch (error) {
    logError('GET /api/health', error);
    res.status(503).json({ 
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: process.env.NODE_ENV === 'production' ? 'Database unavailable' : String(error instanceof Error ? error.message : error)
    });
  }
});

// Get all startups (optional filter: ?created_by=userId for "my startups")
app.get('/api/startups', async (req, res) => {
  try {
    const createdBy = req.query.created_by;
    const userId = positiveId(createdBy);
    if (createdBy !== undefined && userId === undefined) {
      return res.status(400).json({ error: 'created_by must be a positive integer' });
    }
    const startups = await dbService.getAllStartups();
    res.json(userId === undefined ? startups : startups.filter(s => s.created_by === userId));
  } catch (error) {
    const err = logError('GET /api/startups', error);
    const isDev = process.env.NODE_ENV !== 'production';
    res.status(500).json({ 
      error: 'Failed to fetch startups',
      message: isDev ? err.message : undefined,
      ...(isDev && { code: error?.code, detail: error?.detail })
    });
  }
});

// Get startups by category (must be before /:id so "category" is not captured as id)
app.get('/api/startups/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const startups = await dbService.getAllStartups();
    const filtered = startups.filter(s => (s.category || '').toLowerCase() === category.toLowerCase());
    res.json(filtered);
  } catch (error) {
    const err = logError('GET /api/startups/category/:category', error);
    const isDev = process.env.NODE_ENV !== 'production';
    res.status(500).json({
      error: 'Failed to fetch startups',
      message: isDev ? err.message : undefined,
      ...(isDev && { code: error?.code, detail: error?.detail })
    });
  }
});

// Get single startup by ID
app.get('/api/startups/:id', async (req, res) => {
  try {
    const id = positiveId(req.params.id);
    if (id === undefined) return res.status(400).json({ error: 'Invalid startup id' });
    const startups = await dbService.getAllStartups();
    const startup = startups.find(s => s.id === id);
    
    if (!startup) {
      return res.status(404).json({ error: 'Startup not found' });
    }
    
    res.json(startup);
  } catch (error) {
    logError('GET /api/startups/:id', error);
    res.status(500).json({ 
      error: 'Failed to fetch startup',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Add new startup
app.post('/api/startups', async (req, res) => {
  try {
    const startupData = req.body;
    
    // Validate required fields
    if (!startupData.name || !startupData.tagline) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['name', 'tagline']
      });
    }
    
    if (startupData.created_by !== undefined && positiveId(startupData.created_by) === undefined) {
      return res.status(400).json({ error: 'created_by must be a positive integer' });
    }
    console.log('New startup submitted:', startupData.name);
    
    const newStartup = await dbService.createStartup(startupData);
    res.status(201).json(newStartup);
  } catch (error) {
    logError('POST /api/startups', error);
    res.status(500).json({ 
      error: 'Failed to create startup',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
    logError('GET /api/leaderboard', error);
    res.status(500).json({ 
      error: 'Failed to fetch leaderboard',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Auth: get user by email (for login)
app.get('/api/users/by-email', async (req, res) => {
  try {
    const email = req.query.email;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }
    const user = await dbService.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    logError('GET /api/users/by-email', error);
    res.status(500).json({ 
      error: 'Failed to fetch user',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Auth: create user (for signup)
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, bio, role } = req.body ?? {};
    if (![name, email, bio].every(value => typeof value === 'string' && value.trim() !== '')) {
      return res.status(400).json({ error: 'Name, email and bio must be nonempty strings' });
    }
    const user = await dbService.createUser({ name, email, bio, role });
    res.status(201).json(user);
  } catch (error) {
    logError('POST /api/users', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    res.status(500).json({ 
      error: 'Failed to create user',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Auth: update user (wallet, KYC) – in production verify requester is this user
app.patch('/api/users/:id', async (req, res) => {
  try {
    const id = positiveId(req.params.id);
    if (id === undefined) return res.status(400).json({ error: 'Invalid user id' });
    const { wallet_address, verification_level } = req.body;
    const user = await dbService.updateUser(id, { wallet_address, verification_level });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    logError('PATCH /api/users/:id', error);
    res.status(500).json({ 
      error: 'Failed to update user',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Investor: project wallets & investments
app.get('/api/investor/project-wallets', async (req, res) => {
  try {
    const wallets = await dbService.getProjectWallets();
    res.json(wallets);
  } catch (error) {
    logError('GET /api/investor/project-wallets', error);
    res.status(500).json({ error: 'Failed to fetch project wallets' });
  }
});

app.post('/api/investor/invest', async (req, res) => {
  try {
    const { investor_id, entity_type, entity_id, amount, currency } = req.body ?? {};
    if (investor_id == null || entity_type == null || entity_id == null || amount == null) {
      return res.status(400).json({ error: 'investor_id, entity_type, entity_id, and amount are required' });
    }
    const investorId = positiveId(investor_id);
    if (investorId === undefined || (entity_type === 'startup' && positiveId(entity_id) === undefined)) {
      return res.status(400).json({ error: 'Invalid investor or startup id' });
    }
    const investmentAmount = numericValue(amount);
    if (!Number.isFinite(investmentAmount) || investmentAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a finite number greater than zero' });
    }
    const wallet = await dbService.getOrCreateProjectWallet(entity_type, entity_id);
    const investment = await dbService.createInvestment({
      investor_id: investorId,
      project_wallet_id: wallet.id,
      amount: investmentAmount,
      currency: currency || 'ETH',
    });
    res.status(201).json(investment);
  } catch (error) {
    logError('POST /api/investor/invest', error);
    res.status(500).json({ error: 'Failed to record investment' });
  }
});

app.get('/api/investor/my-investments', async (req, res) => {
  try {
    const userId = positiveId(req.query.userId);
    if (userId === undefined) {
      return res.status(400).json({ error: 'userId must be a positive integer' });
    }
    const investments = await dbService.getInvestmentsByInvestor(userId);
    res.json(investments);
  } catch (error) {
    logError('GET /api/investor/my-investments', error);
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
});

// These mounted routes include the exception message alongside their public error message.
app.use(['/api/hackathons', '/api/invitations', '/api/notifications', '/api/community'], (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    const json = res.json.bind(res);
    res.json = (body) => json(res.statusCode >= 500 ? { message: 'Internal server error' } : body);
  }
  next();
});

// Hackathon API (so hackathons save to DB when using server.js)
app.post('/api/hackathons/:id/scores', (req, res, next) => {
  const score = numericValue(req.body?.score);
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    return res.status(400).json({ message: 'Score must be a finite number between 0 and 100' });
  }
  next();
});

function requireUserId(req, res, next) {
  if (positiveId(req.query.userId) === undefined) return res.status(400).json({ message: 'Invalid userId' });
  next();
}
app.get(['/api/invitations/me', '/api/notifications'], requireUserId);
app.put('/api/notifications/read-all', requireUserId);
app.put('/api/notifications/:id/read', requireUserId, (req, res, next) => {
  if (positiveId(req.params.id) === undefined) return res.status(400).json({ message: 'Invalid notification id' });
  next();
});

const { registerHackathonRoutes } = await import('./src/server/hackathon-routes.ts');
registerHackathonRoutes(app);

// Notifications + Community (rooms, messages)
const { registerCommunityRoutes } = await import('./src/server/community-routes.ts');
registerCommunityRoutes(app);

// Upload (hackathon submission attachments)
const uploadFormats = [
  { mime: 'image/png', extensions: ['.png'], signatures: [Buffer.from('89504e470d0a1a0a', 'hex')] },
  { mime: 'image/jpeg', extensions: ['.jpg', '.jpeg'], signatures: [Buffer.from('ffd8ff', 'hex')] },
  { mime: 'image/gif', extensions: ['.gif'], signatures: [Buffer.from('GIF87a'), Buffer.from('GIF89a')] },
  { mime: 'application/pdf', extensions: ['.pdf'], signatures: [Buffer.from('%PDF-')] },
];
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));
app.post('/api/upload', (req, res) => {
  try {
    const { file, filename, mimeType } = req.body ?? {};
    if (typeof file !== 'string' || !file || typeof filename !== 'string' || !filename) {
      return res.status(400).json({ message: 'file and filename required' });
    }
    const extension = path.extname(filename).toLowerCase();
    const format = uploadFormats.find(format => format.extensions.includes(extension));
    const header = /^data:([\w.+-]+\/[\w.+-]+);base64,/i.exec(file);
    if (!format || (header && header[1].toLowerCase() !== format.mime) ||
        (mimeType !== undefined && (typeof mimeType !== 'string' || mimeType.toLowerCase() !== format.mime))) {
      return res.status(400).json({ message: 'Unsupported upload type' });
    }
    // The attachment form also sends raw base64; verify the type against the actual bytes.
    const base64 = file.slice(header?.[0].length ?? 0);
    const buf = Buffer.from(base64, 'base64');
    const canonical = buf.toString('base64');
    if ((canonical !== base64 && canonical.replace(/=+$/, '') !== base64) ||
        !format.signatures.some(prefix => buf.subarray(0, prefix.length).equals(prefix))) {
      return res.status(400).json({ message: 'Invalid upload contents' });
    }
    const safe = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const name = `${Date.now()}-${safe}`;
    const filepath = path.join(uploadsDir, name);
    fs.writeFileSync(filepath, buf);
    const url = `/uploads/${name}`;
    res.json({ url });
  } catch (e) {
    console.error('Upload error:', e);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Serve static files from dist folder
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1d',
  etag: true
}));

// Handle React Router - send all other requests to index.html (Express 5: named splat)
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (res.headersSent) return next(err);
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed request body' });
  }
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// HTTP server (for Socket.io)
const server = http.createServer(app);

// Real-time chat (Socket.io)
const { setupSocketServer } = await import('./src/server/socket-server.ts');
setupSocketServer(server, { corsOrigin: process.env.CORS_ORIGIN });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Ensure user table has wallet_address and verification_level (so wallet save works)
try {
  await dbService.ensureUserColumns();
  console.log('✅ User columns (wallet, KYC) ready');
} catch (e) {
  logError('ensureUserColumns', e);
}

// Start server
server.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 API endpoints available at /api/*`);
  console.log(`💬 Socket.io available at /socket.io`);
  console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN || 'all origins'}`);
  console.log('='.repeat(50));
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  } else {
    console.error('❌ Server error:', err);
  }
  process.exit(1);
});

export default app;

