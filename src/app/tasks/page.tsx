'use client';
import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { Task } from '@/types';
import Toast from '@/components/Toast';
import TaskCard from '@/components/TaskCard';
import CreateTaskModal from '@/components/CreateTaskModal';
import TaskAnalytics from '@/components/TaskAnalytics';
import ExportTasksModal from '@/components/ExportTasksModal';
import AISuggestionsModal from '@/components/AISuggestionsModal';
import UserDropdown from '@/NoteComponents/UserDropdown';
import Sidebar from '@/components/Sidebar';
import ProfileSettingsModal from '@/components/ProfileSettingsModal';

// Import new components
import { Icons } from './TaskComponents/Icons';
import { TasksPageSkeleton, KanbanSkeleton } from './TaskComponents/TasksSkeleton';
import SearchBar from './TaskComponents/SearchBar';
import KanbanColumn from './TaskComponents/KanbanColumn';
import ModalContainer from './TaskComponents/ModalContainer';
import CreateProjectModal from './TaskComponents/CreateProjectModal';
import TasksHeader from './TaskComponents/TasksHeader';
import { logger } from '@/lib/logger';

export default function TasksPage() {
    // State declarations
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<{ TODO: Task[]; IN_PROGRESS: Task[]; DONE: Task[] }>({
        TODO: [],
        IN_PROGRESS: [],
        DONE: []
    });
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [showAISuggestions, setShowAISuggestions] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isTokenReady, setIsTokenReady] = useState(false);
    const [tasksWithNewMessages, setTasksWithNewMessages] = useState<string[]>([]);
    const [showProfileSettings, setShowProfileSettings] = useState(false);
    const [urgencyFilter, setUrgencyFilter] = useState('ALL');
    const [projectLoading, setProjectLoading] = useState(false);

    const [stats, setStats] = useState({
        TODO: 0,
        IN_PROGRESS: 0,
        DONE: 0,
        total: 0,
        sharedWithMeCount: 0,
        sharedByMeCount: 0
    });
    const [showDropdown, setShowDropdown] = useState(false);

    // Project State
    const [selectedProject, setSelectedProject] = useState('ALL');
    const [projects, setProjects] = useState<any[]>([]);

    const router = useRouter();

    // Memoized status config
    const statusConfigs = useMemo(() => ({
        TODO: { gradient: 'from-red-500 to-pink-500', label: 'To Do' },
        IN_PROGRESS: { gradient: 'from-yellow-500 to-amber-500', label: 'In Progress' },
        DONE: { gradient: 'from-green-500 to-emerald-500', label: 'Completed' }
    }), []);

    // Data fetching with useCallback
    const fetchTasks = useCallback(async () => {
        try {
            const token = auth.getToken();
            if (!token) return;

            console.log(" Fetching tasks for project:", selectedProject);

            const [tasksData, newMessagesData] = await Promise.all([
                api.getTasks(token, { projectId: selectedProject }),
                api.getTasksWithNewMessages(token)
            ]);

            setTasks(Array.isArray(tasksData.tasks) ? tasksData.tasks : []);
            setTasksWithNewMessages(newMessagesData.tasksWithNewMessages || []);
            setStats({
                TODO: tasksData.stats?.TODO || 0,
                IN_PROGRESS: tasksData.stats?.IN_PROGRESS || 0,
                DONE: tasksData.stats?.DONE || 0,
                total: tasksData.stats?.total || 0,
                sharedWithMeCount: tasksData.stats?.sharedWithMeCount || 0,
                sharedByMeCount: tasksData.stats?.sharedByMeCount || 0
            });
        } catch (error) {
            setError('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    }, [selectedProject]);

    // Fetch projects
    const fetchProjects = useCallback(async () => {
        try {
            const token = auth.getToken();
            if (!token) return;

            const response = await api.getProjects(token);
            setProjects(response.projects || []);
        } catch (error) {
            console.error('Failed to load projects');
        }
    }, []);

    // Create project
    const createProject = useCallback(async (projectData: { name: string; color: string }) => {
        try {
            const token = auth.getToken();
            if (!token) return;

            const response = await api.createProject(token, projectData);
            setProjects(prev => [response.project, ...prev]);
            return response.project;
        } catch (error) {
            throw error;
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

    // Filter tasks with useCallback
    const filterTasks = useCallback(() => {
        let filtered = [...tasks];

        if (urgencyFilter !== 'ALL') {
            filtered = filtered.filter(task => task.urgency === urgencyFilter);
        }
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(task =>
                task.title?.toLowerCase().includes(searchLower) ||
                task.description?.toLowerCase().includes(searchLower)
            );
        }
        setFilteredTasks({
            TODO: filtered.filter(task => task.status === 'TODO'),
            IN_PROGRESS: filtered.filter(task => task.status === 'IN_PROGRESS'),
            DONE: filtered.filter(task => task.status === 'DONE')
        });
    }, [tasks, search, urgencyFilter]);

    // Event handlers with useCallback
    const handleCreateTask = useCallback(async (taskData: { title: string; description?: string; deadline?: string }) => {
        try {
            const token = auth.getToken();
            if (!token) return;

            await api.createTask(token, {
                ...taskData,
                projectId: selectedProject !== 'ALL' ? selectedProject : undefined
            });

            setSuccess('Task created successfully!');
            setShowCreateModal(false);
            fetchTasks();
        } catch (error) {
            setError('Failed to create task');
        }
    }, [fetchTasks, selectedProject]);

    //  URGENCY FILTER OPTIONS
    const urgencyOptions = [
        { value: 'ALL', label: 'All Priorities', color: 'text-gray-400' },
        { value: 'CRITICAL', label: '🔴 Critical', color: 'text-red-500' },
        { value: 'HIGH', label: '🟠 High', color: 'text-orange-500' },
        { value: 'MEDIUM', label: '🟡 Medium', color: 'text-yellow-500' },
        { value: 'LOW', label: '🟢 Low', color: 'text-green-500' },
    ];

    // Project handlers
    const handleProjectSelect = useCallback(async (projectId: string) => {
        setProjectLoading(true); // Start loading
        setSelectedProject(projectId);

        try {
            await fetchTasks(); // This will refetch tasks for the new project
        } catch (error) {
            setError('Failed to load project tasks');
        } finally {
            setProjectLoading(false); // Stop loading
        }
    }, [fetchTasks]);

    const handleCreateProject = useCallback(async (projectData: { name: string; color: string }) => {
        try {
            await createProject(projectData);
            setSuccess('Project created successfully!');
            setShowCreateProjectModal(false);
        } catch (error) {
            setError('Failed to create project');
        }
    }, [createProject]);

    const toggleCreateModal = useCallback(() => setShowCreateModal(prev => !prev), []);
    const toggleAnalytics = useCallback(() => setShowAnalytics(prev => !prev), []);
    const toggleAISuggestions = useCallback(() => setShowAISuggestions(prev => !prev), []);
    const toggleExportModal = useCallback(() => setShowExportModal(prev => !prev), []);
    const toggleDropdown = useCallback(() => setShowDropdown(prev => !prev), []);
    const toggleCreateProjectModal = useCallback(() => setShowCreateProjectModal(prev => !prev), []);

    const handleSearchChange = useCallback((value: string) => setSearch(value), []);

    useEffect(() => {
        if (!auth.isAuthenticated()) {
            router.push('/login');
            return;
        }

        // Mark token as ready after short delay
        const timer = setTimeout(() => setIsTokenReady(true), 50);
        return () => clearTimeout(timer);
    }, [router]);

    // Only fetch data when token is ready
    useEffect(() => {
        if (!isTokenReady) return;

        fetchTasks();
        fetchProjects();
        fetchCurrentUser();
    }, [isTokenReady, fetchTasks, fetchProjects, fetchCurrentUser]);

    useEffect(() => {
        filterTasks();
    }, [filterTasks]);


    // Memoized values
    const kanbanColumns = useMemo(() =>
        ['TODO', 'IN_PROGRESS', 'DONE'].map((status) => ({
            status,
            tasks: filteredTasks[status as keyof typeof filteredTasks],
            statusConfig: statusConfigs[status as keyof typeof statusConfigs]
        }))
        , [filteredTasks, statusConfigs]);

    if (loading) {
        return <TasksPageSkeleton />;
    }

    return (
        <div className="min-h-screen bg-white dark:bg-black flex">
            {/* Sidebar */}
            <Sidebar
                projects={projects}
                selectedProject={selectedProject}
                onProjectSelect={handleProjectSelect}
                onCreateProject={toggleCreateProjectModal}
                stats={stats}
                onShowAnalytics={toggleAnalytics}
                onShowAISuggestions={toggleAISuggestions}
                onShowExportModal={toggleExportModal}
                currentUser={currentUser}
                setProjects={setProjects}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-visible">
                {/* Header */}
                <TasksHeader
                    search={search}
                    onSearchChange={handleSearchChange}
                    urgencyFilter={urgencyFilter}
                    onUrgencyFilterChange={setUrgencyFilter}
                    urgencyOptions={urgencyOptions}
                    onClearUrgencyFilter={() => setUrgencyFilter('ALL')}
                    onCreateTask={toggleCreateModal}
                    currentUser={currentUser}
                    showDropdown={showDropdown}
                    onToggleDropdown={toggleDropdown}
                    onShowProfileSettings={setShowProfileSettings}
                />

                {/* Kanban Board */}
                <main className="flex-1 p-6 overflow-auto">
                    {projectLoading ? (
                        <KanbanSkeleton />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
                            {kanbanColumns.map(({ status, tasks, statusConfig }) => (
                                <KanbanColumn
                                    key={status}
                                    status={status}
                                    tasks={tasks}
                                    statusConfig={statusConfig}
                                    onTaskUpdate={fetchTasks}
                                    hasNewMessages={tasksWithNewMessages}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* Toast Messages */}
            {error && <Toast message={error} type="error" onClose={() => setError('')} />}
            {success && <Toast message={success} type="success" onClose={() => setSuccess('')} />}

            {/* Modals */}
            {showCreateModal && (
                <CreateTaskModal
                    onClose={toggleCreateModal}
                    onCreate={handleCreateTask}
                />
            )}

            <ModalContainer isOpen={showAnalytics} onClose={toggleAnalytics} title="Task Analytics">
                <TaskAnalytics />
            </ModalContainer>

            {showExportModal && (
                <ExportTasksModal
                    isOpen={showExportModal}
                    onClose={toggleExportModal}
                    tasks={tasks}
                />
            )}

            {showAISuggestions && (
                <AISuggestionsModal
                    isOpen={showAISuggestions}
                    onClose={toggleAISuggestions}
                    tasks={tasks}
                />
            )}

            {/* Create Project Modal */}
            <CreateProjectModal
                isOpen={showCreateProjectModal}
                onClose={toggleCreateProjectModal}
                onCreate={handleCreateProject}
            />

            <ProfileSettingsModal
                isOpen={showProfileSettings}
                onClose={() => setShowProfileSettings(false)}
                currentUser={currentUser}
            />
        </div>
    );
}