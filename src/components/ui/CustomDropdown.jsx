import React from 'react';
import { ChevronDown } from './icons';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * CustomDropdown - A reusable dropdown component styled to match the site theme
 *
 * @param {*} value - The currently selected value
 * @param {Array} options - Array of options (can be strings or objects with label/value)
 * @param {Function} onChange - Callback when selection changes, receives the new value
 * @param {boolean} disabled - Whether the dropdown is disabled
 * @param {React.Ref} dropdownRef - Ref for click-outside detection
 * @param {boolean} isOpen - Whether the dropdown is currently open
 * @param {Function} setIsOpen - Function to control dropdown open state
 * @param {Function} renderOption - Optional function to customize how options are rendered
 * @param {Function} renderValue - Optional function to customize how selected value is displayed
 * @param {Function} getOptionValue - Optional function to extract value from option object
 * @param {string} placeholder - Optional placeholder text when no value selected
 * @param {string} width - Optional width (default: 'auto')
 * @param {string} minWidth - Optional minimum width (default: '120px')
 */
export default function CustomDropdown({
  value,
  options = [],
  onChange,
  disabled = false,
  dropdownRef,
  isOpen,
  setIsOpen,
  renderOption = (option) => option.label || option,
  renderValue = (option) => option.label || option,
  getOptionValue = (option) => option.value !== undefined ? option.value : option,
  placeholder = 'Select...',
  width = 'auto',
  minWidth = '120px'
}) {
  const { theme } = useTheme();

  // Find the selected option, handling both object and string options
  const selectedOption = options.find(opt => getOptionValue(opt) === value);

  // Display value or placeholder
  const displayValue = selectedOption ? renderValue(selectedOption) : placeholder;

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block', width }}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          fontFamily: 'Poppins',
          fontSize: '14px',
          outline: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          backgroundColor: disabled ? '#f3f4f6' : '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
          minWidth,
          color: selectedOption ? theme.colors.primaryDark : '#9ca3af',
          transition: 'all 0.15s'
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = theme.colors.primary;
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = '#d1d5db';
          }
        }}
      >
        <span style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          textAlign: 'left'
        }}>
          {displayValue}
        </span>
        <ChevronDown style={{
          transition: 'transform 0.2s',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          width: '16px',
          height: '16px',
          flexShrink: 0,
          color: theme.colors.primaryDark
        }} />
      </button>

      {isOpen && !disabled && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '4px',
            backgroundColor: '#ffffff',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 1000,
            overflow: 'hidden',
            width: '100%',
            minWidth,
            maxHeight: '300px',
            overflowY: 'auto'
          }}
        >
          {options.length === 0 ? (
            <div style={{
              padding: '10px 12px',
              fontFamily: 'Poppins',
              fontSize: '14px',
              color: '#9ca3af',
              textAlign: 'center'
            }}>
              No options available
            </div>
          ) : (
            options.map((option, index) => {
              const optionValue = getOptionValue(option);
              const isSelected = optionValue === value;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    onChange(optionValue);
                    setIsOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: 'none',
                    backgroundColor: isSelected ? theme.colors.primaryLight : '#ffffff',
                    fontFamily: 'Poppins',
                    fontSize: '14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: theme.colors.primaryDark,
                    transition: 'background-color 0.15s',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.target.style.backgroundColor = '#f8fafc';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.target.style.backgroundColor = '#ffffff';
                    }
                  }}
                >
                  {renderOption(option)}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
