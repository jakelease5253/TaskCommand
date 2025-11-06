const { app } = require('@azure/functions');
const { getAllCompanyTasks } = require('./services/graphClient');
const { validateUserToken, checkManagerAuthorization } = require('./utils/auth');
const { Client } = require('@microsoft/microsoft-graph-client');
const { ClientSecretCredential } = require('@azure/identity');
const slackService = require('./services/slackService');
const storage = require('./services/storageService');
const slackCommands = require('./services/slackCommands');
const taskPollingService = require('./services/taskPollingService');
const morningDigestService = require('./services/morningDigestService');

/**
 * Azure Function: Get Company Tasks
 *
 * Endpoint: GET /api/tasks/company
 * Auth: Requires valid user token in Authorization header
 *
 * Returns all company-wide tasks using application permissions
 */
app.http('GetCompanyTasks', {
  methods: ['GET'],
  route: 'tasks/company',
  authLevel: 'anonymous',
  handler: async (request, context) => {
    context.log('GetCompanyTasks function triggered');

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Content-Type': 'application/json'
    };

    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
      return {
        status: 200,
        headers: corsHeaders
      };
    }

    try {
      // Extract and validate user token from Authorization header
      const authHeader = request.headers.get('authorization');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        context.error('No authorization header provided');
        return {
          status: 401,
          headers: corsHeaders,
          jsonBody: {
            error: 'Unauthorized',
            message: 'Authorization header with Bearer token required'
          }
        };
      }

      const userToken = authHeader.substring(7);

      // Validate user's token
      context.log('Validating user token...');
      let user;
      try {
        user = await validateUserToken(userToken);
        context.log(`User validated: ${user.displayName}`);
      } catch (err) {
        context.error('Token validation failed:', err.message);
        return {
          status: 401,
          headers: corsHeaders,
          jsonBody: {
            error: 'Unauthorized',
            message: 'Invalid or expired token'
          }
        };
      }

      // Check if user has manager permissions
      context.log('Checking manager authorization...');
      try {
        await checkManagerAuthorization(user, userToken);
      } catch (err) {
        context.error('Authorization check failed:', err.message);
        return {
          status: 403,
          headers: corsHeaders,
          jsonBody: {
            error: 'Forbidden',
            message: 'Insufficient permissions to access manager dashboard'
          }
        };
      }

      // Fetch all company tasks using application permissions
      context.log('Fetching company-wide tasks...');
      const data = await getAllCompanyTasks();

      context.log(`Successfully returned ${data.tasks.length} tasks`);

      return {
        status: 200,
        headers: corsHeaders,
        jsonBody: {
          success: true,
          data,
          metadata: {
            totalTasks: data.tasks.length,
            totalPlans: Object.keys(data.plans).length,
            timestamp: new Date().toISOString()
          }
        }
      };

    } catch (err) {
      context.error('Error in GetCompanyTasks:', err);

      return {
        status: 500,
        headers: corsHeaders,
        jsonBody: {
          error: 'Internal Server Error',
          message: 'Failed to fetch company tasks',
          details: process.env.NODE_ENV === 'development' ? err.message : undefined
        }
      };
    }
  }
});

/**
 * Azure Function: Complete Task
 *
 * Endpoint: POST /api/tasks/:taskId/complete
 * Auth: Requires valid user token in Authorization header
 *
 * Completes a task using application permissions
 */
app.http('CompleteTask', {
  methods: ['POST', 'OPTIONS'],
  route: 'tasks/{taskId}/complete',
  authLevel: 'anonymous',
  handler: async (request, context) => {
    context.log('CompleteTask function triggered');

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Content-Type': 'application/json'
    };

    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
      return {
        status: 204,
        headers: corsHeaders
      };
    }

    try {
      // Extract and validate user token from Authorization header
      const authHeader = request.headers.get('authorization');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        context.error('No authorization header provided');
        return {
          status: 401,
          headers: corsHeaders,
          jsonBody: {
            error: 'Unauthorized',
            message: 'Authorization header with Bearer token required'
          }
        };
      }

      const userToken = authHeader.substring(7);

      // Validate user's token
      context.log('Validating user token...');
      let user;
      try {
        user = await validateUserToken(userToken);
        context.log(`User validated: ${user.displayName}`);
      } catch (err) {
        context.error('Token validation failed:', err.message);
        return {
          status: 401,
          headers: corsHeaders,
          jsonBody: {
            error: 'Unauthorized',
            message: 'Invalid or expired token'
          }
        };
      }

      // Check if user has manager permissions
      context.log('Checking manager authorization...');
      try {
        await checkManagerAuthorization(user, userToken);
      } catch (err) {
        context.error('Authorization check failed:', err.message);
        return {
          status: 403,
          headers: corsHeaders,
          jsonBody: {
            error: 'Forbidden',
            message: 'Insufficient permissions to complete tasks'
          }
        };
      }

      // Get taskId from route parameter
      const taskId = request.params.taskId;
      if (!taskId) {
        return {
          status: 400,
          headers: corsHeaders,
          jsonBody: {
            error: 'Bad Request',
            message: 'Task ID is required'
          }
        };
      }

      context.log(`Completing task ${taskId} using application permissions`);

      // Create Graph client with application permissions
      const credential = new ClientSecretCredential(
        process.env.AZURE_TENANT_ID,
        process.env.AZURE_CLIENT_ID,
        process.env.AZURE_CLIENT_SECRET
      );

      const client = Client.initWithMiddleware({
        authProvider: {
          getAccessToken: async () => {
            const token = await credential.getToken('https://graph.microsoft.com/.default');
            return token.token;
          }
        }
      });

      // First, fetch the task to get the current etag
      const task = await client
        .api(`/planner/tasks/${taskId}`)
        .get();

      context.log(`Fetched task etag: ${task['@odata.etag']}`);

      // Update the task to mark it as complete
      await client
        .api(`/planner/tasks/${taskId}`)
        .header('If-Match', task['@odata.etag'])
        .patch({
          percentComplete: 100
        });

      context.log(`Task ${taskId} completed successfully`);

      return {
        status: 200,
        headers: corsHeaders,
        jsonBody: {
          success: true,
          taskId: taskId,
          message: 'Task completed successfully'
        }
      };

    } catch (error) {
      context.error('Error completing task:', error);

      return {
        status: 500,
        headers: corsHeaders,
        jsonBody: {
          error: 'Internal Server Error',
          message: 'Failed to complete task',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      };
    }
  }
});
/**
 * Azure Function: Reopen Task
 *
 * Endpoint: POST /api/tasks/{taskId}/reopen
 * Auth: Requires valid user token in Authorization header + manager permissions
 *
 * Reopens a completed task by setting percentComplete back to 0
 */
app.http('ReopenTask', {
  methods: ['POST', 'OPTIONS'],
  route: 'tasks/{taskId}/reopen',
  authLevel: 'anonymous',
  handler: async (request, context) => {
    context.log('ReopenTask function triggered');

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Content-Type': 'application/json'
    };

    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
      return {
        status: 204,
        headers: corsHeaders
      };
    }

    try {
      // Extract and validate user token from Authorization header
      const authHeader = request.headers.get('authorization');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        context.error('No authorization header provided');
        return {
          status: 401,
          headers: corsHeaders,
          jsonBody: {
            error: 'Unauthorized',
            message: 'Authorization header with Bearer token required'
          }
        };
      }

      const userToken = authHeader.substring(7);

      // Validate user's token
      context.log('Validating user token...');
      let user;
      try {
        user = await validateUserToken(userToken);
        context.log(`User validated: ${user.displayName}`);
      } catch (err) {
        context.error('Token validation failed:', err.message);
        return {
          status: 401,
          headers: corsHeaders,
          jsonBody: {
            error: 'Unauthorized',
            message: 'Invalid or expired token'
          }
        };
      }

      // Check if user has manager permissions
      context.log('Checking manager authorization...');
      try {
        await checkManagerAuthorization(user, userToken);
      } catch (err) {
        context.error('Authorization check failed:', err.message);
        return {
          status: 403,
          headers: corsHeaders,
          jsonBody: {
            error: 'Forbidden',
            message: 'Insufficient permissions to reopen tasks'
          }
        };
      }

      // Get taskId from route parameter
      const taskId = request.params.taskId;
      if (!taskId) {
        return {
          status: 400,
          headers: corsHeaders,
          jsonBody: {
            error: 'Bad Request',
            message: 'Task ID is required'
          }
        };
      }

      context.log(`Reopening task ${taskId} using application permissions`);

      // Create Graph client with application permissions
      const credential = new ClientSecretCredential(
        process.env.AZURE_TENANT_ID,
        process.env.AZURE_CLIENT_ID,
        process.env.AZURE_CLIENT_SECRET
      );

      const client = Client.initWithMiddleware({
        authProvider: {
          getAccessToken: async () => {
            const token = await credential.getToken('https://graph.microsoft.com/.default');
            return token.token;
          }
        }
      });

      // First, fetch the task to get the current etag
      const task = await client
        .api(`/planner/tasks/${taskId}`)
        .get();

      context.log(`Fetched task etag: ${task['@odata.etag']}`);

      // Update the task to reopen it (set to not started)
      await client
        .api(`/planner/tasks/${taskId}`)
        .header('If-Match', task['@odata.etag'])
        .patch({
          percentComplete: 0
        });

      context.log(`Task ${taskId} reopened successfully`);

      return {
        status: 200,
        headers: corsHeaders,
        jsonBody: {
          success: true,
          taskId: taskId,
          message: 'Task reopened successfully'
        }
      };

    } catch (error) {
      context.error('Error reopening task:', error);

      return {
        status: 500,
        headers: corsHeaders,
        jsonBody: {
          error: 'Internal Server Error',
          message: 'Failed to reopen task',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      };
    }
  }
});

/**
 * Azure Function: Slack OAuth Callback
 *
 * Endpoint: GET /api/slack/oauth/callback
 * Auth: None (public OAuth endpoint)
 *
 * Handles OAuth callback from Slack after user authorizes
 */
app.http('SlackOAuthCallback', {
  methods: ['GET'],
  route: 'slack/oauth/callback',
  authLevel: 'anonymous',
  handler: async (request, context) => {
    context.log('SlackOAuthCallback function triggered');

    try {
      // Get authorization code and state from query parameters
      const code = request.query.get('code');
      const state = request.query.get('state');
      const error = request.query.get('error');

      // Handle OAuth denial
      if (error) {
        context.error(`OAuth error: ${error}`);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return {
          status: 302,
          headers: {
            'Location': `${frontendUrl}/?view=settings&slack_error=access_denied`
          }
        };
      }

      if (!code || !state) {
        context.error('Missing code or state parameter');
        return {
          status: 400,
          body: 'Missing required parameters'
        };
      }

      // Decode and parse state parameter
      let stateData;
      try {
        stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
        context.log(`State data: ${JSON.stringify(stateData)}`);
      } catch (err) {
        context.error('Invalid state parameter:', err);
        return {
          status: 400,
          body: 'Invalid state parameter'
        };
      }

      const azureUserId = stateData.userId;
      const returnUrl = stateData.returnUrl || 'http://localhost:5173/';

      // Exchange authorization code for access token
      context.log('Exchanging OAuth code for access token...');
      let redirectUri = `${request.url.split('?')[0]}`; // Get callback URL without query params

      // ngrok always uses HTTPS, but forwards as HTTP - fix the protocol
      if (redirectUri.includes('ngrok') && redirectUri.startsWith('http://')) {
        redirectUri = redirectUri.replace('http://', 'https://');
      }

      context.log(`Redirect URI: ${redirectUri}`);
      context.log(`Code: ${code.substring(0, 20)}...`);

      const oauthResult = await slackService.exchangeOAuthCode(code, redirectUri);

      context.log(`OAuth successful. Slack User ID: ${oauthResult.authedUser.id}`);
      context.log('OAuth result structure:', JSON.stringify(oauthResult, null, 2));

      // Save Slack user mapping
      // Note: We use the bot token because we're only requesting bot scopes
      // The authedUser object only contains the user ID, not a separate user token
      context.log('Saving Slack user mapping...');
      context.log('Bot access token exists:', !!oauthResult.accessToken);
      await storage.saveSlackUserMapping(azureUserId, {
        slackUserId: oauthResult.authedUser.id,
        slackTeamId: oauthResult.teamId,
        accessToken: oauthResult.accessToken,  // Use bot token
        tokenType: oauthResult.tokenType
      });

      // Create default notification preferences
      context.log('Creating default notification preferences...');
      await storage.getNotificationPreferences(azureUserId); // This creates defaults if not exists

      // Initialize milestone tracking
      context.log('Initializing milestone tracking...');
      await storage.getMilestoneTracking(azureUserId); // This creates initial tracking if not exists

      context.log('Slack connection completed successfully');

      // Redirect back to Settings page with success
      const successUrl = `${returnUrl}?view=settings&slack_connected=true`;

      return {
        status: 302,
        headers: {
          'Location': successUrl
        }
      };

    } catch (error) {
      context.error('Error in Slack OAuth callback:', error);
      context.error('Error message:', error.message);
      context.error('Error stack:', error.stack);

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return {
        status: 302,
        headers: {
          'Location': `${frontendUrl}/?view=settings&slack_error=connection_failed&error_detail=${encodeURIComponent(error.message)}`
        }
      };
    }
  }
});

/**
 * Azure Function: Get Slack Connection Status
 *
 * Endpoint: GET /api/slack/connection/status
 * Auth: Requires valid user token
 *
 * Returns whether user has connected Slack and their preferences
 */
app.http('GetSlackConnectionStatus', {
  methods: ['GET', 'OPTIONS'],
  route: 'slack/connection/status',
  authLevel: 'anonymous',
  handler: async (request, context) => {
    context.log('GetSlackConnectionStatus function triggered');

    const corsHeaders = {
      'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
      return { status: 200, headers: corsHeaders };
    }

    try {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          status: 401,
          headers: corsHeaders,
          jsonBody: { error: 'Unauthorized' }
        };
      }

      const userToken = authHeader.substring(7);
      const user = await validateUserToken(userToken);
      const azureUserId = user.id;

      // Check if user has Slack connected
      const slackMapping = await storage.getSlackUserMapping(azureUserId);

      if (!slackMapping) {
        return {
          status: 200,
          headers: corsHeaders,
          jsonBody: {
            connected: false
          }
        };
      }

      // Get notification preferences
      const preferences = await storage.getNotificationPreferences(azureUserId);

      return {
        status: 200,
        headers: corsHeaders,
        jsonBody: {
          connected: true,
          slackUserId: slackMapping.slackUserId,
          slackTeamId: slackMapping.slackTeamId,
          connectedAt: slackMapping.connectedAt,
          preferences: preferences
        }
      };

    } catch (error) {
      context.error('Error getting Slack connection status:', error);
      context.error('Error message:', error.message);
      context.error('Error stack:', error.stack);
      return {
        status: 500,
        headers: corsHeaders,
        jsonBody: {
          error: 'Internal server error',
          message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to check connection status'
        }
      };
    }
  }
});

/**
 * Azure Function: Disconnect Slack
 *
 * Endpoint: DELETE /api/slack/connection
 * Auth: Requires valid user token
 *
 * Removes Slack connection for the user
 */
app.http('DisconnectSlack', {
  methods: ['DELETE', 'OPTIONS'],
  route: 'slack/connection',
  authLevel: 'anonymous',
  handler: async (request, context) => {
    context.log('DisconnectSlack function triggered');

    const corsHeaders = {
      'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
      return { status: 200, headers: corsHeaders };
    }

    try {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          status: 401,
          headers: corsHeaders,
          jsonBody: { error: 'Unauthorized' }
        };
      }

      const userToken = authHeader.substring(7);
      const user = await validateUserToken(userToken);
      const azureUserId = user.id;

      // Delete Slack user mapping
      await storage.deleteSlackUserMapping(azureUserId);

      context.log(`Slack disconnected for user ${azureUserId}`);

      return {
        status: 200,
        headers: corsHeaders,
        jsonBody: {
          success: true,
          message: 'Slack disconnected successfully'
        }
      };

    } catch (error) {
      context.error('Error disconnecting Slack:', error);
      return {
        status: 500,
        headers: corsHeaders,
        jsonBody: { error: 'Internal server error' }
      };
    }
  }
});

/**
 * Azure Function: Update Notification Preferences
 *
 * Endpoint: PUT /api/slack/preferences
 * Auth: Requires valid user token
 *
 * Updates user's Slack notification preferences
 */
app.http('UpdateSlackPreferences', {
  methods: ['PUT', 'OPTIONS'],
  route: 'slack/preferences',
  authLevel: 'anonymous',
  handler: async (request, context) => {
    context.log('UpdateSlackPreferences function triggered');

    const corsHeaders = {
      'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
      return { status: 200, headers: corsHeaders };
    }

    try {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          status: 401,
          headers: corsHeaders,
          jsonBody: { error: 'Unauthorized' }
        };
      }

      const userToken = authHeader.substring(7);
      const user = await validateUserToken(userToken);
      const azureUserId = user.id;

      // Parse request body
      const preferences = await request.json();

      // Update preferences
      const updated = await storage.saveNotificationPreferences(azureUserId, preferences);

      context.log(`Preferences updated for user ${azureUserId}`);

      return {
        status: 200,
        headers: corsHeaders,
        jsonBody: updated
      };

    } catch (error) {
      context.error('Error updating preferences:', error);
      return {
        status: 500,
        headers: corsHeaders,
        jsonBody: { error: 'Internal server error' }
      };
    }
  }
});

/**
 * Azure Function: Get Available Plans and Buckets
 *
 * Endpoint: GET /api/slack/plans
 * Auth: Requires valid user token
 *
 * Returns list of user's plans and buckets for default plan selection
 */
app.http('GetAvailablePlans', {
  methods: ['GET', 'OPTIONS'],
  route: 'slack/plans',
  authLevel: 'anonymous',
  handler: async (request, context) => {
    context.log('GetAvailablePlans function triggered');

    const corsHeaders = {
      'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
      return { status: 200, headers: corsHeaders };
    }

    try {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          status: 401,
          headers: corsHeaders,
          jsonBody: { error: 'Unauthorized' }
        };
      }

      const userToken = authHeader.substring(7);
      const user = await validateUserToken(userToken);

      // Get user's plans and buckets using application permissions
      const credential = new ClientSecretCredential(
        process.env.AZURE_TENANT_ID,
        process.env.AZURE_CLIENT_ID,
        process.env.AZURE_CLIENT_SECRET
      );

      const client = Client.initWithMiddleware({
        authProvider: {
          getAccessToken: async () => {
            const token = await credential.getToken('https://graph.microsoft.com/.default');
            return token.token;
          }
        }
      });

      // Get user's groups
      const groupsResponse = await client
        .api(`/users/${user.id}/memberOf/microsoft.graph.group`)
        .select('id,displayName')
        .filter("groupTypes/any(c:c eq 'Unified')")
        .get();

      const plansData = [];

      // For each group, get plans and buckets
      for (const group of groupsResponse.value || []) {
        try {
          const plansResponse = await client
            .api(`/groups/${group.id}/planner/plans`)
            .get();

          for (const plan of plansResponse.value || []) {
            try {
              const bucketsResponse = await client
                .api(`/planner/plans/${plan.id}/buckets`)
                .get();

              if (bucketsResponse.value && bucketsResponse.value.length > 0) {
                plansData.push({
                  planId: plan.id,
                  planName: plan.title,
                  groupName: group.displayName,
                  buckets: bucketsResponse.value.map(b => ({
                    bucketId: b.id,
                    bucketName: b.name
                  }))
                });
              }
            } catch (error) {
              context.error(`Error fetching buckets for plan ${plan.id}:`, error.message);
            }
          }
        } catch (error) {
          context.error(`Error fetching plans for group ${group.id}:`, error.message);
        }
      }

      return {
        status: 200,
        headers: corsHeaders,
        jsonBody: { plans: plansData }
      };

    } catch (error) {
      context.error('Error fetching plans:', error);
      return {
        status: 500,
        headers: corsHeaders,
        jsonBody: { error: 'Internal server error' }
      };
    }
  }
});

/**
 * Azure Function: Handle Slack Slash Commands
 *
 * Endpoint: POST /api/slack/commands
 * Auth: Slack request signature verification
 *
 * Handles all /taskcommand slash commands from Slack
 */
app.http('SlackCommands', {
  methods: ['POST'],
  route: 'slack/commands',
  authLevel: 'anonymous',
  handler: async (request, context) => {
    context.log('SlackCommands function triggered');

    try {
      // Get raw body for signature verification
      const body = await request.text();

      // Verify Slack request signature
      const headers = {};
      request.headers.forEach((value, key) => {
        headers[key.toLowerCase()] = value;
      });

      // Slack signature verification
      if (!slackService.verifySlackRequest(headers, body)) {
        context.error('Invalid Slack request signature');
        return {
          status: 401,
          body: 'Invalid request signature'
        };
      }

      // Parse form data
      const params = new URLSearchParams(body);
      const slackUserId = params.get('user_id');
      const slackTeamId = params.get('team_id');
      const command = params.get('command');
      const text = params.get('text') || '';
      const responseUrl = params.get('response_url');

      context.log(`Command from Slack user ${slackUserId}: ${command} ${text}`);

      // Find Azure user from Slack user
      const mappings = await storage.getAllSlackUserMappings();
      const userMapping = mappings.find(m =>
        m.slackUserId === slackUserId && m.slackTeamId === slackTeamId
      );

      if (!userMapping) {
        return {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            response_type: 'ephemeral',
            text: '❌ You need to connect your Slack account first. Go to TaskCommand Settings to connect.'
          })
        };
      }

      const azureUserId = userMapping.rowKey;

      // Determine if this is a slow command that needs async processing
      const subcommand = text.trim().split(/\s+/)[0]?.toLowerCase() || 'help';
      const slowCommands = ['mine', 'today', 'add'];

      if (slowCommands.includes(subcommand)) {
        // Respond immediately with acknowledgment
        // Then process command asynchronously and post to response_url

        // Start async processing (don't await)
        (async () => {
          try {
            const response = await slackCommands.routeCommand(text, slackUserId, azureUserId);

            // Send result to Slack's response_url
            await fetch(responseUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                response_type: 'ephemeral',
                replace_original: true,
                ...response
              })
            });
          } catch (error) {
            context.error('Error in async command processing:', error);
            // Send error to response_url
            await fetch(responseUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                response_type: 'ephemeral',
                replace_original: true,
                text: '❌ An error occurred processing your command. Please try again.'
              })
            });
          }
        })();

        // Return immediate acknowledgment
        return {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            response_type: 'ephemeral',
            text: '⏳ Fetching your tasks...'
          })
        };
      } else {
        // Fast commands (like help) can respond immediately
        const response = await slackCommands.routeCommand(text, slackUserId, azureUserId);

        return {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            response_type: 'ephemeral',
            ...response
          })
        };
      }

    } catch (error) {
      context.error('Error in SlackCommands:', error);
      context.error('Error message:', error.message);
      context.error('Error stack:', error.stack);

      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response_type: 'ephemeral',
          text: '❌ An error occurred processing your command. Please try again.'
        })
      };
    }
  }
});

// ============================================================================
// TIMER FUNCTIONS
// ============================================================================

/**
 * Azure Timer Function: Check for New Task Assignments
 *
 * Runs every 10 minutes to check for newly assigned tasks
 * and send Slack notifications to users who have opted in.
 *
 * Schedule: Every 10 minutes (cron: 0 [star][slash]10 [star] [star] [star] [star])
 */
app.timer('CheckTaskAssignments', {
  schedule: '0 */10 * * * *',
  handler: async (myTimer, context) => {
    context.log('CheckTaskAssignments timer function started');

    try {
      const result = await taskPollingService.checkAllUsersForNewAssignments();

      context.log(`Task assignment check complete: Checked ${result.totalUsers} users, found ${result.newAssignments} new assignments`);
    } catch (error) {
      context.error('Error in CheckTaskAssignments timer:', error);
    }
  }
});

/**
 * Azure Timer Function: Send Morning Digest
 *
 * Sends daily morning digest to all users who have opted in
 * Shows tasks due today and overdue tasks
 *
 * Schedule: Daily at 8:00 AM
 */
app.timer('SendMorningDigest', {
  schedule: '0 0 8 * * *',
  handler: async (myTimer, context) => {
    context.log('SendMorningDigest timer function started');

    try {
      const result = await morningDigestService.sendAllMorningDigests();

      context.log(`Morning digest complete: Sent to ${result.digestsSent} of ${result.totalUsers} users`);
    } catch (error) {
      context.error('Error in SendMorningDigest timer:', error);
    }
  }
});

/**
 * Test Endpoint: Trigger Morning Digest Manually
 *
 * For testing purposes - sends morning digest to the authenticated user immediately
 * Remove or protect this before production deployment
 */
app.http('TestMorningDigest', {
  methods: ['POST'],
  route: 'test/morning-digest',
  authLevel: 'anonymous',
  handler: async (request, context) => {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    if (request.method === 'OPTIONS') {
      return { status: 200, headers: corsHeaders };
    }

    try {
      // For testing, allow passing Azure user ID in request body
      const requestBody = await request.json().catch(() => ({}));
      let userId;

      if (requestBody.azureUserId) {
        // Test mode: Use Azure user ID directly from request body
        userId = requestBody.azureUserId;
        context.log(`Test mode: Using Azure user ID from request body: ${userId}`);
      } else {
        // Normal mode: Validate token
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return {
            status: 401,
            headers: corsHeaders,
            jsonBody: { error: 'Unauthorized', hint: 'Pass azureUserId in request body for testing' }
          };
        }

        const userToken = authHeader.substring(7);
        const user = await validateUserToken(userToken);
        userId = user.id;
      }

      // Send morning digest to this user
      context.log(`Manually triggering morning digest for user ${userId}`);
      const sent = await morningDigestService.sendUserMorningDigest(userId);

      return {
        status: 200,
        headers: corsHeaders,
        jsonBody: {
          success: sent,
          message: sent
            ? 'Morning digest sent successfully! Check your Slack DMs.'
            : 'Morning digest not sent. Check if you have Slack connected and morning digest enabled in settings.'
        }
      };

    } catch (error) {
      context.error('Error in TestMorningDigest:', error);
      return {
        status: 500,
        headers: corsHeaders,
        jsonBody: { error: 'Internal server error', details: error.message }
      };
    }
  }
});

/**
 * Test Endpoint: Trigger Assignment Check Manually
 *
 * For testing purposes - checks for new task assignments immediately
 * Remove or protect this before production deployment
 */
app.http('TestAssignmentCheck', {
  methods: ['POST'],
  route: 'test/assignment-check',
  authLevel: 'anonymous',
  handler: async (request, context) => {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    if (request.method === 'OPTIONS') {
      return { status: 200, headers: corsHeaders };
    }

    try {
      // For testing, allow passing Azure user ID in request body
      const requestBody = await request.json().catch(() => ({}));
      let userId;

      if (requestBody.azureUserId) {
        // Test mode: Use Azure user ID directly from request body
        userId = requestBody.azureUserId;
        context.log(`Test mode: Using Azure user ID from request body: ${userId}`);
      } else {
        // Normal mode: Validate token
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return {
            status: 401,
            headers: corsHeaders,
            jsonBody: { error: 'Unauthorized', hint: 'Pass azureUserId in request body for testing' }
          };
        }

        const userToken = authHeader.substring(7);
        const user = await validateUserToken(userToken);
        userId = user.id;
      }

      // Check assignments for this user
      context.log(`Manually triggering assignment check for user ${userId}`);
      const newAssignments = await taskPollingService.checkUserTaskAssignments(userId);

      return {
        status: 200,
        headers: corsHeaders,
        jsonBody: {
          success: true,
          newAssignments: newAssignments,
          message: newAssignments > 0
            ? `Found ${newAssignments} new assignment(s)! Check your Slack DMs.`
            : 'No new assignments found. Check if you have Slack connected and assignment notifications enabled in settings.'
        }
      };

    } catch (error) {
      context.error('Error in TestAssignmentCheck:', error);
      return {
        status: 500,
        headers: corsHeaders,
        jsonBody: { error: 'Internal server error', details: error.message }
      };
    }
  }
});

/**
 * Test Endpoint: Create a Test Task
 *
 * Creates a test task assigned to the authenticated user
 * For testing assignment notifications
 */
app.http('CreateTestTask', {
  methods: ['POST'],
  route: 'test/create-task',
  authLevel: 'anonymous',
  handler: async (request, context) => {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    if (request.method === 'OPTIONS') {
      return { status: 200, headers: corsHeaders };
    }

    try {
      // For testing, allow passing Azure user ID in request body
      const requestBody = await request.json().catch(() => ({}));
      let userId;

      if (requestBody.azureUserId) {
        // Test mode: Use Azure user ID directly from request body
        userId = requestBody.azureUserId;
        context.log(`Test mode: Using Azure user ID from request body: ${userId}`);
      } else {
        // Normal mode: Validate token
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return {
            status: 401,
            headers: corsHeaders,
            jsonBody: { error: 'Unauthorized', hint: 'Pass azureUserId in request body for testing' }
          };
        }

        const userToken = authHeader.substring(7);
        const user = await validateUserToken(userToken);
        userId = user.id;
      }

      // Get user's preferences to find default plan
      const preferences = await storage.getNotificationPreferences(userId);

      if (!preferences?.defaultPlanId || !preferences?.defaultBucketId) {
        return {
          status: 400,
          headers: corsHeaders,
          jsonBody: {
            error: 'No default plan set',
            message: 'Please set a default plan in Settings first'
          }
        };
      }

      // Create Graph client with user's token
      const credential = new ClientSecretCredential(
        process.env.AZURE_TENANT_ID,
        process.env.AZURE_CLIENT_ID,
        process.env.AZURE_CLIENT_SECRET
      );

      const graphClient = Client.initWithMiddleware({
        authProvider: {
          getAccessToken: async () => {
            const token = await credential.getToken('https://graph.microsoft.com/.default');
            return token.token;
          }
        }
      });

      // Create task
      const now = new Date();
      const taskTitle = `Test Notification - ${now.toLocaleTimeString()}`;

      const newTask = {
        planId: preferences.defaultPlanId,
        bucketId: preferences.defaultBucketId,
        title: taskTitle,
        assignments: {
          [userId]: {
            '@odata.type': '#microsoft.graph.plannerAssignment',
            orderHint: ' !'
          }
        },
        dueDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Due tomorrow
      };

      context.log(`Creating test task for user ${userId}: ${taskTitle}`);
      const createdTask = await graphClient.api('/planner/tasks').post(newTask);

      return {
        status: 200,
        headers: corsHeaders,
        jsonBody: {
          success: true,
          task: {
            id: createdTask.id,
            title: createdTask.title,
            planId: createdTask.planId,
            bucketId: createdTask.bucketId
          },
          message: `Created task "${taskTitle}". Now run the assignment check test to see the notification!`
        }
      };

    } catch (error) {
      context.error('Error in CreateTestTask:', error);
      return {
        status: 500,
        headers: corsHeaders,
        jsonBody: { error: 'Internal server error', details: error.message, stack: error.stack }
      };
    }
  }
});