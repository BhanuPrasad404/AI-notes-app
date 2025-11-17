'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { Note } from '@/types';
import Toast from '@/components/Toast';
import dynamic from 'next/dynamic';
import React from 'react';

// Import all separated components
import { Icons } from '../../NoteComponents/Icons';
import CollectionsSidebar from '../../NoteComponents/CollectionsSidebar';
import MemoizedNoteCard from '../../NoteComponents/MemoizedNoteCard';
import EmptyState from '../../NoteComponents/EmptyState';
import NotesHeader from '../../NoteComponents/NotesHeader';
import NotesSearchFilter from '../../NoteComponents/NotesSearchFilter';
import { debounce } from '../../NoteComponents/utils';
import NotesSkeleton from '../../NoteComponents/NotesSkeleton';
import { socketService } from '@/lib/socket';
import { logger } from '@/lib/logger';

// Dynamic imports
const CreateNoteModal = dynamic(() => import('@/components/CreateNoteModal'), { ssr: false });
const ProfileSettingsModal = dynamic(() => import('@/components/ProfileSettingsModal'), { ssr: false });

export default function NotesPage() {
    // State declarations
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'favorites' | 'shared' | 'own'>('all');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [aiProcessingNotes, setAiProcessingNotes] = useState<Set<string>>(new Set());
    const [pagination, setPagination] = useState({
        page: 1,
        hasMore: true,
        total: 0
    });
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [sidebarSelection, setSidebarSelection] = useState('all');
    const [sidebarTags, setSidebarTags] = useState<string[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [showProfileSettings, setShowProfileSettings] = useState(false);

    const router = useRouter();

    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Load sidebar tags
    useEffect(() => {
        const loadSidebarTags = async () => {
            try {
                const token = auth.getToken();
                if (!token) return;

                const response = await api.getSidebarTags(token);
                setSidebarTags(response.sidebarTags || []);
            } catch (error) {
                logger.error('Failed to load sidebar tags:', { error });
                setSidebarTags(['work', 'personal', 'ideas']);
            }
        };
        loadSidebarTags();
    }, []);

    

    useEffect(() => {
        const socket = socketService.connect();

        return () => {
            socketService.disconnect();
        };
    }, []);

    // Listen for AI processing events
    useEffect(() => {
        const socket = socketService.getSocket();
        if (!socket) return;

        const handleAIComplete = (data: any) => {
            logger.info('AI processing complete:', { data });

            // Remove from processing set
            setAiProcessingNotes(prev => {
                const newSet = new Set(prev);
                newSet.delete(data.noteId);
                return newSet;
            });

            // Update the specific note with AI data
            setNotes(prev => prev.map(note =>
                note.id === data.noteId
                    ? { ...note, ...data.note }
                    : note
            ));

            setSuccess(data.message || 'AI enhancement completed!');
        };

        const handleAIFailed = (data: any) => {
            logger.info('AI processing failed:', { data });
            setAiProcessingNotes(prev => {
                const newSet = new Set(prev);
                newSet.delete(data.noteId);
                return newSet;
            });
            setError('AI processing failed for note');
        };

        // Listen for events
        socket.on('ai-processing-complete', handleAIComplete);
        socket.on('ai-processing-failed', handleAIFailed);

        // Cleanup listeners
        return () => {
            socket.off('ai-processing-complete', handleAIComplete);
            socket.off('ai-processing-failed', handleAIFailed);
        };
    }, []);

    // Fetch current user
    const fetchCurrentUser = useCallback(async () => {
        try {
            const token = auth.getToken();
            if (!token) return;
            const response = await api.getCurrentUser(token);
            setCurrentUser(response.user);
        } catch (error) {
            logger.error('Failed to fetch current user', { error });
        }
    }, []);

    useEffect(() => {
        fetchCurrentUser();
    }, [fetchCurrentUser]);

    // Tag management functions
    const handleAddTag = async (newTag: string) => {
        try {
            const token = auth.getToken();
            if (!token) return;

            const response = await api.addSidebarTag(token, newTag);
            setSidebarTags(response.sidebarTags);
        } catch (error) {
            logger.error('Failed to add tag:', { error });
        }
    };

    const handleRemoveTag = async (tagToRemove: string) => {
        try {
            const token = auth.getToken();
            if (!token) return;

            const response = await api.removeSidebarTag(token, tagToRemove);
            setSidebarTags(response.sidebarTags);
        } catch (error) {
            logger.error('Failed to remove tag:', { error });
        }
    };

    // Filter notes based on current selections
    const filteredNotes = useMemo(() => {
        let filtered = notes;

        if (filter === 'favorites') {
            filtered = filtered.filter(note => note.userPreferences?.[0]?.isFavorite);
        }

        if (filter === 'shared') {
            filtered = filtered.filter(note => !note.permissions?.isOwner);
        }

        if (filter === 'own') {
            filtered = filtered.filter(note => note.permissions?.isOwner);
        }

        if (selectedTag) {
            filtered = filtered.filter(note =>
                note.userPreferences?.[0]?.personalTags?.includes(selectedTag)
            );
        }

        return filtered;
    }, [notes, filter, selectedTag]);

    // Fetch notes 
    const fetchNotes = useCallback(async (page: number = 1, searchTerm: string = search, filterType: string = filter, tag: string | null = selectedTag) => {
        try {
            if (page === 1) setLoading(true);
            else setLoadingMore(true);

            const token = auth.getToken();
            if (!token) return;

            const data = await api.getNotes(token, {
                page,
                limit: 20,
                search: searchTerm,
            });

            if (page === 1) {
                setNotes(data.notes || []);
            } else {
                setNotes(prev => [...prev, ...(data.notes || [])]);
            }

            setPagination({
                page: data.pagination?.page || page,
                hasMore: data.pagination?.hasMore || false,
                total: data.pagination?.total || 0
            });

        } catch (error) {
            setError('Failed to load notes');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []); // [search, filter, selectedTag]

    // Infinite scroll
    useEffect(() => {
        const handleScroll = () => {
            requestAnimationFrame(() => {
                if (window.innerHeight + document.documentElement.scrollTop
                    < document.documentElement.offsetHeight - 100) return;

                if (pagination.hasMore && !loadingMore && !loading) {
                    fetchNotes(pagination.page + 1);
                }
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [pagination.hasMore, loadingMore, loading, fetchNotes]);

    // Search handler 
    const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);

        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Set new timeout - will only execute after user stops typing for 800ms
        searchTimeoutRef.current = setTimeout(() => {
            fetchNotes(1, value, filter, selectedTag);
        }, 800);
    }, [fetchNotes, filter, selectedTag]);

    // Filter handlers
    const handleFilterChange = useCallback((newFilter: 'all' | 'favorites' | 'shared' | 'own') => {
        setFilter(newFilter);
        setSelectedTag(null);
        setSidebarSelection(newFilter);

        // Trigger search immediately when filter changes
        fetchNotes(1, search, newFilter, null);
    }, [fetchNotes, search]);

    const handleSidebarSelect = useCallback((id: string) => {
        setSidebarSelection(id);
        setSelectedTag(null);
        setShowMobileSidebar(false);

        const filterMap: Record<string, 'all' | 'favorites' | 'shared' | 'own'> = {
            'all': 'all',
            'favorites': 'favorites',
            'shared': 'shared'
        };

        const newFilter = filterMap[id] || 'all';
        setFilter(newFilter);

        // Trigger search immediately when sidebar selection changes
        fetchNotes(1, search, newFilter, null);
    }, [fetchNotes, search]);

    const handleTagSelect = useCallback((tag: string | null) => {
        setSelectedTag(tag);
        setSidebarSelection('all');
        setFilter('all');

        // Trigger search immediately when tag changes
        fetchNotes(1, search, 'all', tag);
    }, [fetchNotes, search]);

    // Note operations
    const handleCreateNote = useCallback(async (title: string, content: string) => {
        try {
            const token = auth.getToken();
            if (!token) return;
            const response = await api.createNote(token, { title, content });

            if (response.note?.id) {
                if (response.aiProcessing) {
                    setAiProcessingNotes(prev => new Set(prev).add(response.note.id));
                    setSuccess('Note created! AI is enhancing your content...');

                    const socket = socketService.getSocket();
                    if (socket) {
                        socket.emit('join-note-room', response.note.id);
                        logger.info('Joined note room:', { noteId: response.note.id });
                    }
                } else {
                    setSuccess('Note created successfully!');
                }
                setShowCreateModal(false);
                fetchNotes(1);
            }
        } catch (error) {
            setError('Failed to create note');
        }
    }, [fetchNotes]);

    const handleDeleteNote = useCallback(async (noteId: string) => {
        //if (!confirm('Are you sure you want to delete this note?')) return;
        try {
            const token = auth.getToken();
            if (!token) return;
            await api.deleteNote(token, noteId);
            setSuccess('Note deleted successfully!');
            setNotes(prev => prev.filter(note => note.id !== noteId));
        } catch (error) {
            setError('Failed to delete note');
        }
    }, []);

    // Calculate counts for sidebar
    const sharedCount = useMemo(() => notes.filter(n => !n.permissions?.isOwner).length, [notes]);
    const favoriteCount = useMemo(() => notes.filter(n => n.userPreferences?.[0]?.isFavorite).length, [notes]);

    // Initial load
    useEffect(() => {
        if (!auth.isAuthenticated()) {
            router.push('/login');
            return;
        }
        fetchNotes(1);
    }, [fetchNotes, router]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-black">
                <NotesSkeleton />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-black">
            <div className="flex">
                {/* Desktop Sidebar */}
                <div className="hidden lg:block w-80 bg-white dark:bg-gray-900/90 border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0 overflow-y-auto">
                    <CollectionsSidebar
                        selectedId={sidebarSelection}
                        onSelect={handleSidebarSelect}
                        notesCount={notes.length}
                        sharedCount={sharedCount}
                        favoriteCount={favoriteCount}
                        selectedTag={selectedTag}
                        onTagSelect={handleTagSelect}
                        sidebarTags={sidebarTags}
                        onAddTag={handleAddTag}
                        onRemoveTag={handleRemoveTag}
                        currentUser={currentUser}
                        setShowProfileSettings={setShowProfileSettings}
                    />
                </div>

                {/* Mobile Sidebar */}
                {showMobileSidebar && (
                    <div className="lg:hidden fixed inset-0 z-40">
                        <div
                            className="fixed inset-0 bg-black/60"
                            onClick={() => setShowMobileSidebar(false)}
                        />
                        <div className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
                            <CollectionsSidebar
                                selectedId={sidebarSelection}
                                onSelect={handleSidebarSelect}
                                notesCount={notes.length}
                                sharedCount={sharedCount}
                                favoriteCount={favoriteCount}
                                selectedTag={selectedTag}
                                onTagSelect={handleTagSelect}
                                sidebarTags={sidebarTags}
                                onAddTag={handleAddTag}
                                onRemoveTag={handleRemoveTag}
                                currentUser={currentUser}
                                setShowProfileSettings={setShowProfileSettings}
                            />
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    <NotesHeader
                        showMobileSidebar={showMobileSidebar}
                        setShowMobileSidebar={setShowMobileSidebar}
                        filteredNotes={filteredNotes}
                        selectedTag={selectedTag}
                        filter={filter}
                        setShowCreateModal={setShowCreateModal}
                    />

                    {error && <Toast message={error} type="error" onClose={() => setError('')} />}
                    {success && <Toast message={success} type="success" onClose={() => setSuccess('')} />}

                    {/* AI Processing Banner */}
                    {aiProcessingNotes.size > 0 && (
                        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-4 flex items-center gap-3">
                            <Icons.Loader />
                            <div>
                                <p className="font-semibold">AI is enhancing your notes</p>
                                <p className="text-blue-100 text-sm">Adding summaries and tags...</p>
                            </div>
                        </div>
                    )}

                    <NotesSearchFilter
                        search={search}
                        handleSearch={handleSearch}
                        filter={filter}
                        handleFilterChange={handleFilterChange}
                        selectedTag={selectedTag}
                        setSelectedTag={setSelectedTag}
                    />

                    {/* Notes Grid */}
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
                                        <div className="flex items-center gap-3 text-blue-600 dark:text-cyan-400">
                                            <Icons.Loader />
                                            <span className="font-medium">Loading more notes...</span>
                                        </div>
                                    </div>
                                )}

                                {!pagination.hasMore && filteredNotes.length > 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600 dark:text-gray-400 font-medium">
                                            You've reached the end ({filteredNotes.length} notes shown)
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>

            {/* Modals */}
            {showCreateModal && (
                <CreateNoteModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreateNote}
                />
            )}

            <ProfileSettingsModal
                isOpen={showProfileSettings}
                onClose={() => setShowProfileSettings(false)}
                currentUser={currentUser}
            />
        </div>
    );
}