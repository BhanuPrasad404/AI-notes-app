import React from 'react';
import { Icons } from './Icons';

interface NotesSearchFilterProps {
    search: string;
    handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
    filter: string;
    handleFilterChange: (filter: 'all' | 'favorites' | 'shared' | 'own') => void;
    selectedTag: string | null;
    setSelectedTag: (tag: string | null) => void;
}

const NotesSearchFilter: React.FC<NotesSearchFilterProps> = ({
    search,
    handleSearch,
    filter,
    handleFilterChange,
    selectedTag,
    setSelectedTag
}) => {
    return (
        <div className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 max-w-2xl">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search notes..."
                                value={search}
                                onChange={handleSearch}
                                className="w-full px-4 py-3.5 pl-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 focus:border-blue-500 dark:focus:border-cyan-500 transition-all duration-300"
                            />
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
                                <Icons.Search />
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3 flex-wrap items-center">
                        {/* Filter Tabs */}
                        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
                            {['all', 'favorites', 'own', 'shared'].map((filterType) => (
                                <button
                                    key={filterType}
                                    onClick={() => handleFilterChange(filterType as any)}
                                    className={`flex-1 px-4 py-2.5 rounded-lg transition-all duration-300 font-medium capitalize whitespace-nowrap ${filter === filterType
                                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-cyan-500 dark:to-blue-500 text-white shadow-lg'
                                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700/50'
                                        }`}
                                >
                                    {filterType === 'all' ? 'All' :
                                        filterType === 'favorites' ? 'Favorites' :
                                            filterType === 'own' ? 'My Notes' : 'Shared'}
                                </button>
                            ))}
                        </div>

                        {/* Selected Tag Chip */}
                        {selectedTag && (
                            <button
                                onClick={() => setSelectedTag(null)}
                                className="px-4 py-2.5 bg-blue-100 dark:bg-cyan-500/20 text-blue-700 dark:text-cyan-400 border border-blue-200 dark:border-cyan-500/30 rounded-xl transition-all duration-300 font-medium flex items-center gap-2 hover:bg-blue-200 dark:hover:bg-cyan-500/30 hover:border-blue-300 dark:hover:border-cyan-500/50 hover:scale-105 active:scale-95"
                            >
                                #{selectedTag}
                                <span className="text-sm hover:text-blue-900 dark:hover:text-white transition-colors">×</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotesSearchFilter;