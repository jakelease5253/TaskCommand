const { app } = require('@azure/functions');
const { getAllCompanyTasks } = require('./services/graphClient');
const { validateUserToken, checkManagerAuthorization } = require('./utils/auth');
const { Client } = require('@microsoft/microsoft-graph-client');
const { ClientSecretCredential } = require('@azure/identity');
const slackService = require('./services/slackService');
const storage = require('./services/storageService');

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