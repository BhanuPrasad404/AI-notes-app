'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';

interface RecentCollobModalProps {
    isOpen: boolean;
    onClose: () => void;
    onShareRequest: (userEmail: string) => void;
}

interface CollaboratorHistory {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    joinedDate: string;
    collaborationCount: number;
    lastCollaborated: string;
    lastNoteTitle: string;
    firstCollaboration: string;
}

const Icons = {
    Close: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    Share: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
    ),
    Calendar: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    User: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    ),
    Notes: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    )
};

export default function RecentCollaboratorsModal({ isOpen, onClose, onShareRequest }: RecentCollobModalProps) {
    const [recentCollaborators, setRecentCollaborators] = useState<CollaboratorHistory[]>([]);
    const [selectedUser, setSelectedUser] = useState<CollaboratorHistory | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCollaborationHistory = async () => {
            if (!isOpen) return;

            setLoading(true);
            setError('');

            try {
                const token = auth.getToken();
                if (!token) {
                    setError('Authentication required');
                    return;
                }

                const data = await api.getCollaborationHistory(token);

                // Transform backend data to frontend format
                const collaborators = data.collaborators.map((collab: { id: any; name: any; email: any; avatarUrl: any; joinedDate: any; collaborationCount: any; lastCollaborated: any; lastNoteTitle: any; firstCollaboration: any; }) => ({
                    id: collab.id,
                    name: collab.name,
                    email: collab.email,
                    avatarUrl: collab.avatarUrl,
                    joinedDate: collab.joinedDate,
                    collaborationCount: collab.collaborationCount,
                    lastCollaborated: collab.lastCollaborated,
                    lastNoteTitle: collab.lastNoteTitle,
                    firstCollaboration: collab.firstCollaboration
                }));

                setRecentCollaborators(collaborators);
            } catch (err: any) {
                console.error('Failed to fetch collaboration history:', err);
                setError('Failed to load collaboration history');
                setRecentCollaborators([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCollaborationHistory();
    }, [isOpen]);

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
        return `${Math.floor(diffInHours / 168)}w ago`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleShareClick = (userEmail: string, event?: React.MouseEvent) => {
        if (event) {
            event.stopPropagation();
        }
        onShareRequest(userEmail);
        setSelectedUser(null);
        onClose();
    };

    const handleUserCardClick = (user: CollaboratorHistory) => {
        setSelectedUser(user);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Main Modal - MOBILE FIRST */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
                <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-800 shadow-2xl mx-2 sm:mx-0">
                    {/* Header - STICKY */}
                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 rounded-t-2xl z-10">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                                Collaboration History
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                                People you've shared notes with
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 ml-2"
                        >
                            <Icons.Close />
                        </button>
                    </div>

                    {/* Content - SCROLLABLE */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                        {loading ? (
                            <div className="text-center py-8 sm:py-12">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V4a8 8 0 00-8 8h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">Loading collaborators...</h3>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8 sm:py-12">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-200 to-red-300 dark:from-red-700 dark:to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">Failed to load</h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-4 text-sm">
                                    {error}
                                </p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : recentCollaborators.length === 0 ? (
                            <div className="text-center py-8 sm:py-12">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">No collaborators yet</h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto text-sm">
                                    Share notes with others to see them here.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3 sm:space-y-4">
                                {recentCollaborators.map((user) => (
                                    <div
                                        key={user.id}
                                        className="group flex items-start sm:items-center gap-3 p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200 cursor-pointer"
                                        onClick={() => handleUserCardClick(user)}
                                    >
                                        {/* Avatar */}
                                        <div className="relative flex-shrink-0">
                                            {user.avatarUrl ? (
                                                <img
                                                    src={user.avatarUrl}
                                                    alt={user.name}
                                                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border-2 border-white dark:border-gray-800 shadow-lg"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg">
                                                    {getInitials(user.name)}
                                                </div>
                                            )}
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                                        </div>

                                        {/* User Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 mb-1">
                                                <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm sm:text-base">
                                                    {user.name}
                                                </h3>
                                                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full w-fit mt-1 sm:mt-0">
                                                    {user.collaborationCount} note{user.collaborationCount > 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate mb-2">
                                                {user.email}
                                            </p>
                                            <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-3 text-xs text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <Icons.Calendar />
                                                    <span>{formatTimeAgo(user.lastCollaborated)}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Icons.Notes />
                                                    <span className="truncate max-w-[120px] sm:max-w-32">{user.lastNoteTitle}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Button - Always visible on mobile */}
                                        <button
                                            onClick={(e) => handleShareClick(user.email, e)}
                                            className="flex items-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 transform scale-95 hover:scale-100 flex-shrink-0 text-xs sm:text-sm"
                                        >
                                            <Icons.Share />
                                            <span className="hidden xs:inline font-medium">Share</span>
                                            <span className="xs:hidden font-medium">Share</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer - STICKY */}
                    <div className="flex items-center justify-between p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/20 rounded-b-2xl sticky bottom-0">
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {recentCollaborators.length} collaborator{recentCollaborators.length !== 1 ? 's' : ''}
                        </p>
                        <button
                            onClick={onClose}
                            className="px-3 py-2 sm:px-4 sm:py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-sm sm:text-base"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>

            {/* User Profile Modal - MOBILE OPTIMIZED */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-2 sm:p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-800 shadow-2xl mx-2 sm:mx-0">
                        {/* Profile Header */}
                        <div className="relative p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800">
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <Icons.Close />
                            </button>
                            <div className="text-center">
                                <div className="relative inline-block">
                                    {selectedUser.avatarUrl ? (
                                        <img
                                            src={selectedUser.avatarUrl}
                                            alt={selectedUser.name}
                                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-4 border-white dark:border-gray-800 shadow-xl mx-auto"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-xl mx-auto">
                                            {getInitials(selectedUser.name)}
                                        </div>
                                    )}
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mt-3 sm:mt-4">
                                    {selectedUser.name}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">{selectedUser.email}</p>
                            </div>
                        </div>

                        {/* Profile Details - SCROLLABLE */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 sm:p-4 text-center">
                                    <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {selectedUser.collaborationCount}
                                    </div>
                                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Notes Shared</div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 sm:p-4 text-center">
                                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Last Active</div>
                                    <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mt-1">
                                        {formatTimeAgo(selectedUser.lastCollaborated)}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 sm:p-4">
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
                                    <Icons.Notes />
                                    <span>Last Note</span>
                                </div>
                                <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                    {selectedUser.lastNoteTitle}
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 sm:p-4">
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
                                    <Icons.User />
                                    <span>Member Since</span>
                                </div>
                                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {formatDate(selectedUser.joinedDate)}
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 sm:p-4">
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
                                    <Icons.Calendar />
                                    <span>First Collaboration</span>
                                </div>
                                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {formatDate(selectedUser.firstCollaboration)}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800 space-y-2 sm:space-y-3">
                            <button
                                onClick={() => handleShareClick(selectedUser.email)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium text-sm sm:text-base"
                            >
                                <Icons.Share />
                                <span>Share New Note</span>
                            </button>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="w-full px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors rounded-xl border border-gray-200 dark:border-gray-700 text-sm sm:text-base"
                            >
                                Close Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}