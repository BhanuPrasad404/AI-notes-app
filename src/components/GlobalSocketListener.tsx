'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { socketService } from '@/lib/socket';
import { auth } from '@/lib/auth';
import Toast from '@/components/Toast';
import { logger } from '@/lib/logger';

export default function GlobalSocketListener() {
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const router = useRouter();

    useEffect(() => {
        //  FIRST CONNECT THE SOCKET
        logger.info('GlobalSocketListener: Connecting socket...');
        const socket = socketService.connect();

        if (!socket) {
            logger.warn('GlobalSocketListener: Failed to connect socket');
            return;
        }

        logger.info('GlobalSocketListener: Socket connected', { socketId: socket.id });

        // 2. Wait for socket to be fully connected
        socket.on('connect', () => {
            logger.info('GlobalSocketListener: Socket fully connected');
        });

        const getCurrentUserId = () => {
            const token = auth.getToken();
            if (!token) return null;
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                logger.debug('TOKEN DEBUG:', { payload });

                return payload.userId || payload.id || payload.sub || payload.user_id;
            } catch {
                return null;
            }
        };
        // Listen for global share events
        socket.on('global-note-shared', (data: any) => {
            logger.info('GLOBAL: Received global-note-shared', { data });

            const currentUserId = getCurrentUserId();
            logger.debug('Current user ID vs Target ID:', { currentUserId, targetUserId: data.targetUserId });

            if (currentUserId && currentUserId === data.targetUserId) {
                logger.info('This share event is for me!');
                setNotification({
                    message: data.message,
                    type: 'success'
                });

                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        });

        // Listen for global revoke events
        socket.on('global-access-revoked', (data: any) => {
            const currentUserId = getCurrentUserId();

            if (currentUserId && currentUserId === data.targetUserId) {
                setNotification({
                    message: 'Access revoked. Redirecting...',
                    type: 'error'
                });
                // Check if viewing the note
                const currentPath = window.location.pathname;
                const isViewingRevokedNote = currentPath.includes(`/notes/${data.noteId}`);

                if (isViewingRevokedNote) {
                    window.location.href = '/notes';
                }
            }
        });
        socket.on('global-task-shared', (data: any) => {
            logger.info('GLOBAL: Received global-task-shared', { data });

            const currentUserId = getCurrentUserId();
            logger.debug('Current user ID vs Target ID:', { currentUserId, targetUserId: data.targetUserId });

            if (currentUserId && currentUserId === data.targetUserId) {
                logger.info('This TASK share event is for me!');
                setNotification({
                    message: data.message,
                    type: 'success'
                });
            }
        });

        // Listen for global TASK revoke events
        socket.on('global-task-access-revoked', (data: any) => {
            logger.info('GLOBAL: Received global-task-access-revoked', { data });

            const currentUserId = getCurrentUserId();
            logger.debug('Current user ID vs Target ID:', { currentUserId, targetUserId: data.targetUserId });

            if (currentUserId && currentUserId === data.targetUserId) {
                logger.info('This TASK revoke event is for me! Taking immediate action...');
                setNotification({
                    message: data.message || 'Task access has been revoked',
                    type: 'error'
                });
                // Check if we're viewing the revoked task
                const currentPath = window.location.pathname;
                const isViewingRevokedTask = currentPath.includes(`/tasks/${data.taskId}`);

                logger.debug('Current path and viewing status:', { currentPath, isViewingRevokedTask });

                if (isViewingRevokedTask) {
                    // If viewing the revoked task, redirect to shared tasks page
                    logger.info('Currently viewing revoked task - REDIRECTING...');
                    setTimeout(() => {
                        window.location.href = '/tasks/shared-with-me';
                    }, 2000); // Give user 2 seconds to read the toast
                }
            }
        });

        socket.on('global-task-deleted', (data: any) => {
            logger.info('GLOBAL: Received task-deleted event', { data });

            //const currentUserId = getCurrentUserId();
            setNotification({
                message: data.message,
                type: 'error'
            });

            // Redirect if viewing the deleted task
            const currentPath = window.location.pathname;
            const isViewingDeletedTask = currentPath.includes(`/tasks/${data.taskId}`);

            if (isViewingDeletedTask) {
                setTimeout(() => {
                    router.push('/tasks');
                    setTimeout(() => window.location.reload(), 100);
                }, 100);
            } else {
                setTimeout(() => window.location.reload(), 1000);
            }
        });
        // Add this socket listener
        socket.on('global-note-deleted', (data: any) => {
            logger.info('GLOBAL: Received note-deleted event', { data });

            const currentUserId = getCurrentUserId();
            if (currentUserId && currentUserId === data.targetUserId) {
                setNotification({
                    message: data.message,
                    type: 'error'
                });

                // Redirect if viewing the deleted note
                const currentPath = window.location.pathname;
                const isViewingDeletedNote = currentPath.includes(`/notes/${data.noteId}`);

                if (isViewingDeletedNote) {
                    setTimeout(() => {
                        router.push('/notes');
                        setTimeout(() => window.location.reload(), 100);
                    }, 100);
                } else {
                    setTimeout(() => window.location.reload(), 1000);
                }
            }
        });

        // Cleanup
        return () => {
            logger.info('GlobalSocketListener cleaning up');
            socket.off('global-note-shared');
            socket.off('global-access-revoked');
            socket.off('global-note-deleted')
            socket.off('global-task-shared');
            socket.off('global-task-access-revoked');
            socket.off('global-task-deleted');
            socket.off('connect');
        };
    }, [router]);

    if (!notification) return null;

    return (
        <Toast
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
        />
    );
}