import React from 'react';
import { Task } from '@/types';
import TaskCard from '@/components/TaskCard';
import { Icons } from './Icons';

interface KanbanColumnProps {
  status: string;
  tasks: Task[];
  statusConfig: any;
  onTaskUpdate: () => void;
  hasNewMessages: string[];
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  tasks,
  statusConfig,
  onTaskUpdate,
  hasNewMessages
}) => (
  <div className="bg-white dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${statusConfig.gradient}`}></div>
          <h2 className="text-gray-900 dark:text-white font-semibold">{statusConfig.label}</h2>
        </div>
        <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded-full font-medium">
          {tasks.length}
        </span>
      </div>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onUpdate={onTaskUpdate}
            hasNewMessages={hasNewMessages.includes(task.id)}
          />
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-500">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Icons.Plus />
            </div>
            <p className="text-sm">No tasks</p>
          </div>
        )}
      </div>
    </div>
);

export default KanbanColumn;