/**
 * Morning Digest Service
 *
 * Sends daily digest messages to Slack with today's tasks
 * Runs every morning at 8 AM (configurable)
 */

const graphClient = require('./graphClient');
const slackService = require('./slackService');
const slackFormatter = require('./slackFormatter');
const storage = require('./storageService');

/**
 * Get tasks due today for a specific user
 * @param {string} azureUserId - Azure AD user ID
 * @returns {Promise<Array>} Tasks due today (including overdue)
 */
async function getUserTodayTasks(azureUserId) {
  try {
    // Get all tasks assigned to the user
    const allTasks = await graphClient.getUserTasks(azureUserId);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    // Filter for tasks that are:
    // 1. Not completed
    // 2. Due today OR overdue
    const todayTasks = allTasks.filter(task => {
      if (task.percentComplete === 100) {
        return false; // Skip completed tasks
      }

      if (!task.dueDateTime) {
        return false; // Skip tasks without due date
      }

      const dueDate = new Date(task.dueDateTime);

      // Include if due today or overdue
      return dueDate <= todayEnd;
    });

    // Sort by due date (oldest first, so overdue tasks appear at top)
    todayTasks.sort((a, b) => {
      const dateA = new Date(a.dueDateTime);
      const dateB = new Date(b.dueDateTime);
      return dateA - dateB;
    });

    return todayTasks;
  } catch (error) {
    console.error(`Error fetching today's tasks for user ${azureUserId}:`, error);
    return [];
  }
}

/**
 * Format morning digest message
 * @param {Array} tasks - Tasks due today
 * @param {string} userName - User's display name
 * @returns {Array} Slack Block Kit blocks
 */
function formatMorningDigest(tasks, userName) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Count overdue vs today
  const overdueTasks = tasks.filter(task => new Date(task.dueDateTime) < todayStart);
  const todayTasks = tasks.filter(task => new Date(task.dueDateTime) >= todayStart);

  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '☀️ Good Morning!',
        emoji: true
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Here's your task summary for *${now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}*`
      }
    }
  ];

  if (tasks.length === 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '🎉 *No tasks due today!* You\'re all caught up.'
      }
    });
  } else {
    // Summary section
    const summaryParts = [];
    if (overdueTasks.length > 0) {
      summaryParts.push(`🔴 *${overdueTasks.length} overdue*`);
    }
    if (todayTasks.length > 0) {
      summaryParts.push(`📅 *${todayTasks.length} due today*`);
    }

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: summaryParts.join(' • ')
      }
    });

    blocks.push({ type: 'divider' });

    // Show overdue tasks first
    if (overdueTasks.length > 0) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*🔴 Overdue Tasks*'
        }
      });

      overdueTasks.slice(0, 5).forEach(task => {
        const priorityEmoji = task.priority === 1 ? '🔥' :
                            task.priority === 3 ? '⚡' :
                            task.priority === 5 ? '📌' : '•';

        const daysOverdue = Math.floor((now - new Date(task.dueDateTime)) / (1000 * 60 * 60 * 24));
        const overdueText = daysOverdue === 0 ? 'today' : `${daysOverdue}d ago`;

        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${priorityEmoji} *${task.title}*\n_Due ${overdueText}_`
          }
        });
      });

      if (overdueTasks.length > 5) {
        blocks.push({
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `_...and ${overdueTasks.length - 5} more overdue tasks_`
            }
          ]
        });
      }
    }

    // Show today's tasks
    if (todayTasks.length > 0) {
      if (overdueTasks.length > 0) {
        blocks.push({ type: 'divider' });
      }

      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*📅 Due Today*'
        }
      });

      todayTasks.slice(0, 5).forEach(task => {
        const priorityEmoji = task.priority === 1 ? '🔥' :
                            task.priority === 3 ? '⚡' :
                            task.priority === 5 ? '📌' : '•';

        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${priorityEmoji} *${task.title}*`
          }
        });
      });

      if (todayTasks.length > 5) {
        blocks.push({
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `_...and ${todayTasks.length - 5} more tasks due today_`
            }
          ]
        });
      }
    }
  }

  // Footer with quick actions
  blocks.push({ type: 'divider' });
  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: '💡 Use `/taskcommand mine` to see all your tasks'
      }
    ]
  });

  return blocks;
}

/**
 * Send morning digest to a specific user
 * @param {string} azureUserId - Azure AD user ID
 * @returns {Promise<boolean>} True if sent successfully
 */
async function sendUserMorningDigest(azureUserId) {
  try {
    // Get user's Slack connection
    const slackMapping = await storage.getSlackUserMapping(azureUserId);
    if (!slackMapping) {
      console.log(`User ${azureUserId} doesn't have Slack connected, skipping digest`);
      return false;
    }

    // Check if user has morning digest enabled
    const preferences = await storage.getNotificationPreferences(azureUserId);
    if (!preferences?.morningDigestEnabled) {
      console.log(`User ${azureUserId} has morning digest disabled, skipping`);
      return false;
    }

    // Get tasks due today
    const tasks = await getUserTodayTasks(azureUserId);

    // Format the digest message
    const blocks = formatMorningDigest(tasks, slackMapping.userName || 'there');

    // Send to Slack
    const text = tasks.length === 0
      ? '☀️ Good morning! No tasks due today - you\'re all caught up!'
      : `☀️ Good morning! You have ${tasks.length} task${tasks.length === 1 ? '' : 's'} due today.`;

    await slackService.sendDirectMessage(
      slackMapping.accessToken,
      slackMapping.slackUserId,
      blocks,
      text
    );

    console.log(`Sent morning digest to user ${azureUserId} (${tasks.length} tasks)`);
    return true;

  } catch (error) {
    console.error(`Error sending morning digest to user ${azureUserId}:`, error);
    return false;
  }
}

/**
 * Send morning digest to all users who have opted in
 * Called by the timer function
 * @returns {Promise<object>} Summary of results
 */
async function sendAllMorningDigests() {
  try {
    console.log('Starting morning digest send...');

    // Get all users who have Slack connected
    const slackMappings = await storage.getAllSlackUserMappings();

    if (!slackMappings || slackMappings.length === 0) {
      console.log('No users with Slack connected');
      return { totalUsers: 0, digestsSent: 0 };
    }

    let digestsSent = 0;

    // Send digest to each user sequentially
    for (const mapping of slackMappings) {
      try {
        const sent = await sendUserMorningDigest(mapping.azureUserId);
        if (sent) {
          digestsSent++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error sending digest to user ${mapping.azureUserId}:`, error);
      }
    }

    console.log(`Morning digest complete. Sent to ${digestsSent} of ${slackMappings.length} users`);

    return {
      totalUsers: slackMappings.length,
      digestsSent: digestsSent
    };

  } catch (error) {
    console.error('Error in sendAllMorningDigests:', error);
    throw error;
  }
}

module.exports = {
  getUserTodayTasks,
  formatMorningDigest,
  sendUserMorningDigest,
  sendAllMorningDigests
};
