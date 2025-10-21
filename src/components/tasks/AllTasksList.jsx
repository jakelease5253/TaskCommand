import React from 'react';
import { Edit, Check, Calendar, Folder, Users, AlertCircle, Target, Plus } from '../ui/icons';

export default function AllTasksList({
  tasks,
  plans,
  buckets,
  userProfiles,
  focusTask,
  priorityTaskIds,
  loading,
  onNewTask,
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

  const getDaysUntilDue = (task) => {
    if (!task.dueDateTime) return null;
    const dueDate = new Date(task.dueDateTime);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Check />
        </div>
        <h3 className="text-xl font-medium text-slate-800 mb-2">No tasks found</h3>
        <p className="text-slate-600 mb-6">Try adjusting your filters or create a new task</p>
        <button
          onClick={onNewTask}
          className="inline-flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-xl transition-all font-medium shadow-md hover:shadow-lg"
        >
          <Plus />
          Create Task
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            All Tasks
            <span className="ml-2 text-sm font-normal text-slate-500">
              ({tasks.length} {tasks.length === 1 ? 'task' : 'tasks'})
            </span>
          </h2>
          <button
            onClick={onNewTask}
            className="inline-flex items-center gap-2 px-4 py-2 gradient-primary text-white rounded-lg transition-all font-medium shadow-md hover:shadow-lg"
          >
            <Plus />
            New Task
          </button>
        </div>
      </div>

      {/* Task Cards */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading tasks...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const isInPriority = priorityTaskIds.includes(task.id);
            
            return (
              <div
                key={task.id}
                draggable
                onDragStart={() => onDragStart(task, 'all')}
                onDragOver={(e) => onDragOver(e, task, 'all')}
                onDragEnd={onDragEnd}
                className={`bg-white rounded-xl shadow-sm border border-slate-200 p-5 transition-all hover:shadow-md cursor-move ${
                  focusTask?.id === task.id ? 'ring-2 ring-blue-500 border-blue-500' : ''
                } ${isInPriority ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start gap-4">
                  {/* Task Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        {/* Task Title */}
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {task.title}
                          </h3>
                          {isInPriority && (
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                              In Priority
                            </span>
                          )}
                        </div>

                        {/* Task Metadata */}
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                          {/* Plan Name */}
                          <span className="flex items-center gap-1">
                            <Folder />
                            {plans[task.planId]}
                          </span>

                          {/* Bucket Name */}
                          <span className="flex items-center gap-1">
                            {getBucketName(task)}
                          </span>

                          {/* Priority Badge */}
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                              task.priority
                            )}`}
                          >
                            {getPriorityLabel(task.priority)}
                          </span>

                          {/* Due Date */}
                          {task.dueDateTime && (
                            <span
                              className={`flex items-center gap-1 ${
                                isOverdue(task) ? 'text-red-600 font-medium' : ''
                              }`}
                            >
                              <Calendar />
                              {new Date(task.dueDateTime).toLocaleDateString()}
                              {getDaysUntilDue(task) !== null && (
                                <span className="text-xs">
                                  ({getDaysUntilDue(task)} days)
                                </span>
                              )}
                            </span>
                          )}

                          {/* Assigned Users */}
                          {task.assignments && Object.keys(task.assignments).length > 0 && (
                            <span className="flex items-center gap-1">
                              <Users />
                              {Object.keys(task.assignments)
                                .map((userId) => userProfiles[userId] || 'Unknown')
                                .join(', ')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {/* Focus Button */}
                        <button
                          onClick={() => onSetFocus(task)}
                          className={`p-2 rounded-lg transition-colors ${
                            focusTask?.id === task.id
                              ? 'gradient-primary text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                          title={
                            focusTask?.id === task.id
                              ? 'Stop focusing'
                              : 'Focus on this task'
                          }
                        >
                          <Target />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => onEdit(task)}
                          className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          <Edit />
                        </button>

                        {/* Complete Button */}
                        <button
                          onClick={() => onComplete(task.id)}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          <Check />
                        </button>
                      </div>
                    </div>

                    {/* Overdue Warning */}
                    {isOverdue(task) && (
                      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                        <AlertCircle />
                        <span className="font-medium">Overdue</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}