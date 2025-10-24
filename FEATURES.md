# TaskCommand Feature List

A living document to track features, improvements, and changes we want to implement.

**Strategic Direction:** Microsoft Planner backend with modern UI and Slack integration for internal company-wide use at FieldWorks.

---

## 🎯 High Priority

### Features to Add
- [ ] **Display checklist items along with other task details in focus mode**
  - Show all checklist items and other task information in focus mode
  - Include a visual progress bar for tasks with checklists
  - Display completion status for each checklist item

- [ ] **Sync completed checklist items with Planner in real time**
  - Ensure changes to checklist items sync immediately with Microsoft Planner
  - Handle ETag-based concurrency control
  - Provide visual confirmation of sync status

- [ ] **Add Environment Banner (DEV Only)**
  - Display a banner on DEV environment (localhost:3001)
  - No banner on live/production site (task.fieldworks.com)
  - Helps prevent confusion between environments

- [ ] **Slack Integration (Phase 1)**
  - **Basic Reminders**
    - Daily upcoming tasks summary at beginning of day
    - Daily kudos summary of completed and focused tasks
    - Notification when a new task is assigned

### Next Up (Design & Scoping)
- [ ] **Manager Dashboard (MVP)**
  - See open tasks across all plans for direct reports
  - (Naming TBD)
- [ ] **Admin Dashboard (All Company)**
  - See open tasks across all plans for all of FieldWorks
  - (Naming TBD)
- [ ] **Settings (Foundational)**
  - Manage individual settings related to Slack integration
  - Consider admin settings for who can see whose tasks (or leverage Entra ID hierarchy)
  - Super Admin role controls access to the All Company Dashboard

---

## 🔮 Future Enhancements

- The previously listed high-priority items regarding focus checklist completion and real-time sync are now merged into the above features for clarity.

### Core Functionality
- [ ] **DEV-only favicon badge**
  - Show a small “DEV” indicator in the tab icon when running on localhost:3001

- [ ] **Backend → Slack API (replace PA relay)**
  - Create secure backend endpoint (Azure Functions / SWA API) for Slack calls
  - Store Slack Bot Token server-side (Key Vault/App Settings)
  - Support: chat.postMessage, scheduling (optional), attachments/blocks
  - AuthN/AuthZ via Entra (only TaskCommand calls allowed)
  - Migrate Phase 1 (daily reminders, kudos, new assignment) to backend
  - Decommission PA flow once parity is verified

- [ ] **Search tasks**
  - Global search functionality to quickly find tasks across all plans
  - Search by title, description, tags, assignee
  - Filter by plan, bucket, priority, due date

- [ ] **Cross-plan task view**
  - "Show me ALL my tasks" across every plan
  - Unified view regardless of which Planner board tasks are on

- [ ] **Task dependencies**
  - Mark tasks that can't start until another is complete
  - Visual indicators for blocked tasks

- [ ] **Recurring tasks**
  - Daily/weekly/monthly tasks that auto-regenerate
  - Customizable recurrence patterns

- [ ] **Task templates**
  - Pre-built checklists for common workflows
  - Quick-start templates for standard processes

- [ ] **Bulk actions**
  - Select multiple tasks to update priority, reassign, delete
  - Batch operations for efficiency

- [ ] **Display all task details on hover**
  - Quick preview tooltip with task information
  - No need to click to see basic details
  - Include: title, due date, priority, checklist progress, assignees

### Collaboration Features
- [ ] **Comments/notes on tasks**
  - Team communication within tasks
  - @mentions to notify team members

- [ ] **Task assignment**
  - Delegate tasks to team members
  - Multiple assignees support

- [ ] **Activity log**
  - Track who changed what and when
  - Audit trail for task modifications

### Productivity Enhancements
- [ ] **Time estimates vs actual time**
  - Learn how long tasks really take
  - Improve future planning accuracy

- [ ] **Energy levels**
  - Tag tasks as high/medium/low energy
  - Do hard tasks when you're fresh

- [ ] **Pomodoro timer integration**
  - Built into focus mode
  - Customizable work/break intervals

- [ ] **Break reminders**
  - Prevent burnout during focus sessions
  - Configurable reminder intervals

- [ ] **Tags/labels**
  - Categorize tasks beyond just priority
  - Custom tag system for organization

- [ ] **Calendar view**
  - See tasks on a timeline
  - Drag-and-drop to reschedule

### Integrations
- [ ] **Slack Integration** 🔥
  - **Task notifications in Slack**
    - "Task X is due in 1 hour"
    - "You were assigned to Task Y"
    - Task completion notifications
  - **Create tasks from Slack**
    - Slash commands: `/taskcommand add [task name]`
    - Add reaction ⚡ to message → creates task
    - Link Slack threads to tasks
  - **Daily digest**
    - Morning summary of today's priorities
    - End-of-day completion report
  - **Quick actions**
    - `/taskcommand mine` - Show my tasks
    - `/taskcommand focus` - Start focus mode

- [ ] **Calendar sync (Outlook/Google)**
  - Block time for tasks on calendar
  - See calendar events alongside tasks

- [ ] **Email to task**
  - Forward emails to create tasks automatically
  - Attach email content as task notes

### Reports & Analytics
- [ ] **Reports Page**
  - Analytics and insights on task completion
  - Time tracking and productivity metrics
  - Visualizations and charts
  - Export functionality (CSV/PDF)

- [ ] **Team productivity metrics**
  - Department-wide analytics
  - Trend analysis over time

- [ ] **Burndown charts**
  - Track sprint/project progress
  - Visual progress indicators

### Manager Interface 🔥 (Key Differentiator)
- [ ] **Open tasks across all plans for direct reports (MVP)**
  - Single pane view; filter by status/priority/due date
- [ ] **View direct reports' tasks**
  - See team member task lists
  - Monitor progress and workload
  - Filter by person, plan, or priority

- [ ] **Set priorities for team members**
  - Assign priority levels that sync to individual user views
  - Override or suggest priority changes
  - Bulk priority updates

- [ ] **Team reporting and trends**
  - Team productivity analytics
  - Individual performance metrics
  - Focus time tracking and patterns
  - Identify bottlenecks

- [ ] **Workload balancing**
  - See who's overloaded vs underutilized
  - Visual workload distribution
  - Suggest task reassignments

- [ ] **Capacity planning**
  - Is the team taking on too much?
  - Project timeline forecasting
  - Resource allocation insights

- [ ] **Cross-team visibility**
  - See tasks across multiple teams/departments
  - Department-level filtering
  - Organization-wide views

### Admin Dashboard (All Company)
- [ ] **Org-wide open tasks**
  - See open tasks across all plans for all FieldWorks users
  - Filters: department, project/plan, bucket, due date
- [ ] **Access controls**
  - Visible only to Super Admins (configurable in Settings)

### Settings & Configuration
- [ ] **Settings Page**
  - User preferences and configurations
  - **Manage integrations** (Slack, etc.)
  - Notification settings
  - Display preferences
  - Theme customization
  - Default views
  - Per-user Slack integration preferences (enable/disable digests, reminder times, channels/DM)
  - Optional: Use Entra ID manager hierarchy to determine default visibility

- [ ] **Notification preferences**
  - Choose which notifications to receive
  - Channel preferences (in-app, Slack, email)
  - Quiet hours configuration

- [ ] **Visibility & Roles**
  - Define roles: User, Manager, Admin, Super Admin
  - Configure who can see whose tasks (override or inherit from Entra ID)
  - Super Admin can enable/disable access to All Company Dashboard

### Dashboard Improvements
- [ ] **Expanded Dashboard Capabilities**
  - More widgets and customization options
  - Better data visualization
  - Configurable layouts
  - Drag-and-drop widget arrangement
  - Personal vs team dashboards

### Mobile & Access
- [ ] **Progressive Web App (PWA)**
  - Use TaskCommand on mobile devices
  - Offline capability
  - Install as native-like app

- [ ] **Quick add widget**
  - Add tasks from phone home screen
  - Voice input for task creation

---

## 🐛 Known Issues / Bug Fixes

- [ ] (Add any known bugs here as they're discovered)

---

## ✅ Completed

### 2025-10
- [x] Initial feature list created (2025-10-20)
- [x] Microsoft Planner API integration with authentication
- [x] Azure Static Web App deployment
- [x] Basic task display and management
- [x] Focus mode implementation
- [x] Work timer functionality
- [x] Dashboard with task overview

---

## 📝 Notes

### Strategic Considerations
- **Primary users:** FieldWorks employees company-wide
- **Backend:** Microsoft Planner (no data migration needed)
- **Authentication:** Azure AD/Entra (SSO with existing work accounts)
- **Deployment:** Azure Static Web App (already configured)
- **Integration focus:** Slack (company uses Slack, not Teams)

### Technical Considerations
- Focus mode checklist features are top priority for immediate implementation
- Manager interface will leverage existing Graph API permissions
- All permissions already granted - ready to implement features
- ETag-based concurrency control required for Planner updates
- Consider rate limiting for bulk operations
- Adopt modular architecture to avoid single-file bloat: feature-based folders (`features/focus`, `features/slack`, `features/dashboards`)
- Introduce a typed API client layer for Graph + Slack (with retry, ETag handling, and rate limiting)
- Centralized state management (e.g., Zustand or Redux Toolkit) with normalized task entities
- Route-based code splitting via React Router; lazy load dashboards and reports
- RBAC guard components and server-side checks where applicable
- Virtualized task lists for large datasets (e.g., react-window)
- Background sync & cache (IndexedDB) for resilience and mobile/PWA readiness

---

**Last Updated:** 2025-10-23