@echo off
REM Prepare deployment package for Hostinger cPanel (Windows)

echo 🚀 Preparing deployment package for Hostinger cPanel...
echo.

REM Check if .env exists
if not exist .env (
    echo ⚠️  WARNING: .env file not found!
    echo.
    echo Creating .env from example...
    (
        echo # Database Configuration - UPDATE THESE!
        echo DB_HOST=localhost
        echo DB_PORT=5432
        echo DB_NAME=your_database_name
        echo DB_USER=your_database_user
        echo DB_PASSWORD=your_database_password
        echo.
        echo # Server Configuration
        echo PORT=3000
        echo NODE_ENV=production
    ) > .env
    echo ✅ .env file created. IMPORTANT: Edit it with your database credentials!
    echo.
)

REM Check if build exists
if not exist dist (
    echo ❌ dist folder not found! Running build...
    call npm run build
    echo.
)

REM Create deployment package
echo 📦 Creating deployment package...
echo.

REM Create a temporary directory
if exist deploy-package rmdir /s /q deploy-package
mkdir deploy-package

REM Copy necessary files
echo Copying files...
copy package.json deploy-package\ >nul
copy package-lock.json deploy-package\ >nul
copy server.js deploy-package\ >nul
copy .env deploy-package\ >nul
xcopy /E /I /Y dist deploy-package\dist >nul
xcopy /E /I /Y src deploy-package\src >nul

echo.
echo ✅ Deployment package ready in 'deploy-package' folder!
echo.
echo 📋 Next steps:
echo 1. Edit deploy-package\.env with your database credentials
echo 2. ZIP the contents of the deploy-package folder
echo 3. Upload to your Hostinger cPanel
echo 4. Follow the guide in HOSTINGER_CPANEL_GUIDE.md
echo.
echo 🎯 Quick guide: QUICK_DEPLOY_CHECKLIST.md
echo 📖 Full guide: HOSTINGER_CPANEL_GUIDE.md
echo.
pause


