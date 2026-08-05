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

// Slack error codes worth retrying. Anything else (invalid_auth, channel_not_found,
// invalid_blocks, ...) will fail identically forever, so retrying it would freeze
// the checkpoint and re-notify every healthy task in the window on every run.
const RETRYABLE_SLACK_ERRORS = new Set([
  'ratelimited',
  'service_unavailable',
  'internal_error',
  'fatal_error',
  'request_timeout'
]);

// Backstop for failures we misclassify as transient: however stuck a checkpoint
// gets, it advances once it falls this far behind. Bounds any repeat-notify loop
// to roughly this window instead of forever.
const MAX_CHECKPOINT_HOLD_MS = 60 * 60 * 1000; // 1 hour

/**
 * Decide whether a failed send is worth holding the checkpoint for
 * @param {Error} error
 * @returns {boolean} true if the failure looks temporary
 */
function isTransientSendError(error) {
  const slackCode = error?.message?.match(/^Slack API error: (\w+)/)?.[1];
  if (slackCode) {
    return RETRYABLE_SLACK_ERRORS.has(slackCode);
  }
  // No Slack error code means we never got a usable response - network fault,
  // DNS, timeout. Those do recover, so retry them.
  return true;
}

/**
 * Fetch plan/bucket details for the notification. Purely decorative, so a
 * missing id or an unreadable plan yields null rather than failing the send.
 * @param {object} task - Planner task
 * @returns {Promise<{plan: object|null, bucket: object|null}>}
 */
async function getTaskContext(task) {
  const lookup = async (id, fetcher, label) => {
    if (!id) return null;
    try {
      return await fetcher(id);
    } catch (error) {
      console.warn(`Could not load ${label} ${id} for task ${task.id}: ${error.message}`);
      return null;
    }
  };

  const [plan, bucket] = await Promise.all([
    lookup(task.planId, graphClient.getPlan, 'plan'),
    lookup(task.bucketId, graphClient.getBucket, 'bucket')
  ]);

  return { plan, bucket };
}

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

    // Get last assignment check time for this user
    const lastCheck = await storage.getLastAssignmentCheckTime(azureUserId);
    const lastCheckTime = lastCheck ? new Date(lastCheck) : new Date(Date.now() - 24 * 60 * 60 * 1000); // Default to 24 hours ago

    // Capture the next checkpoint BEFORE fetching - tasks assigned while
    // this run is processing must land in the next window, not be skipped
    const checkStartTime = new Date().toISOString();

    // Get all tasks assigned to the user
    const tasks = await graphClient.getUserTasks(azureUserId);

    let newAssignmentCount = 0;
    let retryableFailures = 0;

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
      const { plan, bucket } = await getTaskContext(task);

      try {
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
        if (isTransientSendError(error)) {
          retryableFailures++;
          console.error(`Error sending notification for task ${task.id} (will retry):`, error);
        } else {
          // Retrying would never succeed and would hold the checkpoint back,
          // re-notifying every other task in this window on every run
          console.error(`Permanently dropping notification for task ${task.id}:`, error);
        }
      }
    }

    // Measure the hold against the stored checkpoint, not the 24h default a
    // first-time user falls back to - that would trip the backstop immediately
    const heldFor = lastCheck ? Date.now() - new Date(lastCheck).getTime() : 0;

    // Hold the checkpoint only for failures that can actually recover - a
    // permanent failure would otherwise freeze it and re-notify forever
    if (retryableFailures === 0) {
      await storage.setLastAssignmentCheckTime(azureUserId, checkStartTime);
    } else if (heldFor > MAX_CHECKPOINT_HOLD_MS) {
      console.warn(`Advancing assignment checkpoint for ${azureUserId} despite ${retryableFailures} failure(s): held ${Math.round(heldFor / 60000)} min, past the retry limit`);
      await storage.setLastAssignmentCheckTime(azureUserId, checkStartTime);
    } else {
      console.warn(`Not advancing assignment checkpoint for ${azureUserId}: ${retryableFailures} notification(s) failed and will be retried`);
    }

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
