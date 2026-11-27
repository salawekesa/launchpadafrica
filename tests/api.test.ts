// @vitest-environment node
import request from 'supertest';
import { beforeEach, expect, it, vi } from 'vitest';
import app from '../src/server/api';

const pool = vi.hoisted(() => ({ connect: vi.fn(), query: vi.fn() }));

vi.mock('pg', () => ({
  Pool: class {
    connect = pool.connect;
    query = pool.query;
  },
}));
vi.mock('dotenv', () => ({ default: { config: vi.fn() } }));

const submission = {
  name: 'Kijani',
  description: 'Crop planning for small farms',
  category: 'Web2',
  stage: 'Seed',
  users: '120',
  growth: '+8%',
};
const startup = {
  ...submission,
  id: 42,
  status: 1,
  created_at: '2026-01-10T09:00:00.000Z',
  updated_at: '2026-01-10T09:00:00.000Z',
};

beforeEach(() => {
  vi.resetAllMocks();
});

it('GET /health reports a connected database and a timestamp', async () => {
  const release = vi.fn();
  pool.connect.mockResolvedValueOnce({ release });

  const { body } = await request(app).get('/health').expect(200);

  expect(body).toEqual({
    status: 'ok',
    database: 'connected',
    timestamp: expect.any(String),
  });
  expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
  expect(release).toHaveBeenCalledOnce();
});

it('GET /health reports a disconnected database when the connection check fails', async () => {
  pool.connect.mockRejectedValueOnce(new Error('Database offline'));

  const { body } = await request(app).get('/health').expect(200);

  expect(body.database).toBe('disconnected');
});

it('GET /api/startups returns the stored startups as JSON', async () => {
  pool.query.mockResolvedValueOnce({ rows: [startup] });

  await request(app).get('/api/startups').expect('Content-Type', /json/).expect(200, [startup]);
});

it('POST /api/startups creates a startup without team members', async () => {
  pool.query.mockResolvedValueOnce({ rows: [startup] });

  await request(app).post('/api/startups').send(submission).expect(201, startup);

  expect(pool.query).toHaveBeenCalledOnce();
  expect(pool.query).toHaveBeenCalledWith(
    expect.stringMatching(/insert into startups\b/i),
    expect.arrayContaining([submission.name, submission.description, submission.category]),
  );
});

it('POST /api/startups links a submitted team member to the new startup ID', async () => {
  const member = { name: 'Amina', role: 'Founder', bio: 'Agronomist' };
  pool.query
    .mockResolvedValueOnce({ rows: [startup] })
    .mockResolvedValueOnce({ rows: [{ ...member, id: 7, startup_id: startup.id }] });

  await request(app)
    .post('/api/startups')
    .send({ ...submission, teamMembers: [member] })
    .expect(201, startup);

  expect(pool.query).toHaveBeenNthCalledWith(
    2,
    expect.stringMatching(/insert into team_members\b/i),
    [startup.id, member.name, member.role, member.bio],
  );
});

it('POST /api/startups returns 500 when the startup cannot be saved', async () => {
  pool.query.mockRejectedValue(new Error('Database offline'));

  const { body } = await request(app).post('/api/startups').send(submission).expect(500);

  expect(body.message).toBe('Failed to create startup');
});

it('GET /api/leaderboard returns each rank with its associated startup', async () => {
  const entry = { id: 10, startup_id: startup.id, rank: 1, growth_rate: startup.growth };
  pool.query.mockResolvedValueOnce({ rows: [{ ...startup, ...entry }] });

  await request(app).get('/api/leaderboard').expect(200, [{ ...entry, startup }]);
});

it.each([
  ['/api/startups', 'Failed to fetch startups'],
  ['/api/leaderboard', 'Failed to fetch leaderboard'],
])('GET %s returns 500 when the database query fails', async (path, message) => {
  pool.query.mockRejectedValueOnce(new Error('Database offline'));

  const { body } = await request(app).get(path).expect(500);

  expect(body.message).toBe(message);
});
