'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TaskHelpModal from '@/components/TaskHelpModal';
import router from 'next/router';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import Toast from '@/components/Toast';
import AIAssistant from './AIAssistant';
import TaskCollaborationModal from './TasksCollabarationHistory';

interface SidebarProps {
    projects: any[];
    selectedProject: string;
    onProjectSelect: (projectId: string) => void;
    onCreateProject: () => void;
    stats: any;
    onShowAnalytics: () => void;
    onShowAISuggestions: () => void;
    onShowExportModal: () => void;
    currentUser: any;
    setProjects: any
}

const Icons = {
    Home: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    Plus: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
    ChevronLeft: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>,
    ChevronRight: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
    SharedWithMe: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    SharedByMe: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>,
    Analytics: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    AI: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    Export: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>,
    Question: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Menu: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>,
    HandShakeIcon: ({ className = "w-6 h-6" }) => (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
        </svg>
    )
};

// Simple Delete Confirmation Modal Component
const DeleteConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    project
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    project: any;
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-auto shadow-2xl">
                <div className="text-center">
                    {/* Warning Icon */}
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Delete Project
                    </h3>

                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Are you sure you want to delete <span className="font-semibold">"{project?.name}"</span>?
                        {project?._count?.tasks > 0 && (
                            <span className="block mt-1 text-sm">
                                {project._count.tasks} task{project._count.tasks > 1 ? 's' : ''} will be moved to "No Project".
                            </span>
                        )}
                    </p>

                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function Sidebar({
    projects,
    selectedProject,
    onProjectSelect,
    onCreateProject,
    stats,
    onShowAnalytics,
    onShowAISuggestions,
    onShowExportModal,
    currentUser,
    setProjects
}: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const router = useRouter();
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showAIAssistant, setShowAIAssistant] = useState(false);
    const [showCollaborators, setShowCollaborators] = useState(false);

    // Add this state for delete modal
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        project: any | null;
    }>({
        isOpen: false,
        project: null
    });

    const handleDeleteProject = async (project: any) => {
        // Open the modal instead of using confirm
        setDeleteModal({
            isOpen: true,
            project: project
        });
    };

    const confirmDelete = async () => {
        if (!deleteModal.project) return;

        try {
            const token = auth.getToken();
            if (!token) return;

            await api.deleteProject(token, deleteModal.project.id);

            // Remove the deleted project
            const updatedProjects = projects.filter(p => p.id !== deleteModal.project.id);
            setProjects(updatedProjects);

            // If deleted project was selected, switch to "All Tasks"
            if (selectedProject === deleteModal.project.id) {
                onProjectSelect('ALL');
            }

            setSuccess('Project deleted successfully');
        } catch (error) {
            setError('Failed to delete project');
        } finally {
            // Close the modal
            setDeleteModal({ isOpen: false, project: null });
        }
    };

    const cancelDelete = () => {
        setDeleteModal({ isOpen: false, project: null });
    };

    return (
        <>
            {/* Mobile Overlay */}
            {!isCollapsed && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ease-in-out"
                    onClick={() => setIsCollapsed(true)}
                />
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={cancelDelete}
                onConfirm={confirmDelete}
                project={deleteModal.project}
            />

            {/* Sidebar */}
            <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
        transition-all duration-300 ease-in-out
        flex flex-col
        will-change-transform
        ${isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-80'}
        h-screen max-h-screen
    `}>

                {/* Header - Fixed Height */}
                <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 h-16">
                    {!isCollapsed && (
                        <div className="flex items-center gap-3 transition-all duration-200">
                            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center">
                                <Icons.Analytics />
                            </div>
                            <div className="transition-all duration-200">
                                <h1 className="text-lg font-bold text-gray-900 dark:text-white">TaskFlow</h1>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Workspace</p>
                            </div>
                        </div>
                    )}

                    {/* Collapse Button */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 hover:scale-105"
                    >
                        {isCollapsed ? <Icons.ChevronRight /> : <Icons.ChevronLeft />}
                    </button>
                </div>

                <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="grid grid-cols-2 gap-3">
                        {/* Home Button */}
                        {isCollapsed && (
                            <Link
                                href="/dashboard"

                            >
                                <Icons.Home />
                            </Link>
                        )}

                        {!isCollapsed && (
                            <Link
                                href="/dashboard"
                                className={`flex items-center justify-center gap-2 transition-all duration-300 font-semibold shadow-lg hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl group ${isCollapsed
                                    ? 'p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg'
                                    : 'p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl'
                                    }`}
                            >
                                <Icons.Home /> <span className="text-sm">Home</span>
                            </Link>
                        )}

                        {/* AI Assistant Button */}
                        {
                            isCollapsed && (
                                <button
                                    onClick={() => setShowAIAssistant(true)}

                                >
                                    <Icons.AI />
                                    {!isCollapsed && <span className="text-sm">AI Assistant</span>}
                                </button>
                            )
                        }

                        {!isCollapsed && (

                            <button
                                onClick={() => setShowAIAssistant(true)}
                                className={`flex items-center justify-center gap-2 transition-all duration-300 font-semibold shadow-lg hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl group ${isCollapsed
                                    ? 'p-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg'
                                    : 'p-3 bg-gradient-to-r from-cyan-500 to-green-500 text-white rounded-xl'
                                    }`}
                            >
                                <Icons.AI />
                                {!isCollapsed && <span className="text-sm">AI Assistant</span>}
                            </button>
                        )}
                    </div>
                </div>

                {/* Scrollable Content - Flexible Height */}
                <div className="flex-1 overflow-y-auto scrollbar min-h-0">
                    <div className="p-4 space-y-6">

                        {/* New Project Button */}
                        {!isCollapsed && (
                            <button
                                onClick={onCreateProject}
                                className="w-full flex items-center gap-3 p-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Icons.Plus />
                                <span>New Project</span>
                            </button>
                        )}

                        {isCollapsed && (
                            <button
                                onClick={onCreateProject}
                                className="w-full flex items-center justify-center p-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
                                title="New Project"
                            >
                                <Icons.Plus />
                            </button>
                        )}

                        {/* Projects Section */}
                        <div className="transition-all duration-200">
                            {!isCollapsed && (
                                <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3 transition-all duration-200">
                                    Projects
                                </h2>
                            )}

                            <div className="space-y-1 transition-all duration-200">
                                {/* All Tasks */}
                                <button
                                    onClick={() => onProjectSelect('ALL')}
                                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${selectedProject === 'ALL'
                                        ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                                        } ${isCollapsed ? 'justify-center' : ''}`}
                                    title="All Tasks"
                                >
                                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full transition-all duration-200"></div>
                                    {!isCollapsed && (
                                        <>
                                            <span className="flex-1 text-left transition-all duration-200">All Tasks</span>
                                            <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full transition-all duration-200">
                                                {stats.total}
                                            </span>
                                        </>
                                    )}
                                </button>

                                {/* No Project */}
                                <button
                                    onClick={() => onProjectSelect('NO_PROJECT')}
                                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${selectedProject === 'NO_PROJECT'
                                        ? 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-500/30'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                                        } ${isCollapsed ? 'justify-center' : ''}`}
                                    title="No Project"
                                >
                                    <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full transition-all duration-200"></div>
                                    {!isCollapsed && <span className="transition-all duration-200">No Project</span>}
                                </button>

                                {/* Projects List - Scrollable if needed */}
                                <div className="max-h-32 md:max-h-48 overflow-y-auto space-y-1 pr-1">
                                    {projects.map((project) => (
                                        <div
                                            key={project.id}
                                            className={`group relative flex items-center gap-2 p-2 rounded-lg transition-all duration-200 transform hover:scale-[0.99] active:scale-[0.98] ${selectedProject === project.id
                                                ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                                                }`}
                                        >
                                            {/* Project Button - Only covers text area */}
                                            <button
                                                onClick={() => onProjectSelect(project.id)}
                                                className={`flex items-center gap-3 flex-1 transition-all duration-200 ${isCollapsed ? 'justify-center' : ''}`}
                                                title={project.name}
                                            >
                                                <div
                                                    className="w-2 h-2 rounded-full flex-shrink-0 transition-all duration-200"
                                                    style={{ backgroundColor: project.color }}
                                                ></div>
                                                {!isCollapsed && (
                                                    <>
                                                        <span className="flex-1 text-left truncate transition-all duration-200">{project.name}</span>
                                                        <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full flex-shrink-0 transition-all duration-200">
                                                            {project._count?.tasks || 0}
                                                        </span>
                                                    </>
                                                )}
                                            </button>

                                            {/* Delete Button - Separate click area */}
                                            {!isCollapsed && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        handleDeleteProject(project);
                                                    }}
                                                    className="md:opacity-0 md:group-hover:opacity-100 opacity-100 flex items-center justify-center w-6 h-6 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-500/20 rounded transition-all duration-200 flex-shrink-0 hover:scale-110 active:scale-95 z-10 relative"
                                                    title="Delete Project"
                                                >
                                                    <svg className="w-3 h-3 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sharing Section */}
                        <div className="transition-all duration-200">
                            {!isCollapsed && (
                                <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3 transition-all duration-200">
                                    Sharing
                                </h2>
                            )}

                            <div className="space-y-2 transition-all duration-200">
                                <Link
                                    href="/tasks/shared-with-me"
                                    className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-300 group transform hover:scale-[1.02] active:scale-[0.98] ${isCollapsed ? 'justify-center' : 'justify-between'
                                        } bg-blue-100 dark:bg-blue-500/10 hover:bg-blue-200 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30`}
                                    title="Shared With Me"
                                >
                                    <div className="flex items-center gap-3 transition-all duration-200">
                                        <Icons.SharedWithMe />
                                        {!isCollapsed && <span className="text-gray-900 dark:text-white font-medium transition-all duration-200">With Me</span>}
                                    </div>
                                    {!isCollapsed && (
                                        <span className="bg-white/50 dark:bg-black/20 text-gray-700 dark:text-white text-xs px-2 py-1 rounded-full transition-all duration-200">
                                            {stats.sharedWithMeCount}
                                        </span>
                                    )}
                                </Link>

                                <Link
                                    href="/tasks/shared-by-me"
                                    className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-300 group transform hover:scale-[1.02] active:scale-[0.98] ${isCollapsed ? 'justify-center' : 'justify-between'
                                        } bg-emerald-100 dark:bg-emerald-500/10 hover:bg-emerald-200 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30`}
                                    title="Shared By Me"
                                >
                                    <div className="flex items-center gap-3 transition-all duration-200">
                                        <Icons.SharedByMe />
                                        {!isCollapsed && <span className="text-gray-900 dark:text-white font-medium transition-all duration-200">By Me</span>}
                                    </div>
                                    {!isCollapsed && (
                                        <span className="bg-white/50 dark:bg-black/20 text-gray-700 dark:text-white text-xs px-2 py-1 rounded-full transition-all duration-200">
                                            {stats.sharedByMeCount}
                                        </span>
                                    )}
                                </Link>
                                <button
                                    onClick={() => setShowCollaborators(!showCollaborators)}
                                    className={`flex items-center gap-3 p-2 w-full rounded-xl transition-all duration-400 group transform hover:scale-[1.03] active:scale-[0.97] hover:-translate-y-0.5 ${isCollapsed ? 'justify-center' : 'justify-between'
                                        } bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-900/60 dark:hover:to-teal-900/60 border border-emerald-200/80 dark:border-emerald-700/30 shadow-sm hover:shadow-lg backdrop-blur-sm ${showCollaborators ? 'ring-2 ring-emerald-400/50 dark:ring-emerald-500/50 shadow-lg' : ''}`}
                                    title={showCollaborators ? "Close Collaboration" : "View Collaboration History"}
                                >
                                    <div className="flex items-center gap-3 transition-all duration-300 ">
                                        <Icons.HandShakeIcon className={`w-5 h-5 transition-all duration-300 ${showCollaborators ? 'text-emerald-800 dark:text-emerald-200 scale-110' : 'text-emerald-700 dark:text-emerald-300 group-hover:scale-110 group-hover:text-emerald-800 dark:group-hover:text-emerald-200'}`} />
                                        {!isCollapsed && (
                                            <span className={`font-semibold tracking-tight transition-all duration-300 ${showCollaborators ? 'text-emerald-800 dark:text-emerald-200' : 'text-gray-800 dark:text-emerald-50'}`}>
                                                {showCollaborators ? 'Close' : 'Collabs'}
                                            </span>
                                        )}
                                    </div>


                                </button>
                            </div>
                        </div>

                        {/* Workspace Tools */}
                        <div className="transition-all duration-200">
                            {!isCollapsed && (
                                <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3 transition-all duration-200">
                                    Workspace
                                </h2>
                            )}

                            <div className="space-y-2 transition-all duration-200">
                                <button
                                    onClick={onShowAnalytics}
                                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 group transform hover:scale-[1.02] active:scale-[0.98] ${isCollapsed ? 'justify-center' : ''
                                        }`}
                                    title="Task Analytics"
                                >
                                    <Icons.Analytics />
                                    {!isCollapsed && <span className="text-gray-900 dark:text-white font-medium transition-all duration-200">Analytics</span>}
                                </button>

                                <button
                                    onClick={onShowAISuggestions}
                                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 group transform hover:scale-[1.02] active:scale-[0.98] ${isCollapsed ? 'justify-center' : ''
                                        }`}
                                    title="AI Suggestions"
                                >
                                    <Icons.AI />
                                    {!isCollapsed && <span className="text-gray-900 dark:text-white font-medium transition-all duration-200">AI Suggestions</span>}
                                </button>

                                <button
                                    onClick={onShowExportModal}
                                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 group transform hover:scale-[1.02] active:scale-[0.98] ${isCollapsed ? 'justify-center' : ''
                                        }`}
                                    title="Export Tasks"
                                >
                                    <Icons.Export />
                                    {!isCollapsed && <span className="text-gray-900 dark:text-white font-medium transition-all duration-200">Export</span>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer - Fixed Height */}
                <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-800 transition-all duration-200 h-20">
                    <div className="flex items-center justify-between transition-all duration-200 h-full">
                        {!isCollapsed && currentUser && (
                            <div className="flex items-center gap-3 transition-all duration-200">
                                <div className="flex-1 min-w-0 transition-all duration-200">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate transition-all duration-200">
                                        {currentUser.name || currentUser.email}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate transition-all duration-200">
                                        {stats.total} tasks • {stats.DONE} done
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Question Mark */}
                        <button
                            onClick={() => setIsHelpModalOpen(true)}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 hover:scale-105"
                            title="Help & Support"
                        >
                            <Icons.Question />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Button */}
            {isCollapsed && (
                <button
                    onClick={() => setIsCollapsed(false)}
                    className="fixed bottom-4 left-4 lg:hidden z-40 w-12 h-12 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
                >
                    <Icons.Menu />
                </button>
            )}
            <TaskHelpModal
                isOpen={isHelpModalOpen}
                onClose={() => setIsHelpModalOpen(false)}
            />
            {error && <Toast message={error} type="error" onClose={() => setError('')} />}
            {success && <Toast message={success} type="success" onClose={() => setSuccess('')} />}

            {showAIAssistant && <AIAssistant onClose={() => setShowAIAssistant(false)} />}

            {showCollaborators && (
                <TaskCollaborationModal
                    isOpen={showCollaborators}
                    onClose={() => setShowCollaborators(false)}
                />
            )}
        </>

    );
}