import React from 'react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { Note } from '@/types';
import MemoizedNoteCard from './MemoizedNoteCard';
import EmptyState from './EmptyState';
import { Icons } from './Icons';

interface NotesGridProps {
    filteredNotes: Note[];
    handleDeleteNote: (id: string) => void;
    router: AppRouterInstance;
    aiProcessingNotes: Set<string>;
    loadingMore: boolean;
    pagination: { hasMore: boolean };
    search: string;
    selectedTag: string | null;
    filter: string;
    setShowCreateModal: (show: boolean) => void;
}
const NotesGrid: React.FC<NotesGridProps> = ({
    filteredNotes,
    handleDeleteNote,
    router,
    aiProcessingNotes,
    loadingMore,
    pagination,
    search,
    selectedTag,
    filter,
    setShowCreateModal
}) => {
    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {filteredNotes.length === 0 ? (
                <EmptyState
                    hasSearch={!!search || !!selectedTag || filter !== 'all'}
                    onCreateNote={() => setShowCreateModal(true)}
                />
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredNotes.map((note) => (
                            <MemoizedNoteCard
                                key={note.id}
                                note={note}
                                onDelete={handleDeleteNote}
                                onClick={() => router.push(`/notes/${note.id}`)}
                                isAiProcessing={aiProcessingNotes.has(note.id)}
                            />
                        ))}
                    </div>
                    {loadingMore && (
                        <div className="flex justify-center py-8">
                            <div className="flex items-center gap-3 text-cyan-400">
                                <Icons.Loader />
                                <span className="font-medium">Loading more notes...</span>
                            </div>
                        </div>
                    )}

                    {!pagination.hasMore && filteredNotes.length > 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-400 font-medium">
                                You've reached the end ({filteredNotes.length} notes shown)
                            </p>
                        </div>
                    )}
                </>
            )}
        </main>
    );
};

export default NotesGrid;