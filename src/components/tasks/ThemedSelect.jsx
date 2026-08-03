import { useState, useRef, useEffect } from 'react';

/**
 * Themed single-select dropdown component
 * Provides a custom-styled alternative to native <select> elements
 */
export default function ThemedSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  label = null
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const getButtonLabel = () => {
    const selectedOption = options.find(opt => opt.value === value);
    return selectedOption ? selectedOption.label : placeholder;
  };

  const isValueSelected = () => {
    return options.some(opt => opt.value === value);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          fontSize: '14px',
          padding: '6px 12px',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          background: 'white',
          cursor: 'pointer',
          fontFamily: 'Poppins',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          outline: 'none',
          minWidth: '160px',
          justifyContent: 'space-between'
        }}
        onMouseOver={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = 'var(--theme-primary)';
          }
        }}
        onMouseOut={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = '#d1d5db';
          }
        }}
      >
        <span style={{
          color: isValueSelected() ? '#1e293b' : '#94a3b8',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {label && <span style={{ fontWeight: '500', marginRight: '4px' }}>{label}:</span>}
          {getButtonLabel()}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            flexShrink: 0
          }}
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '4px',
            background: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            padding: '4px',
            minWidth: '200px',
            maxHeight: '300px',
            overflowY: 'auto',
            zIndex: 1000,
            fontFamily: 'Poppins'
          }}
        >
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option.value)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                borderRadius: '4px',
                fontSize: '14px',
                transition: 'background-color 0.15s',
                userSelect: 'none',
                backgroundColor: value === option.value ? 'var(--theme-primary)' : 'transparent',
                color: value === option.value ? 'var(--theme-primary-dark)' : '#1e293b',
                fontWeight: value === option.value ? '500' : '400'
              }}
              onMouseOver={(e) => {
                if (value !== option.value) {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                }
              }}
              onMouseOut={(e) => {
                if (value !== option.value) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
