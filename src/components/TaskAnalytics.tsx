// components/TaskAnalytics.tsx
'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';

interface AnalyticsData {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    overdueTasks: number;
    averageCompletionTime: number;
    statusDistribution: {
        TODO: number;
        IN_PROGRESS: number;
        DONE: number;
    };
    taskOwnership: {
        myTasks: number;
        sharedWithMe: number;
    };
    priorityBreakdown: {
        urgent: number;
        high: number;
        medium: number;
        low: number;
    };
    weeklyTrend: { date: string; created: number; completed: number }[];
}

const Icons = {
    Chart: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    TrendingUp: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    Clock: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Users: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>
};

export default function TaskAnalytics() {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const token = auth.getToken();
            if (!token) return;

            const analyticsData = await api.getTaskAnalytics(token);
            setAnalytics(analyticsData);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center h-32">
                    <div className="w-8 h-8 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (!analytics) return null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 ">
            {/* Header */}
            <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Icons.Chart />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Task Analytics</h2>
                    <p className="text-gray-600 dark:text-gray-400">Complete overview of all your tasks</p>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 ">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-2 mb-2">
                        <Icons.Chart />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Completion</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {analytics.completionRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                        {analytics.completedTasks}/{analytics.totalTasks} tasks
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-2 mb-2">
                        <Icons.TrendingUp />
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">Avg. Time</span>
                    </div>
                    <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {analytics.averageCompletionTime}d
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">
                        To complete tasks
                    </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                    <div className="flex items-center space-x-2 mb-2">
                        <Icons.Clock />
                        <span className="text-sm font-medium text-red-700 dark:text-red-300">Overdue</span>
                    </div>
                    <div className="text-2xl font-bold text-red-900 dark:text-red-100">
                        {analytics.overdueTasks}
                    </div>
                    <div className="text-xs text-red-600 dark:text-red-400">
                        Need attention
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center space-x-2 mb-2">
                        <Icons.Users />
                        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">My Tasks</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        {analytics.taskOwnership.myTasks}
                    </div>
                    <div className="text-xs text-purple-600 dark:text-purple-400">
                        {analytics.taskOwnership.sharedWithMe} shared
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Status Distribution</h3>
                    <div className="space-y-3">
                        {Object.entries(analytics.statusDistribution).map(([status, count]) => (
                            <div key={status} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                    {status.toLowerCase().replace('_', ' ')}
                                </span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${status === 'TODO' ? 'bg-red-500' : status === 'IN_PROGRESS' ? 'bg-yellow-500' : 'bg-green-500'}`}
                                            style={{ width: `${(count / analytics.totalTasks) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                                        {count}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Priority Breakdown</h3>
                    <div className="space-y-3">
                        {[
                            { label: 'Urgent (Today)', value: analytics.priorityBreakdown.urgent, color: 'bg-red-500' },
                            { label: 'High (1-3 days)', value: analytics.priorityBreakdown.high, color: 'bg-orange-500' },
                            { label: 'Medium (Week)', value: analytics.priorityBreakdown.medium, color: 'bg-yellow-500' },
                            { label: 'Low/Completed', value: analytics.priorityBreakdown.low, color: 'bg-green-500' }
                        ].map(({ label, value, color }) => (
                            <div key={label} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${color}`}
                                            style={{ width: `${(value / analytics.totalTasks) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                                        {value}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Weekly Trend */}
            <div className="mt-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">7-Day Activity</h3>
                <div className="flex items-end justify-between h-32">
                    {analytics.weeklyTrend.map((day, index) => (
                        <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                            <div className="flex items-end space-x-1 h-24 w-full justify-center">
                                <div
                                    className="w-2 bg-blue-500 rounded-t transition-all duration-300"
                                    style={{ height: `${Math.min(day.created * 12, 80)}px` }}
                                ></div>
                                <div
                                    className="w-2 bg-green-500 rounded-t transition-all duration-300"
                                    style={{ height: `${Math.min(day.completed * 12, 80)}px` }}
                                ></div>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{day.date}</span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-center space-x-4 mt-3">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">Created</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">Completed</span>
                    </div>
                </div>
            </div>
        </div>
    );
}