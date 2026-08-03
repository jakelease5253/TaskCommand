import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function TerminalIcon({ size = 60, onClick, className = '' }) {
  const { theme } = useTheme();
  console.log('TerminalIcon rendering with theme:', theme.id);

  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: `${size}px`,
        height: `${size}px`,
        border: '0',
        boxSizing: 'border-box',
        borderRadius: '10px',
        boxShadow: '0px 2px 8px rgba(0,0,0,0.12)',
        color: theme.colors.primary,
        backgroundColor: theme.colors.primaryDark,
        outline: 'none',
      }}
    >
      <svg
        style={{
          color: theme.colors.primary,
          fill: theme.colors.primary,
          width: `${size / 2}px`,
          height: `${size / 2}px`,
          fontSize: `${size / 2}px`,
        }}
        viewBox="0 0 576 512"
      >
        <path d="M9.372 86.63C-3.124 74.13-3.124 53.87 9.372 41.37C21.87 28.88 42.13 28.88 54.63 41.37L246.6 233.4C259.1 245.9 259.1 266.1 246.6 278.6L54.63 470.6C42.13 483.1 21.87 483.1 9.372 470.6C-3.124 458.1-3.124 437.9 9.372 425.4L178.7 256L9.372 86.63zM544 416C561.7 416 576 430.3 576 448C576 465.7 561.7 480 544 480H256C238.3 480 224 465.7 224 448C224 430.3 238.3 416 256 416H544z" />
      </svg>
    </div>
  );
}
