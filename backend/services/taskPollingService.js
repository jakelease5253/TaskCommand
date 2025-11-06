/**
 * Task Polling Service
 *
 * Polls Microsoft Graph API for task changes since we can't use webhooks
 * (Microsoft Graph does not support change notifications for Planner tasks)
 *
 * This service:
 * - Checks for tasks assigned to users
 * - Compares with last check time to find new assignments
 * - Sends Slack notifications for newly assigned tasks
 */

const graphClient = require('./graphClient');
const slackService = require('./slackService');
const slackFormatter = require('./slackFormatter');
const storage = require('./storageService');

/**
 * Check for new task assignments for a specific user
 * @param {string} azureUserId - Azure AD user ID
 * @returns {Promise<number>} Number of new assignments found
 */
async function checkUserTaskAssignments(azureUserId) {
  try {
    // Get user's Slack connection
    const slackMapping = await storage.getSlackUserMapping(azureUserId);
    if (!slackMapping) {
      // User doesn't have Slack connected, skip
      return 0;
    }

    // Check if user has assignment notifications enabled
    const preferences = await storage.getNotificationPreferences(azureUserId);
    if (!preferences?.assignmentNotifications) {
      // User has disabled assignment notifications, skip
      return 0;
    }

    // Get last check time for this user
    const lastCheck = await storage.getLastTaskCheckTime(azureUserId);
    const lastCheckTime = lastCheck ? new Date(lastCheck) : new Date(Date.now() - 24 * 60 * 60 * 1000); // Default to 24 hours ago

    // Get all tasks assigned to the user
    const tasks = await graphClient.getUserTasks(azureUserId);

    let newAssignmentCount = 0;

    // Check each task for new assignments
    for (const task of tasks) {
      // Skip if task was created before our last check
      const taskCreatedDate = new Date(task.createdDateTime);
      if (taskCreatedDate < lastCheckTime) {
        continue;
      }

      // Check if user is assigned to this task
      const isAssigned = task.assignments && task.assignments[azureUserId];
      if (!isAssigned) {
        continue;
      }

      // Check when the assignment was made
      const assignmentDate = new Date(task.assignments[azureUserId].assignedDateTime);
      if (assignmentDate < lastCheckTime) {
        // Assignment is old, skip
        continue;
      }

      // This is a new assignment! Send notification
      try {
        // Get plan and bucket details
        const plan = await graphClient.getPlan(task.planId);
        const bucket = await graphClient.getBucket(task.bucketId);

        // Format and send Slack message
        const blocks = slackFormatter.formatAssignmentNotification(task, plan, bucket);
        await slackService.sendDirectMessage(
          slackMapping.accessToken,
          slackMapping.slackUserId,
          blocks,
          'You have a new task assignment!'
        );

        newAssignmentCount++;
        console.log(`Sent assignment notification to user ${azureUserId} for task ${task.id}`);
      } catch (error) {
        console.error(`Error sending notification for task ${task.id}:`, error);
      }
    }

    // Update last check time
    await storage.setLastTaskCheckTime(azureUserId, new Date().toISOString());

    return newAssignmentCount;

  } catch (error) {
    console.error(`Error checking task assignments for user ${azureUserId}:`, error);
    return 0;
  }
}

/**
 * Check all users for new task assignments
 * Called by the timer function
 * @returns {Promise<object>} Summary of results
 */
async function checkAllUsersForNewAssignments() {
  try {
    console.log('Starting task assignment polling check...');

    // Get all users who have Slack connected
    const slackMappings = await storage.getAllSlackUserMappings();

    if (!slackMappings || slackMappings.length === 0) {
      console.log('No users with Slack connected');
      return { totalUsers: 0, newAssignments: 0 };
    }

    let totalNewAssignments = 0;

    // Check each user sequentially to avoid rate limiting
    for (const mapping of slackMappings) {
      try {
        const newAssignments = await checkUserTaskAssignments(mapping.azureUserId);
        totalNewAssignments += newAssignments;
      } catch (error) {
        console.error(`Error checking user ${mapping.azureUserId}:`, error);
      }
    }

    console.log(`Task polling complete. Checked ${slackMappings.length} users, found ${totalNewAssignments} new assignments`);

    return {
      totalUsers: slackMappings.length,
      newAssignments: totalNewAssignments
    };

  } catch (error) {
    console.error('Error in checkAllUsersForNewAssignments:', error);
    throw error;
  }
}

module.exports = {
  checkUserTaskAssignments,
  checkAllUsersForNewAssignments
};
