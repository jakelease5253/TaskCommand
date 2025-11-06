# TaskCommand Feature List

A living document to track features, improvements, and changes we want to implement.

**Strategic Direction:** Microsoft Planner backend with modern UI and Slack integration for internal company-wide use at FieldWorks.

---

## 🎯 High Priority

### Features to Add
- [ ] **Search functionality for Personal Task List**
  - Global search across task titles, descriptions
  - Real-time filtering as you type
  - Search within current filters/view
  - Keyboard shortcut support (Ctrl/Cmd+F)
  - File: `src/components/tasks/FilterBar.jsx` or new search component

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
  - Scheduled recurrence (daily, weekly, monthly, yearly)
  - End after X occurrences option
  - End on Y date option

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

- [ ] **Kanban view**
  - Visual board with columns for task status (Not Started, In Progress, Completed)
  - Drag-and-drop tasks between columns to update status
  - Swimlanes for different plans or priorities
  - Card-based task display with key details
  - Alternative view option alongside list view

- [ ] **Calendar view**
  - See tasks on a timeline
  - Drag-and-drop to reschedule

- [ ] **Group by functionality in filters/sorting**
  - Group tasks by priority, plan, assignee, or due date
  - Collapsible groups with task counts
  - Sort within groups
  - Toggle grouping on/off
  - File: `src/components/tasks/FilterBar.jsx`, `src/App.jsx`

### Integrations

#### **Slack Integration** 🔥 (3-Phase Roadmap)

##### Phase 1: MVP - Core User Experience (2-3 weeks)
- [x] **Settings Page Foundation** ✅ *Completed 2025-10-29*
  - Connect/disconnect Slack account (OAuth)
  - Basic notification on/off toggle
  - View connection status
  - **Backend Infrastructure:**
    - OAuth callback endpoint with ngrok integration
    - Azure Table Storage (SlackUserMappings, NotificationPreferences, MilestoneTracking, SlackMessageTaskLinks)
    - Token encryption and secure storage
    - Connection status API
    - Disconnect API
    - Preferences update API

- [ ] **Basic Slash Commands** 🚧 *Next Up*
  - `/taskcommand mine` - Show my active tasks
  - `/taskcommand today` - Tasks due today
  - `/taskcommand add [title]` - Create new task
  - `/taskcommand help` - Command reference

- [x] **Core Notifications** ✅ *Completed 2025-10-30*
  - Task assigned to you (polling-based, checks every 10 minutes)
  - Morning digest (tasks due today + overdue tasks, daily at 8 AM)
  - **Architecture Note:** Uses polling instead of webhooks (Microsoft Graph does not support change notifications for Planner tasks)
  - [ ] Daily kudos (end of day accomplishments) - *Pending*

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
  - **Overflow handling:** Add "View all X tasks in app" link when command returns more tasks than display limit
    - Limit: 5-10 tasks per Slack message (prevents spam)
    - Link opens TaskCommand filtered to relevant view
    - Show count of remaining tasks

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

- [ ] **Multiple Dashboard Iterations (similar to Wrike)**
  - Create multiple custom dashboard views with different configurations
  - Save and name different dashboard layouts
  - Quick switching between dashboard views
  - Each dashboard can have different:
    - Widget arrangements
    - Filters and groupings
    - Time ranges and metrics
    - Focus areas (projects, teams, priorities)
  - Share dashboard configurations with team
  - Default dashboard per user
  - Files: New dashboard management system, saved to localStorage or backend

### UI/UX Improvements
- [x] **Logo as Home Button** ✅ *Completed 2025-10-31*
  - Clicking on logo banner navigates back to Personal Tasks
  - Standard web convention for navigation
  - Quick way to return to main task view
  - File: `src/components/layout/Header.jsx:42-49`

- [x] **Collapsible All Tasks View** ✅ *Completed 2025-10-31*
  - Added ability to collapse the All Tasks section
  - Shows only Priority Queue when collapsed
  - Focus on top 7 tasks without distractions
  - Remembers collapse state in localStorage
  - Files: `src/components/tasks/AllTasksList.jsx`, `src/App.jsx:47-50, 100-103, 430-432`

- [x] **Edit Tasks from Priority Queue** ✅ *Completed 2025-10-31*
  - Added edit button to tasks in Priority Queue
  - Opens edit modal directly from priority queue view
  - No need to find task in full list to make changes
  - Quick access to edit high-priority items
  - File: `src/components/tasks/PriorityQueue.jsx:134-140`

- [x] **Multi-Select & Bulk Edit Tasks** ✅ *Completed 2025-11-01*
  - Select multiple tasks from task lists with checkboxes
  - Edit common properties across selected tasks:
    - Change assignee for multiple tasks (multi-select modal)
    - Update due dates in bulk (date picker modal)
    - Set priority across selection (4 priority levels)
    - Move to different plan or bucket (dropdown modals)
    - Complete multiple tasks at once
  - Bulk actions bar appears when tasks selected
  - Toast notifications for success/errors
  - Selection auto-clears on successful operations
  - Available in both Personal Tasks and Manager Dashboard
  - Files: `src/App.jsx`, `src/components/tasks/BulkActionsBar.jsx`, `src/components/modals/BulkAssigneeModal.jsx`, `src/components/modals/BulkMoveModal.jsx`, `src/components/modals/BulkDueDateModal.jsx`

- [x] **Set Task to In Progress** ✅ *Completed 2025-10-31*
  - Added ability to mark tasks as "In Progress"
  - Status field in Edit Task Modal with three options:
    - Not Started (0%)
    - In Progress (50%)
    - Completed (100%)
  - Tracks active work on tasks using Microsoft Planner's percentComplete field
  - File: `src/components/tasks/EditTaskModal.jsx:440-453, 105, 128, 214`

- [x] **Reorder Edit Task Modal Fields** ✅ *Completed 2025-10-31*
  - Reversed position of Assignee and Date/Priority fields
  - Due Date and Priority now appear before Assign To
  - Better workflow for common editing patterns
  - Improved form usability
  - File: `src/components/tasks/EditTaskModal.jsx:410-468`

- [x] **Change Manager Dashboard Completion Interface** ✅ *Completed 2025-10-31*
  - Moved task completion from checkbox on left to button on right
  - Better alignment with action-oriented interface
  - Clearer completion action with green "Complete" button
  - Files: `src/features/dashboards/manager/ManagerDashboard.jsx:788-796, 865-867, 918-926`

### ADHD-Focused UI/UX Analysis

**Project Mission:** Create an interface that supports focus and minimizes distractions for users with ADHD.

**Last Updated:** 2025-11-01 (after Main Page Redesign & Planning Interface)

#### ✅ What's Working Well

1. **Pagination (All Tasks)** ✅ *Implemented 2025-11-01*
   - Limits overwhelm by showing only 10 tasks at a time
   - Forces focus on a manageable subset
   - Clear navigation with page numbers
   - **Impact:** Prevents the paralysis of seeing 50+ tasks at once
   - Files: `src/App.jsx`, `src/components/tasks/AllTasksList.jsx`

2. **Full-Width Priority Queue** ✅ *Implemented 2025-11-01*
   - Prominent placement at top of page
   - Clear visual hierarchy: "Start here, then look below"
   - Numbered slots (1-7) create clear prioritization
   - **Impact:** Makes the most important tasks impossible to miss
   - Files: `src/App.jsx:1022-1082`

3. **Planning Interface Separation** ✅ *Implemented 2025-11-01*
   - Dedicated space for decision-making separate from execution
   - Two-column layout separates browsing (left) from deciding (right)
   - Can see all tasks at once to make informed choices
   - **Impact:** Separates "planning mode" from "doing mode" - reduces context switching
   - Files: `src/features/planning/PlanningView.jsx`

4. **Compact Card Design** ✅ *Implemented 2025-11-01*
   - 30-40% reduction in card height
   - Single-line metadata reduces visual noise
   - Consistent styling creates predictable patterns
   - **Impact:** More scannable, less overwhelming, easier to process visually
   - Files: `src/components/tasks/PriorityQueue.jsx`, `src/components/tasks/AllTasksList.jsx`

5. **Visual State Indicators**
   - Tasks in queue appear dimmed in Planning view (prevents adding duplicates)
   - Focus task has blue ring
   - Overdue tasks have red highlighting
   - **Impact:** Instant visual feedback reduces cognitive load

6. **Drag-and-Drop Interaction**
   - Tactile, immediate feedback
   - Clear drag preview showing just task title
   - Visual drop zones in Planning queue
   - **Impact:** Kinesthetic interaction helps with engagement and decision-making

7. **Progressive Disclosure (Hover Tooltips)** ✅ *Implemented 2025-11-01*
   - Full task details only appear when needed
   - Keeps main interface clean
   - 1-second delay prevents accidental triggers
   - **Impact:** Information available on demand without cluttering the view
   - Files: `src/features/planning/PlanningView.jsx:395-525`

8. **Smart Date Filtering** ✅ *Implemented 2025-11-01*
   - Quick options (Overdue, Today, This Week) for common needs
   - Custom range for specific planning
   - **Impact:** Helps narrow overwhelming task list quickly
   - Files: `src/features/planning/PlanningView.jsx:282-350`

9. **Focus Task Card**
   - Single task prominence at the top is excellent for attention management
   - Reduces decision paralysis by highlighting one task

10. **Priority Queue Limited to 7**
    - Constraint prevents overwhelm
    - Matches working memory limits (~7 items)
    - Enforced limit creates helpful boundaries

11. **One-Click Complete**
    - Immediate dopamine hit
    - No confirmation friction
    - Fast feedback loop encourages completion

12. **Collapse Functionality**
    - Can hide "All Tasks" noise
    - Reduces visual overwhelm
    - User controls information density

#### ⚠️ What's Still Challenging

1. **Filter Complexity - Main Page**
   - **Issue:** FilterBar still has multiple dropdowns, search, sort options
   - **ADHD Impact:** Too many choices at once can cause decision paralysis
   - **Severity:** Medium - users might avoid filtering entirely
   - **Recommendation:** Collapse by default or use progressive disclosure
   - Files: `src/components/tasks/FilterBar.jsx`

2. **Planning Page Filter Overload** 🔥 *High Priority*
   - **Issue:** 4 dropdowns (Sort, Date, Priority, Plan) + search bar + custom date inputs
   - **ADHD Impact:** The planning interface meant to reduce overwhelm has 6+ decision points before seeing tasks
   - **Severity:** High - contradicts purpose of dedicated planning space
   - **Recommendation:** Use tabs/presets instead of all filters visible at once
   - Files: `src/features/planning/PlanningView.jsx:247-350`

3. **No Visual Progress Indicators** 🔥 *High Priority*
   - **Issue:** Can't see "X% complete" or "5 of 20 tasks done today"
   - **ADHD Impact:** Missing dopamine hit of visible progress; hard to build momentum
   - **Severity:** High - progress visibility is crucial for ADHD motivation
   - **Recommendation:** Add daily completion counter and progress ring

4. **Custom Date Range Persistence**
   - **Issue:** When "Custom Range" is selected, the date pickers stay visible taking up space
   - **ADHD Impact:** Visual clutter persists even after dates are set
   - **Severity:** Low - minor annoyance
   - Files: `src/features/planning/PlanningView.jsx:328-350`

5. **Alert Dialogs for Errors**
   - **Issue:** JavaScript `alert()` and `confirm()` used for queue full, clear all
   - **ADHD Impact:** Jarring interruption breaks flow state
   - **Severity:** Medium - could use inline warnings instead
   - Files: `src/features/planning/PlanningView.jsx:201, 228`

6. **No "Done Planning" Flow**
   - **Issue:** Planning page has no clear completion state or transition back to main page
   - **ADHD Impact:** Unclear when task is complete; might keep tweaking forever
   - **Severity:** Medium - lacks closure/completion signal
   - **Recommendation:** Add "Save & Return to Tasks" button

7. **Arbitrary 7-Task Limit (No Context)**
   - **Issue:** Queue limited to 7 with no explanation visible to user
   - **ADHD Impact:** Might feel frustrating or arbitrary without context about why
   - **Severity:** Low - minor UX polish
   - **Recommendation:** Add tooltip explaining the cognitive science behind 7±2 rule

8. **Fixed Scroll Height**
   - **Issue:** Task pool has `maxHeight: 600px` regardless of screen size
   - **ADHD Impact:** On smaller screens wastes space; on larger screens underutilizes available area
   - **Severity:** Low - functional but not optimal
   - Files: `src/features/planning/PlanningView.jsx:354`

9. **Tooltip Position Always Center Screen**
   - **Issue:** Hover tooltip appears dead center, might cover the task being examined
   - **ADHD Impact:** Eye needs to jump to center of screen, losing place in list
   - **Severity:** Medium - breaks visual continuity
   - **Recommendation:** Position near cursor or task being hovered
   - Files: `src/features/planning/PlanningView.jsx:460-467`

10. **No Keyboard Navigation**
    - **Issue:** All interactions require mouse (drag, click, hover)
    - **ADHD Impact:** Some users focus better with keyboard shortcuts; no alternative input method
    - **Severity:** Medium - accessibility and preference issue
    - **Recommendation:** Add shortcuts (Space=focus, Enter=edit, C=complete, arrows=navigate)

11. **Empty State Lacks Guidance**
    - **Issue:** When priority queue is empty in Planning, just shows 7 empty drop zones
    - **ADHD Impact:** No prompting or guidance to get started
    - **Severity:** Low - obvious what to do but could be friendlier
    - Files: `src/features/planning/PlanningView.jsx:608-614`

12. **No Quick Add to Queue**
    - **Issue:** Must drag tasks to queue; no right-click or button option
    - **ADHD Impact:** Dragging requires fine motor control and feels "heavy" for quick decisions
    - **Severity:** Medium - could use a "+" button on hover for one-click add
    - **Recommendation:** Add quick-add button on task rows

13. **Multi-Select Checkboxes Always Visible**
    - **Issue:** Adds visual noise to every task
    - **ADHD Impact:** Only needed occasionally but always present
    - **Severity:** Medium - should be hidden behind a "Select Multiple" mode toggle
    - Files: `src/components/tasks/AllTasksList.jsx:142-149`

14. **Toast Notifications Disappear**
    - **Issue:** Important feedback vanishes in 3-5 seconds
    - **ADHD Impact:** Easy to miss if attention wanders
    - **Severity:** Low - no persistent notification area

#### 📊 Current State Summary

**Improvements Made:** Significant reduction in overwhelm, better visual hierarchy, separation of planning vs execution

**Remaining Work:** Mostly around simplifying filter options, adding progress indicators, and refining interaction patterns

**Overall Grade:** B+ (was D before 2025-11-01 improvements)

#### 🎯 Top Priority Fixes

1. **Add progress indicators** (completion %, today's progress) - High motivational value
2. **Simplify filter UI** (collapsible, fewer visible at once) - Reduce decision paralysis
3. **Improve tooltip positioning** (near task, not center screen) - Better visual continuity

#### 🎯 Additional Recommended Improvements

##### High Impact
- [ ] **Add daily completion counter/progress ring**
  - "5 tasks completed today!"
  - Visual progress feedback
  - Dopamine hit for completing tasks

- [ ] **Collapse filter bar by default**
  - Show as expandable section
  - Reduces screen real estate usage
  - Minimizes decision paralysis

- [ ] **Hide multi-select checkboxes until "Select Mode" activated**
  - Reduces visual noise
  - Show checkboxes only when bulk actions needed
  - Cleaner default interface

##### Medium Impact
- [ ] **Add keyboard shortcuts**
  - Space = focus task
  - Enter = edit task
  - C = complete task
  - Arrow keys = navigate tasks
  - Faster task management

- [ ] **Replace alert() dialogs with inline notifications**
  - Less jarring interruptions
  - Better flow state preservation
  - Modern UI pattern

- [ ] **Add "Done Planning" / "Save & Go" button**
  - Clear completion signal
  - Prevents endless tweaking
  - Natural transition back to execution mode

- [ ] **Add "Snooze until tomorrow" quick action**
  - Defer tasks without guilt
  - "Done for today" workflow
  - Reduces overwhelm from long lists

##### Low Impact (Nice to Have)
- [ ] **Add completion streak tracking**
  - "7 day streak! 🔥"
  - Gamification for motivation
  - Long-term engagement

- [ ] **Option to hide action buttons until hover**
  - Reduces visual noise
  - Cleaner default view
  - Show actions on demand

- [ ] **Add persistent notification area**
  - Important messages don't disappear
  - Can review recent actions
  - Better for users who miss toast notifications

- [ ] **Explain 7-task limit with tooltip**
  - "Based on working memory research (Miller's Law)"
  - Helps user understand the constraint
  - Educational and reassuring

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

### UI/UX Issues
- [ ] **Refresh button position inconsistent**
  - Refresh button moves around depending on which page is active
  - Should have consistent position across all views
  - File: `src/components/layout/Header.jsx`


### Slack Integration - Under Monitoring
- [ ] **Slack Morning Digest not sending consistently**
  - **Status:** Tested successfully on 2025-10-31, working in manual tests
  - **Issue:** May have intermittent issues, needs continued monitoring
  - **Local Testing:** Timer triggers don't fire automatically in local Azure Functions dev
  - **Test Endpoint:** `POST http://localhost:7071/api/test/morning-digest` with `{"azureUserId": "your-id"}`
  - **Production:** Should fire daily at 8:00 AM (`0 0 8 * * *`)
  - **Action:** Monitor in production to ensure reliability
  - **Known Technical Issues:**
    1. **Timezone Problem:** Timer fires at 8 AM UTC for all users (not local time)
    2. **No Retry Mechanism:** Failed API calls are only logged, no retry for transient failures
    3. **Token Expiration:** No token refresh logic for expired Slack tokens
    4. **Silent Failures:** Errors only logged to console, no alerting/monitoring
    5. **Rate Limiting:** Sequential calls to `graphClient.getUserTasks()` could hit Microsoft Graph rate limits with many users
  - **Files:** `backend/index.js:1077-1090`, `backend/services/morningDigestService.js`

- [ ] **Slack Assignment Notifications not sending consistently**
  - **Status:** Tested successfully on 2025-10-31, sent 32 notifications successfully
  - **Issue:** Have worked in testing before, needs continued monitoring for reliability
  - **Local Testing:** Timer triggers don't fire automatically in local Azure Functions dev
  - **Test Endpoint:** `POST http://localhost:7071/api/test/assignment-check` with `{"azureUserId": "your-id"}`
  - **Production:** Should fire every 10 minutes (`0 */10 * * * *`)
  - **Action:** Monitor in production to ensure consistent delivery

- [ ] **Slack digest time setting does not work**
  - **Issue:** User-configurable digest delivery time setting in Settings page doesn't affect actual delivery
  - **Current Behavior:** Morning digest always sends at 8 AM (hardcoded in timer function)
  - **Expected:** Should respect user's selected time preference
  - **Needs:** Timezone support implementation, dynamic cron schedule generation
  - **Files:** `src/features/settings/Settings.jsx`, `backend/functions/SendMorningDigest.js`

---

## 🔧 Technical Debt & Code Quality

### 🚨 CRITICAL - Security & Architecture (Must Fix Before Production)

#### Security Issues
- [ ] **Manager Authorization Not Implemented** - `backend/utils/auth.js:45-72`
  - **Issue:** `checkManagerAuthorization()` returns `true` for ALL authenticated users
  - **Impact:** Anyone with Azure AD login can access Manager Dashboard and see ALL company tasks
  - **Fix:** Implement actual Azure AD group membership check
  - **File:** `backend/utils/auth.js`

- [ ] **OAuth Tokens Stored in localStorage** - `src/hooks/useAuth.js:56-57`
  - **Issue:** Tokens vulnerable to XSS attacks, no token refresh mechanism
  - **Impact:** Security vulnerability, tokens persist indefinitely
  - **Fix:** Move to httpOnly, Secure cookies with token refresh flow
  - **File:** `src/hooks/useAuth.js`

- [ ] **Hardcoded Credentials in Version Control** - `.env.local`
  - **Issue:** Client IDs and tenant IDs committed to git
  - **Impact:** Credentials exposed in repository
  - **Fix:** Remove from git tracking, rotate credentials, use CI/CD secrets
  - **Command:** `git rm --cached .env.local && git commit -m "Remove credentials"`

- [ ] **CORS Allows Wildcard by Default** - `backend/index.js` (multiple locations)
  - **Issue:** `'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*'`
  - **Impact:** Any domain can call the API if env var not set
  - **Fix:** Remove wildcard default, fail secure, validate origins explicitly
  - **Files:** Lines 802, 29, 149, etc. in `backend/index.js`

- [ ] **Encryption Key Hardcoded Default** - `backend/services/storageService.js:17-18`
  - **Issue:** Falls back to `'development-key-32-characters!!'` if env var not set
  - **Impact:** Weak encryption in production if misconfigured
  - **Fix:** Use Azure Key Vault, validate key is set, fail if not configured
  - **File:** `backend/services/storageService.js`

#### Architecture Issues
- [ ] **N+1 Query Problem in Manager Dashboard** - `backend/services/graphClient.js:36-127`
  - **Issue:** `getAllCompanyTasks()` makes exponential API calls (50 groups × 10 plans = 500+ calls)
  - **Impact:** Performance degrades exponentially with organization size
  - **Fix:** Use Microsoft Graph batch API, implement caching with TTL
  - **File:** `backend/services/graphClient.js`

- [ ] **No Pagination Implemented** - `backend/services/graphClient.js:43-70`
  - **Issue:** No `$top` or `$skip` parameters on Graph API calls
  - **Impact:** Missing data if org has >20 groups/plans
  - **Fix:** Implement pagination with Graph API parameters
  - **File:** `backend/services/graphClient.js`

### ⚠️ HIGH Priority - Code Quality & Maintainability

#### Component Architecture
- [ ] **App.jsx Too Large** - `src/App.jsx` (738 lines)
  - **Issue:** 23+ useState calls, 8+ useEffect hooks, all app state in one component
  - **Impact:** Hard to maintain, unnecessary re-renders, poor performance
  - **Fix:** Extract state to Context API or state management library (Zustand/Redux)
  - **Action Items:**
    - Create TaskContext for task state management
    - Create FocusContext for focus mode state
    - Create UIContext for UI preferences (filters, collapsed state)
    - Extract localStorage logic to `useLocalStorage` custom hook
    - Break down into smaller feature components

- [ ] **Backend index.js Monolithic** - `backend/index.js` (1,356 lines)
  - **Issue:** All Azure Function endpoints in one file
  - **Impact:** Hard to navigate, duplicated code, merge conflicts
  - **Fix:** Split into separate files per endpoint
  - **Structure:**
    ```
    backend/
      functions/
        tasks/
          getCompanyTasks.js
          completeTask.js
          reopenTask.js
        slack/
          oauthCallback.js
          commands.js
          interactions.js
        test/
          morningDigest.js
      index.js (imports and registers all functions)
    ```

#### Code Duplication
- [ ] **Duplicated CORS Headers** - `backend/index.js` (~15 instances)
  - **Issue:** Same CORS header object defined in every endpoint
  - **Fix:** Create `backend/middleware/cors.js` utility
  - **Impact:** Maintenance burden, inconsistency risk

- [ ] **Duplicated Token Validation** - `backend/index.js` (~5 instances)
  - **Issue:** Same auth validation code in every protected endpoint
  - **Fix:** Create reusable auth wrapper/middleware function
  - **Files:** Lines 45-78 (GetCompanyTasks), 165-198 (CompleteTask), etc.

- [ ] **81 Direct fetch() Calls** - Multiple files
  - **Issue:** No centralized API client, repeated Authorization header creation
  - **Fix:** Create `src/api/client.js` with auth headers built-in
  - **Files Affected:**
    - `src/hooks/useTasks.js`
    - `src/components/tasks/NewTaskModal.jsx`
    - `src/components/tasks/EditTaskModal.jsx`
    - `src/features/dashboards/manager/ManagerDashboard.jsx`
  - **Note:** `src/services/graphAPI.js` exists but is unused (44 lines of dead code)

- [ ] **Unused GraphApiService Class** - `src/services/graphAPI.js:1-44`
  - **Issue:** Class is defined but never imported or used
  - **Fix:** Either remove OR refactor codebase to use it consistently
  - **Decision Needed:** Delete or adopt?

#### Error Handling
- [ ] **Inconsistent Error Handling Patterns**
  - **Issue:** Mix of `console.error()` + early return, `throw error`, silent catches
  - **Impact:** Unpredictable error behavior, debugging difficulty
  - **Fix:** Standardize error handling pattern across codebase
  - **Pattern to adopt:**
    - Services: throw errors with context
    - Components: catch and show user-friendly messages
    - Backend: return consistent error response structure

- [ ] **No Centralized Error Handling** - Backend
  - **Issue:** Each endpoint handles errors differently
  - **Fix:** Create `backend/middleware/errorHandler.js`
  - **Benefit:** Consistent error responses, better logging

- [ ] **Missing Error Boundaries** - Frontend
  - **Issue:** Single component error crashes entire app
  - **Fix:** Create `src/components/ErrorBoundary.jsx` and wrap major sections
  - **Wrap:** App root, ManagerDashboard, PersonalDashboard, FocusMode

- [ ] **No Response.ok Checking** - `src/services/graphAPI.js:10-29`
  - **Issue:** Calls `.json()` without checking if response succeeded
  - **Fix:** Add `if (!response.ok) throw new Error(...)` before parsing

#### Security - Additional
- [ ] **No Rate Limiting** - All backend endpoints
  - **Issue:** Vulnerable to brute force and resource exhaustion
  - **Fix:** Implement rate limiting middleware
  - **Library:** express-rate-limit or Azure API Management

- [ ] **No Input Validation** - Multiple endpoints
  - **Issue:** Request data accepted without validation
  - **Fix:** Add validation library (Joi or Zod)
  - **Example:** `src/components/tasks/NewTaskModal.jsx:75` - parseInt without validation

- [ ] **Potential XSS through Task Descriptions**
  - **Issue:** Task descriptions may contain HTML/scripts
  - **Fix:** Sanitize user-generated content with DOMPurify
  - **Files:** All components that display task.description

### 📊 MEDIUM Priority - Performance & Best Practices

#### React Performance
- [ ] **Missing Performance Optimizations**
  - **Issue:** Only 7 uses of React.memo/useCallback/useMemo across entire frontend
  - **Impact:** Unnecessary re-renders, slower UI
  - **Fix Locations:**
    - `src/App.jsx:623-645` - Wrap event handlers with useCallback
    - TaskCard components - Wrap with React.memo
    - Computed values (filteredTasks, priorityTasks) - Use useMemo
    - AllTasksList and PriorityQueue - Receive memoized callbacks

- [ ] **localStorage Operations on Every Change** - `src/App.jsx:74-79`
  - **Issue:** Serialization and storage on every taskFocusTimes change (every second during timer)
  - **Impact:** Blocks UI thread, excessive I/O
  - **Fix:** Debounce localStorage writes, batch updates

- [ ] **No Virtual Scrolling for Large Task Lists** - `src/components/tasks/AllTasksList.jsx`
  - **Issue:** Renders all 100+ tasks in DOM
  - **Impact:** Memory overhead, slow scrolling, poor mobile performance
  - **Fix:** Implement react-window or react-virtualized
  - **Note:** ManagerDashboard already uses virtual scrolling

#### Configuration & Dependencies
- [ ] **Missing Frontend Dependencies**
  - **Issue:** No HTTP client, state management, validation, or testing libraries
  - **Recommendations:**
    - HTTP Client: axios or ky
    - State Management: Zustand or Redux Toolkit
    - Validation: Zod or Yup
    - Testing: Vitest or Jest + React Testing Library
    - Error Tracking: Sentry or LogRocket

- [ ] **Missing Backend Dependencies**
  - **Recommendations:**
    - Validation: joi or zod
    - Logging: winston
    - Rate Limiting: express-rate-limit
    - Environment Validation: dotenv-safe

- [ ] **No Type Safety**
  - **Issue:** TypeScript types available but not enforced
  - **Fix:** Enable TypeScript strict mode OR enforce JSDoc type checking
  - **Benefit:** Catch errors at build time

#### Code Organization
- [ ] **Inconsistent Naming Conventions**
  - **Issue:** Mix of camelCase (graphAPI.js) and kebab-case file names
  - **Fix:** Standardize on kebab-case for files, camelCase for exports

- [ ] **Missing JSDoc Comments**
  - **Issue:** Complex functions lack documentation
  - **Examples:** `src/App.jsx:234` (filterAndSortTasks), many functions in storageService.js
  - **Fix:** Add JSDoc to all exported functions

- [ ] **Debug Files in Production Repo**
  - **Files to Delete:**
    - `backend/test-get-user-id.js`
    - `backend/debug-slack-token.js`
    - `backend/reset-check-time.js`
  - **Fix:** Move to dedicated test directory or delete

- [ ] **Excessive console.log Statements** - 114 across 13 backend files
  - **Issue:** Excessive logging impacts production performance
  - **Fix:** Replace with structured logging (Winston) with log levels

#### Infrastructure
- [ ] **No Offline Support / Service Worker**
  - **Issue:** No offline capability, all data lost on disconnect
  - **Fix:** Implement Service Worker for offline support
  - **Benefit:** Better mobile experience, PWA capability

- [ ] **No Testing Framework**
  - **Issue:** No automated tests
  - **Fix:** Add Vitest + React Testing Library
  - **Priority Tests:**
    - Auth flow
    - Task CRUD operations
    - Manager dashboard filtering
    - Focus mode timer

---

## 🎯 Technical Debt - Action Plan

### Phase 1: Critical Security (Week 1) - BEFORE PRODUCTION
**Must complete before deploying to production**
- [ ] Implement manager role authorization checks
- [ ] Move tokens from localStorage to httpOnly cookies
- [ ] Remove hardcoded credentials from git, rotate all credentials
- [ ] Fix CORS to not default to wildcard
- [ ] Add pagination to Graph API queries
- [ ] Implement input validation on all endpoints

### Phase 2: Code Quality & Maintainability (Weeks 2-3)
**Improve developer experience and long-term maintainability**
- [ ] Refactor App.jsx into smaller components with Context API
- [ ] Split backend/index.js into separate endpoint files
- [ ] Create centralized API client wrapper
- [ ] Extract localStorage logic to custom hooks
- [ ] Add React error boundaries
- [ ] Create CORS and auth middleware/utilities

### Phase 3: Performance & Optimization (Weeks 3-4)
**Improve user experience and scalability**
- [ ] Fix N+1 query with Microsoft Graph batch API
- [ ] Implement caching strategy for Graph API calls
- [ ] Add React.memo/useCallback/useMemo optimizations
- [ ] Debounce localStorage writes
- [ ] Add virtual scrolling to AllTasksList
- [ ] Implement rate limiting

### Phase 4: Infrastructure & Tooling (Week 4-5)
**Set up for long-term success**
- [ ] Add structured logging (Winston)
- [ ] Setup error tracking (Sentry)
- [ ] Add testing framework with sample tests
- [ ] Implement Service Worker for offline support
- [ ] Add missing dependencies (validation, state management)
- [ ] Enable TypeScript strict mode or JSDoc checking

### Quick Wins (Can Do Anytime)
**Low effort, immediate benefit**
- [ ] Delete unused files (graphAPI.js, debug scripts)
- [ ] Create CORS middleware (eliminate 15 duplicates)
- [ ] Create auth validation wrapper (eliminate 5 duplicates)
- [ ] Add .env.local to .gitignore and remove from tracking
- [ ] Add JSDoc comments to public functions
- [ ] Standardize error response format

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
  - **Completed Tasks Management**
    - View completed tasks (opt-in via status filter)
    - Reopen completed tasks
    - Backend endpoint: POST /api/tasks/{taskId}/reopen
    - Default: hide completed tasks from view
  - **Status Filters Fixed**
    - Fixed white page bug when clicking status filters
    - Proper JavaScript function hoisting
    - All status filters (not-started, in-progress, completed) work correctly

- [x] **Task Creation Simplification** ✅ *Completed 2025-11-01*
  - Bucket field now truly optional (matching Microsoft Planner)
  - Only includes bucketId in API request if bucket is selected
  - Tasks without buckets appear in plan without bucket assignment
  - Fixed: Previously sent empty string which caused API errors
  - File: `src/components/tasks/NewTaskModal.jsx:80-88`

#### Slack Integration - Phase 1 Core Notifications (2025-10-30)

- [x] **Polling-Based Notification System**
  - Discovered Microsoft Graph does not support webhooks/change notifications for Planner tasks
  - Implemented polling architecture as alternative
  - Created TaskCheckTracking table to track last check time per user
  - Services: taskPollingService.js, morningDigestService.js, slackService.js, slackFormatter.js

- [x] **Assignment Notifications**
  - Timer function runs every 10 minutes (cron: `0 */10 * * * *`)
  - Detects new task assignments by comparing assignment dates to last check time
  - Sends Slack DM with task details, plan, bucket, and priority
  - Formatted with Block Kit (priority emojis, rich formatting)
  - Respects user preferences (can be disabled in settings)

- [x] **Morning Digest**
  - Timer function runs daily at 8 AM (cron: `0 0 8 * * *`)
  - Shows tasks due today and overdue tasks
  - Categorized sections: "Overdue Tasks" and "Due Today"
  - Displays up to 5 tasks per category with overflow count
  - Priority indicators (🔥 urgent, ⚡ important, 📌 medium)
  - Days overdue calculation for overdue tasks
  - "All caught up" message when no tasks due
  - Respects user preferences (can be disabled in settings)

- [x] **Test Endpoints**
  - `/api/test/morning-digest` - Manually trigger morning digest
  - `/api/test/assignment-check` - Manually check for new assignments
  - `/api/test/create-task` - Create test tasks via API for testing notifications
  - Support for both token-based auth and direct Azure user ID (for testing)

#### Manager Dashboard Bug Fixes (2025-10-31)

- [x] **Status Filter Errors Fixed** (2000+ console errors)
  - **Issue:** JavaScript hoisting error - `getTaskStatus` function called before declaration
  - **Issue:** Console.log mapping over 1000+ tasks on every status filter click
  - **Fix:** Moved helper functions before usage, removed debug console.logs
  - **Result:** Status filters now work smoothly without errors

- [x] **Completed Tasks Showing by Default**
  - **Issue:** Manager Dashboard started with all tasks including completed
  - **Fix:** Changed `filteredAndSortedTasks` to start with `incompleteTasks` only
  - **Result:** Dashboard now shows only incomplete tasks by default, "completed" status filter works to show finished tasks

- [x] **useMemo Dependency Array Fix**
  - **Issue:** Missing `customStartDate` and `customEndDate` from dependencies
  - **Fix:** Added missing dependencies to `filteredAndSortedTasks` useMemo
  - **Result:** Custom date range filter now updates properly when dates change

- [x] **Filters Persist Between Reloads**
  - **Status:** Previously implemented (localStorage)

- [x] **Checklist Completion Errors Fixed**
  - **Status:** Previously fixed in earlier update

- [x] **Duplicate Refresh Buttons Resolved**
  - **Status:** UX improved (may receive additional UI updates in future)

- [x] **Task Description Error Fixed**
  - **Issue:** Error when adding/editing description field in task modals
  - **Status:** Resolved alongside checklist fixes in earlier update
  - **Result:** Task descriptions now save successfully from all modals

- [x] **Task Completion Optimistic Updates** (2025-10-31)
  - **Issue:** Task completion triggered full list refresh, losing scroll position and feeling janky
  - **Cause:** `fetchAllTasks()` called after every task completion in App.jsx
  - **Fix:** Implemented true optimistic updates:
    1. Task removed from list immediately when checkbox clicked (instant feedback)
    2. API call happens in background
    3. If API fails, task is restored to list with error message
    4. Removed unnecessary `fetchAllTasks()` call (only refetch on error)
  - **Result:** Smooth, instant task completion without scroll position loss

- [x] **Task Editing Optimistic Updates** (2025-10-31)
  - **Issue:** Editing a task (changing date, title, priority, etc.) triggered full list refresh
  - **Cause:** `fetchAllTasks()` called after every task edit in App.jsx onTaskUpdated callback
  - **Fix:** Implemented optimistic updates for task editing:
    1. Modified EditTaskModal to pass updated task data back through onTaskUpdated callback
    2. App.jsx now optimistically updates the single task in the tasks array (using `setTasks`)
    3. Exported `setTasks` from useTasks hook for direct state updates
    4. No full refresh needed - only the edited task is updated in place
    5. If editing focused task, updates focus task state immediately
  - **Files Modified:**
    - `src/components/tasks/EditTaskModal.jsx` (lines 207-225)
    - `src/App.jsx` (lines 737-754)
    - `src/hooks/useTasks.js` (line 226 - exported setTasks)
  - **Result:** Instant task updates without losing scroll position or triggering full page refresh

- [x] **Page Refresh Navigation Persistence** (2025-10-31)
  - **Issue:** Refreshing the page always returns to Personal Tasks view, losing context
  - **Impact:** Users on Manager Dashboard or Settings lose their place on refresh
  - **Fix:** Implemented localStorage persistence for current view:
    1. Updated `currentView` useState initialization to read from localStorage (lazy initializer function)
    2. Added useEffect to save `currentView` to localStorage whenever it changes
    3. Key: `taskcommand_current_view`, values: 'personal', 'manager', 'settings'
  - **Files Modified:**
    - `src/App.jsx` (lines 41-45: lazy state initialization, lines 91-94: save useEffect)
  - **Result:** Page now remembers which view you were on across refreshes

- [x] **Unassigned Tasks Filter** (2025-10-31)
  - **Issue:** No way to filter for tasks with no assignee in Manager Dashboard
  - **Impact:** Cannot easily identify tasks needing assignment
  - **Fix:** Added "Unassigned" filter option:
    1. Added "Unassigned" option to assignee dropdown (special ID: `__unassigned__`)
    2. Updated filtering logic to handle unassigned case (no assignments or empty assignments object)
    3. Updated filter chip display to show "Unassigned" instead of the special ID
  - **Files Modified:**
    - `src/features/dashboards/manager/ManagerDashboard.jsx` (lines 713, 220-232, 762)
  - **Result:** Managers can now easily filter to see all unassigned tasks with one click

- [x] **Manager Dashboard Virtual Scrolling Fixed** (2025-10-31)
  - **Issue:** Could only see first ~20 tasks, couldn't scroll to see more even though they existed
  - **Cause:** Virtual scrolling implementation was missing spacer rows to create scrollable area
  - **Fix:** Added spacer rows above and below visible tasks:
    1. Top spacer: Height = (rows above viewport) × ROW_HEIGHT
    2. Bottom spacer: Height = (rows below viewport) × ROW_HEIGHT
    3. This makes tbody the correct total height so scrolling works properly
  - **Files Modified:**
    - `src/features/dashboards/manager/ManagerDashboard.jsx` (lines 871-876 top spacer, 930-940 bottom spacer)
  - **Result:** Can now scroll through all filtered tasks (hundreds or thousands) smoothly with only 20 rendered at a time

#### Main Page Redesign & Planning Interface (2025-11-01)

- [x] **Planning Interface** ✅ *Completed 2025-11-01*
  - **Purpose:** Dedicated interface for building priority queue with full task visibility
  - **Features:**
    - Two-column layout: 60% task pool (left), 40% priority queue builder (right)
    - Compact single-line task rows in pool showing Title, Due Date, Priority
    - Search bar filters by task title in real-time
    - Advanced filtering: Sort (due date/priority/plan/title), Date filter, Priority, Plan
    - Custom date range with From/To date pickers
    - Hover tooltips show full task details (description, checklist, assignees) after 1 second
    - Drag-and-drop from task pool to numbered slots (1-7) in priority queue
    - Visual feedback: dimmed tasks already in queue, clean drag preview showing task title
    - Tasks in queue appear washed out in list but tooltip shows at full opacity
    - Loading spinner matching other pages
  - **Navigation:** Calendar icon in header menu
  - **Files Created:**
    - `src/features/planning/PlanningView.jsx` (485 lines)
  - **Files Modified:**
    - `src/components/layout/Header.jsx` (added Planning menu item)
    - `src/components/ui/icons.jsx` (added CheckSquare icon)
    - `src/App.jsx` (integrated Planning view, handler for queue updates)
  - **Result:** Users can see all tasks at once to make informed priority decisions, then drag to build queue

- [x] **Personal Tasks Layout Redesign** ✅ *Completed 2025-11-01*
  - **Change:** Stacked vertical layout (was two-column grid with sidebar)
  - **New Layout:**
    - Priority Queue: Full-width at top
    - All Tasks: Full-width below Priority Queue
  - **Benefits:**
    - More prominent priority queue (better focus)
    - Better use of horizontal space on wide screens
    - Clearer visual hierarchy from priority to all tasks
    - Less cramped feeling than sidebar layout
  - **Files Modified:**
    - `src/App.jsx:1022-1082` (layout structure)
    - `src/components/tasks/PriorityQueue.jsx:74` (updated empty state text from "left" to "below")
  - **Result:** Cleaner, more focused layout supporting ADHD-friendly design principles

- [x] **All Tasks Pagination** ✅ *Completed 2025-11-01*
  - **Feature:** Limit All Tasks display to 10 tasks per page
  - **Implementation:**
    - Added `currentPage` and `tasksPerPage` state
    - Calculate paginated slice of filtered tasks
    - Pagination controls with Previous/Next buttons
    - Smart page number display (first, last, current, adjacent pages with ellipsis)
    - "Showing X-Y of Z tasks" counter
    - Auto-reset to page 1 when filters or sorting changes
    - Controls only appear when multiple pages exist
  - **Benefits:**
    - Reduces information overwhelm (ADHD-focused)
    - Cleaner interface with less scrolling
    - Forces focus on smaller subset of tasks
  - **Files Modified:**
    - `src/App.jsx` (pagination state and calculation)
    - `src/components/tasks/AllTasksList.jsx` (pagination UI)
  - **Result:** Users see 10 tasks at a time instead of overwhelming list of all tasks

- [x] **Consistent Card Styling** ✅ *Completed 2025-11-01*
  - **Change:** Matched text sizes and spacing between Priority Queue and All Tasks
  - **Standardization:**
    - Title: Changed from `h3 text-lg` to `h4` (same font size)
    - Metadata: All use `text-xs` (was `text-sm` in All Tasks)
    - Icons: All metadata icons `w-3 h-3`, button icons `w-4 h-4`
    - Spacing: Both use `gap-2` for metadata, `p-4` padding
    - Priority badges: Both use `py-0.5` padding
    - Container alignment: Both use `items-center`
  - **Files Modified:**
    - `src/components/tasks/AllTasksList.jsx` (text sizes, icon sizes, spacing)
  - **Result:** Visual consistency across all task cards creates cohesive interface

- [x] **Priority Queue Compact Layout** ✅ *Completed 2025-11-01*
  - **Change:** Reduced card height and reorganized metadata for full-width layout
  - **Improvements:**
    - Single line metadata: Due Date → Plan → Bucket → Assignees → Priority → Overdue
    - Horizontal button layout (was vertical stack)
    - Button order: Focus Toggle → Remove → Edit → Complete
    - Added Complete button (was missing)
    - Added assignees display with user profiles
    - Reduced title margin from `mb-2` to `mb-1.5`
  - **Benefits:**
    - Cards are 30-40% shorter (less vertical space)
    - All info visible at glance on one line
    - Better use of full-width layout
    - More compact and scannable
  - **Files Modified:**
    - `src/components/tasks/PriorityQueue.jsx` (layout, metadata order, buttons)
    - `src/App.jsx` (pass userProfiles prop)
  - **Result:** Compact, information-dense cards that work well in full-width layout

- [x] **All Tasks Compact Layout** ✅ *Completed 2025-11-01*
  - **Change:** Reduced padding and spacing throughout task cards
  - **Improvements:**
    - Card padding: Reduced from `p-5` to `p-4`
    - Title section margin: Reduced from `mb-3` to `mb-2`
    - Title margin: Reduced from `mb-2` to `mb-1.5`
  - **Files Modified:**
    - `src/components/tasks/AllTasksList.jsx`
  - **Result:** More tasks visible on screen, reduced visual clutter, cleaner interface

---

## 📝 Notes

### Design & Planning Considerations

#### Element Dictionary (Terminology Standardization)
Need to establish consistent terminology across codebase and documentation:
- **Personal Task List** - The full list of tasks shown on the Personal (Main) Page
- **Company Task List** - List of tasks shown on the Manager Dashboard
- **Priority Queue** - Top 7 high-priority tasks with drag-and-drop ordering
- **Focused Task** - Currently active task in Focus Mode
- **Performance Dashboard** - Metrics and analytics view (needs definition)

#### Performance Dashboard - Open Questions
- What metrics should we track?
  - Task completion rate?
  - Focus time per day/week?
  - Streak tracking?
  - Tasks completed vs created?
  - Time estimates vs actual?
  - Productivity trends?
- **Action Item:** Define key performance indicators (KPIs) for personal productivity

#### Visual Design Notes
- **Module logo colors** - Need to bring color back to module logos for better visual hierarchy and brand identity
- Consider using brand gradient colors from guidelines

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
- **Data Storage:** ✅ Azure Table Storage implemented (SlackUserMappings, NotificationPreferences, TaskCheckTracking, MilestoneTracking, SlackMessageTaskLinks)
- **Backend Services:** ✅ Polling-based task monitoring, scheduled timer functions for digests and checks
- **Slack OAuth:** ✅ Implemented - User connects Slack account, encrypted token storage (AES-256-CBC)
- **ngrok Integration:** ✅ Permanent reserved domain (taskcommand.ngrok.app) for stable OAuth callbacks
- **Notification Architecture:** ✅ Polling-based (Microsoft Graph does not support webhooks for Planner tasks)
  - Assignment check: Timer function runs every 10 minutes, tracks last check time per user
  - Morning digest: Timer function runs daily at 8 AM
  - Services: taskPollingService.js, morningDigestService.js, slackService.js, slackFormatter.js
- **Scheduled Jobs:**
  - ✅ CheckTaskAssignments (every 10 min) - Poll for new task assignments
  - ✅ SendMorningDigest (daily 8 AM) - Send morning digest to opted-in users
  - ⏳ Daily kudos (5 PM) - Pending
  - ⏳ Weekly summary (Friday 4 PM) - Pending
- **Rate Limiting:** Handle Slack API and Microsoft Graph API rate limits (100ms delay between batch sends)
- **Timezone Support:** ⏳ Pending - Need to implement user timezone preferences for digest timing
- **Local Development:** ⚠️ Azure CDN outage workaround - extensionBundle commented out in host.json (restore before production deploy)

### Future Considerations
- Could be commercialized for other companies using Planner
- Build as internal tool first, prove value, then decide on external offering
- Potential to become standard at other organizations
- Keep architecture clean for potential multi-tenant future

---

**Last Updated:** 2025-10-31

---

## 🎯 Slack Integration - Implementation Roadmap

### Phase 1 Detailed Tasks (Current Focus)
**Week 1: Infrastructure & Settings** ✅ *Completed 2025-10-29*
- [x] Create Slack App in workspace
- [x] Configure OAuth redirect URLs (ngrok permanent domain)
- [x] Set up data storage (SlackUserMappings, NotificationPreferences, MilestoneTracking, SlackMessageTaskLinks tables)
- [x] Design Settings page UI
- [x] Build Settings page with Slack connection
- [x] Implement backend OAuth flow
- [x] Test end-to-end OAuth connection successfully

**Week 2: Slash Commands & Interactions** 🚧 *In Progress*
- [ ] Create `/api/slack/commands` endpoint
- [ ] Implement slash command router
- [ ] Build `/taskcommand mine`, `today`, `add`, `help` commands
- [x] Format Slack messages with Block Kit (assignment notifications & morning digest)
- [ ] Create `/api/slack/interactions` endpoint for buttons
- [ ] Implement [Complete] and [View in App] buttons

**Week 2-3: Notifications & Digests** ✅ *Core Complete - 2025-10-30*
- [x] Build notification service modules (taskPollingService.js, morningDigestService.js)
- [x] Implement assignment notifications (polling-based, every 10 minutes)
- [x] Create morning digest scheduled job (8 AM daily)
- [x] Format with Slack Block Kit (priority emojis, task summaries, context)
- [x] Test end-to-end in Slack workspace
- [ ] Create daily kudos scheduled job (5 PM) - *Pending*
- [ ] Add timezone support for digest timing - *Pending*
- [ ] User-configurable digest delivery time - *Pending*

**Estimated Timeline:** 2-3 weeks for Phase 1 MVP