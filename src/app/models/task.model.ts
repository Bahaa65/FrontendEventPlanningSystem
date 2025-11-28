export interface Task {
    id: string;
    title: string;
    description: string;
    eventId: string; // Associated event ID
    dueDate: string; // ISO date string
    status: TaskStatus;
    assignedTo?: string; // User email or username
    priority: TaskPriority;
    createdBy: string; // User who created the task
    createdAt: string; // ISO date string
    updatedAt?: string; // ISO date string
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface CreateTaskRequest {
    title: string;
    description: string;
    eventId: string;
    dueDate: string;
    assignedTo?: string;
    priority: TaskPriority;
}

export interface TasksResponse {
    tasks: Task[];
}

export interface CreateTaskResponse {
    success: boolean;
    task: Task;
}

// Search and Filter Interfaces
export interface SearchFilterParams {
    // Keyword search
    keyword?: string; // Search in titles and descriptions

    // Date filters
    dateFrom?: string; // ISO date string
    dateTo?: string; // ISO date string

    // Role filters
    role?: 'organizer' | 'attendee' | 'assignee' | 'all';

    // Status filters (for both events and tasks)
    eventStatus?: ('upcoming' | 'past')[];
    taskStatus?: TaskStatus[];

    // Priority filter (for tasks only)
    priority?: TaskPriority[];

    // Entity type filter
    searchType?: 'events' | 'tasks' | 'all';

    // Pagination
    limit?: number;
    offset?: number;
}

export interface SearchResponse {
    events: any[]; // Will use Event type from event.model
    tasks: Task[];
    totalCount: number;
}

export interface EventSearchResult {
    events: any[];
    totalCount: number;
}

export interface TaskSearchResult {
    tasks: Task[];
    totalCount: number;
}
