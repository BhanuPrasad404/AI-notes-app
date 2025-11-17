'use client';
import { useState } from 'react';
import { Task } from '@/types';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';

interface TaskCardProps {
    task: Task;
    onUpdate: () => void;
    hasNewMessages?: boolean;
}

const Icons = {
    Calendar: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    Edit: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
    ),
    Message: () => (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
        </svg>
    ),
    Clock: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    User: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    )
};

export default function TaskCard({ task, onUpdate, hasNewMessages = false }: TaskCardProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const router = useRouter();

    const handleStatusChange = async (newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
        if (isUpdating || task.status === newStatus) return;
        setIsUpdating(true);
        try {
            const token = auth.getToken();
            if (!token) return;
            await api.updateTask(token, task.id, { status: newStatus });
            onUpdate();
        } catch (error) {
            logger.error('Failed to update task status:', { error });
        } finally {
            setIsUpdating(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
        return formatDate(dateString);
    };

    const STATUS_CONFIG = {
        TODO: {
            label: 'To Do',
            color: 'bg-gray-100 text-gray-700 border-gray-300',
            button: 'bg-gray-500 hover:bg-gray-600 text-white'
        },
        IN_PROGRESS: {
            label: 'In Progress',
            color: 'bg-blue-100 text-blue-700 border-blue-300',
            button: 'bg-blue-500 hover:bg-blue-600 text-white'
        },
        DONE: {
            label: 'Done',
            color: 'bg-green-100 text-green-700 border-green-300',
            button: 'bg-green-500 hover:bg-green-600 text-white'
        }
    };

    const URGENCY_CONFIG = {
        CRITICAL: 'bg-red-100 text-red-800 border-red-200',
        HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
        MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        LOW: 'bg-green-100 text-green-800 border-green-200'
    };

    const currentStatus = STATUS_CONFIG[task.status];
    const currentUrgency = URGENCY_CONFIG[task?.urgency];

    return (
        <div
            onClick={() => router.push(`/tasks/${task.id}`)}
            className={`
        relative group cursor-pointer 
        rounded-lg p-3
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        shadow-sm hover:shadow-md
        transition-all duration-150 ease-out
        hover:border-gray-300 dark:hover:border-gray-600
        ${isUpdating ? 'opacity-60 pointer-events-none' : ''}
    `}
        >
            {/* Loading Overlay */}
            {isUpdating && (
                <div className="absolute inset-0 bg-white/80  rounded-lg z-10 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
            )}

            {/* New Message Indicator */}
            {hasNewMessages && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse z-20 border-2 border-white"></div>
            )}

            {/* Header Section */}
            <div className="flex justify-between items-start gap-3 mb-3">
                <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h3 className="text-gray-400 text-sm font-medium leading-tight line-clamp-2 break-words mb-2">
                        {task.title}
                    </h3>

                    {/* Description */}
                    {task.description && (
                        <p className="text-gray-600 text-xs leading-relaxed line-clamp-2 break-words">
                            {task.description}
                        </p>
                    )}
                </div>

                {/* Edit Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/tasks/${task.id}?edit=true`);
                    }}
                    className="
                        p-1 rounded 
                        text-gray-400 hover:text-gray-600
                        opacity-0 group-hover:opacity-100
                        transition-all duration-200
                    "
                    aria-label="Edit task"
                >
                    <Icons.Edit />
                </button>
            </div>

            {/* Meta Info Section */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
                {/* Status Badge */}
                <div className={`
                    px-2 py-1 rounded text-xs font-medium border
                    ${currentStatus.color}
                `}>
                    {currentStatus.label}
                </div>

                {/* Urgency Badge */}
                <span className={`
                    px-2 py-1 rounded text-xs font-medium border
                    ${currentUrgency}
                `}>
                    {task.urgency}
                </span>

                {/* Deadline */}
                {task.deadline && (
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                        <Icons.Calendar />
                        {formatDate(task.deadline)}
                    </div>
                )}
            </div>

            {/* Footer Section */}
            <div className="flex justify-between items-center">
                {/* Left side - User and time */}
                <div className="flex items-center gap-2">
                    {/* Assignee */}
                    {task.user && (
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                            <Icons.User />
                            <span className="max-w-[60px] truncate">{task.user.name}</span>
                        </div>
                    )}

                    {/* Created time */}
                    {task.createdAt && (
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                            <Icons.Clock />
                            {formatRelativeTime(task.createdAt)}
                        </div>
                    )}
                </div>

                {/* Right side - New messages */}
                {hasNewMessages && (
                    <div className="flex items-center gap-1 text-blue-600 text-xs">
                        <Icons.Message />
                    </div>
                )}
            </div>

            {/* Status Actions - Simple Trello-style buttons */}
            <div className="grid grid-cols-2 gap-2 mt-3">
                {(['TODO', 'IN_PROGRESS', 'DONE'] as const)
                    .filter(status => status !== task.status)
                    .map(status => {
                        const config = STATUS_CONFIG[status];
                        return (
                            <button
                                key={status}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(status);
                                }}
                                className={`
                                    py-2 rounded text-xs font-medium
                                    transition-all duration-150 ease-out
                                    hover:shadow-sm
                                    ${config.button}
                                    flex items-center justify-center
                                `}
                            >
                                <span>
                                    {status === 'TODO' ? 'To Do' :
                                        status === 'IN_PROGRESS' ? 'In Progress' : 'Done'}
                                </span>
                            </button>
                        );
                    })}
            </div>
        </div>
    );
}