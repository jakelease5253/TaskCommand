/**
 * Test script to verify Azure Table Storage operations
 */

const storage = require('../services/storageService');

async function runTests() {
  console.log('🧪 Testing Azure Table Storage...\n');

  const testUserId = 'test-user-12345';
  const testSlackUserId = 'U12345ABC';
  const testSlackTeamId = 'T12345XYZ';

  try {
    // Test 1: Save and retrieve Slack user mapping
    console.log('Test 1: Slack User Mapping');
    console.log('  - Saving mapping...');
    await storage.saveSlackUserMapping(testUserId, {
      slackUserId: testSlackUserId,
      slackTeamId: testSlackTeamId,
      accessToken: 'xoxp-test-token-secret',
      refreshToken: 'xoxp-refresh-token-secret'
    });
    console.log('  ✅ Saved');

    console.log('  - Retrieving mapping...');
    const mapping = await storage.getSlackUserMapping(testUserId);
    console.log('  ✅ Retrieved:', {
      slackUserId: mapping.slackUserId,
      slackTeamId: mapping.slackTeamId,
      hasAccessToken: !!mapping.accessToken,
      hasRefreshToken: !!mapping.refreshToken,
      tokensDecrypted: mapping.accessToken === 'xoxp-test-token-secret'
    });

    // Test 2: Notification preferences
    console.log('\nTest 2: Notification Preferences');
    console.log('  - Getting default preferences...');
    const prefs = await storage.getNotificationPreferences(testUserId);
    console.log('  ✅ Got preferences:', {
      morningDigestEnabled: prefs.morningDigestEnabled,
      morningDigestTime: prefs.morningDigestTime,
      dailyKudosEnabled: prefs.dailyKudosEnabled,
      timezone: prefs.timezone
    });

    console.log('  - Updating preferences...');
    await storage.updateNotificationPreferences(testUserId, {
      morningDigestTime: '09:00',
      timezone: 'America/Los_Angeles'
    });
    console.log('  ✅ Updated');

    const updatedPrefs = await storage.getNotificationPreferences(testUserId);
    console.log('  ✅ Verified update:', {
      morningDigestTime: updatedPrefs.morningDigestTime,
      timezone: updatedPrefs.timezone
    });

    // Test 3: Milestone tracking
    console.log('\nTest 3: Milestone Tracking');
    console.log('  - Getting initial tracking...');
    const milestones = await storage.getMilestoneTracking(testUserId);
    console.log('  ✅ Initial state:', {
      totalTasksCompleted: milestones.totalTasksCompleted,
      currentStreak: milestones.currentStreak,
      longestStreak: milestones.longestStreak
    });

    console.log('  - Incrementing task completion...');
    const result1 = await storage.incrementTaskCompletion(testUserId);
    console.log('  ✅ First completion:', {
      totalTasksCompleted: result1.tracking.totalTasksCompleted,
      currentStreak: result1.tracking.currentStreak,
      newMilestones: result1.newMilestones
    });

    // Simulate completing 9 more tasks
    console.log('  - Completing 9 more tasks...');
    for (let i = 0; i < 9; i++) {
      await storage.incrementTaskCompletion(testUserId);
    }

    const result10 = await storage.incrementTaskCompletion(testUserId);
    console.log('  ✅ After 10 tasks:', {
      totalTasksCompleted: result10.tracking.totalTasksCompleted,
      currentStreak: result10.tracking.currentStreak,
      longestStreak: result10.tracking.longestStreak,
      newMilestones: result10.newMilestones
    });

    // Test 4: Cleanup
    console.log('\nTest 4: Cleanup');
    console.log('  - Deleting test mapping...');
    await storage.deleteSlackUserMapping(testUserId);
    console.log('  ✅ Deleted');

    const deletedMapping = await storage.getSlackUserMapping(testUserId);
    console.log('  ✅ Verified deletion:', deletedMapping === null);

    console.log('\n✅ All tests passed!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

runTests();
