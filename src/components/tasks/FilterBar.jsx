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
  const hasActiveFilters = filters.priority || filters.planId || filters.dateRange;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="text-slate-600" />
          <h3 className="font-semibold text-slate-800">Filters & Sort</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Sort By */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            <SortAsc className="inline w-3 h-3 mr-1" />
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Priority</label>
          <select
            value={filters.priority || ''}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <label className="block text-xs font-medium text-slate-600 mb-1">Plan</label>
          <select
            value={filters.planId || ''}
            onChange={(e) => setFilters({ ...filters, planId: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Plans</option>
            {Object.entries(plans).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Due Date</label>
          <select
            value={filters.dateRange || ''}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Dates</option>
            <option value="overdue">Overdue</option>
            <option value="today">Due Today</option>
            <option value="week">Due This Week</option>
            <option value="month">Due This Month</option>
            <option value="none">No Due Date</option>
          </select>
        </div>
      </div>
    </div>
  );
}