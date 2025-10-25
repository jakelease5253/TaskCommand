# TaskCommand

> **Focus. Track. Command your tasks.** 🎯

A modern task management application built with React and Microsoft Graph API, featuring personal task tracking and company-wide manager dashboards.

## ✨ Features

### Personal Task Management
- 📊 **Performance Metrics** - Track completion rate, focus time, and streaks
- ⏱️ **Focus Timer** - Deep work sessions with task-specific time tracking
- 🎯 **Priority Queue** - Manage up to 7 high-priority tasks with drag & drop
- 📱 **Responsive Design** - Beautiful UI that works on all devices
- 🔄 **Real-time Sync** - Direct integration with Microsoft Planner

### Manager Dashboard
- 👥 **Company-Wide View** - See all tasks across all teams
- 📈 **Key Metrics** - Open tasks, overdue, in focus, upcoming deadlines
- 🔍 **Advanced Filtering** - Multi-select filters for assignees, plans, and status
- 📋 **Comprehensive Table** - Sortable columns with task details
- 🔐 **Secure Access** - Role-based authorization (configurable)

## 🏗️ Architecture

```
TaskCommand/
├── src/                          # Frontend (Vite + React)
│   ├── components/              # Reusable UI components
│   ├── features/                # Feature-specific components
│   │   ├── dashboards/         # Personal & Manager dashboards
│   │   └── settings/           # Settings page
│   ├── hooks/                  # Custom React hooks
│   └── App.jsx                 # Main application
│
└── backend/                     # Azure Functions (Node.js)
    ├── GetCompanyTasks/        # Company-wide tasks endpoint
    ├── services/               # Graph API client
    └── utils/                  # Authentication helpers
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Azure subscription (for deployment)
- Microsoft 365 account

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd TaskCommand
   ```

2. **Frontend Setup**
   ```bash
   npm install
   npm run dev
   # → http://localhost:5173
   ```

3. **Backend Setup** (for Manager Dashboard)
   ```bash
   cd backend
   cp local.settings.json.template local.settings.json
   # Edit local.settings.json with your Azure AD credentials
   npm install
   npm start
   # → http://localhost:7071
   ```

4. **Open your browser**
   ```
   http://localhost:5173
   ```

## 📚 Documentation

Comprehensive guides are available in the repository:

- **[SETUP.md](SETUP.md)** - Complete setup instructions
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Git workflow and deployment guide
- **[backend/README.md](backend/README.md)** - Backend API documentation

## 🔧 Configuration

### Environment Variables

**Frontend** (`.env.local`):
```bash
VITE_MSAL_CLIENT_ID=your-client-id
VITE_MSAL_TENANT_ID=your-tenant-id
VITE_REDIRECT_URI=http://localhost:5173
VITE_BACKEND_URL=http://localhost:7071
```

**Backend** (`backend/local.settings.json`):
```json
{
  "Values": {
    "AZURE_TENANT_ID": "your-tenant-id",
    "AZURE_CLIENT_ID": "your-backend-client-id",
    "AZURE_CLIENT_SECRET": "your-client-secret",
    "FRONTEND_CLIENT_ID": "your-frontend-client-id"
  }
}
```

See [SETUP.md](SETUP.md) for detailed configuration steps.

## 🌐 Deployment

### Git Workflow

```
feature/new-feature → dev (test) → main (production)
```

- **`main`** - Production (auto-deploys to Azure)
- **`dev`** - Development/Staging (auto-deploys to dev environment)
- **`feature/*`** - Feature branches

### Deploy to Azure

The repository includes GitHub Actions workflows for automatic deployment:

- **Frontend**: Azure Static Web Apps
- **Backend**: Azure Functions

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment instructions.

## 🔐 Security

### Azure AD Integration
- OAuth 2.0 authentication
- Secure token storage
- Auto-logout on token expiration

### Backend Security
- Application permissions for company-wide access
- User token validation
- Role-based authorization (configurable)
- CORS protection

## 🎨 Design System

TaskCommand uses a modern, clean design with:
- **Gradient Primary**: Indigo to Purple
- **Font**: Poppins (UI) + Fira Code (monospace)
- **Components**: Tailwind CSS + custom designs
- **Icons**: Custom SVG icon library

## 📦 Tech Stack

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- Microsoft Authentication Library (MSAL)
- Microsoft Graph Client

**Backend:**
- Azure Functions (Node.js)
- Microsoft Graph API
- Azure Identity

## 🔄 Git Workflow with Claude

When working with code from Claude:

```bash
# Pull Claude's branch
git fetch origin
git checkout claude/your-feature-branch

# Test locally
npm run dev

# Merge to dev for testing
git checkout dev
git merge claude/your-feature-branch
git push origin dev

# After testing, merge to main
git checkout main
git merge dev
git push origin main
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed git workflow.

## 🐛 Troubleshooting

### Common Issues

**"Cannot read properties of undefined"**
- Check if all environment variables are set
- Verify Azure AD app permissions

**CORS errors**
- Check `ALLOWED_ORIGINS` in backend settings
- Verify frontend URL matches exactly

**Manager Dashboard shows no tasks**
- Verify backend app has application permissions
- Check admin consent was granted in Azure AD
- Review backend logs in Azure Portal

**Token expired errors**
- Clear browser localStorage
- Re-login to get a fresh token

See [SETUP.md](SETUP.md#common-issues) for more troubleshooting tips.

## 📈 Monitoring

Both frontend and backend include Application Insights integration for:
- Performance monitoring
- Error tracking
- User analytics
- Custom telemetry

## 🤝 Contributing

1. Create a feature branch from `dev`
2. Make your changes
3. Test locally
4. Merge to `dev` for staging testing
5. After approval, merge to `main` for production

## 📝 License

[Your License Here]

## 🆘 Support

- Check [SETUP.md](SETUP.md) for setup help
- Review [DEPLOYMENT.md](DEPLOYMENT.md) for deployment issues
- See [backend/README.md](backend/README.md) for API documentation

---

**Built with ❤️ for FieldWorks**
