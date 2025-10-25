# TaskCommand - Quick Setup Guide

This guide will help you get TaskCommand running locally and deployed to Azure.

## Prerequisites

- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] Azure CLI installed (`az --version`)
- [ ] Azure Functions Core Tools installed (`func --version`)
- [ ] Azure subscription with admin access
- [ ] VS Code (recommended) with Azure extensions

## Step-by-Step Setup

### 1. Clone and Setup Repository ✓

You already have this! But for reference:

```bash
git clone <your-repo-url>
cd TaskCommand
```

### 2. Create Azure AD App Registrations

#### Frontend App (Already exists)

Your existing app:
- Client ID: `8724797a-a121-4f6c-bc18-2cc72266a686`
- Tenant ID: `327a958f-68a1-40f6-aada-48a87827f0b1`

Make sure it has these **delegated** permissions:
- [x] User.Read
- [x] Tasks.ReadWrite
- [x] Tasks.ReadWrite.Shared
- [x] Group.Read.All
- [x] User.Read.All

#### Backend App (New - Need to create)

1. Go to [Azure Portal](https://portal.azure.com) → Azure Active Directory → App registrations
2. Click **"New registration"**
   - Name: `TaskCommand Backend`
   - Supported account types: **Accounts in this organizational directory only**
   - Redirect URI: Leave empty
3. Click **"Register"**
4. **Copy these values:**
   - Application (client) ID: `_____________________`
   - Directory (tenant) ID: `_____________________` (should match frontend)

5. Create **Client Secret:**
   - Go to "Certificates & secrets"
   - Click "New client secret"
   - Description: `TaskCommand Backend Secret`
   - Expires: **24 months**
   - Click "Add"
   - **IMMEDIATELY COPY THE VALUE:** `_____________________`
   - ⚠️ You can't see this again!

6. Add **Application Permissions:**
   - Go to "API permissions"
   - Click "Add a permission" → "Microsoft Graph" → "Application permissions"
   - Add these permissions:
     - [ ] `Tasks.Read.All`
     - [ ] `Group.Read.All`
     - [ ] `User.Read.All`
   - Click "Add permissions"
   - Click **"Grant admin consent for [Your Org]"** ← CRITICAL!
   - Wait for green checkmarks

### 3. Setup Local Development

#### Frontend

```bash
# In project root
npm install

# Create .env.local for local development
cat > .env.local << EOF
VITE_MSAL_CLIENT_ID=8724797a-a121-4f6c-bc18-2cc72266a686
VITE_MSAL_TENANT_ID=327a958f-68a1-40f6-aada-48a87827f0b1
VITE_REDIRECT_URI=http://localhost:5173
VITE_BACKEND_URL=http://localhost:7071
EOF

# Test it
npm run dev
# → http://localhost:5173
```

#### Backend

```bash
cd backend

# Install dependencies
npm install

# Copy template and fill in your values
cp local.settings.json.template local.settings.json

# Edit local.settings.json
# Replace these placeholders:
# - YOUR_BACKEND_APP_CLIENT_ID (from step 2.4)
# - YOUR_CLIENT_SECRET (from step 2.5)

# Test it
npm start
# → http://localhost:7071
```

**Your `backend/local.settings.json` should look like:**
```json
{
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AZURE_TENANT_ID": "327a958f-68a1-40f6-aada-48a87827f0b1",
    "AZURE_CLIENT_ID": "YOUR_BACKEND_APP_CLIENT_ID",
    "AZURE_CLIENT_SECRET": "YOUR_CLIENT_SECRET",
    "FRONTEND_CLIENT_ID": "8724797a-a121-4f6c-bc18-2cc72266a686",
    "ALLOWED_ORIGINS": "http://localhost:3000,http://localhost:5173"
  }
}
```

### 4. Test Locally

Terminal 1:
```bash
npm run dev
```

Terminal 2:
```bash
cd backend
npm start
```

Browser:
```
http://localhost:5173
```

**Test the Manager Dashboard:**
1. Login with your account
2. Click Menu → Manager Dashboard
3. Should show company-wide tasks!

### 5. Deploy to Azure

#### Option A: Deploy from VS Code (Easiest)

**Frontend:**
1. Install [Azure Static Web Apps extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurestaticwebapps)
2. Click Azure icon in sidebar
3. Right-click "Static Web Apps" → "Create Static Web App"
4. Follow prompts:
   - Resource group: Create new or use existing
   - Name: `taskcommand-frontend`
   - Region: Choose closest
   - Build preset: `React`
   - App location: `/`
   - Output location: `dist`
5. Copy the deployment token to GitHub Secrets

**Backend:**
1. Install [Azure Functions extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurefunctions)
2. Click Azure icon in sidebar
3. Right-click "Function App" → "Create Function App in Azure"
4. Follow prompts:
   - Name: `taskcommand-backend`
   - Runtime: Node.js 18
   - Region: Choose same as frontend
5. Right-click your function app → "Deploy to Function App"
6. After deployment, configure app settings:
   - Right-click function app → "Upload Local Settings"
   - Or manually add in Azure Portal

#### Option B: Deploy from Azure CLI

See `DEPLOYMENT.md` for detailed CLI commands.

### 6. Configure GitHub Actions

Add these secrets to GitHub (Settings → Secrets and variables → Actions):

**Required for production:**
```
VITE_MSAL_CLIENT_ID=8724797a-a121-4f6c-bc18-2cc72266a686
VITE_MSAL_TENANT_ID=327a958f-68a1-40f6-aada-48a87827f0b1
VITE_REDIRECT_URI=https://your-app.azurestaticapps.net
VITE_BACKEND_URL=https://taskcommand-backend.azurefunctions.net
AZURE_STATIC_WEB_APPS_API_TOKEN_PRODUCTION=<from-step-5>
AZURE_FUNCTIONAPP_NAME_PRODUCTION=taskcommand-backend
AZURE_FUNCTIONAPP_PUBLISH_PROFILE_PRODUCTION=<from-azure-portal>
```

**Optional for dev environment:**
(Same as above but with `_DEV` suffix and dev URLs)

### 7. Update Frontend App Registration

Add your production URL to the frontend app registration:

1. Azure Portal → App Registrations → TaskCommand (frontend)
2. Authentication → Add a platform → Single-page application
3. Redirect URIs:
   - Add: `https://your-app.azurestaticapps.net`
   - Add: `http://localhost:5173` (for local dev)
4. Save

### 8. Test Production

1. Push to `main` branch
2. GitHub Actions will auto-deploy
3. Visit your production URL
4. Test Manager Dashboard

## Verification Checklist

- [ ] Frontend runs locally (`npm run dev`)
- [ ] Backend runs locally (`cd backend && npm start`)
- [ ] Can login locally
- [ ] Manager Dashboard shows company tasks locally
- [ ] Backend app has application permissions with admin consent
- [ ] Frontend deployed to Azure Static Web Apps
- [ ] Backend deployed to Azure Functions
- [ ] Backend app settings configured in Azure
- [ ] Frontend app registration has production URL
- [ ] GitHub Actions workflows configured
- [ ] Can login to production
- [ ] Manager Dashboard works in production

## Common Issues

### "Consent not granted" error
- Make sure you clicked "Grant admin consent" in backend app permissions
- Wait 5 minutes for propagation

### "Invalid client secret"
- Make sure you copied the **value** not the **ID**
- Client secrets expire - create a new one if needed

### CORS errors
- Check `ALLOWED_ORIGINS` in backend app settings
- Make sure URLs match exactly (no trailing slash)

### Manager Dashboard shows empty
- Check browser console for errors
- Verify backend app has application permissions
- Check backend logs in Azure Portal
- Make sure admin consent was granted

### Local backend won't start
- Check `local.settings.json` is properly formatted
- Verify all values are filled in (no placeholders)
- Check Azure Functions Core Tools is installed

## Next Steps

After setup is complete:

1. **Setup Git Workflow** - See `DEPLOYMENT.md`
2. **Configure Role-Based Access** - Edit `backend/utils/auth.js` to restrict who can see Manager Dashboard
3. **Setup Monitoring** - Configure Application Insights alerts
4. **Enable Dev Environment** - Create dev instances for safer testing

## Need Help?

- **Setup Issues**: Check `backend/README.md`
- **Deployment Issues**: Check `DEPLOYMENT.md`
- **Git Workflow**: Check `DEPLOYMENT.md` → Git Workflow section
- **Azure Issues**: Check Application Insights logs

## Save Your Values!

Keep these somewhere safe (password manager):

```
Frontend Client ID: 8724797a-a121-4f6c-bc18-2cc72266a686
Tenant ID: 327a958f-68a1-40f6-aada-48a87827f0b1
Backend Client ID: _____________________
Backend Client Secret: _____________________
Production URL: _____________________
Backend URL: _____________________
```
