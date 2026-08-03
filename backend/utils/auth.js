const { Client } = require('@microsoft/microsoft-graph-client');
const { getGraphClient } = require('../services/graphClient');
require('isomorphic-fetch');

// Security group whose members can see/manage ALL tasks regardless of
// assignment ("TaskCommand All Tasks" in Entra).
const ALL_TASKS_GROUP_ID = process.env.ALL_TASKS_GROUP_ID;

/**
 * Validate user's access token by calling Microsoft Graph /me endpoint
 * Returns user info if valid, throws error if invalid
 */
async function validateUserToken(token) {
  if (!token) {
    throw new Error('No token provided');
  }

  try {
    const client = Client.init({
      authProvider: (done) => {
        done(null, token);
      }
    });

    // Call /me to validate token and get user info
    const user = await client
      .api('/me')
      .select('id,displayName,userPrincipalName,mail')
      .get();

    return user;

  } catch (err) {
    console.error('Token validation failed:', err.message);
    throw new Error('Invalid or expired token');
  }
}

/**
 * Determine the user's manager-dashboard access level.
 *
 * Two tiers:
 * - 'all': member of the ALL_TASKS_GROUP_ID security group (transitive) -
 *   sees and manages every task in the organization.
 * - 'reports': has direct reports per the Entra manager field - sees and
 *   manages tasks assigned to their reports (and themselves).
 *
 * Throws if the user qualifies for neither.
 *
 * Returns { level: 'all' } or { level: 'reports', allowedUserIds: Set }
 */
async function getManagerAccess(user) {
  const client = getGraphClient();

  // Tier 1: all-tasks security group (transitive membership)
  if (ALL_TASKS_GROUP_ID) {
    try {
      const result = await client
        .api(`/users/${user.id}/checkMemberGroups`)
        .post({ groupIds: [ALL_TASKS_GROUP_ID] });

      if (result.value && result.value.includes(ALL_TASKS_GROUP_ID)) {
        console.log(`User ${user.displayName} has all-tasks access (group member)`);
        return { level: 'all' };
      }
    } catch (err) {
      // Fall through to the direct-reports tier rather than failing open
      console.error('checkMemberGroups failed:', err.message);
    }
  } else {
    console.warn('ALL_TASKS_GROUP_ID is not set; only the direct-reports tier is active');
  }

  // Tier 2: Entra manager relationship - direct reports
  try {
    const reports = await client
      .api(`/users/${user.id}/directReports`)
      .select('id')
      .get();

    const reportIds = (reports.value || []).map((r) => r.id);
    if (reportIds.length > 0) {
      console.log(`User ${user.displayName} has manager access to ${reportIds.length} direct report(s)`);
      return { level: 'reports', allowedUserIds: new Set([user.id, ...reportIds]) };
    }
  } catch (err) {
    console.error('directReports lookup failed:', err.message);
  }

  throw new Error('User does not have manager permissions');
}

/**
 * True if the given access level permits acting on a task with the given
 * assignments object (Planner task.assignments, keyed by user id).
 */
function canAccessTask(access, assignments) {
  if (access.level === 'all') return true;
  const assignedIds = Object.keys(assignments || {});
  return assignedIds.some((id) => access.allowedUserIds.has(id));
}

module.exports = {
  validateUserToken,
  getManagerAccess,
  canAccessTask
};
