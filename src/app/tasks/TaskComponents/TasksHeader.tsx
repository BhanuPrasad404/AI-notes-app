import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import SearchBar from './SearchBar';
import UserDropdown from '@/NoteComponents/UserDropdown';
import { socketService } from '@/lib/socket';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import { createPortal } from 'react-dom';

interface TasksHeaderProps {
    search: string;
    onSearchChange: (value: string) => void;
    urgencyFilter: string;
    onUrgencyFilterChange: (value: string) => void;
    urgencyOptions: Array<{ value: string; label: string; color: string }>;
    onClearUrgencyFilter: () => void;
    onCreateTask: () => void;
    currentUser: any;
    showDropdown: boolean;
    onToggleDropdown: () => void;
    onShowProfileSettings: (show: boolean) => void;
}

interface Notification {
    id: string;
    type: string;
    message: string;
    createdAt: string;
    activity?: any;
    read: boolean;
}

const TasksHeader: React.FC<TasksHeaderProps> = ({
    search,
    onSearchChange,
    urgencyFilter,
    onUrgencyFilterChange,
    urgencyOptions,
    onClearUrgencyFilter,
    onCreateTask,
    currentUser,
    showDropdown,
    onToggleDropdown,
    onShowProfileSettings
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

    //Portal component that adapts to mobile/desktop
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
                        fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl 
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
        <header className="bg-white dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 overflow-visible">
            {/* Desktop Layout */}
            <div className="hidden md:block">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Task Flow</h1>
                    </div>

                    <div className="flex items-center gap-4 flex-1 max-w-2xl justify-end">
                        {/* Search + Filter Container */}
                        <div className="flex items-center gap-4 flex-1 max-w-lg">
                            <div className="flex-1 min-w-0">
                                <SearchBar search={search} setSearch={onSearchChange} />
                            </div>

                            {/* Filter Section */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <Icons.Filter />
                                <select
                                    value={urgencyFilter}
                                    onChange={(e) => onUrgencyFilterChange(e.target.value)}
                                    className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 min-w-32 max-w-40"
                                >
                                    {urgencyOptions.map((option) => (
                                        <option key={option.value} value={option.value} className={option.color}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>

                                {urgencyFilter !== 'ALL' && (
                                    <button
                                        onClick={onClearUrgencyFilter}
                                        className="px-2 py-1 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-xs rounded-full border border-cyan-300 dark:border-cyan-500/30 hover:bg-cyan-200 dark:hover:bg-cyan-500/30 transition-colors flex-shrink-0 whitespace-nowrap"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 flex-shrink-0">
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

                            <button
                                onClick={onCreateTask}
                                className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-4 py-2.5 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                            >
                                <Icons.Plus />
                                <span>New Task</span>
                            </button>
                            <UserDropdown
                                currentUser={currentUser}
                                showDropdown={showDropdown}
                                setShowDropdown={onToggleDropdown}
                                setShowProfileSettings={onShowProfileSettings}
                                onAvatarUpdate={(updatedUser) => {/* handled in parent */ }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden">
                {/* Top Row - Title + Actions */}
                <div className="flex items-center justify-between p-4">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Task Flow</h1>

                    <div className="flex items-center gap-3">
                        {/* Notification Bell for Mobile */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
                            >
                                <Icons.Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                        </div>
                        <button
                            onClick={onCreateTask}
                            className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl transition-all duration-300 shadow-lg"
                            title="New Task"
                        >
                            <Icons.Plus className="w-5 h-5" />
                        </button>
                        <UserDropdown
                            currentUser={currentUser}
                            showDropdown={showDropdown}
                            setShowDropdown={onToggleDropdown}
                            setShowProfileSettings={onShowProfileSettings}
                            onAvatarUpdate={(updatedUser) => {/* handled in parent */ }}
                        />
                    </div>
                </div>

                {/* Bottom Row - Search + Filter */}
                <div className="px-4 pb-4 space-y-3">
                    {/* Search Bar */}
                    <div className="w-full">
                        <SearchBar search={search} setSearch={onSearchChange} />
                    </div>

                    {/* Filter Row */}
                    <div className="flex items-center gap-3 w-full">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Icons.Filter />
                            <div className="relative flex-1 min-w-0">
                                <select
                                    value={urgencyFilter}
                                    onChange={(e) => onUrgencyFilterChange(e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 appearance-none truncate"
                                >
                                    {urgencyOptions.map((option) => (
                                        <option key={option.value} value={option.value} className={option.color}>
                                            {option.value === 'ALL' ? 'All' :
                                                option.value === 'CRITICAL' ? '🔴 Critical' :
                                                    option.value === 'HIGH' ? '🟠 High' :
                                                        option.value === 'MEDIUM' ? '🟡 Medium' :
                                                            '🟢 Low'}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {urgencyFilter !== 'ALL' && (
                            <button
                                onClick={onClearUrgencyFilter}
                                className="px-3 py-2 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-sm rounded-lg border border-cyan-300 dark:border-cyan-500/30 hover:bg-cyan-200 dark:hover:bg-cyan-500/30 transition-colors whitespace-nowrap flex-shrink-0"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* SINGLE Portal - Works for both mobile and desktop */}
            <NotificationDropdownPortal />
        </header>
    );
};

export default TasksHeader;