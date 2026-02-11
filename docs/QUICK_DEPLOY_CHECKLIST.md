# Quick Hostinger cPanel Deployment Checklist

## Before You Start

- You have Hostinger Business hosting or higher (Node.js support required)
- You have cPanel access
- Your build is complete: `npm run build`

## 1. Prepare Your Files

Create `.env` in project root with DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, PORT=3000, NODE_ENV=production.

Files to upload (ZIP): package.json, package-lock.json, server.js, dist/, src/, .env. Skip: node_modules, .git, vite.config.ts.

## 2. Setup PostgreSQL in cPanel

cPanel → PostgreSQL Databases → Create database and user → Add user to database with ALL PRIVILEGES. Note database name, username, password.

## 3. Setup Node.js App in cPanel

cPanel → Setup Node.js App → Create Application. Node 18.x or 20.x, Production, Application root (e.g. public_html), Startup file: server.js. Add env vars: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, NODE_ENV, PORT. Save.

## 4. Upload Files

File Manager → public_html → Upload ZIP → Extract → Delete ZIP. Or use FTP.

## 5. Install and Start

Setup Node.js App → Run NPM Install → Restart.

## 6. Initialize Database

cPanel Terminal or SSH: `cd public_html` then `npm run init-db`.

## 7. Test

- Main site: https://yourdomain.com
- Health: https://yourdomain.com/api/health
- API: https://yourdomain.com/api/startups

## If Something's Wrong

- Site won't load: Check Application Log, verify server.js, click Restart.
- package.json required: Confirm root path in Node.js App settings.
- Database errors: Verify env vars, run `npm run test-db`, check PostgreSQL in cPanel.

Full guide: `docs/HOSTINGER_CPANEL_GUIDE.md`.

## To Update Later

1. `npm run build` 2. Upload new dist/ 3. Restart in Setup Node.js App.

Good luck.
