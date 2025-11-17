// components/ThemeTest.tsx
'use client';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeTest() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed top-4 right-10 z-50 p-4 bg-white dark:bg-black border-2 border-red-500">
      <p className="text-black dark:text-white">Theme: {theme}</p>
      <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800">
        <p className="text-gray-800 dark:text-gray-200">This should change colors</p>
      </div>
      <button 
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="mt-2 px-3 py-1 bg-blue-500 text-white"
      >
        Toggle Theme
      </button>
    </div>
  );
}