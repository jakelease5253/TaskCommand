# TaskCommand Slack Integration Setup

This guide covers the complete setup of the TaskCommand Slack app.

## Overview

The TaskCommand Slack app provides:
- Slash commands (`/taskcommand mine`, `/taskcommand today`, etc.)
- Interactive buttons (Complete, Snooze, View in App)
- Daily digests and notifications
- Milestone celebrations

## Slack App Configuration

### App Details
- **App Name:** TaskCommand
- **App ID:** A09P3H959U3
- **Workspace:** FieldWorks Slack

### OAuth & Permissions

**Redirect URLs:**
```
https://taskcommand-backend.azurewebsites.net/api/slack/oauth/callback
```

**Bot Token Scopes:**
- `chat:write` - Send messages as TaskCommand bot
- `commands` - Add slash commands
- `users:read` - Read user profile information
- `im:write` - Send direct messages to users
- `im:history` - Read DM history
- `reactions:read` - Read emoji reactions (Phase 2)
- `channels:history` - Read messages in channels (Phase 2)

### Slash Commands

**Command:** `/taskcommand`

**Request URL:** `https://taskcommand-backend.azurewebsites.net/api/slack/commands`

**Subcommands:**
- `/taskcommand mine` - Show my active tasks
- `/taskcommand today` - Tasks due today
- `/taskcommand add [title]` - Create new task
- `/taskcommand priority` - Show priority queue
- `/taskcommand complete [task]` - Mark task done
- `/taskcommand overdue` - Show overdue tasks
- `/taskcommand stats` - Personal productivity stats
- `/taskcommand search [query]` - Search tasks
- `/taskcommand share [task]` - Share task in channel
- `/taskcommand help` - Command reference

### Interactive Components

**Request URL:** `https://taskcommand-backend.azurewebsites.net/api/slack/interactions`

**Button Actions:**
- Complete task
- Snooze task (date picker)
- Add to priority queue
- View in app (deep link)

### Event Subscriptions (Phase 2)

**Request URL:** `https://taskcommand-backend.azurewebsites.net/api/slack/events`

**Bot Events:**
- `reaction_added` - Emoji reaction task creation

---

## Backend Configuration

### Local Development

All credentials are stored in `backend/local.settings.json`:

```json
{
  "Values": {
    "SLACK_CLIENT_ID": "20478714756.9785587179955",
    "SLACK_CLIENT_SECRET": "25faaa6cef904531be0a8557c3524d93",
    "SLACK_SIGNING_SECRET": "19afb032cca4173d1a05a12884ac0258",
    "SLACK_APP_ID": "A09P3H959U3"
  }
}
```

**⚠️ Security Note:** `local.settings.json` is in `.gitignore` and never committed to version control.

### Production Configuration

Add these environment variables to your Azure Function App:

#### Via Azure Portal:
1. Go to Azure Portal → Function App → Configuration → Application settings
2. Add each variable:

```
SLACK_CLIENT_ID = 20478714756.9785587179955
SLACK_CLIENT_SECRET = 25faaa6cef904531be0a8557c3524d93
SLACK_SIGNING_SECRET = 19afb032cca4173d1a05a12884ac0258
SLACK_APP_ID = A09P3H959U3
```

3. Click "Save"

#### Via Azure CLI:

```bash
# Set all Slack credentials at once
az functionapp config appsettings set \
  --name taskcommand-backend \
  --resource-group taskcommand-rg \
  --settings \
    SLACK_CLIENT_ID="20478714756.9785587179955" \
    SLACK_CLIENT_SECRET="25faaa6cef904531be0a8557c3524d93" \
    SLACK_SIGNING_SECRET="19afb032cca4173d1a05a12884ac0258" \
    SLACK_APP_ID="A09P3H959U3"
```

#### Via GitHub Secrets (Recommended):

1. Add secrets to your GitHub repository:
   - `SLACK_CLIENT_ID`
   - `SLACK_CLIENT_SECRET`
   - `SLACK_SIGNING_SECRET`
   - `SLACK_APP_ID`

2. Update `.github/workflows/deploy-backend.yml` to set these as environment variables during deployment.

---

## API Endpoints

### 1. OAuth Callback - `/api/slack/oauth/callback`

**Method:** GET

**Query Parameters:**
- `code` - Authorization code from Slack
- `state` - CSRF protection token

**Flow:**
1. User clicks "Connect to Slack" in Settings
2. Redirected to Slack authorization page
3. User approves
4. Slack redirects to this endpoint with code
5. Exchange code for access token
6. Store token in Azure Table Storage (encrypted)
7. Redirect user back to Settings with success message

**Implementation:** Phase 1 (pending)

---

### 2. Slash Commands - `/api/slack/commands`

**Method:** POST

**Request Body (from Slack):**
```json
{
  "token": "verification_token",
  "team_id": "T12345",
  "user_id": "U12345",
  "command": "/taskcommand",
  "text": "mine",
  "response_url": "https://hooks.slack.com/...",
  "trigger_id": "..."
}
```

**Response (to Slack):**
```json
{
  "response_type": "ephemeral",
  "text": "Your Tasks",
  "blocks": [...]
}
```

**Authentication:** Verify request using `SLACK_SIGNING_SECRET`

**Implementation:** Phase 1 (pending)

---

### 3. Interactive Actions - `/api/slack/interactions`

**Method:** POST

**Request Body (from Slack):**
```json
{
  "type": "block_actions",
  "user": { "id": "U12345", ... },
  "actions": [{
    "action_id": "complete_task",
    "value": "task-id-123"
  }],
  "response_url": "https://hooks.slack.com/..."
}
```

**Response:**
- Update message with new state
- Send confirmation

**Authentication:** Verify request using `SLACK_SIGNING_SECRET`

**Implementation:** Phase 1 (pending)

---

### 4. Event Subscriptions - `/api/slack/events` (Phase 2)

**Method:** POST

**Request Body (from Slack):**
```json
{
  "type": "event_callback",
  "event": {
    "type": "reaction_added",
    "user": "U12345",
    "reaction": "zap",
    "item": {
      "type": "message",
      "channel": "C12345",
      "ts": "1234567890.123456"
    }
  }
}
```

**Verification Challenge (first time):**
```json
{
  "type": "url_verification",
  "challenge": "random_string"
}
```

**Response:** Echo the challenge string

**Implementation:** Phase 2

---

## Security

### Request Verification

All Slack requests must be verified using the **Signing Secret**.

**Verification Process:**
1. Get `X-Slack-Signature` header
2. Get `X-Slack-Request-Timestamp` header
3. Compute HMAC SHA256: `v0:timestamp:body`
4. Compare with received signature

**Implementation:** Use `@slack/bolt` or manual verification

### Token Storage

Slack OAuth tokens are stored encrypted in Azure Table Storage:
- Encryption: AES-256-CBC
- Key: `ENCRYPTION_KEY` environment variable
- In production: Store encryption key in Azure Key Vault

---

## Testing

### Local Testing

**Problem:** Slack requires HTTPS, localhost is HTTP

**Solution:** Use ngrok to create HTTPS tunnel

```bash
# Install ngrok
brew install ngrok

# Start your backend
cd backend
npm start

# In another terminal, start ngrok
ngrok http 7071
```

ngrok gives you: `https://abc123.ngrok.io`

**Update Slack URLs temporarily:**
- OAuth: `https://abc123.ngrok.io/api/slack/oauth/callback`
- Commands: `https://abc123.ngrok.io/api/slack/commands`
- Interactions: `https://abc123.ngrok.io/api/slack/interactions`

**⚠️ Remember:** Switch back to production URLs when done testing!

### Production Testing

1. Deploy backend to Azure
2. Verify all endpoints are reachable
3. Test OAuth flow in Settings page
4. Test slash commands in Slack
5. Test interactive buttons

---

## Deployment Checklist

### Before First Deployment:

- [x] Slack app created
- [x] OAuth scopes configured
- [x] Redirect URLs set
- [x] Slash commands configured
- [x] Interactive components enabled
- [x] Backend credentials stored in local.settings.json
- [ ] Production environment variables set in Azure
- [ ] Backend deployed to Azure
- [ ] OAuth endpoints implemented
- [ ] Slash command endpoints implemented
- [ ] Interactive action endpoints implemented

### Production Deployment:

```bash
# 1. Ensure all environment variables are set in Azure
az functionapp config appsettings list \
  --name taskcommand-backend \
  --resource-group taskcommand-rg \
  | grep SLACK

# 2. Deploy backend (triggers via GitHub Actions or manual)
git push origin main

# 3. Verify endpoints are live
curl https://taskcommand-backend.azurewebsites.net/api/slack/oauth/callback
curl https://taskcommand-backend.azurewebsites.net/api/slack/commands

# 4. Test OAuth flow from Settings page

# 5. Test slash commands in Slack
/taskcommand help
```

---

## Monitoring & Debugging

### Azure Application Insights

Monitor Slack integration:
- Request counts
- Error rates
- Response times
- Failed authentications

### Slack Request Logs

View request logs in Azure Function App:
- Monitor → Logs
- Filter for "slack" in function name
- Check for errors

### Common Issues

**1. Request verification failed**
- Check `SLACK_SIGNING_SECRET` is correct
- Verify timestamp isn't stale (5 minutes max)

**2. OAuth flow fails**
- Check `SLACK_CLIENT_ID` and `SLACK_CLIENT_SECRET`
- Verify redirect URL matches exactly
- Check token storage is working

**3. Slash commands don't respond**
- Verify endpoint is reachable
- Check CORS settings
- Ensure request is verified
- Respond within 3 seconds (or use `response_url` for async)

**4. Interactive buttons don't work**
- Check interaction endpoint is configured
- Verify request signature
- Ensure proper response format

---

## Rate Limits

### Slack API Rate Limits

**Tier 3 (100+ users):**
- 1+ requests per second
- Burst allowed

**Best Practices:**
- Cache user data
- Batch operations where possible
- Use `response_url` for async operations
- Handle 429 (rate limit) responses gracefully

---

## Next Steps

1. ✅ Slack app created
2. ✅ Backend configured with credentials
3. → Implement OAuth endpoints
4. → Implement slash command handlers
5. → Implement interactive actions
6. → Build Settings page UI
7. → Deploy and test end-to-end

---

## References

- [Slack API Documentation](https://api.slack.com/)
- [Slack OAuth Guide](https://api.slack.com/authentication/oauth-v2)
- [Slack Block Kit Builder](https://app.slack.com/block-kit-builder)
- [Request Verification](https://api.slack.com/authentication/verifying-requests-from-slack)
- [@slack/bolt Framework](https://slack.dev/bolt-js)

---

**Last Updated:** 2025-10-28
