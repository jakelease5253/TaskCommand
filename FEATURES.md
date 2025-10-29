# TaskCommand Feature List

A living document to track features, improvements, and changes we want to implement.

**Strategic Direction:** Microsoft Planner backend with modern UI and Slack integration for internal company-wide use at FieldWorks.

---

## 🎯 High Priority

### Features to Add
- [ ] **Real-time sync with Microsoft Planner**
  - Ensure all changes reflect immediately in Planner
  - Bidirectional updates (changes in Planner show in TaskCommand)
  - Handle conflicts gracefully
  - Consider WebSocket or polling implementation

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

#### **Slack Integration** 🔥 (3-Phase Roadmap)

##### Phase 1: MVP - Core User Experience (2-3 weeks)
- [ ] **Settings Page Foundation**
  - Connect/disconnect Slack account (OAuth)
  - Basic notification on/off toggle
  - View connection status

- [ ] **Basic Slash Commands**
  - `/taskcommand mine` - Show my active tasks
  - `/taskcommand today` - Tasks due today
  - `/taskcommand add [title]` - Create new task
  - `/taskcommand help` - Command reference

- [ ] **Core Notifications**
  - Task assigned to you
  - Morning digest (tasks due today + overdue tasks)
  - Daily kudos (end of day accomplishments)

- [ ] **Interactive Buttons (Basic)**
  - [View in App] button on all notifications
  - [Complete] button on task notifications

##### Phase 2: Enhanced Interactions (2-3 weeks)
- [ ] **Advanced Slash Commands**
  - `/taskcommand priority` - Show priority queue (top 7)
  - `/taskcommand complete [task]` - Mark task done
  - `/taskcommand overdue` - Show overdue tasks
  - `/taskcommand stats` - Personal productivity stats
  - `/taskcommand search [query]` - Search tasks
  - `/taskcommand share [task]` - Share task in channel

- [ ] **Advanced Interactive Actions**
  - [Snooze] button with date picker (Tomorrow, Next Week, Custom)
  - [Add to Priority Queue] button
  - Task selection dropdowns for commands

- [ ] **Quick Task Creation**
  - ⚡ emoji reaction → creates task from message
  - Message context menu → "Create TaskCommand Task"

- [ ] **Enhanced Settings**
  - Notification preferences (granular control)
  - Quiet hours configuration
  - Digest timing customization
  - Digest grouping options (by project, priority, due date)

- [ ] **Additional Notifications**
  - Handoff notifications (task reassigned to you)
  - Milestone celebrations (100 tasks, 5-day streak, etc.)
  - Weekly summary (Friday afternoon productivity trends)

##### Phase 3: Manager & Advanced Features (2-3 weeks)
- [ ] **Manager Slash Commands**
  - `/taskcommand assign [task] to @person` - Reassign tasks

- [ ] **Manager Notifications & Digests**
  - Team daily digest (summary of team activity)
  - Workload alerts (when team members have 15+ open tasks)
  - Weekly team summary

- [ ] **Advanced Productivity Features**
  - `/taskcommand focus [task]` - Start focus session (opens app in focus mode)

- [ ] **Channel Selection Settings**
  - Configure which notifications go to DMs vs team channels
  - Per-notification-type channel selection

##### Future Considerations (Post-Phase 3)
- [ ] Task templates from Slack (`/taskcommand template [name]`)
- [ ] Bulk task creation (parse multiple lines into tasks)
- [ ] Team channels for high-priority tasks
- [ ] Priority queue change notifications (when manager sets priority)
- [ ] Task completion notifications for watched tasks

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

- [ ] **Edit tasks from Manager Dashboard**
  - Click task row to open edit modal
  - Full task editing capabilities for managers
  - Update any task property (assignees, dates, priority, etc.)

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

#### Checklist System & Manager Enhancements (2025-10-28)

- [x] **Comprehensive Checklist Functionality**
  - **ChecklistEditor Component**
    - Reusable component for all checklist operations
    - Add new checklist items with auto-generated orderHint
    - Edit item text inline with save/cancel buttons
    - Remove individual items
    - Reorder items with move up/down buttons
    - Toggle completion with checkboxes
    - Progress counter (X of Y completed)
    - Support for read-only mode (Focus Mode) and full edit mode
  - **Microsoft Planner OrderHint System**
    - Proper orderHint generation for new items
    - String-based sorting with localeCompare
    - Items display in correct order matching Planner
  - **EditTaskModal Checklist Management**
    - Full checklist editor integrated
    - Add/edit/remove/reorder checklist items when editing tasks
    - Always visible (can add checklists to tasks without them)
    - Changes saved when task is updated
  - **NewTaskModal Checklist Creation**
    - Create checklists when creating new tasks
    - Full editor functionality during task creation
    - Checklist saved with task details
  - **Focus Mode Checklist Display**
    - Display all checklist items with proper ordering
    - Check/uncheck items in read-only mode
    - Immediate save to Microsoft Planner
    - Loading states and error handling
    - Visual feedback with strikethrough for completed items

- [x] **Manager Dashboard Enhancements**
  - **Task Creation from Dashboard**
    - "New Task" button in dashboard header
    - Create tasks in any company plan
    - Assign to any team member
    - Set all task properties (title, description, priority, due date, bucket)
    - Automatic refresh after task creation
  - **No Assignee Filter**
    - Filter to show tasks with no assignees
    - Special "No Assignee" option in dropdown
    - Helps identify unassigned work
    - Proper filter chip display
  - **Completed Tasks Management**
    - View completed tasks (opt-in via status filter)
    - Reopen completed tasks
    - Backend endpoint: POST /api/tasks/{taskId}/reopen
    - Default: hide completed tasks from view
  - **Status Filters Fixed**
    - Fixed white page bug when clicking status filters
    - Proper JavaScript function hoisting
    - All status filters (not-started, in-progress, completed) work correctly

- [x] **Task Creation Simplification**
  - Bucket field now optional (matching Microsoft Planner)
  - Removed "required" attribute from bucket select
  - Updated labels and placeholders
  - More flexible task creation workflow

---

## 📝 Notes

### Strategic Considerations
- **Primary users:** FieldWorks employees company-wide
- **Backend:** Microsoft Planner (no data migration needed)
- **Authentication:** Azure AD/Entra (SSO with existing work accounts)
- **Deployment:** Azure Static Web App (already configured)
- **Integration focus:** Slack (company uses Slack, not Teams)

### Technical Considerations
- Manager interface leverages existing Graph API permissions
- All permissions already granted - ready to implement additional features
- ETag-based concurrency control implemented for Planner updates
- OrderHint system properly implemented for checklist sorting
- Consider rate limiting for bulk operations in future enhancements

#### Slack Integration Architecture
- **Data Storage:** Need to add SlackUserMappings, NotificationPreferences, and MilestoneTracking tables
- **Backend Services:** Slack webhook handlers, scheduled jobs for digests, notification queue
- **Slack OAuth:** User connects Slack account, store encrypted tokens
- **Scheduled Jobs:** Morning digest (8 AM), daily kudos (5 PM), weekly summary (Friday 4 PM)
- **Rate Limiting:** Handle Slack API and Microsoft Graph API rate limits
- **Timezone Support:** Respect user timezones for digest timing and quiet hours

### Future Considerations
- Could be commercialized for other companies using Planner
- Build as internal tool first, prove value, then decide on external offering
- Potential to become standard at other organizations
- Keep architecture clean for potential multi-tenant future

---

**Last Updated:** 2025-10-28

---

## 🎯 Slack Integration - Implementation Roadmap

### Phase 1 Detailed Tasks (Current Focus)
**Week 1: Infrastructure & Settings**
- [ ] Create Slack App in workspace
- [ ] Configure OAuth redirect URLs
- [ ] Set up data storage (SlackUserMappings, NotificationPreferences tables)
- [ ] Design Settings page UI
- [ ] Build Settings page with Slack connection
- [ ] Implement backend OAuth flow

**Week 2: Slash Commands & Interactions**
- [ ] Create `/api/slack/commands` endpoint
- [ ] Implement slash command router
- [ ] Build `/taskcommand mine`, `today`, `add`, `help` commands
- [ ] Format Slack messages with blocks
- [ ] Create `/api/slack/interactions` endpoint for buttons
- [ ] Implement [Complete] and [View in App] buttons

**Week 2-3: Notifications & Digests**
- [ ] Build notification service module
- [ ] Implement assignment notifications
- [ ] Create morning digest scheduled job (8 AM)
- [ ] Create daily kudos scheduled job (5 PM)
- [ ] Add timezone support
- [ ] Test end-to-end in Slack workspace

**Estimated Timeline:** 2-3 weeks for Phase 1 MVP