// components/ExportTasksModal.tsx
'use client';
import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Task } from '@/types';

interface ExportTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
}

type ExportFormat = 'pdf' | 'csv' | 'json';
type StatusFilter = 'ALL' | 'TODO' | 'IN_PROGRESS' | 'DONE';
type DateRange = 'ALL' | 'LAST_WEEK' | 'LAST_MONTH';

// Memoized Icons to prevent re-renders
const Icons = {
  PDF: memo(() => (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )),
  CSV: memo(() => (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )),
  JSON: memo(() => (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  )),
  Download: memo(() => (
    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )),
  Close: memo(() => (
    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ))
};

// Memoized Format Button to prevent re-renders
const FormatButton = memo(({
  format,
  selectedFormat,
  onSelect,
  icon: Icon,
  title,
  description
}: {
  format: ExportFormat;
  selectedFormat: ExportFormat;
  onSelect: (format: ExportFormat) => void;
  icon: React.ComponentType;
  title: string;
  description: string;
}) => {
  const isSelected = selectedFormat === format;

  const getFormatStyles = useCallback((format: ExportFormat) => {
    const baseStyles = "flex flex-col items-center p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 min-h-[100px]";

    const formatConfig = {
      pdf: {
        selected: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm',
        default: 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:bg-blue-25 dark:hover:bg-blue-900/10'
      },
      csv: {
        selected: 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 shadow-sm',
        default: 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:border-green-400 hover:bg-green-25 dark:hover:bg-green-900/10'
      },
      json: {
        selected: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 shadow-sm',
        default: 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:border-purple-400 hover:bg-purple-25 dark:hover:bg-purple-900/10'
      }
    };

    const config = formatConfig[format];
    const styles = isSelected ? config.selected : config.default;

    return `${baseStyles} ${styles} ${isSelected ? 'scale-105' : ''}`;
  }, [isSelected]);

  const getIconStyles = useCallback((format: ExportFormat) => {
    const formatColors = {
      pdf: 'bg-blue-500 text-white',
      csv: 'bg-green-500 text-white',
      json: 'bg-purple-500 text-white'
    };

    return `w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-2 ${isSelected ? formatColors[format] : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
      }`;
  }, [isSelected]);

  return (
    <button
      onClick={() => onSelect(format)}
      className={getFormatStyles(format)}
    >
      <div className={getIconStyles(format)}>
        <Icon />
      </div>
      <span className="font-medium text-sm sm:text-base">{title}</span>
      <span className="text-xs mt-1 text-center px-1">{description}</span>
    </button>
  );
});

FormatButton.displayName = 'FormatButton';

function ExportTasksModal({ isOpen, onClose, tasks }: ExportTasksModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [dateRange, setDateRange] = useState<DateRange>('ALL');
  const [includeDescription, setIncludeDescription] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Memoized date calculations to prevent recalculation on every render
  const dateRanges = useMemo(() => {
    const now = new Date();
    return {
      LAST_WEEK: new Date(now.setDate(now.getDate() - 7)),
      LAST_MONTH: new Date(now.setDate(now.getDate() - 30))
    };
  }, []);

  // Memoized task filtering with useCallback to prevent recreation
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Status filter
      if (statusFilter !== 'ALL' && task.status !== statusFilter) {
        return false;
      }

      // Date range filter
      if (dateRange !== 'ALL') {
        const taskDate = new Date(task.createdAt);
        const cutoffDate = dateRanges[dateRange as keyof typeof dateRanges];
        return taskDate >= cutoffDate;
      }

      return true;
    });
  }, [tasks, statusFilter, dateRange, dateRanges]);

  // Memoized file size calculation
  const fileSizeEstimate = useMemo(() => {
    const taskCount = filteredTasks.length;
    const sizeMap = {
      pdf: (taskCount * 0.5).toFixed(1),
      csv: (taskCount * 0.1).toFixed(1),
      json: (taskCount * 0.2).toFixed(1)
    };

    const size = sizeMap[selectedFormat];
    const unit = selectedFormat === 'pdf' ? 'MB' : 'KB';
    return `${size} ${unit}`;
  }, [filteredTasks.length, selectedFormat]);

  // Optimized export handler with useCallback
  const handleExport = useCallback(async () => {
    if (filteredTasks.length === 0) return;

    setExporting(true);
    try {
      // Dynamic import for code splitting - only load when needed
      const { generatePDF, generateCSV, generateJSON, downloadFile } = await import('@/services/exportServices');

      const exportOptions = { includeDescription, includeMetadata };
      let content: string, filename: string, mimeType: string;

      switch (selectedFormat) {
        case 'pdf':
          content = await generatePDF(filteredTasks, exportOptions);
          filename = `tasks-export-${new Date().toISOString().split('T')[0]}.pdf`;
          mimeType = 'application/pdf';
          break;
        case 'csv':
          content = generateCSV(filteredTasks, exportOptions);
          filename = `tasks-export-${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv';
          break;
        case 'json':
          content = generateJSON(filteredTasks, exportOptions);
          filename = `tasks-export-${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json';
          break;
        default:
          throw new Error('Unsupported export format');
      }

      if (!content) {
        throw new Error('No content generated for export');
      }

      downloadFile(content, filename, mimeType);

      // Close modal after successful export
      setTimeout(onClose, 1000);

    } catch (error: any) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error.message || 'Please try again'}`);
    } finally {
      setExporting(false);
    }
  }, [selectedFormat, filteredTasks, includeDescription, includeMetadata, onClose]);

  // Reset form when modal opens - optimized with dependencies
  useEffect(() => {
    if (isOpen) {
      setSelectedFormat('pdf');
      setStatusFilter('ALL');
      setDateRange('ALL');
      setIncludeDescription(true);
      setIncludeMetadata(true);
      setExporting(false);
    }
  }, [isOpen]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-2xl mx-2 sm:mx-0 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent rounded-2xl " style={{ scrollbarWidth: 'thin', scrollbarColor: '#4B5563 transparent' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
              Export Tasks
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
              Download your tasks in multiple formats
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ml-2"
            aria-label="Close modal"
          >
            <Icons.Close />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Format Selection */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Export Format
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              <FormatButton
                format="pdf"
                selectedFormat={selectedFormat}
                onSelect={setSelectedFormat}
                icon={Icons.PDF}
                title="PDF Report"
                description="Professional document"
              />
              <FormatButton
                format="csv"
                selectedFormat={selectedFormat}
                onSelect={setSelectedFormat}
                icon={Icons.CSV}
                title="Excel/CSV"
                description="Spreadsheet data"
              />
              <FormatButton
                format="json"
                selectedFormat={selectedFormat}
                onSelect={setSelectedFormat}
                icon={Icons.JSON}
                title="JSON Data"
                description="For developers"
              />
            </div>
          </div>

          {/* Filter Options */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 sm:p-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Filter Options
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="w-full px-3 py-2 text-sm sm:text-base bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL">All Tasks</option>
                  <option value="TODO">To Do Only</option>
                  <option value="IN_PROGRESS">In Progress Only</option>
                  <option value="DONE">Completed Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  Date Range
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as DateRange)}
                  className="w-full px-3 py-2 text-sm sm:text-base bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL">All Time</option>
                  <option value="LAST_WEEK">Last 7 Days</option>
                  <option value="LAST_MONTH">Last 30 Days</option>
                </select>
              </div>
            </div>

            <div className="mt-3 sm:mt-4 space-y-2">
              <label className="flex items-center space-x-2 sm:space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeDescription}
                  onChange={(e) => setIncludeDescription(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Include task descriptions</span>
              </label>

              <label className="flex items-center space-x-2 sm:space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Include created/updated dates</span>
              </label>
            </div>
          </div>

          {/* Preview & Export */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                  Export Preview
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {filteredTasks.length} tasks selected • {selectedFormat.toUpperCase()} • {fileSizeEstimate}
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-sm sm:text-base rounded-lg border border-gray-300 dark:border-gray-600 sm:border-none"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={exporting || filteredTasks.length === 0}
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex-1 sm:flex-none"
              >
                {exporting ? (
                  <>
                    <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin"></div>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Icons.Download />
                    <span>Download Export</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ExportTasksModal);