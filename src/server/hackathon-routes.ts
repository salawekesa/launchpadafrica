/**
 * Hackathon API routes for server.js (main server).
 * Mount these so POST /api/hackathons etc. work when using server.js.
 */
import type { Express } from 'express';
import {
  dbCreateHackathon,
  dbGetHackathonById,
  dbGetHackathonFull,
  dbGetHackathonsList,
  dbUpdateHackathon,
  dbCreateAwards,
  dbCreateCriteria,
  dbCreateInvitation,
  dbGetInvitationById,
  dbUpdateInvitationStatus,
  dbGetPendingInvitationsByEmail,
  dbGetParticipantByHackathonAndUser,
  dbCreateParticipant,
  dbUpdateParticipant,
  dbCreateJudge,
  dbAssignAwardWinner,
  dbUpsertScore,
  dbGetScoreboard,
  dbFinalizeWinners,
} from '../lib/hackathon-db';
import { createNotification } from '../lib/notifications-db';
import { dbService } from '../lib/db-service';
import { getOrCreateHackathonRoom } from '../lib/community-db';

function logErr(context: string, error: unknown) {
  const err = error instanceof Error ? error : new Error(String(error));
  console.error(`[${new Date().toISOString()}] ${context}:`, err.message);
}

export function registerHackathonRoutes(app: Express) {
  app.get('/api/hackathons', async (req, res) => {
    try {
      const list = await dbGetHackathonsList();
      res.json(list);
    } catch (e) {
      logErr('GET /api/hackathons', e);
      res.status(500).json({ message: 'Failed to fetch hackathons', error: (e as Error).message });
    }
  });

  app.get('/api/hackathons/:id', async (req, res) => {
    try {
      const full = await dbGetHackathonFull(req.params.id);
      if (!full) {
        res.status(404).json({ message: 'Hackathon not found' });
        return;
      }
      res.json(full);
    } catch (e) {
      logErr('GET /api/hackathons/:id', e);
      res.status(500).json({ message: 'Failed to fetch hackathon', error: (e as Error).message });
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
      if (awards?.length > 0) {
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
      if (criteria?.length > 0) {
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
      // Create Community chat room for this hackathon
      try {
        await getOrCreateHackathonRoom(id, row.name);
      } catch (_) {
        // ignore
      }
      const full = await dbGetHackathonFull(id);
      res.status(201).json(full);
    } catch (e) {
      logErr('POST /api/hackathons', e);
      res.status(500).json({ message: 'Failed to create hackathon', error: (e as Error).message });
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
    } catch (e) {
      logErr('PUT /api/hackathons/:id', e);
      res.status(500).json({ message: 'Failed to update hackathon', error: (e as Error).message });
    }
  });

  app.post('/api/hackathons/:id/invitations', async (req, res) => {
    try {
      const hackathonId = req.params.id;
      const inv = await dbCreateInvitation({
        hackathon_id: hackathonId,
        email: req.body.email || '',
        user_id: req.body.userId,
        role: req.body.role || 'participant',
        invited_by: req.body.invitedBy || '',
      });
      // In-app notification: if invitee has a user account (by email), create a notification
      const email = (req.body.email || '').trim().toLowerCase();
      if (email) {
        try {
          const user = await dbService.getUserByEmail(email);
          if (user?.id) {
            const hackathon = await dbGetHackathonById(hackathonId);
            const hackathonName = hackathon?.name || 'a hackathon';
            await createNotification({
              user_id: user.id,
              type: 'hackathon_invite',
              title: 'Hackathon invite',
              body: `You were invited to "${hackathonName}" as ${req.body.role || 'participant'}.`,
              link: `/hackathon/${hackathonId}`,
              data: { invitationId: inv.id, hackathonId },
            });
          }
        } catch (_) {
          // ignore notification errors (e.g. user not found)
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
    } catch (e) {
      logErr('POST /api/hackathons/:id/invitations', e);
      res.status(500).json({ message: 'Failed to create invitation', error: (e as Error).message });
    }
  });

  app.put('/api/hackathons/:id/invitations/:invitationId/respond', async (req, res) => {
    try {
      const { id: hackathonId, invitationId } = req.params;
      const { status } = req.body;
      if (status !== 'accepted' && status !== 'declined') {
        res.status(400).json({ message: 'status must be accepted or declined' });
        return;
      }
      const inv = await dbGetInvitationById(invitationId);
      if (!inv || inv.hackathon_id !== hackathonId) {
        res.status(404).json({ message: 'Invitation not found' });
        return;
      }
      if (inv.status !== 'pending') {
        res.status(400).json({ message: 'Invitation already responded' });
        return;
      }
      const updated = await dbUpdateInvitationStatus(invitationId, status);
      if (!updated) {
        res.status(404).json({ message: 'Invitation not found' });
        return;
      }
      if (status === 'accepted' && req.body.userId) {
        try {
          const existing = await dbGetParticipantByHackathonAndUser(hackathonId, req.body.userId);
          if (!existing) {
            await dbCreateParticipant({
              hackathon_id: hackathonId,
              user_id: req.body.userId,
              invited_via: invitationId,
            });
          }
        } catch (_) {
          // ignore participant create errors
        }
      }
      res.json({
        id: updated.id,
        hackathonId: updated.hackathon_id,
        status: updated.status,
        respondedAt: updated.responded_at,
      });
    } catch (e) {
      logErr('PUT /api/hackathons/:id/invitations/:invitationId/respond', e);
      res.status(500).json({ message: 'Failed to respond to invitation', error: (e as Error).message });
    }
  });

  app.get('/api/invitations/me', async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        res.status(400).json({ message: 'userId query required' });
        return;
      }
      const user = await dbService.getUserById(parseInt(userId, 10));
      if (!user?.email) {
        res.json([]);
        return;
      }
      const list = await dbGetPendingInvitationsByEmail(user.email);
      res.json(list.map((i) => ({
        id: i.id,
        hackathonId: i.hackathon_id,
        email: i.email,
        userId: i.user_id ?? undefined,
        role: i.role,
        status: i.status,
        invitedAt: i.invited_at,
        invitedBy: i.invited_by,
      })));
    } catch (e) {
      logErr('GET /api/invitations/me', e);
      res.status(500).json({ message: 'Failed to get invitations', error: (e as Error).message });
    }
  });

  app.get('/api/hackathons/:id/participants/me', async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        res.status(400).json({ message: 'userId query required' });
        return;
      }
      const p = await dbGetParticipantByHackathonAndUser(req.params.id, userId);
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
        attachmentUrl: (p as { attachment_url?: string }).attachment_url ?? undefined,
      });
    } catch (e) {
      logErr('GET /api/hackathons/:id/participants/me', e);
      res.status(500).json({ message: 'Failed to get participation', error: (e as Error).message });
    }
  });

  app.post('/api/hackathons/:id/participants', async (req, res) => {
    try {
      const { userId, projectId, projectName, teamName, invitationId, pitchText, repoUrl, demoUrl, attachmentUrl } = req.body;
      const p = await dbCreateParticipant({
        hackathon_id: req.params.id,
        user_id: userId,
        project_id: projectId,
        project_name: projectName,
        team_name: teamName,
        invited_via: invitationId,
        pitch_text: pitchText,
        repo_url: repoUrl,
        demo_url: demoUrl,
        attachment_url: attachmentUrl,
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
        attachmentUrl: (p as { attachment_url?: string }).attachment_url ?? undefined,
      });
    } catch (e) {
      logErr('POST /api/hackathons/:id/participants', e);
      res.status(500).json({ message: 'Failed to register participant', error: (e as Error).message });
    }
  });

  app.put('/api/hackathons/:id/participants/:participantId', async (req, res) => {
    try {
      const p = await dbUpdateParticipant(req.params.participantId, {
        project_id: req.body.projectId,
        project_name: req.body.projectName,
        team_name: req.body.teamName,
        pitch_text: req.body.pitchText,
        repo_url: req.body.repoUrl,
        demo_url: req.body.demoUrl,
        attachment_url: req.body.attachmentUrl,
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
        attachmentUrl: (p as { attachment_url?: string }).attachment_url ?? undefined,
      });
    } catch (e) {
      logErr('PUT /api/hackathons/:id/participants/:participantId', e);
      res.status(500).json({ message: 'Failed to update participant', error: (e as Error).message });
    }
  });

  app.post('/api/hackathons/:id/judges', async (req, res) => {
    try {
      const j = await dbCreateJudge({
        hackathon_id: req.params.id,
        user_id: req.body.userId,
        name: req.body.name || '',
        email: req.body.email || '',
        avatar: req.body.avatar,
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
    } catch (e) {
      logErr('POST /api/hackathons/:id/judges', e);
      res.status(500).json({ message: 'Failed to create judge', error: (e as Error).message });
    }
  });

  app.put('/api/hackathons/:id/awards/:awardId/winner', async (req, res) => {
    try {
      const ok = await dbAssignAwardWinner(req.params.awardId, req.body.projectId, req.body.projectName);
      if (!ok) {
        res.status(404).json({ message: 'Award not found' });
        return;
      }
      const full = await dbGetHackathonFull(req.params.id);
      res.json(full);
    } catch (e) {
      logErr('PUT /api/hackathons/:id/awards/:awardId/winner', e);
      res.status(500).json({ message: 'Failed to assign award winner', error: (e as Error).message });
    }
  });

  app.post('/api/hackathons/:id/scores', async (req, res) => {
    try {
      const s = await dbUpsertScore({
        hackathon_id: req.params.id,
        project_id: req.body.projectId,
        judge_id: req.body.judgeId,
        criterion_id: req.body.criterionId,
        score: Number(req.body.score),
        feedback: req.body.feedback,
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
    } catch (e) {
      logErr('POST /api/hackathons/:id/scores', e);
      res.status(500).json({ message: 'Failed to submit score', error: (e as Error).message });
    }
  });

  app.get('/api/hackathons/:id/scoreboard', async (req, res) => {
    try {
      const scoreboard = await dbGetScoreboard(req.params.id);
      res.json(scoreboard);
    } catch (e) {
      logErr('GET /api/hackathons/:id/scoreboard', e);
      res.status(500).json({ message: 'Failed to fetch scoreboard', error: (e as Error).message });
    }
  });

  app.post('/api/hackathons/:id/finalize-winners', async (req, res) => {
    try {
      const result = await dbFinalizeWinners(req.params.id);
      const full = await dbGetHackathonFull(req.params.id);
      res.json({ ...result, hackathon: full });
    } catch (e) {
      logErr('POST /api/hackathons/:id/finalize-winners', e);
      res.status(500).json({ message: 'Failed to finalize winners', error: (e as Error).message });
    }
  });
}
