'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import Toast from '@/components/Toast';

// Import shared components
import { Icons } from './sharedByMeComponents/Icons';
import { SharedByMeSkeleton } from './sharedByMeComponents/SharedByMeSkeleton';
import SearchBar from './sharedByMeComponents/SearchBar';
import BulkActionsBar from './sharedByMeComponents/BulkActionsBar';
import TableRow from './sharedByMeComponents/TableRow';
import SharedByMeHeader from './sharedByMeComponents/SharedByMeHeader';
import FilterBar from './sharedByMeComponents/FilterBar';
import { logger } from '@/lib/logger';

export default function SharedByMePage() {
  const [sharedTasks, setSharedTasks] = useState<any[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<any[]>([]);
  const [selectedShares, setSelectedShares] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [permissionFilter, setPermissionFilter] = useState('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');
  const [success, setSuccess] = useState('');
  const [revoking, setRevoking] = useState<string | null>(null);
  const [bulkRevoking, setBulkRevoking] = useState(false);

  // Modal states
  const [showSingleRevokeModal, setShowSingleRevokeModal] = useState(false);
  const [showBulkRevokeModal, setShowBulkRevokeModal] = useState(false);
  const [currentRevokeTask, setCurrentRevokeTask] = useState<{
    id: string;
    taskTitle: string;
    userEmail: string;
  } | null>(null);

  const router = useRouter();

  const selectedCount = useMemo(() => selectedShares.length, [selectedShares.length]);

  const fetchSharedTasks = useCallback(async () => {
    try {
      const token = auth.getToken();
      if (!token) return;
      const data = await api.getTasksSharedByMe(token);
      setSharedTasks(data.sharedTasks || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load shared tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const hasActiveFilters = useMemo(() =>
    statusFilter !== 'ALL' || permissionFilter !== 'ALL' || urgencyFilter !== 'ALL',
    [statusFilter, permissionFilter, urgencyFilter]
  );

  const filterTasks = useCallback(() => {
    let filtered = [...sharedTasks];
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(sharedTask =>
        sharedTask.task.title?.toLowerCase().includes(searchLower) ||
        sharedTask.sharedWith.name?.toLowerCase().includes(searchLower) ||
        sharedTask.sharedWith.email?.toLowerCase().includes(searchLower) ||
        sharedTask.project?.name?.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(sharedTask => sharedTask.task.status === statusFilter);
    }

    if (permissionFilter !== 'ALL') {
      filtered = filtered.filter(sharedTask => sharedTask.permission === permissionFilter);
    }

    if (urgencyFilter !== 'ALL') {
      filtered = filtered.filter(sharedTask => sharedTask.task.urgency === urgencyFilter);
    }
    setFilteredTasks(filtered);
  }, [sharedTasks, search, statusFilter, permissionFilter, urgencyFilter]);

  // Single revoke flow
  const handleRevokeClick = useCallback((sharedTaskId: string, taskTitle: string, userEmail: string) => {
    setCurrentRevokeTask({ id: sharedTaskId, taskTitle, userEmail });
    setShowSingleRevokeModal(true);
  }, []);

  const handleConfirmSingleRevoke = useCallback(async () => {
    if (!currentRevokeTask) return;

    setShowSingleRevokeModal(false);
    setRevoking(currentRevokeTask.id);

    try {
      const token = auth.getToken();
      if (!token) return;

      const sharedTask = sharedTasks.find(st => st.id === currentRevokeTask.id);
      if (!sharedTask) {
        logger.error('Shared task not found for revocation', { sharedTaskId: currentRevokeTask.id });
        return;
      }

      if (!sharedTask.task || !sharedTask.sharedWith) {
        logger.error('Incomplete shared task data for revocation', {
          sharedTaskId: currentRevokeTask.id,
          hasTask: !!sharedTask.task,
          hasSharedWith: !!sharedTask.sharedWith
        });
        return;
      }

      logger.info('Revoking task share', {
        taskId: sharedTask.task.id,
        taskTitle: sharedTask.task.title,
        targetUserId: sharedTask.sharedWith.id,
        targetUserEmail: sharedTask.sharedWith.email
      });

      await api.revokeTaskShare(token, sharedTask.task.id, sharedTask.sharedWith.id);

      // Emit real-time revocation notification
      const socketService = await import('@/lib/socket');
      const socket = socketService.socketService.connect();
      if (socket) {
        socket.emit('revoke-task-access', {
          targetUserId: sharedTask.sharedWith.id,
          taskId: sharedTask.task.id,
          revokedBy: {
            name: sharedTask.task.user?.name || 'Owner'
          }
        });
        logger.debug('Revocation socket event emitted', {
          taskId: sharedTask.task.id,
          targetUserId: sharedTask.sharedWith.id
        });
      }

      // Update local state
      setSharedTasks(prev => prev.filter(st => st.id !== currentRevokeTask.id));
      setSelectedShares(prev => prev.filter(id => id !== currentRevokeTask.id));
      setSuccess(`Access revoked for ${currentRevokeTask.userEmail}`);

      logger.info('Task share revoked successfully', {
        sharedTaskId: currentRevokeTask.id,
        userEmail: currentRevokeTask.userEmail
      });

    } catch (err: any) {
      logger.error('Failed to revoke task share', err);
      setError('Failed to revoke access: ' + err.message);
    } finally {
      setRevoking(null);
      setCurrentRevokeTask(null);
    }
  }, [currentRevokeTask, sharedTasks]);

  const handleCancelSingleRevoke = useCallback(() => {
    setShowSingleRevokeModal(false);
    setCurrentRevokeTask(null);
  }, []);

  // Bulk revoke flow
  const handleBulkRevokeClick = useCallback(() => {
    if (selectedShares.length === 0) return;
    setShowBulkRevokeModal(true);
  }, [selectedShares.length]);

  const handleConfirmBulkRevoke = useCallback(async () => {
    setShowBulkRevokeModal(false);
    setBulkRevoking(true);

    try {
      const token = auth.getToken();
      if (!token) return;

      const tasksToRevoke = sharedTasks.filter(st => selectedShares.includes(st.id));

      // Get current user name safely
      const currentUser = auth.getCurrentUser();
      const revokedByName = currentUser?.name || 'Owner';

      const socketService = await import('@/lib/socket');
      const socket = socketService.socketService.connect();

      if (socket) {
        console.log(`Sending bulk task revoke for ${tasksToRevoke.length} users`);
        socket.emit('revoke-task-access-bulk', {
          revocations: tasksToRevoke.map(sharedTask => ({
            targetUserId: sharedTask.sharedWith.id,
            taskId: sharedTask.task.id
          })),
          revokedBy: { name: revokedByName }
        });
      }

      await api.bulkRevokeTaskShares(token, { shareIds: selectedShares });
      setSharedTasks(prev => prev.filter(st => !selectedShares.includes(st.id)));
      setSelectedShares([]);
      setSuccess(`Revoked ${selectedShares.length} share(s) successfully`);
    } catch (err: any) {
      setError('Bulk revoke failed: ' + (err.message || 'Unknown error'));
    } finally {
      setBulkRevoking(false);
    }
  }, [selectedShares, sharedTasks]);

  const handleCancelBulkRevoke = useCallback(() => {
    setShowBulkRevokeModal(false);
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedShares(prev =>
      prev.length === filteredTasks.length ? [] : filteredTasks.map(st => st.id)
    );
  }, [filteredTasks.length]);

  const toggleSelectShare = useCallback((shareId: string) => {
    setSelectedShares(prev =>
      prev.includes(shareId)
        ? prev.filter(id => id !== shareId)
        : [...prev, shareId]
    );
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchSharedTasks();
  }, [fetchSharedTasks, router]);

  useEffect(() => {
    filterTasks();
  }, [filterTasks]);

  const handleClearFilters = useCallback(() => {
    setStatusFilter('ALL');
    setPermissionFilter('ALL');
    setUrgencyFilter('ALL');
  }, []);

  if (loading) {
    return <SharedByMeSkeleton />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <SharedByMeHeader
        sharedTasksCount={sharedTasks.length}
        search={search}
        onSearchChange={handleSearchChange}
      />

      <FilterBar
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        permissionFilter={permissionFilter}
        onPermissionFilterChange={setPermissionFilter}
        urgencyFilter={urgencyFilter}
        onUrgencyFilterChange={setUrgencyFilter}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Bulk Actions Bar */}
      {selectedCount > 0 && (
        <BulkActionsBar
          selectedCount={selectedCount}
          onBulkRevoke={handleBulkRevokeClick}
          loading={bulkRevoking}
        />
      )}

      {/* Toast Messages */}
      {error && <Toast message={error} type="error" onClose={() => setError('')} />}
      {success && <Toast message={success} type="success" onClose={() => setSuccess('')} />}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icons.Search />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No shared tasks found</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {search ? 'Try a different search' : 'Share tasks to see them here'}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            {/* Desktop Header */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400 font-medium">
              <div className="col-span-1 flex items-center">
                <input
                  type="checkbox"
                  checked={selectedCount === filteredTasks.length && filteredTasks.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-blue-600 dark:text-cyan-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-cyan-500 focus:ring-2"
                />
              </div>
              <div className="col-span-3">Task & Person</div>
              <div className="col-span-2">Project</div>
              <div className="col-span-2">Urgency</div>
              <div className="col-span-2">Permission</div>
              <div className="col-span-1">Shared</div>
              <div className="col-span-1">Action</div>
            </div>

            {/* Mobile Header */}
            <div className="lg:hidden px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-center">
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                Shared Tasks ({filteredTasks.length})
              </span>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredTasks.map((sharedTask) => (
                <TableRow
                  key={sharedTask.id}
                  sharedTask={sharedTask}
                  isSelected={selectedShares.includes(sharedTask.id)}
                  onSelect={toggleSelectShare}
                  onRevoke={handleRevokeClick}
                  revokingId={revoking}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Single Revoke Modal */}
      {showSingleRevokeModal && currentRevokeTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full mx-auto shadow-xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-500/20 mb-4">
                <Icons.Revoke />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Revoke Access
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                Revoke {currentRevokeTask.userEmail}'s access to "{currentRevokeTask.taskTitle}"?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancelSingleRevoke}
                disabled={revoking !== null}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSingleRevoke}
                disabled={revoking !== null}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {revoking ? <Icons.Loader /> : <Icons.Revoke />}
                {revoking ? 'Revoking...' : 'Revoke'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Revoke Modal */}
      {showBulkRevokeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full mx-auto shadow-xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-500/20 mb-4">
                <Icons.Revoke />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Revoke {selectedCount} Share{selectedCount > 1 ? 's' : ''}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                Are you sure you want to revoke {selectedCount} share{selectedCount > 1 ? 's' : ''}? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancelBulkRevoke}
                disabled={bulkRevoking}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBulkRevoke}
                disabled={bulkRevoking}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {bulkRevoking ? <Icons.Loader /> : <Icons.Revoke />}
                {bulkRevoking ? 'Revoking...' : `Revoke ${selectedCount}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}