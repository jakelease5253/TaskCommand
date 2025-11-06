import React from 'react';
import { components } from '../../constants/theme';

export default function BrandButton({
  children,
  onClick,
  disabled = false,
  className = '',
  width = '285px',
  height = '45px',
}) {
  const buttonStyle = components.button.primary;

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
        borderRadius: buttonStyle.borderRadius,
        boxShadow: disabled ? 'none' : buttonStyle.boxShadow,
        backgroundColor: buttonStyle.background,
        color: buttonStyle.color,
        fontSize: buttonStyle.fontSize,
        fontFamily: 'Poppins',
        fontWeight: buttonStyle.fontWeight,
        lineHeight: buttonStyle.lineHeight,
        outline: 'none',
      }}
    >
      {children}
    </button>
  );
}
