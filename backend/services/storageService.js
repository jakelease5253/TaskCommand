const { TableClient } = require('@azure/data-tables');
const crypto = require('crypto');

// Connection string - uses local emulator for development, Azure Storage in production
const connectionString = process.env.AzureWebJobsStorage || 'UseDevelopmentStorage=true';

// Table names
const TABLES = {
  SLACK_USER_MAPPINGS: 'SlackUserMappings',
  NOTIFICATION_PREFERENCES: 'NotificationPreferences',
  MILESTONE_TRACKING: 'MilestoneTracking',
  SLACK_MESSAGE_TASK_LINKS: 'SlackMessageTaskLinks'
};

// Encryption key for sensitive data (tokens)
// In production, this should be stored in Azure Key Vault
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'development-key-32-characters!!';

// Initialize table clients
const slackMappingsClient = TableClient.fromConnectionString(connectionString, TABLES.SLACK_USER_MAPPINGS);
const notificationPrefsClient = TableClient.fromConnectionString(connectionString, TABLES.NOTIFICATION_PREFERENCES);
const milestonesClient = TableClient.fromConnectionString(connectionString, TABLES.MILESTONE_TRACKING);
const messageLinksClient = TableClient.fromConnectionString(connectionString, TABLES.SLACK_MESSAGE_TASK_LINKS);

/**
 * Initialize all tables (create if they don't exist)
 */
async function initializeTables() {
  try {
    await slackMappingsClient.createTable();
    console.log('Created SlackUserMappings table');
  } catch (error) {
    if (error.statusCode !== 409) { // 409 = already exists
      console.error('Error creating SlackUserMappings table:', error);
    }
  }

  try {
    await notificationPrefsClient.createTable();
    console.log('Created NotificationPreferences table');
  } catch (error) {
    if (error.statusCode !== 409) {
      console.error('Error creating NotificationPreferences table:', error);
    }
  }

  try {
    await milestonesClient.createTable();
    console.log('Created MilestoneTracking table');
  } catch (error) {
    if (error.statusCode !== 409) {
      console.error('Error creating MilestoneTracking table:', error);
    }
  }

  try {
    await messageLinksClient.createTable();
    console.log('Created SlackMessageTaskLinks table');
  } catch (error) {
    if (error.statusCode !== 409) {
      console.error('Error creating SlackMessageTaskLinks table:', error);
    }
  }
}

/**
 * Encrypt sensitive data (tokens)
 */
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32)),
    iv
  );
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt sensitive data (tokens)
 */
function decrypt(text) {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = parts[1];
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32)),
    iv
  );
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// ============================================================================
// SLACK USER MAPPINGS
// ============================================================================

/**
 * Save Slack user mapping (link Azure AD user to Slack user)
 */
async function saveSlackUserMapping(azureUserId, slackData) {
  const entity = {
    partitionKey: 'slackMapping',
    rowKey: azureUserId,
    slackUserId: slackData.slackUserId,
    slackTeamId: slackData.slackTeamId,
    accessToken: encrypt(slackData.accessToken),
    refreshToken: slackData.refreshToken ? encrypt(slackData.refreshToken) : null,
    tokenExpiry: slackData.tokenExpiry || null,
    connectedAt: new Date().toISOString(),
    lastSyncedAt: new Date().toISOString()
  };

  await slackMappingsClient.upsertEntity(entity, 'Replace');
  return entity;
}

/**
 * Get Slack user mapping by Azure AD user ID
 */
async function getSlackUserMapping(azureUserId) {
  try {
    const entity = await slackMappingsClient.getEntity('slackMapping', azureUserId);

    // Decrypt tokens
    if (entity.accessToken) {
      entity.accessToken = decrypt(entity.accessToken);
    }
    if (entity.refreshToken) {
      entity.refreshToken = decrypt(entity.refreshToken);
    }

    return entity;
  } catch (error) {
    if (error.statusCode === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Delete Slack user mapping (disconnect)
 */
async function deleteSlackUserMapping(azureUserId) {
  try {
    await slackMappingsClient.deleteEntity('slackMapping', azureUserId);
    return true;
  } catch (error) {
    if (error.statusCode === 404) {
      return false;
    }
    throw error;
  }
}

/**
 * Get all Slack user mappings (for batch operations like digests)
 */
async function getAllSlackUserMappings() {
  const entities = [];
  const iterator = slackMappingsClient.listEntities({
    queryOptions: { filter: `PartitionKey eq 'slackMapping'` }
  });

  for await (const entity of iterator) {
    // Decrypt tokens
    if (entity.accessToken) {
      entity.accessToken = decrypt(entity.accessToken);
    }
    if (entity.refreshToken) {
      entity.refreshToken = decrypt(entity.refreshToken);
    }
    entities.push(entity);
  }

  return entities;
}

// ============================================================================
// NOTIFICATION PREFERENCES
// ============================================================================

/**
 * Default notification preferences
 */
const DEFAULT_PREFERENCES = {
  assignmentNotifications: true,
  morningDigestEnabled: true,
  morningDigestTime: '08:00',
  dailyKudosEnabled: true,
  dailyKudosTime: '17:00',
  weeklyDigestEnabled: true,
  weeklyDigestDay: 'Friday',
  weeklyDigestTime: '16:00',
  milestonesEnabled: true,
  handoffNotifications: true,
  quietHoursStart: null,
  quietHoursEnd: null,
  timezone: 'America/New_York',
  digestGrouping: 'priority',
  channelType: 'dm',
  teamChannelId: null
};

/**
 * Get or create notification preferences for a user
 */
async function getNotificationPreferences(azureUserId) {
  try {
    const entity = await notificationPrefsClient.getEntity('notificationPrefs', azureUserId);
    return entity;
  } catch (error) {
    if (error.statusCode === 404) {
      // Create default preferences
      return await saveNotificationPreferences(azureUserId, DEFAULT_PREFERENCES);
    }
    throw error;
  }
}

/**
 * Save notification preferences
 */
async function saveNotificationPreferences(azureUserId, preferences) {
  const entity = {
    partitionKey: 'notificationPrefs',
    rowKey: azureUserId,
    ...preferences,
    updatedAt: new Date().toISOString()
  };

  await notificationPrefsClient.upsertEntity(entity, 'Replace');
  return entity;
}

/**
 * Update specific notification preferences
 */
async function updateNotificationPreferences(azureUserId, updates) {
  const current = await getNotificationPreferences(azureUserId);
  const updated = { ...current, ...updates };
  return await saveNotificationPreferences(azureUserId, updated);
}

// ============================================================================
// MILESTONE TRACKING
// ============================================================================

/**
 * Get milestone tracking for a user
 */
async function getMilestoneTracking(azureUserId) {
  try {
    const entity = await milestonesClient.getEntity('milestones', azureUserId);
    // Parse JSON array for milestonesAchieved
    if (entity.milestonesAchieved && typeof entity.milestonesAchieved === 'string') {
      entity.milestonesAchieved = JSON.parse(entity.milestonesAchieved);
    }
    return entity;
  } catch (error) {
    if (error.statusCode === 404) {
      // Create initial tracking
      return await initializeMilestoneTracking(azureUserId);
    }
    throw error;
  }
}

/**
 * Initialize milestone tracking for a new user
 */
async function initializeMilestoneTracking(azureUserId) {
  const entity = {
    partitionKey: 'milestones',
    rowKey: azureUserId,
    totalTasksCompleted: 0,
    lastCompletionDate: null,
    currentStreak: 0,
    longestStreak: 0,
    lastStreakDate: null,
    milestonesAchieved: JSON.stringify([]),
    lastMilestoneDate: null,
    createdAt: new Date().toISOString()
  };

  await milestonesClient.upsertEntity(entity, 'Replace');
  return entity;
}

/**
 * Increment task completion and update streaks
 */
async function incrementTaskCompletion(azureUserId) {
  const tracking = await getMilestoneTracking(azureUserId);
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // Increment total
  tracking.totalTasksCompleted++;

  // Update streak
  const lastDate = tracking.lastCompletionDate ? tracking.lastCompletionDate.split('T')[0] : null;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (lastDate === today) {
    // Same day, don't change streak
  } else if (lastDate === yesterdayStr) {
    // Consecutive day, increment streak
    tracking.currentStreak++;
  } else {
    // Streak broken, reset to 1
    tracking.currentStreak = 1;
  }

  // Update longest streak
  if (tracking.currentStreak > tracking.longestStreak) {
    tracking.longestStreak = tracking.currentStreak;
  }

  tracking.lastCompletionDate = now.toISOString();
  tracking.lastStreakDate = now.toISOString();

  // Check for new milestones
  const newMilestones = [];
  const achieved = tracking.milestonesAchieved || [];

  // Task milestones
  const taskMilestones = [10, 25, 50, 100, 250, 500, 1000];
  for (const milestone of taskMilestones) {
    const key = `${milestone}_tasks`;
    if (tracking.totalTasksCompleted >= milestone && !achieved.includes(key)) {
      newMilestones.push(key);
      achieved.push(key);
    }
  }

  // Streak milestones
  const streakMilestones = [3, 5, 7, 14, 30, 60, 100];
  for (const milestone of streakMilestones) {
    const key = `${milestone}_day_streak`;
    if (tracking.currentStreak >= milestone && !achieved.includes(key)) {
      newMilestones.push(key);
      achieved.push(key);
    }
  }

  if (newMilestones.length > 0) {
    tracking.lastMilestoneDate = now.toISOString();
  }

  tracking.milestonesAchieved = JSON.stringify(achieved);

  // Save
  await milestonesClient.upsertEntity({
    partitionKey: 'milestones',
    rowKey: azureUserId,
    ...tracking
  }, 'Replace');

  return {
    tracking,
    newMilestones
  };
}

// ============================================================================
// SLACK MESSAGE TASK LINKS (Future)
// ============================================================================

/**
 * Save a link between a task and a Slack message
 */
async function saveMessageTaskLink(taskId, messageData) {
  const entity = {
    partitionKey: taskId,
    rowKey: messageData.messageId,
    slackChannelId: messageData.channelId,
    slackMessageTs: messageData.messageTs,
    createdAt: new Date().toISOString()
  };

  await messageLinksClient.upsertEntity(entity, 'Replace');
  return entity;
}

/**
 * Get message links for a task
 */
async function getMessageLinksForTask(taskId) {
  const entities = [];
  const iterator = messageLinksClient.listEntities({
    queryOptions: { filter: `PartitionKey eq '${taskId}'` }
  });

  for await (const entity of iterator) {
    entities.push(entity);
  }

  return entities;
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Initialization
  initializeTables,

  // Slack User Mappings
  saveSlackUserMapping,
  getSlackUserMapping,
  deleteSlackUserMapping,
  getAllSlackUserMappings,

  // Notification Preferences
  getNotificationPreferences,
  saveNotificationPreferences,
  updateNotificationPreferences,
  DEFAULT_PREFERENCES,

  // Milestone Tracking
  getMilestoneTracking,
  initializeMilestoneTracking,
  incrementTaskCompletion,

  // Message Task Links
  saveMessageTaskLink,
  getMessageLinksForTask,

  // Table names (for reference)
  TABLES
};
