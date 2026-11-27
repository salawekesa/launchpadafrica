// @vitest-environment node
import request from 'supertest';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import rootApp from '../server.js';
import apiApp from '../src/server/api';
import { dbService } from '../src/lib/db-service';
import { getStartups } from '../src/lib/api';
import { dbGetHackathonsList } from '../src/lib/hackathon-db';

vi.mock('dotenv', () => ({ default: { config: vi.fn() } }));
vi.mock('../src/lib/database', () => ({ default: {} }));
vi.mock('../src/lib/api', () => ({ getStartups: vi.fn() }));
vi.mock('../src/lib/db-service', () => ({
  dbService: { ensureUserColumns: vi.fn(), getAllStartups: vi.fn() },
}));
vi.mock('../src/lib/hackathon-db', () => ({ dbGetHackathonsList: vi.fn() }));

// Supertest owns the HTTP listener. Skip the root entry point's startup side effects.
vi.mock('../src/server/socket-server', () => ({ setupSocketServer: vi.fn() }));
vi.mock('http', async (importOriginal) => {
  const http = await importOriginal<typeof import('node:http')>();
  return { ...http, default: { ...http.default, createServer: () => ({ listen: () => ({ on: vi.fn() }) }) } };
});
vi.mock('fs', async (importOriginal) => {
  const fs = await importOriginal<typeof import('node:fs')>();
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
