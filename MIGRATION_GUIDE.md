# 🚀 Database Migration Guide

## ✅ Migration Complete!

Your application has been successfully migrated from hardcoded data to PostgreSQL database!

## 🔄 What Changed

### **Before (Hardcoded Data):**
- Data stored in static arrays in components
- No persistence between sessions
- No ability to add/edit/delete data

### **After (Database Integration):**
- Data stored in PostgreSQL database
- Persistent data across sessions
- Full CRUD operations available
- Real-time data fetching with React Query

## 📁 New Files Created

### **Database Layer:**
- `src/lib/database.ts` - Database connection and initialization
- `src/lib/api.ts` - Database operations (CRUD)
- `src/scripts/init-db.ts` - Database setup script

### **API Server:**
- `src/server/api.ts` - Express API server with endpoints

### **React Hooks:**
- `src/hooks/useStartups.ts` - Startup data fetching
- `src/hooks/useLeaderboard.ts` - Leaderboard data fetching

### **Configuration:**
- `.env` - Environment variables
- `.env.example` - Environment template
- `DATABASE_SETUP.md` - Detailed setup guide
- `QUICK_START.md` - Quick setup guide

## 🗄️ Database Schema

### **`startups` Table:**
```sql
CREATE TABLE startups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  stage VARCHAR(50),
  users VARCHAR(50),
  growth VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **`leaderboard` Table:**
```sql
CREATE TABLE leaderboard (
  id SERIAL PRIMARY KEY,
  startup_id INTEGER REFERENCES startups(id),
  rank INTEGER NOT NULL,
  growth_rate VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 How to Run

### **1. Install PostgreSQL**
Follow the `QUICK_START.md` guide to install PostgreSQL.

### **2. Create Database**
```bash
psql -U postgres
CREATE DATABASE lift;
\q
```

### **3. Update Environment**
Edit `.env` with your PostgreSQL credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lift
DB_USER=postgres
DB_PASSWORD=your_password_here
```

### **4. Initialize Database**
```bash
npm run init-db
```

### **5. Start Full Application**
```bash
# Start both API server and frontend
npm run dev:full

# Or start separately:
# Terminal 1: npm run api
# Terminal 2: npm run dev
```

## 🔧 Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend only |
| `npm run api` | Start API server only |
| `npm run dev:full` | Start both frontend and API |
| `npm run init-db` | Initialize database |
| `npm run test-db` | Test database connection |

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/init-db` | POST | Initialize database |
| `/api/startups` | GET | Get all startups |
| `/api/startups/category/:category` | GET | Get startups by category |
| `/api/startups` | POST | Create startup |
| `/api/startups/:id` | PUT | Update startup |
| `/api/startups/:id` | DELETE | Delete startup |
| `/api/leaderboard` | GET | Get leaderboard |

## 🎯 Features Added

### **Loading States:**
- Skeleton loaders while data is fetching
- Error handling with user-friendly messages

### **Real-time Data:**
- React Query for caching and background updates
- Automatic refetching on focus/reconnect

### **Database Operations:**
- Add new startups
- Update existing startups
- Delete startups
- Filter by category
- Dynamic leaderboard ranking

## 🔍 Testing the Migration

### **1. Check Database Connection:**
```bash
npm run test-db
```

### **2. Initialize Sample Data:**
```bash
npm run init-db
```

### **3. Start Application:**
```bash
npm run dev:full
```

### **4. Verify in Browser:**
- Visit `http://localhost:8080`
- Check that startups load from database
- Verify leaderboard shows database data
- Test filtering functionality

## 🐛 Troubleshooting

### **Database Connection Issues:**
1. Ensure PostgreSQL is running
2. Check credentials in `.env`
3. Verify database exists
4. Test connection: `npm run test-db`

### **API Server Issues:**
1. Check if port 3001 is available
2. Verify API server is running: `npm run api`
3. Test health endpoint: `http://localhost:3001/health`

### **Frontend Issues:**
1. Ensure API server is running
2. Check browser console for errors
3. Verify CORS settings

## 🎉 Success Indicators

✅ **Database connected successfully**  
✅ **API server running on port 3001**  
✅ **Frontend loading data from database**  
✅ **Loading states working**  
✅ **Error handling working**  
✅ **Filtering by category working**  
✅ **Leaderboard showing database data**

## 📈 Next Steps

1. **Add Authentication** - User login/registration
2. **Admin Panel** - Manage startups through UI
3. **Real-time Updates** - WebSocket integration
4. **Advanced Filtering** - Search and sort options
5. **Data Analytics** - Charts and insights
6. **File Uploads** - Startup logos and documents

## 🆘 Support

If you encounter issues:
1. Check the console for error messages
2. Verify all services are running
3. Check database connection
4. Review the troubleshooting section above

The migration is complete! Your application now uses PostgreSQL for persistent data storage. 🎊
