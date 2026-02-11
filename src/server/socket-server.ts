/**
 * Socket.io server for real-time community chat.
 * Attach to the HTTP server so clients can join rooms and send/receive messages.
 */
import { Server as IoServer } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { addMessage, isMember, joinRoom } from '../lib/community-db';

const ROOM_PREFIX = 'room:';

export function setupSocketServer(httpServer: HttpServer, options?: { corsOrigin?: string }) {
  const io = new IoServer(httpServer, {
    cors: {
      origin: options?.corsOrigin || '*',
      methods: ['GET', 'POST'],
    },
    path: '/socket.io',
  });

  io.on('connection', (socket) => {
    socket.on('join_room', async (payload: { roomId: string; userId: string; userName?: string }) => {
      const { roomId, userId, userName } = payload || {};
      if (!roomId || !userId) return;
      try {
        await joinRoom(roomId, userId);
        socket.join(ROOM_PREFIX + roomId);
        socket.data.roomId = roomId;
        socket.data.userId = userId;
        socket.data.userName = userName || null;
      } catch (_) {
        // ignore
      }
    });

    socket.on('message', async (payload: { roomId: string; userId: string; userName?: string; content: string }) => {
      const { roomId, userId, userName, content } = payload || {};
      if (!roomId || !userId || content == null || String(content).trim() === '') return;
      try {
        const member = await isMember(roomId, userId);
        if (!member) return;
        const msg = await addMessage(roomId, userId, userName || null, String(content).trim());
        io.to(ROOM_PREFIX + roomId).emit('message', {
          id: msg.id,
          roomId: msg.room_id,
          userId: msg.user_id,
          userName: msg.user_name,
          content: msg.content,
          createdAt: msg.created_at,
        });
      } catch (_) {
        // ignore
      }
    });

    socket.on('disconnect', () => {
      // optional: leave room from socket.data.roomId
    });
  });

  return io;
}
