import React, { useState, useEffect, useMemo } from 'react';
import { Note } from '@/types';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import { Icons } from './Icons';

interface MemoizedNoteCardProps {
    note: Note;
    onDelete: (id: string) => void;
    onClick: () => void;
    isAiProcessing: boolean;
}

const MemoizedNoteCard: React.FC<MemoizedNoteCardProps> = ({
    note,
    onDelete,
    onClick,
    isAiProcessing
}) => {
    const safeTags = useMemo(() => note.aiTags ?? [], [note.aiTags]);
    const [isLoading, setIsLoading] = useState(false);
    const [localNote, setLocalNote] = useState(note);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        setLocalNote(note);
    }, [note]);

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        setShowDeleteModal(false);
        onDelete(localNote.id);
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
    };

    const handleFavoriteToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isLoading) return;

        try {
            setIsLoading(true);
            const token = auth.getToken();
            if (!token) return;

            const currentFavoriteState = localNote.userPreferences?.[0]?.isFavorite || false;
            const newFavoriteState = !currentFavoriteState;

            // Optimistic update
            setLocalNote(prev => ({
                ...prev,
                userPreferences: [{
                    ...prev.userPreferences?.[0] || { isFavorite: false, personalTags: [] },
                    isFavorite: newFavoriteState
                }]
            }));

            const result = await api.toggleFavorite(token, note.id, newFavoriteState);

            setLocalNote(prev => ({
                ...prev,
                userPreferences: [{
                    ...prev.userPreferences?.[0] || { isFavorite: false, personalTags: [] },
                    isFavorite: result.preference.isFavorite
                }]
            }));

        } catch (error) {
            console.error('Failed to toggle favorite:', error);
            setLocalNote(prev => ({
                ...prev,
                userPreferences: [{
                    ...prev.userPreferences?.[0] || { isFavorite: false, personalTags: [] },
                    isFavorite: localNote.userPreferences?.[0]?.isFavorite || false
                }]
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const isFavorite = localNote.userPreferences?.[0]?.isFavorite || false;

    // Use the correct properties from your Note type
    const isSharedWithMe = localNote.permissions?.permissionLevel !== 'OWNER' && localNote.permissions?.permissionLevel !== 'NONE';
    const isOwner = localNote.permissions?.isOwner;
    const sharedByUser = localNote.user; // The user who owns/shared the note
    const sharedAt = localNote.permissions?.sharedAt;

    // Format relative time with proper pluralization
    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';

        const minutes = Math.floor(diffInSeconds / 60);
        if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;

        const hours = Math.floor(diffInSeconds / 3600);
        if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

        const days = Math.floor(diffInSeconds / 86400);
        if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;

        const weeks = Math.floor(diffInSeconds / 604800);
        if (weeks < 4) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;

        const months = Math.floor(diffInSeconds / 2592000);
        if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;

        const years = Math.floor(diffInSeconds / 31536000);
        return `${years} year${years === 1 ? '' : 's'} ago`;
    };

    // Get appropriate timestamp display with clear labels
    const getTimestampDisplay = () => {
        if (isSharedWithMe && sharedAt) {
            return `Shared ${formatRelativeTime(sharedAt)}`;
        }
        return `Updated ${formatRelativeTime(localNote.updatedAt)}`;
    };

    // Get creation time display
    const getCreationTimeDisplay = () => {
        return `Created ${formatRelativeTime(localNote.createdAt)}`;
    };

    // Get permission badge text
    const getPermissionBadgeText = () => {
        const permission = localNote.permissions?.permissionLevel;
        switch (permission) {
            case 'EDIT': return 'Can Edit';
            case 'VIEW': return 'Can View';
            case 'OWNER': return 'Owner';
            default: return 'Shared';
        }
    };

    return (
        <>
            <div
                onClick={onClick}
                className="group bg-white dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:border-blue-500/50 dark:hover:border-cyan-500/50 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-xl dark:hover:shadow-2xl relative overflow-hidden"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onClick();
                    }
                }}
            >
                {isAiProcessing && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl border-2 border-blue-500/30 dark:border-cyan-500/30 flex items-center justify-center backdrop-blur-sm z-10">
                        <div className="text-center">
                            <Icons.Loader />
                            <p className="text-blue-600 dark:text-cyan-400 text-sm mt-2 font-semibold">AI Processing</p>
                        </div>
                    </div>
                )}

                {/* Shared By Header - Only show for shared notes */}
                {isSharedWithMe && sharedByUser && (
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 flex-1">
                            {sharedByUser.avatarUrl ? (
                                <img
                                    src={sharedByUser.avatarUrl}
                                    alt={sharedByUser.name || 'User'}
                                    className="w-8 h-8 rounded-full object-cover border-2 border-blue-200 dark:border-cyan-800"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                                    {sharedByUser.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    Shared by {sharedByUser.name || sharedByUser.email}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {sharedAt && `Shared ${formatRelativeTime(sharedAt)}`}
                                </p>
                            </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-lg flex items-center whitespace-nowrap ${localNote.permissions?.permissionLevel === 'EDIT'
                            ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
                            : 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                            }`}>
                            <Icons.Shared />
                            {getPermissionBadgeText()}
                        </span>
                    </div>
                )}

                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-gray-900 dark:text-white font-semibold text-lg line-clamp-2 flex-1 mr-3 group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors">
                        {localNote.title}
                    </h3>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-all duration-300">
                        {isSharedWithMe && (
                            <span className={`text-xs px-2 py-1 rounded-lg flex items-center ${localNote.permissions?.permissionLevel === 'EDIT'
                                ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
                                : 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                                }`}>
                                <Icons.Shared />
                            </span>
                        )}
                        <button
                            onClick={handleFavoriteToggle}
                            disabled={isLoading}
                            className={`p-1.5 rounded-lg transition-all duration-200 ${isFavorite
                                ? 'text-yellow-500 bg-yellow-100 dark:bg-yellow-500/20 hover:bg-yellow-200 dark:hover:bg-yellow-500/30'
                                : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-500/10'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                        >
                            {isLoading ? (
                                <Icons.Loader />
                            ) : isFavorite ? (
                                <Icons.Fav />
                            ) : (
                                <Icons.NotFav />
                            )}
                        </button>
                        {!isSharedWithMe && isOwner && (
                            <button
                                onClick={handleDeleteClick}
                                className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                            >
                                <Icons.Delete />
                            </button>
                        )}
                    </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4 leading-relaxed">
                    {localNote.aiSummary || localNote.content || 'No content yet...'}
                </p>

                {safeTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {safeTags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="bg-blue-100 dark:bg-cyan-500/20 text-blue-700 dark:text-cyan-400 text-xs px-3 py-1.5 rounded-lg font-medium">
                                {tag}
                            </span>
                        ))}
                        {safeTags.length > 3 && (
                            <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">+{safeTags.length - 3}</span>
                        )}
                    </div>
                )}

                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{getTimestampDisplay()}</span>
                        {!isSharedWithMe && (
                            <>
                                <span className="text-gray-400 dark:text-gray-500">•</span>
                                <span className="text-gray-400 dark:text-gray-500">
                                    {getCreationTimeDisplay()}
                                </span>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {localNote.aiSummary && <Icons.AI />}
                        {localNote.permissions?.canEdit && <Icons.Edit />}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full mx-auto shadow-xl">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-500/20 mb-4">
                                <Icons.Delete  />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Delete Note
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                                Are you sure you want to delete "{localNote.title}"? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleCancelDelete}
                                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <Icons.Delete  />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default React.memo(MemoizedNoteCard);