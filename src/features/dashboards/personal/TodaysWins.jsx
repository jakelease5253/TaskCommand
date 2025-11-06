import React from 'react';
import { Target, Clock, Watch, Flame, Trophy, TrendingUp } from '../../../components/ui/icons';

export default function TodaysWins({
  metrics,
  onToggleCollapse,
  onOpenSettings,
}) {
  const {
    todayCompleted,
    dailyGoal,
    focusTime,
    focusTimeGoal,
    priorityCompleted,
    priorityTotal,
    morningWins,
    afternoonWins,
    currentStreak,
  } = metrics;

  // Calculate progress percentage
  const progressPercent = dailyGoal > 0 ? Math.min(100, Math.round((todayCompleted / dailyGoal) * 100)) : 0;

  // Get encouragement message
  const getEncouragementMessage = () => {
    if (todayCompleted >= dailyGoal && dailyGoal > 0) {
      return "Daily goal crushed! You're unstoppable!";
    }
    if (progressPercent >= 75) return "Almost there! You've got this!";
    if (progressPercent >= 50) return "Halfway there! Keep the momentum going!";
    if (todayCompleted > 0) return "Great progress today!";
    return "Ready to make today productive?";
  };

  // Focus time progress
  const focusProgressPercent = focusTimeGoal > 0 ? Math.min(100, Math.round((focusTime / focusTimeGoal) * 100)) : 0;

  return (
    <div className="mb-4" style={{ marginTop: '16px' }}>
      {/* Header with Title and Collapse Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <h2 style={{ fontFamily: 'Poppins', fontSize: '16px', fontWeight: '600', color: 'var(--theme-primary-dark)', marginLeft: '3px' }}>
          Today's Wins
        </h2>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            style={{
              cursor: 'pointer',
              width: '20px',
              height: '20px',
              border: 'none',
              borderRadius: '50%',
              backgroundColor: 'var(--theme-primary-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Hide Today's Wins"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--theme-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"/>
            </svg>
          </button>
        )}
      </div>

      {/* Gray Bar */}
      <div
        style={{
          backgroundColor: '#d1d5db',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          alignItems: 'center',
          marginBottom: '16px',
          boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <span style={{ fontFamily: 'Poppins', fontSize: '14px', fontWeight: '500', color: 'var(--theme-primary-dark)' }}>
          {todayCompleted} tasks completed {dailyGoal > 0 && `(${dailyGoal} goal)`}
        </span>

        <span style={{ fontFamily: 'Poppins', fontSize: '13px', color: 'var(--theme-primary-dark)', textAlign: 'center' }}>
          {getEncouragementMessage()}
        </span>

        <span style={{ fontFamily: 'Poppins', fontSize: '14px', fontWeight: '600', color: 'var(--theme-primary-dark)', textAlign: 'right' }}>
          {currentStreak > 0 ? `${currentStreak} day${currentStreak !== 1 ? 's' : ''}` : ''}
        </span>
      </div>

      {/* Metrics Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', padding: '0 4px' }}>
        {/* Today's Focus Time */}
        <div style={{
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          padding: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0px 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Clock size={28} style={{ color: 'var(--theme-primary-dark)' }} />
            <span style={{ fontFamily: 'Poppins', fontSize: '15px', fontWeight: '600', color: 'var(--theme-primary-dark)' }}>
              Today's Focus Time
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <span style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: '400', color: 'var(--theme-primary-dark)' }}>
              Goal: {focusTimeGoal} minutes
            </span>
            <span style={{ fontFamily: 'Poppins', fontSize: '36px', fontWeight: '700', color: 'var(--theme-primary-dark)', lineHeight: '1' }}>
              {focusTime} m
            </span>
          </div>
        </div>

        {/* Priority Tasks Complete */}
        <div style={{
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          padding: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0px 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Target size={28} style={{ color: 'var(--theme-primary-dark)' }} />
            <span style={{ fontFamily: 'Poppins', fontSize: '15px', fontWeight: '600', color: 'var(--theme-primary-dark)' }}>
              Priority Tasks Complete
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <span style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: '400', color: 'var(--theme-primary-dark)' }}>
              Goal: {priorityTotal} tasks
            </span>
            <span style={{ fontFamily: 'Poppins', fontSize: '48px', fontWeight: '700', color: 'var(--theme-primary-dark)', lineHeight: '1' }}>
              {priorityCompleted}
            </span>
          </div>
        </div>

        {/* Completion Blocks */}
        <div style={{
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          padding: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0px 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Watch size={28} style={{ color: 'var(--theme-primary-dark)' }} />
              <span style={{ fontFamily: 'Poppins', fontSize: '15px', fontWeight: '600', color: 'var(--theme-primary-dark)' }}>
                Completion Blocks
              </span>
            </div>
            <Trophy size={36} style={{ color: 'var(--theme-primary-dark)' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: '500', color: 'var(--theme-primary-dark)', marginBottom: '4px' }}>
              Morning: {morningWins} tasks - Killing it!
            </div>
            <div style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: '500', color: 'var(--theme-primary-dark)' }}>
              Afternoon: {afternoonWins} tasks - Still time!
            </div>
          </div>
        </div>

        {/* Goal Streaks */}
        <div style={{
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          padding: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0px 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={28} style={{ color: 'var(--theme-primary-dark)' }} />
              <span style={{ fontFamily: 'Poppins', fontSize: '15px', fontWeight: '600', color: 'var(--theme-primary-dark)' }}>
                Goal Streaks
              </span>
            </div>
            <TrendingUp size={36} style={{ color: '#10b981' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: '500', color: 'var(--theme-primary-dark)', marginBottom: '4px' }}>
              Focus Time: {currentStreak} Days!
            </div>
            <div style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: '500', color: 'var(--theme-primary-dark)' }}>
              Tasks Completed: {currentStreak} Days!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
