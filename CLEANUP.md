# Code Cleanup - Files to Delete

**Last Updated:** 2025-11-06

This document tracks unused files and code that can be safely removed from the codebase.

---

## 🔴 HIGH PRIORITY - Confirmed Safe to Delete

These files have been verified as unused with no imports or references in the codebase.

### Frontend Files (src/)

#### 1. src/services/graphAPI.js (44 lines)
- **Status:** Never imported anywhere in the codebase
- **Reason:** App uses direct `fetch()` calls instead (81 instances across multiple files)
- **Note:** Already mentioned in FEATURES.md as unused dead code
- **Action:** DELETE

#### 2. src/components/tasks/TaskCard.jsx (83 lines)
- **Status:** File exists but never imported or used
- **Reason:** Replaced by inline task rendering in `AllTasksList.jsx` and `PriorityQueue.jsx`
- **Note:** Only `FocusTaskCard` is actively used
- **Action:** DELETE

#### 3. src/components/layout/ActionButtons.jsx (74 lines)
- **Status:** Never imported anywhere
- **Reason:** Functionality integrated directly into other components
- **Action:** DELETE

### Backend Files

#### 4. backend/test-get-user-id.js (34 lines)
- **Status:** Debug/development script
- **Reason:** Queries Azure Table Storage for user IDs during testing
- **Note:** Contains development-only code
- **Action:** DELETE or move to `backend/scripts/`

#### 5. backend/debug-slack-token.js (41 lines)
- **Status:** Debug/development script
- **Reason:** Tests Slack token validity and sends test messages
- **Note:** Contains hardcoded Azure user ID: `9d51b9d0-2c22-4ff7-9dcd-ebfef243b918`
- **Action:** DELETE or move to `backend/scripts/`

#### 6. backend/reset-check-time.js (15 lines)
- **Status:** Debug/development script
- **Reason:** Resets last task check time for testing polling functionality
- **Note:** Contains hardcoded Azure user ID: `9d51b9d0-2c22-4ff7-9dcd-ebfef243b918`
- **Action:** DELETE or move to `backend/scripts/`

#### 7. backend/init-tables.js (14 lines)
- **Status:** Duplicate file
- **Reason:** Duplicates functionality of `backend/scripts/initTables.js` (30 lines, better version)
- **Note:** The version in scripts/ has better logging and error handling
- **Action:** DELETE (keep `backend/scripts/initTables.js`)

#### 8. backend/_old_v3_functions/ (entire directory, ~32KB)
- **Status:** Old architecture
- **Reason:** Contains old Azure Functions v3 code that has been completely replaced
- **Contents:**
  - `ComplteTask/` (note: typo in directory name)
  - `GetCompanyTasks/`
  - `src/`
- **Note:** Current implementation uses `backend/index.js`
- **Action:** DELETE entire directory

**Total High Priority Cleanup:** ~400 lines of code + 32KB directory

---

## 🟡 MEDIUM PRIORITY - Verify Then Delete

These files appear unused but should be verified before deletion.

### 9. src/components/layout/Sidebar.jsx
- **Status:** Imported in `App.jsx` line 9, but `<Sidebar>` component never rendered in JSX
- **Reason:** Layout changed from sidebar to full-width stacked design (per FEATURES.md line 1269)
- **Verification Steps:**
  1. Search for `<Sidebar` in src/App.jsx - confirm not rendered
  2. Search for any other imports of Sidebar component
- **Action:** DELETE and remove import from App.jsx

### 10. src/components/modals/PriorityLimitModal.jsx
- **Status:** Imported in App.jsx, component exists at line 1433
- **Reason:** Priority queue limit enforcement may have changed
- **Verification Steps:**
  1. Search for `showPriorityLimitModal` usage
  2. Check if modal is ever set to open
  3. Verify priority queue limits are enforced elsewhere
- **Action:** Verify usage, then DELETE if truly unused

### 11. ~~src/features/insights/Insights.jsx~~ - KEEP
- **Status:** ✅ ACTIVELY USED - Implemented on 2025-11-06
- **Reason:** Full Insights page with metrics and analytics
- **Action:** **DO NOT DELETE** - This is active code

---

## 🟢 LOW PRIORITY - Optional Cleanup

### archived-docs/ directory (47KB total)
Contains archived markdown files:
- `ASSIGNMENT_NOTIFICATIONS_IMPLEMENTATION.md` (9.8KB)
- `README.md` (3.5KB)
- `SESSION_SUMMARY_2025-10-30.md` (11KB)
- `SLACK_SLASH_COMMANDS_SUMMARY.md` (14KB)
- `PROGRESS.md` (deleted from root, archived here)

**Status:** Already properly archived
**Action:**
- Option 1: KEEP as historical reference
- Option 2: DELETE if historical reference not needed (git history preserves them)
**Recommendation:** Keep for now, delete later if space is concern

---

## 📝 Cleanup Commands

### High Priority Deletions (Safe to Run)
```bash
# Run from /Users/jakelease/Documents/Projects/taskcommand-vite/dev

# Frontend deletions
rm src/services/graphAPI.js
rm src/components/tasks/TaskCard.jsx
rm src/components/layout/ActionButtons.jsx

# Backend debug/test files
rm backend/test-get-user-id.js
rm backend/debug-slack-token.js
rm backend/reset-check-time.js
rm backend/init-tables.js

# Old backend architecture
rm -rf backend/_old_v3_functions/

echo "✅ High priority cleanup complete!"
```

### Medium Priority Deletions (Verify First)
```bash
# Run after verification

# Remove Sidebar if confirmed unused
rm src/components/layout/Sidebar.jsx
# Then remove import from src/App.jsx line 9

# Remove PriorityLimitModal if confirmed unused
rm src/components/modals/PriorityLimitModal.jsx
# Then remove import from src/App.jsx line 22
# And remove modal rendering at line 1433

echo "✅ Medium priority cleanup complete!"
```

### Update App.jsx Imports
After deletions, remove these import statements from `src/App.jsx`:
```javascript
// Line 9 - Remove if Sidebar deleted
import Sidebar from './components/layout/Sidebar';

// Line 22 - Remove if PriorityLimitModal deleted
import PriorityLimitModal from './components/modals/PriorityLimitModal';
```

---

## 📊 Cleanup Impact Summary

### Code Reduction
- **Frontend:** ~200+ lines (3 components)
- **Backend:** ~100+ lines (4 debug scripts)
- **Old code:** 32KB directory (old architecture)
- **Total:** ~400 lines + 32KB

### Benefits
- Reduced codebase size by ~10-15%
- Easier code navigation
- Faster builds (fewer files to process)
- Clearer architecture
- Less maintenance burden

### Risk Assessment
- **Risk Level:** LOW
- **Testing Required:** Basic smoke test after deletion
- **Rollback:** Git history preserves all deleted files

---

## ⚠️ Important Notes

1. **Test After Cleanup:** Run the app and test basic functionality after deletions
2. **Git Commit:** Make cleanup a separate commit for easy rollback if needed
3. **Imports:** Remember to remove import statements after deleting files
4. **Production Impact:** None - these files are not used in production code
5. **Future Cleanup:** Console.log statements (116 in backend) should be addressed as part of technical debt refactor (see FEATURES.md)

---

## 🔄 Related Documentation

- See **FEATURES.md** lines 815-820 for technical debt related to unused GraphApiService
- See **FEATURES.md** lines 914-919 for debug files mentioned in technical debt
- See **FEATURES.md** lines 772-791 for backend refactoring recommendations

---

**Next Steps:**
1. Review this document and approve deletions
2. Create a git branch for cleanup: `git checkout -b cleanup/unused-files`
3. Run high priority cleanup commands
4. Verify medium priority files
5. Test application thoroughly
6. Commit and merge cleanup branch
