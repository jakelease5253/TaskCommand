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

        // Fetch task details to get its etag and description
        const detailsResponse = await fetch(
          `https://graph.microsoft.com/v1.0/planner/tasks/${task.id}/details`,
          { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        const detailsData = await detailsResponse.json();
        setDetailsEtag(detailsData['@odata.etag']);
        setCurrentDescription(detailsData.description || '');
      } catch (err) {
        console.error('Error fetching task data:', err);
        setError('Failed to load task data');
      }
    };

    if (task && accessToken) {
      fetchTaskData();
    }
  }, [task, accessToken]);

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
      // Update basic task properties (title, priority, due date)
      const updateData = {
        title,
        priority
      };

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

      onTaskUpdated();
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
              disabled={loading || !taskEtag || !detailsEtag}
              className="flex-1 px-6 py-3 gradient-primary text-white rounded-xl transition-all font-medium disabled:opacity-50 shadow-md hover:shadow-lg"
            >
              {loading ? "Updating..." : "Update Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}