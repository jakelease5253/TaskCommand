import React from 'react';
import { Target, X, Calendar, Folder, AlertCircle } from '../ui/icons';

export default function PriorityQueue({
  priorityTasks,
  plans,
  buckets,
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
      3: 'bg-orange-100 text-orange-700',
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
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Target className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Priority Queue</h2>
        </div>
        <p className="text-white/90 text-sm">
          Your top {priorityTasks.length} of 7 most important tasks
        </p>
        {priorityTasks.length === 7 && (
          <div className="mt-3 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-sm">
            ⚠️ Queue is full - remove a task to add another
          </div>
        )}
      </div>

      {/* Priority Tasks */}
      {priorityTasks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-800 mb-2">No Priority Tasks</h3>
          <p className="text-slate-600 text-sm">
            Drag tasks from the left to add them to your priority queue
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
              className={`bg-white rounded-xl shadow-sm border-2 border-slate-200 p-4 transition-all hover:shadow-md cursor-move ${
                focusTask?.id === task.id ? 'ring-2 ring-blue-500 border-blue-500' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Priority Number Badge */}
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 mb-2 truncate">{task.title}</h4>
                  
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mb-2">
                    <span className="flex items-center gap-1">
                      <Folder className="w-3 h-3" />
                      {plans[task.planId]}
                    </span>
                    <span>•</span>
                    <span>{getBucketName(task)}</span>
                    
                    {task.dueDateTime && (
                      <>
                        <span>•</span>
                        <span className={`flex items-center gap-1 ${isOverdue(task) ? 'text-red-600 font-medium' : ''}`}>
                          <Calendar className="w-3 h-3" />
                          {new Date(task.dueDateTime).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {getPriorityLabel(task.priority)}
                    </span>
                    {isOverdue(task) && (
                      <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                        <AlertCircle className="w-3 h-3" />
                        Overdue
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => onRemoveFromPriority(task.id)}
                    className="p-1.5 bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-lg transition-colors"
                    title="Remove from priority"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onSetFocus(task)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      focusTask?.id === task.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title={focusTask?.id === task.id ? 'Stop focusing' : 'Focus on this task'}
                  >
                    <Target className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}