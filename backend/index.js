const { app } = require('@azure/functions');
const { getAllCompanyTasks } = require('./services/graphClient');
const { validateUserToken, checkManagerAuthorization } = require('./utils/auth');
const { Client } = require('@microsoft/microsoft-graph-client');
const { ClientSecretCredential } = require('@azure/identity');

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
      context.log.error('Error in GetCompanyTasks:', err);

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
