'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { Note, Task } from '@/types';
import AIAssistant from '@/components/AIAssistant';
import UrgentTasks from '@/components/UrgentTasks';
import ActivityFeed from '@/components/ActivityFeed';
import CreateNoteModal from '@/components/CreateNoteModal';
import UserDropdown from '@/NoteComponents/UserDropdown';
import { logger } from '@/lib/logger';
import ProfileSettingsModal from '@/components/ProfileSettingsModal';

// Import the 3 split components
import DashboardSkeleton from './DashboardSkeleton';
import { Icons, NavigationItem, CollaboratorAvatar, StatCard, NoteCard, TaskColumn } from './DashboardComponents';
import Link from 'next/link';

export default function Dashboard() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [collaborators, setCollaborators] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAIAssistant, setShowAIAssistant] = useState(false);
    const [showCreateNoteModal, setShowCreateNoteModal] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [showProfileSettings, setShowProfileSettings] = useState(false);
    const [isTokenReady, setIsTokenReady] = useState(false);
    const [error, setError] = useState('');
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const [stats, setStats] = useState({
        totalNotes: 0,
        completedTasks: 0,
        aiProcessed: 0,
        sharedNotes: 0,
        sharedByMe: 0
    });
    const router = useRouter();

    const fetchDashboardData = useCallback(async () => {
        try {
            const token = auth.getToken();
            if (!token) return;

            const [notesData, sharedByMeData, tasksData, collaboratorsData] = await Promise.allSettled([
                api.getNotes(token),
                api.getNotesSharedByMe(token),
                api.getTasks(token),
                api.getCollaborationHistory(token)
            ]);

            const notes = notesData.status === 'fulfilled' ? notesData.value.notes || [] : [];
            const tasks = tasksData.status === 'fulfilled' ? tasksData.value.tasks || [] : [];
            const sharedByMe = sharedByMeData.status === 'fulfilled' ? sharedByMeData.value.sharedByMeCount || 0 : 0;
            const collaborators = collaboratorsData.status === 'fulfilled' ? collaboratorsData.value.collaborators?.slice(0, 6) || [] : [];

            setNotes(notes);
            setTasks(tasks);
            setCollaborators(collaborators);
            setStats({
                totalNotes: notes.length,
                completedTasks: tasks.filter((task: Task) => task.status === 'DONE').length,
                aiProcessed: notes.filter((note: Note) => note.aiSummary).length,
                sharedNotes: notes.filter((note: Note) => !note.permissions?.isOwner).length,
                sharedByMe
            });
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCurrentUser = useCallback(async () => {
        try {
            const token = auth.getToken();
            if (!token) {
                logger.warn('No token available for fetching current user');
                return;
            }
            logger.debug('Fetching current user with token:', { tokenPreview: token.substring(0, 10) + '...' });
            const response = await api.getCurrentUser(token);

            if (response && response.user) {
                setCurrentUser(response.user);
                logger.info('Current user fetched successfully:', { userEmail: response.user.email });
            } else {
                logger.error('Invalid response format from getCurrentUser:', { response });
                setError('Invalid user data received');
            }
        } catch (error: any) {
            logger.error('Failed to fetch current user:', { error });

            if (error.response?.status === 401) {
                setError('Authentication failed. Please login again.');
                auth.removeToken();
                router.push('/login');
            } else if (error.response?.status === 404) {
                setError('User endpoint not found');
            } else {
                setError('Failed to load user profile');
            }
        }
    }, [router]);

    useEffect(() => {
        if (!auth.isAuthenticated()) {
            router.push('/login');
            return;
        }

        const timer = setTimeout(() => setIsTokenReady(true), 50);
        return () => clearTimeout(timer);
    }, [router]);

    useEffect(() => {
        if (!auth.isAuthenticated()) {
            router.push('/login');
            return;
        }
        fetchDashboardData();
    }, [fetchDashboardData, router]);

    useEffect(() => {
        if (!isTokenReady) return;
        fetchCurrentUser();
    }, [fetchCurrentUser, isTokenReady]);

    const handleNoteClick = useCallback((noteId: string) => {
        router.push(`/notes/${noteId}`);
    }, [router]);

    const handleTaskClick = useCallback((taskId: string) => {
        router.push(`/tasks?edit=${taskId}`);
    }, [router]);

    const handleCreateNote = useCallback(async (title: string, content: string) => {
        try {
            const token = auth.getToken();
            if (!token) return;

            await api.createNote(token, { title, content });
            await fetchDashboardData();
            setShowCreateNoteModal(false);
            console.log('Note created successfully!');
        } catch (error) {
            console.error('Failed to create note:', error);
        }
    }, [fetchDashboardData]);

    function handleUserUpdate(user: any): void {
        setCurrentUser(user);
    }

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/20 dark:bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 dark:bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
                <div className="absolute top-40 left-1/2 w-80 h-80 bg-purple-500/20 dark:bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500"></div>
            </div>

            {/* Header Section */}
            <header className="relative bg-white/80 dark:bg-gray-900/40 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        {/* Logo and Mobile Menu */}
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                className="lg:hidden p-2 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-all duration-300 hover:scale-110"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            {/* Mobile Dropdown Menu */}
                            {showMobileMenu && (
                                <div className="lg:hidden absolute top-16 left-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 min-w-48">
                                    <div className="p-2 space-y-1">
                                        <Link href="/dashboard">
                                            <button
                                                onClick={() => setShowMobileMenu(false)}
                                                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                            >
                                                <Icons.Analytics />
                                                <span className="font-medium">Dashboard</span>
                                            </button>
                                        </Link>
                                        <Link href="/notes">
                                            <button
                                                onClick={() => setShowMobileMenu(false)}
                                                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                            >
                                                <Icons.Notes />
                                                <span className="font-medium">Notes</span>
                                            </button>
                                        </Link>
                                        <Link href="/notes/shared-by-me">
                                            <button
                                                onClick={() => setShowMobileMenu(false)}
                                                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                            >
                                                <Icons.Share />
                                                <span className="font-medium">Shared</span>
                                            </button>
                                        </Link>
                                        <Link href="/tasks">
                                            <button
                                                onClick={() => setShowMobileMenu(false)}
                                                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                            >
                                                <Icons.Tasks />
                                                <span className="font-medium">Tasks</span>
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/25">
                                    <Icons.Sparkles />
                                </div>
                                <div className="hidden sm:block">
                                    <h1 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                                        IntelliSpace
                                    </h1>
                                    <p className="text-gray-600 dark:text-cyan-300/60 text-xs lg:text-sm">Your productivity hub</p>
                                </div>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex space-x-2 bg-gray-100/80 dark:bg-white/5 rounded-2xl p-2 backdrop-blur-lg border border-gray-200 dark:border-white/10">
                            <NavigationItem href="/dashboard" icon={Icons.Analytics} label="Dashboard" active />
                            <NavigationItem href="/notes" icon={Icons.Notes} label="Notes" />
                            <NavigationItem href="/notes/shared-by-me" icon={Icons.Share} label="Shared" />
                            <NavigationItem href="/tasks" icon={Icons.Tasks} label="Tasks" />
                        </nav>

                        {/* Right Side: New Note Button + User Dropdown */}
                        <div className="flex items-center space-x-2 lg:space-x-3">
                            <button
                                onClick={() => setShowCreateNoteModal(true)}
                                className="flex items-center space-x-1 lg:space-x-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-3 lg:px-6 py-2 lg:py-3 rounded-lg lg:rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 font-semibold shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105"
                            >
                                <Icons.Plus />
                                <span className="hidden sm:inline text-sm lg:text-base">New Note</span>
                                <span className="sm:hidden text-sm">Note</span>
                            </button>

                            <UserDropdown
                                currentUser={currentUser}
                                showDropdown={showUserDropdown}
                                setShowDropdown={setShowUserDropdown}
                                setShowProfileSettings={setShowProfileSettings}
                                onAvatarUpdate={handleUserUpdate}
                            />
                        </div>
                    </div>
                </div>
            </header>

            <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    {/* Left Column - Stats & Content (8/12) */}
                    <div className="xl:col-span-8 space-y-6">
                        {/* Workspace Analytics & Quick Actions Side by Side */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            {/* Stats Section */}
                            <div className="lg:col-span-2 bg-white/80 dark:bg-gray-900/40 backdrop-blur-xl rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-2xl">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center">
                                        <Icons.Analytics />
                                    </div>
                                    <span>Workspace Analytics</span>
                                </h2>
                                <div className="grid grid-cols-2 lg:grid-cols-2 gap-3">
                                    <StatCard value={stats.totalNotes} label="Notes" gradient="from-blue-500 to-cyan-500" />
                                    <StatCard value={stats.completedTasks} label="Done" gradient="from-green-400 to-emerald-500" />
                                    <StatCard value={stats.aiProcessed} label="AI" gradient="from-purple-500 to-pink-500" />
                                    <StatCard value={stats.sharedNotes} label="Shared With Me" gradient="from-orange-400 to-red-500" />
                                    <StatCard value={stats.sharedByMe} label="Shared By Me" gradient="from-yellow-400 to-amber-500" />
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="lg:col-span-2 bg-white/80 dark:bg-gray-900/40 backdrop-blur-xl rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-2xl">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
                                <div className="space-y-4">
                                    <button
                                        onClick={() => setShowAIAssistant(true)}
                                        className="w-full flex items-center space-x-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group"
                                    >
                                        <Icons.AI />
                                        <span className="font-semibold text-sm">AI Assistant</span>
                                    </button>
                                    <button
                                        onClick={() => setShowCreateNoteModal(true)}
                                        className="w-full flex items-center space-x-3 mt-5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-4 rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group"
                                    >
                                        <Icons.Plus />
                                        <span className="font-semibold text-sm">New Note</span>
                                    </button>
                                    <Link href="/tasks"> <button className="w-full flex items-center mt-5 space-x-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white py-3 px-4 rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group">
                                        <Icons.Tasks /> <span className="font-semibold text-sm">Manage Tasks</span> </button> </Link>
                                </div>
                            </div>
                        </div>

                        {/* Recent Notes */}
                        <div className="bg-white/80 dark:bg-gray-900/40 backdrop-blur-xl rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-2xl">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                            <Icons.Notes />
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Notes</h2>
                                    </div>

                                    {/* Collaborators Section */}
                                    {collaborators.length > 0 && (
                                        <div className="flex items-center space-x-3 mt-3">
                                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                                <Icons.Users />
                                                <span>Collaborators:</span>
                                            </div>
                                            <div className="flex -space-x-2">
                                                {collaborators.slice(0, 5).map((collaborator) => (
                                                    <CollaboratorAvatar key={collaborator.id} collaborator={collaborator} />
                                                ))}
                                            </div>
                                            {collaborators.length > 5 && (
                                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                    +{collaborators.length - 5}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <Link
                                    href="/notes"
                                    className="text-cyan-600 dark:text-cyan-300 text-sm hover:text-cyan-700 dark:hover:text-white transition duration-300 hover:underline font-medium flex-shrink-0"
                                >
                                    View All →
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {notes.slice(0, 4).map((note: Note) => (
                                    <NoteCard
                                        key={note.id}
                                        note={note}
                                        onClick={() => handleNoteClick(note.id)}
                                    />
                                ))}
                                {notes.length === 0 && (
                                    <div className="md:col-span-2 text-center py-8 space-y-4">
                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto">
                                            <Icons.Notes />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-gray-900 dark:text-white font-semibold">No notes yet</h3>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm">Start creating to see your notes here</p>
                                        </div>
                                        <Link href="/notes?create=new">
                                            <button className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-2 rounded-lg hover:from-cyan-600 hover:to-purple-600 transition duration-300 font-semibold text-sm">
                                                Create First Note
                                            </button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        <ActivityFeed />
                    </div>

                    {/* Right Column - Sidebar (4/12) */}
                    <div className="xl:col-span-4 space-y-6">
                        <UrgentTasks />

                        {/* Tasks Board */}
                        <div className="bg-white/80 dark:bg-gray-900/40 backdrop-blur-xl rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-3">
                                    <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                                        <Icons.Tasks />
                                    </div>
                                    <span>Tasks Board</span>
                                </h2>
                                <Link
                                    href="/tasks"
                                    className="text-cyan-600 dark:text-cyan-300 text-xs hover:text-cyan-700 dark:hover:text-white transition duration-300 hover:underline font-medium"
                                >
                                    View All →
                                </Link>
                            </div>
                            <div className="space-y-4">
                                {['TODO', 'IN_PROGRESS', 'DONE'].map((status: string) => {
                                    const statusTasks = tasks.filter((task: Task) => task.status === status);
                                    const statusConfig: any = {
                                        TODO: { gradient: 'from-red-500 to-pink-500', label: 'To Do' },
                                        IN_PROGRESS: { gradient: 'from-yellow-500 to-amber-500', label: 'In Progress' },
                                        DONE: { gradient: 'from-green-500 to-emerald-500', label: 'Completed' }
                                    }[status];

                                    return (
                                        <TaskColumn
                                            key={status}
                                            status={status}
                                            tasks={statusTasks}
                                            statusConfig={statusConfig}
                                            onTaskClick={handleTaskClick}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modals */}
            {showAIAssistant && <AIAssistant onClose={() => setShowAIAssistant(false)} />}
            {showCreateNoteModal && (
                <CreateNoteModal
                    onClose={() => setShowCreateNoteModal(false)}
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