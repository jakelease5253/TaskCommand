import { useState, useEffect, useRef } from 'react';
import { useAuth } from './hooks/useAuth';
import { useTasks } from './hooks/useTasks';
import { useTimer } from './hooks/useTimer';

// Component imports
import LoginScreen from './components/auth/LoginScreen';
import AppHeader from './components/layout/AppHeader';
import Sidebar from './components/layout/Sidebar';
import TodaysWins from './features/dashboards/personal/TodaysWins';
import ManagerDashboard from './features/dashboards/manager/ManagerDashboard';
import PlanningView from './features/planning/PlanningView';
import Insights from './features/insights/Insights';
import Settings from './features/settings/Settings';
import FocusTaskCard from './components/focus/FocusTaskCard';
import FilterBar from './components/tasks/FilterBar';
import AllTasksList from './components/tasks/AllTasksList';
import PriorityQueue from './components/tasks/PriorityQueue';
import BulkActionsBar from './components/tasks/BulkActionsBar';
import NewTaskModal from './components/tasks/NewTaskModal';
import EditTaskModal from './components/tasks/EditTaskModal';
import PriorityLimitModal from './components/modals/PriorityLimitModal';
import GoalSettingsModal from './components/modals/GoalSettingsModal';
import BulkAssigneeModal from './components/modals/BulkAssigneeModal';
import BulkMoveModal from './components/modals/BulkMoveModal';
import BulkDueDateModal from './components/modals/BulkDueDateModal';

function App() {
  const auth = useAuth();
  const taskManager = useTasks(auth.accessToken);
  const focusTimer = useTimer();
  
  // Track if we've done the initial data fetch
  const hasFetchedData = useRef(false);

  // Focus task state
  const [focusTask, setFocusTask] = useState(null);
  const [focusTaskDetails, setFocusTaskDetails] = useState(null);
  
  // Store focus time per task (taskId -> seconds)
  const [taskFocusTimes, setTaskFocusTimes] = useState({});

  // UI state
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingTaskDetails, setEditingTaskDetails] = useState(null);
  const [currentView, setCurrentView] = useState(() => {
    // Restore last view from localStorage, default to 'personal'
    const savedView = localStorage.getItem('taskcommand_current_view');
    return savedView || 'personal';
  });
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showMetrics, setShowMetrics] = useState(true); // For collapsible metrics on personal view
  const [focusMode, setFocusMode] = useState(false); // Immersive focus mode
  const [focusModeTransitioning, setFocusModeTransitioning] = useState(false); // Transition state
  const [allTasksCollapsed, setAllTasksCollapsed] = useState(() => {
    const saved = localStorage.getItem('taskcommand_all_tasks_collapsed');
    return saved === 'true';
  });
  const [showPriorityLimitModal, setShowPriorityLimitModal] = useState(false);
  const [showGoalSettingsModal, setShowGoalSettingsModal] = useState(false);
  const [showBulkAssigneeModal, setShowBulkAssigneeModal] = useState(false);
  const [showBulkMoveModal, setShowBulkMoveModal] = useState(false);
  const [showBulkDueDateModal, setShowBulkDueDateModal] = useState(false);

  // Multi-select for bulk operations
  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set());

  // Priority Queue (max 7 tasks)
  const [priorityQueue, setPriorityQueue] = useState([]);

  // Filtering and sorting
  const [sortBy, setSortBy] = useState(() => {
    const saved = localStorage.getItem('taskSortBy');
    return saved || 'dueDate';
  });
  const [filters, setFilters] = useState(() => {
    const saved = localStorage.getItem('taskFilters');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Error loading filters:', err);
      }
    }
    return {
      priority: '',
      planId: '',
      dateRange: '',
      customStartDate: '',
      customEndDate: ''
    };
  });

  // Pagination for All Tasks
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 10;
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragSource, setDragSource] = useState(null); // 'all' or 'priority'

  // Dashboard
  const [dateRange, setDateRange] = useState('7days');
  const [completedTasksHistory, setCompletedTasksHistory] = useState([]);

  // Work hours for each day of the week
  const [workHours, setWorkHours] = useState(() => {
    const saved = localStorage.getItem('taskcommand_work_hours');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Error loading work hours:', err);
      }
    }
    return {
      monday: { start: '09:00', end: '17:00', enabled: true },
      tuesday: { start: '09:00', end: '17:00', enabled: true },
      wednesday: { start: '09:00', end: '17:00', enabled: true },
      thursday: { start: '09:00', end: '17:00', enabled: true },
      friday: { start: '09:00', end: '17:00', enabled: true },
      saturday: { start: '09:00', end: '17:00', enabled: false },
      sunday: { start: '09:00', end: '17:00', enabled: false }
    };
  });

  // Daily goals for each day of the week (morning tasks, afternoon tasks, focus time)
  const [dailyGoals, setDailyGoals] = useState(() => {
    const saved = localStorage.getItem('taskcommand_daily_goals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Error loading daily goals:', err);
      }
    }
    return {
      monday: { morningTasks: 3, afternoonTasks: 4, focusTime: 120 },
      tuesday: { morningTasks: 3, afternoonTasks: 4, focusTime: 120 },
      wednesday: { morningTasks: 3, afternoonTasks: 4, focusTime: 120 },
      thursday: { morningTasks: 3, afternoonTasks: 4, focusTime: 120 },
      friday: { morningTasks: 3, afternoonTasks: 4, focusTime: 120 },
      saturday: { morningTasks: 0, afternoonTasks: 0, focusTime: 0 },
      sunday: { morningTasks: 0, afternoonTasks: 0, focusTime: 0 }
    };
  });

  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load task focus times from localStorage
  useEffect(() => {
    const savedTimes = localStorage.getItem('taskFocusTimes');
    if (savedTimes) {
      try {
        setTaskFocusTimes(JSON.parse(savedTimes));
      } catch (err) {
        console.error('Error loading task focus times:', err);
      }
    }
  }, []);

  // Save current view to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('taskcommand_current_view', currentView);
  }, [currentView]);

  // Save all tasks collapsed state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('taskcommand_all_tasks_collapsed', allTasksCollapsed.toString());
  }, [allTasksCollapsed]);

  // Save work hours to localStorage
  useEffect(() => {
    localStorage.setItem('taskcommand_work_hours', JSON.stringify(workHours));
  }, [workHours]);

  // Save daily goals to localStorage
  useEffect(() => {
    localStorage.setItem('taskcommand_daily_goals', JSON.stringify(dailyGoals));
  }, [dailyGoals]);

  // Save task focus times to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(taskFocusTimes).length > 0) {
      localStorage.setItem('taskFocusTimes', JSON.stringify(taskFocusTimes));
    }
  }, [taskFocusTimes]);

  // Update the current focused task's time whenever the timer ticks
  useEffect(() => {
    if (focusTask && focusTimer.isRunning) {
      setTaskFocusTimes(prev => ({
        ...prev,
        [focusTask.id]: focusTimer.elapsed
      }));
    }
  }, [focusTimer.elapsed, focusTask]);

  // Load completed tasks history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('completedTasksHistory');
    if (savedHistory) {
      try {
        setCompletedTasksHistory(JSON.parse(savedHistory));
      } catch (err) {
        console.error('Error loading completed tasks history:', err);
      }
    }
  }, []);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('taskFilters', JSON.stringify(filters));
  }, [filters]);

  // Save sortBy to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('taskSortBy', sortBy);
  }, [sortBy]);

  // Reset to page 1 when filters or sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy]);

  // Load priority queue from localStorage
  const [priorityQueueLoaded, setPriorityQueueLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('priorityQueue');
    if (saved) {
      try {
        setPriorityQueue(JSON.parse(saved));
      } catch (err) {
        console.error('Error loading priority queue:', err);
      }
    }
    // Mark as loaded even if there was nothing in storage
    setPriorityQueueLoaded(true);
  }, []);

  // Save priority queue to localStorage (but not on initial render before load completes)
  useEffect(() => {
    if (priorityQueueLoaded) {
      localStorage.setItem('priorityQueue', JSON.stringify(priorityQueue));
    }
  }, [priorityQueue, priorityQueueLoaded]);

  // Load focus task from localStorage
  useEffect(() => {
    const savedFocusTask = localStorage.getItem('focusTask');
    const savedFocusTaskDetails = localStorage.getItem('focusTaskDetails');
    const savedFocusTimerRunning = localStorage.getItem('focusTimerRunning');

    if (savedFocusTask) {
      try {
        const task = JSON.parse(savedFocusTask);
        setFocusTask(task);

        // Restore task details if available
        if (savedFocusTaskDetails) {
          setFocusTaskDetails(JSON.parse(savedFocusTaskDetails));
        }

        // Restore the timer if there was saved focus time for this task
        const savedTimes = localStorage.getItem('taskFocusTimes');
        if (savedTimes) {
          const times = JSON.parse(savedTimes);
          if (times[task.id]) {
            focusTimer.setElapsed(times[task.id]);
            // Resume timer if it was running before refresh
            if (savedFocusTimerRunning === 'true') {
              focusTimer.setStartTime(Date.now() - (times[task.id] * 1000));
              focusTimer.setIsRunning(true);
            }
          }
        }
      } catch (err) {
        console.error('Error loading focus task:', err);
      }
    }
  }, []);

  // Save focus task to localStorage whenever it changes
  useEffect(() => {
    if (focusTask) {
      localStorage.setItem('focusTask', JSON.stringify(focusTask));
      if (focusTaskDetails) {
        localStorage.setItem('focusTaskDetails', JSON.stringify(focusTaskDetails));
      }
      // Save timer running state
      localStorage.setItem('focusTimerRunning', focusTimer.isRunning.toString());
    } else {
      // Clear localStorage when focus task is cleared
      localStorage.removeItem('focusTask');
      localStorage.removeItem('focusTaskDetails');
      localStorage.removeItem('focusTimerRunning');
    }
  }, [focusTask, focusTaskDetails, focusTimer.isRunning]);

  // Fetch user profile and tasks when authenticated
  useEffect(() => {
    if (auth.isAuthenticated && auth.accessToken && !hasFetchedData.current) {
      hasFetchedData.current = true;
      auth.fetchUserProfile();
      taskManager.fetchAllTasks();
    }
  }, [auth.isAuthenticated, auth.accessToken]);

  // Helper functions
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getBucketName = (task) => {
    const planBuckets = taskManager.buckets[task.planId] || [];
    const bucket = planBuckets.find(b => b.id === task.bucketId);
    return bucket ? bucket.name : 'No Bucket';
  };

  const getPriorityLabel = (priority) => {
    const labels = {1: 'Urgent', 3: 'Important', 5: 'Medium', 9: 'Low'};
    return labels[priority] || 'Medium';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      1: 'bg-red-100 text-red-700',
      3: 'bg-orange-100 text-orange-700',
      5: 'bg-blue-100 text-blue-700',
      9: 'bg-slate-100 text-slate-700'
    };
    return colors[priority] || 'bg-blue-100 text-blue-700';
  };

  const isOverdue = (task) => {
    if (!task.dueDateTime) return false;
    const dueDateStr = task.dueDateTime.split('T')[0];
    const dueDate = new Date(dueDateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today && task.percentComplete < 100;
  };

  const getDaysUntilDue = (task) => {
    if (!task.dueDateTime) return null;
    const dueDate = new Date(task.dueDateTime);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filterAndSortTasks = (tasksToFilter) => {
    let filtered = tasksToFilter.filter(task => task.percentComplete < 100);

    // Apply filters
    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === parseInt(filters.priority));
    }

    if (filters.planId) {
      filtered = filtered.filter(task => task.planId === filters.planId);
    }

    if (filters.dateRange) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filtered = filtered.filter(task => {
        if (filters.dateRange === 'none') {
          return !task.dueDateTime;
        }
        if (!task.dueDateTime) return false;

        const dueDateStr = task.dueDateTime.split('T')[0];
        const dueDate = new Date(dueDateStr + 'T00:00:00');
        dueDate.setHours(0, 0, 0, 0);

        switch (filters.dateRange) {
          case 'overdue':
            return dueDate < today;
          case 'today':
            return dueDate.getTime() === today.getTime();
          case 'week':
            const weekFromNow = new Date(today);
            weekFromNow.setDate(weekFromNow.getDate() + 7);
            return dueDate >= today && dueDate <= weekFromNow;
          case 'month':
            const monthFromNow = new Date(today);
            monthFromNow.setMonth(monthFromNow.getMonth() + 1);
            return dueDate >= today && dueDate <= monthFromNow;
          case 'custom':
            // Handle custom date range
            const hasStartDate = filters.customStartDate;
            const hasEndDate = filters.customEndDate;

            if (!hasStartDate && !hasEndDate) {
              return true; // No custom dates set, show all
            }

            if (hasStartDate && hasEndDate) {
              const startDate = new Date(filters.customStartDate + 'T00:00:00');
              const endDate = new Date(filters.customEndDate + 'T00:00:00');
              startDate.setHours(0, 0, 0, 0);
              endDate.setHours(0, 0, 0, 0);
              return dueDate >= startDate && dueDate <= endDate;
            }

            if (hasStartDate) {
              const startDate = new Date(filters.customStartDate + 'T00:00:00');
              startDate.setHours(0, 0, 0, 0);
              return dueDate >= startDate;
            }

            if (hasEndDate) {
              const endDate = new Date(filters.customEndDate + 'T00:00:00');
              endDate.setHours(0, 0, 0, 0);
              return dueDate <= endDate;
            }

            return true;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        return (a.priority || 5) - (b.priority || 5);
      } else if (sortBy === 'dueDate') {
        if (!a.dueDateTime && !b.dueDateTime) return 0;
        if (!a.dueDateTime) return 1;
        if (!b.dueDateTime) return -1;
        return new Date(a.dueDateTime) - new Date(b.dueDateTime);
      }
      return 0;
    });

    return filtered;
  };

  // Task actions
  const handleCompleteTask = async (taskId) => {
    try {
      const task = await taskManager.completeTask(taskId);
      
      if (task) {
        const completedTask = {
          ...task,
          completedDateTime: new Date().toISOString(),
          percentComplete: 100,
          focusTime: taskFocusTimes[taskId] || 0
        };
        
        const updatedHistory = [completedTask, ...completedTasksHistory];
        setCompletedTasksHistory(updatedHistory);
        localStorage.setItem('completedTasksHistory', JSON.stringify(updatedHistory));
        
        // Clean up the focus time for this task
        setTaskFocusTimes(prev => {
          const updated = { ...prev };
          delete updated[taskId];
          return updated;
        });

        // Remove from priority queue if present
        setPriorityQueue(prev => prev.filter(id => id !== taskId));
      }

      if (focusTask?.id === taskId) {
        setFocusTask(null);
        focusTimer.stop();
        setFocusMode(false); // Exit focus mode when completing the focused task
      }

      // No need to refetch - completeTask already handles optimistic update
      // await taskManager.fetchAllTasks();
    } catch (err) {
      console.error('Error completing task:', err);
      // On error, refetch to restore correct state
      await taskManager.fetchAllTasks();
    }
  };

  const handleSetFocusTask = async (task) => {
    if (focusTask?.id === task.id) {
      // Unfocusing - save the current time and stop the timer
      setTaskFocusTimes(prev => ({
        ...prev,
        [task.id]: focusTimer.elapsed
      }));
      setFocusTask(null);
      setFocusTaskDetails(null);
      focusTimer.stop();
      setFocusMode(false); // Exit focus mode when unfocusing
    } else {
      // Switching focus - save current task's time if there is one
      if (focusTask) {
        setTaskFocusTimes(prev => ({
          ...prev,
          [focusTask.id]: focusTimer.elapsed
        }));
      }

      // Focus new task - resume from saved time or start fresh
      setFocusTask(task);
      const savedTime = taskFocusTimes[task.id] || 0;

      // Set elapsed and startTime together to avoid race condition
      focusTimer.setElapsed(savedTime);
      focusTimer.setStartTime(Date.now() - (savedTime * 1000));
      focusTimer.setIsRunning(true);

      // Fetch task details (including description)
      const details = await taskManager.fetchTaskDetails(task.id);
      setFocusTaskDetails(details);
      // Don't auto-enter focus mode - let user choose
    }
  };

  const handleEnterFocusMode = () => {
    // Start fade-out transition
    setFocusModeTransitioning(true);

    // Wait for fade-out animation to complete (800ms), then show focus mode
    setTimeout(() => {
      setFocusMode(true);
      setFocusModeTransitioning(false);
    }, 800);
  };


  const handleEditTask = async (task) => {
    setEditingTask(task);
    const details = await taskManager.fetchTaskDetails(task.id);
    setEditingTaskDetails(details);
  };

  const handleToggleAllTasksCollapse = () => {
    setAllTasksCollapsed(prev => !prev);
  };

  // Multi-select handlers
  const handleToggleTaskSelection = (taskId) => {
    setSelectedTaskIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (taskIds) => {
    setSelectedTaskIds(new Set(taskIds));
  };

  const handleClearSelection = () => {
    setSelectedTaskIds(new Set());
  };

  const handleBulkComplete = async (taskIds) => {
    const idsArray = Array.isArray(taskIds) ? taskIds : Array.from(taskIds);
    const successfulIds = [];
    for (const taskId of idsArray) {
      try {
        await handleCompleteTask(taskId);
        successfulIds.push(taskId);
      } catch (err) {
        console.error(`Failed to complete task ${taskId}:`, err);
      }
    }
    // Clear selection for successfully completed tasks
    setSelectedTaskIds(prev => {
      const newSet = new Set(prev);
      successfulIds.forEach(id => newSet.delete(id));
      return newSet;
    });

    // Show success message
    if (successfulIds.length > 0) {
      showToast(`Completed ${successfulIds.length} task${successfulIds.length > 1 ? 's' : ''}`, 'success');
    }
    if (successfulIds.length < idsArray.length) {
      showToast(`Failed to complete ${idsArray.length - successfulIds.length} task${idsArray.length - successfulIds.length > 1 ? 's' : ''}`, 'error');
    }
  };

  const handleBulkPriority = async (priority) => {
    const idsArray = Array.from(selectedTaskIds);
    const successfulIds = [];

    for (const taskId of idsArray) {
      try {
        // Fetch fresh task to get current etag
        const taskResponse = await fetch(
          `https://graph.microsoft.com/v1.0/planner/tasks/${taskId}`,
          {
            headers: { 'Authorization': `Bearer ${auth.accessToken}` }
          }
        );
        const freshTask = await taskResponse.json();

        // Update priority using fresh etag
        await fetch(
          `https://graph.microsoft.com/v1.0/planner/tasks/${taskId}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${auth.accessToken}`,
              'Content-Type': 'application/json',
              'If-Match': freshTask['@odata.etag']
            },
            body: JSON.stringify({ priority })
          }
        );

        successfulIds.push(taskId);
      } catch (err) {
        console.error(`Failed to update priority for task ${taskId}:`, err);
      }
    }

    // Refresh tasks to show updated priorities
    if (successfulIds.length > 0) {
      await taskManager.fetchAllTasks();

      // Clear selection for successfully updated tasks
      setSelectedTaskIds(prev => {
        const newSet = new Set(prev);
        successfulIds.forEach(id => newSet.delete(id));
        return newSet;
      });

      const priorityNames = { 1: 'Urgent', 3: 'Important', 5: 'Medium', 9: 'Low' };
      showToast(`Updated priority to ${priorityNames[priority]} for ${successfulIds.length} task${successfulIds.length > 1 ? 's' : ''}`, 'success');
    }
    if (successfulIds.length < idsArray.length) {
      showToast(`Failed to update ${idsArray.length - successfulIds.length} task${idsArray.length - successfulIds.length > 1 ? 's' : ''}`, 'error');
    }
  };

  const handleBulkDueDate = async (dateInput) => {
    let dueDateTime = null;

    // If dateInput is not null, convert to ISO format
    if (dateInput) {
      try {
        const [year, month, day] = dateInput.split('-');
        const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0));
        dueDateTime = date.toISOString();
      } catch (err) {
        showToast('Invalid date format', 'error');
        return;
      }
    }

    const idsArray = Array.from(selectedTaskIds);
    const successfulIds = [];

    for (const taskId of idsArray) {
      try {
        // Fetch fresh task to get current etag
        const taskResponse = await fetch(
          `https://graph.microsoft.com/v1.0/planner/tasks/${taskId}`,
          {
            headers: { 'Authorization': `Bearer ${auth.accessToken}` }
          }
        );
        const freshTask = await taskResponse.json();

        // Update due date using fresh etag
        await fetch(
          `https://graph.microsoft.com/v1.0/planner/tasks/${taskId}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${auth.accessToken}`,
              'Content-Type': 'application/json',
              'If-Match': freshTask['@odata.etag']
            },
            body: JSON.stringify({ dueDateTime })
          }
        );

        successfulIds.push(taskId);
      } catch (err) {
        console.error(`Failed to update due date for task ${taskId}:`, err);
      }
    }

    // Refresh tasks to show updated due dates
    if (successfulIds.length > 0) {
      await taskManager.fetchAllTasks();

      // Clear selection for successfully updated tasks
      setSelectedTaskIds(prev => {
        const newSet = new Set(prev);
        successfulIds.forEach(id => newSet.delete(id));
        return newSet;
      });

      const message = dueDateTime
        ? `Updated due date for ${successfulIds.length} task${successfulIds.length > 1 ? 's' : ''}`
        : `Cleared due date for ${successfulIds.length} task${successfulIds.length > 1 ? 's' : ''}`;
      showToast(message, 'success');
    }
    if (successfulIds.length < idsArray.length) {
      showToast(`Failed to update ${idsArray.length - successfulIds.length} task${idsArray.length - successfulIds.length > 1 ? 's' : ''}`, 'error');
    }
  };

  const handleBulkAssignee = async (selectedUserIds) => {
    const idsArray = Array.from(selectedTaskIds);
    const successfulIds = [];
    const userIdsArray = Array.from(selectedUserIds);

    for (const taskId of idsArray) {
      try {
        // Fetch fresh task to get current etag
        const taskResponse = await fetch(
          `https://graph.microsoft.com/v1.0/planner/tasks/${taskId}`,
          {
            headers: { 'Authorization': `Bearer ${auth.accessToken}` }
          }
        );
        const freshTask = await taskResponse.json();

        // Build assignments object
        const assignments = {};

        // First, clear all existing assignments
        Object.keys(freshTask.assignments || {}).forEach(userId => {
          assignments[userId] = null;
        });

        // Then add new assignments
        userIdsArray.forEach(userId => {
          assignments[userId] = {
            '@odata.type': '#microsoft.graph.plannerAssignment',
            orderHint: ' !'
          };
        });

        // Update assignments using fresh etag
        await fetch(
          `https://graph.microsoft.com/v1.0/planner/tasks/${taskId}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${auth.accessToken}`,
              'Content-Type': 'application/json',
              'If-Match': freshTask['@odata.etag']
            },
            body: JSON.stringify({ assignments })
          }
        );

        successfulIds.push(taskId);
      } catch (err) {
        console.error(`Failed to update assignees for task ${taskId}:`, err);
      }
    }

    // Refresh tasks to show updated assignments
    if (successfulIds.length > 0) {
      await taskManager.fetchAllTasks();

      // Clear selection for successfully updated tasks
      setSelectedTaskIds(prev => {
        const newSet = new Set(prev);
        successfulIds.forEach(id => newSet.delete(id));
        return newSet;
      });

      if (userIdsArray.length === 0) {
        showToast(`Cleared assignees for ${successfulIds.length} task${successfulIds.length > 1 ? 's' : ''}`, 'success');
      } else {
        showToast(`Assigned ${successfulIds.length} task${successfulIds.length > 1 ? 's' : ''} to ${userIdsArray.length} user${userIdsArray.length > 1 ? 's' : ''}`, 'success');
      }
    }
    if (successfulIds.length < idsArray.length) {
      showToast(`Failed to update ${idsArray.length - successfulIds.length} task${idsArray.length - successfulIds.length > 1 ? 's' : ''}`, 'error');
    }
  };

  const handleBulkMove = async (selectedPlanId, selectedBucketId) => {
    const selectedPlanName = taskManager.plans[selectedPlanId];
    const idsArray = Array.from(selectedTaskIds);
    const successfulIds = [];

    for (const taskId of idsArray) {
      try {
        // Fetch fresh task to get current etag
        const taskResponse = await fetch(
          `https://graph.microsoft.com/v1.0/planner/tasks/${taskId}`,
          {
            headers: { 'Authorization': `Bearer ${auth.accessToken}` }
          }
        );
        const freshTask = await taskResponse.json();

        // Update plan and bucket using fresh etag
        await fetch(
          `https://graph.microsoft.com/v1.0/planner/tasks/${taskId}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${auth.accessToken}`,
              'Content-Type': 'application/json',
              'If-Match': freshTask['@odata.etag']
            },
            body: JSON.stringify({
              planId: selectedPlanId,
              bucketId: selectedBucketId
            })
          }
        );

        successfulIds.push(taskId);
      } catch (err) {
        console.error(`Failed to move task ${taskId}:`, err);
      }
    }

    // Refresh tasks to show updated locations
    if (successfulIds.length > 0) {
      await taskManager.fetchAllTasks();

      // Clear selection for successfully moved tasks
      setSelectedTaskIds(prev => {
        const newSet = new Set(prev);
        successfulIds.forEach(id => newSet.delete(id));
        return newSet;
      });

      showToast(`Moved ${successfulIds.length} task${successfulIds.length > 1 ? 's' : ''} to ${selectedPlanName}`, 'success');
    }
    if (successfulIds.length < idsArray.length) {
      showToast(`Failed to move ${idsArray.length - successfulIds.length} task${idsArray.length - successfulIds.length > 1 ? 's' : ''}`, 'error');
    }
  };

  // Priority Queue actions
  const addToPriorityQueue = (taskId) => {
    if (priorityQueue.length >= 7) {
      setShowPriorityLimitModal(true);
      return false;
    }
    if (!priorityQueue.includes(taskId)) {
      setPriorityQueue([...priorityQueue, taskId]);
    }
    return true;
  };

  const removeFromPriorityQueue = (taskId) => {
    setPriorityQueue(prev => prev.filter(id => id !== taskId));
  };

  const reorderPriorityQueue = (draggedTaskId, targetTaskId) => {
    const draggedIndex = priorityQueue.indexOf(draggedTaskId);
    const targetIndex = priorityQueue.indexOf(targetTaskId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newQueue = [...priorityQueue];
    newQueue.splice(draggedIndex, 1);
    newQueue.splice(targetIndex, 0, draggedTaskId);
    setPriorityQueue(newQueue);
  };

  // Handler for Planning View to update priority queue (receives task objects, converts to IDs)
  const handleUpdatePriorityQueueFromPlanning = (taskArray) => {
    const taskIds = taskArray.map(task => task.id);
    setPriorityQueue(taskIds);
    showToast('Priority queue updated', 'success');
  };

  // Drag and drop handlers
  const handleDragStart = (task, source) => {
    setDraggedTask(task);
    setDragSource(source);
  };

  const handleDragOver = (e, targetTask, targetSource) => {
    e.preventDefault();
    if (!draggedTask || draggedTask.id === targetTask.id) return;

    // Reordering within priority queue
    if (dragSource === 'priority' && targetSource === 'priority') {
      reorderPriorityQueue(draggedTask.id, targetTask.id);
    }
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragSource(null);
  };

  const handleDrop = (e, targetSource) => {
    e.preventDefault();
    if (!draggedTask) return;

    // Dragging from all tasks to priority queue
    if (dragSource === 'all' && targetSource === 'priority') {
      addToPriorityQueue(draggedTask.id);
    }
    // Dragging from priority back to all (remove from priority)
    else if (dragSource === 'priority' && targetSource === 'all') {
      removeFromPriorityQueue(draggedTask.id);
    }

    handleDragEnd();
  };

  // Dashboard metrics
  const getDateRangeStart = () => {
    const now = new Date();
    switch (dateRange) {
      case '7days':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30days':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90days':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default:
        return new Date(0);
    }
  };

  const getFilteredCompletedTasks = () => {
    const startDate = getDateRangeStart();
    return completedTasksHistory.filter(task => {
      const completedDate = new Date(task.completedDateTime);
      return completedDate >= startDate;
    });
  };

  const calculateStreak = () => {
    if (completedTasksHistory.length === 0) return 0;

    const sortedTasks = [...completedTasksHistory].sort((a, b) => 
      new Date(b.completedDateTime) - new Date(a.completedDateTime)
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const task of sortedTasks) {
      const taskDate = new Date(task.completedDateTime);
      taskDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((currentDate - taskDate) / (1000 * 60 * 60 * 24));

      if (daysDiff === streak) {
        streak++;
      } else if (daysDiff > streak) {
        break;
      }
    }

    return streak;
  };

  // Helper function to get morning cutoff time for a given day
  const getMorningCutoffForDay = (dayName) => {
    const dayWorkHours = workHours[dayName];
    if (!dayWorkHours || !dayWorkHours.enabled) return 12; // default to noon if no work hours

    // Parse start and end times
    const [startHour, startMin] = dayWorkHours.start.split(':').map(Number);
    const [endHour, endMin] = dayWorkHours.end.split(':').map(Number);

    // Calculate total minutes in work day
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const totalMinutes = endMinutes - startMinutes;

    // Midpoint is half the work day
    const midpointMinutes = startMinutes + (totalMinutes / 2);
    const midpointHour = Math.floor(midpointMinutes / 60);

    return midpointHour;
  };

  const calculateTodaysWins = () => {
    // Get today's date range (start of day to now)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's day name (monday, tuesday, etc.)
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayDayName = dayNames[new Date().getDay()];
    const todayGoals = dailyGoals[todayDayName];
    const morningCutoffHour = getMorningCutoffForDay(todayDayName);

    // Filter completed tasks for today only
    const todaysTasks = completedTasksHistory.filter(task => {
      const completedDate = new Date(task.completedDateTime);
      return completedDate >= today;
    });

    const todayCompleted = todaysTasks.length;

    // Calculate total focus time for today (in minutes)
    const totalFocusTime = todaysTasks.reduce((sum, task) => {
      return sum + (task.focusTime || 0);
    }, 0);
    const focusTime = Math.round(totalFocusTime / 60);

    // Calculate morning vs afternoon split
    const morningWins = todaysTasks.filter(task => {
      const hour = new Date(task.completedDateTime).getHours();
      return hour < morningCutoffHour;
    }).length;

    const afternoonWins = todayCompleted - morningWins;

    // Calculate how many priority queue tasks were completed today
    const priorityTaskIds = priorityQueue;
    const priorityCompleted = todaysTasks.filter(task =>
      priorityTaskIds.includes(task.id)
    ).length;
    const priorityTotal = priorityQueue.length;

    const currentStreak = calculateStreak();

    // Calculate daily goal (morning + afternoon tasks for today)
    const dailyGoal = todayGoals.morningTasks + todayGoals.afternoonTasks;
    const focusTimeGoal = todayGoals.focusTime;

    return {
      todayCompleted,
      dailyGoal,
      focusTime,
      focusTimeGoal,
      priorityCompleted,
      priorityTotal,
      morningWins,
      afternoonWins,
      morningGoal: todayGoals.morningTasks,
      afternoonGoal: todayGoals.afternoonTasks,
      currentStreak,
    };
  };

  if (!auth.isAuthenticated) {
    return <LoginScreen onLogin={auth.handleLogin} loading={auth.loading} />;
  }

  const filteredTasks = filterAndSortTasks(taskManager.tasks);

  // Calculate pagination
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
  const startIndex = (currentPage - 1) * tasksPerPage;
  const endIndex = startIndex + tasksPerPage;
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

  const priorityTasks = priorityQueue
    .map(id => taskManager.tasks.find(t => t.id === id))
    .filter(Boolean);
  const todaysWinsMetrics = calculateTodaysWins();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hide header and sidebar in focus mode */}
      {!focusMode && (
        <>
          <AppHeader
            userName={auth.user?.displayName || 'User'}
            profileImage={auth.user?.photo}
            sidebarExpanded={sidebarExpanded}
          />
          <Sidebar
            currentView={currentView}
            onNavigate={setCurrentView}
            onLogout={auth.handleLogout}
            isExpanded={sidebarExpanded}
            onToggle={() => setSidebarExpanded(!sidebarExpanded)}
            onRefresh={taskManager.fetchAllTasks}
            onNewTask={() => setShowNewTaskModal(true)}
            loading={taskManager.loading}
          />
        </>
      )}

      <main
        className={`${focusMode ? 'min-h-screen flex items-center justify-center' : 'max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}
        style={{
          paddingTop: focusMode ? '0' : '72px',
          paddingLeft: focusMode ? '0' : (sidebarExpanded ? '274px' : '100px'),
          transition: 'padding-left 0.3s ease',
        }}
      >
        {taskManager.error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 mb-1">Error</h3>
              <p className="text-sm text-red-700">{taskManager.error}</p>
            </div>
            <button onClick={() => taskManager.setError(null)} className="flex-shrink-0 text-red-400 hover:text-red-600">
              ×
            </button>
          </div>
        )}

        {/* FOCUS MODE - Immersive view */}
        {focusMode && focusTask && currentView === 'personal' && (
          <div className="w-full max-w-4xl px-4 focus-mode-enter">
            {/* Exit Focus Mode Button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setFocusMode(false)}
                className="px-6 py-3 bg-white text-slate-700 rounded-xl shadow-lg hover:shadow-xl transition-all font-medium border border-slate-200 hover:border-indigo-300"
              >
                ← Exit Focus Mode
              </button>
            </div>

            {/* Centered Focus Task */}
            <FocusTaskCard
              task={{...focusTask, description: focusTaskDetails?.description}}
              checklist={focusTaskDetails?.checklist || {}}
              detailsEtag={focusTaskDetails?.['@odata.etag']}
              accessToken={auth.accessToken}
              elapsed={focusTimer.elapsed}
              planName={taskManager.plans[focusTask.planId]}
              bucketName={getBucketName(focusTask)}
              onComplete={() => handleCompleteTask(focusTask.id)}
              onEdit={handleEditTask}
              onUnfocus={handleSetFocusTask}
              formatTime={formatTime}
              onChecklistUpdate={async () => {
                // Refresh task details after checklist update
                const details = await taskManager.fetchTaskDetails(focusTask.id);
                setFocusTaskDetails(details);
              }}
            />

            {/* Mini Today Summary */}
            <div className="mt-6 text-center text-slate-600 text-sm">
              Today: {todaysWinsMetrics.todayCompleted} completed
              {todaysWinsMetrics.currentStreak > 0 && (
                <span className="ml-3">{todaysWinsMetrics.currentStreak > 2 ? '🔥' : '✨'} {todaysWinsMetrics.currentStreak} day streak</span>
              )}
              {todaysWinsMetrics.focusTime > 0 && (
                <span className="ml-3">⏱️ {todaysWinsMetrics.focusTime}m focused</span>
              )}
            </div>
          </div>
        )}

        {/* NORMAL MODE - Personal Tasks View */}
        {!focusMode && currentView === 'personal' && (
          <div className={focusModeTransitioning ? 'focus-mode-exit' : ''}>
            {/* Collapsible Today's Wins */}
            {showMetrics ? (
              <TodaysWins
                metrics={todaysWinsMetrics}
                onToggleCollapse={() => setShowMetrics(false)}
                onOpenSettings={() => setShowGoalSettingsModal(true)}
              />
            ) : (
              <div className="mb-8 flex justify-center">
                <button
                  onClick={() => setShowMetrics(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                  Show Today's Wins
                </button>
              </div>
            )}

            {focusTask && (
              <FocusTaskCard
                task={{...focusTask, description: focusTaskDetails?.description}}
                checklist={focusTaskDetails?.checklist || {}}
                detailsEtag={focusTaskDetails?.['@odata.etag']}
                accessToken={auth.accessToken}
                elapsed={focusTimer.elapsed}
                planName={taskManager.plans[focusTask.planId]}
                bucketName={getBucketName(focusTask)}
                onComplete={() => handleCompleteTask(focusTask.id)}
                onEdit={handleEditTask}
                onUnfocus={handleSetFocusTask}
                onEnterFocusMode={handleEnterFocusMode}
                formatTime={formatTime}
                onChecklistUpdate={async () => {
                  // Refresh task details after checklist update
                  const details = await taskManager.fetchTaskDetails(focusTask.id);
                  setFocusTaskDetails(details);
                }}
              />
            )}

            {/* Stacked Layout */}
            <div className="space-y-6">
              {/* Priority Queue - Full Width */}
              <div
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={(e) => handleDrop(e, 'priority')}
              >
                <PriorityQueue
                  priorityTasks={priorityTasks}
                  plans={taskManager.plans}
                  buckets={taskManager.buckets}
                  userProfiles={taskManager.userProfiles}
                  focusTask={focusTask}
                  onRemoveFromPriority={removeFromPriorityQueue}
                  onReorder={reorderPriorityQueue}
                  onSetFocus={handleSetFocusTask}
                  onEdit={handleEditTask}
                  onComplete={handleCompleteTask}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                />
              </div>

              {/* All Tasks Section - Full Width */}
              <div className="space-y-4">
                <FilterBar
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  filters={filters}
                  setFilters={setFilters}
                  plans={taskManager.plans}
                  onClearFilters={() => setFilters({ priority: '', planId: '', dateRange: '', customStartDate: '', customEndDate: '' })}
                />

                <div
                  onDragOver={(e) => { e.preventDefault(); }}
                  onDrop={(e) => handleDrop(e, 'all')}
                >
                  <AllTasksList
                    tasks={paginatedTasks}
                    totalTasks={filteredTasks.length}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    loading={taskManager.loading}
                    plans={taskManager.plans}
                    buckets={taskManager.buckets}
                    userProfiles={taskManager.userProfiles}
                    focusTask={focusTask}
                    priorityTaskIds={priorityQueue}
                    isCollapsed={allTasksCollapsed}
                    selectedTaskIds={selectedTaskIds}
                    onToggleCollapse={handleToggleAllTasksCollapse}
                    onToggleSelection={handleToggleTaskSelection}
                    onNewTask={() => setShowNewTaskModal(true)}
                    onSetFocus={handleSetFocusTask}
                    onEdit={handleEditTask}
                    onComplete={handleCompleteTask}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Planning View */}
        {currentView === 'planning' && (
          <PlanningView
            tasks={taskManager.tasks}
            plans={taskManager.plans}
            priorityQueue={priorityTasks}
            onUpdatePriorityQueue={handleUpdatePriorityQueueFromPlanning}
            userProfiles={taskManager.userProfiles}
            accessToken={auth.accessToken}
            loading={taskManager.loading}
            workHours={workHours}
            dailyGoals={dailyGoals}
            onOpenGoalSettings={() => setShowGoalSettingsModal(true)}
          />
        )}

        {/* Insights View */}
        {currentView === 'insights' && (
          <Insights />
        )}

        {/* Manager Dashboard View */}
        {currentView === 'manager' && (
          <ManagerDashboard
            accessToken={auth.accessToken}
            selectedTaskIds={selectedTaskIds}
            onToggleSelection={handleToggleTaskSelection}
            onSelectAll={handleSelectAll}
            onClearSelection={handleClearSelection}
            onEditTask={handleEditTask}
          />
        )}

        {/* Settings View */}
        {currentView === 'settings' && (
          <Settings accessToken={auth.accessToken} user={auth.user} />
        )}
      </main>

      {showNewTaskModal && (
        <NewTaskModal
          accessToken={auth.accessToken}
          plans={taskManager.plans}
          buckets={taskManager.buckets}
          currentUserId={auth.user?.id}
          onClose={() => setShowNewTaskModal(false)}
          onTaskCreated={(newTask) => {
            setShowNewTaskModal(false);
            // Optimistically add the new task to the list
            taskManager.setTasks(prevTasks => [...prevTasks, newTask]);
          }}
        />
      )}

      {editingTask && (
        <EditTaskModal 
          task={{...editingTask, description: editingTaskDetails?.description}}
          accessToken={auth.accessToken}
          plans={taskManager.plans}
          buckets={taskManager.buckets}
          onClose={() => {
            setEditingTask(null);
            setEditingTaskDetails(null);
          }}
          onTaskUpdated={async (updatedTask) => {
            const wasEditingFocusedTask = focusTask && editingTask.id === focusTask.id;
            setEditingTask(null);
            setEditingTaskDetails(null);

            // Optimistically update the task in the tasks array (no full refresh needed)
            taskManager.setTasks(prevTasks =>
              prevTasks.map(t => t.id === updatedTask.id ? updatedTask : t)
            );

            // If we edited the focused task, update focus task state
            if (wasEditingFocusedTask) {
              setFocusTask(updatedTask);
              // Refresh task details (description, checklist) in background
              const details = await taskManager.fetchTaskDetails(updatedTask.id);
              setFocusTaskDetails(details);
            }
          }}
        />
      )}

      <PriorityLimitModal
        isOpen={showPriorityLimitModal}
        onClose={() => setShowPriorityLimitModal(false)}
      />

      <GoalSettingsModal
        isOpen={showGoalSettingsModal}
        onClose={() => setShowGoalSettingsModal(false)}
        workHours={workHours}
        dailyGoals={dailyGoals}
        onSave={({ workHours: newWorkHours, dailyGoals: newDailyGoals }) => {
          setWorkHours(newWorkHours);
          setDailyGoals(newDailyGoals);
        }}
      />

      <BulkActionsBar
        selectedCount={selectedTaskIds.size}
        onClearSelection={handleClearSelection}
        onBulkComplete={() => handleBulkComplete(selectedTaskIds)}
        onBulkPriority={handleBulkPriority}
        onBulkDueDate={() => setShowBulkDueDateModal(true)}
        onBulkAssignee={() => setShowBulkAssigneeModal(true)}
        onBulkMove={() => setShowBulkMoveModal(true)}
      />

      <BulkAssigneeModal
        isOpen={showBulkAssigneeModal}
        selectedTaskIds={selectedTaskIds}
        tasks={taskManager.tasks}
        plans={taskManager.plans}
        accessToken={auth.accessToken}
        onClose={() => setShowBulkAssigneeModal(false)}
        onAssign={handleBulkAssignee}
      />

      <BulkMoveModal
        isOpen={showBulkMoveModal}
        selectedTaskIds={selectedTaskIds}
        plans={taskManager.plans}
        buckets={taskManager.buckets}
        onClose={() => setShowBulkMoveModal(false)}
        onMove={handleBulkMove}
      />

      <BulkDueDateModal
        isOpen={showBulkDueDateModal}
        selectedTaskIds={selectedTaskIds}
        onClose={() => setShowBulkDueDateModal(false)}
        onSetDueDate={handleBulkDueDate}
      />

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default App;