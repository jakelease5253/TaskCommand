import { useState, useEffect, useRef } from 'react';
import { useAuth } from './hooks/useAuth';
import { useTasks } from './hooks/useTasks';
import { useTimer } from './hooks/useTimer';

// Component imports
import LoginScreen from './components/auth/LoginScreen';
import Header from './components/layout/Header';
import Dashboard from './features/dashboards/personal/Dashboard';
import ManagerDashboard from './features/dashboards/manager/ManagerDashboard';
import Settings from './features/settings/Settings';
import WorkTimer from './components/focus/WorkTimer';
import FocusTaskCard from './components/focus/FocusTaskCard';
import FilterBar from './components/tasks/FilterBar';
import AllTasksList from './components/tasks/AllTasksList';
import PriorityQueue from './components/tasks/PriorityQueue';
import NewTaskModal from './components/tasks/NewTaskModal';
import EditTaskModal from './components/tasks/EditTaskModal';
import PriorityLimitModal from './components/modals/PriorityLimitModal';

function App() {
  const auth = useAuth();
  const taskManager = useTasks(auth.accessToken);
  const workTimer = useTimer();
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
  const [currentView, setCurrentView] = useState('personal'); // 'personal', 'manager', 'settings'
  const [showMetrics, setShowMetrics] = useState(true); // For collapsible metrics on personal view
  const [showPriorityLimitModal, setShowPriorityLimitModal] = useState(false);

  // Priority Queue (max 7 tasks)
  const [priorityQueue, setPriorityQueue] = useState([]);

  // Filtering and sorting
  const [sortBy, setSortBy] = useState('dueDate');
  const [filters, setFilters] = useState({
    priority: '',
    planId: '',
    dateRange: ''
  });
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragSource, setDragSource] = useState(null); // 'all' or 'priority'

  // Dashboard
  const [dateRange, setDateRange] = useState('7days');
  const [completedTasksHistory, setCompletedTasksHistory] = useState([]);

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
      }

      await taskManager.fetchAllTasks();
    } catch (err) {
      console.error('Error completing task:', err);
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
    }
  };

  const toggleWorkTimer = () => {
    if (workTimer.isRunning) {
      workTimer.pause();
    } else {
      workTimer.start();
    }
  };

  const stopWorkTimer = () => {
    workTimer.stop();
  };

  const handleEditTask = async (task) => {
    setEditingTask(task);
    const details = await taskManager.fetchTaskDetails(task.id);
    setEditingTaskDetails(details);
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

  const calculateDashboardMetrics = () => {
    const filteredTasks = getFilteredCompletedTasks();
    const totalCompleted = filteredTasks.length;
    
    const totalFocusTime = filteredTasks.reduce((sum, task) => {
      return sum + (task.focusTime || 0);
    }, 0);

    const avgFocusTime = totalCompleted > 0 ? Math.round(totalFocusTime / totalCompleted / 60) : 0;

    const completionRate = taskManager.tasks.length > 0 
      ? Math.round((totalCompleted / (totalCompleted + taskManager.tasks.filter(t => t.percentComplete < 100).length)) * 100)
      : 0;

    const currentStreak = calculateStreak();

    return {
      totalCompleted,
      avgFocusTime,
      completionRate,
      currentStreak
    };
  };

  if (!auth.isAuthenticated) {
    return <LoginScreen onLogin={auth.handleLogin} loading={auth.loading} />;
  }

  const filteredTasks = filterAndSortTasks(taskManager.tasks);
  const priorityTasks = priorityQueue
    .map(id => taskManager.tasks.find(t => t.id === id))
    .filter(Boolean);
  const dashboardMetrics = calculateDashboardMetrics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header
        user={auth.user}
        currentView={currentView}
        onNavigate={setCurrentView}
        onRefresh={taskManager.fetchAllTasks}
        onLogout={auth.handleLogout}
        loading={taskManager.loading}
      />

      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Personal Tasks View */}
        {currentView === 'personal' && (
          <>
            {/* Collapsible Metrics Dashboard */}
            {showMetrics ? (
              <Dashboard
                dateRange={dateRange}
                setDateRange={setDateRange}
                metrics={dashboardMetrics}
                onToggleCollapse={() => setShowMetrics(false)}
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
                  Show Performance Metrics
                </button>
              </div>
            )}

            <WorkTimer
              elapsed={workTimer.elapsed}
              isRunning={workTimer.isRunning}
              onToggle={toggleWorkTimer}
              onStop={stopWorkTimer}
              formatTime={formatTime}
            />

            {focusTask && (
              <FocusTaskCard
                task={{...focusTask, description: focusTaskDetails?.description}}
                elapsed={focusTimer.elapsed}
                planName={taskManager.plans[focusTask.planId]}
                bucketName={getBucketName(focusTask)}
                onComplete={() => handleCompleteTask(focusTask.id)}
                onEdit={handleEditTask}
                onUnfocus={handleSetFocusTask}
                formatTime={formatTime}
              />
            )}

            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - All Tasks (2/3 width) */}
          <div className="lg:col-span-2 space-y-4">
            <FilterBar 
              sortBy={sortBy}
              setSortBy={setSortBy}
              filters={filters}
              setFilters={setFilters}
              plans={taskManager.plans}
              onClearFilters={() => setFilters({ priority: '', planId: '', dateRange: '' })}
            />

            <div
              onDragOver={(e) => { e.preventDefault(); }}
              onDrop={(e) => handleDrop(e, 'all')}
            >
              <AllTasksList 
                tasks={filteredTasks}
                loading={taskManager.loading}
                plans={taskManager.plans}
                buckets={taskManager.buckets}
                userProfiles={taskManager.userProfiles}
                focusTask={focusTask}
                priorityTaskIds={priorityQueue}
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

          {/* Right Column - Priority Queue (1/3 width) */}
          <div
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={(e) => handleDrop(e, 'priority')}
          >
            <PriorityQueue 
              priorityTasks={priorityTasks}
              plans={taskManager.plans}
              buckets={taskManager.buckets}
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
        </div>
          </>
        )}

        {/* Manager Dashboard View */}
        {currentView === 'manager' && (
          <ManagerDashboard
            tasks={taskManager.tasks}
            plans={taskManager.plans}
            buckets={taskManager.buckets}
            userProfiles={taskManager.userProfiles}
            accessToken={auth.accessToken}
            onEditTask={handleEditTask}
          />
        )}

        {/* Settings View */}
        {currentView === 'settings' && (
          <Settings />
        )}
      </main>

      {showNewTaskModal && (
        <NewTaskModal 
          accessToken={auth.accessToken}
          plans={taskManager.plans}
          buckets={taskManager.buckets}
          currentUserId={auth.user?.id}
          onClose={() => setShowNewTaskModal(false)}
          onTaskCreated={() => {
            setShowNewTaskModal(false);
            taskManager.fetchAllTasks();
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
          onTaskUpdated={async () => {
            const wasEditingFocusedTask = focusTask && editingTask.id === focusTask.id;
            setEditingTask(null);
            setEditingTaskDetails(null);
            await taskManager.fetchAllTasks();

            // If we edited the focused task, refresh it with updated data
            if (wasEditingFocusedTask) {
              const updatedTask = taskManager.tasks.find(t => t.id === focusTask.id);
              if (updatedTask) {
                setFocusTask(updatedTask);
                // Also refresh task details
                const details = await taskManager.fetchTaskDetails(updatedTask.id);
                setFocusTaskDetails(details);
              }
            }
          }}
        />
      )}

      <PriorityLimitModal 
        isOpen={showPriorityLimitModal}
        onClose={() => setShowPriorityLimitModal(false)}
      />
    </div>
  );
}

export default App;