import React from 'react';

export const SharedByMeSkeleton = React.memo(() => (
  <div className="min-h-screen bg-white dark:bg-black">
    <header className="bg-white dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-8 animate-pulse"></div>
          </div>
        </div>
        <div className="pb-4">
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-xl max-w-md animate-pulse"></div>
        </div>
      </div>
    </header>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        {/* Mobile Skeleton */}
        <div className="lg:hidden space-y-4 p-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-gray-100 dark:bg-gray-800/50 rounded-lg p-4 space-y-3 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
                  </div>
                </div>
                <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="flex flex-wrap gap-2 pl-12">
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-12"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-10 ml-auto"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Skeleton */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            {[...Array(7)].map((_, index) => (
              <div key={index} className="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" 
                style={{ 
                  gridColumn: index === 0 ? 'span 1' : 
                             index === 1 ? 'span 3' : 
                             index === 2 ? 'span 2' : 
                             index === 3 ? 'span 2' : 
                             index === 4 ? 'span 2' : 
                             index === 5 ? 'span 1' : 'span 1'
                }}
              ></div>
            ))}
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <div className="col-span-1 flex items-center">
                  <div className="w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded animate-pulse w-16"></div>
                </div>
                <div className="col-span-2">
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded animate-pulse w-20"></div>
                </div>
                <div className="col-span-2">
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded animate-pulse w-12"></div>
                </div>
                <div className="col-span-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse w-10"></div>
                </div>
                <div className="col-span-1 flex justify-end">
                  <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
));