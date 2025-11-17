// components/CommentInput.tsx
'use client';
import { useState, useRef, useEffect } from 'react';
import { User, FileAttachment } from '@/types';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';

interface CommentInputProps {
  onSendComment: (content: string, fileAttachments?: FileAttachment[]) => void;
  onTyping: (isTyping: boolean) => void;
  currentUser: User;
  taskId: string;
}

export default function CommentInput({ onSendComment, onTyping, currentUser, taskId }: CommentInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    onTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 1000);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);

    try {
      const token = auth.getToken();
      if (!token) return;

      // Show immediate preview using local file URLs
      const localFilePreviews = files.map(file => ({
        id: `local-${Date.now()}-${file.name}`,
        filename: file.name,
        fileUrl: URL.createObjectURL(file),
        fileSize: file.size,
        fileType: file.type,
        userId: currentUser.id,
        createdAt: new Date().toISOString(),
        isLocal: true // Mark as local preview
      }));
      setAttachments(prev => [...prev, ...localFilePreviews]);
      //Upload files to server
      for (const file of files) {
        try {
          const formData = new FormData();
          formData.append('file', file);

          const result = await api.uploadFile(token, formData);

          if (result.success) {
            // Replace local preview with server file
            setAttachments(prev => prev.map(att =>
              att.id.startsWith('local-') && att.filename === file.name
                ? result.fileAttachment
                : att
            ));
          }
        } catch (error) {
         logger.error('Failed to upload file:', { fileName: file.name, error });
          // Remove failed upload from preview
          setAttachments(prev => prev.filter(att =>
            !(att.id.startsWith('local-') && att.filename === file.name)
          ));
        }
      }
    } catch (error) {
    logger.error('Upload error:', { error });
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAttachment = (fileId: string) => {
    setAttachments(prev => prev.filter(file => file.id !== fileId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && attachments.length === 0) return;

    // Clear typing indicator
    onTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send message with attachments  trim to empty string
    const contentToSend = message.trim() || " "; // Send space if empty
    onSendComment(contentToSend, attachments);

    // Reset form
    setMessage('');
    setAttachments([]);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel')) return '📊';
    if (fileType.includes('zip')) return '📦';
    return '📎';
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
      {/* File Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Attachments ({attachments.length})
            </span>
            <button
              onClick={() => setAttachments([])}
              className="text-xs text-red-500 hover:text-red-700 font-medium"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-2">
            {attachments.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <span className="text-xl flex-shrink-0">
                    {getFileIcon(file.fileType)}
                  </span>

                  {file.fileType.startsWith('image/') ? (
                    <div className="relative group">
                      <img
                        src={file.fileUrl}
                        onClick={() => window.open(file.fileUrl, '_blank')}
                        alt={file.filename}
                        className="rounded-lg shadow-md cursor-pointer hover:opacity-95 transition-opacity max-w-full h-auto"

                      />
                      {/* Download overlay - only show for server files */}
                      {!file.isLocal && (
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <a
                            href={file.fileUrl}
                            download={file.filename}
                            className="p-2 bg-white bg-opacity-90 rounded-full shadow-lg"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <a
                      href={file.fileUrl} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 hover:shadow-md"
                    >
                      <span className="text-2xl flex-shrink-0">
                        {file.fileType.includes('pdf') ? '📄' :
                          file.fileType.includes('word') ? '📝' :
                            file.fileType.includes('excel') ? '📊' : '📎'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {file.filename}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(file.fileSize)} • {file.fileType.split('/')[1]?.toUpperCase() || 'FILE'}
                        </p>
                      </div>
                    </a>
                  )}
                </div>
                <button
                  onClick={() => removeAttachment(file.id)}
                  className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 flex-shrink-0 disabled:opacity-50"
        >
          {uploading ? (
            <div className="w-5 h-5 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
          ) : (
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="fileGradient" x1="0" y1="0" x2="24" y2="24">
                  <stop offset="0%" stopColor="#6ed334ff" />
                  <stop offset="50%" stopColor="#3c4b51ff" />
                  <stop offset="100%" stopColor="#064bd4ff" />
                </linearGradient>
              </defs>
              <path
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                stroke="url(#fileGradient)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
        {/* Message Input - Good UI style*/}
        <div className="flex-1 relative">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2 border border-transparent focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/30 transition-all duration-200">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={attachments.length > 0 ? "Add a caption..." : "Type a message..."}
              className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none resize-none max-h-32 transition-all duration-200 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
              rows={1}
            />
          </div>
        </div>

        {/* Send Button - WhatsApp Style */}
        {(message.trim() || attachments.length > 0) && (
          <button
            type="submit"
            disabled={uploading}
            className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        )}
      </form>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.ppt,.pptx"
      />

      {/* Uploading Indicator */}
      {uploading && (
        <div className="mt-2 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="w-3 h-3 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
          <span>Uploading files...</span>
        </div>
      )}
    </div>
  );
}