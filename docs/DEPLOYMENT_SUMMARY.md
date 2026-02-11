# 🎉 Deployment Package Ready for Hostinger cPanel!

## ✅ What's Been Done

### 1. Production Build
- ✅ Built optimized frontend files (`dist/` folder)
- ✅ Minified JavaScript and CSS
- ✅ All assets ready for production

### 2. Server Configuration
- ✅ Created `server.js` - Production server that serves both API and frontend
- ✅ Updated `package.json` with `start` script
- ✅ Configured to work with cPanel's Node.js environment

### 3. Deployment Package
- ✅ Created `deploy-package/` folder with all necessary files
- ✅ Ready to ZIP and upload to Hostinger

---

## 📦 What's in the Deploy Package

```
deploy-package/
├── package.json          ✅ Dependencies list
├── package-lock.json     ✅ Version lock file
├── server.js            ✅ Production server (NEW)
├── .env                 ⚠️  YOU NEED TO CREATE THIS!
├── dist/                ✅ Built frontend files
│   ├── index.html
│   └── assets/
└── src/                 ✅ Backend source code
    ├── lib/             (Database connections)
    ├── server/          (API endpoints)
    └── scripts/         (Database setup)
```

---

## ⚠️ CRITICAL: Before Upload

### You MUST create `.env` file in `deploy-package/` folder:

**File name**: `.env` (starts with a dot)

**Contents**:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
PORT=3000
NODE_ENV=production
```

**How to get database credentials**:
1. Log into Hostinger cPanel
2. Go to **PostgreSQL Databases**
3. Create a new database
4. Create a database user
5. Add user to database with ALL PRIVILEGES
6. Use those values in `.env`

---

## 🚀 Quick Deployment Steps

### Option 1: Use the Guide (Recommended)
📖 **Follow**: `docs/QUICK_DEPLOY_CHECKLIST.md` (20 minutes)

### Option 2: Quick Steps

1. **Create `.env`** in `deploy-package/` folder (see above)

2. **Create PostgreSQL Database** in Hostinger cPanel
   - Database name: `youruser_lift`
   - Create user with password
   - Grant ALL PRIVILEGES

3. **Setup Node.js App** in Hostinger cPanel
   - Go to: Setup Node.js App → Create Application
   - Node.js version: 18.x or 20.x
   - Application mode: Production
   - Application root: `public_html`
   - Startup file: `server.js`
   - Add all environment variables from `.env`

4. **Upload Files**
   - ZIP all files in `deploy-package/` folder
   - Upload to cPanel File Manager
   - Extract in your application root

5. **Install & Start**
   - In Setup Node.js App → "Run NPM Install"
   - Click "Restart"

6. **Initialize Database**
   - Open Terminal in cPanel
   - Run: `npm run init-db`

7. **Test**
   - Visit: `https://yourdomain.com`
   - Check: `https://yourdomain.com/api/health`

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `docs/QUICK_DEPLOY_CHECKLIST.md` | 20-minute quick guide |
| `docs/HOSTINGER_CPANEL_GUIDE.md` | Detailed instructions |
| `deploy-package/IMPORTANT_READ_FIRST.txt` | Critical reminders |
| `server.js` | Production server |
| `prepare-deploy.bat` / `prepare-deploy.sh` | Helper scripts |

---

## 📂 Where Things Are

```
plp-spark-launch/
├── deploy-package/              ← ZIP and upload this folder's contents
├── docs/                        ← All documentation (see docs/INDEX.md)
├── prepare-deploy.bat
└── prepare-deploy.sh
```

---

**Note**: This is a full-stack application with Node.js backend and PostgreSQL database. Make sure your Hostinger plan supports Node.js (Business hosting or higher).
