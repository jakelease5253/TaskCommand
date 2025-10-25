# TaskCommand Backend - Azure Functions

This backend provides company-wide task access for the Manager Dashboard using Microsoft Graph API with application permissions.

## Architecture

- **Runtime**: Azure Functions (Node.js 18+)
- **Authentication**: Client Credentials Flow (Application Permissions)
- **API**: Microsoft Graph API
- **Authorization**: User token validation + role checking

## Prerequisites

1. **Azure CLI** - [Install here](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
2. **Azure Functions Core Tools** - Install with npm:
   ```bash
   npm install -g azure-functions-core-tools@4
   ```
3. **Node.js 18+** - [Download here](https://nodejs.org/)

## Setup Instructions

### 1. Create Backend App Registration in Azure

1. Go to [Azure Portal](https://portal.azure.com) → Azure Active Directory → App registrations
2. Click "New registration"
   - **Name**: TaskCommand Backend
   - **Supported account types**: Single tenant
   - **Redirect URI**: Leave empty (server-to-server)
3. Click "Register"
4. Copy the **Application (client) ID** - you'll need this
5. Copy the **Directory (tenant) ID** - you'll need this

### 2. Create Client Secret

1. In your backend app registration, go to "Certificates & secrets"
2. Click "New client secret"
   - **Description**: TaskCommand Backend Secret
   - **Expires**: 24 months (or your preferred duration)
3. Click "Add"
4. **IMMEDIATELY COPY THE SECRET VALUE** - you can't see it again!

### 3. Add API Permissions

1. In your backend app registration, go to "API permissions"
2. Click "Add a permission" → "Microsoft Graph" → "Application permissions"
3. Add these permissions:
   - `Tasks.Read.All`
   - `Group.Read.All`
   - `User.Read.All`
4. Click "Add permissions"
5. Click "Grant admin consent for [Your Organization]" - **IMPORTANT!**

### 4. Configure Local Settings

1. Copy the template:
   ```bash
   cp local.settings.json.template local.settings.json
   ```

2. Edit `local.settings.json` and fill in:
   ```json
   {
     "Values": {
       "AZURE_TENANT_ID": "your-tenant-id-from-step-1",
       "AZURE_CLIENT_ID": "your-backend-client-id-from-step-1",
       "AZURE_CLIENT_SECRET": "your-secret-from-step-2",
       "FRONTEND_CLIENT_ID": "8724797a-a121-4f6c-bc18-2cc72266a686",
       "ALLOWED_ORIGINS": "http://localhost:3000,http://localhost:5173"
     }
   }
   ```

### 5. Install Dependencies

```bash
cd backend
npm install
```

### 6. Run Locally

```bash
npm start
# or
func start
```

The function will be available at:
```
http://localhost:7071/api/tasks/company
```

### 7. Test the Endpoint

```bash
# You need a valid user token from your frontend
curl http://localhost:7071/api/tasks/company \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

## API Endpoints

### GET /api/tasks/company

Get all company-wide tasks.

**Headers:**
- `Authorization: Bearer <user_token>` (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [...],
    "plans": {...},
    "buckets": {...},
    "userProfiles": {...}
  },
  "metadata": {
    "totalTasks": 150,
    "totalPlans": 25,
    "timestamp": "2025-10-25T12:00:00Z"
  }
}
```

**Errors:**
- `401 Unauthorized` - Invalid or missing user token
- `403 Forbidden` - User doesn't have manager permissions
- `500 Internal Server Error` - Server error

## Deployment to Azure

### Option 1: Deploy from VS Code (Easiest)

1. Install the [Azure Functions extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurefunctions)
2. Open the `backend` folder in VS Code
3. Click the Azure icon in the sidebar
4. Click "Deploy to Function App"
5. Follow the prompts

### Option 2: Deploy from Azure CLI

```bash
# Login to Azure
az login

# Create a resource group (if you don't have one)
az group create --name TaskCommandRG --location eastus

# Create a storage account (required for Functions)
az storage account create \
  --name taskcommandstorage \
  --resource-group TaskCommandRG \
  --location eastus \
  --sku Standard_LRS

# Create the Function App
az functionapp create \
  --resource-group TaskCommandRG \
  --consumption-plan-location eastus \
  --runtime node \
  --runtime-version 18 \
  --functions-version 4 \
  --name taskcommand-backend \
  --storage-account taskcommandstorage

# Deploy the code
cd backend
func azure functionapp publish taskcommand-backend

# Configure app settings
az functionapp config appsettings set \
  --name taskcommand-backend \
  --resource-group TaskCommandRG \
  --settings \
    AZURE_TENANT_ID="your-tenant-id" \
    AZURE_CLIENT_ID="your-backend-client-id" \
    AZURE_CLIENT_SECRET="your-client-secret" \
    FRONTEND_CLIENT_ID="your-frontend-client-id" \
    ALLOWED_ORIGINS="https://your-frontend-domain.com"
```

### Option 3: Use Managed Identity (Most Secure - Recommended for Production)

Instead of using a client secret, you can use Managed Identity:

1. Enable system-assigned managed identity on your Function App
2. Grant the managed identity the required Graph API permissions
3. Remove `AZURE_CLIENT_SECRET` from environment variables
4. Update `graphClient.js` to use `ManagedIdentityCredential` instead of `ClientSecretCredential`

## Authorization Configuration

By default, all authenticated users can access the manager dashboard. To restrict access:

Edit `utils/auth.js` and uncomment the group membership check:

```javascript
// Check if user is in "Managers" security group
const memberOf = await client.api(`/me/memberOf`).get();

const isManager = memberOf.value.some(
  group => group.displayName === 'Managers' ||
           group.id === 'YOUR_MANAGERS_GROUP_ID'
);

if (!isManager) {
  throw new Error('User does not have manager permissions');
}
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `AZURE_TENANT_ID` | Azure AD Tenant ID | `327a958f-68a1-40f6-aada-48a87827f0b1` |
| `AZURE_CLIENT_ID` | Backend app client ID | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `AZURE_CLIENT_SECRET` | Backend app secret | `your-secret-value` |
| `FRONTEND_CLIENT_ID` | Frontend app client ID | `8724797a-a121-4f6c-bc18-2cc72266a686` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:5173,https://app.com` |

## Troubleshooting

### "Consent not granted" errors
- Make sure you clicked "Grant admin consent" in the API permissions section
- Wait a few minutes for permissions to propagate

### "Invalid client secret"
- Make sure you copied the secret value immediately after creating it
- Client secrets expire - check expiration date and create a new one if needed

### CORS errors
- Make sure `ALLOWED_ORIGINS` includes your frontend URL
- Check that your frontend is sending the `Authorization` header

### "Tasks.Read.All permission not found"
- Make sure you added **Application** permissions, not Delegated permissions
- Ensure admin consent was granted

## Security Best Practices

1. **Never commit `local.settings.json`** - it's in `.gitignore`
2. **Rotate client secrets regularly** - set up reminders
3. **Use Managed Identity in production** - eliminates secret management
4. **Implement proper role checking** - don't allow all users
5. **Enable Application Insights** - monitor for suspicious activity
6. **Use Azure Key Vault** - store secrets securely in production

## Next Steps

1. Test the endpoint locally with a real user token
2. Implement role-based authorization in `utils/auth.js`
3. Deploy to Azure
4. Update frontend to call the backend API
5. Set up monitoring with Application Insights
