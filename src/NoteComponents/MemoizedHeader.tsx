import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Icons } from './Icons';

const UserDropdown = dynamic(() => import('@/NoteComponents/UserDropdown'), {
    ssr: false
});

// Memoized Header Component
const MemoizedHeader = React.memo(function Header({
    title,
    setTitle,
    saving,
    saved,
    canEdit,
    isEditing,
    setIsEditing,
    showAIPanel,
    setShowAIPanel,
    setShowShareModal,
    currentUser,
    setShowRecentCollaborators,
    setShowProfileSettings,
}: any) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    return (
        <>
            <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 w-full">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 w-full">
                        <div className="flex items-center flex-1 min-w-0">
                            <Link
                                href="/notes"
                                className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors mr-3"
                                aria-label="Back to notes"
                            >
                                <Icons.Back />
                            </Link>
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <div className="hidden sm:block flex-shrink-0">
                                    {saving && (
                                        <div className="flex items-center space-x-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full">
                                            <Icons.Loader />
                                            <span>Saving...</span>
                                        </div>
                                    )}
                                    {saved && !saving && (
                                        <div className="flex items-center space-x-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-full">
                                            <Icons.Check />
                                            <span>Saved</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        disabled={!canEdit}
                                        className="w-full bg-transparent text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white border-none outline-none placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-60 truncate"
                                        placeholder="Untitled"
                                        aria-label="Note title"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center space-x-2 ml-4">
                            {canEdit && (
                                <>
                                    <button
                                        onClick={() => setShowAIPanel(!showAIPanel)}
                                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border ${showAIPanel
                                            ? 'bg-purple-500 text-white border-purple-500 shadow-lg'
                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                        aria-label="Toggle AI panel"
                                    >
                                        <Icons.AI />
                                        <span>AI</span>
                                    </button>

                                    <button
                                        onClick={() => setIsEditing(!isEditing)}
                                        className="flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                                        aria-label={isEditing ? 'Switch to preview' : 'Switch to edit mode'}
                                    >
                                        <Icons.Edit />
                                        <span>{isEditing ? 'Preview' : 'Edit'}</span>
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => setShowShareModal(true)}
                                className="flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                                aria-label="Share note"
                            >
                                <Icons.Share />
                                <span>Share</span>
                            </button>
                            <UserDropdown
                                currentUser={currentUser}
                                showDropdown={showDropdown}
                                setShowDropdown={setShowDropdown}
                                setShowRecentCollaborators={setShowRecentCollaborators}
                                setShowProfileSettings={setShowProfileSettings} 
                            />
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                className="flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                aria-label="Open menu"
                            >
                                <Icons.More />
                            </button>
                        </div>
                    </div>

                    {/* Mobile Status Bar */}
                    <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-2 w-full">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-2">
                                {saving && (
                                    <div className="flex items-center space-x-2 text-xs text-blue-600 dark:text-blue-400">
                                        <Icons.Loader />
                                        <span>Saving...</span>
                                    </div>
                                )}
                                {saved && !saving && (
                                    <div className="flex items-center space-x-2 text-xs text-green-600 dark:text-green-400">
                                        <Icons.Check />
                                        <span>Saved</span>
                                    </div>
                                )}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {canEdit ? 'Editable' : 'View only'}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            {showMobileMenu && (
                <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg w-full">
                    <div className="w-full px-4 py-3">
                        <div className="grid grid-cols-3 gap-2 w-full">
                            {canEdit && (
                                <>
                                    <button
                                        onClick={() => {
                                            setShowAIPanel(!showAIPanel);
                                            setShowMobileMenu(false);
                                        }}
                                        className={`flex flex-col items-center justify-center py-3 rounded-lg text-sm font-medium transition-all ${showAIPanel
                                            ? 'bg-purple-500 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                                            }`}
                                        aria-label="Toggle AI panel"
                                    >
                                        <Icons.AI />
                                        <span className="mt-1 text-xs">AI</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setIsEditing(!isEditing);
                                            setShowMobileMenu(false);
                                        }}
                                        className="flex flex-col items-center justify-center py-3 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                                        aria-label={isEditing ? 'Switch to preview' : 'Switch to edit mode'}
                                    >
                                        <Icons.Edit />
                                        <span className="mt-1 text-xs">{isEditing ? 'Preview' : 'Edit'}</span>
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => {
                                    setShowShareModal(true);
                                    setShowMobileMenu(false);
                                }}
                                className="flex flex-col items-center justify-center py-3 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                                aria-label="Share note"
                            >
                                <Icons.Share />
                                <span className="mt-1 text-xs">Share</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
});

export default MemoizedHeader;