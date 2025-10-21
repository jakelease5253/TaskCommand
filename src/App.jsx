import { useState, useEffect, useRef } from 'react';
import { useAuth } from './hooks/useAuth';
import { useTasks } from './hooks/useTasks';
import { useTimer } from './hooks/useTimer';

// Component imports
import LoginScreen from './components/auth/LoginScreen';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import WorkTimer from './components/focus/WorkTimer';
import FocusTaskCard from './components/focus/FocusTaskCard';
import TaskList from './components/tasks/TaskList';
import NewTaskModal from './components/tasks/NewTaskModal';
import EditTaskModal from './components/tasks/EditTaskModal';

function App() {
  const auth = useAuth();
  const taskManager = useTasks(auth.accessToken);
  const workTimer = useTimer();
  const focusTimer = useTimer();
  
  // Track if we've done the initial data fetch
  const hasFetchedData = useRef(false);

  // Focus task state
  const [focusTask, setFocusTask] = useState(null);

  // UI state
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showDashboard, setShowDashboard] = useState(true);

  // Sorting and ordering
  const [sortMode, setSortMode] = useState('myOrder');
  const [customOrder, setCustomOrder] = useState([]);
  const [draggedTask, setDraggedTask] = useState(null);

  // Dashboard
  const [dateRange, setDateRange] = useState('7days');
  const [completedTasksHistory, setCompletedTasksHistory] = useState([]);

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

  // Load custom task order from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('customTaskOrder');
    if (saved) {
      try {
        setCustomOrder(JSON.parse(saved));
      } catch (err) {
        console.error('Error loading custom order:', err);
      }
    }
  }, []);

  // Save custom order to localStorage
  useEffect(() => {
    if (customOrder.length > 0) {
      localStorage.setItem('customTaskOrder', JSON.stringify(customOrder));
    }
  }, [customOrder]);

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
    return bucket ? bucket.name : 'Unknown Bucket';
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

  const sortTasks = (tasksToSort) => {
    const incompleteTasks = tasksToSort.filter(task => task.percentComplete < 100);
    
    switch (sortMode) {
      case 'myOrder':
        return incompleteTasks.sort((a, b) => {
          const indexA = customOrder.indexOf(a.id);
          const indexB = customOrder.indexOf(b.id);
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
      case 'priority':
        return incompleteTasks.sort((a, b) => (a.priority || 5) - (b.priority || 5));
      case 'dueDate':
        return incompleteTasks.sort((a, b) => {
          if (!a.dueDateTime && !b.dueDateTime) return 0;
          if (!a.dueDateTime) return 1;
          if (!b.dueDateTime) return -1;
          return new Date(a.dueDateTime) - new Date(b.dueDateTime);
        });
      default:
        return incompleteTasks;
    }
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
          focusTime: focusTask?.id === taskId ? focusTimer.elapsed : 0
        };
        
        const updatedHistory = [completedTask, ...completedTasksHistory];
        setCompletedTasksHistory(updatedHistory);
        localStorage.setItem('completedTasksHistory', JSON.stringify(updatedHistory));
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

  const handleSetFocusTask = (task) => {
    if (focusTask?.id === task.id) {
      setFocusTask(null);
      focusTimer.stop();
    } else {
      setFocusTask(task);
      focusTimer.setStartTime(Date.now());
      focusTimer.setElapsed(0);
      focusTimer.start();
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

  // Drag and drop handlers
  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e, targetTask) => {
    e.preventDefault();
    if (!draggedTask || draggedTask.id === targetTask.id) return;

    const sortedTasks = sortTasks(taskManager.tasks);
    const draggedIndex = sortedTasks.findIndex(t => t.id === draggedTask.id);
    const targetIndex = sortedTasks.findIndex(t => t.id === targetTask.id);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newOrder = [...customOrder];
    const draggedId = draggedTask.id;
    const targetId = targetTask.id;

    const currentDraggedIndex = newOrder.indexOf(draggedId);
    if (currentDraggedIndex !== -1) {
      newOrder.splice(currentDraggedIndex, 1);
    }

    const currentTargetIndex = newOrder.indexOf(targetId);
    if (currentTargetIndex !== -1) {
      newOrder.splice(currentTargetIndex, 0, draggedId);
    } else {
      newOrder.push(draggedId);
    }

    setCustomOrder(newOrder);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  const moveTaskUp = (task) => {
    const sortedTasks = sortTasks(taskManager.tasks);
    const currentIndex = sortedTasks.findIndex(t => t.id === task.id);
    if (currentIndex <= 0) return;

    const newOrder = sortedTasks.map(t => t.id);
    [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
    setCustomOrder(newOrder);
  };

  const moveTaskDown = (task) => {
    const sortedTasks = sortTasks(taskManager.tasks);
    const currentIndex = sortedTasks.findIndex(t => t.id === task.id);
    if (currentIndex === -1 || currentIndex >= sortedTasks.length - 1) return;

    const newOrder = sortedTasks.map(t => t.id);
    [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
    setCustomOrder(newOrder);
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

  const sortedTasks = sortTasks(taskManager.tasks);
  const dashboardMetrics = calculateDashboardMetrics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header 
        user={auth.user}
        onLogout={auth.handleLogout}
        onRefresh={taskManager.fetchAllTasks}
        loading={taskManager.loading}
        showDashboard={showDashboard}
        onToggleDashboard={() => setShowDashboard(!showDashboard)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {taskManager.error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 mb-1">Error</h3>
              <p className="text-sm text-red-700">{taskManager.error}</p>
            </div>
            <button onClick={() => taskManager.setError(null)} className="flex-shrink-0 text-red-400 hover:text-red-600">
              Ã—
            </button>
          </div>
        )}

        {showDashboard && (
          <Dashboard 
            dateRange={dateRange}
            setDateRange={setDateRange}
            metrics={dashboardMetrics}
          />
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
            task={focusTask}
            elapsed={focusTimer.elapsed}
            planName={taskManager.plans[focusTask.planId]}
            bucketName={getBucketName(focusTask)}
            onComplete={() => handleCompleteTask(focusTask.id)}
            formatTime={formatTime}
          />
        )}

        <TaskList 
          tasks={sortedTasks}
          loading={taskManager.loading}
          sortMode={sortMode}
          setSortMode={setSortMode}
          onNewTask={() => setShowNewTaskModal(true)}
          onSetFocus={handleSetFocusTask}
          onEdit={setEditingTask}
          onComplete={handleCompleteTask}
          focusTask={focusTask}
          plans={taskManager.plans}
          buckets={taskManager.buckets}
          userProfiles={taskManager.userProfiles}
          draggedTask={draggedTask}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          moveTaskUp={moveTaskUp}
          moveTaskDown={moveTaskDown}
        />
      </main>

      {showNewTaskModal && (
        <NewTaskModal 
          accessToken={auth.accessToken}
          plans={taskManager.plans}
          buckets={taskManager.buckets}
          onClose={() => setShowNewTaskModal(false)}
          onTaskCreated={() => {
            setShowNewTaskModal(false);
            taskManager.fetchAllTasks();
          }}
        />
      )}

      {editingTask && (
        <EditTaskModal 
          task={editingTask}
          accessToken={auth.accessToken}
          plans={taskManager.plans}
          buckets={taskManager.buckets}
          onClose={() => setEditingTask(null)}
          onTaskUpdated={() => {
            setEditingTask(null);
            taskManager.fetchAllTasks();
          }}
        />
      )}
    </div>
  );
}

export default App;