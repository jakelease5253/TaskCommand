import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import ProgressBar from './ProgressBar';
import Checklist from './Checklist';
import EditTaskModal from '../tasks/EditTaskModal';

export default function FocusTaskCard({
  task,
  elapsed,
  planName,
  bucketName,
  onComplete,
  formatTime,
  onToggleChecklist,
  onReorderChecklist
}) {
  if (!task) return null;

  const checklist = Array.isArray(task.checklist) ? task.checklist : [];
  const completedCount = checklist.filter(i => i.isChecked).length;
  const progressPct = checklist.length ? Math.round((completedCount / checklist.length) * 100) : 0;

  const isCompleted = task.percentComplete === 100 || progressPct === 100;
  const priority =
    task.priority === 0
      ? 'Urgent'
      : task.priority === 1
      ? 'Important'
      : task.priority === 2
      ? 'Medium'
      : 'Low';

  const dueDate = task.dueDateTime ? new Date(task.dueDateTime) : null;
  const daysUntilDue = dueDate
    ? Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const overdue = daysUntilDue != null && daysUntilDue < 0;

  const dueLabel = overdue
    ? `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) === 1 ? '' : 's'}`
    : daysUntilDue != null
    ? `${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'} remaining`
    : 'No due date';

  const [showEdit, setShowEdit] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-2xl mx-auto mb-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-slate-800 break-words">
              {task.title || 'Focused Task'}
            </h2>
              <button
                onClick={() => setShowEdit(true)}
                className="ml-1 px-2 py-1 rounded-md border border-slate-300 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition text-sm font-medium"
                title="Edit task"
              >
                ✏️ Edit
              </button>
          </div>
          <div className="mt-1 text-sm text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1">
            {planName ? <span className="truncate">Plan: {planName}</span> : null}
            {bucketName ? <span className="truncate">• {bucketName}</span> : null}
            {task.assignedTo ? (
              <span className="truncate">• Assigned to {task.assignedTo}</span>
            ) : null}
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-xs text-slate-500">Focus Time</div>
          <div className="text-2xl font-mono font-bold text-blue-600">
            {typeof formatTime === 'function' ? formatTime(elapsed) : elapsed}
          </div>
        </div>
      </div>

      {/* Meta info row */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span className="text-slate-700">{dueLabel}</span>
        </div>

        <div className="flex items-center gap-2">
          {isCompleted ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <XCircle className="w-4 h-4 text-slate-400" />
          )}
          <span className={isCompleted ? 'text-green-600 font-medium' : 'text-slate-700'}>
            {isCompleted ? 'Completed' : 'In Progress'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <AlertTriangle
            className={`w-4 h-4 ${
              priority === 'Urgent'
                ? 'text-red-600'
                : priority === 'Important'
                ? 'text-orange-500'
                : 'text-slate-400'
            }`}
          />
          <span className="text-slate-700">Priority: {priority}</span>
        </div>
      </div>

      {/* Description (only for focus) */}
      {task.description ? (
        <div className="mt-5 p-4 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap">
          {task.description}
        </div>
      ) : null}

      {/* Checklist Section */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            Checklist
          </h3>
          {checklist.length > 0 ? (
            <span className="text-xs text-slate-500">
              {progressPct}% ({completedCount}/{checklist.length})
            </span>
          ) : null}
        </div>

        {/* Only show the progress bar if there are checklist items */}
        {checklist.length > 0 ? <ProgressBar value={progressPct} /> : null}

        <div className={checklist.length > 0 ? 'mt-3' : ''}>
          <Checklist
            items={checklist}
            onToggle={(item) => onToggleChecklist && onToggleChecklist(task, item)}
            onReorder={(nextItems) => onReorderChecklist && onReorderChecklist(task, nextItems)}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 flex justify-between items-center">
        <div className="text-xs text-slate-400">
          {task.createdDateTime
            ? `Created: ${new Date(task.createdDateTime).toLocaleDateString()}`
            : ''}
        </div>

        <button
          type="button"
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isCompleted
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          onClick={() => onComplete && onComplete(task.id)}
        >
          {isCompleted ? 'Completed' : 'Mark Complete'}
        </button>
      </div>
    {showEdit && (
      <EditTaskModal
        task={task}
        onClose={() => setShowEdit(false)}
        onSave={(updatedTask) => {
          if (typeof onComplete === 'function') {
            onComplete(updatedTask.id, updatedTask);
          }
          setShowEdit(false);
        }}
      />
    )}
    </div>
  );
}
