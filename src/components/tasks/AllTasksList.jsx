import React from 'react';
import { Edit, Check, Calendar, Folder, Users, AlertCircle, Target, ChevronDown, ChevronUp } from '../ui/icons';

export default function AllTasksList({
  tasks,
  totalTasks = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  plans,
  buckets,
  userProfiles,
  focusTask,
  priorityTaskIds,
  loading,
  isCollapsed = false,
  selectedTaskIds = new Set(),
  onToggleCollapse,
  onToggleSelection,
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
        <p className="text-slate-600">Try adjusting your filters or use the sidebar to create a new task</p>
      </div>
    );
  }

  const hasSelections = selectedTaskIds.size > 0;

  return (
    <div>
      {/* Header */}
      <div style={{
        marginBottom: '16px',
        backgroundColor: 'var(--theme-primary-dark)',
        borderRadius: '12px',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0px 2px 8px rgba(0,0,0,0.15)'
      }}>
        <button
          onClick={onToggleCollapse}
          style={{
            width: '32px',
            height: '32px',
            backgroundColor: 'var(--theme-primary)',
            borderRadius: '8px',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0
          }}
          title={isCollapsed ? "Expand All Tasks" : "Collapse All Tasks"}
        >
          {isCollapsed ?
            <ChevronDown className="w-5 h-5" style={{ color: 'var(--theme-primary-dark)' }} /> :
            <ChevronUp className="w-5 h-5" style={{ color: 'var(--theme-primary-dark)' }} />
          }
        </button>
        <h2 style={{
          fontFamily: 'Poppins',
          fontSize: '16px',
          fontWeight: '600',
          color: 'var(--theme-primary)',
          margin: 0
        }}>
          All Tasks
          <span style={{
            marginLeft: '8px',
            fontSize: '13px',
            fontWeight: '400',
            color: 'var(--theme-primary)'
          }}>
            ({totalTasks} {totalTasks === 1 ? 'task' : 'tasks'})
          </span>
        </h2>
      </div>

      {/* Task Cards */}
      {!isCollapsed && (loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading tasks...</p>
        </div>
      ) : (
        <div className="space-y-3" style={{ marginBottom: hasSelections ? '80px' : '16px' }}>
          {tasks.map((task) => {
            const isInPriority = priorityTaskIds.includes(task.id);
            
            return (
              <div
                key={task.id}
                draggable
                onDragStart={() => onDragStart(task, 'all')}
                onDragOver={(e) => onDragOver(e, task, 'all')}
                onDragEnd={onDragEnd}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  cursor: 'move',
                  boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
                  opacity: isInPriority ? 0.5 : 1
                }}
              >
                {/* Selection Checkbox */}
                <div style={{ flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedTaskIds.has(task.id)}
                    onChange={() => onToggleSelection && onToggleSelection(task.id)}
                    style={{
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Task Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Task Title with Badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '6px'
                  }}>
                    <div style={{
                      fontFamily: 'Poppins',
                      fontSize: '15px',
                      fontWeight: '600',
                      color: 'var(--theme-primary-dark)'
                    }}>
                      {task.title}
                    </div>
                    {isInPriority && (
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                        In Priority
                      </span>
                    )}
                  </div>

                  {/* Task Metadata - Reordered: Due Date, Plan, Bucket, Assignees, Priority */}
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
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: isOverdue(task) ? '#dc2626' : 'var(--theme-primary-dark)',
                          fontWeight: isOverdue(task) ? '600' : '400'
                        }}>
                          <Calendar size={12} style={{ color: isOverdue(task) ? '#dc2626' : 'var(--theme-primary-dark)' }} />
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

                  {/* Overdue Warning Banner */}
                  {isOverdue(task) && getDaysUntilDue(task) !== null && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      fontFamily: 'Poppins',
                      color: '#dc2626',
                      backgroundColor: '#fef2f2',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      marginTop: '8px'
                    }}>
                      <AlertCircle size={14} style={{ color: '#dc2626', flexShrink: 0 }} />
                      <span style={{ fontWeight: '600' }}>
                        Overdue by {Math.abs(getDaysUntilDue(task))} day{Math.abs(getDaysUntilDue(task)) === 1 ? '' : 's'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
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
            );
          })}
        </div>
      ))}

      {/* Pagination Controls */}
      {!isCollapsed && !loading && totalPages > 1 && (
        <div
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-4"
          style={{
            marginTop: '12px'
          }}
        >
          <div className="flex items-center justify-between" style={{ maxWidth: '1280px', margin: '0 auto' }}>
            {/* Showing X-Y of Z info */}
            <div className="text-sm text-slate-600">
              Showing {((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, totalTasks)} of {totalTasks}
            </div>

            {/* Page Navigation */}
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === 1
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  // Show first page, last page, current page, and pages around current
                  const showPage =
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    Math.abs(pageNum - currentPage) <= 1;

                  // Show ellipsis
                  const showEllipsisBefore = pageNum === currentPage - 2 && currentPage > 3;
                  const showEllipsisAfter = pageNum === currentPage + 2 && currentPage < totalPages - 2;

                  if (showEllipsisBefore || showEllipsisAfter) {
                    return <span key={pageNum} className="px-2 text-slate-400">...</span>;
                  }

                  if (!showPage) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`min-w-[2rem] px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? ''
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                      style={currentPage === pageNum ? {
                        backgroundColor: 'var(--theme-primary)',
                        color: 'var(--theme-primary-dark)'
                      } : {}}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === totalPages
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}