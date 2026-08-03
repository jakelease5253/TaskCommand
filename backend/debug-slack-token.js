const storage = require('./services/storageService');
const slackService = require('./services/slackService');

async function debugToken() {
  try {
    const mapping = await storage.getSlackUserMapping('9d51b9d0-2c22-4ff7-9dcd-ebfef243b918');

    console.log('Slack Mapping:', {
      slackUserId: mapping.slackUserId,
      slackTeamId: mapping.slackTeamId,
      connectedAt: mapping.connectedAt,
      tokenLength: mapping.accessToken ? mapping.accessToken.length : 0,
      tokenStart: mapping.accessToken ? mapping.accessToken.substring(0, 10) + '...' : 'none'
    });

    // Try to send a test message
    console.log('\nAttempting to send test message...');
    try {
      await slackService.sendDirectMessage(
        mapping.slackUserId,
        'Test notification from debug script',
        []
      );
      console.log('✅ Message sent successfully!');
    } catch (error) {
      console.log('❌ Message send failed:', error.message);

      // Check if it's specifically invalid_auth
      if (error.message.includes('invalid_auth')) {
        console.log('\nThis is an invalid_auth error from Slack.');
        console.log('The token exists but Slack is rejecting it.');
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

debugToken();
