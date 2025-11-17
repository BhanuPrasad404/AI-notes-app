// app/tasks/[id]/components/TaskDescription.tsx
'use client';

interface TaskDescriptionProps {
    description: string;
    isEditing: boolean;
    isOwner: boolean;
    onDescriptionChange: (description: string) => void;
    onEditToggle: () => void;
}

export default function TaskDescription({
    description,
    isEditing,
    isOwner,
    onDescriptionChange,
    onEditToggle
}: TaskDescriptionProps) {
    return (
        <div className="rounded-xl border p-6 border-gray-300 dark:border-gray-700/50 
           bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/80 dark:to-gray-800/40 
           backdrop-blur-lg shadow-xl 
           transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">

            {/* Enhanced Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-blue-500/90 to-purple-600/90 rounded-xl p-3 shadow-lg border border-blue-400/20">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Description</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Task details and requirements</p>
                    </div>
                </div>

                {/* Character Count */}
                {(isEditing || description) && (
                    <div className={`text-sm font-medium px-3 py-1.5 rounded-full border backdrop-blur-sm ${description.length > 4000
                        ? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700/50'
                        : 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600/50'
                        }`}>
                        {description.length}/5000
                    </div>
                )}
            </div>

            {/* Content Area */}
            {isEditing && isOwner ? (
                <div className="space-y-4">
                    <textarea
                        value={description}
                        onChange={(e) => onDescriptionChange(e.target.value)}
                        rows={6}
                        className="w-full px-4 py-4 bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 resize-none transition-all duration-200 backdrop-blur-sm"
                        placeholder="Describe this task in detail... What needs to be done? Any specific requirements? Share all the important details here."
                        maxLength={5000}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Markdown is supported. Be specific to help your team understand the requirements.
                    </p>
                </div>
            ) : (
                <div className="prose prose-invert max-w-none">
                    {description ? (
                        <div className="bg-gray-100 dark:bg-gray-800/30 rounded-xl p-5 border border-gray-200 dark:border-gray-600/30 backdrop-blur-sm">
                            <p className="text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                                {description}
                            </p>
                        </div>
                    ) : (
                        <div className="text-center py-10 border-2 border-dashed border-gray-300 dark:border-gray-600/50 rounded-xl bg-gray-50 dark:bg-gray-800/20 backdrop-blur-sm">
                            <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-300 dark:border-gray-600/30">
                                <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 italic mb-2">
                                {isOwner ? 'No description yet. Add details to help your team understand this task better.' : 'No description provided for this task.'}
                            </p>
                            {isOwner && !isEditing && (
                                <button
                                    onClick={onEditToggle}
                                    className="mt-3 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/30 px-4 py-2 rounded-lg border border-blue-300 dark:border-blue-700/30 transition-all duration-200"
                                >
                                    <span>Add description</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}