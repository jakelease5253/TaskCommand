import React, { useState } from 'react';
import { Target, X, Clock, Calendar } from '../ui/icons';
import { useTheme } from '../../contexts/ThemeContext';

export default function GoalSettingsModal({
  isOpen,
  onClose,
  workHours,
  dailyGoals,
  onSave
}) {
  const { theme } = useTheme();
  const [localWorkHours, setLocalWorkHours] = useState(workHours);
  const [localDailyGoals, setLocalDailyGoals] = useState(dailyGoals);
  const [selectedDay, setSelectedDay] = useState('monday');

  if (!isOpen) return null;

  // Get theme colors
  const colors = theme.colors;

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  const handleSave = () => {
    onSave({
      workHours: localWorkHours,
      dailyGoals: localDailyGoals
    });
    onClose();
  };

  const handleWorkHoursChange = (day, field, value) => {
    setLocalWorkHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleDailyGoalsChange = (day, field, value) => {
    setLocalDailyGoals(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: parseInt(value, 10) || 0
      }
    }));
  };

  const currentDay = localWorkHours[selectedDay];
  const currentGoals = localDailyGoals[selectedDay];

  // Calculate weekly totals
  const weeklyTotals = days.reduce((acc, { key }) => {
    if (localWorkHours[key].enabled) {
      acc.morningTasks += localDailyGoals[key].morningTasks;
      acc.afternoonTasks += localDailyGoals[key].afternoonTasks;
      acc.focusTime += localDailyGoals[key].focusTime;
    }
    return acc;
  }, { morningTasks: 0, afternoonTasks: 0, focusTime: 0 });

  const totalTasks = weeklyTotals.morningTasks + weeklyTotals.afternoonTasks;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
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
                <Target size={24} style={{ color: colors.primaryDark }} />
              </div>
              <div>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  fontFamily: 'Poppins',
                  color: colors.primary,
                  margin: 0,
                  marginBottom: '2px'
                }}>Goals & Work Hours</h2>
                <p style={{
                  fontSize: '12px',
                  fontFamily: 'Poppins',
                  color: colors.textLight,
                  margin: 0
                }}>Configure your daily targets and work schedule</p>
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

        {/* Body - scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left: Day selector */}
            <div className="lg:col-span-1">
              <h3 style={{
                fontSize: '14px',
                fontWeight: '600',
                fontFamily: 'Poppins',
                color: 'var(--theme-primary-dark)',
                marginBottom: '12px'
              }}>Select Day</h3>
              <div className="space-y-2">
                {days.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDay(key)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      textAlign: 'left',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      backgroundColor: selectedDay === key ? colors.primary : '#ffffff',
                      color: selectedDay === key ? colors.primaryDark : colors.textSecondary,
                      fontFamily: 'Poppins',
                      fontSize: '14px',
                      fontWeight: selectedDay === key ? '600' : '400',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      if (selectedDay !== key) {
                        e.target.style.backgroundColor = '#f8fafc';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (selectedDay !== key) {
                        e.target.style.backgroundColor = '#ffffff';
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span>{label}</span>
                      {!localWorkHours[key].enabled && (
                        <span style={{
                          fontSize: '11px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: '#e5e7eb',
                          color: '#64748b'
                        }}>Off</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Weekly Summary */}
              <div style={{
                marginTop: '24px',
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e5e7eb'
              }}>
                <h4 style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  fontFamily: 'Poppins',
                  color: 'var(--theme-primary-dark)',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Weekly Total</h4>
                <div className="space-y-2">
                  <div style={{
                    fontSize: '11px',
                    fontFamily: 'Poppins',
                    color: '#64748b'
                  }}>
                    <span style={{ fontWeight: '600', color: 'var(--theme-primary-dark)' }}>{totalTasks}</span> total tasks
                  </div>
                  <div style={{
                    fontSize: '11px',
                    fontFamily: 'Poppins',
                    color: '#64748b'
                  }}>
                    <span style={{ fontWeight: '600', color: 'var(--theme-primary-dark)' }}>{weeklyTotals.morningTasks}</span> morning
                  </div>
                  <div style={{
                    fontSize: '11px',
                    fontFamily: 'Poppins',
                    color: '#64748b'
                  }}>
                    <span style={{ fontWeight: '600', color: 'var(--theme-primary-dark)' }}>{weeklyTotals.afternoonTasks}</span> afternoon
                  </div>
                  <div style={{
                    fontSize: '11px',
                    fontFamily: 'Poppins',
                    color: '#64748b'
                  }}>
                    <span style={{ fontWeight: '600', color: 'var(--theme-primary-dark)' }}>{weeklyTotals.focusTime}</span> min focus
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Day configuration */}
            <div className="lg:col-span-3 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    fontFamily: 'Poppins',
                    color: 'var(--theme-primary-dark)',
                    margin: 0
                  }}>{days.find(d => d.key === selectedDay)?.label}</h3>

                  {/* Enable/Disable toggle */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentDay.enabled}
                      onChange={(e) => handleWorkHoursChange(selectedDay, 'enabled', e.target.checked)}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{
                      fontSize: '14px',
                      fontFamily: 'Poppins',
                      color: 'var(--theme-primary-dark)',
                      fontWeight: '500'
                    }}>Working Day</span>
                  </label>
                </div>

                {currentDay.enabled ? (
                  <>
                    {/* Work Hours Section */}
                    <div style={{
                      padding: '20px',
                      borderRadius: '12px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e5e7eb',
                      marginBottom: '20px'
                    }}>
                      <div className="flex items-center gap-2 mb-4">
                        <Clock size={18} style={{ color: 'var(--theme-primary-dark)' }} />
                        <h4 style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          fontFamily: 'Poppins',
                          color: 'var(--theme-primary-dark)',
                          margin: 0
                        }}>Work Hours</h4>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: '500',
                            fontFamily: 'Poppins',
                            color: '#64748b',
                            marginBottom: '6px'
                          }}>Start Time</label>
                          <input
                            type="time"
                            value={currentDay.start}
                            onChange={(e) => handleWorkHoursChange(selectedDay, 'start', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '8px',
                              fontFamily: 'Poppins',
                              fontSize: '14px',
                              fontWeight: '500',
                              outline: 'none'
                            }}
                            onFocus={(e) => {
                              e.target.style.boxShadow = `0 0 0 2px ${colors.primary}`;
                              e.target.style.borderColor = colors.primary;
                            }}
                            onBlur={(e) => {
                              e.target.style.boxShadow = 'none';
                              e.target.style.borderColor = colors.border;
                            }}
                          />
                        </div>
                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: '500',
                            fontFamily: 'Poppins',
                            color: '#64748b',
                            marginBottom: '6px'
                          }}>End Time</label>
                          <input
                            type="time"
                            value={currentDay.end}
                            onChange={(e) => handleWorkHoursChange(selectedDay, 'end', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '8px',
                              fontFamily: 'Poppins',
                              fontSize: '14px',
                              fontWeight: '500',
                              outline: 'none'
                            }}
                            onFocus={(e) => {
                              e.target.style.boxShadow = `0 0 0 2px ${colors.primary}`;
                              e.target.style.borderColor = colors.primary;
                            }}
                            onBlur={(e) => {
                              e.target.style.boxShadow = 'none';
                              e.target.style.borderColor = colors.border;
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Task Goals Section */}
                    <div style={{
                      padding: '20px',
                      borderRadius: '12px',
                      backgroundColor: colors.primaryLight,
                      border: `1px solid ${colors.primary}`
                    }}>
                      <div className="flex items-center gap-2 mb-4">
                        <Target size={18} style={{ color: 'var(--theme-primary-dark)' }} />
                        <h4 style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          fontFamily: 'Poppins',
                          color: 'var(--theme-primary-dark)',
                          margin: 0
                        }}>Daily Task Goals</h4>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: '500',
                            fontFamily: 'Poppins',
                            color: '#64748b',
                            marginBottom: '6px'
                          }}>Morning Tasks</label>
                          <input
                            type="number"
                            min="0"
                            max="20"
                            value={currentGoals.morningTasks}
                            onChange={(e) => handleDailyGoalsChange(selectedDay, 'morningTasks', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '8px',
                              fontFamily: 'Poppins',
                              fontSize: '14px',
                              fontWeight: '500',
                              outline: 'none'
                            }}
                            onFocus={(e) => {
                              e.target.style.boxShadow = `0 0 0 2px ${colors.primary}`;
                              e.target.style.borderColor = colors.primary;
                            }}
                            onBlur={(e) => {
                              e.target.style.boxShadow = 'none';
                              e.target.style.borderColor = colors.border;
                            }}
                          />
                        </div>
                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: '500',
                            fontFamily: 'Poppins',
                            color: '#64748b',
                            marginBottom: '6px'
                          }}>Afternoon Tasks</label>
                          <input
                            type="number"
                            min="0"
                            max="20"
                            value={currentGoals.afternoonTasks}
                            onChange={(e) => handleDailyGoalsChange(selectedDay, 'afternoonTasks', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '8px',
                              fontFamily: 'Poppins',
                              fontSize: '14px',
                              fontWeight: '500',
                              outline: 'none'
                            }}
                            onFocus={(e) => {
                              e.target.style.boxShadow = `0 0 0 2px ${colors.primary}`;
                              e.target.style.borderColor = colors.primary;
                            }}
                            onBlur={(e) => {
                              e.target.style.boxShadow = 'none';
                              e.target.style.borderColor = colors.border;
                            }}
                          />
                        </div>
                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: '500',
                            fontFamily: 'Poppins',
                            color: '#64748b',
                            marginBottom: '6px'
                          }}>Focus Time (min)</label>
                          <input
                            type="number"
                            min="0"
                            max="480"
                            step="15"
                            value={currentGoals.focusTime}
                            onChange={(e) => handleDailyGoalsChange(selectedDay, 'focusTime', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '8px',
                              fontFamily: 'Poppins',
                              fontSize: '14px',
                              fontWeight: '500',
                              outline: 'none'
                            }}
                            onFocus={(e) => {
                              e.target.style.boxShadow = `0 0 0 2px ${colors.primary}`;
                              e.target.style.borderColor = colors.primary;
                            }}
                            onBlur={(e) => {
                              e.target.style.boxShadow = 'none';
                              e.target.style.borderColor = colors.border;
                            }}
                          />
                        </div>
                      </div>

                      <div style={{
                        marginTop: '12px',
                        padding: '12px',
                        borderRadius: '6px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb'
                      }}>
                        <p style={{
                          fontSize: '12px',
                          fontFamily: 'Poppins',
                          color: '#64748b',
                          margin: 0
                        }}>
                          <strong style={{ color: 'var(--theme-primary-dark)' }}>Total: {currentGoals.morningTasks + currentGoals.afternoonTasks} tasks</strong>
                          {' '}• Morning and afternoon periods are split at the midpoint of your work hours
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontFamily: 'Poppins'
                  }}>
                    <Calendar size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                    <p>This day is marked as a non-working day.</p>
                    <p style={{ fontSize: '14px' }}>Enable it above to set goals and work hours.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Actions */}
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#ffffff'
        }}>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px 24px',
                border: '1px solid #d1d5db',
                color: 'var(--theme-primary-dark)',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'Poppins',
                fontWeight: '500',
                fontSize: '14px',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#f8fafc'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#ffffff'}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              style={{
                flex: 1,
                padding: '12px 24px',
                backgroundColor: colors.primary,
                color: colors.primaryDark,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'Poppins',
                fontWeight: '500',
                fontSize: '14px',
                boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
                transition: 'opacity 0.2s'
              }}
              onMouseOver={(e) => e.target.style.opacity = '0.9'}
              onMouseOut={(e) => e.target.style.opacity = '1'}
            >
              Save Goals
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
