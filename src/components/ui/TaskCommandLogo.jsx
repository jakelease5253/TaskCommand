export default function TaskCommandLogo({ size = 'md' }) {
  const sizes = {
    sm: { container: 'w-10 h-10', text: 'text-xl', rounded: 'rounded-xl' },
    md: { container: 'w-14 h-14', text: 'text-3xl', rounded: 'rounded-xl' },
    lg: { container: 'w-20 h-20', text: 'text-5xl', rounded: 'rounded-2xl' }
  };
  const sizeClasses = sizes[size] || sizes.md;
  
  return (
    <div 
      className={`${sizeClasses.container} gradient-primary ${sizeClasses.rounded} flex items-center justify-center shadow-lg`}
      style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
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