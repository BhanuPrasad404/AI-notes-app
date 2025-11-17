// components/DebugTheme.tsx
'use client';
import { useTheme } from '@/contexts/ThemeContext';

export function DebugTheme() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="fixed top-4 left-4 z-50 p-4 bg-white dark:bg-black border-2 border-red-500">
      <p className="text-black dark:text-white">Theme: {theme}</p>
      <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800">
        <p className="text-gray-800 dark:text-gray-200">Test box - should change colors</p>
      </div>
      <button 
        onClick={toggleTheme}
        className="mt-2 px-3 py-1 bg-blue-500 text-white"
      >
        Toggle Theme
      </button>
    </div>
  );
}