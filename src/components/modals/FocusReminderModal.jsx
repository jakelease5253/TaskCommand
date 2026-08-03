import React from 'react';
import { Clock, CheckSquare, AlertCircle } from '../ui/icons';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * FocusReminderModal - Prompts user every 15 minutes during focus mode
 *
 * Helps ensure user is still working on the focus task and hasn't
 * switched to something else without updating the focus task.
 *
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {object} focusTask - The current focus task object
 * @param {Function} onKeepGoing - Called when user confirms they're still working
 * @param {Function} onSwitchTask - Called when user wants to switch to a different task
 * @param {Function} onTakeBreak - Called when user wants to pause/take a break
 */
export default function FocusReminderModal({
  isOpen,
  focusTask,
  onKeepGoing,
  onSwitchTask,
  onTakeBreak
}) {
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4"
      style={{
        backdropFilter: 'blur(4px)'
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
        style={{
          animation: 'fadeIn 0.3s ease-out',
          border: `2px solid ${theme.colors.primary}`
        }}
      >
        {/* Header */}
        <div
          className="p-6 border-b"
          style={{
            borderColor: theme.colors.primaryLight,
            backgroundColor: theme.colors.primaryLight
          }}
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: '12px',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Clock
                size={24}
                style={{ color: theme.colors.primaryDark }}
              />
            </div>
            <div>
              <h2
                className="text-xl font-semibold"
                style={{
                  fontFamily: 'Poppins',
                  color: theme.colors.primaryDark
                }}
              >
                Focus Check-In
              </h2>
              <p
                className="text-sm mt-1"
                style={{
                  fontFamily: 'Poppins',
                  color: '#64748b'
                }}
              >
                15 minutes have passed
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p
            className="text-base mb-4"
            style={{
              fontFamily: 'Poppins',
              color: '#334155',
              lineHeight: '1.6'
            }}
          >
            Are you still working on this task?
          </p>

          {/* Current Task Display */}
          <div
            className="p-4 rounded-lg mb-6"
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}
          >
            <div className="flex items-start gap-3">
              <CheckSquare
                size={20}
                style={{
                  color: theme.colors.primary,
                  marginTop: '2px',
                  flexShrink: 0
                }}
              />
              <div style={{ flex: 1 }}>
                <p
                  className="font-medium"
                  style={{
                    fontFamily: 'Poppins',
                    color: theme.colors.primaryDark,
                    fontSize: '15px',
                    lineHeight: '1.5'
                  }}
                >
                  {focusTask?.title || 'Current Focus Task'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Keep Going - Primary Action */}
            <button
              onClick={onKeepGoing}
              className="w-full py-3 px-4 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: theme.colors.primary,
                color: theme.colors.primaryDark,
                fontFamily: 'Poppins',
                fontSize: '15px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = '0.9';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = '1';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              ✓ Keep Going
            </button>

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onSwitchTask}
                className="py-3 px-4 rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#64748b',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f8fafc';
                  e.target.style.borderColor = theme.colors.primary;
                  e.target.style.color = theme.colors.primaryDark;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.borderColor = '#cbd5e1';
                  e.target.style.color = '#64748b';
                }}
              >
                Switch Task
              </button>

              <button
                onClick={onTakeBreak}
                className="py-3 px-4 rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#64748b',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f8fafc';
                  e.target.style.borderColor = theme.colors.primary;
                  e.target.style.color = theme.colors.primaryDark;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.borderColor = '#cbd5e1';
                  e.target.style.color = '#64748b';
                }}
              >
                Take a Break
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div
          className="px-6 py-4 border-t"
          style={{
            borderColor: '#e2e8f0',
            backgroundColor: '#f8fafc'
          }}
        >
          <p
            className="text-xs text-center"
            style={{
              fontFamily: 'Poppins',
              color: '#94a3b8'
            }}
          >
            💡 This reminder helps you stay focused on the right task
          </p>
        </div>
      </div>
    </div>
  );
}
