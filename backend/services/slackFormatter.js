/**
 * Slack Message Formatter
 * Formats task data into Slack Block Kit format for rich, interactive messages
 */

const formatPriorityBadge = (priority) => {
  const badges = {
    1: '🔴 High',
    5: '🟡 Medium',
    9: '🟢 Low'
  };
  return badges[priority] || '⚪ None';
};

const formatDueDate = (dueDateTime) => {
  if (!dueDateTime) return 'No due date';

  const due = new Date(dueDateTime);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (due < today) {
    return `⚠️ Overdue (${due.toLocaleDateString()})`;
  } else if (due.toDateString() === today.toDateString()) {
    return '📅 Due today';
  } else if (due.toDateString() === tomorrow.toDateString()) {
    return '📅 Due tomorrow';
  } else {
    return `📅 Due ${due.toLocaleDateString()}`;
  }
};

const formatTaskStatus = (percentComplete) => {
  if (percentComplete === 100) return '✅ Complete';
  if (percentComplete > 0) return `🔄 In Progress (${percentComplete}%)`;
  return '⚪ Not Started';
};

/**
 * Format a single task as a Slack block
 */
function formatTaskBlock(task, plan, bucket) {
  const blocks = [];

  // Task title and status
  const statusText = formatTaskStatus(task.percentComplete);
  const priorityText = formatPriorityBadge(task.priority);
  const dueDateText = formatDueDate(task.dueDateTime);

  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*${task.title}*\n${statusText} • ${priorityText} • ${dueDateText}`
    },
    accessory: {
      type: 'button',
      text: {
        type: 'plain_text',
        text: '👁️ View'
      },
      url: `http://localhost:5173/?task=${task.id}`,
      action_id: 'view_task'
    }
  });

  // Task metadata
  const metadata = [];
  if (plan) metadata.push(`📋 ${plan.title}`);
  if (bucket) metadata.push(`📁 ${bucket.name}`);
  if (task.assignments && Object.keys(task.assignments).length > 0) {
    metadata.push(`👤 ${Object.keys(task.assignments).length} assigned`);
  }

  if (metadata.length > 0) {
    blocks.push({
      type: 'context',
      elements: [{
        type: 'mrkdwn',
        text: metadata.join(' • ')
      }]
    });
  }

  return blocks;
}

/**
 * Format a list of tasks for Slack
 */
function formatTaskList(tasks, plans, buckets, options = {}) {
  const {
    title = 'Your Tasks',
    emptyMessage = 'No tasks found',
    maxTasks = 10
  } = options;

  const blocks = [];

  // Header
  blocks.push({
    type: 'header',
    text: {
      type: 'plain_text',
      text: title
    }
  });

  // Empty state
  if (!tasks || tasks.length === 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `_${emptyMessage}_`
      }
    });
    return blocks;
  }

  // Show limited number of tasks
  const displayTasks = tasks.slice(0, maxTasks);
  const remainingCount = tasks.length - maxTasks;

  displayTasks.forEach((task, index) => {
    const plan = plans[task.planId];
    const bucket = buckets[task.bucketId];

    const taskBlocks = formatTaskBlock(task, plan, bucket);
    blocks.push(...taskBlocks);

    // Add divider between tasks (except after last one)
    if (index < displayTasks.length - 1) {
      blocks.push({ type: 'divider' });
    }
  });

  // Show remaining count
  if (remainingCount > 0) {
    blocks.push({
      type: 'context',
      elements: [{
        type: 'mrkdwn',
        text: `_...and ${remainingCount} more tasks. Use the TaskCommand app to see all._`
      }]
    });
  }

  return blocks;
}

/**
 * Format help command response
 */
function formatHelpMessage() {
  return {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🤖 TaskCommand Bot - Commands'
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Available Commands:*'
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '`/taskcommand mine`\nShow all your active tasks'
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '`/taskcommand today`\nShow tasks due today'
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '`/taskcommand add [title]`\nCreate a new task'
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '`/taskcommand help`\nShow this help message'
        }
      },
      {
        type: 'divider'
      },
      {
        type: 'context',
        elements: [{
          type: 'mrkdwn',
          text: '💡 *Tip:* Use the TaskCommand web app for full task management features!'
        }]
      }
    ]
  };
}

/**
 * Format error message
 */
function formatErrorMessage(message) {
  return {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `❌ *Error:* ${message}`
        }
      }
    ]
  };
}

/**
 * Format success message
 */
function formatSuccessMessage(message) {
  return {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `✅ ${message}`
        }
      }
    ]
  };
}

/**
 * Format assignment notification message
 * @param {Object} task - Planner task object
 * @param {Object} plan - Planner plan object
 * @param {Object} bucket - Planner bucket object
 * @returns {Array} Slack Block Kit blocks
 */
function formatAssignmentNotification(task, plan, bucket) {
  const priorityText = formatPriorityBadge(task.priority);
  const dueDateText = formatDueDate(task.dueDateTime);

  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '📬 New Task Assigned',
        emoji: true
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${task.title}*\n${priorityText} • ${dueDateText}`
      }
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `📋 ${plan.title} • 📁 ${bucket.name}`
        }
      ]
    },
    {
      type: 'divider'
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '👁️ View Task',
            emoji: true
          },
          url: `http://localhost:5173/?task=${task.id}`,
          action_id: 'view_task'
        }
      ]
    }
  ];
}

module.exports = {
  formatTaskBlock,
  formatTaskList,
  formatHelpMessage,
  formatErrorMessage,
  formatSuccessMessage,
  formatAssignmentNotification,
  formatPriorityBadge,
  formatDueDate,
  formatTaskStatus
};
