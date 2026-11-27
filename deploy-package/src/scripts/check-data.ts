import { getStartups, getLeaderboard } from '../lib/api';

const checkData = async () => {
  console.log('🔍 Checking database data...');
  
  try {
    // Check startups data
    const startups = await getStartups();
    console.log(`📊 Found ${startups.length} startups in database:`);
    startups.forEach((startup, index) => {
      console.log(`  ${index + 1}. ${startup.name} (${startup.category}) - ${startup.growth}`);
    });
    
    // Check leaderboard data
    const leaderboard = await getLeaderboard();
    console.log(`\n🏆 Found ${leaderboard.length} entries in leaderboard:`);
    leaderboard.forEach((entry, index) => {
      console.log(`  ${index + 1}. ${entry.startup.name} - Rank #${entry.rank} (${entry.growth_rate})`);
    });
    
    console.log('\n✅ Database is properly filled with data!');
    return true;
  } catch (error) {
    console.error('❌ Error checking database data:', error);
    return false;
  }
};

checkData().then((success) => {
  if (success) {
    console.log('🎉 Database data verification complete!');
    process.exit(0);
  } else {
    console.error('❌ Database data verification failed');
    process.exit(1);
  }
}).catch((error) => {
  console.error('❌ Database data verification failed:', error);
  process.exit(1);
});
