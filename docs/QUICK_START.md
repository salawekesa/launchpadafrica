# Quick Start Guide - PostgreSQL Setup

## Status

- Project cloned and dependencies installed
- Database configuration files created
- PostgreSQL needs to be installed and running

## Next Steps

### 1. Install PostgreSQL

- **Windows:** Download from postgresql.org/download/windows/, run installer, note postgres password.
- **macOS:** `brew install postgresql` then `brew services start postgresql`
- **Linux:** `sudo apt install postgresql postgresql-contrib` then `sudo systemctl start postgresql`

### 2. Create Database

```bash
psql -U postgres
CREATE DATABASE lift;
\q
```

### 3. Update .env

Set DB_HOST=localhost, DB_PORT=5432, DB_NAME=lift, DB_USER=postgres, DB_PASSWORD=your_password.

### 4. Initialize Database

```bash
npm run init-db
```

### 5. Test and Run

```bash
npm run test-db
npm run dev
```

## Files

- `src/lib/database.ts`, `src/lib/api.ts`, `src/scripts/init-db.ts`, `.env`
- See `docs/DATABASE_SETUP.md` for full instructions.

## Troubleshooting

- PostgreSQL not starting: Check services (Windows), or brew/systemctl (Mac/Linux).
- Connection refused: Ensure PostgreSQL is running on port 5432.
- Auth failed: Check .env username/password and privileges.

Support: See `docs/DATABASE_SETUP.md` and `docs/INDEX.md`.
