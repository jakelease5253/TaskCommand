import { useTheme } from '../../contexts/ThemeContext';

export default function TaskCommandLogo({ size = 'md' }) {
  const { theme } = useTheme();

  console.log('TaskCommandLogo rendering with theme:', theme.id, 'primary:', theme.colors.primary, 'primaryDark:', theme.colors.primaryDark);

  const sizes = {
    sm: { container: 'w-10 h-10', text: 'text-xl', rounded: 'rounded-xl' },
    md: { container: 'w-14 h-14', text: 'text-3xl', rounded: 'rounded-xl' },
    lg: { container: 'w-20 h-20', text: 'text-5xl', rounded: 'rounded-2xl' }
  };
  const sizeClasses = sizes[size] || sizes.md;

  return (
    <div
      className={`${sizeClasses.container} ${sizeClasses.rounded} flex items-center justify-center shadow-lg`}
      style={{
        background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%)`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}
    >
      <span
        className={`${sizeClasses.text} text-white font-mono font-medium`}
        style={{ fontFamily: 'Fira Code, monospace' }}
      >
        {'>'}_
      </span>
    </div>
  );
}