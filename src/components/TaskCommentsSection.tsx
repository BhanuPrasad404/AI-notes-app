'use client';
import { useState, useEffect, useRef } from 'react';
import { FileAttachment, TaskComment, User } from '@/types';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import CommentList from './CommentList';
import CommentInput from './CommentInput';
import { socketService } from '@/lib/socket';
import { logger } from '@/lib/logger';

interface TaskCommentsSectionProps {
  taskId: string;
  currentUser: User;
  onlineUsers: any[];
}

export default function TaskCommentsSection({
  taskId,
  currentUser,
  onlineUsers
}: TaskCommentsSectionProps) {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typingUsers, setTypingUsers] = useState<User[]>([]);
  const socketRef = useRef<any>(null);

  // Load comments on mount
  useEffect(() => {
    fetchComments();
    setupSocketListeners();
    return () => {
      if (socketRef.current) {
        socketRef.current.off('new-task-comment');
        socketRef.current.off('user-comment-typing');
        socketRef.current.emit('comment-typing', { taskId, isTyping: false });
      }
    };
  }, [taskId]);

  const fetchComments = async () => {
    try {
      const token = auth.getToken();
      if (!token) return;

      const data = await api.getTaskComments(token, taskId);
      setComments(data.comments || []);
    } catch (err: any) {
      setError('Failed to load comments');
      logger.error('Fetch comments error:', { error: err });
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    const socket = socketService.getSocket();
    socketRef.current = socket;

    if (socketRef.current) {
      socketRef.current.emit('join-task', taskId);
      socketRef.current.on('new-task-comment', (data: any) => {
        setComments(prev => {
          const exists = prev.find(comment => comment.id === data.comment.id);
          if (exists) return prev;
          return [...prev, data.comment];
        });
      });

      socketRef.current.on('user-comment-typing', (data: any) => {
        if (data.isTyping) {
          setTypingUsers(prev => {
            const filtered = prev.filter(user => user.id !== data.user.id);
            return [...filtered, data.user];
          });
        } else {
          setTypingUsers(prev => prev.filter(user => user.id !== data.user.id));
        }
      });

      socketRef.current.on('comment-delete-confirmed', (data: any) => {
        setComments(prev => prev.filter(comment => comment.id !== data.commentId));
      });

      socketRef.current.on('reaction-updated', (data: any) => {
        setComments(prev => prev.map(comment => {
          if (comment.id === data.commentId) {
            return {
              ...comment,
              reactionSummary: data.reactionCounts,
              reactions: data.allReactions
            };
          }
          return comment;
        }));
      });
    }
  };

  const handleNewComment = async (content: string, fileAttachments?: FileAttachment[]) => {
   
    try {
      const token = auth.getToken();
      if (!token) return;

      // Create temp comment WITH file attachments
      const tempComment: TaskComment = {
        id: `temp-${Date.now()}`,
        content,
        taskId,
        userId: currentUser.id,
        user: currentUser,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reactions: [],
        reactionSummary: {},
        fileAttachments: fileAttachments || [] 
      };

      setComments(prev => [...prev, tempComment]);

      // Extract file IDs for backend
      const fileIds = fileAttachments?.map(file => file.id) || [];

      // Send to backend WITH file IDs
      const response = await api.createTaskComment(token, taskId, {
        content,
        fileIds 
      });

      const realComment = response.comment;

      setComments(prev => prev.map(comment =>
        comment.id === tempComment.id ? realComment : comment
      ));

      if (socketRef.current) {
        socketRef.current.emit('task-comment', {
          taskId,
          content,
          commentId: realComment.id,
          fileAttachments: realComment.fileAttachments 
        });
      }

    } catch (err: any) {
      setComments(prev => prev.filter(c => !c.id.startsWith('temp-')));
      setError('Failed to send comment');
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (socketRef.current) {
      socketRef.current.emit('comment-typing', {
        taskId,
        isTyping
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300 ">
      {/* Modern Header */}
      <div className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-t-2xl px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900  text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Team Discussion
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {comments.length} message{comments.length !== 1 ? 's' : ''} • Real-time chat
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Live</span>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="p-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent rounded-2xl">
        <CommentList
          comments={comments}
          currentUser={currentUser}
          typingUsers={typingUsers}
          taskId={taskId}
        />
      </div>

      {/* Comment Input */}
      <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
        <CommentInput
          onSendComment={handleNewComment}
          onTyping={handleTyping}
          currentUser={currentUser}
          taskId={taskId}

        />
      </div>

      {error && (
        <div className="mx-4 mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}