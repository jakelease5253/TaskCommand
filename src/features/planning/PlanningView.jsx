import React, { useState, useEffect } from 'react';
import { GripVertical, Target, X, Search, Filter as FilterIcon, Users, Calendar, CheckSquare } from '../../components/ui/icons';

export default function PlanningView({
  tasks,
  plans,
  priorityQueue,
  onUpdatePriorityQueue,
  userProfiles,
  accessToken,
  loading = false,
  workHours,
  dailyGoals,
  onOpenGoalSettings,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [dateFilter, setDateFilter] = useState(''); // 'overdue', 'today', 'week', 'noDate', 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedFromQueue, setDraggedFromQueue] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [hoveredTask, setHoveredTask] = useState(null);
  const [taskDetails, setTaskDetails] = useState({});
  const [hoverTimeout, setHoverTimeout] = useState(null);

  // Get IDs of tasks in priority queue
  const priorityTaskIds = priorityQueue.map(t => t.id);

  // Fetch task details on hover
  useEffect(() => {
    if (hoveredTask && !taskDetails[hoveredTask.id] && accessToken) {
      const fetchDetails = async () => {
        try {
          const response = await fetch(
            `https://graph.microsoft.com/v1.0/planner/tasks/${hoveredTask.id}/details`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          const details = await response.json();
          setTaskDetails(prev => ({ ...prev, [hoveredTask.id]: details }));
        } catch (err) {
          console.error('Error fetching task details:', err);
        }
      };
      fetchDetails();
    }
  }, [hoveredTask, accessToken, taskDetails]);

  // Check if task is overdue
  const isOverdue = (task) => {
    if (!task.dueDateTime) return false;
    const dueDateStr = task.dueDateTime.split('T')[0];
    const dueDate = new Date(dueDateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  // Filter and search tasks
  const filteredTasks = tasks.filter(task => {
    // Don't show completed tasks
    if (task.percentComplete === 100) return false;

    // Search filter
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Priority filter
    if (filterPriority && task.priority !== parseInt(filterPriority)) {
      return false;
    }

    // Plan filter
    if (filterPlan && task.planId !== filterPlan) {
      return false;
    }

    // Date filters
    if (dateFilter) {
      if (!task.dueDateTime && dateFilter !== 'noDate') {
        return false;
      }

      if (task.dueDateTime) {
        const dueDateStr = task.dueDateTime.split('T')[0];
        const dueDate = new Date(dueDateStr + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (dateFilter) {
          case 'overdue':
            if (dueDate >= today) return false;
            break;
          case 'today':
            if (dueDate.getTime() !== today.getTime()) return false;
            break;
          case 'week':
            const weekEnd = new Date(today);
            weekEnd.setDate(today.getDate() + 7);
            if (dueDate < today || dueDate > weekEnd) return false;
            break;
          case 'noDate':
            return false; // has a date but filter is for no date
          case 'custom':
            if (customStartDate || customEndDate) {
              const startDate = customStartDate ? new Date(customStartDate + 'T00:00:00') : null;
              const endDate = customEndDate ? new Date(customEndDate + 'T00:00:00') : null;

              if (startDate) startDate.setHours(0, 0, 0, 0);
              if (endDate) endDate.setHours(0, 0, 0, 0);

              if (startDate && dueDate < startDate) return false;
              if (endDate && dueDate > endDate) return false;
            }
            break;
        }
      }
    }

    return true;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        if (!a.dueDateTime && !b.dueDateTime) return 0;
        if (!a.dueDateTime) return 1;
        if (!b.dueDateTime) return -1;
        return new Date(a.dueDateTime) - new Date(b.dueDateTime);
      case 'priority':
        return (a.priority || 5) - (b.priority || 5);
      case 'plan':
        const planA = plans[a.planId] || '';
        const planB = plans[b.planId] || '';
        return planA.localeCompare(planB);
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const getPriorityLabel = (priority) => {
    const labels = { 1: 'Urgent', 3: 'Important', 5: 'Medium', 9: 'Low' };
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

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString();
  };

  // Drag and drop handlers
  const handleDragStart = (task, fromQueue = false) => {
    setDraggedTask(task);
    setDraggedFromQueue(fromQueue);
  };

  const handleDragOverTask = (e) => {
    e.preventDefault();
  };

  const handleDragOverSlot = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDropOnSlot = (index) => {
    if (!draggedTask) return;

    let newQueue = [...priorityQueue];

    if (draggedFromQueue) {
      // Reordering within queue
      const oldIndex = newQueue.findIndex(t => t.id === draggedTask.id);
      if (oldIndex !== -1) {
        newQueue.splice(oldIndex, 1);
        newQueue.splice(index, 0, draggedTask);
      }
    } else {
      // Adding from task list
      if (newQueue.length >= 7) {
        alert('Priority Queue is full (maximum 7 tasks)');
        setDraggedTask(null);
        setDraggedFromQueue(false);
        setDragOverIndex(null);
        return;
      }
      newQueue.splice(index, 0, draggedTask);
    }

    onUpdatePriorityQueue(newQueue);
    setDraggedTask(null);
    setDraggedFromQueue(false);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDraggedFromQueue(false);
    setDragOverIndex(null);
  };

  const handleRemoveFromQueue = (taskId) => {
    const newQueue = priorityQueue.filter(t => t.id !== taskId);
    onUpdatePriorityQueue(newQueue);
  };

  const handleClearAll = () => {
    if (confirm('Remove all tasks from priority queue?')) {
      onUpdatePriorityQueue([]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          fontFamily: 'Poppins',
          color: 'var(--theme-primary-dark)',
          marginBottom: '8px'
        }}>Planning</h1>
        <p style={{
          fontSize: '16px',
          fontFamily: 'Poppins',
          color: '#64748b'
        }}>
          Build your priority queue by dragging tasks from the task pool. Maximum 7 tasks.
        </p>
      </div>

      {/* Goals Card - Full Width */}
      <div className="mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'var(--theme-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Target size={24} style={{ color: 'var(--theme-primary-dark)' }} />
              </div>
              <div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  fontFamily: 'Poppins',
                  color: 'var(--theme-primary-dark)',
                  marginBottom: '2px'
                }}>Weekly Goals</h3>
                <p style={{
                  fontSize: '14px',
                  fontFamily: 'Poppins',
                  color: '#64748b'
                }}>Your task and focus time targets for the week</p>
              </div>
            </div>
            {onOpenGoalSettings && (
              <button
                onClick={onOpenGoalSettings}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  fontFamily: 'Poppins',
                  color: 'var(--theme-primary-dark)',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--theme-primary)';
                  e.currentTarget.style.borderColor = 'var(--theme-primary)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
              >
                Edit Goals
              </button>
            )}
          </div>

          {/* Weekly Summary Grid */}
          <div className="grid grid-cols-7 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
              const dayKey = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][idx];
              const dayGoals = dailyGoals[dayKey];
              const dayHours = workHours[dayKey];
              const totalDayTasks = dayGoals.morningTasks + dayGoals.afternoonTasks;

              return (
                <div
                  key={day}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '8px',
                    backgroundColor: dayHours.enabled ? '#f8fafc' : '#fafafa',
                    border: `1px solid ${dayHours.enabled ? '#d1d5db' : '#e5e7eb'}`,
                    opacity: dayHours.enabled ? 1 : 0.6
                  }}
                >
                  <div style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    fontFamily: 'Poppins',
                    color: 'var(--theme-primary-dark)',
                    marginBottom: '8px',
                    textAlign: 'center'
                  }}>{day}</div>

                  {dayHours.enabled ? (
                    <>
                      <div style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        fontFamily: 'Poppins',
                        color: 'var(--theme-primary-dark)',
                        textAlign: 'center',
                        marginBottom: '4px'
                      }}>{totalDayTasks}</div>
                      <div style={{
                        fontSize: '10px',
                        fontFamily: 'Poppins',
                        color: '#64748b',
                        textAlign: 'center'
                      }}>
                        <div>{dayGoals.morningTasks} AM</div>
                        <div>{dayGoals.afternoonTasks} PM</div>
                      </div>
                    </>
                  ) : (
                    <div style={{
                      fontSize: '10px',
                      fontFamily: 'Poppins',
                      color: '#94a3b8',
                      textAlign: 'center',
                      marginTop: '12px'
                    }}>Off</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Weekly Total Summary */}
          <div style={{
            marginTop: '16px',
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: '#fff9e6',
            border: '1px solid var(--theme-primary)'
          }}>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  fontFamily: 'Poppins',
                  color: '#64748b',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Weekly Total</div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  fontFamily: 'Poppins',
                  color: 'var(--theme-primary-dark)'
                }}>
                  {Object.keys(dailyGoals).reduce((sum, day) => {
                    if (workHours[day].enabled) {
                      return sum + dailyGoals[day].morningTasks + dailyGoals[day].afternoonTasks;
                    }
                    return sum;
                  }, 0)}
                </div>
                <div style={{
                  fontSize: '12px',
                  fontFamily: 'Poppins',
                  color: '#64748b'
                }}>tasks per week</div>
              </div>

              <div>
                <div style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  fontFamily: 'Poppins',
                  color: '#64748b',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Morning</div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  fontFamily: 'Poppins',
                  color: 'var(--theme-primary-dark)'
                }}>
                  {Object.keys(dailyGoals).reduce((sum, day) => {
                    if (workHours[day].enabled) {
                      return sum + dailyGoals[day].morningTasks;
                    }
                    return sum;
                  }, 0)}
                </div>
                <div style={{
                  fontSize: '12px',
                  fontFamily: 'Poppins',
                  color: '#64748b'
                }}>AM tasks</div>
              </div>

              <div>
                <div style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  fontFamily: 'Poppins',
                  color: '#64748b',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Afternoon</div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  fontFamily: 'Poppins',
                  color: 'var(--theme-primary-dark)'
                }}>
                  {Object.keys(dailyGoals).reduce((sum, day) => {
                    if (workHours[day].enabled) {
                      return sum + dailyGoals[day].afternoonTasks;
                    }
                    return sum;
                  }, 0)}
                </div>
                <div style={{
                  fontSize: '12px',
                  fontFamily: 'Poppins',
                  color: '#64748b'
                }}>PM tasks</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: All Tasks Pool */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            {/* Header with search and filters */}
            <div className="p-4 border-b border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <FilterIcon className="text-slate-600" />
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  fontFamily: 'Poppins',
                  color: 'var(--theme-primary-dark)'
                }}>Task Pool</h2>
                <span style={{
                  fontSize: '14px',
                  fontFamily: 'Poppins',
                  color: '#64748b'
                }}>
                  ({filteredTasks.length} tasks)
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '40px',
                    paddingRight: '16px',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontFamily: 'Poppins',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.boxShadow = '0 0 0 2px var(--theme-primary)';
                    e.target.style.borderColor = 'transparent';
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none';
                    e.target.style.borderColor = '#d1d5db';
                  }}
                />
              </div>

              {/* Sort and Filter Controls */}
              <div className="grid grid-cols-2 gap-3">
                {/* Sort By */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    fontSize: '14px',
                    fontFamily: 'Poppins',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => {
                    e.target.style.boxShadow = '0 0 0 2px var(--theme-primary)';
                    e.target.style.borderColor = 'transparent';
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none';
                    e.target.style.borderColor = '#d1d5db';
                  }}
                >
                  <option value="dueDate">Sort: Due Date</option>
                  <option value="priority">Sort: Priority</option>
                  <option value="plan">Sort: Plan</option>
                  <option value="title">Sort: Title</option>
                </select>

                {/* Date Filter */}
                <select
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    if (e.target.value !== 'custom') {
                      setCustomStartDate('');
                      setCustomEndDate('');
                    }
                  }}
                  style={{
                    padding: '8px 12px',
                    fontSize: '14px',
                    fontFamily: 'Poppins',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => {
                    e.target.style.boxShadow = '0 0 0 2px var(--theme-primary)';
                    e.target.style.borderColor = 'transparent';
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none';
                    e.target.style.borderColor = '#d1d5db';
                  }}
                >
                  <option value="">All Dates</option>
                  <option value="overdue">Overdue</option>
                  <option value="today">Due Today</option>
                  <option value="week">Due This Week</option>
                  <option value="noDate">No Due Date</option>
                  <option value="custom">Custom Range...</option>
                </select>

                {/* Priority Filter */}
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    fontSize: '14px',
                    fontFamily: 'Poppins',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => {
                    e.target.style.boxShadow = '0 0 0 2px var(--theme-primary)';
                    e.target.style.borderColor = 'transparent';
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none';
                    e.target.style.borderColor = '#d1d5db';
                  }}
                >
                  <option value="">All Priorities</option>
                  <option value="1">Urgent</option>
                  <option value="3">Important</option>
                  <option value="5">Medium</option>
                  <option value="9">Low</option>
                </select>

                {/* Plan Filter */}
                <select
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    fontSize: '14px',
                    fontFamily: 'Poppins',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => {
                    e.target.style.boxShadow = '0 0 0 2px var(--theme-primary)';
                    e.target.style.borderColor = 'transparent';
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none';
                    e.target.style.borderColor = '#d1d5db';
                  }}
                >
                  <option value="">All Plans</option>
                  {Object.entries(plans).map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
              </div>

              {/* Custom Date Range */}
              {dateFilter === 'custom' && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      fontFamily: 'Poppins',
                      color: '#64748b',
                      marginBottom: '4px'
                    }}>From Date</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: '14px',
                        fontFamily: 'Poppins',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                      onFocus={(e) => {
                        e.target.style.boxShadow = '0 0 0 2px var(--theme-primary)';
                        e.target.style.borderColor = 'transparent';
                      }}
                      onBlur={(e) => {
                        e.target.style.boxShadow = 'none';
                        e.target.style.borderColor = '#d1d5db';
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      fontFamily: 'Poppins',
                      color: '#64748b',
                      marginBottom: '4px'
                    }}>To Date</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: '14px',
                        fontFamily: 'Poppins',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                      onFocus={(e) => {
                        e.target.style.boxShadow = '0 0 0 2px var(--theme-primary)';
                        e.target.style.borderColor = 'transparent';
                      }}
                      onBlur={(e) => {
                        e.target.style.boxShadow = 'none';
                        e.target.style.borderColor = '#d1d5db';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Task List - Compact Table */}
            <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
              {loading ? (
                <div className="p-12 text-center">
                  <div
                    className="animate-spin w-8 h-8 rounded-full mx-auto mb-4"
                    style={{
                      border: '4px solid #e5e7eb',
                      borderTopColor: 'var(--theme-primary)'
                    }}
                  ></div>
                  <p style={{ color: '#64748b', fontFamily: 'Poppins', fontSize: '14px' }}>Loading tasks...</p>
                </div>
              ) : sortedTasks.length === 0 ? (
                <div className="p-12 text-center" style={{ color: '#64748b', fontFamily: 'Poppins', fontSize: '14px' }}>
                  <p>No tasks found</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {sortedTasks.map(task => {
                    const inQueue = priorityTaskIds.includes(task.id);
                    const details = taskDetails[task.id];
                    const isHovered = hoveredTask?.id === task.id;

                    return (
                      <div
                        key={task.id}
                        draggable={!inQueue}
                        onDragStart={(e) => {
                          if (!inQueue) {
                            handleDragStart(task, false);
                            // Create a cleaner drag image showing just the task title
                            const dragImage = document.createElement('div');
                            dragImage.textContent = task.title;
                            dragImage.style.padding = '8px 12px';
                            dragImage.style.backgroundColor = 'white';
                            dragImage.style.border = '2px solid #6366f1';
                            dragImage.style.borderRadius = '8px';
                            dragImage.style.position = 'absolute';
                            dragImage.style.top = '-1000px';
                            dragImage.style.fontWeight = '500';
                            document.body.appendChild(dragImage);
                            e.dataTransfer.setDragImage(dragImage, 0, 0);
                            setTimeout(() => document.body.removeChild(dragImage), 0);
                          }
                        }}
                        onDragOver={handleDragOverTask}
                        onDragEnd={handleDragEnd}
                        onMouseEnter={() => {
                          // Clear any existing timeout
                          if (hoverTimeout) {
                            clearTimeout(hoverTimeout);
                          }
                          // Set new timeout for 1 second
                          const timeout = setTimeout(() => {
                            setHoveredTask(task);
                          }, 1000);
                          setHoverTimeout(timeout);
                        }}
                        onMouseLeave={() => {
                          // Clear timeout and hide tooltip
                          if (hoverTimeout) {
                            clearTimeout(hoverTimeout);
                            setHoverTimeout(null);
                          }
                          setHoveredTask(null);
                        }}
                        className={`relative flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors ${
                          inQueue ? 'opacity-40 cursor-not-allowed' : 'cursor-move'
                        }`}
                      >
                        {/* Drag Handle */}
                        <div className="flex-shrink-0">
                          {inQueue ? (
                            <Target style={{ color: 'var(--theme-primary)' }} size={16} />
                          ) : (
                            <GripVertical className="text-slate-400" />
                          )}
                        </div>

                        {/* Task Title */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            inQueue ? 'text-slate-500' : 'text-slate-900'
                          }`}>
                            {task.title}
                          </p>
                        </div>

                        {/* Due Date */}
                        <div className="flex-shrink-0 text-xs text-slate-600 min-w-[80px]">
                          {formatDate(task.dueDateTime)}
                        </div>

                        {/* Priority Badge */}
                        <div className="flex-shrink-0">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {getPriorityLabel(task.priority)}
                          </span>
                        </div>

                        {/* Hover Tooltip - Rendered outside to avoid parent opacity */}
                      </div>
                    );
                  })}
                  {/* Render hover tooltips outside the list to avoid opacity inheritance */}
                  {sortedTasks.map(task => {
                    const details = taskDetails[task.id];
                    const isHovered = hoveredTask?.id === task.id;

                    if (!isHovered || !details) return null;

                    return (
                      <div
                        key={`tooltip-${task.id}`}
                        className="fixed z-50 w-80 bg-white rounded-lg shadow-xl p-4 pointer-events-none"
                        style={{
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          border: '2px solid var(--theme-primary)'
                        }}
                      >
                        <div className="space-y-3">
                              {/* Title */}
                              <div style={{ opacity: 1 }}>
                                <h4 className="font-semibold text-sm mb-1" style={{ color: '#0f172a', opacity: 1 }}>{task.title}</h4>
                                <div className="flex items-center gap-2 text-xs" style={{ color: '#475569', opacity: 1 }}>
                                  <span>{plans[task.planId]}</span>
                                </div>
                              </div>

                              {/* Description */}
                              {details?.description && (
                                <div style={{ opacity: 1 }}>
                                  <p className="text-xs font-medium mb-1" style={{ color: '#334155', opacity: 1 }}>Description:</p>
                                  <p className="text-xs line-clamp-3" style={{ color: '#475569', opacity: 1 }}>{details.description}</p>
                                </div>
                              )}

                              {/* Checklist Progress */}
                              {details?.checklist && Object.keys(details.checklist).length > 0 && (
                                <div className="flex items-center gap-2" style={{ opacity: 1 }}>
                                  <CheckSquare size={14} style={{ color: '#64748b', opacity: 1 }} />
                                  <span className="text-xs" style={{ color: '#475569', opacity: 1 }}>
                                    {Object.values(details.checklist).filter(item => item.isChecked).length} / {Object.keys(details.checklist).length} checklist items
                                  </span>
                                </div>
                              )}

                              {/* Assigned Users */}
                              {task.assignments && Object.keys(task.assignments).length > 0 && (
                                <div className="flex items-center gap-2" style={{ opacity: 1 }}>
                                  <Users size={14} style={{ color: '#64748b', opacity: 1 }} />
                                  <span className="text-xs" style={{ color: '#475569', opacity: 1 }}>
                                    {Object.keys(task.assignments)
                                      .map(userId => userProfiles[userId] || 'Unknown')
                                      .join(', ')}
                                  </span>
                                </div>
                              )}

                              {/* Due Date */}
                              {task.dueDateTime && (
                                <div className="flex items-center gap-2" style={{ opacity: 1 }}>
                                  <Calendar size={14} style={{ color: isOverdue(task) ? '#ef4444' : '#64748b', opacity: 1 }} />
                                  <span className="text-xs" style={{
                                    color: isOverdue(task) ? '#dc2626' : '#475569',
                                    fontWeight: isOverdue(task) ? 500 : 400,
                                    opacity: 1
                                  }}>
                                    Due: {formatDate(task.dueDateTime)}
                                    {isOverdue(task) && ' (Overdue)'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Priority Queue Builder */}
        <div className="lg:col-span-1">
          {/* Priority Queue */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 sticky top-24">
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  fontFamily: 'Poppins',
                  color: 'var(--theme-primary-dark)'
                }}>Priority Queue</h2>
                {priorityQueue.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      fontFamily: 'Poppins',
                      color: '#dc2626',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#b91c1c'}
                    onMouseOut={(e) => e.currentTarget.style.color = '#dc2626'}
                  >
                    Clear All
                  </button>
                )}
              </div>
              <p style={{
                fontSize: '14px',
                fontFamily: 'Poppins',
                color: '#64748b'
              }}>
                {priorityQueue.length} / 7 tasks
              </p>
            </div>

            <div className="p-4 space-y-2">
              {/* Empty slots and filled slots */}
              {[...Array(7)].map((_, index) => {
                const task = priorityQueue[index];
                const isOver = dragOverIndex === index;

                return (
                  <div
                    key={index}
                    onDragOver={(e) => handleDragOverSlot(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={() => handleDropOnSlot(index)}
                    className="min-h-[60px] border-2 border-dashed rounded-lg transition-all"
                    style={{
                      borderColor: isOver ? 'var(--theme-primary)' : (task ? '#d1d5db' : '#e5e7eb'),
                      backgroundColor: isOver ? '#fff9e6' : (task ? '#f8fafc' : '#ffffff')
                    }}
                  >
                    {task ? (
                      <div
                        draggable
                        onDragStart={() => handleDragStart(task, true)}
                        onDragEnd={handleDragEnd}
                        className="cursor-move group"
                        style={{ padding: '12px 12px 12px 8px' }}
                      >
                        <div className="flex items-center gap-2">
                          {/* Drag Handle - Left Side */}
                          <div className="flex-shrink-0">
                            <GripVertical className="text-slate-400" size={16} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span style={{
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  fontFamily: 'Poppins',
                                  color: 'var(--theme-primary)',
                                  backgroundColor: 'var(--theme-primary-dark)',
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  {index + 1}
                                </span>
                              </div>
                              <p style={{
                                fontSize: '14px',
                                fontWeight: '500',
                                fontFamily: 'Poppins',
                                color: 'var(--theme-primary-dark)'
                              }} className="line-clamp-2">
                                {task.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                  {getPriorityLabel(task.priority)}
                                </span>
                                <span className="text-xs text-slate-500">
                                  {formatDate(task.dueDateTime)}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveFromQueue(task.id)}
                              className="flex-shrink-0 p-1 hover:bg-red-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              title="Remove from queue"
                            >
                              <X size={14} className="text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 flex items-center justify-center h-full">
                        <span className="text-xs text-slate-400">
                          Drop task here
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
