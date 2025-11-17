'use client';
import { useState, useEffect, useCallback, lazy, Suspense, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import Toast from '@/components/Toast';
import { Task, CollaborationUser } from '@/types';
import TaskCommentsSection from '@/components/TaskCommentsSection';
import ShareTaskModal from '@/components/ShareTaskModal';

// Lazy loaded components
const TaskHeader = lazy(() => import('../TaskComponents/TaskHeader'));
const TaskDescription = lazy(() => import('../TaskComponents/TaskDescription'));
const TaskSidebar = lazy(() => import('../TaskComponents/TaskSidebar'));

// Loading components
import { HeaderLoader, DescriptionLoader, SidebarLoader } from '../TaskComponents/Loaders';
import { logger } from '@/lib/logger';

export default function SingleTaskPage() {
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState('');
    const [status, setStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO');
    const [permission, setPermission] = useState('VIEW');
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [onlineUsers, setOnlineUsers] = useState<CollaborationUser[]>([]);
    const [typingUsers, setTypingUsers] = useState<CollaborationUser[]>([]);
    const [showShareModal, setShowShareModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const socketRef = useRef<any>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const router = useRouter();
    const params = useParams();
    const taskId = params.id as string;

    // Core logic functions
    const getCurrentUserId = (): string | null => {
        const token = auth.getToken();
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.userId;
        } catch {
            return null;
        }
    };

    const fetchCurrentUser = async () => {
        try {
            const token = auth.getToken();
            if (!token) return null;
            const response = await api.getCurrentUser(token);
            return response.user;
        } catch (error) {
            console.error('Failed to fetch current user:', error);
            return null;
        }
    };

    const fetchTask = async () => {
        try {
            const token = auth.getToken();
            if (!token) return;
            const data = await api.getTask(token, taskId);
            setTask(data.task);
            setTitle(data.task.title);
            setDescription(data.task.description || '');
            setDeadline(data.task.deadline ? new Date(data.task.deadline).toISOString().split('T')[0] : '');
            setStatus(data.task.status as 'TODO' | 'IN_PROGRESS' | 'DONE');
            setPermission(data.task.sharedTasks[0]?.permission || 'VIEW');
        } catch (error) {
            logger.error('Fetch task error:', { error });
            setError('Failed to load task');
        } finally {
            setLoading(false);
        }
    };

    const debouncedSave = useCallback((updates: any) => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(async () => {
            if (!task) return;
            setSaving(true);
            setSaved(false);
            try {
                const token = auth.getToken();
                if (!token) return;
                await api.updateTask(token, taskId, updates);
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            } catch (error: any) {
                logger.error('Save failed:', { error });
                setError('Save failed: ' + error.message);
            } finally {
                setSaving(false);
            }
        }, 1000);
    }, [task, taskId]);

    const handleStatusChange = async (newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
        setStatus(newStatus);
        setSuccess(`Status updated to ${newStatus.replace('_', ' ')}`);
        if (socketRef.current && task) {
            socketRef.current.emit('task-status-update', { taskId: task.id, status: newStatus });
        }
        const token = auth.getToken();
        if (token) {
            try {
                await api.updateTask(token, taskId, { status: newStatus });
            } catch (error) {
                console.error('Failed to update task status:', error);
            }
        }
    };

    const handleDeleteTask = async () => {
        if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) return;
        setDeleting(true);
        if (socketRef.current && task) {
            socketRef.current.emit('current-task-deleted', { taskId: task.id });
        }
        try {
            const token = auth.getToken();
            if (!token) return;
            await api.deleteTask(token, taskId);
            setSuccess('Task deleted successfully!');
            setTimeout(() => router.push('/tasks'), 1500);
        } catch (error: any) {
            setError('Failed to delete task: ' + error.message);
        } finally {
            setDeleting(false);
        }
    };

    const handleShareSuccess = () => {
        setSuccess('Task shared successfully!');
        fetchTask();
    };

    const isOwner = task?.user?.id === getCurrentUserId() || permission === 'EDIT';

    //Socket and typing handlers
    const handleTyping = (isTyping: boolean) => {
        if (socketRef.current && task) {
            socketRef.current.emit('task-typing', {
                taskId: task.id,
                isTyping: isTyping
            });
        }
    };

    const handleTitleChange = (text: string) => {
        const newTitle = text;
        setTitle(newTitle);
        handleTyping(true);
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
            handleTyping(false);
        }, 1000);
        if (socketRef.current && task) {
            const updates = { title: newTitle };
            socketRef.current.emit('task-update', {
                taskId: task.id,
                updates: updates
            });
        }
    };

    const handleDescriptionChange = (text: string) => {
        setDescription(text);
        handleTyping(true);
        if (task && socketRef.current) {
            socketRef.current.emit('task-update', {
                taskId: task.id,
                updates: { description: text }
            });
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = setTimeout(() => {
                handleTyping(false);
            }, 1000);
        }
    };

    // Effects
    useEffect(() => {
        const loadCurrentUser = async () => {
            const user = await fetchCurrentUser();
            setCurrentUser(user);
        };
        loadCurrentUser();
    }, []);

    useEffect(() => {
        if (!auth.isAuthenticated()) {
            router.push('/login');
            return;
        }
        fetchTask();
    }, [taskId]);

    useEffect(() => {
        if (task && (title !== task.title || description !== task.description || deadline !== task.deadline || status !== task.status)) {
            const updates: any = {};
            if (title !== task.title) updates.title = title;
            if (description !== task.description) updates.description = description;
            const currentDeadlineFormatted = task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '';
            if (deadline !== currentDeadlineFormatted) {
                updates.deadline = deadline ? new Date(deadline + 'T00:00:00.000Z').toISOString() : null;
            }
            if (status !== task.status) updates.status = status;
            if (Object.keys(updates).length > 0) {
                debouncedSave(updates);
            }
        }
    }, [title, description, deadline, status, debouncedSave]);

    // Socket effect (keep this in main file since it's complex)
    useEffect(() => {
        if (!task) return;

        const initializeSocket = async () => {
            try {
                const socketService = await import('@/lib/socket');
                const socket = socketService.socketService.connect();
                socketRef.current = socket;

                if (socket && task) {
                    logger.info('Socket connected:', { socketId: socket.id });
                    socket.emit('join-task', task.id);

                    // Socket event listeners
                    socket.on('user-joined-task', (data: any) => {
                        logger.info('User joined task:', { userName: data.user.name });
                        setOnlineUsers(prev => {
                            const exists = prev.find(u => u.userId === data.user.id);
                            if (exists) return prev;
                            return [...prev, { userId: data.user.id, user: data.user }];
                        });
                        setSuccess(`${data.user.name} joined the task`);
                        setTimeout(() => setSuccess(''), 6000);
                    });

                    socket.on('task-collaborators', (data: any) => {
                        logger.info('Current task collaborators:', { collaborators: data.collaborators });
                        if (data.collaborators && Array.isArray(data.collaborators)) {
                            const currentUserId = getCurrentUserId();
                            const otherUsers = data.collaborators.filter((collab: any) => collab.id !== currentUserId);
                            setOnlineUsers(otherUsers.map((collab: any) => ({
                                userId: collab.id,
                                user: collab
                            })));
                        }
                    });

                    socket.on('user-left-task', (data: any) => {
                        logger.info('User left task:', { userId: data.userId });
                        setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
                        setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
                        setSuccess(`${data.user} left the task`);
                        setTimeout(() => setSuccess(''), 5000);
                    });

                    socket.on('task-status-changed', (data: any) => {
                        logger.info('Task updated by:', { updatedBy: data.updatedBy.name });
                        const currentUserId = getCurrentUserId();
                        if (data.updatedBy.id !== currentUserId) {
                            setStatus(data.status);
                            setSuccess(`${data.updatedBy.name} changed status to ${data.status}`);
                            setTimeout(() => setSuccess(''), 5000);
                        }
                    });

                    socket.on('task-updated', (data: any) => {
                        logger.info('Task updated by:', { updatedBy: data.updatedBy.name });
                        const currentUserId = getCurrentUserId();
                        const updatedById = String(data.updatedBy.id);
                        const currentId = String(currentUserId);
                        if (updatedById !== currentId) {
                            if (data.updates.title) setTitle(data.updates.title);
                            if (data.updates.description !== undefined) setDescription(data.updates.description);
                            if (data.updates.deadline !== undefined) {
                                setDeadline(data.updates.deadline ?
                                    new Date(data.updates.deadline).toISOString().split('T')[0] : '');
                            }
                        }
                    });

                    socket.on('user-task-typing', (data: any) => {
                        console.log(' User typing:', data.user.name, data.isTyping);
                        setTypingUsers(prev => {
                            const filtered = prev.filter(u => u.userId !== data.userId);
                            if (data.isTyping) {
                                return [...filtered, { userId: data.userId, user: data.user }];
                            }
                            return filtered;
                        });
                    });

                    socket.on('task-assignment-changed', (data: any) => {
                        setSuccess(`${data.assignedBy.name} assigned task to ${data.assignedTo.name}`);
                        setTimeout(() => setSuccess(''), 6000);
                        fetchTask();
                    });

                    socket.on('task-deleted', (data: any) => {

                        setSuccess(data.message);
                        const currentPath = window.location.pathname;
                        const isViewingDeletedTask = currentPath.includes(`/tasks/${data.taskId}`);
                        if (isViewingDeletedTask) {
                            setTimeout(() => {
                                router.push('/tasks/shared-with-me');
                                setTimeout(() => window.location.reload(), 600);
                            }, 1000);
                        } else {
                            setTimeout(() => window.location.reload(), 1000);
                        }
                    });

                    // Socket errors
                    socket.on('task-error', (data: any) => setError(data.error || 'Socket error occurred'));
                    socket.on('task-update-error', (data: any) => setError(data.error || 'Failed to update task'));
                    socket.on('task-access-denied', (data: any) => setError('You do not have permission to edit this task'));
                }
            } catch (error) {
                console.error(' Failed to load socket service:', error);
                setError('Failed to establish real-time connection');
            }
        };

        if (task) {
            initializeSocket();
        }

        return () => {
            const token = auth.getToken();
            if (task && token) {

                api.updateTaskLastRead(token, task.id)
                    .then(() => console.log(' Task marked as read'))
                    .catch(err => console.error(' Failed to mark task as read:', err));
            }
            if (socketRef.current && task) {

                socketRef.current.emit('leave-task', task.id);
                socketRef.current.disconnect();
            }
        };
    }, [task]);

    useEffect(() => {
        if (socketRef.current && task) {

            socketRef.current.emit('join-task', task.id);
        }
    }, [task]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-400">Loading task...</p>
                </div>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Task Not Found</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">This task doesn't exist or you don't have permission to access it.</p>
                    <button onClick={() => router.push('/tasks')} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-all duration-200 font-medium">
                        Back to Tasks
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            {error && <Toast message={error} type="error" onClose={() => setError('')} />}
            {success && <Toast message={success} type="success" onClose={() => setSuccess('')} />}

            {/* LAZY LOADED HEADER */}
            <Suspense fallback={<HeaderLoader />}>
                <TaskHeader
                    title={title}
                    isEditing={isEditing}
                    onTitleChange={handleTitleChange}
                    isOwner={isOwner}
                    onEditToggle={() => setIsEditing(!isEditing)}
                    onShareClick={() => setShowShareModal(true)}
                    status={status}
                    urgency={task.urgency}
                    onlineUsers={onlineUsers}
                    typingUsers={typingUsers}
                    saving={saving}
                    saved={saved}
                />
            </Suspense>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* LAZY LOADED DESCRIPTION */}
                        <Suspense fallback={<DescriptionLoader />}>
                            <TaskDescription
                                description={description}
                                isEditing={isEditing}
                                isOwner={isOwner}
                                onDescriptionChange={handleDescriptionChange}
                                onEditToggle={() => setIsEditing(!isEditing)}
                            />
                        </Suspense>

                        {/* COMMENTS SECTION */}
                        {currentUser && (
                            <TaskCommentsSection
                                taskId={taskId}
                                currentUser={currentUser}
                                onlineUsers={onlineUsers}
                            />
                        )}
                    </div>

                    {/* LAZY LOADED SIDEBAR */}
                    <Suspense fallback={<SidebarLoader />}>
                        <TaskSidebar
                            task={task}
                            status={status}
                            onStatusChange={handleStatusChange}
                            isOwner={isOwner}
                            onShareClick={() => setShowShareModal(true)}
                            onDeleteTask={handleDeleteTask}
                            deleting={deleting}
                            deadline={deadline}
                            isEditing={isEditing}
                            onDeadlineChange={setDeadline}
                        />
                    </Suspense>
                </div>
            </main>

            {/* SHARE MODAL */}
            {showShareModal && (
                <ShareTaskModal
                    taskId={taskId}
                    isOpen={showShareModal}
                    onClose={() => setShowShareModal(false)}
                    onShareSuccess={handleShareSuccess}
                    taskTitle={task.title}
                />
            )}
        </div>
    );
}