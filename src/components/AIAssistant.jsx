// components/AIAssistant.jsx
import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';

// Pre-defined questions
const PRE_DEFINED_QUESTIONS = [
    "How do I create a new note?",
    "How do I share a note with someone?",
    "What AI features are available for notes?",
    "How do I create a task?",
    "How does task priority work?",
    "What are task dependencies?",
    "How can I improve my productivity?",
    "How does this help team collaboration?",
    "What are the main AI utilities?",
    "How do I organize my notes effectively?",
    "Can I attach files to notes and tasks?"
];

// Message component with copy functionality
const Message = ({ message, isAI }) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(message);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}>
            <div className={`relative max-w-[80%] rounded-2xl p-4 ${isAI
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                }`}>
                <p className="text-sm whitespace-pre-wrap">{message}</p>

                {/* Copy button - only for AI messages */}
                {isAI && (
                    <button
                        onClick={copyToClipboard}
                        className={`absolute -top-2 -right-2 p-1 rounded-full text-xs transition-all ${copied
                            ? 'bg-green-500 text-white'
                            : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                            } shadow-lg border border-gray-200 dark:border-gray-600`}
                        title="Copy to clipboard"
                    >
                        {copied ? '✅' : (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>)}
                    </button>
                )}

                {/* AI/User indicator */}
                <div className={`absolute -bottom-1 ${isAI ? '-left-1' : '-right-1'} text-xs px-2 py-0.5 rounded-full ${isAI
                    ? 'bg-purple-500 text-white'
                    : 'bg-cyan-500 text-white'
                    }`}>
                    {isAI ? 'AI' : 'You'}
                </div>
            </div>
        </div>
    );
};

// Loading animation
const LoadingDots = () => (
    <div className="flex justify-start mb-4">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4">
            <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
        </div>
    </div>
);

export default function AIAssistant({ onClose }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load conversation when modal opens
    useEffect(() => {
        if (isOpen) {
            loadConversation();
        }
    }, [isOpen]);

    const loadConversation = async () => {
        try {
            const token = auth.getToken();
            if (!token) return;

            const response = await api.getAIConversation(token);
            if (response.messages) {
                setMessages(response.messages);
                setConversationId(response.conversationId);
            }
        } catch (error) {
            logger.error('Failed to load conversation:', { error });
        }
    };

    const saveConversation = async (updatedMessages) => {
        try {
            const token = auth.getToken();
            if (!token) return;

            await api.saveConversation(token, {
                messages: updatedMessages,
                conversationId
            });
        } catch (error) {
            logger.error('Failed to save conversation:', { error });
        }
    };

    const sendMessage = async (messageText = null) => {
        const textToSend = messageText || input;
        if (!textToSend.trim()) return;

        const userMessage = {
            role: 'user',
            content: textToSend,
            timestamp: new Date().toISOString()
        };

        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);

        if (!messageText) {
            setInput('');
        }

        setLoading(true);

        try {
            const token = auth.getToken();
            const response = await api.getAIResponse(token, textToSend);

            const aiMessage = {
                role: 'assistant',
                content: response.answer,
                isTrained: response.isTrained,
                timestamp: new Date().toISOString()
            };

            const finalMessages = [...updatedMessages, aiMessage];
            setMessages(finalMessages);
            saveConversation(finalMessages);
        } catch (error) {
            logger.error('Failed to get AI response:', { error });

            const errorMessage = {
                role: 'assistant',
                content: "Sorry, I'm having trouble connecting right now. Please try again.",
                timestamp: new Date().toISOString()
            };

            const finalMessages = [...updatedMessages, errorMessage];
            setMessages(finalMessages);
            saveConversation(finalMessages);
        } finally {
            setLoading(false);
        }
    };

    const clearConversation = async () => {
        try {
            const token = auth.getToken();
            await api.clearAIConversation(token);

            setMessages([]);
            setConversationId(null);
        } catch (error) {
            logger.error('Failed to clear conversation:', { error });
        }
    };

    const handlePredefinedQuestion = (question) => {
        sendMessage(question);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Floating AI Assistant Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 group"
            >
                <div className="w-6 h-6 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </button>

            {/* AI Assistant Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col border border-gray-200 dark:border-gray-700">

                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Assistant</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Ask me anything about the app</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={clearConversation}
                                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                    title="Clear conversation"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Pre-defined Questions */}
                        {messages.length === 0 && (
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Questions</h3>
                                <div className="flex flex-wrap gap-2">
                                    {PRE_DEFINED_QUESTIONS.map((question, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handlePredefinedQuestion(question)}
                                            className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-3 py-2 rounded-xl transition-all duration-200 hover:scale-105"
                                        >
                                            {question}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.map((message, index) => (
                                <Message
                                    key={index}
                                    message={message.content}
                                    isAI={message.role === 'assistant'}
                                />
                            ))}
                            {loading && <LoadingDots />}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex space-x-4">
                                <div className="flex-1 relative">
                                    <textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Ask a question about notes, tasks, or productivity..."
                                        className="w-full p-4 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows="2"
                                    />
                                    <button
                                        onClick={() => sendMessage()}
                                        disabled={loading || !input.trim()}
                                        className={`absolute right-3 bottom-3 p-2 rounded-lg transition-all ${loading || !input.trim()
                                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg hover:scale-105'
                                            }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                                Press Enter to send, Shift+Enter for new line
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}