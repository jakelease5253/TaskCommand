import React, { useState } from "react";
import { Target, Calendar, Clock, Folder, Edit, Check, AlertCircle, Zap } from "../ui/icons";
import ChecklistEditor from "../tasks/ChecklistEditor";

export default function FocusTaskCard({
  task,
  checklist = {},
  detailsEtag,
  accessToken,
  elapsed,
  planName,
  bucketName,
  onComplete,
  onEdit,
  onUnfocus,
  onEnterFocusMode,
  formatTime,
  onChecklistUpdate,
}) {
  const [updatingChecklist, setUpdatingChecklist] = useState(false);
  const [checklistError, setChecklistError] = useState(null);

  // Clean checklist by removing read-only properties
  const cleanChecklist = (checklist) => {
    const cleaned = {};
    Object.keys(checklist).forEach(itemId => {
      const item = checklist[itemId];
      cleaned[itemId] = {
        '@odata.type': item['@odata.type'] || '#microsoft.graph.plannerChecklistItem',
        title: item.title,
        isChecked: item.isChecked,
        orderHint: item.orderHint
      };
    });
    return cleaned;
  };

  // Handle checklist changes and immediately save to server
  const handleChecklistChange = async (updatedChecklist) => {
    if (updatingChecklist) return; // Prevent multiple simultaneous updates

    setUpdatingChecklist(true);
    setChecklistError(null);

    try {
      // Fetch fresh etag before updating
      const detailsResponse = await fetch(
        `https://graph.microsoft.com/v1.0/planner/tasks/${task.id}/details`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const detailsData = await detailsResponse.json();
      const freshEtag = detailsData['@odata.etag'];

      // Clean the checklist before sending to API
      const cleanedChecklist = cleanChecklist(updatedChecklist);

      const response = await fetch(
        `https://graph.microsoft.com/v1.0/planner/tasks/${task.id}/details`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'If-Match': freshEtag
          },
          body: JSON.stringify({
            checklist: cleanedChecklist
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update checklist');
      }

      // Refresh the checklist data
      if (onChecklistUpdate) {
        await onChecklistUpdate();
      }
    } catch (err) {
      console.error('Error updating checklist:', err);
      setChecklistError(err.message);
      // Refresh to revert changes
      if (onChecklistUpdate) {
        await onChecklistUpdate();
      }
    } finally {
      setUpdatingChecklist(false);
    }
  };

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
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
      marginBottom: '24px'
    }}>
      <div style={{ display: 'flex', padding: '20px', paddingBottom: '12px' }}>
        {/* Left Content */}
        <div style={{ flex: 1, paddingRight: '20px' }}>
          {/* Title */}
          <h3 style={{
            fontFamily: 'Poppins',
            fontSize: '28px',
            fontWeight: '900',
            color: 'var(--theme-primary-dark)',
            marginBottom: '12px',
            marginTop: 0
          }}>
            {task.title}
          </h3>

          {/* Plan/Bucket Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Folder size={16} style={{ color: 'var(--theme-primary-dark)' }} />
            <span style={{
              fontFamily: 'Poppins',
              fontSize: '13px',
              fontWeight: '400',
              color: 'var(--theme-primary-dark)'
            }}>
              {planName} : {bucketName || 'To Do'}
            </span>
          </div>

          {/* Description */}
          {task.description && (
            <div style={{
              backgroundColor: '#f3f4f6',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '20px',
              border: '1px solid #e5e7eb'
            }}>
              <p style={{
                fontFamily: 'Poppins',
                fontSize: '14px',
                color: 'var(--theme-primary-dark)',
                whiteSpace: 'pre-wrap',
                margin: 0,
                lineHeight: '1.6'
              }}>
                {task.description}
              </p>
            </div>
          )}

          {/* Checklist */}
          {Object.keys(checklist).length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              {checklistError && (
                <div style={{
                  marginBottom: '8px',
                  padding: '8px',
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fca5a5',
                  borderRadius: '8px',
                  fontFamily: 'Poppins',
                  fontSize: '12px',
                  color: '#dc2626'
                }}>
                  {checklistError}
                </div>
              )}
              <div className={updatingChecklist ? 'opacity-50 pointer-events-none' : ''}>
                <ChecklistEditor
                  checklist={checklist}
                  onChange={handleChecklistChange}
                  readOnly={true}
                />
              </div>
            </div>
          )}

          {/* Overdue/Due Soon Warnings */}
          {overdue && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: '#fee2e2',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              <AlertCircle size={16} style={{ color: '#dc2626' }} />
              <span style={{
                fontFamily: 'Poppins',
                fontSize: '13px',
                fontWeight: '500',
                color: '#dc2626'
              }}>
                This task is overdue!
              </span>
            </div>
          )}
          {!overdue && daysUntil !== null && daysUntil <= 3 && daysUntil > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: '#fed7aa',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              <AlertCircle size={16} style={{ color: '#ea580c' }} />
              <span style={{
                fontFamily: 'Poppins',
                fontSize: '13px',
                fontWeight: '500',
                color: '#ea580c'
              }}>
                Due in {daysUntil} day{daysUntil !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Right Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '280px' }}>
          {onEnterFocusMode && (
            <button
              type="button"
              onClick={onEnterFocusMode}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 20px',
                height: '44px',
                backgroundColor: 'var(--theme-primary)',
                color: 'var(--theme-primary-dark)',
                border: 'none',
                borderRadius: '12px',
                fontFamily: 'Poppins',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
                transition: 'all 0.2s ease',
                width: '100%'
              }}
              title="Enter immersive focus mode"
            >
              <Zap size={18} style={{ color: 'var(--theme-primary-dark)' }} />
              Enter Focus Mode
            </button>
          )}
          {onUnfocus && (
            <button
              type="button"
              onClick={() => onUnfocus(task)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 20px',
                height: '44px',
                backgroundColor: 'var(--theme-primary-dark)',
                color: 'var(--theme-primary)',
                border: 'none',
                borderRadius: '12px',
                fontFamily: 'Poppins',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
                transition: 'all 0.2s ease',
                width: '100%'
              }}
              title="Stop focusing on this task"
            >
              <Target size={18} style={{ color: 'var(--theme-primary)' }} />
              Unfocus Task
            </button>
          )}
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(task)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 20px',
                height: '44px',
                backgroundColor: 'var(--theme-primary)',
                color: 'var(--theme-primary-dark)',
                border: 'none',
                borderRadius: '12px',
                fontFamily: 'Poppins',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
                transition: 'all 0.2s ease',
                width: '100%'
              }}
            >
              <Edit size={18} style={{ color: 'var(--theme-primary-dark)' }} />
              Edit Task
            </button>
          )}
          <button
            type="button"
            onClick={onComplete}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 20px',
              height: '44px',
              backgroundColor: 'var(--theme-primary-dark)',
              color: 'var(--theme-primary)',
              border: 'none',
              borderRadius: '12px',
              fontFamily: 'Poppins',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
              transition: 'all 0.2s ease',
              width: '100%'
            }}
          >
            <Check size={18} style={{ color: 'var(--theme-primary)' }} />
            Complete Task
          </button>
        </div>
      </div>

      {/* Due Date */}
      {task.dueDateTime && (
        <div style={{
          fontFamily: 'Poppins',
          fontSize: '13px',
          fontWeight: '600',
          color: 'var(--theme-primary-dark)',
          padding: '0 20px 12px 20px'
        }}>
          Due Date: {new Date(task.dueDateTime).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </div>
      )}

      {/* Focus Timer Bar */}
      <div style={{
        backgroundColor: 'var(--theme-primary)',
        borderRadius: '24px',
        padding: '12px 36px',
        margin: '0 20px 20px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '48px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--theme-primary-dark)">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2" stroke="var(--theme-primary)" strokeWidth="2" strokeLinecap="round" fill="none"/>
          </svg>
          <span style={{
            fontFamily: 'Poppins',
            fontSize: '15px',
            fontWeight: '400',
            color: 'var(--theme-primary-dark)'
          }}>
            Focus Timer:
          </span>
        </div>
        <span style={{
          fontFamily: 'Poppins',
          fontSize: '24px',
          fontWeight: '700',
          color: 'var(--theme-primary-dark)'
        }}>
          {(() => {
            const totalSeconds = elapsed;
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            if (hours > 0) {
              return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            } else {
              return `${minutes}:${String(seconds).padStart(2, '0')}`;
            }
          })()}
        </span>
      </div>
    </div>
  );
}