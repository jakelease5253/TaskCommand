/**
 * Slack API Service
 * Handles all Slack API interactions
 */

const fetch = require('isomorphic-fetch');

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID;
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET;
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;

/**
 * Exchange OAuth authorization code for access token
 */
async function exchangeOAuthCode(code, redirectUri) {
  const response = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: SLACK_CLIENT_ID,
      client_secret: SLACK_CLIENT_SECRET,
      code: code,
      redirect_uri: redirectUri
    })
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(`Slack OAuth error: ${data.error}`);
  }

  return {
    accessToken: data.access_token,
    tokenType: data.token_type,
    scope: data.scope,
    botUserId: data.bot_user_id,
    appId: data.app_id,
    teamId: data.team.id,
    teamName: data.team.name,
    enterpriseId: data.enterprise?.id,
    authedUser: {
      id: data.authed_user.id,
      scope: data.authed_user.scope,
      accessToken: data.authed_user.access_token,
      tokenType: data.authed_user.token_type
    }
  };
}

/**
 * Get Slack user info
 */
async function getUserInfo(accessToken, userId) {
  const response = await fetch(`https://slack.com/api/users.info?user=${userId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(`Slack API error: ${data.error}`);
  }

  return data.user;
}

/**
 * Send a direct message to a Slack user
 */
async function sendDirectMessage(accessToken, userId, blocks, text) {
  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      channel: userId,
      blocks: blocks,
      text: text // Fallback text for notifications
    })
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(`Slack API error: ${data.error}`);
  }

  return data;
}

/**
 * Update a message
 */
async function updateMessage(accessToken, channel, timestamp, blocks, text) {
  const response = await fetch('https://slack.com/api/chat.update', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      channel: channel,
      ts: timestamp,
      blocks: blocks,
      text: text
    })
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(`Slack API error: ${data.error}`);
  }

  return data;
}

/**
 * Verify Slack request signature
 * Protects against request forgery
 */
function verifySlackRequest(headers, body) {
  const crypto = require('crypto');

  const timestamp = headers['x-slack-request-timestamp'];
  const signature = headers['x-slack-signature'];

  // Check if required headers exist
  if (!timestamp || !signature) {
    console.error('Missing Slack signature headers');
    return false;
  }

  // Check if signing secret is configured
  if (!SLACK_SIGNING_SECRET) {
    console.error('SLACK_SIGNING_SECRET not configured');
    return false;
  }

  // Check timestamp to prevent replay attacks (within 5 minutes)
  const time = Math.floor(Date.now() / 1000);
  if (Math.abs(time - timestamp) > 60 * 5) {
    console.error('Slack request timestamp too old');
    return false;
  }

  // Compute expected signature
  const sigBaseString = `v0:${timestamp}:${body}`;
  const hmac = crypto.createHmac('sha256', SLACK_SIGNING_SECRET);
  const expectedSignature = 'v0=' + hmac.update(sigBaseString).digest('hex');

  // Compare signatures
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    );
  } catch (error) {
    console.error('Error comparing signatures:', error.message);
    return false;
  }
}

module.exports = {
  exchangeOAuthCode,
  getUserInfo,
  sendDirectMessage,
  updateMessage,
  verifySlackRequest
};
