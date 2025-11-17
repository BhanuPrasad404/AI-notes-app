import React from 'react';
import { Icons } from './Icons';

interface BulkActionsBarProps {
    selectedCount: number;
    onBulkRevoke: () => void;
    loading: boolean;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
    selectedCount,
    onBulkRevoke,
    loading
}) => (
    <div className="bg-cyan-900/20 border-b border-cyan-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
                <span className="text-cyan-300 text-sm">
                    {selectedCount} selected
                </span>
                <button
                    onClick={onBulkRevoke}
                    disabled={loading}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg border border-red-500/30 transition-colors disabled:opacity-50"
                >
                    {loading ? <Icons.Loader /> : <Icons.Revoke />}
                    <span>Revoke {selectedCount}</span>
                </button>
            </div>
        </div>
    </div>
);

export default BulkActionsBar;