import { testConnection, initializeDatabase } from '../lib/database';

const initDatabase = async () => {
  console.log('🚀 Initializing database...');
  
  // Test connection
  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Failed to connect to database. Please check your connection settings.');
    process.exit(1);
  }

  // Initialize database
  const initialized = await initializeDatabase();
  if (!initialized) {
    console.error('❌ Failed to initialize database.');
    process.exit(1);
  }

  console.log('✅ Database setup complete!');
  process.exit(0);
};

initDatabase().catch((error) => {
  console.error('❌ Database initialization failed:', error);
  process.exit(1);
});
