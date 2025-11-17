'use client';
import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { AIResponse } from '@/types';

const Icons = {
    AI: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    ),
    Loader: () => (
        <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V4a8 8 0 00-8 8h4zm2 5.291A7.962 7.962 0 014 12H0c0 
                3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
        </svg>
    ),
};

interface AIPanelProps {
    content: string;
    noteId: string;
    setContent: (content: string) => void;
    setSuccess: (message: string) => void;
    setError: (message: string) => void;
}

export default function AIPanel({
    content,
    noteId,
    setContent,
    setSuccess,
    setError,
}: AIPanelProps) {
    const [aiLoading, setAiLoading] = useState<string | null>(null);
    const socketRef = useRef<any>(null);

    const handleAIAction = async (action: 'summarize' | 'enhance' | 'extract') => {
        if (!content.trim()) {
            setError('Note content is required for AI actions');
            return;
        }

        setAiLoading(action);
        try {
            const token = auth.getToken();
            if (!token) {
                setError('Authentication required');
                return;
            }

            let result: AIResponse;

            switch (action) {
                case 'summarize':
                    result = await api.summarizeNote(token, { content, noteId });
                    if (result?.summary) {
                        const newContent = content + `\n\n## AI Summary\n${result.summary}`;
                        setContent(newContent);
                        setSuccess('AI summary added successfully!');

                        if (socketRef.current) {
                            socketRef.current.emit('note-content-change', {
                                noteId: noteId,
                                content: newContent,
                                cursorPosition: 0
                            });
                        }
                    }
                    break;

                case 'enhance':
                    result = await api.enhanceContent(token, { content, noteId });
                    if (result?.enhancedContent) {
                        const newContent = result.enhancedContent;
                        setContent(newContent);
                        setSuccess('Content enhanced successfully!');
                        if (socketRef.current) {
                            socketRef.current.emit('note-content-change', {
                                noteId: noteId,
                                content: newContent,
                                cursorPosition: 0
                            });
                        }
                    } else {
                        setError('No enhanced content generated');
                    }
                    break;

                case 'extract':
                    result = await api.extractActions(token, { content, noteId });
                    console.log("Action items are :", result?.actionItems)
                    if (result?.actionItems) {
                        const actionsText = result.actionItems.map(item => `- ${item}`).join('\n');
                        const newContent = content + `\n\n## Action Items\n${actionsText}`;
                        setContent(newContent);
                        setSuccess('Action items extracted successfully!');
                        if (socketRef.current) {
                            socketRef.current.emit('note-content-change', {
                                noteId: noteId,
                                content: newContent,
                                cursorPosition: 0
                            });
                        }
                    } else {
                        setError('No action items found');
                    }
                    break;
            }
        } catch (error: any) {
            console.error('AI action failed:', error);
            setError(`AI action failed: ${error.message || 'Unknown error'}`);
        } finally {
            setAiLoading(null);
        }
    };

    useEffect(() => {
        const socketTimer = setTimeout(() => {
            import('@/lib/socket').then((module) => {
                const socketService = module.socketService;
                const socket = socketService.connect();
                socketRef.current = socket;
            }).catch((error) => {
                console.error(' Failed to load socket service:', error);
                setError('Failed to establish real-time connection');
            });
        }, 500);

        return () => {
            clearTimeout(socketTimer)
        };
    }, [noteId,]);

    const isLoading = (action: string) => aiLoading === action;

    return (
        <div className="border-b border-gray-300 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-900 backdrop-blur-md shadow-lg">
            <div className="max-w-4xl mx-auto px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 tracking-wide">
                            🤖 AI Assistant
                        </span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => handleAIAction('enhance')}
                        disabled={!!aiLoading}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-white 
                        bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 
                        shadow-md transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isLoading('enhance') ? <Icons.Loader /> : <Icons.AI />}
                        <span>Enhance</span>
                    </button>

                    <button
                        onClick={() => handleAIAction('summarize')}
                        disabled={!!aiLoading}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-white 
                        bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 
                        shadow-md transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isLoading('summarize') ? <Icons.Loader /> : <Icons.AI />}
                        <span>Summarize</span>
                    </button>

                    <button
                        onClick={() => handleAIAction('extract')}
                        disabled={!!aiLoading}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-white 
                        bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 
                        shadow-md transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isLoading('extract') ? <Icons.Loader /> : <Icons.AI />}
                        <span>Extract Actions</span>
                    </button>
                </div>
            </div>
        </div>
    );
}