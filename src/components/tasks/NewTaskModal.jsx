import React, { useState, useEffect } from "react";
import { X, AlertCircle } from "../ui/icons";

export default function NewTaskModal({
  accessToken,
  plans = {},
  buckets = {},
  currentUserId,
  onClose,
  onTaskCreated,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [availableBuckets, setAvailableBuckets] = useState([]);
  const [planMembers, setPlanMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Update available buckets when plan changes
  useEffect(() => {
    if (selectedPlanId && buckets[selectedPlanId]) {
      setAvailableBuckets(buckets[selectedPlanId]);
    } else {
      setAvailableBuckets([]);
    }
  }, [selectedPlanId, buckets]);

  // Fetch plan members when plan changes
  useEffect(() => {
    if (selectedPlanId) {
      fetchPlanMembers(selectedPlanId);
    } else {
      setPlanMembers([]);
    }
  }, [selectedPlanId, accessToken]);

  const fetchPlanMembers = async (planId) => {
    setLoadingMembers(true);
    try {
      // First, get the group ID associated with the plan
      const planResponse = await fetch(`https://graph.microsoft.com/v1.0/planner/plans/${planId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const plan = await planResponse.json();
      const groupId = plan.owner;

      // Then get the members of that group
      const membersResponse = await fetch(`https://graph.microsoft.com/v1.0/groups/${groupId}/members`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const membersData = await membersResponse.json();

      setPlanMembers(membersData.value || []);
    } catch (err) {
      console.error('Error fetching plan members:', err);
      setPlanMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.target);
    const title = formData.get('title');
    const description = formData.get('description');
    const planId = formData.get('planId');
    const bucketId = formData.get('bucketId');
    const dueDate = formData.get('dueDate');
    const priority = parseInt(formData.get('priority'));
    const assignedToUserId = formData.get('assignedTo');

    try {
      // Create task
      const taskData = {
        planId,
        bucketId,
        title,
      };

      if (dueDate) {
        // Parse the date as local and set to noon UTC to avoid timezone issues
        const [year, month, day] = dueDate.split('-');
        const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0));
        taskData.dueDateTime = date.toISOString();
      }

      if (priority) {
        taskData.priority = priority;
      }

      // Add assignment if a user is selected
      if (assignedToUserId) {
        taskData.assignments = {
          [assignedToUserId]: {
            "@odata.type": "#microsoft.graph.plannerAssignment",
            orderHint: " !"
          }
        };
      }

      const response = await fetch('https://graph.microsoft.com/v1.0/planner/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create task');
      }

      const newTask = await response.json();

      // If there's a description, update task details
      if (description) {
        const detailsResponse = await fetch(`https://graph.microsoft.com/v1.0/planner/tasks/${newTask.id}/details`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const details = await detailsResponse.json();

        await fetch(`https://graph.microsoft.com/v1.0/planner/tasks/${newTask.id}/details`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'If-Match': details['@odata.etag']
          },
          body: JSON.stringify({ description })
        });
      }

      onTaskCreated();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-800">Create New Task</h2>
            <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
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

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Task Title *</label>
            <input
              name="title"
              type="text"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              name="description"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter task description"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Plan *</label>
              <select
                name="planId"
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                <option value="">Select a plan</option>
                {Object.entries(plans).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Bucket</label>
              <select
                name="bucketId"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={!selectedPlanId}
              >
                <option value="">Select a bucket (optional)</option>
                {availableBuckets.map((bucket) => (
                  <option key={bucket.id} value={bucket.id}>{bucket.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Assign To</label>
            <select
              name="assignedTo"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={!selectedPlanId || loadingMembers}
              defaultValue={currentUserId || ""}
            >
              <option value="">Unassigned</option>
              {planMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.displayName || member.userPrincipalName}
                </option>
              ))}
            </select>
            {loadingMembers && (
              <p className="text-xs text-slate-500 mt-1">Loading members...</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Due Date</label>
              <input
                name="dueDate"
                type="date"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
              <select
                name="priority"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                defaultValue="5"
              >
                <option value="1">Urgent</option>
                <option value="3">Important</option>
                <option value="5">Medium</option>
                <option value="9">Low</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 gradient-primary text-white rounded-xl transition-all font-medium disabled:opacity-50 shadow-md hover:shadow-lg"
            >
              {loading ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}