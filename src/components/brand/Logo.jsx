import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function Logo({ size = 'large' }) {
  const { theme } = useTheme();
  console.log('Logo rendering with theme:', theme.id);

  const sizes = {
    large: {
      fontSize: '48px',
      lineHeight: '62px',
    },
    medium: {
      fontSize: '32px',
      lineHeight: '42px',
    },
    small: {
      fontSize: '24px',
      lineHeight: '31px',
    },
  };

  const sizeStyles = sizes[size] || sizes.large;

  return (
    <div
      style={{
        fontSize: sizeStyles.fontSize,
        fontFamily: theme.typography.fontFamily,
        fontWeight: theme.typography.weights.extrabold,
        lineHeight: sizeStyles.lineHeight,
        margin: 0,
      }}
    >
      <span style={{ color: theme.colors.primaryDark }}>Task</span>
      <span style={{ color: theme.colors.primary }}>Command</span>
    </div>
  );
}
