// @vitest-environment node
import fs from 'fs';
import request from 'supertest';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import rootApp from '../server.js';
import apiApp from '../src/server/api';
import { dbService } from '../src/lib/db-service';
import { createUser, deleteStartup, getStartups } from '../src/lib/api';
import { dbGetHackathonsList, dbUpsertScore } from '../src/lib/hackathon-db';

vi.mock('dotenv', () => ({ default: { config: vi.fn() } }));
vi.mock('../src/lib/database', () => ({ default: {} }));
vi.mock('../src/lib/api', () => ({ getStartups: vi.fn(), createUser: vi.fn(), deleteStartup: vi.fn() }));
vi.mock('../src/lib/db-service', () => ({
  dbService: {
    ensureUserColumns: vi.fn(), getAllStartups: vi.fn(), createUser: vi.fn(),
    getOrCreateProjectWallet: vi.fn(), createInvestment: vi.fn(),
  },
}));
vi.mock('../src/lib/hackathon-db', () => ({ dbGetHackathonsList: vi.fn(), dbUpsertScore: vi.fn() }));

// Supertest owns the HTTP listener. Skip the root entry point's startup side effects.
vi.mock('../src/server/socket-server', () => ({ setupSocketServer: vi.fn() }));
vi.mock('http', async (importOriginal) => {
  const http = await importOriginal<{ default: typeof import('node:http') }>();
  return { ...http, default: { ...http.default, createServer: () => ({ listen: () => ({ on: vi.fn() }) }) } };
});
vi.mock('fs', async (importOriginal) => {
  const fs = await importOriginal<{ default: typeof import('node:fs') }>();
  return { ...fs, default: { ...fs.default, existsSync: () => true, writeFileSync: vi.fn() } };
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

it.each([
  ['root', rootApp, dbService.getAllStartups],
  ['standalone', apiApp, getStartups],
] as const)('%s logs the original database error and returns a generic production response', async (_, app, list) => {
  vi.stubEnv('NODE_ENV', 'production');
  const error = Object.assign(new Error('private database message'), { code: 'XX000', detail: 'private row' });
  vi.mocked(list).mockRejectedValueOnce(error);

  const { body } = await request(app).get('/api/startups').expect(500);

  expect(Object.values(body)).toEqual(['Failed to fetch startups']);
  expect(vi.mocked(console.error).mock.calls.some(args => args.includes(error))).toBe(true);
});

it('redacts production health and mounted route failures on the root server', async () => {
  vi.stubEnv('NODE_ENV', 'production');
  vi.mocked(dbService.getAllStartups).mockRejectedValueOnce(new Error('private hostname'));
  vi.mocked(dbGetHackathonsList).mockRejectedValueOnce(new Error('private column'));

  const health = await request(rootApp).get('/api/health').expect(503);
  expect(health.body.error).toBe('Database unavailable');
  await request(rootApp).get('/api/hackathons').expect(500, { message: 'Internal server error' });
});

it.each([['root', rootApp], ['standalone', apiApp]] as const)(
  '%s rejects malformed JSON before a route runs', async (_, app) => {
    vi.stubEnv('NODE_ENV', 'production');
    const response = await request(app).post('/api/startups').type('json').send('{"private":')
      .expect('Content-Type', /json/).expect(400);
    expect(Object.values(response.body)).toEqual(['Malformed request body']);
    expect(console.error).toHaveBeenCalled();
  },
);

it.each(['12abc', '0', '-1', '1.5', '1e2', ' 2', '9007199254740992'])(
  'rejects invalid numeric ID %j before reading or deleting a startup', async id => {
    await request(rootApp).get('/api/startups/' + encodeURIComponent(id)).expect(400);
    await request(apiApp).delete('/api/startups/' + encodeURIComponent(id)).expect(400);
    expect(dbService.getAllStartups).not.toHaveBeenCalled();
    expect(deleteStartup).not.toHaveBeenCalled();
  },
);

it('passes a valid numeric startup ID to the database', async () => {
  await request(apiApp).delete('/api/startups/42').expect(200);
  expect(deleteStartup).toHaveBeenCalledWith(42);
});

it('validates IDs in paths, queries and request bodies', async () => {
  await request(rootApp).patch('/api/users/1x').send({}).expect(400);
  await request(rootApp).get('/api/investor/my-investments?userId=1x').expect(400);
  await request(rootApp).put('/api/notifications/1x/read?userId=1').expect(400);
  await request(rootApp).get('/api/invitations/me?userId=1x').expect(400);
  await request(apiApp).get('/api/startups/1x/team').expect(400);
  await request(apiApp).put('/api/startups/1x/status').send({}).expect(400);
  await request(apiApp).get('/api/user/1x/activities').expect(400);
  await request(apiApp).put('/api/interactions/1x/status').send({}).expect(400);
  await request(apiApp).post('/api/startup/1x/support').send({}).expect(400);
  await request(apiApp).post('/api/user/1/activities').send({ startup_id: '2x' }).expect(400);
  await request(apiApp).post('/api/user/1/interactions').send({ startup_id: -2 }).expect(400);
});

it('rejects invalid created_by filters before querying and preserves valid filtering', async () => {
  for (const app of [rootApp, apiApp]) {
    for (const filter of ['abc', '2abc', '', '0', '2&created_by=3']) {
      await request(app).get('/api/startups?created_by=' + filter).expect(400);
    }
  }
  expect(dbService.getAllStartups).not.toHaveBeenCalled();
  expect(getStartups).not.toHaveBeenCalled();
  vi.mocked(dbService.getAllStartups).mockResolvedValueOnce([{ id: 1, created_by: 7 }, { id: 2, created_by: 8 }]);
  await request(rootApp).get('/api/startups?created_by=7').expect(200, [{ id: 1, created_by: 7 }]);
});

const investment = { investor_id: '7', entity_type: 'startup', entity_id: '8', amount: '2.5' };

it.each([0, -1, '', '1abc', 'Infinity', '1e999', true, [2], null])(
  'rejects investment amount %j before creating a wallet', async amount => {
    await request(rootApp).post('/api/investor/invest').send({ ...investment, amount }).expect(400);
    expect(dbService.getOrCreateProjectWallet).not.toHaveBeenCalled();
    expect(dbService.createInvestment).not.toHaveBeenCalled();
  },
);

it('validates investor and startup IDs before creating a wallet, and accepts a positive amount', async () => {
  for (const invalid of [{ investor_id: '7x' }, { entity_id: '8x' }]) {
    await request(rootApp).post('/api/investor/invest').send({ ...investment, ...invalid }).expect(400);
  }
  expect(dbService.getOrCreateProjectWallet).not.toHaveBeenCalled();
  vi.mocked(dbService.getOrCreateProjectWallet).mockResolvedValueOnce({ id: 11 });
  vi.mocked(dbService.createInvestment).mockResolvedValueOnce({ id: 12 });
  await request(rootApp).post('/api/investor/invest').send(investment).expect(201, { id: 12 });
  expect(dbService.createInvestment).toHaveBeenCalledWith({ investor_id: 7, project_wallet_id: 11, amount: 2.5, currency: 'ETH' });
});

it.each([['root', rootApp], ['standalone', apiApp]] as const)('%s enforces the inclusive 0–100 scoring range', async (_, app) => {
  const send = (score: unknown) => request(app).post('/api/hackathons/hack-example/scores')
    .send({ projectId: 'project-a', judgeId: 'judge-b', score });
  for (const score of [-1, 101, 'Infinity', '1e999', '20abc', '', null, true, [3], undefined]) {
    await send(score).expect(400);
  }
  expect(dbUpsertScore).not.toHaveBeenCalled();
  for (const score of [0, '45.5', 100]) {
    vi.mocked(dbUpsertScore).mockResolvedValueOnce({
      id: 'score-c', hackathon_id: 'hack-example', project_id: 'project-a', judge_id: 'judge-b',
      criterion_id: null, score: Number(score), feedback: null, submitted_at: '2026-01-01',
    });
    const { body } = await send(score).expect(201);
    expect(body.score).toBe(Number(score));
    expect(dbUpsertScore).toHaveBeenLastCalledWith(expect.objectContaining({ score: Number(score) }));
  }
});

it.each([
  ['root', rootApp, '/api/users', dbService.createUser, 201],
  ['standalone', apiApp, '/api/user', createUser, 200],
] as const)('%s requires nonempty strings for name, email and bio', async (_, app, path, create, status) => {
  const profile = { name: 'Amina', email: 'amina@example.org', bio: 'Founder' };
  for (const field of Object.keys(profile)) {
    for (const value of [undefined, null, 123, '   ']) {
      await request(app).post(path).send({ ...profile, [field]: value }).expect(400);
    }
  }
  expect(create).not.toHaveBeenCalled();
  await request(app).post(path).send(profile).expect(status);
  expect(create).toHaveBeenCalledOnce();
});

const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jv1kAAAAASUVORK5CYII=';
const gif = 'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
const pdf = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF').toString('base64');
const jpegHeader = Buffer.from('ffd8ffe000104a46494600010100000100010000', 'hex').toString('base64');

it.each([
  ['plot.PNG', png, png],
  ['chart.gif', 'data:image/gif;base64,' + gif, gif],
  ['photo.jpg', 'data:image/jpeg;base64,' + jpegHeader, jpegHeader],
  ['photo.jpeg', jpegHeader, jpegHeader],
  ['pitch.pdf', 'data:application/pdf;base64,' + pdf, pdf],
])('accepts matching upload type and extension for %s', async (filename, file, base64) => {
  const { body } = await request(rootApp).post('/api/upload').send({ filename, file }).expect(200);
  expect(body.url).toMatch(/^\/uploads\/\d+-/);
  expect(body.url.endsWith(filename)).toBe(true);
  expect(fs.writeFileSync).toHaveBeenCalledWith(expect.stringContaining(filename), Buffer.from(base64, 'base64'));
});

it.each([
  { filename: 'pitch.html', file: png },
  { filename: 'pitch.zip', file: png },
  { filename: 'pitch.svg', file: 'data:image/svg+xml;base64,' + png },
  { filename: 'pitch', file: pdf },
  { filename: 'pitch.png', file: 'data:text/html;base64,' + png },
  { filename: 'pitch.png', file: png, mimeType: 'application/pdf' },
  { filename: 'pitch.png', file: 'data:image/png;base64,' + pdf },
  { filename: 'pitch.png', file: Buffer.from('<html>example</html>').toString('base64') },
  { filename: 'pitch.png', file: png + '!' },
  { filename: 'pitch.pdf', file: [] },
  { filename: 123, file: png },
])('rejects unsupported or mismatched uploads before writing ($filename)', async upload => {
  await request(rootApp).post('/api/upload').send(upload).expect('Content-Type', /json/).expect(400);
  expect(fs.writeFileSync).not.toHaveBeenCalled();
});
