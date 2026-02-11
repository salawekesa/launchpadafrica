import { testConnection, initializeDatabase } from '../lib/database';

const initUserTables = async () => {
  try {
    console.log('🔄 Initializing user tables and sample data...');
    
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Database connection failed');
      process.exit(1);
    }
    
    // Initialize database with new tables
    const success = await initializeDatabase();
    if (success) {
      console.log('✅ User tables initialized successfully');
      console.log('📊 New tables created:');
      console.log('   - users (user management)');
      console.log('   - user_activities (activity tracking)');
      console.log('   - user_interactions (support interactions)');
      console.log('   - startup_support (support features)');
      console.log('🎉 Database is ready for enhanced features!');
    } else {
      console.error('❌ Database initialization failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error initializing user tables:', error);
    process.exit(1);
  }
};

initUserTables();
