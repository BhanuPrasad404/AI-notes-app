'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { Note, CollaborationUser } from '@/types';
import Toast from '@/components/Toast';
import { jwtDecode } from 'jwt-decode';
import dynamic from 'next/dynamic';
import React from 'react';

// Import components
import { Icons } from '../../../NoteComponents/Icons';
import NotePageSkeleton from '../../../NoteComponents/NotePageSkeleton';
import MemoizedHeader from '../../../NoteComponents/MemoizedHeader';
import NoteNotFound from '../../../NoteComponents/NoteNotFound';
import { debounce, throttle } from '../../../NoteComponents/utils';
import { USER_COLORS } from '../../../NoteComponents/constants';
import ProfileSettingsModal from '@/components/ProfileSettingsModal';
import { logger } from '@/lib/logger';

// Dynamic imports
const ShareNoteModal = dynamic(() => import('@/components/ShareNoteModal'), {
    ssr: false
});

const RecentCollaboratorsModal = dynamic(() => import('@/components/RecentCollaboratorsModal'), {
    ssr: false
});

const AIPanel = dynamic(() => import('@/NoteComponents/AIPanel'), {
    ssr: false,
    loading: () => (
        <div className="fixed right-0 top-0 h-full w-80 bg-gray-800 border-l border-gray-700 animate-pulse flex items-center justify-center">
            <div className="text-gray-400">Loading AI...</div>
        </div>
    )
});

const CollaboratorsBar = dynamic(() => import('@/NoteComponents/CollaboratorsBar'), {
    ssr: false
});

const UserDropdown = dynamic(() => import('@/NoteComponents/UserDropdown'), {
    ssr: false
});

const NoteEditor = dynamic(() => import('@/NoteComponents/NoteEditor'), {
    ssr: true,
    loading: () => (
        <div className="min-h-[400px] bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
            <div className="space-y-3">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-4/6"></div>
            </div>
        </div>
    )
});

const NoteSidebar = dynamic(() => import('@/NoteComponents/NoteSidebar'), {
    ssr: false,
    loading: () => (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 h-64 animate-pulse flex items-center justify-center">
            <div className="text-gray-400">Loading sidebar...</div>
        </div>
    )
});

export default function SingleNotePage() {
    const [note, setNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [showAIPanel, setShowAIPanel] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showRecentCollaborators, setShowRecentCollaborators] = useState(false);
    const [showProfileSettings, setShowProfileSettings] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [autoFillEmail, setAutoFillEmail] = useState('');

    // Socket states
    const [onlineUsers, setOnlineUsers] = useState<CollaborationUser[]>([]);
    const [typingUsers, setTypingUsers] = useState<CollaborationUser[]>([]);
    const [liveCursors, setLiveCursors] = useState<any[]>([]);
    const socketRef = useRef<any>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const cursorThrottleRef = useRef<NodeJS.Timeout | null>(null);

    const router = useRouter();
    const params = useParams();
    const noteId = params.id as string;

    // Memoized helper functions
    const getCurrentUserId = useCallback((): string | null => {
        const token = auth.getToken();
        if (!token) return null;
        try {
            const decoded: any = jwtDecode(token);
            return decoded.userId;
        } catch (error) {
            logger.error('Failed to decode token:', { error });
            return null;
        }
    }, []);

    const getUserColor = useCallback((userId: string): string => {
        const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % USER_COLORS.length;
        return USER_COLORS[index];
    }, []);

    // Memoized socket data
    const onlineUsersData = useMemo(() =>
        onlineUsers.map(user => ({
            ...user,
            color: getUserColor(user.userId)
        })),
        [onlineUsers, getUserColor]
    );

    const handleAutoFillAndShare = (email: string) => {
        logger.info('Setting auto-fill email and opening share modal:', { email });
        setAutoFillEmail(email);
        setShowShareModal(true);
        setShowRecentCollaborators(false);
    };

    // Debounced save with useCallback
    const debouncedSave = useCallback(
        debounce(async (title: string, content: string) => {
            if (!auth.isAuthenticated() || !note?.permissions?.canEdit) return;

            setSaving(true);
            setSaved(false);
            try {
                const token = auth.getToken();
                if (!token) return;
                logger.debug('Content before API call:', { content });
                const result = await api.updateNote(token, noteId, { title, content });
                logger.debug('Content from API response:', { content: result.note.content });
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            } catch (error) {
                logger.error('Save error:', { error });
                setError('Failed to save note');
            } finally {
                setSaving(false);
            }
        }, 1000),
        [noteId, note?.permissions?.canEdit]
    );

    // Auto-save when content changes
    useEffect(() => {
        if (note && (title !== note.title || content !== note.content)) {
            debouncedSave(title, content);
        }
    }, [title, content, debouncedSave, note]);

    // Clean up stale cursors
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            setLiveCursors(prev =>
                prev.filter(cursor => now - cursor.lastUpdated < 3000)
            );
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Socket connection effect
    useEffect(() => {
        if (!note || loading) return;

        // Delay socket connection to prioritize initial render
        const socketTimer = setTimeout(() => {
            import('@/lib/socket').then((module) => {
                const socketService = module.socketService;
                const socket = socketService.connect();
                socketRef.current = socket;

                if (socket && note) {
                    logger.info('Joining note room:', { noteId: note.id });
                    socket.emit('join-note', note.id);

                    // User joined note
                    socket.on('user-joined-note', (data: any) => {
                        logger.info('User joined:', { userName: data.user.name });
                        setOnlineUsers(prev => {
                            const exists = prev.find(u => u.userId === data.user.id);
                            if (exists) return prev;
                            return [...prev, {
                                userId: data.user.id,
                                user: data.user
                            }];
                        });
                        setSuccess(`${data.user.name} joined the note`);
                        setTimeout(() => setSuccess(''), 3000);
                    });

                    // User typing updates
                    socket.on('user-typing-update', (data: any) => {
                        logger.debug('Typing update:', { userName: data.user.name, isTyping: data.isTyping });
                        setTypingUsers(prev => {
                            const newTypingUsers = prev.filter(u => u.userId !== data.userId);
                            if (data.isTyping) {
                                return [...newTypingUsers, {
                                    userId: data.userId,
                                    user: data.user
                                }];
                            }
                            return newTypingUsers;
                        });
                    });

                    // User left note
                    socket.on('user-left-note', (data: any) => {
                        logger.info('User left:', { userId: data.userId });
                        setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
                        setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
                        setLiveCursors(prev => prev.filter(c => c.userId !== data.userId));
                        setSuccess('A user left the note');
                        setTimeout(() => setSuccess(''), 3000);
                    });

                    // Note collaborators list
                    socket.on('note-collaborators', (data: any) => {
                        logger.info('Current collaborators:', { collaborators: data.collaborators });
                        if (data.collaborators && Array.isArray(data.collaborators)) {
                            const currentUserId = getCurrentUserId();
                            const otherUsers = data.collaborators.filter((collab: any) =>
                                collab.id !== currentUserId
                            );

                            setOnlineUsers(otherUsers.map((collab: any) => ({
                                userId: collab.id,
                                user: collab
                            })));
                        }
                    });

                    // REAL-TIME CONTENT SYNC
                    socket.on('note-content-updated', (data: any) => {
                        logger.info('Content updated by other user:', { updatedBy: data.updatedBy.name });
                        const currentUserId = getCurrentUserId();

                        // Only update if change came from another user
                        if (data.updatedBy.id !== currentUserId) {
                            setContent(data.content);
                            // Also update title if needed
                            if (data.title && data.title !== title) {
                                setTitle(data.title);
                            }
                        }
                    });

                    // LIVE CURSORS - RECEIVE OTHER USERS' CURSORS
                    socket.on('user-cursor-move', (data: any) => {
                        logger.debug('Cursor moved by:', { userName: data.user.name, position: data.position });
                        setLiveCursors(prev => {
                            const filtered = prev.filter(c => c.userId !== data.userId);
                            return [...filtered, {
                                userId: data.userId,
                                user: data.user,
                                position: data.position,
                                lastUpdated: Date.now(),
                                color: getUserColor(data.userId)
                            }];
                        });
                    });

                    // Real-time title updates
                    socket.on('note-title-updated', (data: any) => {
                        logger.info('Title updated by:', { updatedBy: data.updatedBy.name });
                        const currentUserId = getCurrentUserId();

                        if (data.updatedBy.id !== currentUserId) {
                            setTitle(data.title);
                            setSuccess(`${data.updatedBy.name} updated the title`);
                            setTimeout(() => setSuccess(''), 3000);
                        }
                    });

                    // Handle user permissions changes
                    socket.on('user-permissions-updated', (data: any) => {
                        logger.info('Permissions updated for note');
                        // Refresh note data to get updated permissions
                        fetchNote();
                        setSuccess('Permissions updated');
                        setTimeout(() => setSuccess(''), 3000);
                    });

                    // Handle note deletion
                    socket.on('note-deleted', (data: any) => {
                        logger.warn('Note deleted by owner');
                        setError('This note has been deleted by the owner');
                        setTimeout(() => {
                            router.push('/notes');
                        }, 3000);
                    });

                    // Handle connection errors
                    socket.on('connect_error', (error: any) => {
                        logger.error('Socket connection error:', { error });
                        setError('Connection error. Trying to reconnect...');
                    });

                    // Handle disconnect from server
                    socket.on('disconnect', (reason: string) => {
                        logger.warn('Socket disconnected:', { reason });
                        if (reason === 'io server disconnect') {
                            // Server forced disconnect, need to manually reconnect
                            socket.connect();
                        }
                        setError('Connection lost. Reconnecting...');
                    });

                    // Handle reconnect
                    socket.on('reconnect', (attemptNumber: number) => {
                        logger.info('Socket reconnected after attempts:', { attemptNumber });
                        setSuccess('Connection restored');
                        setTimeout(() => setSuccess(''), 3000);
                        // Rejoin the note room
                        if (note) {
                            socket.emit('join-note', note.id);
                        }
                    });

                    // Handle reconnect failed
                    socket.on('reconnect_failed', () => {
                        logger.error('Socket reconnection failed');
                        setError('Failed to restore connection. Please refresh the page.');
                    });

                    // Handle access denied
                    socket.on('access-denied', (data: any) => {
                        logger.error('Access denied to note:', { reason: data.reason });
                        setError('Access denied to this note');
                        setTimeout(() => {
                            router.push('/notes');
                        }, 2000);
                    });

                    // Handle note not found
                    socket.on('note-not-found', (data: any) => {
                        logger.error('Note not found');
                        setError('Note not found');
                        setTimeout(() => {
                            router.push('/notes');
                        }, 2000);
                    });

                    // Request initial collaborators list
                    socket.emit('get-note-collaborators', { noteId: note.id });
                }
            }).catch((error) => {
                logger.error('Failed to load socket service:', { error });
                setError('Failed to establish real-time connection');
            });
        }, 500); // Delay socket connection by 500ms

        // Clean up
        return () => {
            clearTimeout(socketTimer);
            if (socketRef.current) {
                logger.info('Cleaning up socket connection');

                // Leave note room
                if (note) {
                    socketRef.current.emit('leave-note', note.id);
                }

                // Remove all event listeners to prevent memory leaks
                socketRef.current.off('user-joined-note');
                socketRef.current.off('user-typing-update');
                socketRef.current.off('user-left-note');
                socketRef.current.off('note-collaborators');
                socketRef.current.off('note-content-updated');
                socketRef.current.off('user-cursor-move');
                socketRef.current.off('note-title-updated');
                socketRef.current.off('user-permissions-updated');
                socketRef.current.off('note-deleted');
                socketRef.current.off('connect_error');
                socketRef.current.off('disconnect');
                socketRef.current.off('reconnect');
                socketRef.current.off('reconnect_failed');
                socketRef.current.off('access-denied');
                socketRef.current.off('note-not-found');

                // Disconnect socket
                socketRef.current.disconnect();
                socketRef.current = null;
            }

            // Clear typing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = null;
            }

            // Clear cursor throttle
            if (cursorThrottleRef.current) {
                clearTimeout(cursorThrottleRef.current);
                cursorThrottleRef.current = null;
            }

            // Reset real-time states
            setOnlineUsers([]);
            setTypingUsers([]);
            setLiveCursors([]);
        };
    }, [note?.id, loading, getCurrentUserId, getUserColor, title, router]);

    // Throttled content change handler
    const handleContentChange = useCallback(
        throttle((newContent: string) => {
            setContent(newContent);

            if (socketRef.current && note) {
                socketRef.current.emit('note-content-change', {
                    noteId: note.id,
                    content: newContent,
                    cursorPosition: 0
                });

                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }

                socketRef.current.emit('user-typing', {
                    noteId: note.id,
                    isTyping: true
                });

                typingTimeoutRef.current = setTimeout(() => {
                    if (socketRef.current && note) {
                        socketRef.current.emit('user-typing', {
                            noteId: note.id,
                            isTyping: false
                        });
                    }
                }, 1000);
            }
        }, 50),
        [note]
    );

    // Throttled cursor movement
    const handleMouseMove = useCallback(
        throttle((event: React.MouseEvent) => {
            if (!socketRef.current || !note) return;

            const position = {
                x: event.clientX,
                y: event.clientY
            };

            socketRef.current.emit('cursor-move', {
                noteId: note.id,
                position
            });
        }, 200),
        [note]
    );

    // Core data fetching
    useEffect(() => {
        if (!auth.isAuthenticated()) {
            router.push('/login');
            return;
        }
        fetchNote();
        fetchCurrentUser();
    }, [noteId]);

    const fetchNote = async () => {
        try {
            const token = auth.getToken();
            if (!token) return;

            const data = await api.getNote(token, noteId);
            logger.info('NOTE DATA FROM API:', { content: data.note.content });
            setNote(data.note);
            setTitle(data.note.title);
            setContent(data.note.content || '');
        } catch (error) {
            setError('Failed to load note');
        } finally {
            setLoading(false);
        }
    };

    const fetchCurrentUser = async () => {
        try {
            const token = auth.getToken();
            if (!token) return;
            const response = await api.getCurrentUser(token);
            setCurrentUser(response.user);
        } catch (error) {
            logger.error('Failed to fetch current user', { error });
        }
    };

    const canEdit = note?.permissions?.canEdit;

    // Show skeleton immediately
    if (loading) {
        return <NotePageSkeleton />;
    }
    if (!note) {
        return <NoteNotFound />;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            {/* Header */}
            <MemoizedHeader
                title={title}
                setTitle={setTitle}
                saving={saving}
                saved={saved}
                canEdit={canEdit}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                showAIPanel={showAIPanel}
                setShowAIPanel={setShowAIPanel}
                setShowShareModal={setShowShareModal}
                currentUser={currentUser}
                setShowRecentCollaborators={setShowRecentCollaborators}
                setShowProfileSettings={setShowProfileSettings}
            />

            {/* Collaborators Bar */}
            {onlineUsers.length > 0 && (
                <CollaboratorsBar
                    onlineUsers={onlineUsersData}
                    typingUsers={typingUsers}
                    currentUser={currentUser}
                />
            )}

            {error && <Toast message={error} type="error" onClose={() => setError('')} />}
            {success && <Toast message={success} type="success" onClose={() => setSuccess('')} />}

            {/* AI Panel */}
            {showAIPanel && (
                <AIPanel
                    content={content}
                    noteId={noteId}
                    setContent={setContent}
                    setSuccess={setSuccess}
                    setError={setError}
                />
            )}

            {/* Main Content */}
            <main className="w-full">
                <div className="flex flex-col xl:flex-row gap-4 lg:gap-6 xl:gap-8 w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
                    <div className="w-full xl:flex-1 max-w-4xl mx-auto xl:mx-0">
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <NoteEditor
                                content={content}
                                setContent={handleContentChange}
                                isEditing={isEditing}
                                canEdit={canEdit || false}
                                liveCursors={liveCursors}
                                note={note}
                                socketRef={socketRef}
                                typingTimeoutRef={typingTimeoutRef}
                                onMouseMove={handleMouseMove}
                            />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="w-full xl:w-80 max-w-2xl mx-auto xl:mx-0">
                        <div className="sticky top-24">
                            <NoteSidebar note={note} />
                        </div>
                    </div>
                </div>
            </main>

            {/* Modals */}
            {showShareModal && (
                <ShareNoteModal
                    noteId={noteId}
                    isOpen={showShareModal}
                    onClose={() => setShowShareModal(false)}
                    onShareSuccess={() => {
                        setSuccess('Note shared successfully!');
                        fetchNote();
                    }}
                    autoFillEmail={autoFillEmail}
                />
            )}

            {showRecentCollaborators && (
                <RecentCollaboratorsModal
                    isOpen={showRecentCollaborators}
                    onClose={() => setShowRecentCollaborators(false)}
                    onShareRequest={handleAutoFillAndShare}
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