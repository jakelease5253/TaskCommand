const { app } = require('@azure/functions');
const { getAllCompanyTasks } = require('../../services/graphClient');
const { validateUserToken, checkManagerAuthorization } = require('../../utils/auth');

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