'use client';
import { memo } from 'react';

const HeaderSkeleton = memo(() => (
    <header className="relative bg-white/80 dark:bg-gray-900/40 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
                    <div className="space-y-2">
                        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                    </div>
                </div>
                <div className="hidden md:flex space-x-2">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-10 bg-gray-300 dark:bg-gray-700 rounded-xl w-20 animate-pulse"></div>
                    ))}
                </div>
                <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded-xl w-32 animate-pulse"></div>
            </div>
        </div>
    </header>
));

const StatsSkeleton = memo(() => (
    <div className="bg-gray-100/80 dark:bg-gray-900/40 backdrop-blur-xl rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-2xl animate-pulse">
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-lg w-48 mb-6"></div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-300 dark:bg-gray-700 rounded-2xl p-4 h-20"></div>
            ))}
        </div>
    </div>
));

const QuickActionsSkeleton = memo(() => (
    <div className="lg:col-span-1 bg-gray-100/80 dark:bg-gray-900/40 backdrop-blur-xl rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-2xl animate-pulse">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-32 mb-6"></div>
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-300 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
            ))}
        </div>
    </div>
));

const NotesSkeleton = memo(() => (
    <div className="lg:col-span-2 bg-gray-100/80 dark:bg-gray-900/40 backdrop-blur-xl rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-2xl animate-pulse">
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-lg w-48 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-300 dark:bg-gray-700 rounded-2xl p-5 h-32"></div>
            ))}
        </div>
    </div>
));

const UrgentTasksSkeleton = memo(() => (
    <div className="bg-gray-100/80 dark:bg-gray-900/40 backdrop-blur-xl rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-2xl animate-pulse">
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-lg w-48 mb-6"></div>
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-300 dark:bg-gray-700 rounded-2xl p-4 h-20"></div>
            ))}
        </div>
    </div>
));

const TasksSkeleton = memo(() => (
    <div className="bg-gray-100/80 dark:bg-gray-900/40 backdrop-blur-xl rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-2xl animate-pulse">
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-lg w-48 mb-6"></div>
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-300 dark:bg-gray-700 rounded-xl p-4 h-32"></div>
            ))}
        </div>
    </div>
));

const DashboardSkeleton = memo(() => (
    <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/20 dark:bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 dark:bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
            <div className="absolute top-40 left-1/2 w-80 h-80 bg-purple-500/20 dark:bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500"></div>
        </div>

        <HeaderSkeleton />

        <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-8 space-y-6">
                    <StatsSkeleton />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <QuickActionsSkeleton />
                        <NotesSkeleton />
                    </div>
                </div>

                <div className="xl:col-span-4 space-y-6">
                    <UrgentTasksSkeleton />
                    <TasksSkeleton />
                </div>
            </div>
        </main>
    </div>
));

export default DashboardSkeleton;