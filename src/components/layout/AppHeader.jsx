import React from 'react';
import TerminalIcon from '../brand/TerminalIcon';
import Logo from '../brand/Logo';
import { useTheme } from '../../contexts/ThemeContext';

export default function AppHeader({ userName = 'User', date, profileImage, sidebarExpanded = false }) {
  const { theme } = useTheme();
  console.log('AppHeader rendering with theme:', theme.id);
  // Format date if not provided
  const displayDate = date || new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  // Get user initials from userName
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const initials = getInitials(userName);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: sidebarExpanded ? '258px' : '84px',
        right: 0,
        height: '72px',
        backgroundColor: '#ffffff',
        boxShadow: '0px 1px 12px rgba(193,193,193,0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 90,
        transition: 'left 0.3s ease',
      }}
    >
      {/* Left Side - Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <TerminalIcon size={46} />
        <Logo size="medium" />
      </div>

      {/* Right Side - User Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              color: theme.colors.textSecondary,
              fontSize: theme.typography.sizes.xs,
              fontFamily: theme.typography.fontFamily,
              lineHeight: '16px',
            }}
          >
            Welcome, {userName}
          </div>
          <div
            style={{
              color: theme.colors.textSecondary,
              fontSize: theme.typography.sizes.xs,
              fontFamily: theme.typography.fontFamily,
              lineHeight: '16px',
            }}
          >
            {displayDate}
          </div>
        </div>

        {/* Profile Photo */}
        {profileImage ? (
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '100px',
              backgroundImage: `url(${profileImage})`,
              backgroundPosition: 'center center',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
            }}
          />
        ) : (
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '100px',
              backgroundColor: theme.colors.primaryDark,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Poppins',
              fontSize: '18px',
              fontWeight: '600',
              color: theme.colors.primary,
            }}
          >
            {initials}
          </div>
        )}
      </div>
    </header>
  );
}
