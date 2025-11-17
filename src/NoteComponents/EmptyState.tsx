import React from 'react';

interface EmptyStateProps {
    hasSearch: boolean;
    onCreateNote: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ hasSearch, onCreateNote }) => {
    return (
        <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
                {hasSearch ? 'No notes found' : 'No notes yet'}
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
                {hasSearch ? 'Try adjusting your search terms' : 'Start capturing your thoughts and ideas'}
            </p>
            {!hasSearch && (
                <button
                    onClick={onCreateNote}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-3.5 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                >
                    Create First Note
                </button>
            )}
        </div>
    );
};

export default React.memo(EmptyState);