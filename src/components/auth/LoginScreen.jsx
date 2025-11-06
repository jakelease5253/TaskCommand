import React from 'react';
import Logo from '../brand/Logo';
import TerminalIcon from '../brand/TerminalIcon';
import BrandButton from '../brand/BrandButton';
import { colors, typography, spacing, components } from '../../constants/theme';

export default function LoginScreen({ onLogin, loading }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.backgroundLight }}>
      <div
        className="flex flex-col items-center justify-center"
        style={{
          width: '703px',
          height: '470px',
          backgroundColor: components.card.background,
          borderRadius: components.card.borderRadius,
          boxShadow: components.card.boxShadow,
        }}
      >
        {/* Logo and Title - Horizontal */}
        <div className="flex items-center" style={{ gap: spacing.lg, marginBottom: spacing.md }}>
          <TerminalIcon size={60} />
          <Logo size="large" />
        </div>

        {/* Tagline */}
        <div
          style={{
            color: colors.textPrimary,
            fontSize: typography.sizes.xl,
            fontFamily: typography.fontFamily,
            lineHeight: typography.lineHeights.loose,
            textAlign: 'center',
            margin: `0 0 ${spacing.gigantic} 0`,
          }}
        >
          Focus. Plan. Command your tasks.
        </div>

        {/* Sign In Button */}
        <BrandButton
          onClick={onLogin}
          disabled={loading}
          width="285px"
          height="45px"
        >
          {loading ? 'Signing In...' : 'Sign In with Microsoft'}
        </BrandButton>

        {/* Security Text */}
        <div
          style={{
            color: colors.textPrimary,
            fontSize: typography.sizes.xs,
            fontFamily: typography.fontFamily,
            lineHeight: typography.lineHeights.tight,
            textAlign: 'center',
            marginTop: spacing.sm,
          }}
        >
          Secure Authentication via Microsoft
        </div>
      </div>
    </div>
  );
}