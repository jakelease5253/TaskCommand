# TaskCommand Deployment Guide

## Repository Structure

```
TaskCommand/
├── src/                    # Frontend React app (Vite)
├── backend/                # Azure Functions backend
├── .github/workflows/      # GitHub Actions CI/CD
│   ├── deploy-frontend-main.yml
│   ├── deploy-frontend-dev.yml
│   └── deploy-backend.yml
└── README.md
```

## Git Workflow

### Branches

- **`main`** - Production (auto-deploys to Azure)
- **`dev`** - Development/Staging (auto-deploys to dev environment)
- **`feature/*`** or **`claude/*`** - Feature branches (merge to `dev` first)

### Workflow Diagram

```
feature/new-feature → dev (test) → main (production)
     ↓                 ↓               ↓
   Local          Dev Environment   Production
```

### Working with Feature Branches

```bash
# Start new feature
git checkout dev
git pull origin dev
git checkout -b feature/my-new-feature

# Make changes, commit
git add .
git commit -m "Add new feature"

# Push to GitHub
git push origin feature/my-new-feature

# When ready, merge to dev for testing
git checkout dev
git merge feature/my-new-feature
git push origin dev
# ← This triggers automatic deployment to dev environment

# After testing in dev, merge to main
git checkout main
git merge dev
git push origin main
# ← This triggers automatic deployment to production
```

### Working with Claude's Code

When Claude creates code on a branch:

```bash
# Pull Claude's branch
git fetch origin
git checkout claude/fix-edit-task-modal-011CUSmfXU4FSg6kXbgYV6xK

# Test locally
npm install
npm run dev

# If good, merge to dev
git checkout dev
git merge claude/fix-edit-task-modal-011CUSmfXU4FSg6kXbgYV6xK
git push origin dev

# Test in dev environment
# If everything works, merge to main
git checkout main
git merge dev
git push origin main

# Clean up Claude's branch
git branch -d claude/fix-edit-task-modal-011CUSmfXU4FSg6kXbgYV6xK
git push origin --delete claude/fix-edit-task-modal-011CUSmfXU4FSg6kXbgYV6xK
```

## Deployment Environments

### Production Environment

**Frontend:**
- Azure Static Web Apps
- URL: `https://your-app.azurestaticapps.net`
- Deploys: `main` branch

**Backend:**
- Azure Functions (Consumption Plan)
- URL: `https://taskcommand-backend.azurefunctions.net`
- Deploys: `main` branch

### Dev Environment

**Frontend:**
- Azure Static Web Apps (separate instance)
- URL: `https://your-app-dev.azurestaticapps.net`
- Deploys: `dev` branch

**Backend:**
- Azure Functions (separate instance)
- URL: `https://taskcommand-backend-dev.azurefunctions.net`
- Deploys: `dev` branch

## Initial Azure Setup

### 1. Frontend (Azure Static Web Apps)

**Create Production Instance:**
```bash
# Azure Portal → Static Web Apps → Create
Name: taskcommand-frontend
Plan: Free
Region: East US
Branch: main
Build preset: React
App location: /
Output location: dist

# Copy deployment token to GitHub Secrets:
# AZURE_STATIC_WEB_APPS_API_TOKEN_PRODUCTION
```

**Create Dev Instance:**
```bash
# Repeat for dev environment
Name: taskcommand-frontend-dev
Branch: dev

# Copy deployment token to GitHub Secrets:
# AZURE_STATIC_WEB_APPS_API_TOKEN_DEV
```

### 2. Backend (Azure Functions)

**Create Backend App Registration (Azure AD):**
1. Azure Portal → App Registrations → New
   - Name: TaskCommand Backend
   - Copy Client ID
   - Create client secret → copy value

2. API Permissions → Add:
   - Microsoft Graph → Application permissions:
     - `Tasks.Read.All`
     - `Group.Read.All`
     - `User.Read.All`
   - Grant admin consent

**Create Production Function App:**
```bash
az group create --name TaskCommandRG --location eastus

az storage account create \
  --name taskcommandstorage \
  --resource-group TaskCommandRG \
  --sku Standard_LRS

az functionapp create \
  --resource-group TaskCommandRG \
  --consumption-plan-location eastus \
  --runtime node \
  --runtime-version 18 \
  --functions-version 4 \
  --name taskcommand-backend \
  --storage-account taskcommandstorage

# Configure app settings
az functionapp config appsettings set \
  --name taskcommand-backend \
  --resource-group TaskCommandRG \
  --settings \
    AZURE_TENANT_ID="your-tenant-id" \
    AZURE_CLIENT_ID="your-backend-client-id" \
    AZURE_CLIENT_SECRET="your-client-secret" \
    FRONTEND_CLIENT_ID="your-frontend-client-id" \
    ALLOWED_ORIGINS="https://your-app.azurestaticapps.net"

# Get publish profile for GitHub Actions
az functionapp deployment list-publishing-profiles \
  --name taskcommand-backend \
  --resource-group TaskCommandRG \
  --xml > backend-publish-profile.xml

# Copy contents to GitHub Secret: AZURE_FUNCTIONAPP_PUBLISH_PROFILE_PRODUCTION
```

**Create Dev Function App:**
```bash
# Repeat for dev environment
az functionapp create \
  --name taskcommand-backend-dev \
  # ... rest of config

# Copy publish profile to: AZURE_FUNCTIONAPP_PUBLISH_PROFILE_DEV
```

### 3. GitHub Secrets Configuration

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

**Frontend Secrets:**
- `VITE_MSAL_CLIENT_ID` - Your frontend app client ID
- `VITE_MSAL_TENANT_ID` - Your Azure AD tenant ID
- `VITE_REDIRECT_URI` - Production URL (e.g., https://your-app.azurestaticapps.net)
- `VITE_REDIRECT_URI_DEV` - Dev URL (e.g., https://your-app-dev.azurestaticapps.net)
- `VITE_BACKEND_URL` - Production backend URL
- `VITE_BACKEND_URL_DEV` - Dev backend URL
- `AZURE_STATIC_WEB_APPS_API_TOKEN_PRODUCTION` - From Azure Static Web Apps
- `AZURE_STATIC_WEB_APPS_API_TOKEN_DEV` - From Azure Static Web Apps (dev)

**Backend Secrets:**
- `AZURE_FUNCTIONAPP_NAME_PRODUCTION` - Function app name (e.g., taskcommand-backend)
- `AZURE_FUNCTIONAPP_NAME_DEV` - Dev function app name
- `AZURE_FUNCTIONAPP_PUBLISH_PROFILE_PRODUCTION` - Publish profile XML
- `AZURE_FUNCTIONAPP_PUBLISH_PROFILE_DEV` - Dev publish profile XML

## Local Development

### Frontend
```bash
# Install dependencies
npm install

# Run dev server
npm run dev
# → http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend
```bash
cd backend

# Copy environment template
cp local.settings.json.template local.settings.json

# Edit local.settings.json with your values
# (See backend/README.md for details)

# Install dependencies
npm install

# Run locally
npm start
# → http://localhost:7071
```

### Full Stack Local Development

Terminal 1 (Frontend):
```bash
npm run dev
```

Terminal 2 (Backend):
```bash
cd backend
npm start
```

Configure frontend to use local backend:
```bash
# .env.local
VITE_BACKEND_URL=http://localhost:7071
```

## Testing Strategy

### Local Testing
1. Make changes in feature branch
2. Test frontend with `npm run dev`
3. Test backend with `cd backend && npm start`
4. Verify everything works together

### Dev Environment Testing
1. Merge feature branch to `dev`
2. Push to GitHub (auto-deploys)
3. Wait ~2 minutes for deployment
4. Test at dev URL
5. Check Azure Portal for logs if issues

### Production Deployment
1. Only merge to `main` after thorough dev testing
2. Push to GitHub (auto-deploys)
3. Monitor Application Insights
4. Test production URL
5. Keep `dev` as rollback option

## Rollback Strategy

If production has issues:

```bash
# Option 1: Revert the commit
git checkout main
git revert HEAD
git push origin main

# Option 2: Reset to previous commit
git checkout main
git reset --hard <previous-commit-hash>
git push origin main --force  # Use with caution!

# Option 3: Redeploy from dev
git checkout main
git reset --hard dev
git push origin main --force
```

## Monitoring

### Application Insights

Both frontend and backend are connected to Application Insights:

1. Azure Portal → Application Insights
2. View:
   - Failures
   - Performance
   - Users
   - Custom queries

### Logs

**Function App Logs:**
```bash
# Stream logs
az functionapp log tail \
  --name taskcommand-backend \
  --resource-group TaskCommandRG
```

**Static Web App Logs:**
- Azure Portal → Static Web Apps → your app → Logs

## Troubleshooting

### Deployment not triggering
- Check GitHub Actions tab for errors
- Verify branch names match workflow triggers
- Check GitHub Secrets are set correctly

### Frontend build fails
- Check environment variables in GitHub Secrets
- Verify Node.js version (should be 18)
- Review build logs in GitHub Actions

### Backend deployment fails
- Verify publish profile is correct
- Check Function App is running in Azure Portal
- Review Application Insights for errors

### CORS errors in production
- Verify `ALLOWED_ORIGINS` in backend app settings
- Check frontend URL matches exactly (no trailing slash)

## Best Practices

1. **Never commit directly to `main`** - Always go through `dev` first
2. **Test in dev before production** - Don't skip this step
3. **Keep branches short-lived** - Merge feature branches quickly
4. **Delete merged branches** - Keep repo clean
5. **Use meaningful commit messages** - Help future you
6. **Monitor Application Insights** - Catch issues early
7. **Update dependencies regularly** - Security and performance
8. **Document changes** - Update this file when process changes

## Maintenance Tasks

### Monthly
- Review and rotate client secrets (Azure AD)
- Update npm dependencies
- Review Application Insights for errors
- Clean up old branches

### Quarterly
- Review Azure costs
- Update Node.js version if needed
- Review and update GitHub Actions workflows
- Security audit

## Support

For issues:
1. Check Application Insights logs
2. Review GitHub Actions logs
3. Check Azure Portal for service health
4. Review this documentation

For help with Claude Code:
- Reference commit messages for context
- Check feature branch history
- Review PR descriptions
