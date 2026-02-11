/**
 * Notifications + Community (rooms, messages) API for server.js.
 */
import type { Express } from 'express';
import {
  getNotificationsByUserId,
  markNotificationRead,
  markAllNotificationsRead,
} from '../lib/notifications-db';
import {
  listRooms,
  getRoomById,
  createRoom,
  getOrCreateHackathonRoom,
  joinRoom,
  leaveRoom,
  getRoomMembers,
  addMessage,
  getMessages,
  isMember,
} from '../lib/community-db';

function logErr(context: string, error: unknown) {
  const err = error instanceof Error ? error : new Error(String(error));
  console.error(`[${new Date().toISOString()}] ${context}:`, err.message);
}

export function registerCommunityRoutes(app: Express) {
  // ---------- Notifications ----------
  app.get('/api/notifications', async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        res.status(400).json({ message: 'userId query required' });
        return;
      }
      const unreadOnly = req.query.unreadOnly === 'true';
      const list = await getNotificationsByUserId(parseInt(userId, 10), { unreadOnly });
      res.json(list.map((n) => ({
        id: n.id,
        userId: n.user_id,
        type: n.type,
        title: n.title,
        body: n.body,
        link: n.link,
        data: (n as { data?: Record<string, unknown> }).data ?? undefined,
        readAt: n.read_at,
        createdAt: n.created_at,
      })));
    } catch (e) {
      logErr('GET /api/notifications', e);
      res.status(500).json({ message: 'Failed to fetch notifications', error: (e as Error).message });
    }
  });

  app.put('/api/notifications/:id/read', async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        res.status(400).json({ message: 'userId query required' });
        return;
      }
      const ok = await markNotificationRead(parseInt(req.params.id, 10), parseInt(userId, 10));
      if (!ok) res.status(404).json({ message: 'Notification not found' });
      else res.json({ ok: true });
    } catch (e) {
      logErr('PUT /api/notifications/:id/read', e);
      res.status(500).json({ message: 'Failed to mark read', error: (e as Error).message });
    }
  });

  app.put('/api/notifications/read-all', async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        res.status(400).json({ message: 'userId query required' });
        return;
      }
      const count = await markAllNotificationsRead(parseInt(userId, 10));
      res.json({ count });
    } catch (e) {
      logErr('PUT /api/notifications/read-all', e);
      res.status(500).json({ message: 'Failed to mark all read', error: (e as Error).message });
    }
  });

  // ---------- Community rooms ----------
  app.get('/api/community/rooms', async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      const hackathonId = req.query.hackathonId as string | undefined;
      const list = await listRooms({
        type: type as 'hackathon' | 'public' | 'forum' | undefined,
        hackathon_id: hackathonId,
      });
      res.json(list.map((r) => ({
        id: r.id,
        name: r.name,
        type: r.type,
        description: r.description,
        hackathonId: r.hackathon_id,
        createdBy: r.created_by,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })));
    } catch (e) {
      logErr('GET /api/community/rooms', e);
      res.status(500).json({ message: 'Failed to list rooms', error: (e as Error).message });
    }
  });

  app.get('/api/community/rooms/:id', async (req, res) => {
    try {
      const room = await getRoomById(req.params.id);
      if (!room) {
        res.status(404).json({ message: 'Room not found' });
        return;
      }
      res.json({
        id: room.id,
        name: room.name,
        type: room.type,
        description: room.description,
        hackathonId: room.hackathon_id,
        createdBy: room.created_by,
        createdAt: room.created_at,
        updatedAt: room.updated_at,
      });
    } catch (e) {
      logErr('GET /api/community/rooms/:id', e);
      res.status(500).json({ message: 'Failed to get room', error: (e as Error).message });
    }
  });

  app.post('/api/community/rooms', async (req, res) => {
    try {
      const { name, type, description, hackathonId, createdBy } = req.body;
      const room = await createRoom({
        name: name || 'Room',
        type: type || 'public',
        description,
        hackathon_id: hackathonId,
        created_by: createdBy,
      });
      res.status(201).json({
        id: room.id,
        name: room.name,
        type: room.type,
        description: room.description,
        hackathonId: room.hackathon_id,
        createdBy: room.created_by,
        createdAt: room.created_at,
        updatedAt: room.updated_at,
      });
    } catch (e) {
      logErr('POST /api/community/rooms', e);
      res.status(500).json({ message: 'Failed to create room', error: (e as Error).message });
    }
  });

  app.post('/api/community/rooms/hackathon', async (req, res) => {
    try {
      const { hackathonId, hackathonName } = req.body;
      if (!hackathonId || !hackathonName) {
        res.status(400).json({ message: 'hackathonId and hackathonName required' });
        return;
      }
      const room = await getOrCreateHackathonRoom(hackathonId, hackathonName);
      res.json({
        id: room.id,
        name: room.name,
        type: room.type,
        description: room.description,
        hackathonId: room.hackathon_id,
        createdBy: room.created_by,
        createdAt: room.created_at,
        updatedAt: room.updated_at,
      });
    } catch (e) {
      logErr('POST /api/community/rooms/hackathon', e);
      res.status(500).json({ message: 'Failed to get/create hackathon room', error: (e as Error).message });
    }
  });

  app.post('/api/community/rooms/:id/join', async (req, res) => {
    try {
      const userId = req.body.userId as string;
      if (!userId) {
        res.status(400).json({ message: 'userId required' });
        return;
      }
      await joinRoom(req.params.id, userId, req.body.role);
      res.json({ ok: true });
    } catch (e) {
      logErr('POST /api/community/rooms/:id/join', e);
      res.status(500).json({ message: 'Failed to join room', error: (e as Error).message });
    }
  });

  app.post('/api/community/rooms/:id/leave', async (req, res) => {
    try {
      const userId = req.body.userId as string;
      if (!userId) {
        res.status(400).json({ message: 'userId required' });
        return;
      }
      await leaveRoom(req.params.id, userId);
      res.json({ ok: true });
    } catch (e) {
      logErr('POST /api/community/rooms/:id/leave', e);
      res.status(500).json({ message: 'Failed to leave room', error: (e as Error).message });
    }
  });

  app.get('/api/community/rooms/:id/members', async (req, res) => {
    try {
      const members = await getRoomMembers(req.params.id);
      res.json(members);
    } catch (e) {
      logErr('GET /api/community/rooms/:id/members', e);
      res.status(500).json({ message: 'Failed to get members', error: (e as Error).message });
    }
  });

  app.get('/api/community/rooms/:id/messages', async (req, res) => {
    try {
      const before = req.query.before as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const messages = await getMessages(req.params.id, { before, limit });
      res.json(messages.map((m) => ({
        id: m.id,
        roomId: m.room_id,
        userId: m.user_id,
        userName: m.user_name,
        content: m.content,
        createdAt: m.created_at,
      })));
    } catch (e) {
      logErr('GET /api/community/rooms/:id/messages', e);
      res.status(500).json({ message: 'Failed to get messages', error: (e as Error).message });
    }
  });

  app.post('/api/community/rooms/:id/messages', async (req, res) => {
    try {
      const { userId, userName, content } = req.body;
      if (!userId || content == null || content === '') {
        res.status(400).json({ message: 'userId and content required' });
        return;
      }
      const member = await isMember(req.params.id, userId);
      if (!member) {
        res.status(403).json({ message: 'Join the room first' });
        return;
      }
      const msg = await addMessage(req.params.id, userId, userName || null, String(content).trim());
      res.status(201).json({
        id: msg.id,
        roomId: msg.room_id,
        userId: msg.user_id,
        userName: msg.user_name,
        content: msg.content,
        createdAt: msg.created_at,
      });
    } catch (e) {
      logErr('POST /api/community/rooms/:id/messages', e);
      res.status(500).json({ message: 'Failed to send message', error: (e as Error).message });
    }
  });
}
