/**
 * Community module – rooms, members, messages (chat).
 */
import pool from './database';

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export type RoomType = 'hackathon' | 'public' | 'forum';

export interface DbRoom {
  id: string;
  name: string;
  type: RoomType;
  description: string | null;
  hackathon_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbMessage {
  id: string;
  room_id: string;
  user_id: string;
  user_name: string | null;
  content: string;
  created_at: string;
}

export async function createRoom(input: {
  name: string;
  type: RoomType;
  description?: string;
  hackathon_id?: string;
  created_by?: string;
}): Promise<DbRoom> {
  const id = genId('room');
  await pool.query(
    `INSERT INTO community_rooms (id, name, type, description, hackathon_id, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, input.name, input.type, input.description ?? null, input.hackathon_id ?? null, input.created_by ?? null]
  );
  const row = await getRoomById(id);
  if (!row) throw new Error('Failed to fetch created room');
  return row;
}

export async function getRoomById(id: string): Promise<DbRoom | null> {
  const res = await pool.query(
    `SELECT id, name, type, description, hackathon_id, created_by, created_at, updated_at
     FROM community_rooms WHERE id = $1`,
    [id]
  );
  return res.rows[0] ?? null;
}

export async function listRooms(options?: { type?: RoomType; hackathon_id?: string }): Promise<DbRoom[]> {
  let q = `SELECT id, name, type, description, hackathon_id, created_by, created_at, updated_at FROM community_rooms WHERE 1=1`;
  const params: unknown[] = [];
  let i = 1;
  if (options?.type) {
    q += ` AND type = $${i++}`;
    params.push(options.type);
  }
  if (options?.hackathon_id) {
    q += ` AND hackathon_id = $${i++}`;
    params.push(options.hackathon_id);
  }
  q += ` ORDER BY updated_at DESC`;
  const res = await pool.query(q, params);
  return res.rows;
}

export async function getOrCreateHackathonRoom(hackathonId: string, hackathonName: string): Promise<DbRoom> {
  const existing = await pool.query(
    `SELECT id, name, type, description, hackathon_id, created_by, created_at, updated_at
     FROM community_rooms WHERE hackathon_id = $1 AND type = 'hackathon'`,
    [hackathonId]
  );
  if (existing.rows[0]) return existing.rows[0];
  return createRoom({
    name: `${hackathonName} – Chat`,
    type: 'hackathon',
    description: `Discussion for hackathon: ${hackathonName}`,
    hackathon_id: hackathonId,
  });
}

export async function joinRoom(roomId: string, userId: string, role?: string): Promise<void> {
  await pool.query(
    `INSERT INTO community_room_members (room_id, user_id, role)
     VALUES ($1, $2, $3)
     ON CONFLICT (room_id, user_id) DO NOTHING`,
    [roomId, userId, role ?? 'member']
  );
}

export async function leaveRoom(roomId: string, userId: string): Promise<void> {
  await pool.query(`DELETE FROM community_room_members WHERE room_id = $1 AND user_id = $2`, [roomId, userId]);
}

export async function getRoomMembers(roomId: string): Promise<{ user_id: string; role: string; joined_at: string }[]> {
  const res = await pool.query(
    `SELECT user_id, role, joined_at FROM community_room_members WHERE room_id = $1 ORDER BY joined_at`,
    [roomId]
  );
  return res.rows;
}

export async function addMessage(roomId: string, userId: string, userName: string | null, content: string): Promise<DbMessage> {
  const id = genId('msg');
  await pool.query(
    `INSERT INTO community_messages (id, room_id, user_id, user_name, content)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, roomId, userId, userName ?? null, content]
  );
  const res = await pool.query(
    `SELECT id, room_id, user_id, user_name, content, created_at FROM community_messages WHERE id = $1`,
    [id]
  );
  const row = res.rows[0];
  if (!row) throw new Error('Failed to fetch created message');
  await pool.query(`UPDATE community_rooms SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [roomId]);
  return row;
}

export async function getMessages(roomId: string, options?: { before?: string; limit?: number }): Promise<DbMessage[]> {
  const limit = Math.min(options?.limit ?? 50, 100);
  let q = `SELECT id, room_id, user_id, user_name, content, created_at FROM community_messages WHERE room_id = $1`;
  const params: unknown[] = [roomId];
  if (options?.before) {
    q += ` AND created_at < (SELECT created_at FROM community_messages WHERE id = $2)`;
    params.push(options.before);
  }
  q += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
  params.push(limit);
  const res = await pool.query(q, params);
  return res.rows.reverse();
}

export async function isMember(roomId: string, userId: string): Promise<boolean> {
  const res = await pool.query(
    `SELECT 1 FROM community_room_members WHERE room_id = $1 AND user_id = $2`,
    [roomId, userId]
  );
  return res.rows.length > 0;
}
