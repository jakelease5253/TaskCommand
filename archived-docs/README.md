# Archived Documentation

**Archived:** 2025-10-30

This folder contains outdated or superseded documentation files that are kept for historical reference.

---

## Files in This Archive

### PROGRESS.md
**Why Archived:** Old Vite migration checklist from initial project setup. Migration is complete and this is no longer relevant.

**Status:** 20% complete at time of archival
**Content:** Basic setup checklist, component extraction plan

---

### ASSIGNMENT_NOTIFICATIONS_IMPLEMENTATION.md
**Why Archived:** Based on webhook architecture that Microsoft Graph does NOT support for Planner tasks.

**Problem:** This entire guide assumes webhook-based change notifications work. We discovered Microsoft Graph doesn't support change notifications (`/subscriptions`) for Planner tasks.

**Actual Implementation:** See `backend/services/taskPollingService.js` and `backend/services/morningDigestService.js` for the polling-based approach that was implemented instead.

**Key Learning:** Always verify API capabilities before building architecture around them!

---

### SESSION_SUMMARY_2025-10-30.md
**Why Archived:** Point-in-time session summary with outdated information.

**Status:** Contains references to webhook-based notifications
**Content:** Session recap, next steps, file references

**Current Source of Truth:** See `FEATURES.md` for current status and roadmap

---

### SLACK_SLASH_COMMANDS_SUMMARY.md
**Why Archived:** Lengthy implementation guide with some outdated information.

**Status:** Slash commands are implemented, but guide still references webhooks
**Content:**
- Slash command implementation (useful reference)
- Default plan selection (completed)
- Webhook references (obsolete)

**Current Source of Truth:** See `FEATURES.md` Phase 1 for current Slack integration status

---

## Current Documentation (Active)

The following files in the root `/dev` folder are the current source of truth:

1. **FEATURES.md** - Living feature list and Slack integration roadmap
2. **README.md** - Project overview and quick start
3. **SETUP.md** - Complete setup instructions
4. **DEPLOYMENT.md** - Git workflow and deployment guide
5. **RESTART_GUIDE.md** - Quick operational restart guide
6. **TaskCommand-Brand-Guidelines.md** - Design system reference

---

## Historical Context

### What We Learned

**Mistake:** Built webhook-based notification system without verifying Microsoft Graph supports it for Planner tasks.

**Discovery:** Microsoft Graph's change notification system (`/subscriptions`) does NOT support Planner tasks as a resource type.

**Solution:** Implemented polling-based approach instead:
- Timer function runs every 10 minutes
- Tracks last check time per user
- Compares assignment dates to detect new assignments
- Successfully sends Slack notifications

### Implementation Timeline

- **Oct 29-30, 2025:** Built webhook infrastructure (subscriptionManager.js, notificationProcessor.js)
- **Oct 30, 2025:** Discovered webhooks don't work for Planner
- **Oct 30, 2025:** Pivoted to polling architecture (taskPollingService.js)
- **Oct 30, 2025:** Successfully tested assignment notifications with polling

---

## Why Keep This Archive?

1. **Historical Reference:** Shows our implementation journey and decision-making process
2. **Code Examples:** Contains useful Slack Block Kit formatting examples
3. **Learning Resource:** Documents what NOT to do (assume API capabilities)
4. **Future Claude Sessions:** Prevents confusion about which approach is current

---

**Do not reference these files for current implementation!**
**Use `FEATURES.md` and active source code as source of truth.**
