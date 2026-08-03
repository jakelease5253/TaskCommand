import { useState } from 'react';
import { graphRequest, patchPlannerTask, GraphApiError } from '../services/plannerApi';

export function useTasks(accessToken) {
  const [tasks, setTasks] = useState([]);
  const [plans, setPlans] = useState({});
  const [buckets, setBuckets] = useState({});
  const [userProfiles, setUserProfiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllTasks = async () => {
    if (!accessToken) return;

    setLoading(true);
    setError(null);
    try {
      // Fetch plans
      const groupsData = await graphRequest(accessToken, '/me/planner/plans');
      const plansMap = {};
      groupsData.value.forEach(plan => {
        plansMap[plan.id] = plan.title;
      });
      setPlans(plansMap);

      // Fetch buckets for each plan
      const bucketsMap = {};
      for (const planId of Object.keys(plansMap)) {
        const bucketsData = await graphRequest(accessToken, `/planner/plans/${planId}/buckets`);
        bucketsMap[planId] = bucketsData.value;
      }
      setBuckets(bucketsMap);

      // Fetch tasks
      const tasksData = await graphRequest(accessToken, '/me/planner/tasks');
      setTasks(tasksData.value || []);

      // Fetch user profiles for assigned users
      const userIds = new Set();
      tasksData.value?.forEach(task => {
        if (task.assignments) {
          Object.keys(task.assignments).forEach(userId => userIds.add(userId));
        }
      });

      const profiles = {};
      for (const userId of userIds) {
        try {
          const userData = await graphRequest(accessToken, `/users/${userId}`);
          profiles[userId] = userData.displayName || userData.userPrincipalName || 'Unknown';
        } catch (err) {
          // Don't log 403 errors - just mark as Unknown
          profiles[userId] = 'User';
        }
      }
      setUserProfiles(profiles);
    } catch (err) {
      // Expired token: clear auth and start over
      if (err instanceof GraphApiError && err.status === 401) {
        console.log('Token expired, clearing authentication...');
        localStorage.removeItem('taskcommand_access_token');
        window.location.reload();
        return;
      }
      setError(err.message);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId) => {
    if (!accessToken) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Optimistic update: remove task from list immediately for instant feedback
    setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));

    try {
      await patchPlannerTask(accessToken, taskId, { percentComplete: 100 });
      return task;
    } catch (err) {
      // On error, restore the task to the list
      setTasks(prevTasks => [...prevTasks, task].sort((a, b) => {
        // Sort by due date (tasks without due dates go to end)
        if (!a.dueDateTime && !b.dueDateTime) return 0;
        if (!a.dueDateTime) return 1;
        if (!b.dueDateTime) return -1;
        return new Date(a.dueDateTime) - new Date(b.dueDateTime);
      }));
      setError(err.message);
      throw err;
    }
  };

  const createTask = async (taskData) => {
    if (!accessToken) return;
    
    try {
      return await graphRequest(accessToken, '/planner/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData)
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateTask = async (taskId, taskData) => {
    if (!accessToken) return;

    try {
      return await patchPlannerTask(accessToken, taskId, taskData);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateTaskDetails = async (taskId, description, etag) => {
    if (!accessToken) return;

    try {
      await graphRequest(accessToken, `/planner/tasks/${taskId}/details`, {
        method: 'PATCH',
        headers: { 'If-Match': etag },
        body: JSON.stringify({description})
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const fetchTaskDetails = async (taskId) => {
    if (!accessToken) return null;

    try {
      return await graphRequest(accessToken, `/planner/tasks/${taskId}/details`);
    } catch (err) {
      console.error('Error fetching task details:', err);
      return null;
    }
  };

  return {
    tasks,
    setTasks,
    plans,
    buckets,
    userProfiles,
    loading,
    error,
    setError,
    fetchAllTasks,
    completeTask,
    createTask,
    updateTask,
    updateTaskDetails,
    fetchTaskDetails
  };
}