import React from 'react';
import Link from 'next/link';
import { Icons } from './Icons';
import SearchBar from './SearchBar';

interface SharedByMeHeaderProps {
    sharedTasksCount: number;
    search: string;
    onSearchChange: (value: string) => void;
}

const SharedByMeHeader: React.FC<SharedByMeHeaderProps> = ({
    sharedTasksCount,
    search,
    onSearchChange
}) => {
    return (
        <header className="bg-white dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between py-4">
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/tasks"
                            className="text-blue-600 dark:text-cyan-400 hover:text-blue-700 dark:hover:text-cyan-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 rounded p-1"
                        >
                            <Icons.Back />
                        </Link>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Shared by Me</h1>
                        <span className="text-blue-600 dark:text-cyan-400 text-sm bg-blue-100 dark:bg-cyan-500/20 px-2 py-1 rounded border border-blue-200 dark:border-cyan-500/30">
                            {sharedTasksCount}
                        </span>
                    </div>
                </div>

                <div className="pb-4">
                    <SearchBar search={search} setSearch={onSearchChange} />
                </div>
            </div>
        </header>
    );
};

export default SharedByMeHeader;