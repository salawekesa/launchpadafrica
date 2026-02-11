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
import {
  dbGetHackathonsList,
  dbGetHackathonFull,
  dbGetHackathonById,
  dbCreateHackathon,
  dbUpdateHackathon,
  dbCreateAwards,
  dbCreateCriteria,
  dbCreateInvitation,
  dbCreateParticipant,
  dbGetParticipantByHackathonAndUser,
  dbUpdateParticipant,
  dbCreateJudge,
  dbAssignAwardWinner,
  dbUpsertScore,
  dbGetScoreboard,
  dbFinalizeWinners,
} from '../lib/hackathon-db';
import { createNotification } from '../lib/notifications-db';
import { dbService } from '../lib/db-service';

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

// ---------- Hackathon module ----------
app.get('/api/hackathons', async (req, res) => {
  try {
    const list = await dbGetHackathonsList();
    res.json(list);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch hackathons',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.get('/api/hackathons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const full = await dbGetHackathonFull(id);
    if (!full) {
      res.status(404).json({ message: 'Hackathon not found' });
      return;
    }
    res.json(full);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch hackathon',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.post('/api/hackathons', async (req, res) => {
  try {
    const { name, description, startDate, endDate, location, hostId, sponsors, awards, criteria, image, totalPrize, techStack, level, eventType, recommended } = req.body;
    const row = await dbCreateHackathon({
      name,
      description,
      start_date: startDate,
      end_date: endDate,
      location: location || '',
      host_id: hostId,
      sponsors: sponsors || [],
      status: 'draft',
      image,
      total_prize: totalPrize,
      tech_stack: techStack,
      level,
      event_type: eventType,
      recommended,
    });
    const id = row.id;
    if (awards && awards.length > 0) {
      await dbCreateAwards(
        id,
        awards.map((a: { name: string; description?: string; rank: number; prize: string }) => ({
          name: a.name,
          description: a.description,
          rank: a.rank,
          prize: a.prize,
        }))
      );
    }
    if (criteria && criteria.length > 0) {
      await dbCreateCriteria(
        id,
        criteria.map((c: { name: string; description?: string; weight: number; order?: number }, i: number) => ({
          name: c.name,
          description: c.description,
          weight: c.weight,
          order: c.order ?? i,
        }))
      );
    }
    const full = await dbGetHackathonFull(id);
    res.status(201).json(full);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create hackathon',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.put('/api/hackathons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, startDate, endDate, location, sponsors, status, image, totalPrize, techStack, level, eventType, recommended } = req.body;
    const patch: Record<string, unknown> = {};
    if (name !== undefined) patch.name = name;
    if (description !== undefined) patch.description = description;
    if (startDate !== undefined) patch.start_date = startDate;
    if (endDate !== undefined) patch.end_date = endDate;
    if (location !== undefined) patch.location = location;
    if (sponsors !== undefined) patch.sponsors = sponsors;
    if (status !== undefined) patch.status = status;
    if (image !== undefined) patch.image = image;
    if (totalPrize !== undefined) patch.total_prize = totalPrize;
    if (techStack !== undefined) patch.tech_stack = techStack;
    if (level !== undefined) patch.level = level;
    if (eventType !== undefined) patch.event_type = eventType;
    if (recommended !== undefined) patch.recommended = recommended;
    const updated = await dbUpdateHackathon(id, patch as Parameters<typeof dbUpdateHackathon>[1]);
    if (!updated) {
      res.status(404).json({ message: 'Hackathon not found' });
      return;
    }
    const full = await dbGetHackathonFull(id);
    res.json(full);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update hackathon',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.post('/api/hackathons/:id/invitations', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, userId, role, invitedBy } = req.body;
    const inv = await dbCreateInvitation({
      hackathon_id: id,
      email: email || '',
      user_id: userId,
      role: role || 'participant',
      invited_by: invitedBy || '',
    });
    // In-app notification: if invitee has a user account (by email), create a notification
    const emailTrim = (email || '').trim().toLowerCase();
    if (emailTrim) {
      try {
        const user = await dbService.getUserByEmail(emailTrim);
        if (user?.id) {
          const hackathon = await dbGetHackathonById(id);
          const hackathonName = hackathon?.name || 'a hackathon';
          await createNotification({
            user_id: user.id,
            type: 'hackathon_invite',
            title: 'Hackathon invite',
            body: `You were invited to "${hackathonName}" as ${role || 'participant'}.`,
            link: `/hackathon/${id}`,
            data: { invitationId: inv.id, hackathonId: id },
          });
        }
      } catch (_) {
        // ignore notification errors
      }
    }
    res.status(201).json({
      id: inv.id,
      hackathonId: inv.hackathon_id,
      email: inv.email,
      userId: inv.user_id ?? undefined,
      role: inv.role,
      status: inv.status,
      invitedAt: inv.invited_at,
      respondedAt: inv.responded_at ?? undefined,
      invitedBy: inv.invited_by,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create invitation',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.get('/api/hackathons/:id/participants/me', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId as string;
    if (!userId) {
      res.status(400).json({ message: 'userId query required' });
      return;
    }
    const p = await dbGetParticipantByHackathonAndUser(id, userId);
    if (!p) {
      res.status(404).json({ message: 'Not registered' });
      return;
    }
    res.json({
      id: p.id,
      hackathonId: p.hackathon_id,
      userId: p.user_id,
      projectId: p.project_id ?? undefined,
      projectName: p.project_name ?? undefined,
      teamName: p.team_name ?? undefined,
      status: p.status,
      invitedVia: p.invited_via ?? undefined,
      registeredAt: p.registered_at,
      submittedAt: p.submitted_at ?? undefined,
      pitchText: p.pitch_text ?? undefined,
      repoUrl: p.repo_url ?? undefined,
      demoUrl: p.demo_url ?? undefined,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to get participation',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.post('/api/hackathons/:id/participants', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, projectId, projectName, teamName, invitationId, pitchText, repoUrl, demoUrl } = req.body;
    const p = await dbCreateParticipant({
      hackathon_id: id,
      user_id: userId,
      project_id: projectId,
      project_name: projectName,
      team_name: teamName,
      invited_via: invitationId,
      pitch_text: pitchText,
      repo_url: repoUrl,
      demo_url: demoUrl,
    });
    res.status(201).json({
      id: p.id,
      hackathonId: p.hackathon_id,
      userId: p.user_id,
      projectId: p.project_id ?? undefined,
      projectName: p.project_name ?? undefined,
      teamName: p.team_name ?? undefined,
      status: p.status,
      invitedVia: p.invited_via ?? undefined,
      registeredAt: p.registered_at,
      submittedAt: p.submitted_at ?? undefined,
      pitchText: p.pitch_text ?? undefined,
      repoUrl: p.repo_url ?? undefined,
      demoUrl: p.demo_url ?? undefined,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create participant',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.put('/api/hackathons/:id/participants/:participantId', async (req, res) => {
  try {
    const { participantId } = req.params;
    const { projectId, projectName, teamName, pitchText, repoUrl, demoUrl } = req.body;
    const p = await dbUpdateParticipant(participantId, {
      project_id: projectId,
      project_name: projectName,
      team_name: teamName,
      pitch_text: pitchText,
      repo_url: repoUrl,
      demo_url: demoUrl,
    });
    if (!p) {
      res.status(404).json({ message: 'Participant not found' });
      return;
    }
    res.json({
      id: p.id,
      hackathonId: p.hackathon_id,
      userId: p.user_id,
      projectId: p.project_id ?? undefined,
      projectName: p.project_name ?? undefined,
      teamName: p.team_name ?? undefined,
      status: p.status,
      submittedAt: p.submitted_at ?? undefined,
      pitchText: p.pitch_text ?? undefined,
      repoUrl: p.repo_url ?? undefined,
      demoUrl: p.demo_url ?? undefined,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update participant',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.post('/api/hackathons/:id/judges', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, name, email, avatar } = req.body;
    const j = await dbCreateJudge({
      hackathon_id: id,
      user_id: userId,
      name: name || '',
      email: email || '',
      avatar,
    });
    res.status(201).json({
      id: j.id,
      hackathonId: j.hackathon_id,
      userId: j.user_id,
      name: j.name,
      email: j.email,
      avatar: j.avatar ?? undefined,
      invitedAt: j.invited_at,
      acceptedAt: j.accepted_at ?? undefined,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create judge',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.put('/api/hackathons/:id/awards/:awardId/winner', async (req, res) => {
  try {
    const { id, awardId } = req.params;
    const { projectId, projectName } = req.body;
    const ok = await dbAssignAwardWinner(awardId, projectId, projectName);
    if (!ok) {
      res.status(404).json({ message: 'Award not found' });
      return;
    }
    const full = await dbGetHackathonFull(id);
    res.json(full);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to assign award winner',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.post('/api/hackathons/:id/scores', async (req, res) => {
  try {
    const { id } = req.params;
    const { projectId, judgeId, criterionId, score, feedback } = req.body;
    const s = await dbUpsertScore({
      hackathon_id: id,
      project_id: projectId,
      judge_id: judgeId,
      criterion_id: criterionId,
      score: Number(score),
      feedback,
    });
    res.status(201).json({
      id: s.id,
      hackathonId: s.hackathon_id,
      projectId: s.project_id,
      judgeId: s.judge_id,
      criterionId: s.criterion_id ?? undefined,
      score: s.score,
      feedback: s.feedback ?? undefined,
      submittedAt: s.submitted_at,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to submit score',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.get('/api/hackathons/:id/scoreboard', async (req, res) => {
  try {
    const { id } = req.params;
    const scoreboard = await dbGetScoreboard(id);
    res.json(scoreboard);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch scoreboard',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.post('/api/hackathons/:id/finalize-winners', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await dbFinalizeWinners(id);
    const full = await dbGetHackathonFull(id);
    res.json({ ...result, hackathon: full });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to finalize winners',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Only listen when run directly (e.g. tsx src/server/api.ts); when imported by server.js, do not listen
const isMain = process.argv[1]?.endsWith('api.ts') || process.argv[1]?.endsWith('api.js');
if (isMain) {
  app.listen(PORT, () => {
    console.log(`🚀 API server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🗄️  Initialize DB: POST http://localhost:${PORT}/init-db`);
  });
}

export default app;
