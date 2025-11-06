# Assignment Notifications Implementation Guide

**Date:** 2025-10-30
**Status:** Infrastructure Complete - Endpoint Integration Pending
**Progress:** 70% Complete

---

## ✅ What's Been Built

### 1. Subscription Manager (`backend/services/subscriptionManager.js`) - COMPLETE
Manages Microsoft Graph change notification subscriptions.

**Key Functions:**
- `createSubscription(azureUserId, notificationUrl)` - Creates a webhook subscription for a user's Planner tasks
- `renewSubscription(subscriptionId)` - Extends subscription before it expires (every ~3 days)
- `deleteSubscription(subscriptionId)` - Removes subscription when user disconnects
- `getUserSubscription(azureUserId)` - Retrieves subscription for a user
- `renewExpiringSubscriptions()` - Batch renews subscriptions expiring in next 24 hours

**Storage:**
- Subscriptions stored in Azure Table: `GraphSubscriptions`
- Fields: `subscriptionId`, `resource`, `expirationDateTime`, `clientState`

### 2. Notification Processor (`backend/services/notificationProcessor.js`) - COMPLETE
Processes incoming webhooks and sends Slack messages.

**Key Functions:**
- `processTaskNotification(notification)` - Handles a single task update notification
- `sendAssignmentNotification(azureUserId, task, plan, bucket)` - Sends Slack DM when task assigned
- `processNotificationBatch(notifications)` - Processes multiple notifications from Graph

**Flow:**
1. Receives notification from Microsoft Graph
2. Fetches full task details (task, plan, bucket)
3. Checks if user has Slack connected
4. Checks if user has assignment notifications enabled (preferences)
5. Sends formatted Slack message with "View Task" button

### 3. Slack Message Formatting (`backend/services/slackFormatter.js`) - UPDATED
Added `formatAssignmentNotification(task, plan, bucket)` function.

**Message Format:**
- Header: "📬 New Task Assigned"
- Task title with priority and due date
- Plan and bucket context
- "View Task" button linking to TaskCommand web app

---

## 🚧 What Needs To Be Built

### 1. **Webhook Endpoint in `index.js`** (CRITICAL)

Add this Azure Function endpoint:

```javascript
const notificationProcessor = require('./services/notificationProcessor');

app.http('GraphWebhook', {
  methods: ['POST'],
  route: 'webhooks/graph',
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      // Microsoft Graph sends a validation token on initial subscription
      // We need to respond with that token to confirm the webhook URL
      const validationToken = request.query.get('validationToken');

      if (validationToken) {
        context.log('Webhook validation request received');
        return {
          status: 200,
          headers: { 'Content-Type': 'text/plain' },
          body: validationToken
        };
      }

      // Normal notification processing
      const body = await request.json();

      context.log(`Received ${body.value?.length || 0} notifications`);

      // Process notifications asynchronously (don't block the response)
      if (body.value && body.value.length > 0) {
        // Fire and forget - process in background
        notificationProcessor.processNotificationBatch(body.value).catch(err => {
          context.error('Error processing notifications:', err);
        });
      }

      // Respond quickly to Microsoft Graph (must respond within 3 seconds)
      return {
        status: 202, // Accepted
        body: 'Notifications received'
      };

    } catch (error) {
      context.error('Error in GraphWebhook:', error);
      return {
        status: 500,
        body: 'Internal server error'
      };
    }
  }
});
```

**Important Notes:**
- Endpoint must be publicly accessible (use ngrok URL)
- Must respond to validation token for initial setup
- Must respond within 3 seconds (use async processing)
- URL format: `https://taskcommand.ngrok.app/api/webhooks/graph`

### 2. **Subscription Creation on Slack Connect**

Update the Slack OAuth callback to automatically create a subscription when user connects:

**Location:** `backend/index.js` - `SlackOAuthCallback` function (around line 650)

**Add after saving Slack mapping:**

```javascript
const subscriptionManager = require('./services/subscriptionManager');

// Create Graph subscription for task notifications
try {
  const webhookUrl = `${process.env.WEBHOOK_BASE_URL || 'https://taskcommand.ngrok.app'}/api/webhooks/graph`;

  await subscriptionManager.initializeSubscriptionsTable();
  await subscriptionManager.createSubscription(user.id, webhookUrl);

  context.log(`Created Graph subscription for user ${user.id}`);
} catch (error) {
  context.error('Error creating Graph subscription:', error);
  // Don't fail the OAuth flow if subscription creation fails
}
```

### 3. **Subscription Cleanup on Disconnect**

Update the disconnect endpoint to remove subscriptions:

**Location:** `backend/index.js` - `DisconnectSlack` function (around line 688)

**Add before deleting Slack mapping:**

```javascript
const subscriptionManager = require('./services/subscriptionManager');

// Delete Graph subscription
try {
  const subscription = await subscriptionManager.getUserSubscription(user.id);
  if (subscription) {
    await subscriptionManager.deleteSubscription(subscription.subscriptionId);
    context.log(`Deleted Graph subscription for user ${user.id}`);
  }
} catch (error) {
  context.error('Error deleting Graph subscription:', error);
  // Continue with disconnect even if subscription deletion fails
}
```

### 4. **Subscription Renewal Timer Function** (Optional but Recommended)

Create a timer function that runs daily to renew expiring subscriptions:

```javascript
const { app } = require('@azure/functions');
const subscriptionManager = require('./services/subscriptionManager');

app.timer('RenewSubscriptions', {
  schedule: '0 0 2 * * *', // Run at 2 AM every day
  handler: async (myTimer, context) => {
    context.log('Subscription renewal timer triggered');

    try {
      const renewedCount = await subscriptionManager.renewExpiringSubscriptions();
      context.log(`Renewed ${renewedCount} subscriptions`);
    } catch (error) {
      context.error('Error renewing subscriptions:', error);
    }
  }
});
```

---

## 🧪 Testing Plan

### Step 1: Setup ngrok
Ensure ngrok is running with a permanent domain:
```bash
ngrok http --domain=taskcommand.ngrok.app 7071
```

### Step 2: Test Webhook Validation
Use the Graph Explorer or Postman to send a validation request:
```
GET https://taskcommand.ngrok.app/api/webhooks/graph?validationToken=test123
```

Expected response: `test123`

### Step 3: Connect Slack
1. Go to Settings in TaskCommand
2. Connect to Slack
3. Check backend logs for:
   - "Created Graph subscription for user..."
   - Subscription ID from Microsoft Graph

### Step 4: Assign a Task
1. Open Microsoft Planner
2. Create or update a task
3. Assign it to yourself (or have someone assign it to you)
4. Check backend logs for:
   - "Received X notifications"
   - "Processing notification for task..."
   - "Sent assignment notification to user..."
5. Check Slack for the notification message

### Step 5: Verify Message Format
The Slack message should show:
- "📬 New Task Assigned" header
- Task title
- Priority and due date
- Plan and bucket name
- "View Task" button

---

## 🐛 Troubleshooting

### Problem: No notifications received
**Check:**
1. Is ngrok running and accessible?
2. Is the subscription active? (check GraphSubscriptions table in Azure Storage Explorer)
3. Are notifications enabled in user preferences? (check NotificationPreferences table)
4. Check backend logs for errors

### Problem: Subscription creation fails
**Common causes:**
- Invalid ngrok URL
- Missing Microsoft Graph permissions
- Network connectivity issues

**Solution:**
- Verify `WEBHOOK_BASE_URL` environment variable
- Ensure Azure app has `Tasks.ReadWrite` permission
- Check firewall/network settings

### Problem: Notifications received but Slack message not sent
**Check:**
1. User has Slack connected? (check SlackUserMappings table)
2. User has `assignmentNotifications` enabled in preferences?
3. Slack access token is valid?
4. Check backend logs for Slack API errors

---

## 📋 Environment Variables Needed

Add to `.env` or Azure Function App Settings:

```bash
# Webhook base URL (ngrok for development, production URL for prod)
WEBHOOK_BASE_URL=https://taskcommand.ngrok.app

# Existing variables (should already be set)
AZURE_TENANT_ID=xxx
AZURE_CLIENT_ID=xxx
AZURE_CLIENT_SECRET=xxx
SLACK_CLIENT_ID=xxx
SLACK_CLIENT_SECRET=xxx
SLACK_SIGNING_SECRET=xxx
```

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Update `WEBHOOK_BASE_URL` to production domain
- [ ] Add webhook endpoint to `index.js`
- [ ] Add subscription creation to OAuth callback
- [ ] Add subscription cleanup to disconnect handler
- [ ] Create subscription renewal timer function
- [ ] Test webhook validation
- [ ] Test end-to-end assignment notification
- [ ] Verify subscription auto-renewal works
- [ ] Monitor logs for errors

---

## 🔮 Future Enhancements

Once basic assignment notifications work:

1. **Smarter Filtering**: Only notify on NEW assignments (not every task update)
   - Store previous assignment list
   - Compare to detect new assignees

2. **Rich Notifications**: Include task description, checklist items, attachments

3. **Interactive Actions**: Add "Mark Complete" button directly in Slack

4. **Batching**: Group multiple assignments into a single message

5. **Quiet Hours**: Respect user's quiet hours preferences

---

## 📞 Key Files Reference

- **Subscription Manager**: `backend/services/subscriptionManager.js`
- **Notification Processor**: `backend/services/notificationProcessor.js`
- **Slack Formatter**: `backend/services/slackFormatter.js` (updated)
- **Main Index**: `backend/index.js` (needs updates)
- **Storage Service**: `backend/services/storageService.js` (preferences)

---

**Next Steps:** Add the webhook endpoint to `index.js` and test the full flow!
