// services/aiSuggestionService.ts - UPDATED VERSION
import { Task } from '@/types';

// 1. KEEP ALL YOUR INTERFACES EXACTLY THE SAME
export interface AISuggestions {
    priorities: PrioritySuggestion[];
    timeEstimates: TimeEstimate[];
    dependencies: DependencySuggestion[];
    productivity: ProductivityAnalysis;
}

export interface PrioritySuggestion {
    taskId: string;
    taskTitle: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
    suggestedOrder: number;
}

export interface TimeEstimate {
    taskId: string;
    taskTitle: string;
    aiEstimate: string;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    reasoning: string[];
}

export interface DependencySuggestion {
    taskId: string;
    taskTitle: string;
    requiredTasks: string[];
    reason: string;
}

export interface ProductivityAnalysis {
    overallScore: number;
    weeklyTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
    strengths: string[];
    improvementAreas: string[];
    personalizedTips: string[];
    peakHours: string[];
    focusAreas: string[];
    estimatedWeeklyCapacity: string;
}


export class AISuggestionService {

 
    public static async getSuggestions(tasks: Task[]): Promise<AISuggestions> {
        // No tasks? Return empty
        if (tasks.length === 0) {
            return this.getEmptySuggestions();
        }

        try {
            console.log(' Asking backend for AI suggestions...', tasks.length, 'tasks');
            const API_BASE_URL =
                process.env.NODE_ENV === 'production'
                    ? 'https://ai-notes-backend-h185.onrender.com/api'
                    : 'http://localhost:5000/api';


            // CALL YOUR EXPRESS BACKEND
            const response = await fetch(`${API_BASE_URL}/ai-suggestions`
                , {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        tasks: tasks
                    }),
                });

            if (!response.ok) {
                throw new Error(`Backend error: ${response.status}`);
            }

            // BACKEND RETURNS THE FULLY FORMATTED AI SUGGESTIONS
            const suggestions: AISuggestions = await response.json();
            console.log(' AI suggestions received from backend');
            return suggestions;

        } catch (error) {
            console.error(' Backend AI service failed:', error);
            // Fallback to simple suggestions
            return this.getSimpleSuggestions(tasks);
        }
    }

    // SIMPLE SUGGESTIONS 
    private static getSimpleSuggestions(tasks: Task[]): AISuggestions {
        return {
            priorities: this.getSimplePriorities(tasks),
            timeEstimates: this.getSimpleTimeEstimates(tasks),
            dependencies: [],
            productivity: this.getDefaultProductivity()
        };
    }

    private static getSimplePriorities(tasks: Task[]): PrioritySuggestion[] {
        return tasks.slice(0, 3).map((task, index) => ({
            taskId: task.id,
            taskTitle: task.title,
            priority: index === 0 ? 'HIGH' : index === 1 ? 'MEDIUM' : 'LOW',
            reason: 'Based on task order',
            suggestedOrder: index + 1
        }));
    }

    private static getSimpleTimeEstimates(tasks: Task[]): TimeEstimate[] {
        return tasks.slice(0, 3).map(task => ({
            taskId: task.id,
            taskTitle: task.title,
            aiEstimate: '1-3 hours',
            confidence: 'MEDIUM',
            reasoning: ['Standard task estimate']
        }));
    }

    private static getDefaultProductivity(): ProductivityAnalysis {
        return {
            overallScore: 70,
            weeklyTrend: 'STABLE',
            strengths: ['Consistency', 'Organization'],
            improvementAreas: ['Time management', 'Planning'],
            personalizedTips: ['Break tasks into chunks', 'Schedule focus time'],
            peakHours: ['9-11 AM', '2-4 PM'],
            focusAreas: ['Complex work', 'Planning'],
            estimatedWeeklyCapacity: '12-15 tasks'
        };
    }

    private static getEmptySuggestions(): AISuggestions {
        return {
            priorities: [],
            timeEstimates: [],
            dependencies: [],
            productivity: {
                overallScore: 0,
                weeklyTrend: 'STABLE',
                strengths: [],
                improvementAreas: [],
                personalizedTips: ['Add tasks to get suggestions'],
                peakHours: [],
                focusAreas: [],
                estimatedWeeklyCapacity: '0 tasks'
            }
        };
    }
}