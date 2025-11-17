import React from 'react';

export const HeaderLoader = () => (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse"></div>
                    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-48 animate-pulse"></div>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20 animate-pulse"></div>
                    <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20 animate-pulse"></div>
                </div>
            </div>
        </div>
    </div>
);

export const DescriptionLoader = () => (
    <div className="rounded-xl border border-gray-700/50 bg-gradient-to-br from-gray-900/80 to-gray-800/40 p-6 animate-pulse">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-600 rounded-xl"></div>
                <div>
                    <div className="h-6 bg-gray-600 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-gray-600 rounded w-24"></div>
                </div>
            </div>
            <div className="w-16 h-6 bg-gray-600 rounded-full"></div>
        </div>
        <div className="space-y-3">
            <div className="h-4 bg-gray-600 rounded"></div>
            <div className="h-4 bg-gray-600 rounded w-5/6"></div>
            <div className="h-4 bg-gray-600 rounded w-4/6"></div>
        </div>
    </div>
);

export const SidebarLoader = () => (
    <div className="space-y-6 animate-pulse">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-4"></div>
            <div className="space-y-3">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>
        </div>
    </div>
);