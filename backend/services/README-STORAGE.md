# Azure Table Storage Setup - Slack Integration

This document describes the Azure Table Storage setup for TaskCommand's Slack integration.

## Overview

We're using Azure Table Storage to store:
- Slack user mappings (Azure AD ↔ Slack user linkage)
- Notification preferences per user
- Milestone tracking (task completions, streaks)
- Slack message-task links (future)

## Tables Created

### 1. SlackUserMappings
Stores the connection between Azure AD users and Slack users.

**Schema:**
```javascript
{
  partitionKey: "slackMapping",
  rowKey: azureUserId,
  slackUserId: string,
  slackTeamId: string,
  accessToken: string (encrypted),
  refreshToken: string (encrypted),
  tokenExpiry: timestamp,
  connectedAt: timestamp,
  lastSyncedAt: timestamp
}
```

### 2. NotificationPreferences
User-specific notification settings.

**Schema:**
```javascript
{
  partitionKey: "notificationPrefs",
  rowKey: azureUserId,
  assignmentNotifications: boolean,
  morningDigestEnabled: boolean,
  morningDigestTime: string (HH:MM),
  dailyKudosEnabled: boolean,
  dailyKudosTime: string (HH:MM),
  weeklyDigestEnabled: boolean,
  weeklyDigestDay: string (Monday-Sunday),
  weeklyDigestTime: string (HH:MM),
  milestonesEnabled: boolean,
  handoffNotifications: boolean,
  quietHoursStart: string (HH:MM),
  quietHoursEnd: string (HH:MM),
  timezone: string (IANA timezone),
  digestGrouping: string ("priority" | "project" | "dueDate"),
  channelType: string ("dm" | "channel"),
  teamChannelId: string (optional)
}
```

**Defaults:**
- Morning digest: 8:00 AM
- Daily kudos: 5:00 PM
- Weekly digest: Friday 4:00 PM
- Timezone: America/New_York
- All notifications enabled by default

### 3. MilestoneTracking
Tracks user achievements and productivity streaks.

**Schema:**
```javascript
{
  partitionKey: "milestones",
  rowKey: azureUserId,
  totalTasksCompleted: number,
  lastCompletionDate: timestamp,
  currentStreak: number (consecutive days),
  longestStreak: number,
  lastStreakDate: timestamp,
  milestonesAchieved: JSON array,
  lastMilestoneDate: timestamp
}
```

**Milestone Triggers:**
- Tasks: 10, 25, 50, 100, 250, 500, 1000
- Streaks: 3, 5, 7, 14, 30, 60, 100 days

### 4. SlackMessageTaskLinks (Future)
Links Slack messages to tasks for context.

**Schema:**
```javascript
{
  partitionKey: taskId,
  rowKey: messageId,
  slackChannelId: string,
  slackMessageTs: string,
  createdAt: timestamp
}
```

## Usage

### Import the service
```javascript
const storage = require('./services/storageService');
```

### Slack User Mappings
```javascript
// Save mapping
await storage.saveSlackUserMapping(azureUserId, {
  slackUserId: 'U12345',
  slackTeamId: 'T12345',
  accessToken: 'xoxp-...',
  refreshToken: 'xoxr-...'
});

// Get mapping
const mapping = await storage.getSlackUserMapping(azureUserId);

// Get all mappings (for batch operations)
const allMappings = await storage.getAllSlackUserMappings();

// Delete mapping
await storage.deleteSlackUserMapping(azureUserId);
```

### Notification Preferences
```javascript
// Get preferences (creates defaults if not exists)
const prefs = await storage.getNotificationPreferences(azureUserId);

// Update preferences
await storage.updateNotificationPreferences(azureUserId, {
  morningDigestTime: '09:00',
  timezone: 'America/Los_Angeles'
});

// Save all preferences
await storage.saveNotificationPreferences(azureUserId, preferences);
```

### Milestone Tracking
```javascript
// Get tracking
const tracking = await storage.getMilestoneTracking(azureUserId);

// Increment task completion (auto-updates streaks and milestones)
const result = await storage.incrementTaskCompletion(azureUserId);
// Returns: { tracking, newMilestones: ['10_tasks', '5_day_streak'] }
```

## Security

### Token Encryption
Slack OAuth tokens are encrypted using AES-256-CBC before storage.

**Environment Variable Required:**
```
ENCRYPTION_KEY=your-32-character-encryption-key
```

**Development:** Uses a default key (not secure)
**Production:** Set a strong encryption key in Azure Function App Settings

### Recommended: Use Azure Key Vault
For production, store the encryption key in Azure Key Vault:
```javascript
const { SecretClient } = require('@azure/keyvault-secrets');
const { DefaultAzureCredential } = require('@azure/identity');

const client = new SecretClient(vaultUrl, new DefaultAzureCredential());
const secret = await client.getSecret('ENCRYPTION_KEY');
```

## Local Development

### 1. Start Azurite (Azure Storage Emulator)
```bash
azurite --silent --location /tmp/azurite --debug /tmp/azurite/debug.log &
```

Or use Docker:
```bash
docker run -p 10000:10000 -p 10001:10001 -p 10002:10002 mcr.microsoft.com/azure-storage/azurite
```

### 2. Initialize Tables
```bash
npm run init-tables
```

### 3. Test Storage
```bash
node scripts/testStorage.js
```

## Production Setup

### 1. Create Azure Storage Account
```bash
az storage account create \
  --name taskcommandstorage \
  --resource-group taskcommand-rg \
  --location eastus \
  --sku Standard_LRS
```

### 2. Get Connection String
```bash
az storage account show-connection-string \
  --name taskcommandstorage \
  --resource-group taskcommand-rg
```

### 3. Update Azure Function App Settings
```bash
az functionapp config appsettings set \
  --name taskcommand-backend \
  --resource-group taskcommand-rg \
  --settings AzureWebJobsStorage="<connection-string>" \
              ENCRYPTION_KEY="<your-encryption-key>"
```

### 4. Initialize Tables (one-time)
Run the init-tables script from your local machine connected to production:
```bash
AzureWebJobsStorage="<production-connection-string>" npm run init-tables
```

Or deploy and run as an Azure Function.

## Monitoring

### View Tables in Azure Portal
1. Go to Storage Account → Storage Browser → Tables
2. View entities in each table
3. Monitor metrics and logs

### View Tables Locally (Azurite)
Use Azure Storage Explorer:
- Download: https://azure.microsoft.com/features/storage-explorer/
- Connect to local emulator
- Browse tables and entities

## Backup & Recovery

### Export Table Data
```bash
az storage entity query \
  --account-name taskcommandstorage \
  --table-name SlackUserMappings \
  --select "*"
```

### Restore from Backup
Upsert entities from exported JSON back into tables.

## Performance Considerations

- **Partition Key Strategy:** Single partition per table type for simplicity
  - For 200 users, this is fine
  - If scaling to 10,000+ users, consider partitioning by user cohorts

- **Query Patterns:** Optimized for single-user lookups
  - O(1) lookups by row key
  - Batch operations iterate all entities (acceptable for small scale)

- **Rate Limits:** Azure Table Storage
  - 20,000 transactions/second per storage account
  - Far exceeds our needs

## Cost Estimate

**For 200 users:**
- Storage: ~2KB × 200 users × 4 tables = 1.6MB ≈ **$0.01/month**
- Transactions: ~50K/month ≈ **$0.01/month**
- **Total: ~$0.02/month** (essentially free)

## Troubleshooting

### Tables not created
- Check Azurite is running: `ps aux | grep azurite`
- Check connection string in local.settings.json
- Run init-tables script again

### Encryption errors
- Verify ENCRYPTION_KEY is set in environment
- Check key is at least 32 characters
- In production, use Azure Key Vault

### Connection errors
- Local: Ensure Azurite is running
- Production: Verify connection string is correct
- Check firewall rules on Storage Account

## Next Steps

After storage is set up:
1. ✅ Tables created and tested
2. → Build Settings Page UI for Slack connection
3. → Implement OAuth flow
4. → Build Slack webhook handlers
5. → Implement notification service

## References

- [Azure Table Storage Documentation](https://docs.microsoft.com/azure/storage/tables/)
- [Azure Table Storage Node.js SDK](https://github.com/Azure/azure-sdk-for-js/tree/main/sdk/tables/data-tables)
- [Azurite Emulator](https://github.com/Azure/Azurite)
