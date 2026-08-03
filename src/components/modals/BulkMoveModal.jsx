import React, { useState, useEffect, useRef } from 'react';
import { X, Folder } from '../ui/icons';
import CustomDropdown from '../ui/CustomDropdown';
import { useTheme } from '../../contexts/ThemeContext';

export default function BulkMoveModal({
  isOpen,
  selectedTaskIds,
  plans,
  buckets,
  onClose,
  onMove
}) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedBucketId, setSelectedBucketId] = useState('');

  // Dropdown states
  const [planDropdownOpen, setPlanDropdownOpen] = useState(false);
  const [bucketDropdownOpen, setBucketDropdownOpen] = useState(false);

  // Dropdown refs for click-outside detection
  const planDropdownRef = useRef(null);
  const bucketDropdownRef = useRef(null);

  // Click-outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (planDropdownRef.current && !planDropdownRef.current.contains(event.target)) {
        setPlanDropdownOpen(false);
      }
      if (bucketDropdownRef.current && !bucketDropdownRef.current.contains(event.target)) {
        setBucketDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedPlanId && selectedBucketId) {
      onMove(selectedTaskIds, selectedPlanId, selectedBucketId);
      onClose();
    }
  };

  const handlePlanChange = (e) => {
    setSelectedPlanId(e.target.value);
    setSelectedBucketId(''); // Reset bucket when plan changes
  };

  const availableBuckets = selectedPlanId ? (buckets[selectedPlanId] || []) : [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: `2px solid ${colors.primary}`,
          backgroundColor: colors.primaryDark
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: colors.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Folder size={24} style={{ color: colors.primaryDark }} />
              </div>
              <div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  fontFamily: 'Poppins',
                  color: colors.primary,
                  margin: 0
                }}>Move Tasks</h2>
                <p style={{
                  fontSize: '12px',
                  fontFamily: 'Poppins',
                  color: colors.primary,
                  margin: 0,
                  marginTop: '2px'
                }}>
                  Moving {selectedTaskIds.size} task{selectedTaskIds.size > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px',
                backgroundColor: colors.primary,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X style={{ color: colors.primaryDark }} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Plan Selection */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              fontFamily: 'Poppins',
              color: colors.text,
              marginBottom: '8px'
            }}>
              Select Plan
            </label>
            <CustomDropdown
              value={selectedPlanId}
              options={[
                { label: 'Choose a plan...', value: '' },
                ...Object.entries(plans).map(([planId, planName]) => ({
                  label: planName,
                  value: planId
                }))
              ]}
              onChange={handlePlanChange}
              disabled={false}
              dropdownRef={planDropdownRef}
              isOpen={planDropdownOpen}
              setIsOpen={setPlanDropdownOpen}
              width="100%"
            />
          </div>

          {/* Bucket Selection */}
          {selectedPlanId && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                fontFamily: 'Poppins',
                color: colors.text,
                marginBottom: '8px'
              }}>
                Select Bucket
              </label>
              {availableBuckets.length > 0 ? (
                <CustomDropdown
                  value={selectedBucketId}
                  options={[
                    { label: 'Choose a bucket...', value: '' },
                    ...availableBuckets.map((bucket) => ({
                      label: bucket.name,
                      value: bucket.id
                    }))
                  ]}
                  onChange={(value) => setSelectedBucketId(value)}
                  disabled={false}
                  dropdownRef={bucketDropdownRef}
                  isOpen={bucketDropdownOpen}
                  setIsOpen={setBucketDropdownOpen}
                  width="100%"
                />
              ) : (
                <div style={{
                  fontSize: '14px',
                  fontFamily: 'Poppins',
                  color: colors.textSecondary,
                  padding: '8px 0'
                }}>
                  No buckets available in this plan
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '16px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px 16px',
                border: `1px solid ${colors.border}`,
                backgroundColor: 'white',
                color: colors.text,
                borderRadius: '8px',
                fontFamily: 'Poppins',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = colors.backgroundSecondary}
              onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedPlanId || !selectedBucketId}
              style={{
                flex: 1,
                padding: '10px 24px',
                backgroundColor: (selectedPlanId && selectedBucketId) ? colors.primaryDark : colors.disabled,
                color: (selectedPlanId && selectedBucketId) ? colors.primary : colors.textLight,
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'Poppins',
                fontSize: '14px',
                fontWeight: '600',
                cursor: (selectedPlanId && selectedBucketId) ? 'pointer' : 'not-allowed',
                transition: 'opacity 0.2s',
                opacity: (selectedPlanId && selectedBucketId) ? 1 : 0.6
              }}
              onMouseOver={(e) => { if (selectedPlanId && selectedBucketId) e.target.style.opacity = '0.9'; }}
              onMouseOut={(e) => { if (selectedPlanId && selectedBucketId) e.target.style.opacity = '1'; }}
            >
              Move Tasks
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
