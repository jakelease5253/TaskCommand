/**
 * Initialize Azure Table Storage tables for Slack integration
 * Run this script once to set up the required tables
 */

const { initializeTables } = require('../services/storageService');

async function main() {
  console.log('Initializing Azure Table Storage tables...');
  console.log('Connection:', process.env.AzureWebJobsStorage || 'UseDevelopmentStorage=true');
  console.log('');

  try {
    await initializeTables();
    console.log('');
    console.log('✅ All tables initialized successfully!');
    console.log('');
    console.log('Tables created:');
    console.log('  - SlackUserMappings');
    console.log('  - NotificationPreferences');
    console.log('  - MilestoneTracking');
    console.log('  - SlackMessageTaskLinks');
  } catch (error) {
    console.error('❌ Error initializing tables:', error);
    process.exit(1);
  }
}

main();
