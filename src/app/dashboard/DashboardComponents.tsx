'use client';
import { memo } from 'react';
import Link from 'next/link';
import { Note, Task } from '@/types';
import { Icons } from './DashboardIcons';

// Navigation Item Component
export const NavigationItem = memo(({ href, icon: Icon, label, active, onClick }: {
  href: string;
  icon: React.ComponentType;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) => (
  <Link
    href={href}
    className={`flex items-center space-x-2 ${active
      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-700 dark:text-white border border-cyan-500/30'
      : 'text-gray-600 dark:text-cyan-100/70 hover:text-cyan-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'} px-4 py-2 rounded-xl transition-all duration-300 font-medium`}
    onClick={onClick}
  >
    <Icon />
    <span>{label}</span>
  </Link>
));

// Collaborator Avatar Component
export const CollaboratorAvatar = memo(({ collaborator }: { collaborator: any }) => (
  <div className="relative group" title={`${collaborator.name} - ${collaborator.collaborationCount} collab${collaborator.collaborationCount > 1 ? 's' : ''}`}>
    {collaborator.avatarUrl ? (
      <img
        src={collaborator.avatarUrl}
        alt={collaborator.name}
        className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 shadow-sm group-hover:scale-110 transition-transform duration-200"
      />
    ) : (
      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm group-hover:scale-110 transition-transform duration-200">
        {collaborator.name.charAt(0).toUpperCase()}
      </div>
    )}
    {collaborator.collaborationCount > 1 && (
      <div className="absolute -top-1 -right-0 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold border border-white dark:border-gray-800">
        {collaborator.collaborationCount}
      </div>
    )}
  </div>
));

// Stat Card Component
export const StatCard = memo(({ value, label, gradient }: { value: number; label: string; gradient: string }) => (
  <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-4 shadow-lg hover:scale-105 transition-all duration-300 transform-gpu group cursor-pointer`}>
    <div className="text-2xl font-bold text-white drop-shadow-lg">{value}</div>
    <div className="text-white/90 text-sm font-medium mt-1 group-hover:text-white/100">{label}</div>
  </div>
));

// Note Card Component
export const NoteCard = memo(({ note, onClick }: { note: Note; onClick: () => void }) => (
  <div
    className="bg-white dark:bg-white/5 rounded-2xl p-5 hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-300 cursor-pointer border border-gray-200 dark:border-white/10 hover:border-cyan-500/30 group hover:scale-105"
    onClick={onClick}
  >
    <h3 className="text-gray-900 dark:text-white font-semibold mb-3 line-clamp-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
      {note.title}
    </h3>
    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
      {note.aiSummary || note.content}
    </p>
    <div className="flex items-center justify-between">
      <div className="flex flex-wrap gap-1 max-w-[70%]">
        {note.aiTags?.slice(0, 2).map((tag: string, index: number) => (
          <span
            key={index}
            className="bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-xs px-2 py-1 rounded-full font-medium truncate max-w-[80px]"
            title={tag}
          >
            {tag}
          </span>
        ))}
      </div>
      <span className="text-gray-500 dark:text-gray-400 text-xs font-medium flex-shrink-0">
        {new Date(note.updatedAt).toLocaleDateString()}
      </span>
    </div>
  </div>
));

// Task Column Component
export const TaskColumn = memo(({ status, tasks, statusConfig, onTaskClick }: {
  status: string;
  tasks: Task[];
  statusConfig: any;
  onTaskClick: (taskId: string) => void;
}) => (
  <div className="bg-white dark:bg-white/5 rounded-xl p-4 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all duration-300">
    <div className="flex items-center space-x-2 mb-3">
      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${statusConfig.gradient}`}></div>
      <h3 className="text-gray-900 dark:text-white font-semibold text-sm">
        {statusConfig.label} <span className="text-gray-500 dark:text-gray-400">({tasks.length})</span>
      </h3>
    </div>
    <div className="space-y-2">
      {tasks.slice(0, 3).map((task: Task) => (
        <div
          key={task.id}
          className="bg-gray-50 dark:bg-white/5 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200 cursor-pointer border border-gray-200 dark:border-white/5 group"
          onClick={() => onTaskClick(task.id)}
        >
          <div className="text-gray-900 dark:text-white text-sm font-medium group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors line-clamp-2">
            {task.title}
          </div>
          {task.deadline && (
            <div className="text-gray-500 dark:text-gray-400 text-xs mt-1 flex items-center space-x-1">
              <Icons.Calendar />
              <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      ))}
      {tasks.length === 0 && (
        <div className="text-gray-400 dark:text-gray-500 text-xs text-center py-2 italic">
          No tasks
        </div>
      )}
    </div>
  </div>
));

export { Icons };
