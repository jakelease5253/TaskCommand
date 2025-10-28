# TaskCommand Feature List

A living document to track features, improvements, and changes we want to implement.

**Strategic Direction:** Microsoft Planner backend with modern UI and Slack integration for internal company-wide use at FieldWorks.

---

## 🎯 High Priority

### Features to Add
- [ ] **Display checklists from task when task is in focus mode**
  - Show all checklist items associated with the focused task
  - Items should be clearly visible and organized
  - Display completion status for each item
  
- [ ] **Ability to complete items from checklist when task is in focus mode**
  - Users can check off checklist items directly from focus mode
  - Updates should sync immediately with Microsoft Planner
  - Visual feedback when items are completed
  - Handle ETag-based concurrency control

- [ ] **Real-time sync with Microsoft Planner**
  - Ensure all changes reflect immediately in Planner
  - Bidirectional updates (changes in Planner show in TaskCommand)
  - Handle conflicts gracefully

---

## 🔮 Future Enhancements

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

### 2025-10
- [x] Initial feature list created (2025-10-20)
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

### Future Considerations
- Could be commercialized for other companies using Planner
- Build as internal tool first, prove value, then decide on external offering
- Potential to become standard at other organizations
- Keep architecture clean for potential multi-tenant future

---

**Last Updated:** 2025-10-27