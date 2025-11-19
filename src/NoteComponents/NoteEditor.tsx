// NoteComponents/NoteEditor.tsx
'use client';
import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Note, NoteAttachment } from '@/types';
import LiveCursors from './LiveCursors';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { jwtDecode } from 'jwt-decode';
import { TagManager } from '../NoteComponents/TagManager';
import React from 'react';

// Memoized Icons to prevent re-renders
const Icons = {
    Edit: React.memo(() => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>),
    AI: React.memo(() => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>),
    Code: React.memo(() => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>),
    Attachment: React.memo(() => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>),
    Close: React.memo(() => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>),
    Download: React.memo(() => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>),
};

interface NoteEditorProps {
    content: string;
    setContent: (content: string) => void;
    isEditing: boolean;
    canEdit: boolean;
    liveCursors: any[];
    note: Note;
    socketRef: any;
    typingTimeoutRef: any;
    onMouseMove: (event: React.MouseEvent) => void;
    onNoteUpdate?: (updatedNote: Note) => void;
}

interface TemporaryAttachment extends NoteAttachment {
    isTemp: boolean;
    file?: File;
}

//  Memoized utility functions
const decodeAllHtmlEntities = (text: string): string => {
    const entities: { [key: string]: string } = {
        '&amp;': '&', '&lt;': '<', '&gt;': '>', '&#96;': '`',
        '&quot;': '"', '&#x27;': "'", '&#x2F;': '/', '&#x5C;n': '\\n',
    };
    return text.replace(/&(?:amp|lt|gt|quot|#96|#x27|#x2F|#x5Cn|#39);/g, match => entities[match] || match);
};

// Memoized FilePreview component to prevent re-renders
const FilePreview = React.memo(function FilePreview({
    attachment,
    onDelete,
    canEdit
}: {
    attachment: TemporaryAttachment;
    onDelete?: () => void;
    canEdit: boolean;
}) {

    const getDownloadUrl = (fileUrl: string, filename: string) => {

        return fileUrl.replace('/upload/', '/upload/fl_attachment/');
    };
    const isImage = attachment.fileType?.startsWith('image/');
    const fileUrl = attachment.fileUrl;
    const downloadUrl = getDownloadUrl(fileUrl, attachment.filename);

    const handleFileClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        if (!attachment.isTemp) {
            // For images, open in new tab; for documents, download
            if (isImage) {
                window.open(fileUrl, '_blank');
            } else {

                window.open(downloadUrl, '_blank');
            }
        }
    }, [attachment.isTemp, fileUrl, downloadUrl, isImage]);

    const handleDownload = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (!attachment.isTemp) {
            // Create download link for all file types
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = attachment.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }, [attachment.isTemp, downloadUrl, attachment.filename]);


    const handleDelete = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete?.();
    }, [onDelete]);

    if (isImage) {
        return (
            <div className="relative group">
                <img
                    src={fileUrl}
                    alt={attachment.filename}
                    className="w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={handleFileClick}
                />
                {canEdit && onDelete && (
                    <button
                        onClick={handleDelete}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Icons.Close />
                    </button>
                )}
                {attachment.isTemp && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                        <div className="text-white text-sm">Uploading...</div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 max-w-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${!attachment.isTemp ? 'cursor-pointer' : ''}`}
            onClick={!attachment.isTemp ? handleFileClick : undefined}>
            <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Icons.Attachment />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {attachment.filename}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(attachment.fileSize / 1024 / 1024).toFixed(1)} MB
                    {attachment.isTemp && ' • Uploading...'}
                </p>
            </div>
            <div className="flex items-center gap-2">
                {!attachment.isTemp && (
                    <button
                        onClick={handleDownload}
                        className="p-2 text-blue-500 hover:text-blue-700 transition-colors"
                        title="Open file"
                    >
                        <Icons.Download />
                    </button>
                )}
                {canEdit && onDelete && (
                    <button
                        onClick={handleDelete}
                        className="p-2 text-red-500 hover:text-red-700 transition-colors"
                        title="Delete file"
                    >
                        <Icons.Close />
                    </button>
                )}
            </div>
        </div>
    );
});

//  Memoized content parser with useMemo
const useContentParser = (content: string) => {
    return useMemo(() => {
        const decodedContent = decodeAllHtmlEntities(content);
        const lines = decodedContent.split('\n');
        const elements = [];
        let i = 0;

        while (i < lines.length) {
            const line = lines[i];

            if (line.startsWith('# ')) {
                elements.push(<h1 key={i} className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white tracking-tight">{line.replace('# ', '')}</h1>);
                i++;
            } else if (line.startsWith('## ')) {
                elements.push(<h2 key={i} className="text-xl font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-200 tracking-tight">{line.replace('## ', '')}</h2>);
                i++;
            } else if (line.startsWith('### ')) {
                elements.push(<h3 key={i} className="text-lg font-medium mt-4 mb-2 text-gray-700 dark:text-gray-300">{line.replace('### ', '')}</h3>);
                i++;
            } else if (line.startsWith('```')) {
                const language = line.replace('```', '').trim() || 'javascript';
                const codeLines = [];
                i++;
                while (i < lines.length && !lines[i].startsWith('```')) {
                    codeLines.push(lines[i]);
                    i++;
                }
                const codeContent = codeLines.join('\n');
                elements.push(
                    <div key={i} className="my-6">
                        <div className="flex items-center justify-between bg-gray-800 text-gray-200 px-4 py-2 rounded-t-lg">
                            <span className="text-sm font-medium">{language}</span>
                            <button
                                onClick={() => navigator.clipboard.writeText(codeContent)}
                                className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition-colors"
                            >
                                Copy
                            </button>
                        </div>
                        <SyntaxHighlighter
                            language={language}
                            style={vscDarkPlus}
                            customStyle={{
                                margin: 0,
                                borderRadius: '0 0 8px 8px',
                                fontSize: '14px'
                            }}
                            showLineNumbers
                        >
                            {codeContent}
                        </SyntaxHighlighter>
                    </div>
                );
                i++;
            } else if (line.startsWith('> ')) {
                const quoteLines = [line.replace('> ', '')];
                let j = i + 1;
                while (j < lines.length && lines[j].startsWith('> ')) {
                    quoteLines.push(lines[j].replace('> ', ''));
                    j++;
                }
                elements.push(
                    <blockquote key={i} className="border-l-4 border-orange-400 bg-orange-50 dark:bg-orange-900/20 pl-4 py-2 my-4 italic text-gray-700 dark:text-gray-300">
                        {quoteLines.join(' ')}
                    </blockquote>
                );
                i = j;
            } else if (line.startsWith('- ')) {
                elements.push(
                    <div key={i} className="flex items-start my-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700 dark:text-gray-300 flex-1">{line.replace('- ', '')}</span>
                    </div>
                );
                i++;
            } else {
                let processedLine = line;
                processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                processedLine = processedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
                processedLine = processedLine.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

                if (processedLine.trim() === '') {
                    elements.push(<div key={i} className="h-4"></div>);
                    i++;
                } else if (processedLine.trim().length > 0) {
                    elements.push(
                        <p
                            key={i}
                            className="my-4 text-gray-700 dark:text-gray-300 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: processedLine }}
                        />
                    );
                    i++;
                } else {
                    i++;
                }
            }
        }
        return elements;
    }, [content, decodeAllHtmlEntities]);
};

export default function NoteEditor({
    content,
    setContent,
    isEditing,
    canEdit,
    liveCursors,
    note,
    socketRef,
    typingTimeoutRef,
    onMouseMove,
    onNoteUpdate
}: NoteEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [localAttachments, setLocalAttachments] = useState<TemporaryAttachment[]>(note.attachments || []);
    const [localNote, setLocalNote] = useState(note);

    // Memoized current user ID
    const getCurrentUserId = useCallback((): string | null => {
        const token = auth.getToken();
        if (!token) return null;
        try {
            const decoded: any = jwtDecode(token);
            return decoded.userId;
        } catch (error) {
            console.error('Failed to decode token:', error);
            return null;
        }
    }, []);

    //  Single useEffect for local note state
    useEffect(() => {
        setLocalNote(note);
    }, [note]);

    // Memoized handlers
    const handleTagsUpdate = useCallback((newTags: string[]) => {
        setLocalNote(prev => ({
            ...prev,
            userPreferences: [{
                ...prev.userPreferences?.[0] || { isFavorite: false, personalTags: [] },
                personalTags: newTags
            }]
        }));
    }, []);

    // Single useEffect for attachments
    useEffect(() => {
        setLocalAttachments(note.attachments || []);
    }, [note.attachments]);

    //  Consolidated socket listeners
    useEffect(() => {
        if (!socketRef.current || !note) return;

        const socket = socketRef.current;
        const currentUserId = getCurrentUserId();

        const handleAttachmentAdded = (data: any) => {
            console.log('Attachment added by other user:', data.attachment);
            if (data.updatedBy?.id !== currentUserId) {
                setLocalAttachments(prev => [...prev, data.attachment]);
            }
        };

        const handleAttachmentDeleted = (data: any) => {
            console.log('Attachment deleted by other user:', data.attachmentId);
            if (data.updatedBy?.id !== currentUserId) {
                setLocalAttachments(prev => prev.filter(att => att.id !== data.attachmentId));
            }
        };

        socket.on('attachment-added', handleAttachmentAdded);
        socket.on('attachment-deleted', handleAttachmentDeleted);

        return () => {
            socket.off('attachment-added', handleAttachmentAdded);
            socket.off('attachment-deleted', handleAttachmentDeleted);
        };
    }, [socketRef.current, note, getCurrentUserId]);

    // Memoized file upload handler
    const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const tempAttachments: TemporaryAttachment[] = Array.from(files).map(file => ({
                id: `temp-${Date.now()}-${Math.random()}`,
                filename: file.name,
                fileUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
                fileSize: file.size,
                fileType: file.type,
                noteId: note.id,
                createdAt: new Date().toISOString(),
                isTemp: true,
                file: file
            }));

            setLocalAttachments(prev => [...prev, ...tempAttachments]);

            for (const file of Array.from(files)) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('noteId', note.id);

                const result = await api.uploadNoteFile(token, formData);

                if (result.success) {
                    const serverFileUrl = result.noteAttachment.fileUrl;
                    const newAttachment = {
                        ...result.noteAttachment,
                        fileUrl: serverFileUrl,
                        isTemp: false
                    };

                    setLocalAttachments(prev =>
                        prev.map(att =>
                            att.isTemp && att.filename === file.name ? newAttachment : att
                        )
                    );

                    if (socketRef.current) {
                        socketRef.current.emit('attachment-added', {
                            noteId: note.id,
                            attachment: newAttachment
                        });
                    }
                } else {
                    setLocalAttachments(prev => prev.filter(att => !(att.isTemp && att.filename === file.name)));
                }
            }

            if (onNoteUpdate) {
                const updatedNote = await api.getNote(token, note.id);
                onNoteUpdate(updatedNote.note);
            }

        } catch (error) {
            console.error('Upload error:', error);
            setLocalAttachments(prev => prev.filter(att => !att.isTemp));
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }, [note.id, socketRef, onNoteUpdate]);



    //  Memoized delete handler
    const handleDeleteAttachment = useCallback(async (attachmentId: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            setLocalAttachments(prev => prev.filter(att => att.id !== attachmentId));

            if (socketRef.current) {
                socketRef.current.emit('attachment-deleted', {
                    noteId: note.id,
                    attachmentId: attachmentId
                });
            }

            const attachment = localAttachments.find(att => att.id === attachmentId);
            if (attachment && !attachment.isTemp) {
                await api.deleteAttachment(token, attachmentId);
            }

            if (onNoteUpdate) {
                const updatedNote = await api.getNote(token, note.id);
                onNoteUpdate(updatedNote.note);
            }
        } catch (error) {
            console.error('Delete error:', error);
            if (onNoteUpdate) {
                const token = localStorage.getItem('token');
                if (token) {
                    const updatedNote = await api.getNote(token, note.id);
                    onNoteUpdate(updatedNote.note);
                }
            }
        }
    }, [note.id, socketRef, localAttachments, onNoteUpdate]);

    // Memoized formatting button handlers
    const formattingHandlers = useMemo(() => ({
        addHeading: () => setContent(content + '\n# Heading\n'),
        addList: () => setContent(content + '\n- List item\n'),
        addCode: () => setContent(content + '\n```javascript\n// Your code here\n```\n'),
        addBold: () => setContent(content + ' **bold** '),
        addItalic: () => setContent(content + ' *italic* '),
        addLink: () => setContent(content + ' [link](https://) '),
        addQuote: () => setContent(content + '\n> Quote\n'),
    }), [content, setContent]);

    // Memoized parsed content
    const parsedContent = useContentParser(content);

    //  Memoized toolbar buttons to prevent re-renders
    const toolbarButtons = useMemo(() => [
        { key: 'heading', label: 'Heading', icon: 'heading', onClick: formattingHandlers.addHeading, gradient: 'from-purple-500 to-pink-500' },
        { key: 'list', label: 'List', icon: 'list', onClick: formattingHandlers.addList, gradient: 'from-green-500 to-emerald-500' },
        { key: 'code', label: 'Code', icon: 'code', onClick: formattingHandlers.addCode, gradient: 'from-blue-500 to-cyan-500' },
        { key: 'attach', label: uploading ? 'Uploading...' : 'Attach', icon: 'attachment', onClick: () => fileInputRef.current?.click(), gradient: 'from-indigo-500 to-purple-500', disabled: uploading },
    ], [formattingHandlers, uploading]);

    const formatButtons = useMemo(() => [
        { key: 'bold', label: 'B', onClick: formattingHandlers.addBold, gradient: 'from-gray-600 to-gray-700' },
        { key: 'italic', label: 'I', onClick: formattingHandlers.addItalic, gradient: 'from-gray-500 to-gray-600' },
        { key: 'link', label: 'link', onClick: formattingHandlers.addLink, gradient: 'from-indigo-500 to-purple-500', icon: true },
        { key: 'quote', label: 'quote', onClick: formattingHandlers.addQuote, gradient: 'from-orange-500 to-amber-500', icon: true },
    ], [formattingHandlers]);

    return (
        <div
            ref={editorRef}
            className="bg-white dark:bg-black rounded-xl min-h-[70vh] relative
                bg-gradient-to-br from-white via-pink-50 to-purple-50 dark:from-gray-900 dark:via-pink-900/20 dark:to-purple-900/20
                border-2 border-pink-200/50 dark:border-pink-500/20
                shadow-[0_0_80px_-20px_rgba(236,72,153,0.4)] dark:shadow-[0_0_80px_-20px_rgba(236,72,153,0.3)]
                hover:shadow-[0_0_100px_-15px_rgba(236,72,153,0.6)] dark:hover:shadow-[0_0_100px_-15px_rgba(236,72,153,0.4)]
                transition-all duration-700 ease-out
                relative overflow-hidden"
            onMouseMove={onMouseMove}
        >
            <LiveCursors cursors={liveCursors} />

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt,.zip,.ppt,.pptx,.xls,.xlsx"
                className="hidden"
            />

            {isEditing && canEdit ? (
                <div className="p-6 md:p-8 relative z-0">
                    {/*  Memoized toolbar */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <TagManager note={localNote} onTagsUpdate={handleTagsUpdate} />

                        <div className="flex flex-wrap items-center gap-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent rounded-2xl">
                            {toolbarButtons.map(({ key, label, icon, onClick, gradient, disabled }) => (
                                <button
                                    key={key}
                                    onClick={onClick}
                                    disabled={disabled}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r ${gradient} hover:${gradient.replace('500', '600')} text-white shadow-lg transition-all duration-200 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed`}
                                    title={label}
                                >
                                    {icon === 'heading' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>}
                                    {icon === 'list' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>}
                                    {icon === 'code' && <Icons.Code />}
                                    {icon === 'attachment' && <Icons.Attachment />}
                                    <span className="hidden xs:inline">{label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            {formatButtons.map(({ key, label, onClick, gradient, icon }) => (
                                <button
                                    key={key}
                                    onClick={onClick}
                                    className={`flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r ${gradient} hover:${gradient.replace('500', '600')} text-white shadow-lg transition-all duration-200 ${icon ? 'p-2 sm:flex' : 'font-bold text-sm'}`}
                                    title={label}
                                >
                                    {icon ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                    ) : (
                                        label
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {uploading && (
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
                                <p className="text-sm text-blue-700 dark:text-blue-300">Uploading files...</p>
                            </div>
                        </div>
                    )}

                    {localAttachments.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Attachments ({localAttachments.length})
                            </h4>
                            <div className="flex flex-wrap gap-3">
                                {localAttachments.map(attachment => (
                                    <FilePreview
                                        key={attachment.id}
                                        attachment={attachment}
                                        onDelete={() => handleDeleteAttachment(attachment.id)}
                                        canEdit={canEdit}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    <textarea
                        value={decodeAllHtmlEntities(content)}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full min-h-[60vh] bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none resize-none text-[15px] leading-relaxed font-normal relative z-0 caret-blue-500 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent rounded-2xl"
                        placeholder="Start writing... | Use # for headings • - for lists • ``` for code blocks • Click attach button to upload files"
                        style={{
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif',
                            scrollbarWidth: 'thin', scrollbarColor: '#4B5563 transparent'
                        }}
                    />
                </div>
            ) : (
                <div className="p-6 md:p-8 relative z-0">
                    {localAttachments.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Attachments ({localAttachments.length})
                            </h4>
                            <div className="flex flex-wrap gap-3">
                                {localAttachments.map(attachment => (
                                    <FilePreview
                                        key={attachment.id}
                                        attachment={attachment}
                                        canEdit={canEdit}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {content ? (
                        <div className="prose prose-gray dark:prose-invert max-w-none">
                            <div className="text-gray-900 dark:text-gray-100 text-[15px] leading-relaxed font-normal"
                                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif' }}>
                                {parsedContent}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                                <Icons.Edit />
                            </div>
                            <h3 className="text-lg font-medium text-gray-400 dark:text-gray-500 mb-2">Empty note</h3>
                            <p className="text-gray-400 dark:text-gray-500 text-sm">Start writing to create something amazing</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}