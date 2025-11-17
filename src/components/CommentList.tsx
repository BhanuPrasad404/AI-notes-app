'use client';
import { TaskComment, User, Reaction, FileAttachment } from '@/types';
import { useRef, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { socketService } from '@/lib/socket';
import ReactionPicker from './ReactionPicker';
import { logger } from '@/lib/logger';

interface CommentListProps {
    comments: TaskComment[];
    currentUser: User;
    typingUsers: User[];
    taskId: string;
}

export default function CommentList({ comments, currentUser, typingUsers, taskId }: CommentListProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [localComments, setLocalComments] = useState<TaskComment[]>(comments);
    const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
    const socketRef = useRef<any>(null);
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [replyingTo, setReplyingTo] = useState<TaskComment | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    //const [currentUser, setCurrentUser] = useState<User | null>(null);

    const canDeleteComment = (comment: TaskComment): boolean => {
        const commentTime = new Date(comment.createdAt).getTime();
        const fiveMinutes = 5 * 60 * 1000;

        return comment.userId === currentUser.id &&
            (currentTime - commentTime) < fiveMinutes;
    };

    const handleCopyComment = async (content: string) => {
        try {
            await navigator.clipboard.writeText(content);
            setIsCopied(true);

            // Reset after 2 seconds
            setTimeout(() => {
                setIsCopied(false);
            }, 2000);

        } catch (err) {
            console.error('Failed to copy text: ', err);

            const textArea = document.createElement('textarea');
            textArea.value = content;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);

            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const handleReply = (comment: TaskComment) => {
        setReplyingTo(comment);
    };

    const handleCancelReply = () => {
        setReplyingTo(null);
        setReplyContent('');
    };

    const handleSubmitReply = async () => {
        if (!replyContent.trim() || !replyingTo) return;
        setReplyingTo(null);

        try {
            const token = auth.getToken();
            if (!token) return;

            // Create TEMPORARY reply
            const tempReply: TaskComment = {
                id: `temp-reply-${Date.now()}`,
                content: replyContent,
                taskId,
                userId: currentUser.id,
                user: currentUser,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                repliedToFileAttachments: replyingTo.fileAttachments || [],
                repliedToCommentId: replyingTo.id,
                repliedToContent: replyingTo.content,
                repliedToUserId: replyingTo.user.id,
                repliedToUserName: replyingTo.user.name,
                repliedToUserEmail: replyingTo.user.email,
                repliedToCreatedAt: replyingTo.createdAt,
                reactions: [],
                reactionSummary: {}
            };
            // Show immediately
            setLocalComments(prev => [...prev, tempReply]);


            // Send to backend
            const response = await api.createTaskComment(token, taskId, {
                content: replyContent,
                repliedToCommentId: replyingTo.id,

            });
            const realReply = response.comment;

            // Send socket
            if (socketRef.current) {
                socketRef.current.emit('task-comment', {
                    taskId,
                    content: replyContent,
                    commentId: realReply.id,
                    fileAttachments: replyingTo.fileAttachments,
                    repliedToCommentId: replyingTo.id,
                    repliedToContent: replyingTo.content,
                    repliedToUserId: replyingTo.user.id,
                    repliedToUserName: replyingTo.user.name,
                    repliedToUserEmail: replyingTo.user.email,
                    repliedToCreatedAt: replyingTo.createdAt,
                    repliedToFileAttachments: replyingTo.fileAttachments || []
                });
            }

            setReplyContent('');

        } catch (error: any) {
            // Remove temp on error
            setLocalComments(prev => prev.filter(c => !c.id.startsWith('temp-reply-')));
            alert('Failed to send reply: ' + error.message);
        }
    };

    // Sync with parent comments
    useEffect(() => {
        setLocalComments(comments);

    }, [comments]);

    // Socket setup
    useEffect(() => {
        socketRef.current = socketService.getSocket();

        if (socketRef.current) {
            // Listen for reaction updates
            socketRef.current.on('reaction-updated', (data: any) => {
                setLocalComments(prev => prev.map(comment => {
                    if (comment.id === data.commentId) {
                        return {
                            ...comment,
                            reactionSummary: data.reactionCounts,
                            reactions: data.allReactions
                        };
                    }
                    return comment;
                }));
            })
            socketRef.current.on('new-task-comment', (data: any) => {

                setLocalComments(prev => {
                    const exists = prev.find(comment => comment.id === data.comment.id);
                    if (exists) return prev;
                    return [...prev, data.comment];
                });
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.off('reaction-updated');
                socketRef.current.off('new-task-comment');
            }
        };
    }, []);
    const getDownloadUrl = (fileUrl: string, filename: string) => {
        // Insert /fl_attachment/ before the version in Cloudinary URL
        return fileUrl.replace('/upload/', '/upload/fl_attachment/');
    };
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const handleReaction = async (commentId: string, emoji: string) => {
        try {
            const token = auth.getToken();
            if (!token) return;

            // Check if user already reacted with this emoji
            const comment = localComments.find(c => c.id === commentId);
            const existingReaction = comment?.reactions?.find(
                r => r.userId === currentUser.id && r.emoji === emoji
            );

            if (existingReaction) {
                // Remove reaction
                await api.removeReaction(token, commentId, emoji);
            } else {
                // Add reaction
                setLocalComments(prev => prev.map(comment => {
                    if (comment.id === commentId) {
                        return {
                            ...comment,
                            reactionSummary: {
                                ...comment.reactionSummary,
                                [emoji]: (comment.reactionSummary?.[emoji] || 0) + 1
                            }
                        };
                    }
                    return comment;
                }));
                await api.addReaction(token, commentId, emoji);
            }
        } catch (error: any) {
            logger.error('Reaction error:', { error });
            alert('Failed to update reaction: ' + error.message);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: diffDays > 365 ? 'numeric' : undefined
        });
    };
    const handleDeleteComment = async (commentId: string) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        setDeletingCommentId(commentId);
        try {
            const token = auth.getToken();
            if (!token) return;

            await api.deleteTaskComment(token, commentId);
            if (socketRef.current) {
                socketRef.current.emit('comment-deleted', {
                    taskId,
                    commentId
                });
            }
        } catch (error: any) {
            logger.error('Delete comment error:', { error });
            alert(error.message || 'Failed to delete comment');
        } finally {
            setDeletingCommentId(null);
        }
    };
    const getUserInitials = (name: string, email: string) => {
        if (name) {
            return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }
        return email.substring(0, 2).toUpperCase();
    };

    const getAvatarColor = (userId: string) => {
        const colors = [
            'bg-gradient-to-br from-blue-500 to-blue-600',
            'bg-gradient-to-br from-green-500 to-green-600',
            'bg-gradient-to-br from-purple-500 to-purple-600',
            'bg-gradient-to-br from-orange-500 to-orange-600',
            'bg-gradient-to-br from-pink-500 to-pink-600',
        ];
        const index = userId.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const getReactionTooltip = (comment: TaskComment): string => {
        if (!comment.reactions || comment.reactions.length === 0) return '';

        const userReactions = comment.reactions.map(reaction =>
            `${reaction.user?.name || reaction.user?.email.split('@')[0]} ${reaction.emoji}`
        );
        return userReactions.join(', ');
    };

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight - containerRef.current.clientHeight;
        }
    }, [localComments, typingUsers]);

    return (
        <div ref={containerRef} className="flex flex-col space-y-4 max-h-96 overflow-y-auto px-4 py-3"
            style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#D1D5DB transparent'
            }}>

            {localComments.map((comment) => (
                <div key={comment.id} className={`flex space-x-3 group ${comment.userId === currentUser.id ? 'flex-row-reverse space-x-reverse' : ''}`}>

                    {/* Avatar */}
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 ${getAvatarColor(comment.user.id)} rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-medium flex-shrink-0 shadow-lg`}>
                        {comment?.user.avatarUrl ? (
                            <img
                                src={comment.user.avatarUrl}
                                alt="User avatar"
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                                {getUserInitials(comment?.user.name || '', comment?.user.email)}
                            </div>
                        )}
                    </div>

                    {/* Comment Content */}
                    <div className={`flex-1 min-w-0 ${comment.userId === currentUser.id ? 'flex flex-col items-end' : ''}`}>

                        {comment.repliedToCommentId && (
                            <div className={`mb-2 p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl sm:rounded-2xl border-l-4 border-blue-400 shadow-sm max-w-full sm:max-w-md ${comment.userId === currentUser.id ? 'ml-auto' : ''}`}>
                                <div className="flex items-center text-xs text-blue-700 dark:text-blue-300 mb-1">
                                    <span className="font-semibold truncate">
                                        {comment.repliedToUserName || comment.repliedToUserEmail?.split('@')[0]}
                                    </span>
                                    <span className="mx-2">•</span>
                                    <span className="flex-shrink-0">{formatTime(comment.repliedToCreatedAt!)}</span>
                                </div>

                                {comment.repliedToFileAttachments && comment.repliedToFileAttachments.length > 0 && (
                                    <div className="flex gap-1 mb-2">
                                        {comment.repliedToFileAttachments.slice(0, 3).map((file, index) => (
                                            file.fileType.startsWith('image/') ? (
                                                <img
                                                    key={index}
                                                    src={file.fileUrl}
                                                    alt="Preview"
                                                    className="w-6 h-6 sm:w-8 sm:h-8 object-cover rounded border border-blue-200"
                                                />
                                            ) : (
                                                <div key={index} className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 border border-blue-200 rounded flex items-center justify-center">
                                                    <span className="text-xs">
                                                        {file.fileType.includes('pdf') ? '📄' : '📎'}
                                                    </span>
                                                </div>
                                            )
                                        ))}
                                        {comment.repliedToFileAttachments.length > 3 && (
                                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 border border-blue-200 rounded flex items-center justify-center">
                                                <span className="text-xs text-blue-600">+{comment.repliedToFileAttachments.length - 3}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-100 line-clamp-2 break-words">
                                    {comment.repliedToContent}
                                </p>
                            </div>
                        )}

                        {/* Message Bubble */}
                        <div className={`relative inline-block max-w-full sm:max-w-md ${comment.userId === currentUser.id ? 'text-right' : 'text-left'}`}>
                            <div className={`px-3 py-2 sm:px-4 sm:py-3 rounded-2xl sm:rounded-3xl shadow-lg transition-all duration-300 ${comment.userId === currentUser.id
                                ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-br-md sm:rounded-br-md'
                                : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white rounded-bl-md sm:rounded-bl-md shadow-md'
                                }`}>

                                {/* Header with Reply Indicator */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 mb-2">
                                    <div className="flex items-center space-x-2 min-w-0">
                                        <span className={`text-xs sm:text-sm font-semibold truncate ${comment.userId === currentUser.id ? 'text-purple-100' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {comment.user.name || comment.user.email.split('@')[0]}
                                        </span>
                                        {/* Show reply indicator if this is a reply */}
                                        {comment.repliedToCommentId && (
                                            <>
                                                <span className="text-gray-400 hidden sm:inline">•</span>
                                                <span className="text-xs text-blue-600 dark:text-blue-400 truncate hidden sm:inline">
                                                    Replying to {comment.repliedToUserName}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <span className={`text-xs ${comment.userId === currentUser.id ? 'text-purple-200' : 'text-gray-500 dark:text-gray-400'} self-end sm:self-auto`}>
                                        {formatTime(comment.createdAt)}
                                    </span>
                                </div>

                                {/* Comment Text */}
                                <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                                    {comment.content}
                                </p>

                                {comment.fileAttachments && comment.fileAttachments.length > 0 && !comment.repliedToCommentId && (
                                    <div className={`mt-2 space-y-2 ${comment.userId === currentUser.id ? 'items-end' : 'items-start'}`}>
                                        {comment.fileAttachments.map((file) => (
                                            <div
                                                key={file.id}
                                                className={`max-w-full ${comment.userId === currentUser.id ? 'ml-auto' : 'mr-auto'}`}
                                            >
                                                {file.fileType.startsWith('image/') ? (
                                                    // Image display - Responsive
                                                    <div className="relative group">
                                                        <img
                                                            src={file.fileUrl}
                                                            alt={file.filename}
                                                            className="rounded-lg shadow-md cursor-pointer hover:opacity-95 transition-opacity max-w-full h-auto"
                                                            onClick={() => window.open(file.fileUrl, '_blank')}
                                                        />
                                                        {/* Download overlay */}
                                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                            <a
                                                                href={file.fileUrl}
                                                                download={file.filename}
                                                                className="p-1 sm:p-2 bg-white bg-opacity-90 rounded-full shadow-lg"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                </svg>
                                                            </a>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // Document display - Responsive
                                                    <a
                                                        href={getDownloadUrl(file.fileUrl, file.filename)}
                                                        download={file.filename}
                                                        className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border transition-all duration-200 hover:shadow-md group ${comment.userId === currentUser.id
                                                            ? 'bg-green-50 border-green-200 hover:bg-green-100 text-green-900'
                                                            : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                                                            }`}
                                                    >
                                                        <span className="text-xl sm:text-2xl flex-shrink-0">
                                                            {file.fileType.includes('pdf') ? '📄' :
                                                                file.fileType.includes('word') ? '📝' :
                                                                    file.fileType.includes('excel') ? '📊' : '📎'}
                                                        </span>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs sm:text-sm font-medium truncate">
                                                                {file.filename}
                                                            </p>
                                                            <p className="text-xs opacity-70">
                                                                {formatFileSize(file.fileSize)} • Click to download
                                                            </p>
                                                        </div>
                                                        <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 opacity-60 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Reactions Section */}
                                {(comment.reactionSummary && Object.keys(comment.reactionSummary).length > 0) && (
                                    <div className={`flex flex-wrap gap-1 mt-2 sm:mt-3 ${comment.userId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                                        {Object.entries(comment.reactionSummary).map(([emoji, count]) => (
                                            <button
                                                key={emoji}
                                                onClick={() => handleReaction(comment.id, emoji)}
                                                title={getReactionTooltip(comment)}
                                                className={`flex items-center space-x-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs transition-all duration-200 hover:scale-110 ${comment.userId === currentUser.id
                                                    ? 'bg-purple-400/30 hover:bg-purple-400/50 backdrop-blur-sm'
                                                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                    }`}
                                            >
                                                <span className="text-sm sm:text-base">{emoji}</span>
                                                <span className={
                                                    comment.userId === currentUser.id ? 'text-purple-100 font-bold' : 'text-gray-600 dark:text-gray-300 font-semibold'
                                                }>
                                                    {count}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Actions - Responsive: Always visible on mobile, hover-only on desktop */}
                            <div className={`flex items-center space-x-1 mt-2 px-2 
                            md:opacity-0 md:group-hover:opacity-100 
                            opacity-100
                            transition-all duration-300 
                            ${comment.userId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                                <button
                                    onClick={() => handleCopyComment(comment.content)}
                                    className="p-1.5 sm:p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 border border-gray-200 dark:border-gray-700"
                                    title={isCopied ? "Copied!" : "Copy text"}
                                >
                                    {isCopied ? (
                                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </button>
                                <ReactionPicker
                                    onSelectReaction={(emoji) => handleReaction(comment.id, emoji)}
                                />

                                <button
                                    onClick={() => handleReply(comment)}
                                    className="p-1.5 sm:p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 border border-gray-200 dark:border-gray-700"
                                    title="Reply"
                                >
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                    </svg>
                                </button>

                                {canDeleteComment(comment) && (
                                    <button
                                        onClick={() => handleDeleteComment(comment.id)}
                                        disabled={deletingCommentId === comment.id}
                                        className="p-1.5 sm:p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 border border-gray-200 dark:border-gray-700 disabled:opacity-50"
                                        title="Delete"
                                    >
                                        {deletingCommentId === comment.id ? (
                                            <div className="w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-red-500 border-solid rounded-full animate-spin"></div>
                                        ) : (
                                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Typing Indicators */}
            {typingUsers.map((user) => (
                <div key={user.id} className="flex space-x-3 opacity-80">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0 shadow-lg">
                        {getUserInitials(user.name || '', user.email)}
                    </div>
                    <div className="flex-1 max-w-md">
                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl rounded-bl-md px-4 py-3 shadow-md">
                            <div className="flex items-center space-x-3">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                                    {user.name || user.email.split('@')[0]} is typing...
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Empty State */}
            {localComments.length === 0 && typingUsers.length === 0 && (
                <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">No messages yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
                        Start the conversation! Send a message to collaborate with your team in real-time.
                    </p>
                </div>
            )}


            {replyingTo && (
                <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 backdrop-blur-sm bg-opacity-95">
                        <div className="flex items-start space-x-3">
                            <div className={`w-8 h-8 ${getAvatarColor(currentUser.id)} rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0 shadow-md`}>
                                {getUserInitials(currentUser.name || '', currentUser.email)}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 mb-2">
                                    <span>Replying to </span>
                                    <span className="font-semibold ml-1">{replyingTo.user.name || replyingTo.user.email.split('@')[0]}</span>
                                </div>
                                <textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="Type your reply..."
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                                    rows={2}
                                    autoFocus
                                />
                                <div className="flex items-center justify-between mt-3">
                                    <button
                                        onClick={handleCancelReply}
                                        className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmitReply}
                                        disabled={!replyContent.trim()}
                                        className="px-6 py-2 text-sm bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                                    >
                                        Send Reply
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}