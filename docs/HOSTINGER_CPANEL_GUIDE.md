# 🚀 Hostinger cPanel Node.js Deployment Guide

## Overview
This guide will help you deploy your PLP Spark Launch application to Hostinger cPanel with Node.js support.

## ✅ Prerequisites

1. **Hostinger cPanel with Node.js Support**
   - Business or higher hosting plan (Node.js not available on basic shared hosting)
   - Access to cPanel
   - PostgreSQL database support

2. **Local Setup Complete**
   - Application built: `npm run build` ✅ (Already done)
   - All dependencies installed

---

## 📦 Step 1: Prepare Files for Upload

### Files to Upload (Entire Project)
You need to upload these files/folders to Hostinger:

```
✅ package.json          (Required - npm dependencies)
✅ package-lock.json     (Lock file for exact versions)
✅ server.js             (New production server)
✅ dist/                 (Built frontend files)
✅ src/                  (Source code for API)
✅ node_modules/         (Optional - can install on server)
✅ .env                  (Create this with your DB credentials)
```

### Files NOT to Upload
```
❌ node_modules/         (Better to install on server)
❌ .git/                 
❌ vite.config.ts
❌ tsconfig.json
❌ eslint.config.js
```

---

## 📋 Step 2: Create .env File

Create a `.env` file in your project root with your database credentials:

```env
# Database Configuration (Get these from cPanel)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password

# Server Configuration
PORT=3000
NODE_ENV=production
```

### How to Get Database Credentials from Hostinger:
1. Log into Hostinger cPanel
2. Go to **"Databases" → "PostgreSQL Databases"**
3. Create a new database if needed
4. Note down:
   - Database name
   - Database user
   - Password
   - Host (usually `localhost`)

---

## 🌐 Step 3: Create PostgreSQL Database

1. **In Hostinger cPanel**:
   - Go to **"PostgreSQL Databases"**
   - Create a new database: `yourusername_lift` (example)
   - Create a database user
   - Add user to database with ALL PRIVILEGES

2. **Initialize Database Tables**:
   - After uploading your files and setting up Node.js
   - SSH into your server or use cPanel Terminal
   - Run: `npm run init-db`

---

## 🔧 Step 4: Setup Node.js Application in cPanel

### 4.1 Access Setup Node.js App
1. Log into Hostinger cPanel
2. Find **"Setup Node.js App"** in the Software section
3. Click **"Create Application"**

### 4.2 Configure Node.js Application

Fill in these settings:

| Setting | Value |
|---------|-------|
| **Node.js version** | 18.x or higher (latest LTS) |
| **Application mode** | Production |
| **Application root** | `public_html` (or your domain folder) |
| **Application URL** | Your domain (e.g., yourdomain.com) |
| **Application startup file** | `server.js` |
| **Passenger log file** | (leave default) |

### 4.3 Set Environment Variables

In the same Node.js App setup:

1. Scroll to **"Environment variables"**
2. Add each variable from your `.env` file:
   - `DB_HOST` = `localhost`
   - `DB_PORT` = `5432`
   - `DB_NAME` = `your_database_name`
   - `DB_USER` = `your_database_user`
   - `DB_PASSWORD` = `your_database_password`
   - `NODE_ENV` = `production`
   - `PORT` = `3000`

3. Click **"Save"**

---

## 📤 Step 5: Upload Files

### Option A: File Manager (Recommended)

1. **Compress Your Project**:
   ```bash
   # In your local project directory (plp-spark-launch)
   # Exclude node_modules to save time
   ```
   - Create a ZIP of these files:
     - `package.json`
     - `package-lock.json`
     - `server.js`
     - `dist/` folder
     - `src/` folder
     - `.env` (with your credentials)

2. **Upload to cPanel**:
   - Go to **File Manager** in cPanel
   - Navigate to your application root (e.g., `public_html`)
   - Click **"Upload"**
   - Upload your ZIP file
   - Right-click → **"Extract"**
   - Delete the ZIP file after extraction

### Option B: FTP

1. Use FileZilla or similar FTP client
2. Connect to your Hostinger FTP:
   - Host: Your domain or FTP host from cPanel
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21
3. Upload all necessary files

---

## 🔨 Step 6: Install Dependencies

1. **Go back to "Setup Node.js App"** in cPanel
2. Find your application
3. Click **"Run NPM Install"** button
4. Wait for installation to complete (may take 2-5 minutes)

Alternatively, if you have SSH access:
```bash
ssh your-username@your-domain.com
cd public_html  # or your app directory
npm install
```

---

## 🚀 Step 7: Start the Application

1. In **"Setup Node.js App"** page
2. Click **"Restart"** button
3. Your app should now be running!

---

## 🧪 Step 8: Test Your Deployment

### Test these URLs:

1. **Main Site**: `https://yourdomain.com`
   - Should show your React app

2. **API Health Check**: `https://yourdomain.com/api/health`
   - Should return: `{"status":"ok","timestamp":"...","env":"production"}`

3. **Startups API**: `https://yourdomain.com/api/startups`
   - Should return startup data (might be empty initially)

### If you see errors:
- Check the **Application Log** in Setup Node.js App
- Verify environment variables are set correctly
- Check database connection

---

## 🗄️ Step 9: Initialize Database (First Time Only)

If you haven't set up the database tables:

### Option A: Using cPanel Terminal
1. Go to **"Terminal"** in cPanel
2. Navigate to your app directory:
   ```bash
   cd public_html  # or your app folder
   ```
3. Run database initialization:
   ```bash
   npm run init-db
   ```

### Option B: Using SSH
```bash
ssh your-username@your-domain.com
cd public_html
npm run init-db
```

This will create all necessary tables for startups, users, etc.

---

## 📱 Your File Structure on Server

After upload, your server should look like:

```
public_html/
├── .env                    (Your environment variables)
├── package.json            (Dependencies)
├── package-lock.json       (Lock file)
├── server.js              (Production server)
├── dist/                  (Built frontend)
│   ├── index.html
│   ├── assets/
│   └── ...
├── src/                   (Source code for API)
│   ├── lib/
│   │   ├── database.ts
│   │   └── db-service.ts
│   ├── server/
│   └── scripts/
└── node_modules/          (Installed by npm install)
```

---

## 🔄 Updating Your Application

When you make changes:

1. **Rebuild locally**:
   ```bash
   npm run build
   ```

2. **Upload changed files**:
   - Upload new `dist/` folder
   - Upload any changed server files

3. **Restart application**:
   - Go to "Setup Node.js App"
   - Click "Restart"

---

## ⚠️ Common Issues & Solutions

### Issue 1: "package.json file is required"
**Solution**: 
- Make sure package.json is in the root of your application directory
- Verify Application root path is correct in Node.js App setup

### Issue 2: Application won't start
**Solution**:
- Check Application Log in Setup Node.js App
- Verify server.js exists in root
- Ensure Application startup file is set to server.js

### Issue 3: Database connection failed
**Solution**:
- Verify environment variables are set correctly
- Check DB credentials in cPanel → PostgreSQL Databases
- Make sure database exists and user has permissions
- Run `npm run test-db` to test connection

### Issue 4: 404 errors or blank page
**Solution**:
- Verify `dist/` folder was uploaded with all contents
- Check that dist/index.html exists
- Restart the Node.js application

### Issue 5: API endpoints not working
**Solution**:
- Check if database is initialized: `npm run check-data`
- Verify API routes in browser console (F12)
- Check application logs

### Issue 6: "Cannot find module" errors
**Solution**:
- Run "NPM Install" again in Setup Node.js App
- Make sure all files in `src/` folder are uploaded
- Check that file paths are correct

---

## 🔍 Debugging Tips

1. **View Application Logs**:
   - In Setup Node.js App → Click "Open logs"
   - Or check the log file path shown in the app settings

2. **Browser Console**:
   - Press F12 → Console tab
   - Look for JavaScript errors or failed API calls

3. **Test Database Connection**:
   ```bash
   npm run test-db
   ```

4. **Check Environment**:
   - Verify all environment variables in Setup Node.js App
   - Make sure NODE_ENV is set to "production"

---

## 📊 Performance Tips

1. **Enable Gzip Compression** (usually enabled by default)
2. **Use CloudFlare** (Hostinger offers free CloudFlare integration)
3. **Optimize Database** with indexes (if needed)
4. **Monitor Resources** in cPanel

---

## 🔐 Security Checklist

- [ ] Database password is strong
- [ ] `.env` file is not publicly accessible
- [ ] SSL certificate is installed (HTTPS)
- [ ] Database user has minimal required permissions
- [ ] Regular backups enabled in Hostinger

---

## 📞 Support Resources

- **Hostinger Support**: https://www.hostinger.com/tutorials/how-to-deploy-nodejs-app-cpanel
- **Node.js Documentation**: https://nodejs.org/docs
- **cPanel Documentation**: https://docs.cpanel.net/

---

## ✅ Quick Deployment Checklist

- [ ] PostgreSQL database created in cPanel
- [ ] Database user created with permissions
- [ ] `.env` file created with correct credentials
- [ ] Project files uploaded to application root
- [ ] Node.js App configured in cPanel
- [ ] Environment variables set in Node.js App
- [ ] NPM Install completed
- [ ] Application started/restarted
- [ ] Database initialized (`npm run init-db`)
- [ ] Health check endpoint working
- [ ] Main site loading correctly
- [ ] API endpoints responding
- [ ] SSL certificate installed

---

## 🎉 Success!

Your PLP Spark Launch application should now be live on Hostinger!

**Your URLs**:
- Main Site: `https://yourdomain.com`
- API Health: `https://yourdomain.com/api/health`
- Startups API: `https://yourdomain.com/api/startups`
- Leaderboard: `https://yourdomain.com/api/leaderboard`

Need help? Check the application logs or contact Hostinger support!
