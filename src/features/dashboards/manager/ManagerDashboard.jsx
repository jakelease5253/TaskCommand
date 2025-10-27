import React, { useState, useMemo, useEffect, useRef } from "react";
import { AlertCircle, Users, Calendar, Target, TrendingUp, Archive, Search, X, ChevronUp, ChevronDown, RefreshCw } from "../../../components/ui/icons";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:7071';

export default function ManagerDashboard({
  accessToken,
  onEditTask,
  onCompleteTask,
}) {
  // Backend data state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [companyData, setCompanyData] = useState({
    tasks: [],
    plans: {},
    buckets: {},
    userProfiles: {}
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Filter state
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [dateRange, setDateRange] = useState('all'); // all, overdue, thisWeek, thisMonth, backlog, custom
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Table state
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortDirection, setSortDirection] = useState('asc');

  // Virtual scrolling state
  const [scrollTop, setScrollTop] = useState(0);
  const tableContainerRef = useRef(null);
  const ROW_HEIGHT = 52; // Height of each row in pixels
  const VISIBLE_ROWS = 20; // Number of rows to render at once

  // Fetch company-wide data from backend
  const fetchCompanyTasks = async () => {
    if (!accessToken) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching company-wide tasks from backend...');
      const response = await fetch(`${BACKEND_URL}/api/tasks/company`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Company tasks received:', result);

      setCompanyData({
        tasks: result.data.tasks || [],
        plans: result.data.plans || {},
        buckets: result.data.buckets || {},
        userProfiles: result.data.userProfiles || {}
      });

    } catch (err) {
      console.error('Error fetching company tasks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyTasks();
  }, [accessToken]);

  // Manual refresh without full loading state
  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/tasks/company`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setCompanyData({
          tasks: result.data.tasks || [],
          plans: result.data.plans || {},
          buckets: result.data.buckets || {},
          userProfiles: result.data.userProfiles || {}
        });
      }
    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Get all incomplete tasks for metrics and display
  const incompleteTasks = useMemo(() => {
    return companyData.tasks.filter(task => task.percentComplete < 100);
  }, [companyData.tasks]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const weekFromNow = new Date(now);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    const openTasks = incompleteTasks.length;

    const overdueTasks = incompleteTasks.filter(task => {
      if (!task.dueDateTime) return false;
      const dueDate = new Date(task.dueDateTime);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < now;
    }).length;

    const tasksInFocus = 0; // TODO: Track focused tasks globally

    const dueThisWeek = incompleteTasks.filter(task => {
      if (!task.dueDateTime) return false;
      const dueDate = new Date(task.dueDateTime);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate >= now && dueDate <= weekFromNow;
    }).length;

    const dueAfterWeek = incompleteTasks.filter(task => {
      if (!task.dueDateTime) return false;
      const dueDate = new Date(task.dueDateTime);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate > weekFromNow;
    }).length;

    const backlogged = incompleteTasks.filter(task => !task.dueDateTime).length;

    return {
      openTasks,
      overdueTasks,
      tasksInFocus,
      dueThisWeek,
      dueAfterWeek,
      backlogged,
    };
  }, [incompleteTasks]);

  // Get unique assignees and plans for filter dropdowns
  const uniqueAssignees = useMemo(() => {
    const assigneeSet = new Set();
    incompleteTasks.forEach(task => {
      if (task.assignments) {
        Object.keys(task.assignments).forEach(userId => assigneeSet.add(userId));
      }
    });
    return Array.from(assigneeSet);
  }, [incompleteTasks]);

  const uniquePlans = useMemo(() => {
    return Object.keys(companyData.plans);
  }, [companyData.plans]);

  // Apply filters, search, and sorting to tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = [...incompleteTasks];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => {
        const titleMatch = task.title?.toLowerCase().includes(query);
        const planMatch = companyData.plans[task.planId]?.toLowerCase().includes(query);
        const bucketMatch = companyData.buckets[task.planId]?.find(b => b.id === task.bucketId)?.name?.toLowerCase().includes(query);
        return titleMatch || planMatch || bucketMatch;
      });
    }

    // Filter by assignees
    if (selectedAssignees.length > 0) {
      filtered = filtered.filter(task => {
        if (!task.assignments) return false;
        return selectedAssignees.some(assigneeId => task.assignments[assigneeId]);
      });
    }

    // Filter by plans
    if (selectedPlans.length > 0) {
      filtered = filtered.filter(task => selectedPlans.includes(task.planId));
    }

    // Filter by statuses
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(task => {
        const status = getTaskStatus(task);
        return selectedStatuses.includes(status);
      });
    }

    // Filter by date range
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (dateRange !== 'all') {
      filtered = filtered.filter(task => {
        if (dateRange === 'backlog') {
          return !task.dueDateTime;
        }

        if (!task.dueDateTime) return false;

        const dueDate = new Date(task.dueDateTime);
        dueDate.setHours(0, 0, 0, 0);

        if (dateRange === 'overdue') {
          return dueDate < now;
        } else if (dateRange === 'thisWeek') {
          const weekFromNow = new Date(now);
          weekFromNow.setDate(weekFromNow.getDate() + 7);
          return dueDate >= now && dueDate <= weekFromNow;
        } else if (dateRange === 'thisMonth') {
          const monthFromNow = new Date(now);
          monthFromNow.setMonth(monthFromNow.getMonth() + 1);
          return dueDate >= now && dueDate <= monthFromNow;
        } else if (dateRange === 'custom') {
          if (customStartDate && customEndDate) {
            const startDate = new Date(customStartDate);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(customEndDate);
            endDate.setHours(23, 59, 59, 999);
            return dueDate >= startDate && dueDate <= endDate;
          }
        }
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'taskName':
          aVal = a.title?.toLowerCase() || '';
          bVal = b.title?.toLowerCase() || '';
          break;
        case 'assignee':
          aVal = a.assignments ? Object.keys(a.assignments)[0] || '' : '';
          bVal = b.assignments ? Object.keys(b.assignments)[0] || '' : '';
          break;
        case 'plan':
          aVal = companyData.plans[a.planId] || '';
          bVal = companyData.plans[b.planId] || '';
          break;
        case 'status':
          aVal = getTaskStatus(a);
          bVal = getTaskStatus(b);
          break;
        case 'dueDate':
          aVal = a.dueDateTime ? new Date(a.dueDateTime).getTime() : Infinity;
          bVal = b.dueDateTime ? new Date(b.dueDateTime).getTime() : Infinity;
          break;
        case 'priority':
          aVal = a.priority || 5;
          bVal = b.priority || 5;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [incompleteTasks, searchQuery, selectedAssignees, selectedPlans, selectedStatuses, dateRange, sortBy, sortDirection, companyData]);

  // Virtual scrolling: Calculate which tasks to render
  const visibleTasks = useMemo(() => {
    const startIndex = Math.floor(scrollTop / ROW_HEIGHT);
    const endIndex = Math.min(startIndex + VISIBLE_ROWS, filteredAndSortedTasks.length);
    return filteredAndSortedTasks.slice(startIndex, endIndex).map((task, idx) => ({
      task,
      index: startIndex + idx
    }));
  }, [filteredAndSortedTasks, scrollTop]);

  // Helper functions
  const getTaskStatus = (task) => {
    if (task.percentComplete === 100) return 'completed';
    if (task.percentComplete > 0) return 'in-progress';
    return 'not-started';
  };

  const getPriorityLabel = (priority) => {
    const labels = { 1: 'Urgent', 3: 'Important', 5: 'Medium', 9: 'Low' };
    return labels[priority] || 'Medium';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedAssignees([]);
    setSelectedPlans([]);
    setSelectedStatuses([]);
    setDateRange('all');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const toggleFilter = (filterType, value) => {
    switch (filterType) {
      case 'assignee':
        setSelectedAssignees(prev =>
          prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        );
        break;
      case 'plan':
        setSelectedPlans(prev =>
          prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        );
        break;
      case 'status':
        setSelectedStatuses(prev =>
          prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        );
        break;
    }
  };

  const hasActiveFilters = searchQuery || selectedAssignees.length > 0 ||
                          selectedPlans.length > 0 || selectedStatuses.length > 0 ||
                          dateRange !== 'all' || customStartDate || customEndDate;

  // Handle task completion with optimistic updates
  const handleCompleteTask = async (taskId, event) => {
    // Prevent row click from firing
    if (event) {
      event.stopPropagation();
    }

    console.log('Completing task:', taskId);

    try {
      // Optimistically remove the task from local state immediately
      setCompanyData(prev => ({
        ...prev,
        tasks: prev.tasks.filter(task => task.id !== taskId)
      }));

      // Call the parent completion handler in the background
      await onCompleteTask(taskId);

      console.log('Task completed successfully');
    } catch (err) {
      console.error('Error completing task from Manager Dashboard:', err);
      // Optionally: refetch on error to restore correct state
      await fetchCompanyTasks();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-slate-600">Loading company-wide tasks...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-red-800">Error Loading Manager Dashboard</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <p className="text-xs text-red-600 mt-2">Make sure the backend is running on {BACKEND_URL}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manager Dashboard</h2>
          <p className="text-sm text-slate-600 mt-1">Company-wide task overview • {companyData.tasks.length} total tasks</p>
        </div>
        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh data"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium text-slate-700">
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Open Tasks</p>
              <div className="text-2xl font-bold text-slate-800 mt-1">
                {metrics.openTasks}
              </div>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <AlertCircle className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Overdue</p>
              <div className="text-2xl font-bold text-red-600 mt-1">
                {metrics.overdueTasks}
              </div>
            </div>
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <AlertCircle className="text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">In Focus</p>
              <div className="text-2xl font-bold text-indigo-600 mt-1">
                {metrics.tasksInFocus}
              </div>
            </div>
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Target className="text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Due This Week</p>
              <div className="text-2xl font-bold text-orange-600 mt-1">
                {metrics.dueThisWeek}
              </div>
            </div>
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <Calendar className="text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Due Later</p>
              <div className="text-2xl font-bold text-slate-800 mt-1">
                {metrics.dueAfterWeek}
              </div>
            </div>
            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-slate-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Backlogged</p>
              <div className="text-2xl font-bold text-slate-800 mt-1">
                {metrics.backlogged}
              </div>
            </div>
            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
              <Archive className="text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-4">
        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tasks by name, plan, or bucket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-3">
          {/* Date Range Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600">Date:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="text-sm px-3 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All</option>
              <option value="overdue">Overdue</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
              <option value="backlog">Backlog</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Range Pickers */}
          {dateRange === 'custom' && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">From:</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="text-sm px-3 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">To:</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="text-sm px-3 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </>
          )}

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600">Status:</span>
            <div className="flex gap-1">
              {['not-started', 'in-progress'].map(status => (
                <button
                  key={status}
                  onClick={() => toggleFilter('status', status)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                    selectedStatuses.includes(status)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {status.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Assignee Filter */}
          {uniqueAssignees.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600">Assignee:</span>
              <select
                value=""
                onChange={(e) => e.target.value && toggleFilter('assignee', e.target.value)}
                className="text-sm px-3 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select assignee...</option>
                {uniqueAssignees.map(userId => (
                  <option key={userId} value={userId}>
                    {companyData.userProfiles[userId] || 'User'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Plan Filter */}
          {uniquePlans.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600">Plan:</span>
              <select
                value=""
                onChange={(e) => e.target.value && toggleFilter('plan', e.target.value)}
                className="text-sm px-3 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select plan...</option>
                {uniquePlans.map(planId => (
                  <option key={planId} value={planId}>
                    {companyData.plans[planId]}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Active Filter Tags */}
        {(selectedPlans.length > 0 || selectedAssignees.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {selectedPlans.map(planId => (
              <span key={planId} className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-lg">
                {companyData.plans[planId]}
                <button onClick={() => toggleFilter('plan', planId)} className="hover:text-indigo-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {selectedAssignees.map(userId => (
              <span key={userId} className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-lg">
                {companyData.userProfiles[userId]}
                <button onClick={() => toggleFilter('assignee', userId)} className="hover:text-indigo-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Task Table with Virtual Scrolling */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-800">
            Tasks ({filteredAndSortedTasks.length} {hasActiveFilters && `of ${incompleteTasks.length}`})
          </h3>
          <span className="text-xs text-slate-500">Click column headers to sort</span>
        </div>

        <div
          ref={tableContainerRef}
          className="overflow-auto"
          style={{ maxHeight: '600px' }}
          onScroll={(e) => setScrollTop(e.target.scrollTop)}
        >
          <table className="w-full table-fixed">
            <colgroup>
              <col style={{ width: '5%' }} />
              <col style={{ width: '28%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '10%' }} />
            </colgroup>
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-600 uppercase">
                  Done
                </th>
                <th
                  onClick={() => handleSort('taskName')}
                  className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Task Name
                    {sortBy === 'taskName' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('assignee')}
                  className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Assignee
                    {sortBy === 'assignee' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('plan')}
                  className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Plan
                    {sortBy === 'plan' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Status
                    {sortBy === 'status' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('dueDate')}
                  className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Due Date
                    {sortBy === 'dueDate' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('priority')}
                  className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Priority
                    {sortBy === 'priority' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {visibleTasks.map(({ task, index }) => (
                <tr
                  key={task.id}
                  onClick={() => onEditTask && onEditTask(task)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                  style={{
                    height: `${ROW_HEIGHT}px`,
                  }}
                >
                  <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={(e) => handleCompleteTask(task.id, e)}
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                      title="Mark as complete"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-800 truncate">{task.title}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 truncate">
                    {task.assignments ? Object.keys(task.assignments).map(userId =>
                      companyData.userProfiles[userId] || 'User'
                    ).join(', ') : 'Unassigned'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 truncate">
                    {companyData.plans[task.planId] || 'Unknown'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      getTaskStatus(task) === 'completed' ? 'bg-green-100 text-green-700' :
                      getTaskStatus(task) === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {getTaskStatus(task).replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                    {formatDate(task.dueDateTime)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      task.priority === 1 ? 'bg-red-100 text-red-700' :
                      task.priority === 3 ? 'bg-orange-100 text-orange-700' :
                      task.priority === 5 ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {getPriorityLabel(task.priority)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAndSortedTasks.length === 0 && (
            <div className="p-8 text-center text-slate-600">
              No tasks found matching filters
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
