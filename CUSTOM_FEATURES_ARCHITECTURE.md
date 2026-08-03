# TaskCommand - Custom Features Architecture Plan

**Created:** 2025-01-07
**Status:** Planning Document

## Overview

This document outlines the architecture, implementation strategy, and effort estimates for adding custom features to TaskCommand that extend beyond Microsoft Planner's native capabilities.

---

## Current Architecture

TaskCommand currently operates as a **pure frontend** to Microsoft Planner:
- All task data lives in Microsoft Planner via Graph API
- Backend (Azure Functions) acts as proxy/aggregator for company-wide views
- No persistent storage for custom data
- Authentication via Microsoft Graph with delegated/application permissions

---

## Proposed Custom Features

### Priority List (Top 3 Quick Wins)
1. **Custom Statuses** - 8-12 hours
2. **Time Estimates** - 8-12 hours
3. **Comments System** - 8-12 hours

### Complete Feature List

| Feature | Complexity | Estimated Hours | Priority |
|---------|-----------|----------------|----------|
| Custom Statuses | Easy | 8-12 | High |
| Time Estimates | Easy | 8-12 | High |
| Comments System | Easy-Medium | 8-12 | High |
| Progress Tracking (Milestones) | Medium | 12-16 | Medium |
| Time in Due Dates | Easy* | 2-4* | Medium |
| Smart Alerts (Basic) | Medium | 16-24 | Medium |
| Email Integration | Complex | 16-24 | Low |
| Recurring Tasks | Complex | 24-32 | Low |
| LLM Summaries | Medium | 12-16 | Low |
| Smart Alerts (Advanced) | Complex | 24-32+ | Low |

*\*May already be supported by Planner - needs verification*

---

## Required Infrastructure

### 1. Database Layer (Azure Table Storage)

**Why Table Storage:**
- Already using Azurite for local development (Slack integration)
- Very cost-effective (~$0.05/GB/month)
- Simple key-value model perfect for task metadata
- Easy integration with Azure Functions
- Supports local development via Azurite

**Schema Strategy:**
```javascript
// Link custom data to Planner tasks by taskId
{
  partitionKey: taskId,           // Planner task ID
  rowKey: 'metadata-type',        // Type of custom data
  // ... custom fields
}
```

### 2. Backend API Extensions

**New Azure Functions Needed:**
```
/api/tasks/{taskId}/custom-data          GET, POST, PUT, DELETE
/api/tasks/{taskId}/comments             GET, POST
/api/tasks/{taskId}/time-entries         GET, POST
/api/tasks/{taskId}/status               GET, PUT
/api/tasks/custom-data/batch             POST (bulk operations)
/api/recurring-tasks                     GET, POST, PUT, DELETE
```

**Authentication:** Reuse existing Microsoft Graph token validation

### 3. Data Synchronization Strategy

**Challenge:** Keep custom data in sync when Planner tasks are deleted/modified outside TaskCommand

**❌ CONFIRMED: Webhooks NOT Supported**
- **Microsoft Graph does NOT support change notifications (`/subscriptions`) for Planner tasks**
- Discovered October 30, 2025 during Slack integration implementation
- Built webhook infrastructure (subscriptionManager.js, notificationProcessor.js) before discovering this
- Archived in `archived-docs/` as a learning example
- **Source:** `archived-docs/README.md` lines 70-86

**Sync Strategy Options (since webhooks don't work):**

1. **Polling (Safer):**
   - Scheduled function runs every X minutes
   - Check if tasks still exist
   - Clean up orphaned custom data
   - **Lift:** Low, guaranteed to work

2. **Lazy Cleanup:**
   - When loading data, verify task exists
   - Delete custom data if task is gone
   - **Lift:** Very Low
   - **Drawback:** Stale data accumulates until accessed

3. **Manual Cleanup:**
   - Admin tool to scan and remove orphaned data
   - Run on-demand or scheduled weekly
   - **Lift:** Very Low

**Recommended:** Start with Lazy Cleanup, add Polling later if needed

### 4. Frontend Integration

**Data Merging Pattern:**
```javascript
// Combine Planner data + custom data
const enrichedTask = {
  ...plannerTask,      // From Microsoft Graph API
  ...customData,       // From Azure Table Storage
  _isEnriched: true
};
```

**Loading States:**
- Show Planner data immediately
- Load custom data asynchronously
- Progressive enhancement approach

---

## Feature Implementation Details

### 1. Custom Statuses ⭐ HIGH PRIORITY

**Current:** Planner only has "Not Started", "In Progress", "Completed"
**Enhancement:** Add custom statuses like "Blocked", "In Review", "Testing", "Deployed"

**Storage Schema:**
```javascript
{
  partitionKey: taskId,
  rowKey: 'custom-status',
  status: 'blocked',
  statusReason: 'Waiting on API team',
  statusChangedBy: userId,
  statusChangedAt: timestamp,
  statusHistory: [
    { status: 'in-progress', changedAt: '2025-01-05T10:00:00Z', changedBy: 'user@co.com' },
    { status: 'blocked', changedAt: '2025-01-07T14:30:00Z', changedBy: 'user@co.com' }
  ]
}
```

**Components Needed:**
- Status dropdown component
- Status badge styling (different colors per status)
- Status filter in task lists
- Status history view
- Status transition rules (optional)

**API Endpoints:**
```
GET    /api/tasks/{taskId}/status
PUT    /api/tasks/{taskId}/status
GET    /api/tasks/{taskId}/status/history
```

**Lift:** 8-12 hours

---

### 2. Time Estimates ⭐ HIGH PRIORITY

**What:** Track estimated hours vs actual hours logged

**Storage Schema:**
```javascript
{
  partitionKey: taskId,
  rowKey: 'time-tracking',
  estimatedHours: 8,
  actualHours: 10.5,
  remainingHours: -2.5,
  timeEntries: [
    {
      entryId: 'uuid',
      date: '2025-01-07',
      hours: 3.5,
      userId: 'user@co.com',
      userName: 'John Doe',
      notes: 'API integration work'
    },
    {
      entryId: 'uuid',
      date: '2025-01-08',
      hours: 4,
      userId: 'user@co.com',
      userName: 'John Doe',
      notes: 'Testing and bug fixes'
    }
  ],
  lastUpdated: timestamp
}
```

**Components Needed:**
- Time estimate input field
- Time entry modal (quick log)
- Time tracker widget (start/stop timer)
- Time summary display on task cards
- Burndown chart (estimated vs actual)
- Capacity planning view (aggregate across users/plans)

**API Endpoints:**
```
GET    /api/tasks/{taskId}/time-tracking
POST   /api/tasks/{taskId}/time-tracking/entries
PUT    /api/tasks/{taskId}/time-tracking/estimate
DELETE /api/tasks/{taskId}/time-tracking/entries/{entryId}
GET    /api/users/{userId}/time-tracking/summary
```

**Lift:** 8-12 hours

---

### 3. Comments System ⭐ HIGH PRIORITY

**✅ CONFIRMED: Use Planner's Native Comment System**
- **Tested:** January 7, 2025 - Successfully accessed conversation threads via Graph API
- **Benefit:** Comments visible in BOTH TaskCommand AND native Planner UX
- **No custom storage needed** - comments live in Microsoft 365 conversation threads

**How it works:**
- Tasks with comments have `conversationThreadId` field populated
- Thread ID links to Microsoft 365 Group conversation
- Comments stored as posts in the conversation thread
- Content in HTML format with author and timestamp
- Backend already has required permission (Group.Read.All)

**Graph API Endpoints:**
```
GET  /groups/{groupId}/threads/{conversationThreadId}/posts
     → Read all comments on a task

POST /groups/{groupId}/threads/{conversationThreadId}/reply
     → Add a new comment to a task

GET  /planner/plans/{planId}
     → Get group ID from plan (needed for thread access)
```

**Implementation Plan:**
1. **Backend Service** (4-6 hours)
   - Create `commentService.js` to wrap Graph API calls
   - Handle group ID lookup from plan ID
   - Parse HTML content for display
   - Add POST endpoint for creating comments

2. **Frontend Components** (4-6 hours)
   - Comment list UI component
   - Comment input component (simple textarea initially)
   - Integrate into task detail modal
   - Comment count badge on task cards
   - Auto-refresh comments when viewing task

**API Endpoints (TaskCommand Backend):**
```
GET    /api/tasks/{taskId}/comments
       → Fetch comments via Graph API conversation threads

POST   /api/tasks/{taskId}/comments
       → Post reply to conversation thread
```

**Future Enhancements (Later Phases):**
- Rich text editor with formatting
- @ mentions (leverage Microsoft 365 mention functionality)
- Inline image/file attachments
- Comment edit/delete (if Graph API supports it)
- Real-time comment updates (polling or SignalR)

**Lift:** 8-12 hours (basic read/write), 16-20 hours (with rich features)

---

### 4. Progress Tracking (Milestones)

**Current:** Planner only has percentComplete (0-100) and checklist items
**Enhancement:** Weighted milestones, subtask progress tracking

**Option A: Milestone-based Progress**
```javascript
{
  partitionKey: taskId,
  rowKey: 'progress-milestones',
  milestones: [
    { id: 'uuid', name: 'Design', weight: 20, completed: true, completedAt: '2025-01-05' },
    { id: 'uuid', name: 'Development', weight: 50, completed: false, completedAt: null },
    { id: 'uuid', name: 'Testing', weight: 20, completed: false, completedAt: null },
    { id: 'uuid', name: 'Deployment', weight: 10, completed: false, completedAt: null }
  ],
  calculatedProgress: 20,  // Auto-calculated from completed milestones
  lastUpdated: timestamp
}
```

**Option B: Subtask Progress**
```javascript
{
  partitionKey: taskId,
  rowKey: 'progress-subtasks',
  subtasks: [
    {
      id: 'uuid',
      title: 'Create REST API endpoints',
      estimatedHours: 4,
      actualHours: 3,
      status: 'completed',
      assignedTo: 'user@co.com'
    },
    {
      id: 'uuid',
      title: 'Add unit tests',
      estimatedHours: 2,
      actualHours: 0,
      status: 'todo',
      assignedTo: 'user@co.com'
    }
  ],
  progressMetric: 'hours',  // or 'count'
  calculatedProgress: 60    // 3/5 hours completed
}
```

**Components Needed:**
- Milestone/subtask editor
- Progress bar visualization
- Drag-and-drop reordering
- Inline editing

**Lift:** 12-16 hours

---

### 5. Time in Due Dates

**⚠️ NEEDS VERIFICATION:**
- *Planner's `dueDateTime` field in Graph API DOES support time*
- *Example: `"dueDateTime": "2025-01-07T14:30:00Z"`*
- **Action:** Test if Planner UI and API fully support time component
- **If supported:** Just need frontend UI updates (2-4 hours)
- **If not supported:** Add custom time tracking to override Planner's date-only

**If Building Custom:**
```javascript
{
  partitionKey: taskId,
  rowKey: 'due-time',
  dueTime: '14:30:00',
  timezone: 'America/New_York',
  useCustomTime: true
}
```

**Lift:** 2-4 hours (if Planner supports), 6-8 hours (if custom)

---

### 6. Email Integration (Create/Update Tasks)

**What:** Send email to task-inbox@taskcommand.com → creates/updates task

**Architecture:**
```
Email (SMTP)
  → Azure Logic Apps (Email Connector)
  → Parse Email Body/Subject
  → Azure Function (Task Creator)
  → Create Planner Task + Custom Data
  → Send Confirmation Email
```

**Email Format:**
```
To: tasks@taskcommand.com
Subject: Implement new API endpoint

Plan: Engineering
Bucket: Backend
Due: 2025-01-15 2:00 PM
Assign: @john, @sarah
Priority: Urgent
Estimate: 8h
Tags: backend, api

Task description goes here...

- Subtask 1
- Subtask 2
```

**Components Needed:**
- Azure Logic Apps workflow
- Email parser (extract structured data)
- Natural language date parser
- User mention resolver (@john → userId)
- Reply-to-update functionality
- Email templates

**API Endpoints:**
```
POST /api/tasks/from-email
POST /api/tasks/{taskId}/update-from-email
```

**Lift:** 16-24 hours

---

### 7. Recurring Tasks

**Current:** Planner has basic recurrence (limited functionality)
**Enhancement:** Advanced recurrence patterns, template-based task spawning

**Storage Schema:**
```javascript
// Recurring Task Template
{
  partitionKey: 'recurring-templates',
  rowKey: templateId,
  templateName: 'Weekly Team Standup Notes',
  baseTaskData: {
    title: 'Team Standup - Week of {date}',
    planId: 'plan-123',
    bucketId: 'bucket-456',
    // ... other task properties
  },
  recurrencePattern: {
    frequency: 'weekly',  // daily, weekly, monthly, yearly, custom
    interval: 1,          // Every 1 week
    daysOfWeek: ['monday'],
    dayOfMonth: null,
    monthOfYear: null,
    timeOfDay: '09:00:00',
    timezone: 'America/New_York',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    endAfterOccurrences: null
  },
  lastCreatedDate: '2025-01-06',
  nextDueDate: '2025-01-13',
  isActive: true,
  createdTaskIds: ['task-456', 'task-789'],  // Track spawned tasks
  createdBy: 'user@co.com',
  createdAt: timestamp
}
```

**Backend - Scheduled Task Creator (Timer Trigger):**
```javascript
// Runs daily at midnight
module.exports = async function (context, myTimer) {
  const activeTemplates = await getActiveRecurringTemplates();

  for (const template of activeTemplates) {
    if (shouldCreateInstance(template, new Date())) {
      // Create new Planner task from template
      const newTask = await createPlannerTask({
        title: interpolateTitle(template.baseTaskData.title, new Date()),
        planId: template.baseTaskData.planId,
        bucketId: template.baseTaskData.bucketId,
        dueDate: calculateNextDueDate(template),
        // ... other properties
      });

      // Copy custom data from template
      await cloneCustomData(template.templateId, newTask.id);

      // Update template's last created tracking
      await updateRecurringTemplate(template.templateId, {
        lastCreatedDate: new Date(),
        nextDueDate: calculateNextDueDate(template, 1),
        createdTaskIds: [...template.createdTaskIds, newTask.id]
      });
    }
  }
};
```

**Components Needed:**
- Recurrence rule builder UI (visual editor)
- Calendar preview (show future occurrences)
- Edit recurrence vs single instance
- Skip occurrence feature
- Pause/resume recurrence

**API Endpoints:**
```
GET    /api/recurring-tasks
POST   /api/recurring-tasks
PUT    /api/recurring-tasks/{templateId}
DELETE /api/recurring-tasks/{templateId}
POST   /api/recurring-tasks/{templateId}/skip-next
GET    /api/recurring-tasks/{templateId}/preview
```

**Lift:** 24-32 hours

---

### 8. LLM Conversational Summaries

**What:** AI-generated summaries and insights about tasks, progress, and team activity

**Use Cases:**
- Daily digest email: "Here's what happened today..."
- Task hover summary: "This task is blocked because..."
- Sprint summary: "Your team completed 12/15 tasks this sprint"
- Smart suggestions: "This task might be blocked by task X"
- Natural language search: "Show me blocked backend tasks from last week"

**Implementation (Azure OpenAI):**
```javascript
const { OpenAIClient } = require("@azure/openai");

async function generateTaskSummary(taskId) {
  const task = await getTaskWithCustomData(taskId);
  const comments = await getComments(taskId);
  const timeEntries = await getTimeEntries(taskId);
  const relatedTasks = await getRelatedTasks(taskId);

  const prompt = `
    Analyze this task and provide a concise 2-3 sentence summary:

    Title: ${task.title}
    Status: ${task.customStatus || task.percentComplete}
    Progress: ${task.percentComplete}%
    Time: ${timeEntries.totalHours}h logged of ${task.estimatedHours}h estimated

    Recent Comments (${comments.length}):
    ${comments.slice(-5).map(c => `- ${c.userName}: ${c.comment}`).join('\n')}

    Focus on current state, blockers, and next steps.
  `;

  const client = new OpenAIClient(endpoint, credential);
  const response = await client.getChatCompletions(
    deploymentId,
    [{ role: "user", content: prompt }],
    { maxTokens: 150, temperature: 0.7 }
  );

  return response.choices[0].message.content;
}
```

**LLM-Powered Features:**

1. **Task Insights** - Hover tooltip shows AI summary
2. **Daily Digest** - Email with personalized summary
3. **Sprint Retrospective** - AI analyzes completed work
4. **Smart Search** - Natural language queries
5. **Suggested Actions** - "This task is stuck. Consider..."
6. **Workload Analysis** - "You're over capacity by 10 hours this week"

**API Endpoints:**
```
POST /api/ai/summarize-task
POST /api/ai/daily-digest
POST /api/ai/sprint-summary
POST /api/ai/smart-search
POST /api/ai/suggest-actions
```

**Costs:**
- Azure OpenAI GPT-4o-mini: ~$0.002 per summary
- 500 summaries/month = ~$1
- Very affordable for high value

**Lift:** 12-16 hours (foundation), then incremental per feature

---

### 9. Smart Alerts

**What:** Intelligent notifications beyond basic due date reminders

**Alert Rules Engine:**
```javascript
const alertRules = [
  {
    id: 'overdue-urgent',
    name: 'Overdue Urgent Task',
    condition: (task) => task.isOverdue && task.priority === 'urgent',
    action: 'send-slack-and-email',
    frequency: 'daily',
    throttle: '24h',  // Don't re-alert within 24h
    message: '🚨 Urgent task overdue: {taskTitle}',
    enabled: true
  },
  {
    id: 'stuck-task',
    name: 'Task Not Updated',
    condition: (task) => task.daysSinceLastUpdate > 3 && !task.isCompleted,
    action: 'send-slack',
    frequency: 'once',
    message: '⚠️ Task hasn\'t moved in 3 days: {taskTitle}',
    enabled: true
  },
  {
    id: 'capacity-warning',
    name: 'User Over Capacity',
    condition: (user) => user.assignedHours > user.availableHours * 1.2,
    action: 'send-email-to-manager',
    frequency: 'weekly',
    message: '📊 {userName} is over capacity by {overageHours}h',
    enabled: true
  },
  {
    id: 'deadline-risk',
    name: 'Deadline At Risk',
    condition: (task) => {
      const remainingDays = task.daysUntilDue;
      const remainingWork = task.estimatedHours - task.actualHours;
      const dailyVelocity = task.actualHours / task.daysWorked;
      const projectedDays = remainingWork / dailyVelocity;
      return projectedDays > remainingDays;
    },
    action: 'send-slack',
    frequency: 'daily',
    message: '⏰ Task at risk of missing deadline: {taskTitle}',
    enabled: true
  }
];
```

**Backend - Alert Checker (Timer Trigger):**
```javascript
// Runs every hour
module.exports = async function (context, myTimer) {
  const tasks = await getAllActiveTasks();
  const users = await getAllUsers();
  const alerts = [];

  // Check task-based rules
  for (const task of tasks) {
    const enrichedTask = await enrichTaskData(task);

    for (const rule of alertRules.filter(r => r.enabled)) {
      if (rule.condition(enrichedTask)) {
        const shouldAlert = await checkThrottle(rule.id, task.id, rule.throttle);

        if (shouldAlert) {
          alerts.push({
            ruleId: rule.id,
            taskId: task.id,
            message: formatMessage(rule.message, enrichedTask),
            action: rule.action,
            recipients: getRecipients(enrichedTask, rule)
          });

          await markAlerted(rule.id, task.id);
        }
      }
    }
  }

  // Check user-based rules
  for (const user of users) {
    const userMetrics = await calculateUserMetrics(user);
    // ... similar logic
  }

  // Process all alerts
  await processAlerts(alerts);
};
```

**Alert Types:**

1. **Deadline Alerts**
   - Task due in X hours/days
   - Overdue tasks
   - Predicted deadline miss

2. **Progress Alerts**
   - Task stuck (no updates in X days)
   - Task over time estimate
   - Milestone completed

3. **Capacity Alerts**
   - User over capacity
   - Team under-utilized
   - Imbalanced workload

4. **Dependency Alerts**
   - Blocking task completed
   - Dependent task at risk

5. **Pattern Recognition**
   - Task taking longer than similar tasks
   - Unusual activity patterns

**Notification Channels:**
- Slack
- Email
- Microsoft Teams
- SMS (via Twilio)
- In-app notifications

**User Preferences:**
```javascript
{
  partitionKey: userId,
  rowKey: 'alert-preferences',
  channels: {
    urgent: ['slack', 'email', 'sms'],
    important: ['slack', 'email'],
    normal: ['slack'],
  },
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '08:00',
    timezone: 'America/New_York'
  },
  disabledRules: ['capacity-warning'],
  customRules: []
}
```

**API Endpoints:**
```
GET    /api/alerts/preferences
PUT    /api/alerts/preferences
GET    /api/alerts/history
POST   /api/alerts/test/{ruleId}
```

**Lift:**
- Basic alerts: 16-24 hours
- Advanced with ML predictions: 24-32+ hours

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2) - 24-32 hours
**Goal:** Core infrastructure + 3 high-value features

1. **Azure Table Storage Setup** (4-6 hours)
   - Extend existing storage for custom data
   - Create table structure
   - Add to local dev (Azurite)

2. **Custom Statuses** (8-12 hours)
   - Backend API
   - Frontend components
   - Filters and badges

3. **Time Estimates** (8-12 hours)
   - Time tracking storage
   - Entry UI
   - Summary displays

4. **Comments System** (8-12 hours)
   - Comment storage
   - Thread UI
   - Basic notifications

**Deliverable:** Three valuable features live, foundation for future work

### Phase 2: Productivity Boost (Week 3-4) - 24-32 hours
**Goal:** Enhanced task management

5. **Progress Tracking** (12-16 hours)
   - Milestone system
   - Progress visualization
   - Weighted completion

6. **Time in Due Dates** (2-4 hours)
   - Verify Planner support
   - Add time picker UI
   - Display in task lists

7. **Smart Alerts (Basic)** (16-24 hours)
   - Alert rules engine
   - Email/Slack integration
   - User preferences

**Deliverable:** Comprehensive task management with alerts

### Phase 3: Advanced Features (Week 5-8) - 48-64 hours
**Goal:** Automation and intelligence

8. **Email Integration** (16-24 hours)
   - Azure Logic Apps setup
   - Email parser
   - Bi-directional sync

9. **Recurring Tasks** (24-32 hours)
   - Template system
   - Scheduler function
   - Recurrence UI

10. **LLM Summaries** (12-16 hours)
    - Azure OpenAI integration
    - Task insights
    - Daily digest

11. **Smart Alerts (Advanced)** (16-24 hours)
    - Predictive alerts
    - Pattern recognition
    - Multi-channel delivery

**Deliverable:** Full-featured task management platform

---

## Cost Estimates

### Development Costs
- Phase 1: 24-32 hours
- Phase 2: 24-32 hours
- Phase 3: 48-64 hours
- **Total Development: 96-128 hours**

### Monthly Operational Costs (Estimated)

| Service | Usage | Monthly Cost |
|---------|-------|-------------|
| Azure Table Storage | ~1-5 GB data | $0.05-$0.25 |
| Azure Functions | ~100K executions | $0 (free tier) |
| Azure Functions (overage) | Above free tier | $5-10 |
| Azure OpenAI (GPT-4o-mini) | ~1000 summaries/month | $2-5 |
| Email Service (SendGrid) | ~1000 emails/month | $0 (free tier) |
| Azure Logic Apps | ~500 email runs/month | $0-5 |
| **TOTAL** | | **$10-30/month** |

**Cost will scale with usage but remains very affordable**

---

## Technical Requirements

### Backend
- Node.js 20+ (already using)
- Azure Functions v4 (already using)
- Azure Table Storage SDK
- Azure OpenAI SDK (for LLM features)
- Microsoft Graph SDK (already using)

### Frontend
- React 18 (already using)
- Vite (already using)
- No additional major dependencies

### Azure Services
- Azure Functions (existing)
- Azure Table Storage (new - minimal setup)
- Azure OpenAI (new - for LLM features)
- Azure Logic Apps (new - for email integration)

### Local Development
- Azurite (already running)
- No changes to existing dev setup

---

## Data Model Overview

### Core Tables

**TaskCustomData**
```
partitionKey: taskId
rowKey: 'custom-status' | 'time-tracking' | 'progress' | 'metadata'
```

**TaskComments**
```
partitionKey: taskId
rowKey: comment-{timestamp}-{uuid}
```

**RecurringTemplates**
```
partitionKey: 'templates'
rowKey: templateId
```

**AlertRules**
```
partitionKey: 'alerts'
rowKey: ruleId
```

**UserPreferences**
```
partitionKey: userId
rowKey: 'alert-prefs' | 'ui-prefs' | 'notification-prefs'
```

---

## Risks & Mitigation

### Risk 1: Planner API Limitations
**Issue:** Some features may not be fully supported by Microsoft Graph API

**Mitigation:**
- Build custom storage layer (already planned)
- Verify API capabilities before building features
- Design for graceful degradation

### Risk 2: Data Synchronization
**Issue:** Custom data can become orphaned if tasks deleted in Planner

**Mitigation:**
- Implement lazy cleanup (check on load)
- Add scheduled cleanup job
- Provide admin tools to audit orphaned data

### Risk 3: Performance with Large Datasets
**Issue:** Table Storage queries may slow down with thousands of tasks

**Mitigation:**
- Use proper partitioning strategy (by taskId)
- Implement caching layer
- Add pagination for large lists
- Consider indexing strategy

### Risk 4: Cost Overruns
**Issue:** Azure costs could increase with heavy usage

**Mitigation:**
- Start with free tiers
- Monitor usage closely
- Set up billing alerts
- Optimize API calls (batching, caching)

---

## Open Questions & Verification Needed

### ✅ CONFIRMED FACTS:

1. **Microsoft Graph Webhooks for Planner** ✅ **VERIFIED - NOT SUPPORTED**
   - **Status:** ❌ **CONFIRMED: Webhooks do NOT work**
   - **Finding:** Microsoft Graph's `/subscriptions` endpoint does NOT support Planner tasks
   - **Date Discovered:** October 30, 2025
   - **Source:** Attempted implementation, see `archived-docs/README.md`
   - **Impact:** MUST use polling or lazy cleanup strategy for data sync
   - **Current Implementation:** Already using polling in `backend/services/taskPollingService.js`

### ✅ CONFIRMED:

2. **Comments via Graph API**
   - **Status:** ✅ CONFIRMED - Planner comments ARE accessible via Graph API
   - **Tested:** January 7, 2025 - Successfully read conversation thread posts
   - **Endpoint:** `GET /groups/{groupId}/threads/{threadId}/posts`
   - **Required Permission:** `Group.Read.All` (backend already has this)
   - **How it works:**
     - Tasks with comments have `conversationThreadId` field populated
     - Thread ID links to Microsoft 365 Group conversation
     - Comments stored as posts in the conversation thread
     - Content in HTML format with author and timestamp
   - **Test Script:** `backend/test-comments.js`
   - **Impact:** Can use Planner's native comment system - no custom storage needed!
   - **Benefit:** Comments visible in both TaskCommand AND native Planner UX
   - **Next Steps:** Test adding comments (POST to thread), implement UI integration

### ⚠️ STILL NEEDS VERIFICATION:

3. **Due Date Time Support**
   - **Claim:** Planner's dueDateTime supports time component
   - **Status:** ⚠️ NEEDS TESTING
   - **Action:** Test creating task with full timestamp via Graph API
   - **Impact:** Determines if custom solution needed

### Other Questions:

4. **Azure OpenAI Access**
   - Do we have Azure OpenAI service provisioned?
   - Or should we use OpenAI API directly?

5. **Email Domain**
   - What domain for email-to-task? (tasks@taskcommand.com?)
   - Need email hosting setup?

6. **Notification Preferences**
   - What channels are priority? (Slack already integrated)
   - Teams integration needed?

---

## Next Steps

### Immediate Actions:
1. ✅ Document architecture (this document)
2. ✅ Verify Graph API webhooks - **CONFIRMED: Not supported**
3. ✅ Test Graph API for comments access - **CONFIRMED: Fully accessible!**
4. ⏳ Test adding comments via Graph API (POST to thread)
5. ⏳ Set up Azure Table Storage (extend existing)
6. ⏳ Decide on Phase 1 features to implement

### Before Starting Development:
1. Confirm Graph API limitations
2. Finalize feature priority list
3. Set up Table Storage schema
4. Create development branch
5. Update FEATURES.md with planned items

---

## Conclusion

Adding custom features to TaskCommand is highly feasible with moderate effort. The proposed architecture leverages existing infrastructure (Azure Functions, authentication) while adding a lightweight storage layer for custom data.

**Key Advantages:**
- Builds on existing foundation
- Incremental development (can add features one at a time)
- Low operational costs
- Data portability (own your custom data)
- No Planner migration required

**Recommended Start:**
Focus on Phase 1 (Custom Statuses, Time Estimates, Comments) for immediate value with 24-32 hours of development effort.

---

**Document Status:** Active Planning Document
**Last Updated:** 2025-01-07
**Next Review:** Before starting Phase 1 implementation

**Key Confirmations:**
- ✅ Webhooks NOT supported for Planner (confirmed Oct 30, 2025)
- ✅ Comments ARE accessible via Graph API conversation threads (confirmed Jan 7, 2025)
- ✅ Backend already has required permission (Group.Read.All)
- ✅ Can use Planner's native comment system - no custom storage needed
- ⏳ Ready to begin implementation once feature priority is decided
