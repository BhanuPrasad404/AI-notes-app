import React, { useState, useMemo } from 'react';
import { Icons } from './Icons';
import dynamic from 'next/dynamic';

const NotesDashboardDropdown = dynamic(() => import('@/NoteComponents/NotesDashboardDropdown'), { ssr: false });

interface CollectionsSidebarProps {
    selectedId: string;
    onSelect: (id: string) => void;
    notesCount: number;
    sharedCount: number;
    favoriteCount: number;
    selectedTag: string | null;
    onTagSelect: (tag: string | null) => void;
    sidebarTags: string[];
    onAddTag: (tag: string) => void;
    onRemoveTag: (tag: string) => void;
    currentUser: any;
    setShowProfileSettings: any;
    tagUsageCount?: { [tag: string]: number };
}

const CollectionsSidebar: React.FC<CollectionsSidebarProps> = ({
    selectedId,
    onSelect,
    notesCount,
    sharedCount,
    favoriteCount,
    selectedTag,
    onTagSelect,
    sidebarTags,
    onAddTag,
    onRemoveTag,
    currentUser,
    setShowProfileSettings,
    tagUsageCount = {}
}) => {
    const [isAddingTag, setIsAddingTag] = useState(false);
    const [newTag, setNewTag] = useState('');
    const [tagSearch, setTagSearch] = useState('');

    const filteredTags = useMemo(() => {
        if (!tagSearch.trim()) return sidebarTags;
        return sidebarTags.filter(tag => 
            tag.toLowerCase().includes(tagSearch.toLowerCase())
        );
    }, [sidebarTags, tagSearch]);

    const collections = [
        { id: 'all', name: 'All Notes', count: notesCount, icon: <Icons.AllNotes /> },
        { id: 'favorites', name: 'Favorites', count: favoriteCount, icon: <Icons.Favorites /> },
        { id: 'shared', name: 'Shared with Me', count: sharedCount, icon: <Icons.Sharedwithme /> },
    ];

    const handleAddTag = async () => {
        if (newTag.trim()) {
            await onAddTag(newTag.trim());
            setNewTag('');
            setIsAddingTag(false);
        }
    };

    const handleRemoveTag = async (tagToRemove: string) => {
        if (confirm(`Remove tag "${tagToRemove}"? This won't delete notes, just remove the tag from sidebar.`)) {
            await onRemoveTag(tagToRemove);
        }
    };

    return (
        <div className="p-4 space-y-4 sm:space-y-6 flex flex-col h-full">
            {/* Quick Access Section - More compact */}
            <div className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Collections</h3>
                <div className="space-y-1.5">
                    {collections.map((collection) => (
                        <button
                            key={collection.id}
                            onClick={() => onSelect(collection.id)}
                            className={`flex items-center justify-between w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-200 group hover:scale-[1.02] active:scale-[0.98] border ${selectedId === collection.id
                                ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 dark:from-cyan-500/20 dark:to-blue-500/20 text-blue-600 dark:text-cyan-400 border-blue-300 dark:border-cyan-500/30 shadow-lg shadow-blue-500/10 dark:shadow-cyan-500/10'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white border-gray-300 dark:border-gray-700'
                                }`}
                        >
                            <div className="flex items-center gap-2 sm:gap-3">
                                <span className={`text-base sm:text-lg transition-transform duration-200 ${selectedId === collection.id ? 'scale-110' : ''}`}>
                                    {collection.icon}
                                </span>
                                <span className="font-medium text-xs sm:text-sm">{collection.name}</span>
                            </div>
                            <span className={`text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full min-w-6 sm:min-w-8 text-center transition-all duration-200 font-semibold ${selectedId === collection.id
                                ? 'bg-blue-500 dark:bg-cyan-500 text-white shadow-md'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 group-hover:bg-blue-500/20 dark:group-hover:bg-cyan-500/20 group-hover:text-blue-600 dark:group-hover:text-cyan-400'
                                }`}>
                                {collection.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tags Section - Responsive height management */}
            <div className="flex-1 space-y-3 sm:space-y-4 min-h-0 flex flex-col">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Tags</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-medium">
                        {sidebarTags.length}
                    </span>
                </div>

                {/* Tag Search - Responsive */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                        <Icons.Search  />
                    </div>
                    <input
                        type="text"
                        value={tagSearch}
                        onChange={(e) => setTagSearch(e.target.value)}
                        placeholder="Search tags..."
                        className="w-full pl-8 sm:pl-10 pr-7 sm:pr-10 py-2 sm:py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg sm:rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 focus:border-blue-500 dark:focus:border-cyan-500 transition-all duration-200"
                    />
                    {tagSearch && (
                        <button
                            onClick={() => setTagSearch('')}
                            className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Tags List - Dynamic height based on screen size */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    <div className="space-y-1 max-h-24 sm:max-h-32">
                        {filteredTags.length === 0 ? (
                            <div className="text-center py-3 sm:py-4 text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                                {tagSearch ? 'No tags found' : 'No tags yet'}
                            </div>
                        ) : (
                            filteredTags.map((tag) => {
                                const usageCount = tagUsageCount[tag] || 0;
                                return (
                                    <div key={tag} className="flex items-center group hover:bg-gray-100 dark:hover:bg-gray-800/30 rounded-lg transition-all duration-200">
                                        <button
                                            onClick={() => onTagSelect(selectedTag === tag ? null : tag)}
                                            className={`flex items-center justify-between flex-1 text-left p-1.5 sm:p-2 rounded-lg transition-all duration-200 text-xs sm:text-sm ${selectedTag === tag
                                                ? 'bg-blue-100 dark:bg-cyan-500/20 text-blue-700 dark:text-cyan-400 font-medium'
                                                : 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300'
                                                }`}
                                        >
                                            <span className="truncate">#{tag}</span>
                                            {usageCount > 0 && (
                                                <span className={`text-xs px-1 py-0.5 rounded-full ml-1 sm:ml-2 flex-shrink-0 ${selectedTag === tag
                                                    ? 'bg-blue-500 dark:bg-cyan-500 text-white'
                                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                                    }`}>
                                                    {usageCount}
                                                </span>
                                            )}
                                        </button>

                                        {!['work', 'personal', 'ideas'].includes(tag) && (
                                            <button
                                                onClick={() => handleRemoveTag(tag)}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-all duration-200 mx-0.5 sm:mx-1 flex-shrink-0"
                                                title="Remove tag"
                                            >
                                                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Add Tag Section - Always visible with proper spacing */}
                <div className="mt-2 sm:mt-3">
                    {isAddingTag ? (
                        <div className="space-y-2 sm:space-y-3 p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700">
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block">New Tag Name</label>
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                                placeholder="Enter tag name..."
                                className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 focus:border-blue-500 dark:focus:border-cyan-500"
                                autoFocus
                            />
                            <div className="flex gap-1.5 sm:gap-2">
                                <button
                                    onClick={handleAddTag}
                                    disabled={!newTag.trim()}
                                    className="flex-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-blue-500 dark:bg-cyan-500 hover:bg-blue-600 dark:hover:bg-cyan-600 disabled:bg-blue-500/50 dark:disabled:bg-cyan-500/50 disabled:cursor-not-allowed text-white rounded-lg text-xs sm:text-sm font-medium transition-all duration-200"
                                >
                                    Create Tag
                                </button>
                                <button
                                    onClick={() => {
                                        setIsAddingTag(false);
                                        setNewTag('');
                                    }}
                                    className="flex-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAddingTag(true)}
                            className="flex items-center gap-1.5 sm:gap-2 w-full p-2 sm:p-2.5 text-blue-600 dark:text-cyan-400 hover:text-blue-700 dark:hover:text-cyan-300 hover:bg-blue-50 dark:hover:bg-cyan-500/10 rounded-lg transition-all duration-200 border border-dashed border-blue-300 dark:border-cyan-500/30 hover:border-blue-400 dark:hover:border-cyan-500/50 group"
                        >
                            <Icons.Plus  />
                            <span className="font-medium text-xs sm:text-sm">Create New Tag</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Footer Section - Ultra compact for small screens */}
            <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-800">
                {/* Responsive Stats Grid */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                    <div className="text-center p-1 sm:p-1.5 bg-gray-100 dark:bg-gray-800/50 rounded border sm:rounded-lg border-gray-200 dark:border-gray-700">
                        <div className="text-[8px] sm:text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Total</div>
                        <div className="text-xs font-bold text-gray-900 dark:text-white">{notesCount}</div>
                    </div>
                    <div className="text-center p-1 sm:p-1.5 bg-gray-100 dark:bg-gray-800/50 rounded border sm:rounded-lg border-gray-200 dark:border-gray-700">
                        <div className="text-[8px] sm:text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Fav</div>
                        <div className="text-xs font-bold text-yellow-600 dark:text-yellow-400">{favoriteCount}</div>
                    </div>
                    <div className="text-center p-1 sm:p-1.5 bg-gray-100 dark:bg-gray-800/50 rounded border sm:rounded-lg border-gray-200 dark:border-gray-700">
                        <div className="text-[8px] sm:text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Shared</div>
                        <div className="text-xs font-bold text-blue-600 dark:text-blue-400">{sharedCount}</div>
                    </div>
                </div>

                {/* Compact Status */}
                <div className="text-center px-1.5 sm:px-2 py-1 bg-gray-100 dark:bg-gray-800/30 rounded border border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {selectedTag ? `#${selectedTag}` : 'All notes'}
                    </div>
                </div>

                <NotesDashboardDropdown
                    currentUser={currentUser}
                    setShowProfileSettings={setShowProfileSettings}
                />
            </div>
        </div>
    );
};

export default CollectionsSidebar;