import React from 'react';
import { Filter, SortAsc } from '../ui/icons';

export default function FilterBar({
  sortBy,
  setSortBy,
  filters,
  setFilters,
  plans,
  onClearFilters
}) {
  const hasActiveFilters = filters.priority || filters.planId || filters.dateRange || filters.customStartDate || filters.customEndDate;

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
      border: '1px solid #e5e7eb',
      padding: '12px 16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter style={{ color: 'var(--theme-primary-dark)' }} size={18} />
          <h3 style={{
            fontFamily: 'Poppins',
            fontSize: '15px',
            fontWeight: '600',
            color: 'var(--theme-primary-dark)'
          }}>
            Filters & Sort
          </h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            style={{
              fontSize: '13px',
              color: 'var(--theme-primary-dark)',
              fontFamily: 'Poppins',
              fontWeight: '500',
              backgroundColor: 'var(--theme-primary)',
              padding: '4px 12px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.opacity = '0.8'}
            onMouseOut={(e) => e.target.style.opacity = '1'}
          >
            Clear All
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {/* Sort By */}
        <div>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '12px',
            fontFamily: 'Poppins',
            fontWeight: '500',
            color: 'var(--theme-primary-dark)',
            marginBottom: '4px'
          }}>
            <SortAsc style={{ width: '12px', height: '12px', marginRight: '4px' }} />
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px',
              fontSize: '13px',
              fontFamily: 'Poppins',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontFamily: 'Poppins',
            fontWeight: '500',
            color: 'var(--theme-primary-dark)',
            marginBottom: '4px'
          }}>
            Priority
          </label>
          <select
            value={filters.priority || ''}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            style={{
              width: '100%',
              padding: '6px 10px',
              fontSize: '13px',
              fontFamily: 'Poppins',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">All Priorities</option>
            <option value="1">Urgent</option>
            <option value="3">Important</option>
            <option value="5">Medium</option>
            <option value="9">Low</option>
          </select>
        </div>

        {/* Plan Filter */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontFamily: 'Poppins',
            fontWeight: '500',
            color: 'var(--theme-primary-dark)',
            marginBottom: '4px'
          }}>
            Plan
          </label>
          <select
            value={filters.planId || ''}
            onChange={(e) => setFilters({ ...filters, planId: e.target.value })}
            style={{
              width: '100%',
              padding: '6px 10px',
              fontSize: '13px',
              fontFamily: 'Poppins',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">All Plans</option>
            {Object.entries(plans).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontFamily: 'Poppins',
            fontWeight: '500',
            color: 'var(--theme-primary-dark)',
            marginBottom: '4px'
          }}>
            Due Date
          </label>
          <select
            value={filters.dateRange || ''}
            onChange={(e) => {
              const newDateRange = e.target.value;
              setFilters({
                ...filters,
                dateRange: newDateRange,
                // Clear custom dates if switching away from custom
                ...(newDateRange !== 'custom' && { customStartDate: '', customEndDate: '' })
              });
            }}
            style={{
              width: '100%',
              padding: '6px 10px',
              fontSize: '13px',
              fontFamily: 'Poppins',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">All Dates</option>
            <option value="overdue">Overdue</option>
            <option value="today">Due Today</option>
            <option value="week">Due This Week</option>
            <option value="month">Due This Month</option>
            <option value="none">No Due Date</option>
            <option value="custom">Custom Range...</option>
          </select>
        </div>
      </div>

      {/* Custom Date Range Pickers */}
      {filters.dateRange === 'custom' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          paddingTop: '10px',
          marginTop: '10px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontFamily: 'Poppins',
              fontWeight: '500',
              color: 'var(--theme-primary-dark)',
              marginBottom: '4px'
            }}>
              From Date
            </label>
            <input
              type="date"
              value={filters.customStartDate || ''}
              onChange={(e) => setFilters({ ...filters, customStartDate: e.target.value })}
              style={{
                width: '100%',
                padding: '6px 10px',
                fontSize: '13px',
                fontFamily: 'Poppins',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontFamily: 'Poppins',
              fontWeight: '500',
              color: 'var(--theme-primary-dark)',
              marginBottom: '4px'
            }}>
              To Date
            </label>
            <input
              type="date"
              value={filters.customEndDate || ''}
              onChange={(e) => setFilters({ ...filters, customEndDate: e.target.value })}
              style={{
                width: '100%',
                padding: '6px 10px',
                fontSize: '13px',
                fontFamily: 'Poppins',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}