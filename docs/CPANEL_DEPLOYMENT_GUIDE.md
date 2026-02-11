# cPanel Deployment Guide

## ✅ Build Complete

Your production build has been generated successfully in the `dist` folder.

## 📦 What Was Built

- **Location**: `plp-spark-launch/dist/`
- **Files Generated**:
  - `index.html` (1.50 kB)
  - `assets/index-Cm-T49Lj.css` (66.94 kB)
  - `assets/index-B0XePZqh.js` (752.08 kB)

## 🚀 Deployment Steps for cPanel

### Method 1: Using File Manager (Recommended for Small Projects)

1. **Log in to cPanel**
   - Navigate to your hosting provider's cPanel URL
   - Enter your credentials

2. **Access File Manager**
   - Find and click on "File Manager" in cPanel
   - Navigate to `public_html` (or your domain's document root)

3. **Clear Existing Files (if updating)**
   - Select all files in `public_html`
   - Delete them (backup first if needed!)

4. **Upload Your Build**
   - Click "Upload" button in File Manager
   - Select ALL files from your `dist` folder:
     - `index.html`
     - `assets` folder (entire folder)
     - `favicon.ico` (if present)
     - `robots.txt` (if present)
     - Any other files in the `dist` folder

5. **Extract (if you zip first - Recommended)**
   - Zip the contents of the `dist` folder on your local machine
   - Upload the zip file to `public_html`
   - Right-click the zip file in cPanel File Manager
   - Select "Extract"
   - Delete the zip file after extraction

### Method 2: Using FTP Client (Recommended for Larger Projects)

1. **Get FTP Credentials**
   - In cPanel, go to "FTP Accounts"
   - Note your FTP hostname, username, and password
   - Default port is usually 21

2. **Use FTP Client** (FileZilla, WinSCP, etc.)
   - Download FileZilla: https://filezilla-project.org/
   - Connect using your FTP credentials

3. **Upload Files**
   - Navigate to `public_html` on the remote side
   - Select all contents from your local `dist` folder
   - Drag and drop to upload

### Method 3: Using cPanel Terminal (if available)

```bash
# If you have SSH/Terminal access
cd public_html
# Upload using scp or rsync from your local machine
```

## 🔧 Important Configuration for React Router

Since your app uses React Router (`react-router-dom`), you need to configure URL rewriting:

### Create .htaccess file

In your `public_html` directory, create or update `.htaccess` file with:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</Module>
```

**To add this in cPanel:**
1. Go to File Manager
2. Click "Settings" (top right) and enable "Show Hidden Files"
3. Create or edit `.htaccess` in `public_html`
4. Paste the above content
5. Save

## 🔐 Environment Variables & API Configuration

**⚠️ IMPORTANT**: Your app uses a PostgreSQL database and API endpoints.

### For Static Hosting Only (No Backend)
If your cPanel hosting is **static hosting only** (no Node.js support):
- Your app will work for the UI only
- Database features will NOT work
- API calls will fail

### For Full Stack (Node.js Support Required)
You need to:

1. **Setup Node.js** (if available in cPanel)
   - Use "Setup Node.js App" in cPanel
   - Set Node.js version to 18.x or higher
   - Upload your entire project (not just dist)
   - Install dependencies: `npm install`
   - Start the app: `npm run dev:full`

2. **Configure Database**
   - Create PostgreSQL database in cPanel
   - Update connection details (you'll need to create a `.env` file)

3. **Environment Variables**
   - Create `.env` file in project root:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/dbname
   PORT=3000
   ```

## 🌐 Subdirectory Deployment

If deploying to a subdirectory (e.g., `yourdomain.com/app`):

1. **Update vite.config.ts** before building:
```typescript
export default defineConfig(({ mode }) => ({
  base: '/app/', // Your subdirectory name
  // ... rest of config
}));
```

2. **Rebuild**: `npm run build`

3. **Upload to**: `public_html/app/`

## ✅ Post-Deployment Checklist

- [ ] All files uploaded successfully
- [ ] `.htaccess` file created for React Router
- [ ] Website loads at your domain
- [ ] All pages are accessible (test navigation)
- [ ] Images and assets load correctly
- [ ] No console errors (press F12 in browser)
- [ ] Mobile responsiveness check
- [ ] API endpoints tested (if applicable)

## 🐛 Common Issues & Solutions

### Issue: Page refreshes show 404 error
**Solution**: Add the `.htaccess` file (see above)

### Issue: Assets not loading (blank page)
**Solution**: 
- Check browser console for errors
- Verify all files uploaded correctly
- Check if base path is configured correctly

### Issue: "Mixed Content" errors (HTTP/HTTPS)
**Solution**: 
- Enable SSL in cPanel
- Use "Force HTTPS Redirect" option

### Issue: Database/API not working
**Solution**: 
- Static hosting doesn't support backend
- You need Node.js hosting or a separate backend server
- Consider deploying backend separately (Heroku, Railway, etc.)

## 🎯 Quick Commands Summary

```bash
# Generate production build
cd plp-spark-launch
npm run build

# The dist folder contains all files needed for deployment
# Simply upload everything inside the dist/ folder to your cPanel public_html
```

## 📁 File Structure After Upload

Your `public_html` should look like:
```
public_html/
├── index.html
├── assets/
│   ├── index-Cm-T49Lj.css
│   └── index-B0XePZqh.js
├── favicon.ico
├── robots.txt
└── .htaccess (you create this)
```

## 🆘 Need Help?

If you encounter issues:
1. Check browser console (F12) for JavaScript errors
2. Verify all files are uploaded
3. Confirm `.htaccess` is properly configured
4. Contact your hosting provider for Node.js/database setup

---

**Note**: This is a React SPA with database functionality. For full functionality, you'll need Node.js hosting or deploy the backend separately.
