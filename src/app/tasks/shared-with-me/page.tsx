'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { SharedTask } from '@/types';
import Toast from '@/components/Toast';
import { SharedIcons } from './sharedWithmeComponents/SharedIcons';
import { SharedTaskCard } from './sharedWithmeComponents/SharedTaskCard';

export default function SharedWithMePage() {
    const [sharedTasks, setSharedTasks] = useState<SharedTask[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<{ TODO: SharedTask[]; IN_PROGRESS: SharedTask[]; DONE: SharedTask[] }>({ TODO: [], IN_PROGRESS: [], DONE: [] });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [urgencyFilter, setUrgencyFilter] = useState('ALL');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();
    const [tasksWithNewMessages, setTasksWithNewMessages] = useState<string[]>([]);

    useEffect(() => {
        if (!auth.isAuthenticated()) {
            router.push('/login');
            return;
        }
        fetchSharedTasks();
    }, []);

    useEffect(() => {
        filterTasks();
    }, [sharedTasks, search, urgencyFilter]);

    const fetchSharedTasks = async () => {
        try {
            const token = auth.getToken();
            if (!token) return;

            const [sharedData, newMessagesData] = await Promise.all([
                api.getSharedTasks(token),
                api.getTasksWithNewMessages(token)
            ]);

            const transformedTasks: SharedTask[] = Array.isArray(sharedData.tasks) ? sharedData.tasks.map((task: any) => ({
                ...task,
                project: task.project,
                sharedInfo: {
                    sharedAt: task.sharedInfo?.sharedAt,
                    permission: task.sharedInfo?.permission || 'VIEW',
                    sharedTaskId: task.sharedInfo?.sharedTaskId,
                    sharedBy: task.owner
                },
            })) : [];

            setSharedTasks(transformedTasks);
            setTasksWithNewMessages(newMessagesData.tasksWithNewMessages || []);
        } catch (err: any) {
            setError(err.message || 'Failed to load shared tasks');
        } finally {
            setLoading(false);
        }
    };

    const filterTasks = () => {
        let filtered = [...sharedTasks];

        // 🔴 ADD URGENCY FILTER LOGIC
        if (urgencyFilter !== 'ALL') {
            filtered = filtered.filter(task => task.urgency === urgencyFilter);
        }

        // Existing search filter
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(task =>
                task.title?.toLowerCase().includes(searchLower) ||
                task.description?.toLowerCase().includes(searchLower) ||
                task.sharedInfo?.sharedBy.name?.toLowerCase().includes(searchLower) ||
                task.sharedInfo?.sharedBy.email?.toLowerCase().includes(searchLower)
            );
        }

        setFilteredTasks({
            TODO: filtered.filter(task => task.status === 'TODO'),
            IN_PROGRESS: filtered.filter(task => task.status === 'IN_PROGRESS'),
            DONE: filtered.filter(task => task.status === 'DONE')
        });
    };

    // 🔴 URGENCY FILTER OPTIONS
    const urgencyOptions = [
        { value: 'ALL', label: 'All Priorities', color: 'text-gray-400' },
        { value: 'CRITICAL', label: '🔴 Critical', color: 'text-red-500' },
        { value: 'HIGH', label: '🟠 High', color: 'text-orange-500' },
        { value: 'MEDIUM', label: '🟡 Medium', color: 'text-yellow-500' },
        { value: 'LOW', label: '🟢 Low', color: 'text-green-500' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-cyan-500 dark:border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading shared tasks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            {/* Enhanced Compact Header */}
            <header className="bg-white dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/tasks"
                                className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-300 hover:text-cyan-700 dark:hover:text-white transition-colors"
                            >
                                <SharedIcons.Back />
                            </Link>
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
                                <SharedIcons.Shared />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Shared With Me</h1>
                                <p className="text-gray-600 dark:text-gray-400 text-xs hidden sm:block">Tasks from your team</p>
                            </div>
                        </div>
                        <div className="text-cyan-600 dark:text-cyan-300 text-sm font-medium">
                            {sharedTasks.length} task{sharedTasks.length !== 1 ? 's' : ''}
                        </div>
                    </div>

                    {/* 🔴 UPDATED SEARCH & FILTER SECTION */}
                    <div className="pb-4 space-y-3">
                        {/* Search Bar */}
                        <div className="relative max-w-2xl">
                            <input
                                type="text"
                                placeholder="Search shared tasks..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-4 py-2.5 pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 text-sm"
                            />
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                                <SharedIcons.Search />
                            </div>
                        </div>

                        {/* Urgency Filter */}
                        <div className="flex items-center gap-3">
                            <SharedIcons.Filter />
                            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Priority:</span>
                            <select
                                value={urgencyFilter}
                                onChange={(e) => setUrgencyFilter(e.target.value)}
                                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
                            >
                                {urgencyOptions.map((option) => (
                                    <option key={option.value} value={option.value} className={option.color}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            {/* Active Filter Badge */}
                            {urgencyFilter !== 'ALL' && (
                                <button
                                    onClick={() => setUrgencyFilter('ALL')}
                                    className="px-2 py-1 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-xs rounded-full border border-cyan-300 dark:border-cyan-500/30 hover:bg-cyan-200 dark:hover:bg-cyan-500/30 transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {error && <Toast message={error} type="error" onClose={() => setError('')} />}
            {success && <Toast message={success} type="success" onClose={() => setSuccess('')} />}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {sharedTasks.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                            <SharedIcons.Shared />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No shared tasks yet</h3>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
                            When team members share tasks with you, they will appear here for collaboration.
                        </p>
                        <Link
                            href="/tasks"
                            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3.5 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                        >
                            <SharedIcons.Back />
                            <span>Back to My Tasks</span>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {['TODO', 'IN_PROGRESS', 'DONE'].map((status) => {
                            const statusConfig = {
                                TODO: { gradient: 'from-red-500 to-pink-500', label: 'To Do' },
                                IN_PROGRESS: { gradient: 'from-yellow-500 to-amber-500', label: 'In Progress' },
                                DONE: { gradient: 'from-green-500 to-emerald-500', label: 'Completed' }
                            }[status];
                            if (!statusConfig) return null;
                            const tasks = filteredTasks[status as keyof typeof filteredTasks];

                            return (
                                <div key={status} className="bg-white dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-xl scrollbar">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${statusConfig.gradient}`}></div>
                                            <h2 className="text-gray-900 dark:text-white font-semibold">{statusConfig.label}</h2>
                                        </div>
                                        <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded-full font-medium">
                                            {tasks.length}
                                        </span>
                                    </div>

                                    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                                        {tasks.map((task) => (
                                            <SharedTaskCard
                                                key={task.id}
                                                task={task}
                                                onUpdate={fetchSharedTasks}
                                                hasNewMessages={tasksWithNewMessages.includes(task.id)}
                                            />
                                        ))}

                                        {tasks.length === 0 && (
                                            <div className="text-center py-8 text-gray-500 dark:text-gray-500">
                                                <p className="text-sm">No shared tasks</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}