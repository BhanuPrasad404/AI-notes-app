import { Note } from '@/types';

const Icons = {
    AI: () => (
        <svg
            className="w-4 h-4 text-blue-600 dark:text-cyan-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
            />
        </svg>
    ),
};

interface NoteSidebarProps {
    note: Note;
}

export default function NoteSidebar({ note }: NoteSidebarProps) {
    return (
        <div className="space-y-5">
            {/* AI Summary */}
            {note.aiSummary && (
                <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gradient-to-br dark:from-gray-900/90 dark:to-gray-800/60 backdrop-blur-md shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 dark:from-cyan-500/10 via-transparent to-transparent pointer-events-none"></div>
                    <div className="p-4 relative z-10">
                        <div className="flex items-center mb-3 space-x-2">
                            <Icons.AI />
                            <h3 className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-cyan-400 dark:to-blue-500">
                                AI Summary
                            </h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                            {note.aiSummary}
                        </p>
                    </div>
                </div>
            )}

            {/* AI Tags */}
            {note.aiTags && note.aiTags.length > 0 && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gradient-to-br dark:from-gray-900/90 dark:to-gray-800/60 backdrop-blur-md shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-xl p-4">
                    <div className="flex items-center mb-3">
                        <h3 className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-500">
                            Tags
                        </h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {note.aiTags.map((tag, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                           bg-blue-50 dark:bg-gradient-to-r dark:from-blue-500/10 dark:to-indigo-500/10 
                                           text-black dark:text-gray-500 border border-blue-200 dark:border-blue-800/40 backdrop-blur-sm
                                           hover:scale-105 transition-transform"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Note Info */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gradient-to-br dark:from-gray-900/90 dark:to-gray-800/60 backdrop-blur-md shadow-lg p-4 transition-transform hover:-translate-y-0.5 hover:shadow-xl">
                <h3 className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600 dark:from-pink-400 dark:to-rose-500 mb-3">
                    Note Info
                </h3>

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Created</span>
                        <span className="text-gray-900 dark:text-gray-200">
                            {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Updated</span>
                        <span className="text-gray-900 dark:text-gray-200">
                            {new Date(note.updatedAt).toLocaleDateString()}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Type</span>
                        <span className="text-gray-900 dark:text-gray-200 capitalize">
                            {note.contentType}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Access</span>
                        <span
                            className={`capitalize px-2 py-0.5 rounded text-xs font-medium border backdrop-blur-sm ${note.permissions?.permissionLevel === 'OWNER'
                                    ? 'bg-green-100 dark:bg-green-500/10 border-green-300 dark:border-green-700/40 text-green-700 dark:text-green-300'
                                    : 'bg-blue-100 dark:bg-blue-500/10 border-blue-300 dark:border-blue-700/40 text-blue-700 dark:text-blue-300'
                                }`}
                        >
                            {note.permissions?.permissionLevel.toLowerCase()}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}