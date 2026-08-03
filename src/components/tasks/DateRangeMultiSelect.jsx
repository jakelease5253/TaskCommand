import { useState, useRef, useEffect } from 'react';

/**
 * Multi-select date range filter component
 * Allows users to select multiple date range filters at once
 */
export default function DateRangeMultiSelect({
  selectedRanges = [],
  onChange,
  customStartDate = '',
  customEndDate = '',
  onCustomDateChange
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomRange, setShowCustomRange] = useState(false);
  const dropdownRef = useRef(null);

  const dateRangeOptions = [
    { value: 'all', label: 'All' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'nextWeek', label: 'Next Week' },
    { value: 'backlog', label: 'Backlogged (No Due Date)' }
  ];

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

  const handleToggle = (value) => {
    let newRanges;

    if (value === 'all') {
      // If clicking "All", clear all other selections
      newRanges = selectedRanges.includes('all') ? [] : ['all'];
    } else {
      // Remove "All" if it was selected
      const withoutAll = selectedRanges.filter(r => r !== 'all');

      // Toggle the clicked option
      if (withoutAll.includes(value)) {
        newRanges = withoutAll.filter(r => r !== value);
      } else {
        newRanges = [...withoutAll, value];
      }
    }

    onChange(newRanges);
  };

  const handleCustomRangeToggle = () => {
    if (showCustomRange) {
      // Unchecking - hide inputs and clear dates
      setShowCustomRange(false);
      onCustomDateChange('', '');
    } else {
      // Checking - show inputs
      setShowCustomRange(true);
    }
  };

  const getButtonLabel = () => {
      const filterCount = selectedRanges.length + (isCustomEnabled ? 1 : 0);

    if (filterCount === 0) {
      return 'Date: All';
    } else if (selectedRanges.includes('all')) {
      return 'Date: All';
    } else if (filterCount === 1) {
      if (isCustomEnabled) {
        return 'Date: Custom';
      }
      const option = dateRangeOptions.find(opt => opt.value === selectedRanges[0]);
      return `Date: ${option?.label || 'Filter'}`;
    } else {
      return `Date: ${filterCount} filters`;
    }
  };

  const isAllSelected = selectedRanges.includes('all');
  const isCustomEnabled = customStartDate || customEndDate;

  // Sync showCustomRange with actual dates for initial load
  useEffect(() => {
    if ((customStartDate || customEndDate) && !showCustomRange) {
      setShowCustomRange(true);
    }
    // Only auto-open when dates arrive; including showCustomRange would reopen it after a manual close
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customStartDate, customEndDate]);

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
          outline: 'none'
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
        <span>{getButtonLabel()}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
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
            padding: '8px',
            minWidth: '240px',
            zIndex: 1000,
            fontFamily: 'Poppins'
          }}
        >
          {/* Date Range Options */}
          {dateRangeOptions.map((option) => (
            <label
              key={option.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px',
                cursor: 'pointer',
                borderRadius: '4px',
                fontSize: '14px',
                transition: 'background-color 0.15s',
                userSelect: 'none'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <input
                type="checkbox"
                checked={selectedRanges.includes(option.value)}
                onChange={() => handleToggle(option.value)}
                disabled={isAllSelected && option.value !== 'all'}
                style={{
                  marginRight: '8px',
                  cursor: 'pointer',
                  width: '16px',
                  height: '16px',
                  accentColor: 'var(--theme-primary)'
                }}
              />
              <span style={{
                color: (isAllSelected && option.value !== 'all') ? '#94a3b8' : '#1e293b'
              }}>
                {option.label}
              </span>
            </label>
          ))}

          {/* Divider */}
          <div style={{
            height: '1px',
            background: '#e2e8f0',
            margin: '8px 0'
          }} />

          {/* Custom Range Toggle */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px',
              cursor: 'pointer',
              borderRadius: '4px',
              fontSize: '14px',
              transition: 'background-color 0.15s',
              userSelect: 'none'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <input
              type="checkbox"
              checked={showCustomRange}
              onChange={handleCustomRangeToggle}
              disabled={isAllSelected}
              style={{
                marginRight: '8px',
                cursor: 'pointer',
                width: '16px',
                height: '16px',
                accentColor: 'var(--theme-primary)'
              }}
            />
            <span style={{
              color: isAllSelected ? '#94a3b8' : '#1e293b'
            }}>
              Custom Range
            </span>
          </label>

          {/* Custom Date Inputs */}
          {showCustomRange && !isAllSelected && (
            <div style={{
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div>
                <label style={{
                  fontSize: '12px',
                  color: '#64748b',
                  marginBottom: '4px',
                  display: 'block'
                }}>
                  From:
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => onCustomDateChange(e.target.value, customEndDate)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    fontSize: '14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    outline: 'none',
                    fontFamily: 'Poppins'
                  }}
                  onFocus={(e) => {
                    e.target.style.boxShadow = '0 0 0 2px var(--theme-primary-light)';
                    e.target.style.borderColor = 'var(--theme-primary)';
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none';
                    e.target.style.borderColor = '#d1d5db';
                  }}
                />
              </div>
              <div>
                <label style={{
                  fontSize: '12px',
                  color: '#64748b',
                  marginBottom: '4px',
                  display: 'block'
                }}>
                  To:
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => onCustomDateChange(customStartDate, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    fontSize: '14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    outline: 'none',
                    fontFamily: 'Poppins'
                  }}
                  onFocus={(e) => {
                    e.target.style.boxShadow = '0 0 0 2px var(--theme-primary-light)';
                    e.target.style.borderColor = 'var(--theme-primary)';
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none';
                    e.target.style.borderColor = '#d1d5db';
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
