'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { socketService } from '@/lib/socket';
import { logger } from '@/lib/logger';

interface ShareTaskModalProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
  onShareSuccess: () => void;
  taskTitle?: string;
}

interface TaskCollaborator {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  taskCollaborations: number;
  lastCollaborated: string;
  lastTaskTitle: string;
}

// Icons remain the same...
const TaskIcons = {
  Close: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Assignment: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  UserAdd: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  View: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  Edit: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Task: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  Users: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  )
};

export default function ShareTaskModal({
  taskId,
  isOpen,
  onClose,
  onShareSuccess,
  taskTitle
}: ShareTaskModalProps) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'VIEW' | 'EDIT'>('VIEW');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recentCollaborators, setRecentCollaborators] = useState<TaskCollaborator[]>([]);
  const [collaboratorsLoading, setCollaboratorsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'share' | 'collaborators'>('share');

  useEffect(() => {
    if (isOpen) {

      if (!socketService.isConnected()) {
        logger.info('Connecting socket for task sharing');
        socketService.connect();
      }
      setEmail('');
      setPermission('VIEW');
      setError('');
      setSuccess('');
      setActiveTab('share');
      fetchRecentCollaborators();
    }
  }, [isOpen]);

  const fetchRecentCollaborators = async () => {
    setCollaboratorsLoading(true);
    try {
      const token = auth.getToken();
      if (!token) return;

      const data = await api.getCombinedCollaborationHistory(token);

      const taskCollabs = data.collaborators
        .filter((collab: any) => collab.taskCollaborations > 0)
        .slice(0, 5)
        .map((collab: any) => ({
          id: collab.id,
          name: collab.name,
          email: collab.email,
          avatarUrl: collab.avatarUrl,
          taskCollaborations: collab.taskCollaborations,
          lastCollaborated: collab.lastCollaborated,
          lastTaskTitle: collab.lastItemTitle
        }));

      setRecentCollaborators(taskCollabs);
    } catch (error) {
      console.error('Failed to fetch recent collaborators:', error);
    } finally {
      setCollaboratorsLoading(false);
    }
  };

  const handleShare = async (shareEmail = email) => {
    const emailToUse = shareEmail || email;

    if (!emailToUse.trim()) {
      setError('Please enter an email address');
      return;
    }

    if (!emailToUse.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = auth.getToken();
      if (!token) return;

      logger.info('Starting task share process', {
        taskId,
        targetEmail: emailToUse,
        permission
      });

      // First share the task via API
      const result = await api.shareTask(token, taskId, {
        sharedWithEmail: emailToUse,
        permission
      });

      logger.info('Task share API call successful', {
        taskId,
        targetUserId: result.targetUserId,
        targetEmail: emailToUse
      });

      let socket = socketService.getSocket();

      // If socket is not connected, try to connect
      if (!socket || !socketService.isConnected()) {
        logger.info('Socket not connected, attempting to connect');
        const newSocket = socketService.connect();
        // Use the new socket if available, otherwise fall back to existing socket
        socket = newSocket || socketService.getSocket();
      }

      //Use type-safe check that works with both null and undefined
      if (socket != null && result.targetUserId) {
        socket.emit('share-task', {
          taskId: taskId,
          targetUserId: result.targetUserId,
          permission: permission
        });

        logger.info('Socket event emitted: share-task', {
          taskId,
          targetUserId: result.targetUserId,
          permission,
          socketId: socket.id,
          connected: socket.connected
        });
      } else {
        logger.warn('Socket not available or missing targetUserId for share notification', {
          socketAvailable: socket != null, // This handles both null and undefined
          socketConnected: socket?.connected,
          targetUserId: result.targetUserId,
          taskId
        });
      }

      setSuccess(`Task shared with ${emailToUse}`);
      setEmail('');
      onShareSuccess();

      logger.info('Task share process completed successfully', {
        taskId,
        targetEmail: emailToUse
      });

      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 2000);

    } catch (err: any) {
      logger.error('Task share process failed', err, {
        taskId,
        targetEmail: emailToUse,
        permission
      });

      setError(err.message || 'Failed to share task');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickShare = (userEmail: string) => {
    setEmail(userEmail);
    setActiveTab('share');
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Enter' && !loading && email.trim()) {
        e.preventDefault(); // Prevent form submission
        handleShare();
      }

      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, loading, email]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime(); // Difference in milliseconds

    // Convert to minutes
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`; // Show minutes
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl w-full max-w-4xl border border-gray-300 dark:border-gray-600 shadow-2xl transform animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] lg:flex-row">

        {/* Mobile Tabs */}
        <div className="flex lg:hidden border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('share')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all ${activeTab === 'share'
              ? 'bg-green-500 text-white'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            <TaskIcons.UserAdd />
            Share Task
          </button>
          <button
            onClick={() => setActiveTab('collaborators')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all ${activeTab === 'collaborators'
              ? 'bg-blue-500 text-white'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            <TaskIcons.Users />
            Recent ({recentCollaborators.length})
          </button>
        </div>

        {/* Left Side - Share Form */}
        <div className={`flex-1 flex flex-col min-w-0 ${activeTab !== 'share' ? 'hidden lg:flex' : 'flex'}`}>
          {/* Header */}
          <div className="relative p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <TaskIcons.Assignment />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                  Share Task
                </h2>
                {taskTitle && (
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                    "{taskTitle}"
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <TaskIcons.Close />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Email Input */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 shadow-sm">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <TaskIcons.UserAdd />
                <span>Collaborator's Email</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teammate@company.com"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !loading) {
                    handleShare();
                  }
                }}
              />
            </div>

            {/* Permission Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Access Level
              </label>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button
                  onClick={() => setPermission('VIEW')}
                  className={`flex items-center justify-center space-x-2 p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-sm sm:text-base ${permission === 'VIEW'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 shadow-sm transform scale-105'
                    : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:border-green-400 hover:bg-green-25 dark:hover:bg-green-900/10'
                    }`}
                >
                  <TaskIcons.View />
                  <span className="font-medium">View Only</span>
                </button>
                <button
                  onClick={() => setPermission('EDIT')}
                  className={`flex items-center justify-center space-x-2 p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-sm sm:text-base ${permission === 'EDIT'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm transform scale-105'
                    : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:bg-blue-25 dark:hover:bg-blue-900/10'
                    }`}
                >
                  <TaskIcons.Edit />
                  <span className="font-medium">Can Edit</span>
                </button>
              </div>
            </div>

            {/* Status Messages */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 sm:p-4 animate-in fade-in duration-200">
                <p className="text-red-700 dark:text-red-300 text-xs sm:text-sm font-medium">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 sm:p-4 animate-in fade-in duration-200">
                <div className="flex items-center space-x-2 text-green-700 dark:text-green-300 text-xs sm:text-sm font-medium">
                  <TaskIcons.Check />
                  <span>{success}</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between space-x-2 sm:space-x-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <button
              onClick={onClose}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={() => handleShare()}
              disabled={loading || !email.trim()}
              className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform hover:scale-105 text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-white border-solid rounded-full animate-spin"></div>
                  <span className="hidden xs:inline">Sharing...</span>
                  <span className="xs:hidden">Share...</span>
                </>
              ) : (
                <>
                  <TaskIcons.UserAdd />
                  <span className="hidden xs:inline">Share Task</span>
                  <span className="xs:hidden">Share</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side - Recent Collaborators */}
        <div className={`w-full lg:w-80 border-t lg:border-l border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50 dark:bg-gray-800/30 ${activeTab !== 'collaborators' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Recent Collaborators</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Click to auto-fill email</p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3">
            {collaboratorsLoading ? (
              <div className="space-y-2 sm:space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-3 sm:h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-1 sm:mb-2"></div>
                      <div className="h-2 sm:h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentCollaborators.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TaskIcons.Task />
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">No recent task collaborators</p>
              </div>
            ) : (
              recentCollaborators.map((collaborator) => (
                <div
                  key={collaborator.id}
                  className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 transition-all duration-200 cursor-pointer group"
                  onClick={() => handleQuickShare(collaborator.email)}
                >
                  {/* Avatar */}
                  {collaborator.avatarUrl ? (
                    <img
                      src={collaborator.avatarUrl}
                      alt={collaborator.name}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white dark:border-gray-800"
                    />
                  ) : (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                      {getInitials(collaborator.name)}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {collaborator.name}
                    </h4>
                    <div className="flex items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {collaborator.taskCollaborations} tasks
                      </span>
                      <span className="text-gray-400 text-xs">•</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getTimeAgo(collaborator.lastCollaborated)}
                      </span>
                    </div>
                  </div>

                  {/* Quick Share Button */}
                  <button
                    className="opacity-0 group-hover:opacity-100 bg-green-600 hover:bg-green-700 text-white p-1.5 sm:p-2 rounded-lg transition-all duration-200 transform -translate-x-1 group-hover:translate-x-0"
                    title="Auto-fill email"
                  >
                    <TaskIcons.UserAdd />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}