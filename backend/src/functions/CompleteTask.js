const { app } = require('@azure/functions');
const { Client } = require('@microsoft/microsoft-graph-client');
const { ClientSecretCredential } = require('@azure/identity');
const { validateUserToken, checkManagerAuthorization } = require('../../utils/auth');

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
      // Validate user token
      const authHeader = request.headers.get('authorization');
      if (!authHeader) {
        return {
          status: 401,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Authorization header required' })
        };
      }

      const userToken = authHeader.replace('Bearer ', '');
      const isValid = await validateUserToken(userToken);

      if (!isValid) {
        return {
          status: 401,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Invalid or expired token' })
        };
      }

      // Check if user is authorized (manager role)
      const isAuthorized = await checkManagerAuthorization(userToken);
      if (!isAuthorized) {
        return {
          status: 403,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Insufficient permissions - manager role required' })
        };
      }

      // Get taskId from route parameter
      const taskId = request.params.taskId;
      if (!taskId) {
        return {
          status: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Task ID is required' })
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
      const updatedTask = await client
        .api(`/planner/tasks/${taskId}`)
        .header('If-Match', task['@odata.etag'])
        .patch({
          percentComplete: 100
        });

      context.log(`Task ${taskId} completed successfully`);

      return {
        status: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          taskId: taskId,
          message: 'Task completed successfully'
        })
      };

    } catch (error) {
      context.log(`Error completing task: ${error.message}`);

      return {
        status: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Failed to complete task',
          message: error.message
        })
      };
    }
  }
});