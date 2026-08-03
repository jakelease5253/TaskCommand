import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function BrandButton({
  children,
  onClick,
  disabled = false,
  className = '',
  width = '285px',
  height = '45px',
}) {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`transition-all disabled:opacity-50 ${className}`}
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        width,
        height,
        padding: '0px 8px',
        border: '0',
        boxSizing: 'border-box',
        borderRadius: '8px',
        boxShadow: disabled ? 'none' : '0px 2px 4px rgba(0, 0, 0, 0.1)',
        backgroundColor: colors.primaryDark,
        color: colors.primary,
        fontSize: '16px',
        fontFamily: 'Poppins',
        fontWeight: '600',
        lineHeight: '1.5',
        outline: 'none',
      }}
    >
      {children}
    </button>
  );
}
