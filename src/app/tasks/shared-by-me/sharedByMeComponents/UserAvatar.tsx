import React, { useCallback } from 'react';

interface UserAvatarProps {
  user: { name?: string; email: string; avatarUrl?: string };
  status: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, status }) => {
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'TODO': return 'bg-red-500';
      case 'IN_PROGRESS': return 'bg-yellow-500';
      case 'DONE': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  }, []);

  const statusColor = getStatusColor(status);
  const userInitial = user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase();

  return (
    <div className="relative flex-shrink-0">
      {user.avatarUrl ? (
        <div className="w-8 h-8 rounded-full overflow-hidden">
          <img
            src={user.avatarUrl}
            alt="User avatar"
            className="w-8 h-8 rounded-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm">
          {userInitial}
        </div>
      )}
      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${statusColor}`} />
    </div>
  );
};

export default UserAvatar;