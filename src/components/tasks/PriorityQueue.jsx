import React from 'react';
import { Target, X, Calendar, Folder, AlertCircle, Edit, Check, Users } from '../ui/icons';

export default function PriorityQueue({
  priorityTasks,
  plans,
  buckets,
  userProfiles,
  focusTask,
  onRemoveFromPriority,
  onReorder,
  onSetFocus,
  onEdit,
  onComplete,
  onDragStart,
  onDragOver,
  onDragEnd
}) {
  const getBucketName = (task) => {
    const planBuckets = buckets[task.planId] || [];
    const bucket = planBuckets.find(b => b.id === task.bucketId);
    return bucket ? bucket.name : 'No Bucket';
  };

  const getPriorityLabel = (priority) => {
    const labels = { 1: 'Urgent', 3: 'Important', 5: 'Medium', 9: 'Low' };
    return labels[priority] || 'Medium';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      1: 'bg-red-100 text-red-700',
      3: 'bg-orange-200 text-orange-700',
      5: 'bg-blue-100 text-blue-700',
      9: 'bg-slate-100 text-slate-700'
    };
    return colors[priority] || 'bg-blue-100 text-blue-700';
  };

  const isOverdue = (task) => {
    if (!task.dueDateTime) return false;
    const dueDateStr = task.dueDateTime.split('T')[0];
    const dueDate = new Date(dueDateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today && task.percentComplete < 100;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div style={{
        backgroundColor: 'var(--theme-primary-dark)',
        borderRadius: '12px',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0px 2px 8px rgba(0,0,0,0.15)'
      }}>
        <Target size={24} style={{ color: 'var(--theme-primary)' }} />
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: 'Poppins',
            fontSize: '16px',
            fontWeight: '600',
            color: 'var(--theme-primary)'
          }}>
            Priority Queue
          </div>
          <div style={{
            fontFamily: 'Poppins',
            fontSize: '13px',
            fontWeight: '400',
            color: 'var(--theme-primary)'
          }}>
            Your top {priorityTasks.length} most important tasks
          </div>
        </div>
      </div>

      {/* Priority Tasks */}
      {priorityTasks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-800 mb-2">No Priority Tasks</h3>
          <p className="text-slate-600 text-sm">
            Drag tasks from below to add them to your priority queue
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {priorityTasks.map((task, index) => (
            <div
              key={task.id}
              draggable
              onDragStart={() => onDragStart(task, 'priority')}
              onDragOver={(e) => onDragOver(e, task, 'priority')}
              onDragEnd={onDragEnd}
              style={{
                backgroundColor: '#d1d5db',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: 'move',
                boxShadow: '0px 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              {/* Priority Number Badge */}
              <div style={{
                width: '36px',
                height: '36px',
                backgroundColor: 'var(--theme-primary-dark)',
                color: 'var(--theme-primary)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Poppins',
                fontSize: '18px',
                fontWeight: '700',
                flexShrink: 0
              }}>
                {index + 1}
              </div>

              {/* Task Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'Poppins',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: 'var(--theme-primary-dark)',
                  marginBottom: '6px'
                }}>
                  {task.title}
                </div>

                {/* Single line metadata */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'Poppins',
                  fontSize: '12px',
                  color: 'var(--theme-primary-dark)'
                }}>
                  {/* Due Date */}
                  {task.dueDateTime && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} style={{ color: 'var(--theme-primary-dark)' }} />
                        {new Date(task.dueDateTime).toLocaleDateString()}
                      </div>
                      <span>•</span>
                    </>
                  )}

                  {/* Plan */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Folder size={12} style={{ color: 'var(--theme-primary-dark)' }} />
                    {plans[task.planId]}
                  </div>
                  <span>•</span>

                  {/* Bucket */}
                  <span>{getBucketName(task)}</span>

                  {/* Assignees */}
                  {task.assignments && Object.keys(task.assignments).length > 0 && (
                    <>
                      <span>•</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users size={12} style={{ color: 'var(--theme-primary-dark)' }} />
                        {Object.keys(task.assignments)
                          .map((userId) => userProfiles[userId] || 'Unknown')
                          .join(', ')}
                      </div>
                    </>
                  )}

                  {/* Priority */}
                  <span>•</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {getPriorityLabel(task.priority)}
                  </span>
                </div>
              </div>

              {/* Action Buttons - Rounded Squares */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {/* Focus Toggle */}
                <button
                  onClick={() => onSetFocus(task)}
                  style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: focusTask?.id === task.id ? 'var(--theme-primary)' : 'var(--theme-primary-dark)',
                    borderRadius: '8px',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0px 2px 8px rgba(0,0,0,0.15)'
                  }}
                  title={focusTask?.id === task.id ? 'Stop focusing' : 'Focus on this task'}
                >
                  <Target size={18} style={{ color: focusTask?.id === task.id ? 'var(--theme-primary-dark)' : 'var(--theme-primary)' }} />
                </button>

                {/* Remove from Priority Queue */}
                <button
                  onClick={() => onRemoveFromPriority(task.id)}
                  style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: '#fca5a5',
                    borderRadius: '8px',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0px 2px 8px rgba(0,0,0,0.15)'
                  }}
                  title="Remove from priority"
                >
                  <X size={18} style={{ color: '#ffffff' }} />
                </button>

                {/* Edit Task */}
                <button
                  onClick={() => onEdit(task)}
                  style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: 'var(--theme-primary)',
                    borderRadius: '8px',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0px 2px 8px rgba(0,0,0,0.15)'
                  }}
                  title="Edit task"
                >
                  <Edit size={18} style={{ color: 'var(--theme-primary-dark)' }} />
                </button>

                {/* Complete Task */}
                <button
                  onClick={() => onComplete(task.id)}
                  style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: '#86efac',
                    borderRadius: '8px',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0px 2px 8px rgba(0,0,0,0.15)'
                  }}
                  title="Complete task"
                >
                  <Check size={18} style={{ color: '#ffffff' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}