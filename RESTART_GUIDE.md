# TaskCommand - Restart Guide for Slack Integration

## After System Restart - Quick Start

### 1. Start Azurite (Azure Storage Emulator)
```bash
azurite --silent --location /tmp/azurite --debug /tmp/azurite/debug.log &
```

### 2. Start Frontend (in /dev folder)
```bash
cd /Users/jakelease/Documents/Projects/taskcommand-vite/dev
npm run dev
```
- Frontend runs on: http://localhost:5173

### 3. Start ngrok with your reserved domain
```bash
ngrok http 7071 --domain=taskcommand.ngrok.app
```
- **Permanent URL:** https://taskcommand.ngrok.app
- This URL never changes! 🎉

### 4. ~~Update Environment Variables~~ (Already configured!)
Your `.env.local` is already set to:
```env
VITE_BACKEND_URL=https://taskcommand.ngrok.app
```
✅ No need to change this anymore!

### 5. Update Slack App Configuration (ONE TIME ONLY)
1. Go to https://api.slack.com/apps
2. Select "TaskCommand" app
3. Go to **OAuth & Permissions** → **Redirect URLs**
4. Update the redirect URL to: `https://taskcommand.ngrok.app/api/slack/oauth/callback`
5. Click **Save URLs**

**Note:** You only need to do this once! The URL will stay the same forever.

### 6. Start Backend (in /dev/backend folder)
```bash
cd /Users/jakelease/Documents/Projects/taskcommand-vite/dev/backend
npm start
```

Wait for this output:
```
Functions:
  SlackOAuthCallback: [GET] http://localhost:7071/api/slack/oauth/callback
  GetSlackConnectionStatus: [GET,OPTIONS] http://localhost:7071/api/slack/connection/status
  DisconnectSlack: [DELETE,OPTIONS] http://localhost:7071/api/slack/connection
  UpdateSlackPreferences: [PUT,OPTIONS] http://localhost:7071/api/slack/preferences
```

### 7. Hard Refresh Frontend
- In your browser, press **Cmd+Shift+R** (Mac) or **Ctrl+Shift+F5** (Windows)
- This ensures the new backend URL is loaded

### 8. Test Slack Connection
1. Go to http://localhost:5173/?view=settings
2. Click "Connect to Slack"
3. Authorize the app
4. You should be redirected back with "Successfully connected to Slack!"

---

## Troubleshooting

### Backend won't start - "Connection timeout to cdn.functions.azure.com"
This is a network connectivity issue. Try:
1. Disconnect from VPN (if using one)
2. Check firewall settings
3. Try a different network (mobile hotspot)
4. Wait a few minutes and try again

### ngrok shows "Visit Site" warning page
- Already fixed! We added `ngrok-skip-browser-warning` header to all API calls

### OAuth fails with "bad_redirect_uri"
- Make sure you updated the Slack app redirect URL in step 5
- Make sure the ngrok URL in `.env.local` matches the one in Slack app

### Connection fails with "undefined access token" error
- Already fixed! We're now using the bot token instead of user token

---

## Current Slack App Credentials

**App ID:** A09P3H959U3
**Client ID:** 20478714756.9785587179955
**Slack Team:** FieldWorks (T0LE2M0N8)

**Scopes Configured:**
- chat:write
- commands
- users:read
- im:write
- im:history
- reactions:read
- channels:history

---

## What We Accomplished Today

### ✅ Completed
1. Created comprehensive Slack integration roadmap in FEATURES.md
2. Set up Azure Table Storage with 4 tables for Slack data
3. Created dedicated TaskCommand Slack app
4. Configured backend with Slack credentials
5. Built complete Settings Page UI with connection management
6. Implemented 4 backend OAuth endpoints:
   - OAuth callback
   - Connection status check
   - Disconnect
   - Update preferences
7. Fixed all OAuth errors:
   - Logging API (context.log.error → context.error)
   - ngrok HTTPS redirect URI
   - Bot token usage (oauthResult.accessToken)
   - ngrok warning page bypass

### 🔄 Pending Testing
1. End-to-end OAuth flow (blocked by network issue)
2. Disconnect functionality
3. Preference updates

### 📋 Next Steps (After OAuth Works)
1. Implement slash command handler with request verification
2. Implement /taskcommand help command
3. Implement /taskcommand mine command
4. Implement /taskcommand today command
5. Implement /taskcommand add command
6. Implement notification services:
   - Assignment notifications
   - Morning digest (8 AM)
   - Daily kudos (5 PM)

---

## Key Files Modified

- **backend/index.js** - Added 4 Slack OAuth endpoints
- **backend/services/slackService.js** - Created Slack API service
- **backend/services/storageService.js** - Created Azure Table Storage service
- **src/features/settings/Settings.jsx** - Built Settings page UI
- **src/components/ui/icons.jsx** - Added Slack, Bell, Link, Unlink icons
- **.env.local** - Backend URL configuration
- **FEATURES.md** - Added 3-phase Slack integration roadmap

---

## Storage Tables

**SlackUserMappings** - Maps Azure AD users to Slack users
**NotificationPreferences** - User notification settings
**MilestoneTracking** - Task completion stats and streaks
**SlackMessageTaskLinks** - Links Slack messages to tasks

All stored in Azurite local emulator at `/tmp/azurite`
