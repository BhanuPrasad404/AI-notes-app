import React, { useCallback } from 'react';
import { Icons } from './Icons';
import UserAvatar from './UserAvatar';
import ProjectBadge from './ProjectBadge';
import UrgencyBadge from './UrgencyBadge';
import PermissionBadge from './PermissionBadge';

interface TableRowProps {
  sharedTask: any;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onRevoke: (id: string, title: string, email: string) => void;
  revokingId: string | null;
}

const TableRow: React.FC<TableRowProps> = ({
  sharedTask,
  isSelected,
  onSelect,
  onRevoke,
  revokingId
}) => {
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }, []);

  const handleRevoke = useCallback(() => {
    onRevoke(sharedTask.id, sharedTask.task.title, sharedTask.sharedWith.email);
  }, [sharedTask.id, sharedTask.task.title, sharedTask.sharedWith.email, onRevoke]);

  const handleSelect = useCallback(() => {
    onSelect(sharedTask.id);
  }, [sharedTask.id, onSelect]);

  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-200 items-center">
        <div className="col-span-1 flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelect}
            className="w-4 h-4 text-blue-600 dark:text-cyan-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-cyan-500 focus:ring-2"
          />
        </div>

        <div className="col-span-3">
          <div className="flex items-center space-x-3">
            <UserAvatar user={sharedTask.sharedWith} status={sharedTask.task.status} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {sharedTask.task.title}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {sharedTask.sharedWith.name || sharedTask.sharedWith.email}
              </p>
            </div>
          </div>
        </div>

        <div className="col-span-2 flex items-center">
          <ProjectBadge project={sharedTask.project} />
        </div>

        <div className="col-span-2 flex items-center">
          <UrgencyBadge urgency={sharedTask.task.urgency} />
        </div>

        <div className="col-span-2 flex items-center">
          <PermissionBadge permission={sharedTask.permission} />
        </div>

        <div className="col-span-1 flex items-center text-xs text-gray-600 dark:text-gray-400">
          {formatDate(sharedTask.sharedAt)}
        </div>

        <div className="col-span-1 flex items-center justify-end">
          <button
            onClick={handleRevoke}
            disabled={revokingId === sharedTask.id}
            className="p-1.5 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors duration-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            title="Revoke access"
          >
            {revokingId === sharedTask.id ? <Icons.Loader /> : <Icons.Revoke />}
          </button>
        </div>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-200 border-b border-gray-200 dark:border-gray-800 last:border-b-0">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleSelect}
              className="w-4 h-4 text-blue-600 dark:text-cyan-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-cyan-500 focus:ring-2 mt-1 flex-shrink-0"
            />
            <UserAvatar user={sharedTask.sharedWith} status={sharedTask.task.status} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {sharedTask.task.title}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {sharedTask.sharedWith.name || sharedTask.sharedWith.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleRevoke}
            disabled={revokingId === sharedTask.id}
            className="p-1.5 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors duration-200 disabled:opacity-50 ml-2 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            {revokingId === sharedTask.id ? <Icons.Loader /> : <Icons.Revoke />}
          </button>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 pl-12">
          <ProjectBadge project={sharedTask.project} />
          <UrgencyBadge urgency={sharedTask.task.urgency} />
          <PermissionBadge permission={sharedTask.permission} />
          <span className="text-xs text-gray-600 dark:text-gray-400 ml-auto">
            {formatDate(sharedTask.sharedAt)}
          </span>
        </div>
      </div>
    </>
  );
};

export default TableRow;