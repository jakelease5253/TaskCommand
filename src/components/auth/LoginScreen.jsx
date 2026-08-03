import Logo from '../brand/Logo';
import TerminalIcon from '../brand/TerminalIcon';
import BrandButton from '../brand/BrandButton';
import { useTheme } from '../../contexts/ThemeContext';

export default function LoginScreen({ onLogin, loading }) {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.backgroundLight }}>
      <div
        className="flex flex-col items-center justify-center"
        style={{
          width: '703px',
          height: '470px',
          backgroundColor: colors.background,
          borderRadius: '16px',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Logo and Title - Horizontal */}
        <div className="flex items-center" style={{ gap: '24px', marginBottom: '16px' }}>
          <TerminalIcon size={60} />
          <Logo size="large" />
        </div>

        {/* Tagline */}
        <div
          style={{
            color: colors.text,
            fontSize: '20px',
            fontFamily: 'Poppins',
            lineHeight: '1.6',
            textAlign: 'center',
            margin: '0 0 48px 0',
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
            color: colors.textSecondary,
            fontSize: '12px',
            fontFamily: 'Poppins',
            lineHeight: '1.4',
            textAlign: 'center',
            marginTop: '12px',
          }}
        >
          Secure Authentication via Microsoft
        </div>
      </div>
    </div>
  );
}