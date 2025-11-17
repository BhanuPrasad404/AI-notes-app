// components/ActivityFeed.tsx
'use client';
import { useState, useEffect, useCallback, memo } from 'react';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';

interface Activity {
    id: string;
    type: string;
    actorName: string;
    targetType: string;
    targetTitle: string;
    message: string;
    metadata: any;
    read: boolean;
    createdAt: string;
}

const ActivityIcon = memo(({ type }: { type: string }) => {
    const getIcon = () => {
        switch (type) {
            case 'NOTE_SHARED':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                );
            case 'TASK_STATUS_CHANGED':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                );
            case 'NOTE_ACCESS_REVOKED':
            case 'TASK_ACCESS_REVOKED':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    return (
        <div className={`p-2 rounded-lg ${type.includes('SHARED') ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300' :
            type.includes('REVOKED') ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-300' :
                'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-300'
            }`}>
            {getIcon()}
        </div>
    );
});

const ActivityItem = memo(({ activity, onMarkAsRead }: { activity: Activity; onMarkAsRead: (id: string) => void }) => {
    const [isRead, setIsRead] = useState(activity.read);

    const handleClick = useCallback(async () => {
        if (!isRead) {
            try {
                await api.markActivityAsRead(auth.getToken()!, activity.id);
                setIsRead(true);
                onMarkAsRead(activity.id);
            } catch (error) {
                logger.error('Failed to mark activity as read:', { error });
            }
        }
    }, [activity.id, isRead, onMarkAsRead]);

    return (
        <div
            className={`p-3 rounded-xl border transition-all duration-300 cursor-pointer hover:scale-95 transform-gpu group ${isRead
                ? 'bg-gray-50/50 dark:bg-white/5 border-gray-200 dark:border-white/10'
                : 'bg-white dark:bg-white/10 border-cyan-200 dark:border-cyan-500/30 shadow-lg'
                }`}
            onClick={handleClick}
        >
            <div className="flex items-start space-x-3">
                <ActivityIcon type={activity.type} />
                <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-5 ${isRead
                        ? 'text-gray-600 dark:text-gray-300'
                        : 'text-gray-900 dark:text-white font-medium'
                        } group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors`}>
                        {activity.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(activity.createdAt).toLocaleDateString()} • {new Date(activity.createdAt).toLocaleTimeString()}
                        </span>
                        {!isRead && (
                            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});
const ActivityFeedSkeleton = memo(() => (
    <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="p-3 rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse">
                <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        ))}
    </div>
));
export default function ActivityFeed() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchActivities = useCallback(async () => {
        try {
            const token = auth.getToken();
            if (!token) return;

            const response = await api.getRecentActivities(token, 8);
            setActivities(response.activities || []);
            setUnreadCount(response.unreadCount || 0);
        } catch (error) {
            logger.error('Failed to fetch activities:', { error });
        } finally {
            setLoading(false);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            const token = auth.getToken();
            if (!token) return;

            await api.markAllActivitiesAsRead(token);
            setActivities(prev => prev.map(activity => ({ ...activity, read: true })));
            setUnreadCount(0);
        } catch (error) {
            logger.error('Failed to mark all as read:', { error });
        }
    }, []);
    const handleMarkAsRead = useCallback((activityId: string) => {
        setActivities(prev => prev.map(activity =>
            activity.id === activityId ? { ...activity, read: true } : activity
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
    }, []);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    if (loading) {
        return <ActivityFeedSkeleton />;
    }

    return (
        <div className="bg-white/80 dark:bg-gray-900/40 backdrop-blur-xl rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Activity Feed</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Recent updates and notifications</p>
                    </div>
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="text-xs bg-cyan-500 text-white px-3 py-1 rounded-full hover:bg-cyan-600 transition duration-300 font-medium"
                    >
                        Mark all read
                    </button>
                )}
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto ">
                {activities.length > 0 ? (
                    activities.map((activity) => (
                        <ActivityItem
                            key={activity.id}
                            activity={activity}
                            onMarkAsRead={handleMarkAsRead}
                        />
                    ))
                ) : (
                    <div className="text-center py-8 space-y-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-gray-900 dark:text-white font-semibold">No activities yet</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Your recent updates will appear here</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}