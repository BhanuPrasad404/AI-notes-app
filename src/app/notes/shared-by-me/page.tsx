// app/notes/shared-by-me/page.tsx - OPTIMIZED COMPACT VERSION WITH MODALS
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import Toast from '@/components/Toast';
import { logger } from '@/lib/logger';

const Icons = {
  Back: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Revoke: () => <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Loader: () => <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V4a8 8 0 00-8 8h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>,
  Search: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Document: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Close: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
};

interface SharedNoteData {
  id: string;
  note: {
    id: string;
    title: string;
    user: { id: string; name: string; email: string; avatarUrl?: string };
  };
  sharedWith: { id: string; name: string; email: string; avatarUrl?: string };
  permission: 'VIEW' | 'EDIT';
  sharedAt: string;
}

// Modal Components
const RevokeSingleModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  noteTitle: string;
  userEmail: string;
  isLoading: boolean;
}> = ({ isOpen, onClose, onConfirm, noteTitle, userEmail, isLoading }) => {
  if (!isOpen) return null;

  return (
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
            Revoke {userEmail}'s access to "<span className="font-medium">{noteTitle}</span>"?
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Icons.Loader /> : <Icons.Revoke />}
            Revoke
          </button>
        </div>
      </div>
    </div>
  );
};

const RevokeBulkModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count: number;
  isLoading: boolean;
}> = ({ isOpen, onClose, onConfirm, count, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full mx-auto shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-500/20 mb-4">
            <Icons.Revoke />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Revoke {count} Share{count > 1 ? 's' : ''}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
            Are you sure you want to revoke {count} share{count > 1 ? 's' : ''}? This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Icons.Loader /> : <Icons.Revoke />}
            Revoke {count}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function SharedByMePage() {
  const [sharedNotes, setSharedNotes] = useState<SharedNoteData[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<SharedNoteData[]>([]);
  const [selectedShares, setSelectedShares] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [revoking, setRevoking] = useState<string | null>(null);
  const [bulkRevoking, setBulkRevoking] = useState(false);

  // Modal states
  const [showSingleRevokeModal, setShowSingleRevokeModal] = useState(false);
  const [showBulkRevokeModal, setShowBulkRevokeModal] = useState(false);
  const [currentRevokeData, setCurrentRevokeData] = useState<{
    id: string;
    noteTitle: string;
    userEmail: string;
  } | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchSharedNotes();
  }, []);

  useEffect(() => {
    filterNotes();
  }, [sharedNotes, search]);

  const fetchSharedNotes = async () => {
    try {
      const token = auth.getToken();
      if (!token) return;
      const data = await api.getNotesSharedByMe(token);
      setSharedNotes(data.sharedNotes || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load shared notes');
    } finally {
      setLoading(false);
    }
  };

  const filterNotes = () => {
    let filtered = [...sharedNotes];
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(sharedNote =>
        sharedNote.note.title?.toLowerCase().includes(searchLower) ||
        sharedNote.sharedWith.name?.toLowerCase().includes(searchLower) ||
        sharedNote.sharedWith.email?.toLowerCase().includes(searchLower)
      );
    }
    setFilteredNotes(filtered);
  };

  // Single revoke flow
  const handleRevokeClick = (sharedNoteId: string, noteTitle: string, userEmail: string) => {
    setCurrentRevokeData({ id: sharedNoteId, noteTitle, userEmail });
    setShowSingleRevokeModal(true);
  };

  const handleConfirmSingleRevoke = async () => {
    if (!currentRevokeData) return;

    setShowSingleRevokeModal(false);
    setRevoking(currentRevokeData.id);

    try {
      const token = auth.getToken();
      if (!token) return;

      const sharedNote = sharedNotes.find(sn => sn.id === currentRevokeData.id);
      if (!sharedNote) return;

      await api.revokeShare(token, sharedNote.note.id, sharedNote.sharedWith.id);

      // Socket notification for real-time updates
      const socketService = await import('@/lib/socket');
      const socket = socketService.socketService.connect();
      if (socket) {
        socket.emit('revoke-access', {
          targetUserId: sharedNote.sharedWith.id,
          noteId: sharedNote.note.id,
          revokedBy: { name: sharedNote.note.user.name }
        });
      }

      setSharedNotes(prev => prev.filter(sn => sn.id !== currentRevokeData.id));
      setSelectedShares(prev => prev.filter(id => id !== currentRevokeData.id));
      setSuccess(`Access revoked for ${currentRevokeData.userEmail}`);
    } catch (err: any) {
      setError('Failed to revoke access: ' + err.message);
    } finally {
      setRevoking(null);
      setCurrentRevokeData(null);
    }
  };

  const handleCancelSingleRevoke = () => {
    setShowSingleRevokeModal(false);
    setCurrentRevokeData(null);
  };

  // Bulk revoke flow
  const handleBulkRevokeClick = () => {
    if (selectedShares.length === 0) return;
    setShowBulkRevokeModal(true);
  };

  const handleConfirmBulkRevoke = async () => {
    setShowBulkRevokeModal(false);
    setBulkRevoking(true);

    try {
      const token = auth.getToken();
      if (!token) return;

      const sharesToRevoke = sharedNotes.filter(sn => selectedShares.includes(sn.id));

      // SINGLE BULK SOCKET EVENT
      const socketService = await import('@/lib/socket');
      const socket = socketService.socketService.connect();

      if (socket) {
        logger.info(`Sending bulk revoke for users:`, { count: sharesToRevoke.length });
        socket.emit('revoke-access-bulk', {
          revocations: sharesToRevoke.map(sharedNote => ({
            targetUserId: sharedNote.sharedWith.id,
            noteId: sharedNote.note.id
          })),
          revokedBy: { name: sharedNotes[0]?.note.user.name || 'Owner' }
        });
      }

      await api.bulkRevokeShares(token, { shareIds: selectedShares });
      setSharedNotes(prev => prev.filter(sn => !selectedShares.includes(sn.id)));
      setSelectedShares([]);
      setSuccess(`Revoked ${selectedShares.length} share(s) successfully`);
    } catch (err: any) {
      setError('Bulk revoke failed: ' + err.message);
    } finally {
      setBulkRevoking(false);
    }
  };

  const handleCancelBulkRevoke = () => {
    setShowBulkRevokeModal(false);
  };

  const toggleSelectAll = () => {
    if (selectedShares.length === filteredNotes.length) {
      setSelectedShares([]);
    } else {
      setSelectedShares(filteredNotes.map(sn => sn.id));
    }
  };

  const toggleSelectShare = (shareId: string) => {
    setSelectedShares(prev =>
      prev.includes(shareId)
        ? prev.filter(id => id !== shareId)
        : [...prev, shareId]
    );
  };

  const getPermissionColor = (permission: 'VIEW' | 'EDIT') => {
    return permission === 'EDIT'
      ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/30'
      : 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-500/30';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-blue-600 dark:border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Loading shared notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <Link href="/notes" className="text-blue-600 dark:text-cyan-400 hover:text-blue-700 dark:hover:text-cyan-300 transition-colors">
                <Icons.Back />
              </Link>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Shared by Me</h1>
              <span className="text-blue-600 dark:text-cyan-400 text-sm">{sharedNotes.length}</span>
            </div>
          </div>

          {/* Search */}
          <div className="pb-4">
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                <Icons.Search />
              </div>
              <input
                type="text"
                placeholder="Search notes or people..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 focus:border-blue-500 dark:focus:border-cyan-500 text-sm transition-colors"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Bulk Actions Bar */}
      {selectedShares.length > 0 && (
        <div className="bg-blue-50 dark:bg-cyan-900/20 border-b border-blue-200 dark:border-cyan-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <span className="text-blue-700 dark:text-cyan-300 text-sm">
                {selectedShares.length} selected
              </span>
              <button
                onClick={handleBulkRevokeClick}
                disabled={bulkRevoking}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg border border-red-300 dark:border-red-500/30 transition-colors disabled:opacity-50"
              >
                {bulkRevoking ? <Icons.Loader /> : <Icons.Revoke />}
                <span>Revoke {selectedShares.length}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <Toast message={error} type="error" onClose={() => setError('')} />}
      {success && <Toast message={success} type="success" onClose={() => setSuccess('')} />}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icons.Document />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No shared notes found</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {search ? 'Try a different search' : 'Share notes to see them here'}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            {/* Table Header - Hidden on mobile, shown on tablet+ */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 lg:px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400 font-medium">
              <div className="md:col-span-1 flex items-center">
                <input
                  type="checkbox"
                  checked={selectedShares.length === filteredNotes.length && filteredNotes.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-blue-600 dark:text-cyan-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-cyan-500"
                />
              </div>
              <div className="md:col-span-5">Note & Person</div>
              <div className="md:col-span-2">Permission</div>
              <div className="md:col-span-3 hidden lg:block">Shared Date</div>
              <div className="md:col-span-1">Action</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredNotes.map((sharedNote) => (
                <div key={sharedNote.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:px-4 lg:px-6 md:py-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">

                  {/* Mobile Layout - Stacked */}
                  <div className="md:hidden space-y-3">
                    {/* Header Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={selectedShares.includes(sharedNote.id)}
                          onChange={() => toggleSelectShare(sharedNote.id)}
                          className="w-4 h-4 text-blue-600 dark:text-cyan-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded flex-shrink-0 focus:ring-blue-500 dark:focus:ring-cyan-500"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {sharedNote.note.title}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {sharedNote.sharedWith.name || sharedNote.sharedWith.email}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRevokeClick(sharedNote.id, sharedNote.note.title, sharedNote.sharedWith.email)}
                        disabled={revoking === sharedNote.id}
                        className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0 ml-2"
                        title="Revoke access"
                      >
                        {revoking === sharedNote.id ? <Icons.Loader /> : <Icons.Revoke />}
                      </button>
                    </div>

                    {/* Details Row */}
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span className={`inline-flex items-center px-2 py-1 rounded font-medium border ${getPermissionColor(sharedNote.permission)}`}>
                        {sharedNote.permission}
                      </span>
                      <span>{formatDate(sharedNote.sharedAt)}</span>
                    </div>
                  </div>

                  {/* Desktop Layout - Grid */}
                  {/* Checkbox */}
                  <div className="hidden md:flex md:col-span-1 items-center">
                    <input
                      type="checkbox"
                      checked={selectedShares.includes(sharedNote.id)}
                      onChange={() => toggleSelectShare(sharedNote.id)}
                      className="w-4 h-4 text-blue-600 dark:text-cyan-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-cyan-500"
                    />
                  </div>

                  {/* Note & Person */}
                  <div className="hidden md:block md:col-span-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0 shadow-lg">
                        {sharedNote?.sharedWith.avatarUrl ? (
                          <img
                            src={sharedNote?.sharedWith?.avatarUrl}
                            alt="User avatar"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm">
                            {sharedNote?.sharedWith.name?.charAt(0)?.toUpperCase() || sharedNote.sharedWith.email.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {sharedNote.note.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-1">
                          {sharedNote.sharedWith.name || sharedNote.sharedWith.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Permission */}
                  <div className="hidden md:flex md:col-span-2 items-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getPermissionColor(sharedNote.permission)}`}>
                      {sharedNote.permission}
                    </span>
                  </div>

                  {/* Shared Date - Hidden on tablet, shown on desktop+ */}
                  <div className="hidden lg:flex lg:col-span-3 items-center text-xs text-gray-600 dark:text-gray-400">
                    {formatDate(sharedNote.sharedAt)}
                  </div>

                  {/* Action */}
                  <div className="hidden md:flex md:col-span-1 items-center justify-end">
                    <button
                      onClick={() => handleRevokeClick(sharedNote.id, sharedNote.note.title, sharedNote.sharedWith.email)}
                      disabled={revoking === sharedNote.id}
                      className="p-1.5 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                      title="Revoke access"
                    >
                      {revoking === sharedNote.id ? <Icons.Loader /> : <Icons.Revoke />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <RevokeSingleModal
        isOpen={showSingleRevokeModal}
        onClose={handleCancelSingleRevoke}
        onConfirm={handleConfirmSingleRevoke}
        noteTitle={currentRevokeData?.noteTitle || ''}
        userEmail={currentRevokeData?.userEmail || ''}
        isLoading={revoking !== null}
      />

      <RevokeBulkModal
        isOpen={showBulkRevokeModal}
        onClose={handleCancelBulkRevoke}
        onConfirm={handleConfirmBulkRevoke}
        count={selectedShares.length}
        isLoading={bulkRevoking}
      />
    </div>
  );
}