# Slack Integration - Production Deployment Guide

Quick reference for deploying Slack integration to production.

## Prerequisites Checklist

- [x] Slack app created (App ID: A09P3H959U3)
- [x] OAuth URLs configured
- [x] Slash commands configured
- [x] Interactive components enabled
- [x] Local development configured
- [x] Azure Table Storage set up
- [ ] Production environment variables configured
- [ ] Backend code deployed
- [ ] End-to-end testing completed

---

## Step 1: Configure Azure Function App Settings

### Via Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to: Function App → **taskcommand-backend** → Configuration → Application settings
3. Click **"+ New application setting"** for each:

```
Name: SLACK_CLIENT_ID
Value: 20478714756.9785587179955

Name: SLACK_CLIENT_SECRET
Value: 25faaa6cef904531be0a8557c3524d93

Name: SLACK_SIGNING_SECRET
Value: 19afb032cca4173d1a05a12884ac0258

Name: SLACK_APP_ID
Value: A09P3H959U3
```

4. Click **"Save"**
5. Function app will restart automatically

### Via Azure CLI (Alternative)

```bash
az functionapp config appsettings set \
  --name taskcommand-backend \
  --resource-group taskcommand-rg \
  --settings \
    SLACK_CLIENT_ID="20478714756.9785587179955" \
    SLACK_CLIENT_SECRET="25faaa6cef904531be0a8557c3524d93" \
    SLACK_SIGNING_SECRET="19afb032cca4173d1a05a12884ac0258" \
    SLACK_APP_ID="A09P3H959U3"
```

### Verify Settings

```bash
# List all settings (ensure Slack vars are present)
az functionapp config appsettings list \
  --name taskcommand-backend \
  --resource-group taskcommand-rg \
  | grep SLACK
```

---

## Step 2: Deploy Backend Code

### Option A: Via GitHub Actions (Recommended)

Backend auto-deploys on push to `main` when files in `backend/` change.

```bash
# Commit your Slack integration code
git add backend/
git commit -m "Add Slack integration endpoints"
git push origin main
```

Monitor deployment:
- Go to GitHub → Actions tab
- Watch "Deploy Backend to Azure Functions" workflow

### Option B: Manual Deployment

```bash
cd backend
npm install

# Deploy using Azure Functions Core Tools
func azure functionapp publish taskcommand-backend
```

---

## Step 3: Initialize Production Tables

Run once to create Azure Table Storage tables in production:

```bash
# Get production connection string
PROD_CONNECTION=$(az storage account show-connection-string \
  --name taskcommandstorage \
  --resource-group taskcommand-rg \
  --query connectionString -o tsv)

# Run init script with production connection
cd backend
AzureWebJobsStorage="$PROD_CONNECTION" npm run init-tables
```

Expected output:
```
✅ All tables initialized successfully!

Tables created:
  - SlackUserMappings
  - NotificationPreferences
  - MilestoneTracking
  - SlackMessageTaskLinks
```

---

## Step 4: Verify Endpoints

Test that all Slack endpoints are accessible:

```bash
# OAuth callback (should return 400 or redirect, not 404)
curl -I https://taskcommand-backend.azurewebsites.net/api/slack/oauth/callback

# Slash commands (should return 401 or 400, not 404)
curl -I https://taskcommand-backend.azurewebsites.net/api/slack/commands

# Interactive actions (should return 401 or 400, not 404)
curl -I https://taskcommand-backend.azurewebsites.net/api/slack/interactions

# Events (should return 401 or 400, not 404)
curl -I https://taskcommand-backend.azurewebsites.net/api/slack/events
```

**Expected:** HTTP 400/401 (endpoint exists but requires valid Slack request)
**Problem:** HTTP 404 (endpoint not deployed)

---

## Step 5: Test OAuth Flow

1. Deploy frontend Settings page
2. Go to TaskCommand Settings
3. Click "Connect to Slack"
4. Authorize in Slack
5. Verify redirect back to Settings
6. Check Azure Table Storage for user mapping

### Verify in Azure Storage Explorer

1. Open Azure Storage Explorer
2. Connect to your storage account
3. Navigate to: Tables → SlackUserMappings
4. Verify your user entry exists

---

## Step 6: Test Slash Commands

In Slack:

```
/taskcommand help
/taskcommand mine
/taskcommand today
```

Expected: Formatted response with your tasks

If it doesn't work:
1. Check Azure Function logs
2. Verify Slack request signature validation
3. Check user has connected their account

---

## Step 7: Test Interactive Buttons

1. Run a command that returns buttons (e.g., `/taskcommand mine`)
2. Click a button (e.g., "Complete")
3. Verify task updates
4. Check for confirmation message

---

## Monitoring

### Azure Application Insights

```bash
# View recent logs
az monitor app-insights query \
  --app taskcommand-insights \
  --analytics-query "traces | where message contains 'slack' | take 50"
```

### Function Invocation Logs

1. Go to Azure Portal → Function App → Functions
2. Click on a Slack function (e.g., `slack-oauth-callback`)
3. Click "Monitor" → "Logs"
4. Watch real-time logs

---

## Troubleshooting

### Issue: "Error validating request signature"

**Cause:** Incorrect `SLACK_SIGNING_SECRET`

**Fix:**
```bash
# Double-check the signing secret in Slack app
# Update Azure setting
az functionapp config appsettings set \
  --name taskcommand-backend \
  --resource-group taskcommand-rg \
  --settings SLACK_SIGNING_SECRET="correct-secret"
```

### Issue: "OAuth flow fails"

**Cause:** Incorrect redirect URL or client credentials

**Fix:**
1. Verify redirect URL in Slack app matches: `https://taskcommand-backend.azurewebsites.net/api/slack/oauth/callback`
2. Check `SLACK_CLIENT_ID` and `SLACK_CLIENT_SECRET` in Azure
3. Check Function logs for specific error

### Issue: "Slash commands not responding"

**Cause:** Endpoint timeout (> 3 seconds)

**Fix:**
1. Respond immediately with "Processing..." message
2. Use `response_url` for async operations
3. Optimize database queries

### Issue: "User not connected error"

**Cause:** User hasn't completed OAuth flow

**Fix:**
1. User needs to connect Slack in Settings
2. Show friendly error: "Please connect Slack in Settings first"
3. Provide deep link to Settings page

---

## Rollback Plan

If deployment causes issues:

### Rollback Backend

```bash
# List recent deployments
az functionapp deployment list \
  --name taskcommand-backend \
  --resource-group taskcommand-rg

# Rollback to previous deployment
az functionapp deployment source rollback \
  --name taskcommand-backend \
  --resource-group taskcommand-rg
```

### Disable Slack Integration Temporarily

```bash
# Remove Slack credentials (disables integration)
az functionapp config appsettings delete \
  --name taskcommand-backend \
  --resource-group taskcommand-rg \
  --setting-names SLACK_CLIENT_ID SLACK_CLIENT_SECRET
```

---

## Production URLs Summary

```
Backend Base: https://taskcommand-backend.azurewebsites.net

OAuth Callback: /api/slack/oauth/callback
Slash Commands: /api/slack/commands
Interactions:   /api/slack/interactions
Events:         /api/slack/events
```

---

## Security Checklist

- [ ] `SLACK_CLIENT_SECRET` stored securely (not in code)
- [ ] `SLACK_SIGNING_SECRET` stored securely (not in code)
- [ ] `ENCRYPTION_KEY` set in production (for token encryption)
- [ ] All Slack requests verified with signature
- [ ] OAuth tokens encrypted in storage
- [ ] CORS configured properly
- [ ] Rate limiting implemented
- [ ] Error messages don't expose sensitive data

---

## Post-Deployment

1. Announce to team: "Slack integration is live!"
2. Create onboarding doc for users
3. Monitor usage and errors for first week
4. Gather feedback
5. Plan Phase 2 features

---

**Last Updated:** 2025-10-28
