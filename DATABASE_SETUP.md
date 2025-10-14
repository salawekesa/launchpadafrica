# PostgreSQL Database Setup Guide

## Prerequisites

1. **Install PostgreSQL** on your system:
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - macOS: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql postgresql-contrib`

2. **Start PostgreSQL service**:
   - Windows: Start PostgreSQL service from Services
   - macOS: `brew services start postgresql`
   - Linux: `sudo systemctl start postgresql`

## Database Setup

### 1. Create Database

Connect to PostgreSQL and create the database:

```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database
CREATE DATABASE lift;

-- Create user (optional, you can use postgres user)
CREATE USER lift_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE lift TO lift_user;
```

### 2. Configure Environment Variables

Update the `.env` file with your database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lift
DB_USER=postgres
DB_PASSWORD=your_password_here
```

### 3. Initialize Database

Run the initialization script to create tables and insert sample data:

```bash
npm run init-db
```

### 4. Test Connection

Test the database connection:

```bash
npm run test-db
```

## Database Schema

The application uses two main tables:

### `startups` table
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR)
- `description` (TEXT)
- `category` (VARCHAR) - 'Web2' or 'Web3'
- `stage` (VARCHAR) - 'Pre-Seed', 'Seed', 'Series A', etc.
- `users` (VARCHAR) - User count
- `growth` (VARCHAR) - Growth percentage
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### `leaderboard` table
- `id` (SERIAL PRIMARY KEY)
- `startup_id` (INTEGER) - Foreign key to startups
- `rank` (INTEGER) - Leaderboard position
- `growth_rate` (VARCHAR) - Growth rate for ranking
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## API Functions

The application provides these database functions:

- `getStartups()` - Get all startups
- `getStartupsByCategory(category)` - Filter by category
- `getLeaderboard()` - Get ranked startups
- `addStartup(startup)` - Add new startup
- `updateStartup(id, startup)` - Update existing startup
- `deleteStartup(id)` - Remove startup

## Troubleshooting

### Connection Issues
1. Ensure PostgreSQL is running
2. Check firewall settings
3. Verify credentials in `.env`
4. Test connection: `npm run test-db`

### Permission Issues
1. Ensure user has database access
2. Check user privileges
3. Verify database exists

### Port Conflicts
1. Default PostgreSQL port is 5432
2. Check if port is available
3. Update `DB_PORT` in `.env` if needed
