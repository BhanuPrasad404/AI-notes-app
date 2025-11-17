import { useRouter } from 'next/navigation';
import { SharedTask } from '@/types';
import { SharedIcons } from './SharedIcons';

interface SharedTaskCardProps {
    task: SharedTask;
    onUpdate: () => void;
    hasNewMessages?: boolean;
}

export function SharedTaskCard({ task, onUpdate, hasNewMessages = false }: SharedTaskCardProps) {
    const router = useRouter();

    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div
            onClick={() => router.push(`/tasks/${task.id}`)}
            className="relative group cursor-pointer bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-5 border border-gray-200 dark:border-gray-700 hover:border-cyan-500/50 transition-all duration-300 hover:scale-99"
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-gray-900 dark:text-white text-base font-semibold leading-tight line-clamp-2 flex-1">
                            {task.title}
                        </h3>
                        <span className={`
                            px-2 py-1 rounded-full text-xs font-medium capitalize flex-shrink-0
                            ${task.urgency === 'CRITICAL' ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-500/30' : ''}
                            ${task.urgency === 'HIGH' ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-500/30' : ''}
                            ${task.urgency === 'MEDIUM' ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-500/30' : ''}
                            ${task.urgency === 'LOW' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-500/30' : ''}
                        `}>
                            {task.urgency?.toLowerCase()}
                        </span>
                    </div>

                    {/* Project & Shared Info */}
                    <div className="flex items-center gap-3 text-xs">
                        {/* Project Badge */}
                        {task.project && (
                            <div
                                className="flex items-center gap-1 px-2 py-1 rounded-full border"
                                style={{
                                    backgroundColor: `${task.project.color}15`,
                                    borderColor: `${task.project.color}30`,
                                    color: task.project.color
                                }}
                            >
                                <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: task.project.color }}
                                />
                                <span className="font-medium">{task.project.name}</span>
                            </div>
                        )}

                        {/* Shared By */}
                        {task.sharedInfo?.sharedBy && (
                            <span className="text-gray-600 dark:text-gray-400">
                                Shared by <span className="text-cyan-600 dark:text-cyan-300 font-medium">
                                    {task.sharedInfo.sharedBy.name || task.sharedInfo.sharedBy.email}
                                </span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Permission & Message Badges */}
                <div className="flex flex-col items-end gap-2">
                    {task.sharedInfo?.permission && (
                        <span className={`text-[11px] font-medium px-2 py-1 rounded-full ${task.sharedInfo.permission === 'EDIT'
                            ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-500/30'
                            : 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-500/30'
                            }`}>
                            {task.sharedInfo.permission === 'EDIT' ? 'Can Edit' : 'View Only'}
                        </span>
                    )}

                    {hasNewMessages && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-medium border border-emerald-300 dark:border-emerald-500/30">
                            <SharedIcons.Message />
                            <span>New</span>
                        </div>
                    )}
                </div>
            </div>
            {/* Description */}
            {task.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                    {task.description}
                </p>
            )}
            {/* Footer - Status & Due Date */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Status Badge */}
                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${task.status === 'TODO' ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-500/30' :
                        task.status === 'IN_PROGRESS' ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-500/30' :
                            'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-500/30'
                        }`}>
                        {task.status.replace('_', ' ')}
                    </span>

                    {/* Due Date */}
                    {task.deadline && (
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Due {formatDate(task.deadline)}</span>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/tasks/${task.id}`);
                        }}
                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-500/10 rounded-lg transition-all duration-200"
                        title="Open Task"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}