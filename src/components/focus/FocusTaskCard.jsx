import React from "react";
import { Target, Calendar, Clock, Folder, Edit, Check, AlertCircle } from "../ui/icons";

export default function FocusTaskCard({
  task,
  elapsed,
  planName,
  bucketName,
  onComplete,
  onEdit,
  formatTime,
}) {
  const getDaysUntilDue = (task) => {
    if (!task.dueDateTime) return null;
    const dueDate = new Date(task.dueDateTime);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isOverdue = (task) => {
    if (!task.dueDateTime) return false;
    const dueDateStr = task.dueDateTime.split('T')[0];
    const dueDate = new Date(dueDateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today && task.percentComplete < 100;
  };

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

  const daysUntil = getDaysUntilDue(task);
  const overdue = isOverdue(task);

  return (
    <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border-2 border-blue-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-3 h-3 rounded-full animate-pulse bg-blue-500" />
            <h3 className="text-lg font-semibold text-slate-800">
              🎯 Focus Mode Active
            </h3>
          </div>
          <h4 className="text-2xl font-bold text-slate-900 mb-4">{task.title}</h4>
          
          {/* Task Description */}
          {task.description && (
            <div className="mb-4 p-4 bg-white rounded-xl shadow-sm">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}
          
          {/* Task Details Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Folder className="text-blue-600" />
              <span className="font-medium">{planName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <span className="font-medium">{bucketName || 'No Bucket'}</span>
            </div>
            {task.dueDateTime && (
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Calendar className="text-blue-600" />
                <span>{new Date(task.dueDateTime).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                {getPriorityLabel(task.priority)}
              </span>
            </div>
          </div>

          {/* Focus Timer */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="text-blue-600" />
                <span className="text-sm font-medium text-slate-700">Focus Time:</span>
              </div>
              <div className="text-2xl font-mono font-bold text-blue-600">
                {formatTime(elapsed)}
              </div>
            </div>
          </div>

          {/* Overdue Warning */}
          {overdue && (
            <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              <AlertCircle />
              <span className="font-medium">This task is overdue!</span>
            </div>
          )}
          {!overdue && daysUntil !== null && daysUntil <= 3 && daysUntil > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-orange-600 bg-orange-50 rounded-lg px-3 py-2">
              <AlertCircle />
              <span className="font-medium">Due in {daysUntil} day{daysUntil !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 ml-6">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(task)}
              className="px-6 py-3 rounded-xl bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50 transition-all font-medium shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <Edit />
              Edit Task
            </button>
          )}
          <button
            type="button"
            onClick={onComplete}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all font-medium shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <Check />
            Complete Task
          </button>
        </div>
      </div>
    </div>
  );
}