import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icons } from './Icons';
import { socketService } from '@/lib/socket';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import { createPortal } from 'react-dom';

interface NotesHeaderProps {
    showMobileSidebar: boolean;
    setShowMobileSidebar: (show: boolean) => void;
    filteredNotes: any[];
    selectedTag: string | null;
    filter: string;
    setShowCreateModal: (show: boolean) => void;
}

interface Notification {
    id: string;
    type: string;
    message: string;
    createdAt: string;
    activity?: any;
    read: boolean;
}

const NotesHeader: React.FC<NotesHeaderProps> = ({
    showMobileSidebar,
    setShowMobileSidebar,
    filteredNotes,
    selectedTag,
    filter,
    setShowCreateModal
}) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        fetchNotifications();
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
    };

    const fetchNotifications = async () => {
        try {
            const token = auth.getToken();
            if (!token) return;

            const data = await api.getRecentActivities(token);
            setNotifications(data.activities || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    useEffect(() => {
        const socket = socketService.getSocket();

        if (socket) {
            socket.emit('join-user-room');
            socket.on('new-notification', (data: Notification) => {
                setNotifications(prev => [data, ...prev]);
                setUnreadCount(prev => prev + 1);
                showToast(data.message);
            });
        }
        return () => {
            if (socket) {
                socket.off('new-notification');
            }
        };
    }, []);

    const showToast = (message: string) => {
        console.log('🔔', message);
    };

    const markAsRead = async (notificationId: string) => {
        try {
            const token = auth.getToken();
            if (!token) return;

            await api.markActivityAsRead(token, notificationId);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = auth.getToken();
            if (!token) return;

            await api.markAllActivitiesAsRead(token);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);

        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${Math.floor(diffHours / 24)}d ago`;
    };

    // Notification Dropdown Portal
    const NotificationDropdownPortal = () => {
        const [mounted, setMounted] = useState(false);

        useEffect(() => {
            setMounted(true);
            return () => setMounted(false);
        }, []);

        if (!mounted || !showNotifications) return null;

        return createPortal(
            <div className="fixed inset-0 z-50">
                {/* Backdrop - Click to close */}
                <div
                    className="fixed inset-0 bg-black/50"
                    onClick={() => setShowNotifications(false)}
                />

                {/* Notification Panel */}
                <div
                    className={`
                        fixed bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl 
                        overflow-y-auto z-50 max-h-96
                        ${isMobile
                            ? 'inset-0 md:inset-auto top-0 right-0 w-full max-w-sm h-full rounded-none'
                            : 'top-20 right-4 w-80 rounded-lg'
                        }
                    `}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 sticky top-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                >
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setShowNotifications(false)}
                                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <Icons.Close className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                No notifications
                            </div>
                        ) : (
                            notifications.slice(0, 10).map((notification, index) => (
                                <div
                                    key={notification.id || `notification-${index}-${notification.createdAt}`}
                                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                        }`}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {notification.message}
                                        </p>
                                        {!notification.read && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1 flex-shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {formatTime(notification.createdAt)}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>

                    {notifications.length > 10 && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky bottom-0">
                            <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            </div>,
            document.body
        );
    };

    return (
        <header className="bg-white dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between gap-4 py-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowMobileSidebar(true)}
                            className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                            <Icons.Menu />
                        </button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-cyan-400 dark:to-purple-400 bg-clip-text text-transparent">
                                Notes
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {filteredNotes.length} notes
                                {selectedTag && ` • Tag: #${selectedTag}`}
                                {filter === 'favorites' && ' • Favorites'}
                                {filter === 'shared' && ' • Shared with me'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                            >
                                <Icons.Bell className="w-6 h-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-lg">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        <Link
                            href="/notes/shared-by-me"
                            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                        >
                            <Icons.Shared />
                            <span className='hidden md:block'>Shared</span>
                        </Link>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-cyan-500 dark:to-blue-500 hover:from-blue-600 hover:to-cyan-600 dark:hover:from-cyan-600 dark:hover:to-blue-600 text-white px-5 py-2.5 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                        >
                            <Icons.Plus />
                            <span className='hidden md:inline'>New Note</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Notification Dropdown Portal */}
            <NotificationDropdownPortal />
        </header>
    );
};

export default NotesHeader;