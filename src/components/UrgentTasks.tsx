// components/UrgentTasks.tsx
'use client';
import { useState, useEffect, memo } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';

interface UrgentTask {
    id: string;
    title: string;
    description?: string;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    deadline?: string;
    user?: {
        id: string;
        name: string;
        avatarUrl?: string;
    };
    project?: {
        name: string;
        color: string;
    };
}

const UrgentTaskIcons = {
    CRITICAL: () => (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
    ),
    HIGH: () => (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
    ),
    MEDIUM: () => (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
        </svg>
    ),
    LOW: () => (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
        </svg>
    ),
    Calendar: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    Alert: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
    ),
    Check: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    )
};

const UrgentTasks = memo(() => {
    const [urgentTasks, setUrgentTasks] = useState<UrgentTask[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUrgentTasks = async () => {
            try {
                const token = auth.getToken();
                if (!token) return;

                const response = await api.getUrgentTasks(token);
                setUrgentTasks(response.urgentTasks || []);
            } catch (error) {
              logger.error('Failed to fetch urgent tasks:', { error });
                setUrgentTasks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchUrgentTasks();
    }, []);

    const handleTaskClick = (taskId: string) => {
        router.push(`/tasks/${taskId}`);
    };

    const getTimeRemaining = (deadline: string) => {
        const now = new Date();
        const dueDate = new Date(deadline);
        const diffHours = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60));

        if (diffHours < 0) return 'Overdue';
        if (diffHours < 1) return 'Due in <1h';
        if (diffHours < 24) return `Due in ${diffHours}h`;
        return `Due in ${Math.floor(diffHours / 24)}d`;
    };

    const getUrgencyConfig = (urgency: string) => {
        const config = {
            CRITICAL: {
                gradient: 'from-red-500 to-pink-500',
                bg: 'bg-red-500/10 dark:bg-red-500/20',
                border: 'border-red-500/20 dark:border-red-500/30',
                text: 'text-red-600 dark:text-red-400',
                icon: 'text-red-500'
            },
            HIGH: {
                gradient: 'from-orange-500 to-red-500',
                bg: 'bg-orange-500/10 dark:bg-orange-500/20',
                border: 'border-orange-500/20 dark:border-orange-500/30',
                text: 'text-orange-600 dark:text-orange-400',
                icon: 'text-orange-500'
            },
            MEDIUM: {
                gradient: 'from-yellow-500 to-amber-500',
                bg: 'bg-yellow-500/10 dark:bg-yellow-500/20',
                border: 'border-yellow-500/20 dark:border-yellow-500/30',
                text: 'text-yellow-600 dark:text-yellow-400',
                icon: 'text-yellow-500'
            },
            LOW: {
                gradient: 'from-green-500 to-emerald-500',
                bg: 'bg-green-500/10 dark:bg-green-500/20',
                border: 'border-green-500/20 dark:border-green-500/30',
                text: 'text-green-600 dark:text-green-400',
                icon: 'text-green-500'
            }
        };
        return config[urgency as keyof typeof config] || config.LOW;
    };

    // Safe icon getter function
    const getUrgencyIcon = (urgency: string) => {
        const icon = UrgentTaskIcons[urgency as keyof typeof UrgentTaskIcons];
        return icon || UrgentTaskIcons.LOW; // Fallback to LOW icon if not found
    };

    if (loading) {
        return (
            <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-xl flex items-center justify-center">
                            <UrgentTaskIcons.Alert />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Urgent Tasks</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Loading tasks...</p>
                        </div>
                    </div>
                    <div className="w-16 h-6 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
                </div>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-gray-100 dark:bg-white/5 rounded-2xl p-4 h-20 animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                        <UrgentTaskIcons.Alert />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Urgent Tasks</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Priority items requiring attention</p>
                    </div>
                </div>
                <span className="text-xs font-medium bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-full border border-red-500/20 dark:border-red-500/30">
                    {urgentTasks.length} urgent
                </span>
            </div>

            <div className="space-y-4">
                {urgentTasks.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <UrgentTaskIcons.Check />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-gray-900 dark:text-white font-semibold">No urgent tasks</h4>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">All priority items are under control</p>
                        </div>
                    </div>
                ) : (
                    urgentTasks.map((task) => {
                        const urgencyConfig = getUrgencyConfig(task.urgency);
                        const Icon = getUrgencyIcon(task.urgency);

                        return (
                            <div
                                key={task.id}
                                className={`${urgencyConfig.bg} ${urgencyConfig.border} rounded-2xl p-4 hover:scale-105 transition-all duration-300 cursor-pointer group border`}
                                onClick={() => handleTaskClick(task.id)}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                                        <div className={`${urgencyConfig.icon} mt-0.5 flex-shrink-0`}>
                                            <Icon />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-gray-900 dark:text-white font-semibold text-sm leading-tight truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {task.title}
                                            </h4>
                                            {task.description && (
                                                <p className="text-gray-600 dark:text-gray-300 text-xs mt-1 line-clamp-1">
                                                    {task.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {task.project && (
                                        <span
                                            className="text-xs font-medium px-2 py-1 rounded-full text-white flex-shrink-0 ml-2 shadow-sm"
                                            style={{ backgroundColor: task.project.color }}
                                        >
                                            {task.project.name}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4 text-xs">
                                        {task.deadline && (
                                            <div className="flex items-center space-x-1.5 text-gray-500 dark:text-gray-400">
                                                <UrgentTaskIcons.Calendar />
                                                <span className={`font-medium ${task.urgency === 'CRITICAL' ? 'text-red-600 dark:text-red-400' : ''}`}>
                                                    {getTimeRemaining(task.deadline)}
                                                </span>
                                            </div>
                                        )}
                                        <span className="text-gray-500 dark:text-gray-400 capitalize font-medium px-2 py-1 bg-gray-100 dark:bg-white/5 rounded-lg">
                                            {task.status.replace('_', ' ').toLowerCase()}
                                        </span>
                                    </div>

                                    {task.user && (
                                        <div className="flex items-center space-x-2">
                                            {task.user.avatarUrl ? (
                                                <img
                                                    src={task.user.avatarUrl}
                                                    alt={task.user.name}
                                                    className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                                    {task.user.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
});

UrgentTasks.displayName = 'UrgentTasks';

export default UrgentTasks;