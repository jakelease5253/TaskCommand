import React from "react";
import { X, Calendar, Target } from "../ui/icons";

export default function EditTaskModal({
  isOpen,
  task,
  onClose,
  onSubmit,
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center p-4 z-50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow p-4 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Edit Task</h3>
          <button type="button" onClick={onClose} className="icon-btn p-2 hover:bg-slate-100 rounded">
            <X />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block">
            <span className="text-sm">Title</span>
            <input
              name="title"
              defaultValue={task?.title}
              className="input w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm inline-flex items-center gap-1">
                <Calendar /> Due
              </span>
              <input
                name="dueDate"
                type="date"
                defaultValue={task?.dueDateTime ? task.dueDateTime.split("T")[0] : ""}
                className="input w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </label>

            <label className="block">
              <span className="text-sm inline-flex items-center gap-1">
                <Target /> Priority
              </span>
              <select
                name="priority"
                defaultValue={task?.priority ?? 5}
                className="input w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value={1}>Urgent</option>
                <option value={3}>Important</option>
                <option value={5}>Medium</option>
                <option value={9}>Low</option>
              </select>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn px-4 py-2 border border-slate-300 rounded-lg">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-4 py-2 rounded-lg text-white gradient-primary disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
