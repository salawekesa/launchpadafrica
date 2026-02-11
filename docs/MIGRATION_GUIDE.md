# Database Migration Guide

Your application has been migrated from hardcoded data to PostgreSQL.

## What Changed

Before: static arrays, no persistence. After: PostgreSQL, CRUD, React Query.

## New Files

- src/lib/database.ts, src/lib/api.ts, src/scripts/init-db.ts
- src/server/api.ts
- src/hooks/useStartups.ts, src/hooks/useLeaderboard.ts
- .env, .env.example. See docs/DATABASE_SETUP.md and docs/QUICK_START.md.

## How to Run

Install PostgreSQL, create database lift, update .env, run npm run init-db, then npm run dev:full. See docs/QUICK_START.md.

## Commands

npm run dev, npm run api, npm run dev:full, npm run init-db, npm run test-db.

## API

GET /health, POST /init-db, GET/POST/PUT/DELETE /api/startups, GET /api/leaderboard.

## Troubleshooting

Check PostgreSQL is running, .env credentials, npm run test-db. See docs/INDEX.md.
