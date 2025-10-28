# TaskCommand Feature List

A living document to track features, improvements, and changes we want to implement.

**Strategic Direction:** Microsoft Planner backend with modern UI and Slack integration for internal company-wide use at FieldWorks.

---

## 🎯 High Priority

### In Progress
- [ ] **Sync checklist item state with Planner in real time**
  - Toggle handling in Focus Mode is optimistic and wired to call Planner
  - ETag concurrency handling in place (412 → refetch + reconcile)
  - **Next:** confirm backend endpoint or `taskManager.updateChecklistItem` is active in DEV

- [ ] **Slack Integration (Phase 1 — via Power Automate)**
  - **Basic Reminders**
    - Daily upcoming tasks at beginning of day
    - Daily kudos of completed & focused tasks
    - New assignment notifications
  - Scaffolding + routes created; Settings stub ready to hold the PA URL
  - **Next:** add `VITE_SLACK_FLOW_URL` in DEV only, wire Settings → PA flow call

- [ ] **Manager & Admin Dashboards (MVP scaffolding)**
  - Routes in place: `/manager`, `/admin` with real site header
  - **Next:** Graph queries for “open tasks across plans” (direct reports / all company)

### Ready to Pick Up Next
- [ ] **Checklist reorder → persist to Planner**
  - UI drag–drop works and updates local state
  - **Next:** implement backend/API to compute and PATCH `orderHint` + return new ETag

### Core Functionality
- [ ] **Task dependencies**
  - Mark tasks that can't start until another is complete
  - Visual indicators for blocked tasks

- [ ] **Recurring tasks**
  - Daily/weekly/monthly tasks that auto-regenerate
  - Customizable recurrence patterns

- [ ] **Task templates**
  - Pre-built checklists for common workflows
  - Quick-start templates for standard processes

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

### Settings & Configuration
- [ ] **Settings Page**
  - User preferences and configurations
  - **Manage integrations** (Slack, etc.)
  - Notification settings
  - Display preferences
  - Theme customization
  - Default views

- [ ] **Notification preferences**
  - Choose which notifications to receive
  - Channel preferences (in-app, Slack, email)
  - Quiet hours configuration

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

### 2025-10-23
- [x] **Focus Mode: display checklist items** (only when task is focused)
- [x] **Focus Mode: visual progress bar** for tasks with checklists
- [x] **Focus Mode: description displayed** (details loaded only when focused)
- [x] **Checklist order matches Planner** (sorted by `orderHint`)
- [x] **Checklist drag–drop (optimistic)** in Focus Mode (persist TBD)
- [x] **Checklist toggle (optimistic)** with ETag-aware Planner sync path
- [x] **Hide progress bar when no checklist**
- [x] **Spacing fix** under Focus Task card (added bottom margin)
- [x] **DEV environment banner** (DEV only @ `localhost:3001`)
- [x] **React Router wiring** for `/settings`, `/manager`, `/admin` using real site header (no change to main app layout)
- [x] **Login restored** (kept original App.jsx wiring; no auth changes)

### Earlier
- [x] Microsoft Planner API integration with authentication
- [x] Azure Static Web App deployment
- [x] Basic task display and management
- [x] Focus mode implementation
- [x] Work timer functionality
- [x] Dashboard with task overview

#### Manager Dashboard (2025-10-27)
- [x] **Company-wide task viewing**
  - View all tasks across the organization (not just personal tasks)
  - Cross-plan task view showing tasks from all Planner boards
  - Organization-wide visibility into team activities

- [x] **Backend API with Application Permissions**
  - Azure Functions backend deployed
  - Application-level Microsoft Graph API access
  - Authentication and authorization middleware
  - Manager role verification for secure access
  - Endpoints: GET /api/tasks/company, POST /api/tasks/{taskId}/complete

- [x] **Advanced Search and Filtering**
  - Global search across task names, plans, and buckets
  - Filter by assignee (all team members)
  - Filter by plan (all company plans)
  - Filter by status (not-started, in-progress)
  - Filter by date ranges:
    - All tasks
    - Overdue
    - This week
    - This month
    - Backlog (no due date)
    - Custom date range picker
  - Filter chips with one-click removal
  - Real-time filtering as you type

- [x] **Sortable Columns**
  - Sort by task name, assignee, plan, status, due date, priority
  - Visual indicators (up/down arrows) for sort direction
  - Persistent sort state during filtering

- [x] **Task Completion from Manager Dashboard**
  - Checkbox column for marking tasks complete
  - Bulk completion support (select multiple tasks)
  - Uses backend application permissions to complete any user's tasks
  - Optimistic UI updates (tasks disappear immediately)
  - Progress indicator showing "Completing X tasks..."
  - Graceful error handling with automatic rollback
  - Parallel processing for multiple completions

- [x] **Performance Optimizations**
  - Virtual scrolling for 400+ tasks
  - Renders only 20 visible rows at a time
  - Smooth scrolling without lag
  - Fixed column widths for consistent layout
  - Minimal re-renders with React.memo and useMemo

- [x] **UI/UX Improvements**
  - Fixed table column spacing and alignment
  - Proper assignee display with user profiles
  - Responsive layout with fixed table structure
  - Loading states and error handling
  - Refresh button with independent loading state
  - Clean, modern interface matching app design system

---

## 🔧 Known Issues / Bugs

- [ ] **Checklist reorder not persisted** to Planner (drag and drop doesn't work at all)
- [ ] **Checklist cannot complete items** checking the box does nothing
- [ ] **Slack Phase 1** not yet calling PA flow (awaiting DEV URL + wiring)
- [ ] **Manager/Admin pages** are stubs (no data yet)
- [x] **Browser refresh returns use to login screen**
- [x] **Priority Queue not persisting on browser refresh**
- [x] **Setting focus crashing app**
- [x] **Can't edit tasks from task list** button doesn't work
- [x] **Update fails when changing plan** Supplied bucket ID is invalid or does not exists

---

**Last Updated:** 2025-10-27