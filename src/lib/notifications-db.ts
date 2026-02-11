/**
 * Notifications – in-app notifications (e.g. hackathon invite).
 */
import pool from './database';

export interface DbNotification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}

export async function createNotification(input: {
  user_id: number;
  type: string;
  title: string;
  body?: string;
  link?: string;
  data?: Record<string, unknown>;
}): Promise<DbNotification> {
  const res = await pool.query(
    `INSERT INTO notifications (user_id, type, title, body, link, data)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, user_id, type, title, body, link, data, read_at, created_at`,
    [input.user_id, input.type, input.title, input.body ?? null, input.link ?? null, input.data ? JSON.stringify(input.data) : null]
  );
  return res.rows[0];
}

export async function getNotificationsByUserId(userId: number, options?: { unreadOnly?: boolean }): Promise<DbNotification[]> {
  let q = `SELECT id, user_id, type, title, body, link, data, read_at, created_at FROM notifications WHERE user_id = $1`;
  const params: unknown[] = [userId];
  if (options?.unreadOnly) {
    q += ` AND read_at IS NULL`;
  }
  q += ` ORDER BY created_at DESC LIMIT 100`;
  const res = await pool.query(q, params);
  return res.rows.map((r: { data?: string }) => ({
    ...r,
    data: r.data && typeof r.data === 'object' ? r.data : r.data ? JSON.parse(String(r.data)) : null,
  }));
}

export async function markNotificationRead(id: number, userId: number): Promise<boolean> {
  const res = await pool.query(
    `UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return (res.rowCount ?? 0) > 0;
}

export async function markAllNotificationsRead(userId: number): Promise<number> {
  const res = await pool.query(
    `UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND read_at IS NULL`,
    [userId]
  );
  return res.rowCount ?? 0;
}
