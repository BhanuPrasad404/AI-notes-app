import React from 'react';

// Skeleton loading component
function NotePageSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            {/* Header Skeleton */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
                <div className="px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
                        <div className="ml-auto flex gap-2">
                            <div className="w-20 h-10 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                            <div className="w-20 h-10 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    <div className="xl:col-span-3">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            <div className="space-y-4">
                                {[...Array(10)].map((_, i) => (
                                    <div key={i} className="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"
                                        style={{ width: `${80 - i * 5}%` }}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="xl:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 h-64 animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NotePageSkeleton;