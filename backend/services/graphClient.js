const { Client } = require('@microsoft/microsoft-graph-client');
const { ClientSecretCredential } = require('@azure/identity');
require('isomorphic-fetch');

let _graphClient = null;

/**
 * Get authenticated Graph API client using application permissions
 * Uses client credentials flow with client secret
 */
function getGraphClient() {
  if (!_graphClient) {
    const credential = new ClientSecretCredential(
      process.env.AZURE_TENANT_ID,
      process.env.AZURE_CLIENT_ID,
      process.env.AZURE_CLIENT_SECRET
    );

    _graphClient = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => {
          const token = await credential.getToken('https://graph.microsoft.com/.default');
          return token.token;
        }
      }
    });
  }

  return _graphClient;
}

/**
 * Fetch all company-wide tasks using application permissions
 * This queries all groups and their associated plans/tasks
 */
async function getAllCompanyTasks() {
  const client = getGraphClient();

  console.log('Fetching all groups...');

  try {
    // Get all groups in the organization
    const groupsResponse = await client
      .api('/groups')
      .select('id,displayName')
      .filter("groupTypes/any(c:c eq 'Unified')") // Only Microsoft 365 groups
      .get();

    const allTasks = [];
    const allPlans = {};
    const allBuckets = {};
    const userProfiles = {};

    console.log(`Found ${groupsResponse.value.length} groups`);

    // For each group, get plans and tasks
    for (const group of groupsResponse.value) {
      try {
        // Get plans for this group
        const plansResponse = await client
          .api(`/groups/${group.id}/planner/plans`)
          .get();

        for (const plan of plansResponse.value) {
          allPlans[plan.id] = plan.title;

          // Get tasks for this plan
          const tasksResponse = await client
            .api(`/planner/plans/${plan.id}/tasks`)
            .get();

          allTasks.push(...tasksResponse.value);

          // Get buckets for this plan
          const bucketsResponse = await client
            .api(`/planner/plans/${plan.id}/buckets`)
            .get();

          allBuckets[plan.id] = bucketsResponse.value;

          // Collect unique user IDs from task assignments
          tasksResponse.value.forEach(task => {
            if (task.assignments) {
              Object.keys(task.assignments).forEach(userId => {
                if (!userProfiles[userId]) {
                  userProfiles[userId] = null; // Mark for fetching
                }
              });
            }
          });
        }
      } catch (err) {
        console.error(`Error fetching plans for group ${group.displayName}:`, err.message);
        // Continue with other groups even if one fails
      }
    }

    // Fetch user profiles for all assigned users
    console.log(`Fetching ${Object.keys(userProfiles).length} user profiles...`);

    for (const userId of Object.keys(userProfiles)) {
      try {
        const user = await client
          .api(`/users/${userId}`)
          .select('id,displayName,userPrincipalName')
          .get();

        userProfiles[userId] = user.displayName || user.userPrincipalName || 'Unknown User';
      } catch (err) {
        console.error(`Error fetching user ${userId}:`, err.message);
        userProfiles[userId] = 'User';
      }
    }

    console.log(`Successfully fetched ${allTasks.length} tasks from ${Object.keys(allPlans).length} plans`);

    return {
      tasks: allTasks,
      plans: allPlans,
      buckets: allBuckets,
      userProfiles
    };

  } catch (err) {
    console.error('Error in getAllCompanyTasks:', err);
    throw err;
  }
}

module.exports = {
  getGraphClient,
  getAllCompanyTasks
};