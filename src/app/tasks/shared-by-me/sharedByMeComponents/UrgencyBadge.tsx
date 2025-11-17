import React from 'react';

interface UrgencyBadgeProps {
  urgency: string;
}

const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ urgency }) => {
  const colors = {
    CRITICAL: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/30',
    HIGH: 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-500/30', 
    MEDIUM: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-500/30',
    LOW: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/30'
  };
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs border ${colors[urgency as keyof typeof colors] || colors.MEDIUM}`}>
      <span className="hidden sm:inline">{urgency}</span>
      <span className="sm:hidden text-xs">
        {urgency === 'CRITICAL' ? 'CRIT' : urgency.charAt(0)}
      </span>
    </span>
  );
};

export default UrgencyBadge;