const { app } = require('@azure/functions');
const { Client } = require('@microsoft/microsoft-graph-client');
const { ClientSecretCredential } = require('@azure/identity');
const { validateUserToken, checkManagerAuthorization } = require('../utils/auth');

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
        context.log.error('No authorization header provided');
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
        context.log.error('Token validation failed:', err.message);
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
        context.log.error('Authorization check failed:', err.message);
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
      context.log.error('Error completing task:', error);

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