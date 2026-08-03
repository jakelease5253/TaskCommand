import { Target, Clock, Watch, Flame, Trophy, TrendingUp } from '../../../components/ui/icons';

export default function TodaysWins({
  metrics,
  isCollapsed = false,
  onToggleCollapse,
  workHours,
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
    morningGoal,
    afternoonGoal,
    currentStreak,
  } = metrics;

  // Calculate progress percentage
  const progressPercent = dailyGoal > 0 ? Math.min(100, Math.round((todayCompleted / dailyGoal) * 100)) : 0;

  // Get time of day and work schedule info
  const getTimeContext = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayName = dayNames[now.getDay()];
    const todaySchedule = workHours?.[todayName];

    if (!todaySchedule || !todaySchedule.enabled) {
      // No schedule, use simple time-of-day
      if (currentHour < 12) return { period: 'morning', percentComplete: 0, isWorkDay: false };
      if (currentHour < 17) return { period: 'afternoon', percentComplete: 0, isWorkDay: false };
      return { period: 'evening', percentComplete: 0, isWorkDay: false };
    }

    const [startHour] = todaySchedule.start.split(':').map(Number);
    const [endHour] = todaySchedule.end.split(':').map(Number);

    // Calculate work day progress
    const workDayLength = endHour - startHour;
    const hoursIntoWorkDay = currentHour - startHour;
    const percentComplete = Math.max(0, Math.min(100, Math.round((hoursIntoWorkDay / workDayLength) * 100)));

    // Determine period
    let period = 'morning';
    if (currentHour >= endHour) period = 'evening';
    else if (hoursIntoWorkDay > workDayLength / 2) period = 'afternoon';

    return { period, percentComplete, isWorkDay: true };
  };

  const timeContext = getTimeContext();

  // Get encouragement message with lots of variety
  const getEncouragementMessage = () => {
    const { period, percentComplete, isWorkDay } = timeContext;

    // Determine if ahead/on track/behind based on time vs progress
    const expectedProgress = isWorkDay ? percentComplete : 50; // If no schedule, assume midpoint
    const isAhead = progressPercent > expectedProgress + 15;
    const isBehind = progressPercent < expectedProgress - 15;
    const isOnTrack = !isAhead && !isBehind;

    // Goal exceeded (100%+)
    if (progressPercent >= 100 && dailyGoal > 0) {
      const exceedMessages = [
        "🎉 Goal crushed! You're unstoppable!",
        "🔥 Daily goal destroyed! Legend status!",
        "⚡ Goal smashed! You're on fire today!",
        "🏆 Goal conquered! What a performance!",
        "💪 Goal obliterated! Keep going!",
        "🌟 You've exceeded your goal! Superstar!",
        "🚀 Goal demolished! Sky's the limit!",
        "👑 Goal achieved and beyond! You rule!",
      ];

      // Over 150% gets extra praise
      if (progressPercent >= 150) {
        return ["🤯 150%+ complete! Absolutely crushing it!",
                "💫 150%+ done! You're in the zone!",
                "🎯 150%+ achieved! Phenomenal work!"][Math.floor(Math.random() * 3)];
      }

      return exceedMessages[Math.floor(Math.random() * exceedMessages.length)];
    }

    // Near completion (76-99%)
    if (progressPercent >= 76) {
      if (period === 'morning') {
        return ["Almost there and it's still morning! 🌅",
                "So close! Finish strong before lunch! 💪",
                "One more push to goal! Morning warrior! ⚡",
                "Nearly done! What a productive morning! 🎯"][Math.floor(Math.random() * 4)];
      }
      if (period === 'evening') {
        return ["Finish line in sight! End the day strong! 🌙",
                "So close! One final push! 💫",
                "Almost there! Close it out! ⭐",
                "Nearly done! Finish what you started! 🏁"][Math.floor(Math.random() * 4)];
      }
      return ["Almost there! You've got this! 💪",
              "One more task! The finish line awaits! 🎯",
              "So close! Push through to victory! 🔥",
              "Nearly done! Bring it home! 🏆"][Math.floor(Math.random() * 4)];
    }

    // Good progress (51-75%)
    if (progressPercent >= 51) {
      if (isAhead) {
        return ["Ahead of schedule! You're crushing it! 🚀",
                "Way ahead! Love the momentum! 🔥",
                "Speeding ahead! Unstoppable today! ⚡",
                "Ahead of pace! Keep this energy! 💪"][Math.floor(Math.random() * 4)];
      }
      if (period === 'evening' && isOnTrack) {
        return ["Solid progress! Time to wrap up! 🌙",
                "Good work today! Finish strong! ⭐",
                "Nice momentum! One more push! 💫",
                "Looking good! Close it out! 🎯"][Math.floor(Math.random() * 4)];
      }
      return ["Over halfway! Keep the momentum! 🎯",
              "Great progress! You're rolling! 🔥",
              "Solid work! Push through to the goal! 💪",
              "More than halfway there! Don't stop! ⚡"][Math.floor(Math.random() * 4)];
    }

    // Halfway point (26-50%)
    if (progressPercent >= 26) {
      if (isAhead && period === 'morning') {
        return ["Killing it this morning! 🌅",
                "Early bird getting it done! 🐦",
                "Morning momentum! Keep it up! ☀️",
                "Starting strong! Love the energy! 💪"][Math.floor(Math.random() * 4)];
      }
      if (isBehind && period === 'afternoon') {
        return ["Afternoon power hour! Let's go! 💪",
                "Time to pick up the pace! You got this! 🔥",
                "Second half surge! Rally time! ⚡",
                "Let's turn it up! You can do this! 🎯"][Math.floor(Math.random() * 4)];
      }
      if (period === 'evening') {
        return ["Evening push time! You can do it! 🌙",
                "Still time left! Make it count! ⭐",
                "Late day rally! Let's go! 💫",
                "Not too late! Push to the finish! 🏁"][Math.floor(Math.random() * 4)];
      }
      return ["Halfway there! Keep the momentum! 🎯",
              "Building momentum! Stay focused! 💪",
              "Solid foundation! Keep building! 🔥",
              "Good start! Let's accelerate! ⚡"][Math.floor(Math.random() * 4)];
    }

    // Early progress (1-25%)
    if (todayCompleted > 0) {
      if (period === 'morning') {
        return ["Early start! Set the tone for the day! ☀️",
                "Morning momentum building! 🌅",
                "Great start! Keep the energy high! 💪",
                "First task down! Let's keep going! 🎯",
                "Early bird! Lots of day left! 🐦"][Math.floor(Math.random() * 5)];
      }
      if (period === 'afternoon') {
        return ["Progress! Still plenty of time! ⏰",
                "Getting there! Afternoon surge! 💪",
                "Good start! Time to accelerate! 🔥",
                "On the board! Build momentum! ⚡",
                "Moving forward! Keep pushing! 🎯"][Math.floor(Math.random() * 5)];
      }
      return ["Great start! Stay focused! 💪",
              "First win down! Build on it! 🎯",
              "Progress! Keep the ball rolling! 🔥",
              "Nice work! Momentum is building! ⚡"][Math.floor(Math.random() * 4)];
    }

    // No progress yet
    if (period === 'morning') {
      return ["Fresh start! Let's make today great! ☀️",
              "New day, new opportunities! 🌅",
              "Ready to tackle the day? Let's go! 💪",
              "Morning is yours! First task awaits! 🎯",
              "Early morning = early wins! Let's start! 🐦"][Math.floor(Math.random() * 5)];
    }
    if (period === 'afternoon') {
      return ["Afternoon ahead! Time to shine! ⏰",
              "Fresh afternoon energy! Let's do this! 💪",
              "Still time to make it a great day! 🔥",
              "Afternoon opportunity! Get started! 🎯",
              "Let's make the most of this afternoon! ⚡"][Math.floor(Math.random() * 5)];
    }
    return ["Evening time! What can you accomplish? 🌙",
            "Still time to make progress! 💫",
            "Late start? No problem! Let's go! 💪",
            "Every task counts! Get started! ⭐"][Math.floor(Math.random() * 4)];
  };

  // Focus time progress
  const focusProgressPercent = focusTimeGoal > 0 ? Math.min(100, Math.round((focusTime / focusTimeGoal) * 100)) : 0;

  return (
    <div className="mb-4" style={{ marginTop: '16px' }}>
      {/* Header with Title and Collapse Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <h2 style={{ fontFamily: 'Poppins', fontSize: '16px', fontWeight: '600', color: 'var(--theme-primary-dark)', marginLeft: '3px' }}>
          Today&apos;s Wins
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
            title={isCollapsed ? "Show Today's Wins" : "Hide Today's Wins"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--theme-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              {isCollapsed ? (
                <polyline points="6 9 12 15 18 9"/>
              ) : (
                <polyline points="18 15 12 9 6 15"/>
              )}
            </svg>
          </button>
        )}
      </div>

      {!isCollapsed && (
        <>

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
              Today&apos;s Focus Time
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
            <Trophy size={36} style={{ color: morningWins >= morningGoal && afternoonWins >= afternoonGoal ? '#10b981' : 'var(--theme-primary-dark)' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: '500', color: 'var(--theme-primary-dark)', marginBottom: '4px' }}>
              Morning: {morningWins} of {morningGoal} {morningWins >= morningGoal ? '✓' : 'tasks'}
            </div>
            <div style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: '500', color: 'var(--theme-primary-dark)' }}>
              Afternoon: {afternoonWins} of {afternoonGoal} {afternoonWins >= afternoonGoal ? '✓' : 'tasks'}
            </div>
          </div>
        </div>

        {/* Daily Progress */}
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
                Daily Progress
              </span>
            </div>
            <TrendingUp size={36} style={{ color: progressPercent >= 100 || focusProgressPercent >= 100 ? '#10b981' : 'var(--theme-primary-dark)' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: '500', color: 'var(--theme-primary-dark)', marginBottom: '4px' }}>
              Tasks: {progressPercent}% {progressPercent >= 100 ? '✓' : `(${todayCompleted}/${dailyGoal})`}
            </div>
            <div style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: '500', color: 'var(--theme-primary-dark)' }}>
              Focus: {focusProgressPercent}% {focusProgressPercent >= 100 ? '✓' : `(${focusTime}/${focusTimeGoal}m)`}
            </div>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
