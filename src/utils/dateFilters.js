/**
 * Date filtering utilities for multi-select date range filters
 */

/**
 * Check if a task matches any of the selected date ranges
 * Uses OR logic - task must match at least one selected range
 *
 * @param {Object} task - The task to check
 * @param {string[]} selectedRanges - Array of selected range values: 'all', 'overdue', 'today', 'tomorrow', 'thisWeek', 'nextWeek', 'backlog'
 * @param {string} customStartDate - Custom range start date (YYYY-MM-DD)
 * @param {string} customEndDate - Custom range end date (YYYY-MM-DD)
 * @returns {boolean} - True if task matches any selected range or if no filters active
 */
export function matchesDateRanges(task, selectedRanges = [], customStartDate = '', customEndDate = '') {
  // If 'all' is selected or no filters active, show all tasks
  if (selectedRanges.includes('all') || (selectedRanges.length === 0 && !customStartDate && !customEndDate)) {
    return true;
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Check each selected range - task must match at least ONE (OR logic)
  let matchesAnyRange = false;

  for (const range of selectedRanges) {
    switch (range) {
      case 'backlog':
        // Backlog: no due date set
        if (!task.dueDateTime) {
          matchesAnyRange = true;
        }
        break;

      case 'overdue':
        // Overdue: has due date and it's before today
        if (task.dueDateTime) {
          const dueDate = new Date(task.dueDateTime);
          dueDate.setHours(0, 0, 0, 0);
          if (dueDate < now) {
            matchesAnyRange = true;
          }
        }
        break;

      case 'today':
        // Today: due date is today
        if (task.dueDateTime) {
          const dueDate = new Date(task.dueDateTime);
          dueDate.setHours(0, 0, 0, 0);
          if (dueDate.getTime() === now.getTime()) {
            matchesAnyRange = true;
          }
        }
        break;

      case 'tomorrow':
        // Tomorrow: due date is tomorrow
        if (task.dueDateTime) {
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const dueDate = new Date(task.dueDateTime);
          dueDate.setHours(0, 0, 0, 0);
          if (dueDate.getTime() === tomorrow.getTime()) {
            matchesAnyRange = true;
          }
        }
        break;

      case 'thisWeek':
        // This Week: due date from today through end of this week (7 days from today)
        if (task.dueDateTime) {
          const weekEnd = new Date(now);
          weekEnd.setDate(weekEnd.getDate() + 7);
          const dueDate = new Date(task.dueDateTime);
          dueDate.setHours(0, 0, 0, 0);
          if (dueDate >= now && dueDate <= weekEnd) {
            matchesAnyRange = true;
          }
        }
        break;

      case 'nextWeek':
        // Next Week: due date from 7 days out to 14 days out
        if (task.dueDateTime) {
          const nextWeekStart = new Date(now);
          nextWeekStart.setDate(nextWeekStart.getDate() + 7);
          const nextWeekEnd = new Date(now);
          nextWeekEnd.setDate(nextWeekEnd.getDate() + 14);
          const dueDate = new Date(task.dueDateTime);
          dueDate.setHours(0, 0, 0, 0);
          if (dueDate > nextWeekStart && dueDate <= nextWeekEnd) {
            matchesAnyRange = true;
          }
        }
        break;

      default:
        break;
    }

    // If we found a match, no need to check other ranges
    if (matchesAnyRange) break;
  }

  // Check custom range if specified (as another OR option)
  if (!matchesAnyRange && (customStartDate || customEndDate) && task.dueDateTime) {
    const dueDate = new Date(task.dueDateTime);
    dueDate.setHours(0, 0, 0, 0);

    let matchesCustomRange = true;

    if (customStartDate) {
      const startDate = new Date(customStartDate);
      startDate.setHours(0, 0, 0, 0);
      if (dueDate < startDate) {
        matchesCustomRange = false;
      }
    }

    if (customEndDate && matchesCustomRange) {
      const endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59, 999);
      if (dueDate > endDate) {
        matchesCustomRange = false;
      }
    }

    if (matchesCustomRange) {
      matchesAnyRange = true;
    }
  }

  return matchesAnyRange;
}
