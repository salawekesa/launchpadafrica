import { initializeDatabase } from '../lib/database';

const initStartupsTable = async () => {
  console.log('🚀 Initializing startups table with new schema...');
  
  try {
    const success = await initializeDatabase();
    
    if (success) {
      console.log('✅ Startups table initialized successfully!');
      console.log('📊 Status codes:');
      console.log('   1 = Pending (default for new submissions)');
      console.log('   2 = Approved');
      console.log('   3 = Under Review');
      console.log('   4 = Rejected');
    } else {
      console.error('❌ Failed to initialize startups table');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error initializing startups table:', error);
    process.exit(1);
  }
};

initStartupsTable();
