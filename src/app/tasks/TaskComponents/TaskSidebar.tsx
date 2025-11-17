// app/tasks/[id]/components/TaskSidebar.tsx
'use client';
import AIAssistant from '@/components/AIAssistant';
import { Task } from '@/types';
import { useState } from 'react';

// ICONS FROM MAIN FILE
const Icons = {
    Calendar: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    User: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    ),
    Share: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
    ),
    AI: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    ),
    Trash: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
    )
};

interface TaskSidebarProps {
    task: Task;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    onStatusChange: (status: 'TODO' | 'IN_PROGRESS' | 'DONE') => void;
    isOwner: boolean;
    onShareClick: () => void;
    onDeleteTask: () => void;
    deleting: boolean;
    deadline: string;
    isEditing: boolean;
    onDeadlineChange: (deadline: string) => void;
}

// Helper functions from main file
const getPriorityColor = (deadline?: string) => {
    if (!deadline) return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';

    const dueDate = new Date(deadline);
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (diffDays < 0) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    if (diffDays <= 2) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    if (diffDays <= 7) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
};

const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const getUserInitials = (name?: string, email?: string) => {
    if (name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email ? email.substring(0, 2).toUpperCase() : 'UU';
};

export default function TaskSidebar({
    task,
    status,
    onStatusChange,
    isOwner,
    onShareClick,
    onDeleteTask,
    deleting,
    deadline,
    isEditing,
    onDeadlineChange
}: TaskSidebarProps) {
    const [showAIAssistant, setShowAIAssistant] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        setShowDeleteModal(false);
        onDeleteTask();
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
    };
    return (
        <div className="space-y-6">
            {/* Status Actions Card */}
            <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 
                            rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                    <span className="inline-block w-1.5 h-6 bg-blue-500 rounded-full"></span>
                    Update Status
                </h2>

                <div className="space-y-3">
                    {(['TODO', 'IN_PROGRESS', 'DONE'] as const).map((statusOption) => (
                        <button
                            key={statusOption}
                            onClick={() => onStatusChange(statusOption)}
                            disabled={status === statusOption}
                            className={`w-full text-left p-4 rounded-xl border backdrop-blur-sm 
                                        transition-all duration-300 flex items-center justify-between
                                        ${status === statusOption
                                    ? 'border-blue-500 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 dark:text-blue-300 shadow-inner'
                                    : 'border-gray-200 dark:border-gray-600 bg-white/60 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'}
                                        disabled:opacity-60 disabled:cursor-not-allowed`}
                        >
                            <span className="font-medium tracking-wide">{statusOption.replace('_', ' ')}</span>
                            {status === statusOption && (
                                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white">
                                    <Icons.Check />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Actions Card - Owner Only */}
            {isOwner && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        <button
                            onClick={onShareClick}
                            className="w-full flex items-center space-x-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30 transition duration-200"
                        >
                            <Icons.Share />
                            <span>Share Task</span>
                        </button>
                        <button onClick={() => setShowAIAssistant(true)} className="w-full flex items-center space-x-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition duration-200">
                            <Icons.AI />
                            <span>Chat with AI</span>
                        </button>
                        <button
                            onClick={handleDeleteClick}
                            disabled={deleting}
                            className="w-full flex items-center space-x-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {deleting ? <Icons.Loader /> : <Icons.Trash />}
                            <span>{deleting ? 'Deleting...' : 'Delete Task'}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Task Information Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Task Information</h2>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* Due Date */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                                <div className="text-orange-600 dark:text-orange-400">
                                    <Icons.Calendar />
                                </div>
                            </div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Due Date
                            </label>
                        </div>
                        {isEditing && isOwner ? (
                            <input
                                type="date"
                                value={deadline}
                                onChange={(e) => onDeadlineChange(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            />
                        ) : (
                            <div className={`px-4 py-3 rounded-xl border-l-4 ${getPriorityColor(deadline).includes('red') ? 'border-l-red-500' :
                                getPriorityColor(deadline).includes('orange') ? 'border-l-orange-500' :
                                    getPriorityColor(deadline).includes('yellow') ? 'border-l-yellow-500' :
                                        getPriorityColor(deadline).includes('green') ? 'border-l-green-500' :
                                            'border-l-gray-500'
                                } ${getPriorityColor(deadline)}`}>
                                <span className="font-medium">{formatDate(deadline)}</span>
                            </div>
                        )}
                    </div>

                    {/* Assignee */}
                    {task.user && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                    <div className="text-blue-600 dark:text-blue-400">
                                        <Icons.User />
                                    </div>
                                </div>
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {isOwner ? 'Assigned By' : 'Owner'}
                                </label>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0 shadow-lg`}>
                                    {task?.user.avatarUrl ? (
                                        <img
                                            src={task.user.avatarUrl}
                                            alt="Current avatar"
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                                            {getUserInitials(task.user.name, task.user.email)}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                        {task.user.name || 'Unknown User'}
                                    </p>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs truncate">
                                        {task.user.email}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Created Date */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                <div className="text-green-600 dark:text-green-400">
                                    <Icons.Calendar />
                                </div>
                            </div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Created
                            </label>
                        </div>
                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                            <span className="font-medium text-gray-900 dark:text-white">{formatDate(task.createdAt)}</span>
                        </div>
                    </div>

                    {/* Last Updated */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                <div className="text-purple-600 dark:text-purple-400">
                                    <Icons.Calendar />
                                </div>
                            </div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Last Updated
                            </label>
                        </div>
                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                            <span className="font-medium text-gray-900 dark:text-white">{formatDate(task.updatedAt)}</span>
                        </div>
                    </div>
                </div>

                {/* Task ID */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Task ID</span>
                        <span className="font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {task.id.slice(0, 8)}...
                        </span>
                    </div>
                </div>
            </div>

            {showAIAssistant && <AIAssistant onClose={() => setShowAIAssistant(false)} />}

            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full mx-auto shadow-xl">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-500/20 mb-4">
                                <Icons.Trash />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Delete Note
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                                Are you sure you want to delete "{task.title}"? This action cannot be undone.
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
                                <Icons.Trash />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}