import React, { useCallback } from 'react';

interface PermissionBadgeProps {
  permission: 'VIEW' | 'EDIT';
}

const PermissionBadge: React.FC<PermissionBadgeProps> = ({ permission }) => {
  const getPermissionColor = useCallback((perm: 'VIEW' | 'EDIT') => {
    return perm === 'EDIT'
      ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/30'
      : 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-500/30';
  }, []);

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getPermissionColor(permission)}`}>
      <span className="hidden sm:inline">{permission}</span>
      <span className="sm:hidden text-xs">
        {permission === 'EDIT' ? 'EDIT' : 'VIEW'}
      </span>
    </span>
  );
};

export default PermissionBadge;