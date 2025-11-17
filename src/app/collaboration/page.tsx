'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface TaskCollaborator {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    taskCollaborations: number;
    lastCollaborated: string;
    lastItemTitle: string;
    firstCollaboration: string;
}

interface TaskStats {
    totalCollaborators: number;
    totalTaskCollaborations: number;
    mostActiveCollaborator: TaskCollaborator | null;
}

export default function TaskCollaborationDashboard() {
    const [collaborators, setCollaborators] = useState<TaskCollaborator[]>([]);
    const [stats, setStats] = useState<TaskStats | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchTaskCollaborationData = async () => {
            try {
                const token = auth.getToken();
                if (!token) return;

                const response = await api.getCombinedCollaborationHistory(token);

                // Filter only collaborators with task collaborations
                const taskCollaborators = response.collaborators
                    ?.filter((collab: any) => collab.taskCollaborations > 0)
                    .map((collab: any) => ({
                        id: collab.id,
                        name: collab.name,
                        email: collab.email,
                        avatarUrl: collab.avatarUrl,
                        taskCollaborations: collab.taskCollaborations,
                        lastCollaborated: collab.lastCollaborated,
                        lastItemTitle: collab.lastItemType === 'TASK' ? collab.lastItemTitle : 'Recent task',
                        firstCollaboration: collab.firstCollaboration
                    })) || [];

                // Calculate real stats for tasks only
                const taskStats: TaskStats = {
                    totalCollaborators: taskCollaborators.length,
                    totalTaskCollaborations: taskCollaborators.reduce((sum: number, collab: any) => sum + collab.taskCollaborations, 0),
                    mostActiveCollaborator: taskCollaborators.length > 0 ?
                        taskCollaborators.reduce((prev: any, current: any) =>
                            (prev.taskCollaborations > current.taskCollaborations) ? prev : current
                        ) : null
                };

                setCollaborators(taskCollaborators);
                setStats(taskStats);
            } catch (error) {
                console.error('Failed to fetch task collaboration data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTaskCollaborationData();
    }, []);

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`;
        return `${Math.floor(diffHours / 168)}w ago`;
    };

    const getCollaborationLevel = (count: number) => {
        if (count >= 10) return { level: 'high', color: 'bg-red-500', text: 'Highly Active' };
        if (count >= 5) return { level: 'medium', color: 'bg-yellow-500', text: 'Active' };
        return { level: 'low', color: 'bg-green-500', text: 'Occasional' };
    };

    const handleViewTasks = () => {
        router.push('/tasks');
    };

    const handleShareTask = () => {
        router.push('/tasks?create=new');
    };

    if (loading) {
        return (
            <div className="w-full bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-20 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
                        ))}
                    </div>
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Task Team</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        People you collaborate with on tasks
                    </p>
                </div>
                
                <button
                    onClick={handleViewTasks}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-300 font-medium text-sm"
                >
                    View Tasks
                </button>
            </div>

            {/* Stats Grid */}
            {stats && (
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-4 border border-blue-200 dark:border-blue-500/20">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalCollaborators}</div>
                        <div className="text-blue-700 dark:text-blue-300 text-sm font-medium">Team Members</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-500/10 rounded-xl p-4 border border-green-200 dark:border-green-500/20">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalTaskCollaborations}</div>
                        <div className="text-green-700 dark:text-green-300 text-sm font-medium">Shared Tasks</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-500/10 rounded-xl p-4 border border-purple-200 dark:border-purple-500/20">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {stats.mostActiveCollaborator?.taskCollaborations || 0}
                        </div>
                        <div className="text-purple-700 dark:text-purple-300 text-sm font-medium truncate">
                            Most Active
                        </div>
                    </div>
                </div>
            )}

            {/* Collaborators List */}
            <div className="space-y-4">
                {collaborators.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-gray-900 dark:text-white font-semibold">No task collaborations yet</h4>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                Share tasks with team members to see them here
                            </p>
                        </div>
                        <button
                            onClick={handleShareTask}
                            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-all duration-300 font-medium"
                        >
                            Share Your First Task
                        </button>
                    </div>
                ) : (
                    collaborators.slice(0, 5).map((collaborator) => {
                        const activity = getCollaborationLevel(collaborator.taskCollaborations);
                        
                        return (
                            <div
                                key={collaborator.id}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all duration-300 group"
                            >
                                <div className="flex items-center space-x-4 flex-1 min-w-0">
                                    {/* Avatar */}
                                    <div className="relative">
                                        {collaborator.avatarUrl ? (
                                            <img
                                                src={collaborator.avatarUrl}
                                                alt={collaborator.name}
                                                className="w-12 h-12 rounded-xl border-2 border-white dark:border-gray-800"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                                                {getInitials(collaborator.name)}
                                            </div>
                                        )}
                                        <div className={`absolute -top-1 -right-1 w-3 h-3 ${activity.color} rounded-full border-2 border-white dark:border-gray-800`}></div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-3 mb-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                                                {collaborator.name}
                                            </h3>
                                            <span className="bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-medium">
                                                {collaborator.taskCollaborations} tasks
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                            <span className="text-blue-600 dark:text-blue-400 font-medium">{activity.text}</span>
                                            <span>•</span>
                                            <span>Last: {getTimeAgo(collaborator.lastCollaborated)}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                                            {collaborator.lastItemTitle}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <button
                                    onClick={handleShareTask}
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all duration-300 font-medium text-sm opacity-0 group-hover:opacity-100"
                                >
                                    Share Task
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer CTA */}
            {collaborators.length > 5 && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleViewTasks}
                        className="w-full text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition duration-300 py-2"
                    >
                        View all {collaborators.length} collaborators →
                    </button>
                </div>
            )}
        </div>
    );
}