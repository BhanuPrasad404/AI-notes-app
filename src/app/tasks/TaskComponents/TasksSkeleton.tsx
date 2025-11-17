import React from 'react';

export const KanbanSkeleton = React.memo(() => (
  <div className="flex-1 p-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
      {[...Array(3)].map((_, columnIndex) => (
        <div key={columnIndex} className="bg-white dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
            </div>
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full w-8 animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, taskIndex) => (
              <div key={taskIndex} className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 h-24 animate-pulse"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
));

export const TasksPageSkeleton = React.memo(() => (
  <div className="min-h-screen bg-white dark:bg-black flex">
    <div className="w-80 bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 animate-pulse"></div>
    <div className="flex-1 flex flex-col">
      <div className="bg-white dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 p-4 animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
      </div>
      <KanbanSkeleton />
    </div>
  </div>
));