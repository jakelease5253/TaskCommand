import React, { useState, useMemo } from "react";
import { AlertCircle, Users, Calendar, Target, TrendingUp, Archive } from "../ui/icons";

export default function ManagerDashboard({
  tasks,
  plans,
  buckets,
  userProfiles,
  accessToken,
  onEditTask,
}) {
  // Filter state
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [dateRange, setDateRange] = useState('all'); // all, thisWeek, thisMonth, custom

  // Table state
  const [columnOrder, setColumnOrder] = useState(['taskName', 'assignee', 'plan', 'status', 'dueDate', 'priority']);
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortDirection, setSortDirection] = useState('asc');

  // Get all incomplete tasks for metrics and display
  const incompleteTasks = useMemo(() => {
    return tasks.filter(task => task.percentComplete < 100);
  }, [tasks]);

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

  // Apply filters to tasks
  const filteredTasks = useMemo(() => {
    let filtered = [...incompleteTasks];

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
    if (dateRange === 'thisWeek') {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const weekFromNow = new Date(now);
      weekFromNow.setDate(weekFromNow.getDate() + 7);

      filtered = filtered.filter(task => {
        if (!task.dueDateTime) return false;
        const dueDate = new Date(task.dueDateTime);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate >= now && dueDate <= weekFromNow;
      });
    }

    return filtered;
  }, [incompleteTasks, selectedAssignees, selectedPlans, selectedStatuses, dateRange]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Manager Dashboard</h2>
        <p className="text-sm text-slate-600 mt-1">Company-wide task overview and management</p>
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

      {/* Filters - Placeholder for now */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Filters</h3>
        <div className="text-sm text-slate-600">
          Filters coming in next phase...
        </div>
      </div>

      {/* Table - Placeholder for now */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-slate-800">
            Tasks ({filteredTasks.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-y border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Task Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Assignee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Due Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTasks.slice(0, 10).map(task => (
                <tr
                  key={task.id}
                  onClick={() => onEditTask && onEditTask(task)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-slate-800">{task.title}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {task.assignments ? Object.keys(task.assignments).map(userId =>
                      userProfiles[userId] || 'User'
                    ).join(', ') : 'Unassigned'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {plans[task.planId] || 'Unknown'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getTaskStatus(task) === 'completed' ? 'bg-green-100 text-green-700' :
                      getTaskStatus(task) === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {getTaskStatus(task).replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {formatDate(task.dueDateTime)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
          {filteredTasks.length > 10 && (
            <div className="p-4 text-center text-sm text-slate-600 bg-slate-50">
              Showing 10 of {filteredTasks.length} tasks (full table with sorting/filtering coming next)
            </div>
          )}
          {filteredTasks.length === 0 && (
            <div className="p-8 text-center text-slate-600">
              No tasks found matching filters
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
