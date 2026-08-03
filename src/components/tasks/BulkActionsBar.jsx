import React, { useState } from 'react';
import { Check, X, Calendar, Users, AlertCircle, Folder } from '../ui/icons';

export default function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onBulkComplete,
  onBulkAssignee,
  onBulkDueDate,
  onBulkPriority,
  onBulkMove
}) {
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      backgroundColor: 'var(--theme-primary-dark)',
      borderTop: '2px solid var(--theme-primary)',
      boxShadow: '0px -4px 16px rgba(0,0,0,0.3)'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Selection count and clear */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: 'var(--theme-primary)',
                color: 'var(--theme-primary-dark)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Poppins',
                fontWeight: '700',
                fontSize: '14px'
              }}>
                {selectedCount}
              </div>
              <span style={{
                fontSize: '14px',
                fontFamily: 'Poppins',
                fontWeight: '500',
                color: 'var(--theme-primary)'
              }}>
                {selectedCount} {selectedCount === 1 ? 'task' : 'tasks'} selected
              </span>
            </div>
            <button
              onClick={onClearSelection}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                fontSize: '13px',
                fontFamily: 'Poppins',
                color: 'var(--theme-primary)',
                backgroundColor: 'transparent',
                border: '1px solid var(--theme-primary)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = 'var(--theme-primary)'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onBulkComplete}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#86efac',
                color: '#ffffff',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Poppins',
                fontWeight: '500',
                fontSize: '13px',
                transition: 'opacity 0.2s'
              }}
              onMouseOver={(e) => e.target.style.opacity = '0.8'}
              onMouseOut={(e) => e.target.style.opacity = '1'}
            >
              <Check className="w-4 h-4" />
              Complete
            </button>

            <div className="relative">
              <button
                onClick={() => setShowPriorityMenu(!showPriorityMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: 'var(--theme-primary)',
                  color: 'var(--theme-primary-dark)',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Poppins',
                  fontWeight: '500',
                  fontSize: '13px',
                  transition: 'opacity 0.2s'
                }}
                onMouseOver={(e) => e.target.style.opacity = '0.8'}
                onMouseOut={(e) => e.target.style.opacity = '1'}
              >
                <AlertCircle className="w-4 h-4" />
                Priority
              </button>
              {showPriorityMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                  <button
                    onClick={() => {
                      onBulkPriority(1);
                      setShowPriorityMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2"
                  >
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    Urgent
                  </button>
                  <button
                    onClick={() => {
                      onBulkPriority(3);
                      setShowPriorityMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-orange-50 flex items-center gap-2"
                  >
                    <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                    Important
                  </button>
                  <button
                    onClick={() => {
                      onBulkPriority(5);
                      setShowPriorityMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 flex items-center gap-2"
                  >
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    Medium
                  </button>
                  <button
                    onClick={() => {
                      onBulkPriority(9);
                      setShowPriorityMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                  >
                    <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                    Low
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={onBulkDueDate}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: 'var(--theme-primary)',
                color: 'var(--theme-primary-dark)',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Poppins',
                fontWeight: '500',
                fontSize: '13px',
                transition: 'opacity 0.2s'
              }}
              onMouseOver={(e) => e.target.style.opacity = '0.8'}
              onMouseOut={(e) => e.target.style.opacity = '1'}
            >
              <Calendar className="w-4 h-4" />
              Due Date
            </button>

            <button
              onClick={onBulkAssignee}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: 'var(--theme-primary)',
                color: 'var(--theme-primary-dark)',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Poppins',
                fontWeight: '500',
                fontSize: '13px',
                transition: 'opacity 0.2s'
              }}
              onMouseOver={(e) => e.target.style.opacity = '0.8'}
              onMouseOut={(e) => e.target.style.opacity = '1'}
            >
              <Users className="w-4 h-4" />
              Assignee
            </button>

            <button
              onClick={onBulkMove}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: 'var(--theme-primary)',
                color: 'var(--theme-primary-dark)',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Poppins',
                fontWeight: '500',
                fontSize: '13px',
                transition: 'opacity 0.2s'
              }}
              onMouseOver={(e) => e.target.style.opacity = '0.8'}
              onMouseOut={(e) => e.target.style.opacity = '1'}
            >
              <Folder className="w-4 h-4" />
              Move
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
