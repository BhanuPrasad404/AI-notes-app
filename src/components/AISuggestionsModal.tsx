'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Task } from '@/types';
import { AISuggestionService, AISuggestions, PrioritySuggestion, TimeEstimate, DependencySuggestion, ProductivityAnalysis } from '@/services/aiSuggestionService';

interface AISuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
}

// Memoized Icons
const Icons = {
  Brain: () => (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Priority: () => (
    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Link: () => (
    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  Chart: () => (
    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Project: () => (
    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  Close: () => (
    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Loader: () => (
    <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V4a8 8 0 00-8 8h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  )
};

// Tab configuration with PROJECTS tab
const TAB_CONFIG = [
  { id: 'projects' as const, label: 'Projects', icon: Icons.Project, color: 'purple' },
  { id: 'priorities' as const, label: 'Priorities', icon: Icons.Priority, color: 'blue' },
  { id: 'time' as const, label: 'Time Estimates', icon: Icons.Clock, color: 'green' },
  { id: 'dependencies' as const, label: 'Dependencies', icon: Icons.Link, color: 'orange' },
  { id: 'productivity' as const, label: 'Productivity', icon: Icons.Chart, color: 'red' }
];

export default function AISuggestionsModal({ isOpen, onClose, tasks }: AISuggestionsModalProps) {
  const [suggestions, setSuggestions] = useState<AISuggestions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'projects' | 'priorities' | 'time' | 'dependencies' | 'productivity'>('projects');

  // Group tasks by project
  const tasksByProject = useMemo(() => {
    const groups: { [key: string]: Task[] } = {};

    tasks.forEach(task => {
      const projectName = task.project?.name || 'No Project';
      if (!groups[projectName]) {
        groups[projectName] = [];
      }
      groups[projectName].push(task);
    });

    return groups;
  }, [tasks]);

  // Memoized fetch function
  const fetchAISuggestions = useCallback(async () => {
    if (tasks.length === 0) return;

    setLoading(true);
    setError(null);
    setSuggestions(null);

    try {
      console.log(' Sending tasks to AI:', tasks.map(t => ({
        id: t.id,
        title: t.title,
        project: t.project?.name,
        description: t.description
      })));

      const aiSuggestions = await AISuggestionService.getSuggestions(tasks);
      console.log(' AI Response:', aiSuggestions);
      setSuggestions(aiSuggestions);
    } catch (err: any) {
      console.error(' AI Error:', err);
      setError(err.message || 'Failed to get AI suggestions');
    } finally {
      setLoading(false);
    }
  }, [tasks]);

  useEffect(() => {
    if (isOpen && tasks.length > 0) {
      fetchAISuggestions();
    }
  }, [isOpen, tasks, fetchAISuggestions]);

  // Utility functions
  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-500 text-white';
      case 'MEDIUM': return 'bg-yellow-500 text-gray-900';
      case 'LOW': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  }, []);

  const getConfidenceColor = useCallback((confidence: string) => {
    switch (confidence) {
      case 'HIGH': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'LOW': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  }, []);

  const getTrendColor = useCallback((trend: string) => {
    switch (trend) {
      case 'IMPROVING': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'STABLE': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'DECLINING': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  }, []);

  // Summary data
  const summaryData = useMemo(() => {
    if (!suggestions) return null;

    return {
      highPriority: suggestions.priorities.filter(p => p.priority === 'HIGH').length,
      tasksAnalyzed: tasks.length,
      dependenciesFound: suggestions.dependencies.length,
      productivityScore: suggestions.productivity.overallScore,
      projectsCount: Object.keys(tasksByProject).length
    };
  }, [suggestions, tasks.length, tasksByProject]);

  // Tab content
  const renderTabContent = useMemo(() => {
    if (!suggestions) return null;

    switch (activeTab) {
      case 'projects':
        return <ProjectsTab tasksByProject={tasksByProject} />;
      case 'priorities':
        return <PriorityTab suggestions={suggestions} getPriorityColor={getPriorityColor} tasks={tasks} />;
      case 'time':
        return <TimeTab suggestions={suggestions} getConfidenceColor={getConfidenceColor} tasks={tasks} />;
      case 'dependencies':
        return <DependenciesTab suggestions={suggestions} tasks={tasks} />;
      case 'productivity':
        return <ProductivityTab suggestions={suggestions} getTrendColor={getTrendColor} />;
      default:
        return null;
    }
  }, [activeTab, suggestions, tasks, tasksByProject, getPriorityColor, getConfidenceColor, getTrendColor]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-black rounded-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700 shadow-2xl mx-2 sm:mx-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-500 to-blue-600 text-white">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
              <Icons.Brain />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold truncate">AI Task Assistant</h2>
              <p className="text-white/80 text-xs sm:text-sm truncate">Smart analysis with project context</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors flex-shrink-0 ml-2"
          >
            <Icons.Close />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(95vh-80px)] sm:h-[calc(90vh-80px)]">
          {/* Sidebar */}
          <div className="lg:w-64 bg-gray-50 dark:bg-gray-700/50 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 p-3 sm:p-4">
            {/* Mobile Tabs */}
            <div className="lg:hidden flex space-x-2 overflow-x-auto pb-2 -mx-2 px-2">
              {TAB_CONFIG.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 flex-shrink-0 min-w-[70px] ${activeTab === tab.id
                    ? 'bg-white dark:bg-gray-600 shadow-sm border border-gray-200 dark:border-gray-600'
                    : 'hover:bg-white dark:hover:bg-gray-600'
                    } ${activeTab === tab.id ? `text-${tab.color}-600 dark:text-${tab.color}-400` : 'text-gray-600 dark:text-gray-400'}`}
                >
                  <tab.icon />
                  <span className="text-xs font-medium text-center leading-tight">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Desktop Tabs */}
            <div className="hidden lg:block space-y-2">
              {TAB_CONFIG.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${activeTab === tab.id
                    ? 'bg-white dark:bg-gray-600 shadow-md border border-gray-200 dark:border-gray-600'
                    : 'hover:bg-white dark:hover:bg-gray-600'
                    } ${activeTab === tab.id ? `text-${tab.color}-600 dark:text-${tab.color}-400` : 'text-gray-600 dark:text-gray-400'}`}
                >
                  <tab.icon />
                  <span className="font-medium text-sm sm:text-base">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Summary */}
            {summaryData && (
              <div className="mt-4 lg:mt-6 p-3 sm:p-4 bg-white dark:bg-gray-600 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-500">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Summary</h3>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Projects:</span>
                    <span className="font-medium text-purple-600 dark:text-purple-400">{summaryData.projectsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">High Priority:</span>
                    <span className="font-medium text-red-600 dark:text-red-400">{summaryData.highPriority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tasks Analyzed:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{summaryData.tasksAnalyzed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Dependencies:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{summaryData.dependenciesFound}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {loading && <LoadingState />}
            {error && <ErrorState error={error} onRetry={fetchAISuggestions} />}
            {suggestions && !loading && renderTabContent}
          </div>
        </div>
      </div>
    </div>
  );
}

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center h-48 sm:h-64">
    <Icons.Loader />
    <p className="mt-3 sm:mt-4 text-gray-600 dark:text-gray-400 text-sm sm:text-base">AI is analyzing your tasks...</p>
    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-1 sm:mt-2">Checking project context and dependencies</p>
  </div>
);

const ErrorState = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 sm:p-6 text-center">
    <h3 className="text-red-800 dark:text-red-300 font-semibold mb-2 text-sm sm:text-base">AI Service Unavailable</h3>
    <p className="text-red-600 dark:text-red-400 text-xs sm:text-sm mb-3 sm:mb-4">{error}</p>
    <button
      onClick={onRetry}
      className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200 text-sm sm:text-base"
    >
      Retry Analysis
    </button>
  </div>
);

// NEW: Projects Tab
const ProjectsTab = ({ tasksByProject }: { tasksByProject: { [key: string]: Task[] } }) => (
  <div>
    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Project Overview</h3>
    <div className="space-y-4 sm:space-y-6">
      {Object.entries(tasksByProject).map(([projectName, projectTasks]) => (
        <div key={projectName} className="bg-white dark:bg-gray-700 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-600 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-white text-lg sm:text-xl flex items-center space-x-2">
              <Icons.Project />
              <span>{projectName}</span>
            </h4>
            <span className="px-2 sm:px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs sm:text-sm font-medium">
              {projectTasks.length} tasks
            </span>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {projectTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-600/50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">{task.title}</p>
                  {task.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1 truncate">{task.description}</p>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 sm:ml-3 ${task.status === 'DONE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                  task.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                  }`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Priority Tab with Project Context
const PriorityTab = ({ suggestions, getPriorityColor, tasks }: {
  suggestions: AISuggestions;
  getPriorityColor: (priority: string) => string;
  tasks: Task[];
}) => (
  <div>
    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Priority Suggestions</h3>
    <div className="space-y-3 sm:space-y-4">
      {suggestions.priorities.map((priority) => {
        const task = tasks.find(t => t.id === priority.taskId);
        return (
          <div key={priority.taskId} className="bg-white dark:bg-gray-700 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-600 p-4 sm:p-5 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <span className="text-sm sm:text-base font-medium text-gray-500 dark:text-gray-400">#{priority.suggestedOrder}</span>
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getPriorityColor(priority.priority)}`}>
                  {priority.priority} PRIORITY
                </span>
              </div>
            </div>

            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg sm:text-xl">{priority.taskTitle}</h4>

            {task?.project?.name && (
              <div className="flex items-center space-x-2 mb-2">
                <Icons.Project />
                <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                  {task.project.name}
                </span>
              </div>
            )}

            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">{priority.reason}</p>

            {task?.description && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-600/50 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 italic">"{task.description}"</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

// UPDATED: Time Tab with Project Context
const TimeTab = ({ suggestions, getConfidenceColor, tasks }: {
  suggestions: AISuggestions;
  getConfidenceColor: (confidence: string) => string;
  tasks: Task[];
}) => (
  <div>
    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Time Estimates</h3>
    <div className="space-y-3 sm:space-y-4">
      {suggestions.timeEstimates.map((estimate) => {
        const task = tasks.find(t => t.id === estimate.taskId);
        return (
          <div key={estimate.taskId} className="bg-white dark:bg-gray-700 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-600 p-4 sm:p-5 hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white text-lg sm:text-xl mb-1">{estimate.taskTitle}</h4>
                {task?.project?.name && (
                  <div className="flex items-center space-x-2">
                    <Icons.Project />
                    <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                      {task.project.name}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getConfidenceColor(estimate.confidence)}`}>
                  {estimate.confidence} Confidence
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3 sm:space-x-4 mb-3">
              <div className="flex items-center space-x-2 sm:space-x-3 bg-blue-50 dark:bg-blue-900/20 px-3 sm:px-4 py-2 sm:py-3 rounded-lg">
                <Icons.Clock />
                <span className="font-bold text-lg sm:text-xl text-blue-600 dark:text-blue-400">{estimate.aiEstimate}</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Reasoning:</p>
              {estimate.reasoning.map((reason, idx) => (
                <p key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start space-x-2 leading-relaxed">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{reason}</span>
                </p>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// UPDATED: Dependencies Tab with Better Debugging
const DependenciesTab = ({ suggestions, tasks }: {
  suggestions: AISuggestions;
  tasks: Task[];
}) => {
  console.log('🔍 DEPENDENCIES DEBUG:', {
    dependencies: suggestions.dependencies,
    tasks: tasks.map(t => ({ id: t.id, title: t.title, project: t.project?.name }))
  });

  return (
    <div>
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Task Dependencies</h3>

      {/* Debug Info */}
      <div className="mb-4 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center space-x-2 mb-2">
          <Icons.Brain />
          <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Analysis Results</span>
        </div>
        <div className="text-xs sm:text-sm text-blue-700 dark:text-blue-400 space-y-1">
          <p>• Found {suggestions.dependencies.length} dependencies across {tasks.length} tasks</p>
          <p>• Projects: {Array.from(new Set(tasks.map(t => t.project?.name).filter(Boolean))).join(', ')}</p>
          <p>• AI analyzed workflow connections between related tasks</p>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {suggestions.dependencies.length > 0 ? (
          suggestions.dependencies.map((dependency) => {
            const mainTask = tasks.find(t => t.id === dependency.taskId);

            return (
              <div key={dependency.taskId} className="bg-white dark:bg-gray-700 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-600 p-4 sm:p-6 hover:shadow-lg transition-all duration-200">
                {/* Main Task */}
                <div className="mb-4 p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center space-x-2 mb-1">
                    <Icons.Link />
                    <span className="text-sm font-medium text-orange-800 dark:text-orange-300">DEPENDS ON</span>
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg sm:text-xl mb-1">
                    {mainTask?.title || dependency.taskTitle}
                  </h4>
                  {mainTask?.project?.name && (
                    <div className="flex items-center space-x-2">
                      <Icons.Project />
                      <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                        {mainTask.project.name}
                      </span>
                    </div>
                  )}
                  <p className="text-sm text-orange-700 dark:text-orange-300 mt-2">{dependency.reason}</p>
                </div>

                {/* Required Tasks */}
                {dependency.requiredTasks.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center space-x-2">
                      <span className="text-green-600">✓</span>
                      <span>Complete these tasks first:</span>
                    </p>
                    <div className="space-y-2">
                      {dependency.requiredTasks.map((requiredTaskId, idx) => {
                        const requiredTask = tasks.find(t => t.id === requiredTaskId);
                        return (
                          <div key={idx} className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <span className="text-green-600 dark:text-green-400 font-bold text-lg">{idx + 1}</span>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                                {requiredTask?.title || `Task ${requiredTaskId}`}
                              </p>
                              {requiredTask?.project?.name && (
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                  Project: {requiredTask.project.name}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
            <Icons.Link />
            <p className="text-lg sm:text-xl font-medium mb-2 text-center">No Dependencies Found</p>
            <p className="text-sm sm:text-base text-center max-w-md mx-auto">
              The AI couldn't detect workflow dependencies between your tasks.
              This usually happens when tasks are independent or belong to different projects.
            </p>
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs sm:text-sm">
              <p className="font-medium mb-1">Tips to get dependencies:</p>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Create tasks in the same project</li>
                <li>• Use sequential task names (Design → Develop → Test)</li>
                <li>• Add clear descriptions showing relationships</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Productivity Tab (unchanged but included for completeness)
const ProductivityTab = ({ suggestions, getTrendColor }: {
  suggestions: AISuggestions;
  getTrendColor: (trend: string) => string;
}) => {
  const productivity = suggestions.productivity;

  return (
    <div>
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Productivity Analysis</h3>

      {/* Overall Score */}
      <div className="bg-white dark:bg-gray-700 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-600 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Overall Productivity Score</h4>
          <div className="flex items-center space-x-2">
            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getTrendColor(productivity.weeklyTrend)}`}>
              {productivity.weeklyTrend}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="text-3xl sm:text-4xl font-bold text-green-600 dark:text-green-400">
            {productivity.overallScore}
            <span className="text-base sm:text-lg text-gray-500">/100</span>
          </div>
          <div className="flex-1 w-full sm:w-auto">
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 sm:h-3">
              <div
                className="bg-gradient-to-r from-green-400 to-green-600 h-2 sm:h-3 rounded-full transition-all duration-500"
                style={{ width: `${productivity.overallScore}%` }}
              ></div>
            </div>
          </div>
        </div>

        {productivity.estimatedWeeklyCapacity && (
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 sm:mt-3">
            Estimated weekly capacity: <strong>{productivity.estimatedWeeklyCapacity}</strong>
          </p>
        )}
      </div>

      {/* Strengths & Improvement Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
        <div className="bg-white dark:bg-gray-700 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-600 p-3 sm:p-4">
          <h5 className="font-semibold text-green-600 dark:text-green-400 mb-2 sm:mb-3 text-sm sm:text-base">Your Strengths</h5>
          <div className="space-y-1 sm:space-y-2">
            {productivity.strengths.map((strength, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-xs sm:text-sm">
                <span className="text-green-500 text-sm">✓</span>
                <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{strength}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-700 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-600 p-3 sm:p-4">
          <h5 className="font-semibold text-orange-600 dark:text-orange-400 mb-2 sm:mb-3 text-sm sm:text-base">Improvement Areas</h5>
          <div className="space-y-1 sm:space-y-2">
            {productivity.improvementAreas.map((area, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-xs sm:text-sm">
                <span className="text-orange-500 text-sm">↻</span>
                <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{area}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Personalized Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg sm:rounded-xl border border-blue-200 dark:border-blue-800 p-4 sm:p-6">
        <h5 className="font-semibold text-blue-600 dark:text-blue-400 mb-3 sm:mb-4 text-sm sm:text-base">Personalized Tips</h5>
        <div className="space-y-2 sm:space-y-3">
          {productivity.personalizedTips.map((tip, idx) => (
            <div key={idx} className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white/50 dark:bg-gray-600/30 rounded-lg">
              <span className="text-blue-500 text-sm mt-0.5 flex-shrink-0">💡</span>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 flex-1 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};