import React from 'react';
import { Icons } from './Icons';

interface FilterBarProps {
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  permissionFilter: string;
  onPermissionFilterChange: (value: string) => void;
  urgencyFilter: string;
  onUrgencyFilterChange: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({
  statusFilter,
  onStatusFilterChange,
  permissionFilter,
  onPermissionFilterChange,
  urgencyFilter,
  onUrgencyFilterChange,
  onClearFilters,
  hasActiveFilters
}) => {
  const statusOptions = [
    { value: 'ALL', label: 'All Status' },
    { value: 'TODO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'DONE', label: 'Completed' }
  ];

  const permissionOptions = [
    { value: 'ALL', label: 'All Permissions' },
    { value: 'VIEW', label: 'View Only' },
    { value: 'EDIT', label: 'Can Edit' }
  ];

  const urgencyOptions = [
    { value: 'ALL', label: 'All Urgency' },
    { value: 'CRITICAL', label: 'Critical' },
    { value: 'HIGH', label: 'High' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'LOW', label: 'Low' }
  ];

  return (
    <div className="bg-gray-100 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        {/* Filter Title */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Icons.Filter />
          <span>Filter by:</span>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-3 flex-1">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 min-w-32"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Permission Filter */}
          <select
            value={permissionFilter}
            onChange={(e) => onPermissionFilterChange(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 min-w-36"
          >
            {permissionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Urgency Filter */}
          <select
            value={urgencyFilter}
            onChange={(e) => onUrgencyFilterChange(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 min-w-32"
          >
            {urgencyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="px-3 py-2 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-sm rounded-lg border border-cyan-300 dark:border-cyan-500/30 hover:bg-cyan-200 dark:hover:bg-cyan-500/30 transition-colors whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;