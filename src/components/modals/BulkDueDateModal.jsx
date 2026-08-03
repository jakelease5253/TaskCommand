import { useState } from 'react';
import { X, Calendar } from '../ui/icons';
import { useTheme } from '../../contexts/ThemeContext';

export default function BulkDueDateModal({
  isOpen,
  selectedTaskIds,
  onClose,
  onSetDueDate
}) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [selectedDate, setSelectedDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedDate) {
      onSetDueDate(selectedTaskIds, selectedDate);
      onClose();
    }
  };

  const handleClearDueDate = () => {
    onSetDueDate(selectedTaskIds, null);
    onClose();
  };

  if (!isOpen) return null;

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: `2px solid ${colors.primary}`,
          backgroundColor: colors.primaryDark
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: colors.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Calendar size={24} style={{ color: colors.primaryDark }} />
              </div>
              <div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  fontFamily: 'Poppins',
                  color: colors.primary,
                  margin: 0
                }}>Set Due Date</h2>
                <p style={{
                  fontSize: '12px',
                  fontFamily: 'Poppins',
                  color: colors.primary,
                  margin: 0,
                  marginTop: '2px'
                }}>
                  Setting due date for {selectedTaskIds.size} task{selectedTaskIds.size > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px',
                backgroundColor: colors.primary,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X style={{ color: colors.primaryDark }} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Date Selection */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              fontFamily: 'Poppins',
              color: colors.text,
              marginBottom: '8px'
            }}>
              Select Due Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={today}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                fontFamily: 'Poppins',
                fontSize: '14px',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.primary;
                e.target.style.boxShadow = `0 0 0 2px ${colors.primary}33`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.border;
                e.target.style.boxShadow = 'none';
              }}
            />
            <p style={{
              fontSize: '12px',
              fontFamily: 'Poppins',
              color: colors.textSecondary,
              marginTop: '8px',
              margin: 0
            }}>
              Leave empty and click &quot;Clear Due Date&quot; to remove due dates
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={handleClearDueDate}
              style={{
                flex: 1,
                padding: '10px 16px',
                border: `1px solid ${colors.border}`,
                backgroundColor: 'white',
                color: colors.text,
                borderRadius: '8px',
                fontFamily: 'Poppins',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = colors.backgroundSecondary}
              onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
            >
              Clear Due Date
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 16px',
                border: `1px solid ${colors.border}`,
                backgroundColor: 'white',
                color: colors.text,
                borderRadius: '8px',
                fontFamily: 'Poppins',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = colors.backgroundSecondary}
              onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedDate}
              style={{
                padding: '10px 24px',
                backgroundColor: selectedDate ? colors.primaryDark : colors.disabled,
                color: selectedDate ? colors.primary : colors.textLight,
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'Poppins',
                fontSize: '14px',
                fontWeight: '600',
                cursor: selectedDate ? 'pointer' : 'not-allowed',
                transition: 'opacity 0.2s',
                opacity: selectedDate ? 1 : 0.6
              }}
              onMouseOver={(e) => { if (selectedDate) e.target.style.opacity = '0.9'; }}
              onMouseOut={(e) => { if (selectedDate) e.target.style.opacity = '1'; }}
            >
              Set Date
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
