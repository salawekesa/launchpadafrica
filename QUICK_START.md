# 🚀 Quick Start Guide - PostgreSQL Setup

## Current Status
✅ **Project cloned and dependencies installed**  
✅ **Database configuration files created**  
❌ **PostgreSQL needs to be installed and running**

## Next Steps to Complete Setup

### 1. Install PostgreSQL

**Windows:**
1. Download PostgreSQL from [postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. PostgreSQL service should start automatically

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Create Database

Open a terminal and run:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE lift;

# Exit psql
\q
```

### 3. Update Environment Variables

Edit the `.env` file in the project root and update the database password:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lift
DB_USER=postgres
DB_PASSWORD=YOUR_ACTUAL_PASSWORD_HERE
```

### 4. Initialize Database

Once PostgreSQL is running, execute:

```bash
npm run init-db
```

### 5. Test Connection

```bash
npm run test-db
```

### 6. Start Development Server

```bash
npm run dev
```

## What's Been Set Up

### 📁 Database Files Created:
- `src/lib/database.ts` - Database connection and initialization
- `src/lib/api.ts` - API functions for database operations
- `src/scripts/init-db.ts` - Database setup script
- `.env` - Environment configuration
- `DATABASE_SETUP.md` - Detailed setup guide

### 🗄️ Database Schema:
- **startups** table - Stores startup information
- **leaderboard** table - Stores ranking data
- Sample data will be inserted automatically

### 🔧 Available Scripts:
- `npm run init-db` - Initialize database tables and data
- `npm run test-db` - Test database connection
- `npm run dev` - Start development server

## Troubleshooting

### PostgreSQL Not Starting
- **Windows**: Check Services (services.msc) for PostgreSQL service
- **macOS**: `brew services restart postgresql`
- **Linux**: `sudo systemctl restart postgresql`

### Connection Refused
- Ensure PostgreSQL is running
- Check if port 5432 is available
- Verify firewall settings

### Authentication Failed
- Double-check username and password in `.env`
- Ensure user has database privileges

## Next Steps After Database Setup

1. The application will automatically connect to PostgreSQL
2. Data will be loaded from the database instead of hardcoded arrays
3. You can add/edit/delete startups through the database
4. Leaderboard will be dynamically generated from database

## Support

If you encounter issues:
1. Check the `DATABASE_SETUP.md` file for detailed instructions
2. Ensure PostgreSQL is running: `pg_isready`
3. Test connection manually: `psql -U postgres -d lift`
