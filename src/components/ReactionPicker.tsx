'use client';
import { useState, useRef, useEffect } from 'react';

interface ReactionPickerProps {
  onSelectReaction: (emoji: string) => void;
  align?: 'left' | 'right';
}

const commonReactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export default function ReactionPicker({ onSelectReaction, align = 'left' }: ReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={pickerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {isOpen && (
        <div className={`
          absolute 
          bottom-full 
          mb-2
          bg-white dark:bg-gray-800 
          border border-gray-200 dark:border-gray-700 
          rounded-2xl shadow-xl p-2 z-50 
          animate-in fade-in duration-200
        `}>
          <div className="flex gap-1">
            {commonReactions.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onSelectReaction(emoji);
                  setIsOpen(false);
                }}
                className="w-8 h-8 flex items-center justify-center text-lg hover:scale-125 transition-transform duration-150 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}