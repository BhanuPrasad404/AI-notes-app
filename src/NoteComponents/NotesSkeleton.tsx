import React from 'react';

const NotesSkeleton: React.FC = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-900/80 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 animate-pulse">
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-4"></div>
                            </div>
                            <div className="space-y-2 mb-4">
                                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
                                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                            </div>
                            <div className="flex gap-2 mb-4">
                                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
                            </div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NotesSkeleton;