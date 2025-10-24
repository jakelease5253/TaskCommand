// src/components/focus/FocusTaskCard.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import ProgressBar from './ProgressBar';
import Checklist from './Checklist';
import EditTaskModal from '../tasks/EditTaskModal';

export default function FocusTaskCard({
  task,
  focusedTaskWithDetails,
  elapsed,
  planName,
  bucketName,
  onComplete,
  formatTime,
  onToggleChecklist,
  onReorderChecklist,
  accessToken,
  plans,
  buckets,
  onUpdateTask,
}) {
  // Normalize task source
  const t = useMemo(() => task ?? focusedTaskWithDetails ?? null, [task, focusedTaskWithDetails]);

  // Local state for modal editing
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSeed, setEditSeed] = useState(null);

  const handleOpenEdit = useCallback((e) => {
    e?.stopPropagation?.();
    if (!t) return;

    // Deep-clone snapshot to avoid live prop churn overwriting edits
    let snapshot;
    try {
      snapshot = JSON.parse(JSON.stringify(t));
    } catch {
      snapshot = { ...t, checklist: Array.isArray(t.checklist) ? [...t.checklist] : [] };
    }
    setEditSeed(snapshot);
    setShowEditModal(true);
  }, [t]);

  const handleCloseEdit = useCallback(() => {
    setShowEditModal(false);
    setEditSeed(null);
  }, []);

  if (!t) {
    // Graceful fallback if no focus task yet
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-2xl mx-auto mb-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-2/3" />
          <div className="h-4 bg-slate-100 rounded w-1/3" />
          <div className="h-24 bg-slate-50 rounded" />
        </div>
      </div>
    );
  }

  // Task info and helpers
  const title = t.title?.trim() || 'Focused Task';
  const checklist = Array.isArray(t.checklist) ? t.checklist : [];
  const completedCount = checklist.filter(i => i?.isChecked).length;
  const progressPct = checklist.length ? Math.round((completedCount / checklist.length) * 100) : 0;
  const isCompleted = t.percentComplete === 100 || progressPct === 100;

  const isoDue = t.dueDateTime ?? t.dueDate ?? null;
  const dueDate = isoDue ? new Date(isoDue) : null;
  const daysUntilDue = dueDate ? Math.ceil((dueDate - Date.now()) / (1000 * 60 * 60 * 24)) : null;
  const overdue = daysUntilDue != null && daysUntilDue < 0;

  const dueLabel = !isoDue
    ? 'No due date'
    : overdue
      ? `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) === 1 ? '' : 's'}`
      : `${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'} remaining`;

  const priorityLabel = (() => {
    const p = t.priority;
    if (p === 0 || p === 'urgent') return 'Urgent';
    if (p === 1 || p === 'important' || p === 'high') return 'Important';
    if (p === 2 || p === 'medium' || p === 'normal') return 'Medium';
    return 'Low';
  })();

  // --- Render ---
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-2xl mx-auto mb-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-slate-800 break-words">{title}</h2>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("🛠 Focus Edit clicked", t); // 👈 add this line
                  handleOpenEdit(e);
                }}
                className="px-1.5 py-0.5 border border-slate-300 rounded-md text-slate-600 hover:bg-slate-100"
                title="Edit task"
              >
                ✏️
              </button>
          </div>
          <div className="mt-1 text-sm text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1">
            {planName && <span>Plan: {planName}</span>}
            {bucketName && <span>• {bucketName}</span>}
            {t.assignedTo && <span>• Assigned to {t.assignedTo}</span>}
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-xs text-slate-500">Focus Time</div>
          <div className="text-2xl font-mono font-bold text-blue-600">
            {typeof formatTime === 'function' ? formatTime(elapsed) : elapsed}
          </div>
        </div>
      </div>

      {/* Meta info */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span>{dueLabel}</span>
        </div>

        <div className="flex items-center gap-2">
          {isCompleted ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <XCircle className="w-4 h-4 text-slate-400" />
          )}
          <span className={isCompleted ? 'text-green-600 font-medium' : ''}>
            {isCompleted ? 'Completed' : 'In Progress'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <AlertTriangle
            className={`w-4 h-4 ${
              priorityLabel === 'Urgent'
                ? 'text-red-600'
                : priorityLabel === 'Important'
                ? 'text-orange-500'
                : 'text-slate-400'
            }`}
          />
          <span>Priority: {priorityLabel}</span>
        </div>
      </div>

      {/* Description */}
      {t.description && (
        <div className="mt-5 p-4 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap">
          {t.description}
        </div>
      )}

      {/* Checklist */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Checklist</h3>
          {checklist.length > 0 && (
            <span className="text-xs text-slate-500">
              {progressPct}% ({completedCount}/{checklist.length})
            </span>
          )}
        </div>

        {checklist.length > 0 && <ProgressBar value={progressPct} />}

        <div className={checklist.length > 0 ? 'mt-3' : ''}>
          <Checklist
            items={checklist}
            onToggle={(item) => onToggleChecklist?.(t, item)}
            onReorder={(nextItems) => onReorderChecklist?.(t, nextItems)}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 flex justify-between items-center">
        <div className="text-xs text-slate-400">
          {t.createdDateTime ? `Created: ${new Date(t.createdDateTime).toLocaleDateString()}` : ''}
        </div>
        <button
          type="button"
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isCompleted ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          onClick={() => onComplete?.(t.id)}
        >
          {isCompleted ? 'Completed' : 'Mark Complete'}
        </button>
      </div>

      {showEditModal && (
        <EditTaskModal
          isOpen={showEditModal}
          onClose={handleCloseEdit}
          task={editSeed || t}
          accessToken={accessToken}
          plans={plans}
          buckets={buckets}
          onSave={async (updated) => {
            try {
              await onUpdateTask?.(updated); // ✅ delegate to parent
              handleCloseEdit();
            } catch (err) {
              console.error('Failed to save task', err);
              alert('Error saving changes — check console for details.');
            }
          }}
        />
      )}
    </div>
  );
}
