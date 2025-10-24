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

- [ ] **Settings (Foundational)**
  - Slack preferences (enable/disable, times, channel/DM)
  - Admin visibility controls (or leverage Entra manager hierarchy)
  - Super Admin can enable All Company Dashboard visibility

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

---

## 🔧 Known Issues / Bugs

- [ ] **Checklist reorder not persisted** to Planner (drag and drop doesn't work at all)
- [ ] **Checklist cannot complete items** checking the box does nothing
- [ ] **Slack Phase 1** not yet calling PA flow (awaiting DEV URL + wiring)
- [ ] **Manager/Admin pages** are stubs (no data yet)
- [ ] **Browser refresh returns use to login screen**
- [ ] **Priority Queue not persisting on browser refresh**
- [x] **Setting focus crashing app**

---

## 🔮 Future Enhancements

### Core Functionality
- [ ] **DEV-only favicon badge**
  - Small “DEV” indicator in tab icon at `localhost:3001`

- [ ] **Backend → Slack API (replace PA relay)**
  - Azure Function/SWA API with Slack Bot Token in Key Vault/App Settings
  - Endpoints: `chat.postMessage`, schedule (optional), blocks
  - Entra-protected; deprecate PA when parity reached

- [ ] **Search tasks**
  - Global search across plans by title/description/tags/assignee
  - Filters by plan, bucket, priority, due date

- [ ] **Create New Plans & Buckets**
  - Need to be able to crate new plans and buckets directly from TaskCommand
  - Only create new plans in current Sharepoint Groups

- [ ] **Cross-plan task view**
  - Unified “All my tasks” view across every plan

- [ ] **Task dependencies**, **recurring tasks**, **task templates**, **bulk actions**

- [ ] **Move tasks between plans**

- [ ] **Hover details**
  - Quick preview tooltip: due, priority, checklist progress, assignees

### Collaboration
- [ ] **Comments/notes** with @mentions
- [ ] **Task assignment** (multi-assignee)
- [ ] **Activity log** (audit trail)

### Productivity
- [ ] **Time estimates vs actual**
- [ ] **Energy levels**
- [ ] **Pomodoro timer**
- [ ] **Break reminders**
- [ ] **Tags/labels**
- [ ] **Calendar view** with drag-drop reschedule

### Integrations
- [ ] **Slack** (expanded)
  - Due soon, assignment, completion notifications
  - Create from Slack (`/taskcommand add`), quick queries, daily digests

- [ ] **Calendar sync (Outlook/Google)**
  - Block time for tasks; show events alongside tasks

- [ ] **Email → task** (forward to create)

### Reports & Analytics
- [ ] **Reports Page** (charts, CSV/PDF export)
- [ ] **Team productivity metrics**
- [ ] **Burndown charts**

### Manager Interface (Key Differentiator)
- [ ] **Open tasks for direct reports** (single pane, filters)
- [ ] **View team tasks / progress / workload**
- [ ] **Set priorities** for team members (sync to user views)
- [ ] **Team reporting & trends**, **workload balancing**, **capacity planning**
- [ ] **Cross-team visibility**

### Admin Dashboard (All Company)
- [ ] **Org-wide open tasks** with filters (dept, plan, bucket, due)
- [ ] **Access controls** (Super Admin only by default)

### Settings & Configuration
- [ ] **Settings Page**
  - Integration prefs (Slack), notifications, display, theme, default views
  - Per-user Slack prefs; optionally inherit Entra manager hierarchy
- [ ] **Notification preferences**
  - Channel prefs (in-app, Slack, email), quiet hours
- [ ] **Visibility & Roles**
  - Roles: User, Manager, Admin, Super Admin
  - Configure “who can see whose tasks”; Super Admin controls All Company Dashboard

### Dashboard Improvements
- [ ] **Expanded widgets, visualization, layouts**
- [ ] **Drag-drop widget arrangement**
- [ ] **Personal vs team dashboards**

### Mobile & Access
- [ ] **PWA** (offline, installable)
- [ ] **Quick add widget** (mobile)

---

## 📝 Notes

### Strategic Considerations
- **Primary users:** FieldWorks employees  
- **Backend:** Microsoft Planner  
- **Auth:** Entra ID (SSO)  
- **Deployment:** Azure Static Web App  
- **Integration focus:** Slack

### Technical Considerations
- Feature-based folders to avoid single-file bloat  
- Typed API client for Graph + Slack (retry, ETag, rate limiting)  
- Centralized state (Zustand/RTK) with normalized task entities  
- Route-based code splitting (dashboards, reports)  
- RBAC guard components + server-side checks  
- Virtualized task lists for large datasets  
- Background sync & cache (IndexedDB) for PWA resilience

---

**Last Updated:** 2025-10-23
