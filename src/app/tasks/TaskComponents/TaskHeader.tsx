// app/tasks/[id]/components/TaskHeader.tsx
'use client';
import Link from 'next/link';
import { CollaborationUser } from '@/types';
import { useCurrentUser } from '@/hooks/useCurrentUser';

// KEEP ALL YOUR ICONS EXACTLY AS IN MAIN FILE
const Icons = {
    Back: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
    ),
    Edit: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
    ),
    Share: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
    ),
    Loader: () => (
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V4a8 8 0 00-8 8h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    ),
    Check: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    ),
    Online: () => (
        <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
        </svg>
    ),
    Typing: () => (
        <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 12h4m4 0h4" />
        </svg>
    )
};

// CollaborationStatus Component (EXACTLY FROM MAIN FILE)
const CollaborationStatus = ({
    onlineUsers,
    typingUsers
}: {
    onlineUsers: CollaborationUser[];
    typingUsers: CollaborationUser[];
}) => {
    const currentUser = useCurrentUser();
    const totalUsers = onlineUsers.length + 1;

    if (totalUsers <= 1 && typingUsers.length === 0) {
        return null;
    }

    return (
        <div className="flex items-center space-x-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-3 shadow-sm ">
            <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                    <div className="flex -space-x-2">
                        <div className="relative group">
                            {currentUser?.avatarUrl ? (
                                <img
                                    src={currentUser.avatarUrl}
                                    alt={currentUser.name || 'You'}
                                    className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 shadow-sm object-cover"
                                />
                            ) : (
                                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full border-2 border-white dark:border-gray-800 shadow-sm flex items-center justify-center text-white text-xs font-medium">
                                    {currentUser?.name?.charAt(0) || 'U'}
                                </div>
                            )}
                            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-50">
                                {currentUser?.name || 'You'} (You)
                            </div>
                        </div>

                        {onlineUsers.slice(0, 3).map((user) => (
                            <div key={user.userId} className="relative group">
                                {user.user.avatarUrl ? (
                                    <img
                                        src={user.user.avatarUrl}
                                        alt={user.user.name || 'User'}
                                        className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 shadow-sm object-cover"
                                    />
                                ) : (
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border-2 border-white dark:border-gray-800 shadow-sm flex items-center justify-center text-white text-xs font-medium">
                                        {user.user.name?.charAt(0) || user.user.email?.charAt(0) || 'U'}
                                    </div>
                                )}
                                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-50">
                                    {user.user.name || user.user.email}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            {totalUsers} online
                        </span>
                        {onlineUsers.length > 3 && (
                            <span className="text-xs text-gray-500 bg-white dark:bg-gray-800 px-2 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                                +{onlineUsers.length - 3} more
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {typingUsers.length > 0 && (
                <div className="flex items-center space-x-2 border-l border-blue-200 dark:border-blue-700 pl-4">
                    <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {typingUsers.length === 1
                            ? `${typingUsers[0].user.name?.split(' ')[0] || 'Someone'} is typing...`
                            : `${typingUsers.length} people typing...`
                        }
                    </span>
                </div>
            )}
        </div>
    );
};

// Status Color Function (FROM MAIN FILE)
const getStatusColor = (status: string) => {
    switch (status) {
        case 'TODO': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
        case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
        case 'DONE': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
};

const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
        case 'CRITICAL': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-300 dark:border-red-700';
        case 'HIGH': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-300 dark:border-orange-700';
        case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700';
        case 'LOW': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-300 dark:border-green-700';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border border-gray-300 dark:border-gray-700';
    }
};

// MAIN TaskHeader COMPONENT
interface TaskHeaderProps {
    title: string;
    isEditing: boolean;
    onTitleChange: (title: string) => void;
    isOwner: boolean;
    onEditToggle: () => void;
    onShareClick: () => void;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    urgency?: string;
    onlineUsers: CollaborationUser[];
    typingUsers: CollaborationUser[];
    saving: boolean;
    saved: boolean;
}

export default function TaskHeader({
    title,
    isEditing,
    onTitleChange,
    isOwner,
    onEditToggle,
    onShareClick,
    status,
    urgency,
    onlineUsers,
    typingUsers,
    saving,
    saved
}: TaskHeaderProps) {
    return (
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <Link
                            href="/tasks"
                            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors flex-shrink-0 "
                        >
                            <Icons.Back />
                        </Link>

                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                            {saving && (
                                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 flex-shrink-0 ">
                                    <Icons.Loader />
                                    <span className="hidden sm:inline">Saving...</span>
                                </div>
                            )}
                            {saved && !saving && (
                                <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400 flex-shrink-0 ">
                                    <Icons.Check />
                                    <span className="hidden sm:inline">Saved</span>
                                </div>
                            )}

                            <div className="flex-1 min-w-0">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => onTitleChange(e.target.value)}
                                        className="w-full bg-transparent text-xl font-bold text-gray-900 dark:text-white border-none outline-none placeholder-gray-500 dark:placeholder-gray-400"
                                        placeholder="Task title"
                                    />
                                ) : (
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                                        {title}
                                    </h1>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">

                        <div className={`px-3 py-2 rounded-lg text-sm font-medium capitalize ${getUrgencyColor(urgency)}`}>
                            {urgency?.toLowerCase()}
                        </div>

                        {isOwner && (
                            <button
                                onClick={onEditToggle}
                                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <Icons.Edit />
                                <span className="hidden sm:inline">{isEditing ? 'Preview' : 'Edit'}</span>
                            </button>
                        )}

                        {isOwner && (
                            <button
                                onClick={onShareClick}
                                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                            >
                                <Icons.Share />
                                <span className="hidden sm:inline">Share</span>
                            </button>
                        )}

                        <div className={`px-3 py-2 rounded-lg text-sm font-medium ${getStatusColor(status)}`}>
                            {status.replace('_', ' ')}
                        </div>
                    </div>
                </div>

                <div className="lg:hidden pb-2">
                    <CollaborationStatus
                        onlineUsers={onlineUsers}
                        typingUsers={typingUsers}
                    />
                </div>
            </div>

            <div className="hidden lg:block max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <CollaborationStatus
                    onlineUsers={onlineUsers}
                    typingUsers={typingUsers}
                />
            </div>
        </header>
    );
}