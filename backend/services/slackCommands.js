/**
 * Slack Command Handlers
 * Implements the logic for each slash command
 */

const { Client } = require('@microsoft/microsoft-graph-client');
const { ClientSecretCredential } = require('@azure/identity');
const storage = require('./storageService');
const formatter = require('./slackFormatter');

/**
 * Get Microsoft Graph client with user's permissions
 */
function getGraphClient(userAccessToken) {
  return Client.init({
    authProvider: (done) => {
      done(null, userAccessToken);
    }
  });
}

/**
 * Get Microsoft Graph client with application permissions
 */
function getAppGraphClient() {
  const credential = new ClientSecretCredential(
    process.env.AZURE_TENANT_ID,
    process.env.AZURE_CLIENT_ID,
    process.env.AZURE_CLIENT_SECRET
  );

  return Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => {
        const token = await credential.getToken('https://graph.microsoft.com/.default');
        return token.token;
      }
    }
  });
}

/**
 * Get user's tasks from Microsoft Planner
 */
async function getUserTasks(azureUserId) {
  const client = getAppGraphClient();

  try {
    // Get all groups the user is a member of
    const groupsResponse = await client
      .api(`/users/${azureUserId}/memberOf/microsoft.graph.group`)
      .select('id,displayName')
      .filter("groupTypes/any(c:c eq 'Unified')")
      .get();

    const allTasks = [];
    const plans = {};
    const buckets = {};

    // For each group, get plans and tasks
    for (const group of groupsResponse.value) {
      try {
        // Get plans for this group
        const plansResponse = await client
          .api(`/groups/${group.id}/planner/plans`)
          .get();

        for (const plan of plansResponse.value) {
          plans[plan.id] = plan;

          // Get tasks for this plan
          const tasksResponse = await client
            .api(`/planner/plans/${plan.id}/tasks`)
            .get();

          // Filter tasks assigned to this user
          const userTasks = tasksResponse.value.filter(task =>
            task.assignments && task.assignments[azureUserId]
          );

          allTasks.push(...userTasks);

          // Get buckets for this plan
          const bucketsResponse = await client
            .api(`/planner/plans/${plan.id}/buckets`)
            .get();

          for (const bucket of bucketsResponse.value) {
            buckets[bucket.id] = bucket;
          }
        }
      } catch (error) {
        console.error(`Error fetching plans for group ${group.id}:`, error.message);
      }
    }

    return { tasks: allTasks, plans, buckets };
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    throw error;
  }
}

/**
 * Handle: /taskcommand help
 */
async function handleHelp(slackUserId, azureUserId) {
  return formatter.formatHelpMessage();
}

/**
 * Handle: /taskcommand mine
 */
async function handleMine(slackUserId, azureUserId) {
  try {
    const { tasks, plans, buckets } = await getUserTasks(azureUserId);

    // Filter active tasks (not completed)
    const activeTasks = tasks.filter(t => t.percentComplete < 100);

    // Sort by due date (overdue first, then by date)
    activeTasks.sort((a, b) => {
      if (!a.dueDateTime && !b.dueDateTime) return 0;
      if (!a.dueDateTime) return 1;
      if (!b.dueDateTime) return -1;
      return new Date(a.dueDateTime) - new Date(b.dueDateTime);
    });

    const blocks = formatter.formatTaskList(activeTasks, plans, buckets, {
      title: '📋 Your Active Tasks',
      emptyMessage: 'You have no active tasks! 🎉',
      maxTasks: 5
    });

    return { blocks };
  } catch (error) {
    console.error('Error in handleMine:', error);
    return formatter.formatErrorMessage('Failed to fetch your tasks. Please try again.');
  }
}

/**
 * Handle: /taskcommand today
 */
async function handleToday(slackUserId, azureUserId) {
  try {
    const { tasks, plans, buckets } = await getUserTasks(azureUserId);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Filter tasks due today or overdue
    const todayTasks = tasks.filter(t => {
      if (!t.dueDateTime) return false;
      const dueDate = new Date(t.dueDateTime);
      return dueDate < tomorrow && t.percentComplete < 100;
    });

    // Sort by due date
    todayTasks.sort((a, b) => new Date(a.dueDateTime) - new Date(b.dueDateTime));

    const overdueTasks = todayTasks.filter(t => new Date(t.dueDateTime) < today);
    const dueTodayTasks = todayTasks.filter(t => {
      const dueDate = new Date(t.dueDateTime);
      return dueDate >= today && dueDate < tomorrow;
    });

    let title = '📅 Tasks Due Today';
    if (overdueTasks.length > 0 && dueTodayTasks.length > 0) {
      title += ` (${overdueTasks.length} overdue)`;
    } else if (overdueTasks.length > 0) {
      title = `⚠️ Overdue Tasks (${overdueTasks.length})`;
    }

    const blocks = formatter.formatTaskList(todayTasks, plans, buckets, {
      title,
      emptyMessage: 'No tasks due today! ✨',
      maxTasks: 5
    });

    return { blocks };
  } catch (error) {
    console.error('Error in handleToday:', error);
    return formatter.formatErrorMessage('Failed to fetch today\'s tasks. Please try again.');
  }
}

/**
 * Handle: /taskcommand add [title]
 */
async function handleAdd(slackUserId, azureUserId, args) {
  const taskTitle = args.join(' ').trim();

  if (!taskTitle) {
    return formatter.formatErrorMessage('Please provide a task title. Usage: `/taskcommand add [title]`');
  }

  try {
    const client = getAppGraphClient();

    // Check if user has a default plan configured
    const preferences = await storage.getNotificationPreferences(azureUserId);
    let targetPlan = null;
    let targetBucket = null;

    if (preferences.defaultPlanId && preferences.defaultBucketId) {
      // Use the configured default plan/bucket
      console.log(`Using default plan: ${preferences.defaultPlanName} (${preferences.defaultPlanId})`);
      targetPlan = {
        id: preferences.defaultPlanId,
        title: preferences.defaultPlanName
      };
      targetBucket = {
        id: preferences.defaultBucketId,
        name: preferences.defaultBucketName
      };
    } else {
      // No default configured, search for a valid plan
      console.log('No default plan configured, searching for valid plan/bucket');

      // Get all user's Microsoft 365 groups
      const groupsResponse = await client
        .api(`/users/${azureUserId}/memberOf/microsoft.graph.group`)
        .select('id,displayName')
        .filter("groupTypes/any(c:c eq 'Unified')")
        .get();

      if (!groupsResponse.value || groupsResponse.value.length === 0) {
        return formatter.formatErrorMessage('You don\'t have access to any Microsoft 365 groups. Please contact your administrator.');
      }

      console.log(`Found ${groupsResponse.value.length} groups for user`);

      // Try to find a group with plans and buckets
      let targetGroup = null;

    for (const group of groupsResponse.value) {
      try {
        console.log(`Checking group: ${group.displayName} (${group.id})`);

        // Try to get plans for this group
        const plansResponse = await client
          .api(`/groups/${group.id}/planner/plans`)
          .get();

        if (plansResponse.value && plansResponse.value.length > 0) {
          const plan = plansResponse.value[0];
          console.log(`Found plan: ${plan.title} (${plan.id})`);

          // Try to get buckets for this plan
          const bucketsResponse = await client
            .api(`/planner/plans/${plan.id}/buckets`)
            .get();

          if (bucketsResponse.value && bucketsResponse.value.length > 0) {
            targetGroup = group;
            targetPlan = plan;
            targetBucket = bucketsResponse.value[0];
            console.log(`Found bucket: ${targetBucket.name} (${targetBucket.id})`);
            break; // Found a valid plan and bucket, stop searching
          } else {
            console.log(`Plan ${plan.title} has no buckets`);
          }
        } else {
          console.log(`Group ${group.displayName} has no plans`);
        }
      } catch (error) {
        console.error(`Error checking group ${group.displayName}:`, error.message);
        // Continue to next group
      }
    }
    } // End of else block for default plan check

    if (!targetPlan || !targetBucket) {
      return formatter.formatErrorMessage(
        'Could not find a Planner plan with buckets to create the task. Please:\n' +
        '• Create a plan in Microsoft Planner or Teams\n' +
        '• Make sure the plan has at least one bucket\n' +
        '• Or use the TaskCommand web app to create tasks'
      );
    }

    console.log(`Creating task in plan: ${targetPlan.title}, bucket: ${targetBucket.name}`);

    // Set due date to today by default
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of day
    const dueDateTime = today.toISOString();

    // Create the task
    const newTask = {
      planId: targetPlan.id,
      bucketId: targetBucket.id,
      title: taskTitle,
      dueDateTime: dueDateTime,
      assignments: {
        [azureUserId]: {
          '@odata.type': '#microsoft.graph.plannerAssignment',
          orderHint: ' !'
        }
      }
    };

    const createdTask = await client
      .api('/planner/tasks')
      .post(newTask);

    return formatter.formatSuccessMessage(
      `Task created: *${taskTitle}*\n📋 Plan: ${targetPlan.title} • 📁 Bucket: ${targetBucket.name}`
    );
  } catch (error) {
    console.error('Error in handleAdd:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return formatter.formatErrorMessage('Failed to create task. Please try again.');
  }
}

/**
 * Route command to appropriate handler
 */
async function routeCommand(command, slackUserId, azureUserId) {
  const parts = command.trim().split(/\s+/);
  const subcommand = parts[0]?.toLowerCase() || 'help';
  const args = parts.slice(1);

  switch (subcommand) {
    case 'help':
      return await handleHelp(slackUserId, azureUserId);

    case 'mine':
      return await handleMine(slackUserId, azureUserId);

    case 'today':
      return await handleToday(slackUserId, azureUserId);

    case 'add':
      return await handleAdd(slackUserId, azureUserId, args);

    default:
      return formatter.formatErrorMessage(
        `Unknown command: \`${subcommand}\`\n\nType \`/taskcommand help\` to see available commands.`
      );
  }
}

module.exports = {
  routeCommand,
  handleHelp,
  handleMine,
  handleToday,
  handleAdd
};
