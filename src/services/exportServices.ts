// services/exportServices.ts 
import { Task } from '@/types';

export interface ExportOptions {
    includeDescription: boolean;
    includeMetadata: boolean;
}

// PDF Generator with jsPDF
export const generatePDF = async (tasks: Task[], options: ExportOptions): Promise<string> => {
    try {
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();

        doc.setProperties({
            title: 'Task Export Report',
            subject: 'Tasks export from AI Notes',
            author: 'AI Notes App',
            creator: 'AI Notes'
        });


        const colors = {
            primary: [59, 130, 246],    // Blue
            success: [34, 197, 94],     // Green  
            warning: [245, 158, 11],    // Yellow
            danger: [239, 68, 68],      // Red
            dark: [33, 37, 41],         // Dark gray
            light: [248, 249, 250]      // Light gray
        };

        let yPosition = 20; // Start position


        doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.rect(0, 0, 210, 50, 'F'); // Full width header

        // Title
        doc.setFontSize(24);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('TASK EXPORT REPORT', 105, 25, { align: 'center' });

        // Subtitle
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255, 0.8);
        doc.setFont('helvetica', 'normal');
        doc.text('Professional Task Management Export', 105, 35, { align: 'center' });

        yPosition = 60;


        const completed = tasks.filter(t => t.status === 'DONE').length;
        const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
        const todo = tasks.filter(t => t.status === 'TODO').length;
        const total = tasks.length;

        // Summary title
        doc.setFontSize(16);
        doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        doc.setFont('helvetica', 'bold');
        doc.text('QUICK SUMMARY', 20, yPosition);
        yPosition += 15;

        // Summary cards
        const cardWidth = 40;
        const cardHeight = 25;
        const cardSpacing = 10;

        const summaryData = [
            { label: 'TOTAL', value: total, color: colors.primary, x: 20 },
            { label: 'DONE', value: completed, color: colors.success, x: 70 },
            { label: 'IN PROGRESS', value: inProgress, color: colors.warning, x: 120 },
            { label: 'TO DO', value: todo, color: colors.danger, x: 170 }
        ];

        summaryData.forEach((item, index) => {
            const x = item.x;

            // Card background
            doc.setFillColor(item.color[0], item.color[1], item.color[2]);
            doc.roundedRect(x, yPosition, cardWidth, cardHeight, 3, 3, 'F');

            // Value
            doc.setFontSize(16);
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.text(item.value.toString(), x + cardWidth / 2, yPosition + 12, { align: 'center' });

            // Label
            doc.setFontSize(8);
            doc.setTextColor(255, 255, 255, 0.9);
            doc.setFont('helvetica', 'normal');
            doc.text(item.label, x + cardWidth / 2, yPosition + 20, { align: 'center' });
        });

        yPosition += cardHeight + 20;


        doc.setFontSize(14);
        doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        doc.setFont('helvetica', 'bold');
        doc.text('TASK DETAILS', 20, yPosition);
        yPosition += 10;

        // Table headers
        const headers = ['TITLE', 'STATUS', 'DUE DATE', 'ASSIGNEE'];
        const columnWidths = [70, 30, 40, 40];
        const headerX = 20;

        // Header background
        doc.setFillColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        doc.rect(headerX, yPosition, 170, 8, 'F');

        // Header text
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');

        let currentX = headerX + 5;
        headers.forEach((header, index) => {
            doc.text(header, currentX, yPosition + 5.5);
            currentX += columnWidths[index];
        });

        yPosition += 12;


        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');

        tasks.forEach((task, index) => {
            // Check for page break
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;

                // Add header to new page
                doc.setFontSize(14);
                doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
                doc.setFont('helvetica', 'bold');
                doc.text('TASK DETAILS (CONTINUED)', 20, yPosition);
                yPosition += 15;
            }

            // Alternate row background
            if (index % 2 === 0) {
                doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
                doc.rect(headerX, yPosition - 4, 170, 10, 'F');
            }

            // Task title (truncated)
            doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
            const title = task.title.length > 35 ? task.title.substring(0, 35) + '...' : task.title;
            doc.text(title, headerX + 5, yPosition);

            // Status with colored badge
            let statusColor: number[];
            switch (task.status) {
                case 'DONE':
                    statusColor = colors.success;
                    break;
                case 'IN_PROGRESS':
                    statusColor = colors.warning;
                    break;
                case 'TODO':
                    statusColor = colors.danger;
                    break;
                default:
                    statusColor = colors.dark;
            }
            doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
            doc.rect(headerX + 75, yPosition - 3, 25, 6, 'F');
            doc.setFontSize(7);
            doc.setTextColor(255, 255, 255);
            doc.text(task.status.replace('_', ' '), headerX + 75 + 12.5, yPosition, { align: 'center' });
            doc.setFontSize(8);

            // Due date
            doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
            const dueDate = task.deadline ? new Date(task.deadline).toLocaleDateString() : '-';
            doc.text(dueDate, headerX + 105, yPosition);

            // Assignee
            const assignee = task.user?.name || 'Unassigned';
            doc.text(assignee, headerX + 145, yPosition);

            yPosition += 10;

            // Description (if included and available)
            if (options.includeDescription && task.description && yPosition < 270) {
                doc.setFontSize(7);
                doc.setTextColor(100, 100, 100);
                const desc = task.description.length > 80 ? task.description.substring(0, 80) + '...' : task.description;
                doc.text(` ${desc}`, headerX + 5, yPosition);
                doc.setFontSize(8);
                yPosition += 5;
            }

            yPosition += 3; // Space between tasks
        });


        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);

            // Page number
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });

            // Footer text
            doc.text('Exported from AI Notes - Professional Task Management', 105, 295, { align: 'center' });
        }


        const pdfBlob = doc.output('blob');
        return URL.createObjectURL(pdfBlob);

    } catch (error) {
        console.error('PDF generation failed:', error);
        throw new Error('Failed to generate PDF. Please try again.');
    }
};

// CSV Generator
export const generateCSV = (tasks: Task[], options: ExportOptions): string => {
    const headers = ['ID', 'Title', 'Status', 'Description', 'Deadline', 'Assignee', 'Created At', 'Updated At'];

    const csvData = tasks.map(task => [
        task.id,
        `"${task.title.replace(/"/g, '""')}"`,
        task.status,
        options.includeDescription ? `"${(task.description || '').replace(/"/g, '""')}"` : '',
        task.deadline || '',
        task.user?.name || '',
        options.includeMetadata ? new Date(task.createdAt).toLocaleDateString() : '',
        options.includeMetadata ? new Date(task.updatedAt).toLocaleDateString() : ''
    ]);

    return [headers, ...csvData].map(row => row.join(',')).join('\n');
};

// JSON Generator
export const generateJSON = (tasks: Task[], options: ExportOptions): string => {
    const exportData = {
        exportInfo: {
            exportedAt: new Date().toISOString(),
            totalTasks: tasks.length,
            format: 'JSON',
            version: '1.0'
        },
        tasks: tasks.map(task => ({
            id: task.id,
            title: task.title,
            status: task.status,
            ...(options.includeDescription && { description: task.description }),
            ...(task.deadline && { deadline: task.deadline }),
            ...(task.user && { assignee: task.user }),
            ...(options.includeMetadata && {
                createdAt: task.createdAt,
                updatedAt: task.updatedAt
            })
        }))
    };

    return JSON.stringify(exportData, null, 2);
};

// Download Utility
export const downloadFile = (content: string, filename: string, mimeType: string) => {
    // Check if content is a blob URL (from PDF) or regular content
    if (content.startsWith('blob:')) {
        // For PDF blob URLs
        const link = document.createElement('a');
        link.href = content;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the blob URL after download
        setTimeout(() => URL.revokeObjectURL(content), 100);
    } else {
        // For regular text content (CSV, JSON)
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};