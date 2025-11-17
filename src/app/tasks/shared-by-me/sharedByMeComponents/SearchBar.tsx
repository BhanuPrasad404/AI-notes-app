import React from 'react';
import { Icons } from './Icons';

interface SearchBarProps {
  search: string;
  setSearch: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ search, setSearch }) => (
  <div className="relative w-full max-w-md group">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-600 dark:group-focus-within:text-cyan-400">
      <Icons.Search />
    </div>
    <input
      type="text"
      placeholder="Search tasks, people, or projects..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full px-4 py-2.5 pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 focus:border-blue-500 dark:focus:border-cyan-500 transition-all duration-200 text-sm hover:border-gray-400 dark:hover:border-gray-600"
    />
  </div>
);

export default SearchBar;