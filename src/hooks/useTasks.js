import { useState, useEffect } from 'react';

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
      const groupsResponse = await fetch('https://graph.microsoft.com/v1.0/me/planner/plans', {
        headers: {'Authorization': `Bearer ${accessToken}`}
      });

      // Check for unauthorized (expired token)
      if (groupsResponse.status === 401) {
        console.log('Token expired, clearing authentication...');
        localStorage.removeItem('taskcommand_access_token');
        window.location.reload();
        return;
      }

      const groupsData = await groupsResponse.json();
      const plansMap = {};
      groupsData.value.forEach(plan => {
        plansMap[plan.id] = plan.title;
      });
      setPlans(plansMap);

      // Fetch buckets for each plan
      const bucketsMap = {};
      for (const planId of Object.keys(plansMap)) {
        const bucketsResponse = await fetch(`https://graph.microsoft.com/v1.0/planner/plans/${planId}/buckets`, {
          headers: {'Authorization': `Bearer ${accessToken}`}
        });
        const bucketsData = await bucketsResponse.json();
        bucketsMap[planId] = bucketsData.value;
      }
      setBuckets(bucketsMap);

      // Fetch tasks
      const tasksResponse = await fetch('https://graph.microsoft.com/v1.0/me/planner/tasks', {
        headers: {'Authorization': `Bearer ${accessToken}`}
      });
      const tasksData = await tasksResponse.json();
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
          const userResponse = await fetch(`https://graph.microsoft.com/v1.0/users/${userId}`, {
            headers: {'Authorization': `Bearer ${accessToken}`}
          });
          
          // Check if we got a valid response
          if (userResponse.ok) {
            const userData = await userResponse.json();
            profiles[userId] = userData.displayName || userData.userPrincipalName || 'Unknown';
          } else {
            // Don't log 403 errors - just mark as Unknown
            profiles[userId] = 'User';
          }
        } catch (err) {
          profiles[userId] = 'User';
        }
      }
      setUserProfiles(profiles);
    } catch (err) {
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
      // Fetch fresh task to get current etag
      const taskResponse = await fetch(
        `https://graph.microsoft.com/v1.0/planner/tasks/${taskId}`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );
      const freshTask = await taskResponse.json();

      // Mark as complete using fresh etag
      const updateResponse = await fetch(
        `https://graph.microsoft.com/v1.0/planner/tasks/${taskId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'If-Match': freshTask['@odata.etag']
          },
          body: JSON.stringify({ percentComplete: 100 })
        }
      );

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error?.message || 'Failed to complete task');
      }

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
      const response = await fetch('https://graph.microsoft.com/v1.0/planner/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });

      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateTask = async (taskId, taskData) => {
    if (!accessToken) return;
    
    try {
      const detailsResponse = await fetch(`https://graph.microsoft.com/v1.0/planner/tasks/${taskId}/details`, {
        headers: {'Authorization': `Bearer ${accessToken}`}
      });
      const details = await detailsResponse.json();

      await fetch(`https://graph.microsoft.com/v1.0/planner/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'If-Match': details['@odata.etag']
        },
        body: JSON.stringify(taskData)
      });

      return details;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateTaskDetails = async (taskId, description, etag) => {
    if (!accessToken) return;
    
    try {
      await fetch(`https://graph.microsoft.com/v1.0/planner/tasks/${taskId}/details`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'If-Match': etag
        },
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
      const detailsResponse = await fetch(`https://graph.microsoft.com/v1.0/planner/tasks/${taskId}/details`, {
        headers: {'Authorization': `Bearer ${accessToken}`}
      });
      const details = await detailsResponse.json();
      return details;
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