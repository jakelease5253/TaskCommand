import React, { useState, useEffect } from "react";
import { X, AlertCircle } from "../ui/icons";

export default function EditTaskModal({
  task,
  accessToken,
  plans,
  buckets,
  onClose,
  onTaskUpdated,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [taskEtag, setTaskEtag] = useState(null);
  const [detailsEtag, setDetailsEtag] = useState(null);
  const [currentDescription, setCurrentDescription] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState(task.planId || '');
  const [selectedBucketId, setSelectedBucketId] = useState(task.bucketId || '');
  const [assignments, setAssignments] = useState({});
  const [users, setUsers] = useState([]);

  // Fetch the current task and details to get etags
  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        // Fetch task to get its etag
        const taskResponse = await fetch(
          `https://graph.microsoft.com/v1.0/planner/tasks/${task.id}`,
          { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        const taskData = await taskResponse.json();
        setTaskEtag(taskData['@odata.etag']);
        setAssignments(taskData.assignments || {});

        // Update plan and bucket from fresh API data
        if (taskData.planId) {
          setSelectedPlanId(taskData.planId);
        }
        if (taskData.bucketId) {
          setSelectedBucketId(taskData.bucketId);
        }

        // Fetch task details to get its etag and description
        const detailsResponse = await fetch(
          `https://graph.microsoft.com/v1.0/planner/tasks/${task.id}/details`,
          { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        const detailsData = await detailsResponse.json();
        setDetailsEtag(detailsData['@odata.etag']);
        setCurrentDescription(detailsData.description || '');

        // Fetch group members for assignment
        if (taskData.planId) {
          const planResponse = await fetch(
            `https://graph.microsoft.com/v1.0/planner/plans/${taskData.planId}`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
          );
          const planData = await planResponse.json();

          const membersResponse = await fetch(
            `https://graph.microsoft.com/v1.0/groups/${planData.owner}/members`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
          );
          const membersData = await membersResponse.json();
          setUsers(membersData.value || []);
        }
      } catch (err) {
        console.error('Error fetching task data:', err);
        setError('Failed to load task data');
      }
    };

    if (task && accessToken) {
      fetchTaskData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.id, accessToken]); // Only depend on task.id, not the entire task object

  if (!task) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.target);
    const title = formData.get('title');
    const dueDate = formData.get('dueDate');
    const priority = parseInt(formData.get('priority'));
    const description = formData.get('description');

    try {
      // Clean up assignments - remove read-only properties
      const cleanedAssignments = {};
      Object.keys(assignments).forEach(userId => {
        if (assignments[userId]) {
          // Only include the required properties, not read-only ones like assignedBy
          cleanedAssignments[userId] = {
            '@odata.type': '#microsoft.graph.plannerAssignment',
            orderHint: ' !'
          };
        } else {
          // Set to null to remove assignment
          cleanedAssignments[userId] = null;
        }
      });

      // Update basic task properties (title, priority, due date, plan, bucket, assignments)
      const updateData = {
        title,
        priority,
        assignments: cleanedAssignments
      };

      // Add planId if changed
      if (selectedPlanId && selectedPlanId !== task.planId) {
        updateData.planId = selectedPlanId;
      }

      // Add bucket if changed (or if plan changed, must update bucket)
      if (selectedBucketId && (selectedBucketId !== task.bucketId || selectedPlanId !== task.planId)) {
        updateData.bucketId = selectedBucketId;
      }

      if (dueDate) {
        // Parse the date as local and set to noon UTC to avoid timezone issues
        const [year, month, day] = dueDate.split('-');
        const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0));
        updateData.dueDateTime = date.toISOString();
      } else {
        updateData.dueDateTime = null; // Clear due date if empty
      }

      const taskResponse = await fetch(
        `https://graph.microsoft.com/v1.0/planner/tasks/${task.id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'If-Match': taskEtag
          },
          body: JSON.stringify(updateData)
        }
      );

      if (!taskResponse.ok) {
        const errorData = await taskResponse.json();
        throw new Error(errorData.error?.message || 'Failed to update task');
      }

      // Update description if it changed
      if (description !== currentDescription) {
        const detailsResponse = await fetch(
          `https://graph.microsoft.com/v1.0/planner/tasks/${task.id}/details`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'If-Match': detailsEtag
            },
            body: JSON.stringify({ description })
          }
        );

        if (!detailsResponse.ok) {
          const errorData = await detailsResponse.json();
          throw new Error(errorData.error?.message || 'Failed to update description');
        }
      }

      // Call the callback if it exists
      if (typeof onTaskUpdated === 'function') {
        onTaskUpdated();
      } else {
        console.error('onTaskUpdated is not a function:', onTaskUpdated);
        // Close modal anyway
        onClose();
      }
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Format date for input field
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Handle plan change
  const handlePlanChange = async (e) => {
    const planId = e.target.value;
    setSelectedPlanId(planId);
    // Reset bucket when plan changes
    setSelectedBucketId('');
    // Clear assignments when plan changes (users from old plan won't be in new plan)
    setAssignments({});

    // Fetch users for the new plan
    if (planId && accessToken) {
      try {
        const planResponse = await fetch(
          `https://graph.microsoft.com/v1.0/planner/plans/${planId}`,
          { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        const planData = await planResponse.json();

        const membersResponse = await fetch(
          `https://graph.microsoft.com/v1.0/groups/${planData.owner}/members`,
          { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        const membersData = await membersResponse.json();
        setUsers(membersData.value || []);
      } catch (err) {
        console.error('Error fetching users for new plan:', err);
        setUsers([]);
      }
    } else {
      setUsers([]);
    }
  };

  // Handle assignment toggle
  const toggleAssignment = (userId) => {
    setAssignments(prev => {
      const newAssignments = { ...prev };
      if (newAssignments[userId]) {
        delete newAssignments[userId];
      } else {
        newAssignments[userId] = {
          '@odata.type': '#microsoft.graph.plannerAssignment',
          orderHint: ' !'
        };
      }
      return newAssignments;
    });
  };

  // Get buckets for selected plan (buckets is an object with planId as keys)
  const filteredBuckets = selectedPlanId ? (buckets?.[selectedPlanId] || []) : [];

  // Convert plans object to array for dropdown
  const plansArray = plans ? Object.entries(plans).map(([id, title]) => ({ id, title })) : [];

  // Check if plans/buckets data is loaded
  const isDataLoaded = plansArray.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-800">Edit Task</h2>
            <button 
              type="button" 
              onClick={onClose} 
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5"><AlertCircle /></div>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {!isDataLoaded && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5"><AlertCircle /></div>
              <p className="text-sm text-blue-800">Loading plans and buckets data...</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Task Title *
            </label>
            <input
              name="title"
              type="text"
              defaultValue={task.title}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              defaultValue={currentDescription}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter task description"
              rows="4"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Plan *
              </label>
              <select
                value={selectedPlanId}
                onChange={handlePlanChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                <option value="">Select a plan</option>
                {plansArray.map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Bucket *
              </label>
              <select
                value={selectedBucketId}
                onChange={(e) => setSelectedBucketId(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
                disabled={!selectedPlanId}
              >
                <option value="">Select a bucket</option>
                {filteredBuckets.map(bucket => (
                  <option key={bucket.id} value={bucket.id}>
                    {bucket.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Assign To
            </label>
            <div className="border border-slate-300 rounded-lg p-3 max-h-48 overflow-y-auto">
              {users.length === 0 ? (
                <p className="text-sm text-slate-500">No users available</p>
              ) : (
                <div className="space-y-2">
                  {users.map(user => (
                    <label
                      key={user.id}
                      className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={!!assignments[user.id]}
                        onChange={() => toggleAssignment(user.id)}
                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-700">
                        {user.displayName || user.userPrincipalName}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Due Date
              </label>
              <input
                name="dueDate"
                type="date"
                defaultValue={formatDateForInput(task.dueDateTime)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Priority
              </label>
              <select
                name="priority"
                defaultValue={task.priority || 5}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="1">Urgent</option>
                <option value="3">Important</option>
                <option value="5">Medium</option>
                <option value="9">Low</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !taskEtag || !detailsEtag || !isDataLoaded}
              className="flex-1 px-6 py-3 gradient-primary text-white rounded-xl transition-all font-medium disabled:opacity-50 shadow-md hover:shadow-lg"
            >
              {loading ? "Updating..." : !isDataLoaded ? "Loading..." : "Update Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}