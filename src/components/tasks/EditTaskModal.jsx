import React, { useState } from "react";
import { X, Calendar, Target, AlertCircle } from "../ui/icons";

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
      // Fetch current task details to get etag
      const detailsResponse = await fetch(`https://graph.microsoft.com/v1.0/planner/tasks/${task.id}/details`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const details = await detailsResponse.json();

      // Update basic task properties
      const updateData = {
        title,
        priority
      };

      if (dueDate) {
        updateData.dueDateTime = new Date(dueDate).toISOString();
      }

      await fetch(`https://graph.microsoft.com/v1.0/planner/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'If-Match': details['@odata.etag']
        },
        body: JSON.stringify(updateData)
      });

      // Update description if changed
      if (description !== undefined) {
        await fetch(`https://graph.microsoft.com/v1.0/planner/tasks/${task.id}/details`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'If-Match': details['@odata.etag']
          },
          body: JSON.stringify({ description })
        });
      }

      onTaskUpdated();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center p-4 z-50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-slate-800">Edit Task</h3>
          <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5"><AlertCircle /></div>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
            <input
              name="title"
              defaultValue={task.title}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              name="description"
              defaultValue={task.description || ''}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <span className="inline-flex items-center gap-1">
                  <Calendar /> Due Date
                </span>
              </label>
              <input
                name="dueDate"
                type="date"
                defaultValue={task.dueDateTime ? task.dueDateTime.split("T")[0] : ""}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <span className="inline-flex items-center gap-1">
                  <Target /> Priority
                </span>
              </label>
              <select
                name="priority"
                defaultValue={task.priority ?? 5}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value={1}>Urgent</option>
                <option value={3}>Important</option>
                <option value={5}>Medium</option>
                <option value={9}>Low</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 gradient-primary text-white rounded-lg transition-all font-medium disabled:opacity-50 shadow-md hover:shadow-lg"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}