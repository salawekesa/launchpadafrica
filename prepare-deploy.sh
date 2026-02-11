#!/bin/bash
# Prepare deployment package for Hostinger cPanel

echo "🚀 Preparing deployment package for Hostinger cPanel..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  WARNING: .env file not found!"
    echo ""
    echo "Creating .env from example..."
    cat > .env << 'EOF'
# Database Configuration - UPDATE THESE!
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password

# Server Configuration
PORT=3000
NODE_ENV=production
EOF
    echo "✅ .env file created. IMPORTANT: Edit it with your database credentials!"
    echo ""
fi

# Check if build exists
if [ ! -d dist ]; then
    echo "❌ dist folder not found! Running build..."
    npm run build
    echo ""
fi

# Create deployment package
echo "📦 Creating deployment package..."
echo ""

# Create a temporary directory
mkdir -p deploy-package

# Copy necessary files
echo "Copying files..."
cp package.json deploy-package/
cp package-lock.json deploy-package/
cp server.js deploy-package/
cp .env deploy-package/
cp -r dist deploy-package/
cp -r src deploy-package/

echo ""
echo "✅ Deployment package ready in 'deploy-package' folder!"
echo ""
echo "📋 Next steps:"
echo "1. Edit deploy-package/.env with your database credentials"
echo "2. Create a ZIP of the deploy-package folder contents"
echo "3. Upload to your Hostinger cPanel"
echo "4. Follow the guide in HOSTINGER_CPANEL_GUIDE.md"
echo ""
echo "Files included:"
ls -lh deploy-package/
echo ""
echo "🎯 Quick guide: QUICK_DEPLOY_CHECKLIST.md"
echo "📖 Full guide: HOSTINGER_CPANEL_GUIDE.md"


