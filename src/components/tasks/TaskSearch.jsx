import React, { useState, useRef, useEffect } from 'react';
import { Search, Calendar, Folder } from '../ui/icons';
import { useTheme } from '../../contexts/ThemeContext';

export default function TaskSearch({ tasks, plans, buckets, onTaskSelect }) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useRef(null);

  // Filter tasks based on search query
  const filteredTasks = searchQuery.trim()
    ? tasks.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setIsDropdownOpen(true);
  };

  const handleTaskClick = (task) => {
    onTaskSelect(task);
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  const getPlanName = (planId) => {
    return plans[planId] || 'Unknown Plan';
  };

  const getBucketName = (task) => {
    const planBuckets = buckets[task.planId] || [];
    const bucket = planBuckets.find(b => b.id === task.bucketId);
    return bucket ? bucket.name : 'No Bucket';
  };

  const getTaskStatus = (task) => {
    if (task.percentComplete === 100) {
      return { label: 'Complete', color: '#86efac', textColor: '#166534' };
    } else if (task.percentComplete > 0) {
      return { label: 'In Progress', color: '#fde047', textColor: '#854d0e' };
    } else {
      return { label: 'Not Started', color: '#cbd5e1', textColor: '#475569' };
    }
  };

  return (
    <div ref={searchRef} style={{ position: 'relative', width: '100%' }}>
      {/* Search Input */}
      <div style={{
        position: 'relative',
        backgroundColor: colors.background,
        borderRadius: '12px',
        border: `2px solid ${isDropdownOpen && searchQuery ? colors.primary : colors.border}`,
        transition: 'border-color 0.2s'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
          gap: '12px'
        }}>
          <Search size={20} style={{ color: colors.textSecondary }} />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder="Search tasks..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              fontFamily: 'Poppins',
              color: colors.text,
              backgroundColor: 'transparent'
            }}
          />
          {searchQuery && (
            <span style={{
              fontSize: '12px',
              fontFamily: 'Poppins',
              color: colors.textSecondary
            }}>
              {filteredTasks.length} result{filteredTasks.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isDropdownOpen && searchQuery && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          right: 0,
          maxHeight: '400px',
          overflowY: 'auto',
          backgroundColor: colors.background,
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          border: `1px solid ${colors.border}`,
          zIndex: 1000
        }}>
          {filteredTasks.length > 0 ? (
            <div style={{ padding: '8px' }}>
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    marginBottom: '4px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    fontFamily: 'Poppins',
                    color: colors.text,
                    marginBottom: '6px'
                  }}>
                    {task.title}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '12px',
                    fontFamily: 'Poppins',
                    color: colors.textSecondary,
                    flexWrap: 'wrap'
                  }}>
                    {/* Status Badge */}
                    {(() => {
                      const status = getTaskStatus(task);
                      return (
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600',
                          backgroundColor: status.color,
                          color: status.textColor
                        }}>
                          {status.label}
                        </span>
                      );
                    })()}

                    {task.dueDateTime && (
                      <>
                        <span>•</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} style={{ color: colors.textSecondary }} />
                          {new Date(task.dueDateTime).toLocaleDateString()}
                        </div>
                      </>
                    )}
                    <span>•</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Folder size={12} style={{ color: colors.textSecondary }} />
                      {getPlanName(task.planId)}
                    </div>
                    <span>•</span>
                    <span>{getBucketName(task)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              padding: '32px 16px',
              textAlign: 'center',
              fontSize: '14px',
              fontFamily: 'Poppins',
              color: colors.textSecondary
            }}>
              No tasks found matching "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
