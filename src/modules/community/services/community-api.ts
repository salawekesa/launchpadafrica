/**
 * Community module – client API (rooms, messages, notifications).
 */
const API_BASE = '';

async function handleRes<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { message?: string }).message || res.statusText || 'Request failed');
  }
  return data as T;
}

export interface Room {
  id: string;
  name: string;
  type: 'hackathon' | 'public' | 'forum';
  description: string | null;
  hackathonId: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  roomId: string;
  userId: string;
  userName: string | null;
  content: string;
  createdAt: string;
}

export async function apiGetRooms(options?: { type?: string; hackathonId?: string }): Promise<Room[]> {
  const params = new URLSearchParams();
  if (options?.type) params.set('type', options.type);
  if (options?.hackathonId) params.set('hackathonId', options.hackathonId);
  const q = params.toString();
  const res = await fetch(`${API_BASE}/api/community/rooms${q ? `?${q}` : ''}`);
  return handleRes<Room[]>(res);
}

export async function apiGetRoom(roomId: string): Promise<Room | null> {
  const res = await fetch(`${API_BASE}/api/community/rooms/${encodeURIComponent(roomId)}`);
  if (res.status === 404) return null;
  return handleRes<Room>(res);
}

export async function apiCreateRoom(body: {
  name: string;
  type: string;
  description?: string;
  hackathonId?: string;
  createdBy?: string;
}): Promise<Room> {
  const res = await fetch(`${API_BASE}/api/community/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleRes<Room>(res);
}

export async function apiGetOrCreateHackathonRoom(hackathonId: string, hackathonName: string): Promise<Room> {
  const res = await fetch(`${API_BASE}/api/community/rooms/hackathon`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hackathonId, hackathonName }),
  });
  return handleRes<Room>(res);
}

export async function apiJoinRoom(roomId: string, userId: string, role?: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/community/rooms/${encodeURIComponent(roomId)}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, role }),
  });
  await handleRes<{ ok: boolean }>(res);
}

export async function apiLeaveRoom(roomId: string, userId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/community/rooms/${encodeURIComponent(roomId)}/leave`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  await handleRes<{ ok: boolean }>(res);
}

export async function apiGetMessages(roomId: string, options?: { before?: string; limit?: number }): Promise<Message[]> {
  const params = new URLSearchParams();
  if (options?.before) params.set('before', options.before);
  if (options?.limit != null) params.set('limit', String(options.limit));
  const q = params.toString();
  const res = await fetch(`${API_BASE}/api/community/rooms/${encodeURIComponent(roomId)}/messages${q ? `?${q}` : ''}`);
  return handleRes<Message[]>(res);
}

export async function apiSendMessage(roomId: string, userId: string, userName: string | null, content: string): Promise<Message> {
  const res = await fetch(`${API_BASE}/api/community/rooms/${encodeURIComponent(roomId)}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, userName, content }),
  });
  return handleRes<Message>(res);
}
