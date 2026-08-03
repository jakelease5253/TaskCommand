import React, { useState } from 'react';
import { TrendingUp, Clock, Target, CheckCircle, AlertCircle, BarChart } from '../../components/ui/icons';
import { useTheme } from '../../contexts/ThemeContext';

export default function Insights({
  tasks = [],
  completedTasksHistory = [],
  priorityQueue = [],
  plans = {},
  taskFocusTimes = {}
}) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [timeRange, setTimeRange] = useState('7days'); // 7days, 30days, 90days
  // Helper function to get date range
  const getDateRangeStart = () => {
    const now = new Date();
    switch (timeRange) {
      case '7days':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30days':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90days':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default:
        return new Date(0);
    }
  };

  // Filter completed tasks by time range
  const getFilteredCompletedTasks = () => {
    const startDate = getDateRangeStart();
    return completedTasksHistory.filter(task => {
      const completedDate = new Date(task.completedDateTime);
      return completedDate >= startDate;
    });
  };

  const filteredCompletedTasks = getFilteredCompletedTasks();

  // Calculate metrics
  const totalCompletedInRange = filteredCompletedTasks.length;
  const totalActiveTasks = tasks.filter(t => t.percentComplete < 100).length;
  const totalOverdueTasks = tasks.filter(t => {
    if (!t.dueDateTime || t.percentComplete === 100) return false;
    const dueDate = new Date(t.dueDateTime);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  }).length;

  // Calculate average completion time (focus time)
  const totalFocusTime = filteredCompletedTasks.reduce((sum, task) => sum + (task.focusTime || 0), 0);
  const avgFocusTimeMinutes = totalCompletedInRange > 0 ? Math.round(totalFocusTime / 60 / totalCompletedInRange) : 0;

  // Priority breakdown
  const priorityBreakdown = {
    urgent: filteredCompletedTasks.filter(t => t.priority === 1).length,
    important: filteredCompletedTasks.filter(t => t.priority === 3).length,
    medium: filteredCompletedTasks.filter(t => t.priority === 5).length,
    low: filteredCompletedTasks.filter(t => t.priority === 9).length,
  };

  // Plan breakdown
  const planBreakdown = {};
  filteredCompletedTasks.forEach(task => {
    const planName = plans[task.planId] || 'Unknown';
    planBreakdown[planName] = (planBreakdown[planName] || 0) + 1;
  });

  // Get top 5 plans
  const topPlans = Object.entries(planBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // On-time completion rate
  const tasksWithDueDate = filteredCompletedTasks.filter(t => t.dueDateTime);
  const onTimeTasks = tasksWithDueDate.filter(t => {
    const dueDate = new Date(t.dueDateTime);
    const completedDate = new Date(t.completedDateTime);
    return completedDate <= dueDate;
  });
  const onTimeRate = tasksWithDueDate.length > 0
    ? Math.round((onTimeTasks.length / tasksWithDueDate.length) * 100)
    : 0;

  // Completion velocity (tasks per day)
  const daysInRange = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
  const tasksPerDay = (totalCompletedInRange / daysInRange).toFixed(1);

  // Priority queue completion rate (tasks that were in priority queue when completed)
  const priorityTaskIds = priorityQueue.map(t => t.id || t);
  const completedPriorityTasks = filteredCompletedTasks.filter(t => priorityTaskIds.includes(t.id)).length;

  return (
    <div className="max-w-7xl mx-auto" style={{ paddingTop: '24px' }}>
      {/* Header with Time Range Selector */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            fontFamily: 'Poppins',
            color: colors.primaryDark,
            marginBottom: '8px'
          }}>
            Insights
          </h1>
          <p style={{
            fontSize: '16px',
            fontFamily: 'Poppins',
            color: colors.textSecondary
          }}>
            Discover patterns and trends in your productivity
          </p>
        </div>

        {/* Time Range Filter */}
        <div style={{
          display: 'flex',
          gap: '8px',
          backgroundColor: colors.background,
          padding: '4px',
          borderRadius: '12px',
          border: `1px solid ${colors.border}`
        }}>
          {['7days', '30days', '90days'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontFamily: 'Poppins',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                backgroundColor: timeRange === range ? colors.primary : 'transparent',
                color: timeRange === range ? colors.primaryDark : colors.textSecondary,
                transition: 'all 0.2s'
              }}
            >
              {range === '7days' ? 'Last 7 Days' : range === '30days' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Tasks Completed */}
        <div style={{
          backgroundColor: colors.background,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${colors.border}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#86efac',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle size={20} style={{ color: '#166534' }} />
            </div>
            <span style={{
              fontSize: '14px',
              fontFamily: 'Poppins',
              fontWeight: '500',
              color: colors.textSecondary
            }}>
              Tasks Completed
            </span>
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: '700',
            fontFamily: 'Poppins',
            color: colors.text,
            marginBottom: '4px'
          }}>
            {totalCompletedInRange}
          </div>
          <div style={{
            fontSize: '13px',
            fontFamily: 'Poppins',
            color: colors.textSecondary
          }}>
            {tasksPerDay} tasks/day average
          </div>
        </div>

        {/* Active Tasks */}
        <div style={{
          backgroundColor: colors.background,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${colors.border}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#93c5fd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp size={20} style={{ color: '#1e40af' }} />
            </div>
            <span style={{
              fontSize: '14px',
              fontFamily: 'Poppins',
              fontWeight: '500',
              color: colors.textSecondary
            }}>
              Active Tasks
            </span>
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: '700',
            fontFamily: 'Poppins',
            color: colors.text,
            marginBottom: '4px'
          }}>
            {totalActiveTasks}
          </div>
          <div style={{
            fontSize: '13px',
            fontFamily: 'Poppins',
            color: colors.textSecondary
          }}>
            Currently in progress
          </div>
        </div>

        {/* Avg Focus Time */}
        <div style={{
          backgroundColor: colors.background,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${colors.border}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#fde047',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock size={20} style={{ color: '#854d0e' }} />
            </div>
            <span style={{
              fontSize: '14px',
              fontFamily: 'Poppins',
              fontWeight: '500',
              color: colors.textSecondary
            }}>
              Avg Focus Time
            </span>
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: '700',
            fontFamily: 'Poppins',
            color: colors.text,
            marginBottom: '4px'
          }}>
            {avgFocusTimeMinutes}m
          </div>
          <div style={{
            fontSize: '13px',
            fontFamily: 'Poppins',
            color: colors.textSecondary
          }}>
            Per completed task
          </div>
        </div>

        {/* Overdue Tasks */}
        <div style={{
          backgroundColor: colors.background,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${colors.border}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#fca5a5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertCircle size={20} style={{ color: '#991b1b' }} />
            </div>
            <span style={{
              fontSize: '14px',
              fontFamily: 'Poppins',
              fontWeight: '500',
              color: colors.textSecondary
            }}>
              Overdue Tasks
            </span>
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: '700',
            fontFamily: 'Poppins',
            color: colors.text,
            marginBottom: '4px'
          }}>
            {totalOverdueTasks}
          </div>
          <div style={{
            fontSize: '13px',
            fontFamily: 'Poppins',
            color: colors.textSecondary
          }}>
            Needs attention
          </div>
        </div>
      </div>

      {/* Secondary Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Breakdown */}
        <div style={{
          backgroundColor: colors.background,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${colors.border}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Target size={24} style={{ color: colors.primary }} />
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              fontFamily: 'Poppins',
              color: colors.text
            }}>
              Completion by Priority
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'Urgent', count: priorityBreakdown.urgent, color: '#ef4444' },
              { label: 'Important', count: priorityBreakdown.important, color: '#f97316' },
              { label: 'Medium', count: priorityBreakdown.medium, color: '#3b82f6' },
              { label: 'Low', count: priorityBreakdown.low, color: '#64748b' }
            ].map(priority => {
              const percentage = totalCompletedInRange > 0
                ? (priority.count / totalCompletedInRange) * 100
                : 0;

              return (
                <div key={priority.label}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      fontSize: '14px',
                      fontFamily: 'Poppins',
                      fontWeight: '500',
                      color: colors.text
                    }}>
                      {priority.label}
                    </span>
                    <span style={{
                      fontSize: '14px',
                      fontFamily: 'Poppins',
                      fontWeight: '600',
                      color: colors.text
                    }}>
                      {priority.count} ({Math.round(percentage)}%)
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: colors.border,
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      backgroundColor: priority.color,
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Plans */}
        <div style={{
          backgroundColor: colors.background,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${colors.border}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <BarChart size={24} style={{ color: colors.primary }} />
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              fontFamily: 'Poppins',
              color: colors.text
            }}>
              Top Plans (Completions)
            </h3>
          </div>

          {topPlans.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {topPlans.map(([planName, count], index) => {
                const percentage = totalCompletedInRange > 0
                  ? (count / totalCompletedInRange) * 100
                  : 0;
                const colors_bar = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

                return (
                  <div key={planName}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <span style={{
                        fontSize: '14px',
                        fontFamily: 'Poppins',
                        fontWeight: '500',
                        color: colors.text,
                        maxWidth: '60%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {planName}
                      </span>
                      <span style={{
                        fontSize: '14px',
                        fontFamily: 'Poppins',
                        fontWeight: '600',
                        color: colors.text
                      }}>
                        {count} ({Math.round(percentage)}%)
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: colors.border,
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        backgroundColor: colors_bar[index % colors_bar.length],
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: colors.textSecondary,
              fontFamily: 'Poppins',
              fontSize: '14px'
            }}>
              No completed tasks in this time range
            </div>
          )}
        </div>

        {/* On-Time Completion Rate */}
        <div style={{
          backgroundColor: colors.background,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${colors.border}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <CheckCircle size={24} style={{ color: colors.primary }} />
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              fontFamily: 'Poppins',
              color: colors.text
            }}>
              On-Time Completion
            </h3>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: `8px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              marginBottom: '16px'
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: `conic-gradient(${colors.primary} ${onTimeRate * 3.6}deg, transparent 0deg)`,
              }} />
              <div style={{
                position: 'absolute',
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                backgroundColor: colors.background,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  fontFamily: 'Poppins',
                  color: colors.text
                }}>
                  {onTimeRate}%
                </span>
              </div>
            </div>
            <div style={{
              textAlign: 'center',
              fontSize: '14px',
              fontFamily: 'Poppins',
              color: colors.textSecondary
            }}>
              {onTimeTasks.length} of {tasksWithDueDate.length} tasks completed by due date
            </div>
          </div>
        </div>

        {/* Priority Queue Performance */}
        <div style={{
          backgroundColor: colors.background,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${colors.border}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Target size={24} style={{ color: colors.primary }} />
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              fontFamily: 'Poppins',
              color: colors.text
            }}>
              Priority Queue Completions
            </h3>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{
              fontSize: '48px',
              fontWeight: '700',
              fontFamily: 'Poppins',
              color: colors.text,
              textAlign: 'center',
              marginTop: '20px'
            }}>
              {completedPriorityTasks}
            </div>
            <div style={{
              textAlign: 'center',
              fontSize: '14px',
              fontFamily: 'Poppins',
              color: colors.textSecondary,
              marginBottom: '20px'
            }}>
              Priority tasks completed in this period
            </div>

            <div style={{
              padding: '16px',
              backgroundColor: colors.primaryDark,
              borderRadius: '12px',
              border: `2px solid ${colors.primary}`
            }}>
              <div style={{
                fontSize: '13px',
                fontFamily: 'Poppins',
                fontWeight: '500',
                color: colors.primary,
                marginBottom: '8px'
              }}>
                Current Queue Status
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                fontFamily: 'Poppins',
                color: colors.primary
              }}>
                {priorityQueue.length} / 10 tasks
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
