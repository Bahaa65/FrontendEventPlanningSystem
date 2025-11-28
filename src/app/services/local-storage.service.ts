import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Event, EventsResponse, CreateEventRequest, CreateEventResponse, Invitee } from '../models/event.model';
import { Task, TasksResponse, CreateTaskRequest, CreateTaskResponse, SearchFilterParams, SearchResponse, TaskStatus, TaskPriority } from '../models/task.model';
import { AuthResponse } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {
    private readonly EVENTS_KEY = 'app_events';
    private readonly TASKS_KEY = 'app_tasks';
    private readonly USERS_KEY = 'app_users';
    private readonly CURRENT_USER_KEY = 'app_current_user';

    constructor() {
        this.initializeSampleData();
    }

    /**
     * Initialize sample data for testing if no data exists
     */
    private initializeSampleData(): void {
        const events = this.getStoredEvents();
        const tasks = this.getStoredTasks();
        if (events.length === 0) {
            this.seedSampleData();
        }
    }

    /**
     * Seed sample events for testing
     */
    private seedSampleData(): void {
        const sampleEvents: Event[] = [
            {
                id: this.generateId(),
                title: 'Team Building Workshop',
                date: this.getFutureDate(5),
                time: '14:00',
                location: 'Conference Room A',
                description: 'Interactive team building activities and group exercises',
                organizerId: 'demo_user',
                role: 'organizer',
                status: 'upcoming',
                invitees: [
                    { email: 'colleague1@example.com', status: 'invited' },
                    { email: 'colleague2@example.com', status: 'invited' }
                ]
            },
            {
                id: this.generateId(),
                title: 'Project Kickoff Meeting',
                date: this.getFutureDate(10),
                time: '10:00',
                location: 'Virtual - Zoom',
                description: 'Kickoff meeting for the new Q1 project initiative',
                organizerId: 'demo_user',
                role: 'organizer',
                status: 'upcoming'
            },
            {
                id: this.generateId(),
                title: 'Client Presentation',
                date: this.getPastDate(5),
                time: '15:00',
                location: 'Client Office',
                description: 'Q4 Results presentation to key stakeholders',
                organizerId: 'demo_user',
                role: 'organizer',
                status: 'past'
            }
        ];

        localStorage.setItem(this.EVENTS_KEY, JSON.stringify(sampleEvents));

        // Seed sample tasks with event IDs
        const eventIds = sampleEvents.map(e => e.id);
        this.seedSampleTasks(eventIds);
    }

    /**
     * Generate unique ID for events
     */
    private generateId(): string {
        return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get future date (days from now)
     */
    private getFutureDate(days: number): string {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    }

    /**
     * Get past date (days ago)
     */
    private getPastDate(days: number): string {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date.toISOString().split('T')[0];
    }

    /**
     * Get all stored events
     */
    private getStoredEvents(): Event[] {
        const stored = localStorage.getItem(this.EVENTS_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Save events to storage
     */
    private saveEvents(events: Event[]): void {
        localStorage.setItem(this.EVENTS_KEY, JSON.stringify(events));
    }

    /**
     * Authenticate user (simulate login)
     */
    authenticateUser(username: string, password: string): Observable<AuthResponse> {
        // Simulate API delay
        return of({
            token: `local_token_${username}_${Date.now()}`,
            user: {
                username: username,
                email: `${username}@example.com`
            }
        }).pipe(delay(500));
    }

    /**
     * Register user (simulate signup)
     */
    registerUser(username: string, email: string, password: string): Observable<AuthResponse> {
        // Simulate API delay
        return of({
            token: `local_token_${username}_${Date.now()}`,
            user: {
                username: username,
                email: email
            }
        }).pipe(delay(500));
    }

    /**
     * Get events by role
     */
    getEventsByRole(role: 'organizer' | 'attendee', currentUser: string): Observable<EventsResponse> {
        const allEvents = this.getStoredEvents();

        // Update event statuses based on current date
        const updatedEvents = allEvents.map(event => ({
            ...event,
            status: this.getEventStatus(event.date)
        }));

        // Filter by role
        let filteredEvents: Event[];
        if (role === 'organizer') {
            filteredEvents = updatedEvents.filter(e => e.organizerId === currentUser);
        } else {
            filteredEvents = updatedEvents.filter(e =>
                e.organizerId !== currentUser &&
                (e.invitees?.some(inv => inv.email.includes(currentUser)) || e.role === 'attendee')
            );
        }

        // Simulate API delay
        return of({
            events: filteredEvents
        }).pipe(delay(300));
    }

    /**
     * Determine event status based on date
     */
    private getEventStatus(eventDate: string): 'upcoming' | 'past' {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const eventDateObj = new Date(eventDate);
        return eventDateObj >= today ? 'upcoming' : 'past';
    }

    /**
     * Get event by ID
     */
    getEventById(eventId: string): Observable<Event> {
        const events = this.getStoredEvents();
        const event = events.find(e => e.id === eventId);

        if (!event) {
            throw new Error('Event not found');
        }

        return of(event).pipe(delay(200));
    }

    /**
     * Create new event
     */
    createEvent(eventData: CreateEventRequest, currentUser: string): Observable<CreateEventResponse> {
        const events = this.getStoredEvents();

        // Convert string invitees to Invitee objects
        const invitees: Invitee[] | undefined = eventData.invitees?.map(email => ({
            email: email,
            status: 'invited' as const
        }));

        const newEvent: Event = {
            id: this.generateId(),
            title: eventData.title,
            date: eventData.date,
            time: eventData.time,
            location: eventData.location || '',
            description: eventData.description || '',
            organizerId: currentUser,
            role: 'organizer',
            status: this.getEventStatus(eventData.date),
            invitees: invitees
        };

        events.push(newEvent);
        this.saveEvents(events);

        // Simulate API delay
        return of({
            success: true,
            event: newEvent
        }).pipe(delay(500));
    }

    /**
     * Delete event
     */
    deleteEvent(eventId: string, currentUser: string): Observable<{ success: boolean }> {
        const events = this.getStoredEvents();
        const eventIndex = events.findIndex(e => e.id === eventId);

        if (eventIndex === -1) {
            throw new Error('Event not found');
        }

        // Only allow organizer to delete
        if (events[eventIndex].organizerId !== currentUser) {
            throw new Error('Only the organizer can delete this event');
        }

        events.splice(eventIndex, 1);
        this.saveEvents(events);

        // Simulate API delay
        return of({ success: true }).pipe(delay(300));
    }

    /**
     * Update attendance status
     */
    updateAttendanceStatus(
        eventId: string,
        status: 'going' | 'maybe' | 'not_going',
        currentUser: string
    ): Observable<{ success: boolean }> {
        const events = this.getStoredEvents();
        const event = events.find(e => e.id === eventId);

        if (!event) {
            throw new Error('Event not found');
        }

        // Update attendance status
        event.attendanceStatus = status;
        this.saveEvents(events);

        // Simulate API delay
        return of({ success: true }).pipe(delay(300));
    }

    /**
     * Add invitee to an event
     */
    addInvitee(
        eventId: string,
        email: string,
        currentUser: string
    ): Observable<{ success: boolean }> {
        const events = this.getStoredEvents();
        const event = events.find(e => e.id === eventId);

        if (!event) {
            throw new Error('Event not found');
        }

        // Only allow organizer to add invitees
        if (event.organizerId !== currentUser) {
            throw new Error('Only the organizer can add invitees');
        }

        // Check if invitee already exists
        if (event.invitees?.some(inv => inv.email === email)) {
            throw new Error('Invitee already exists');
        }

        // Initialize invitees array if needed
        if (!event.invitees) {
            event.invitees = [];
        }

        // Add new invitee
        event.invitees.push({
            email: email,
            status: 'invited'
        });

        this.saveEvents(events);

        // Simulate API delay
        return of({ success: true }).pipe(delay(300));
    }

    /**
     * Remove invitee from an event
     */
    removeInvitee(
        eventId: string,
        email: string,
        currentUser: string
    ): Observable<{ success: boolean }> {
        const events = this.getStoredEvents();
        const event = events.find(e => e.id === eventId);

        if (!event) {
            throw new Error('Event not found');
        }

        // Only allow organizer to remove invitees
        if (event.organizerId !== currentUser) {
            throw new Error('Only the organizer can remove invitees');
        }

        // Remove invitee
        if (event.invitees) {
            const inviteeIndex = event.invitees.findIndex(inv => inv.email === email);
            if (inviteeIndex !== -1) {
                event.invitees.splice(inviteeIndex, 1);
            }
        }

        this.saveEvents(events);

        // Simulate API delay
        return of({ success: true }).pipe(delay(300));
    }

    /**
     * Clear all local storage data (for testing)
     */
    clearAllData(): void {
        localStorage.removeItem(this.EVENTS_KEY);
        localStorage.removeItem(this.TASKS_KEY);
        localStorage.removeItem(this.USERS_KEY);
        localStorage.removeItem(this.CURRENT_USER_KEY);
        this.initializeSampleData();
    }

    // ==================== TASK MANAGEMENT ====================

    /**
     * Get all stored tasks
     */
    private getStoredTasks(): Task[] {
        const stored = localStorage.getItem(this.TASKS_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Save tasks to storage
     */
    private saveTasks(tasks: Task[]): void {
        localStorage.setItem(this.TASKS_KEY, JSON.stringify(tasks));
    }

    /**
     * Generate unique ID for tasks
     */
    private generateTaskId(): string {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get tasks by event ID
     */
    getTasksByEventId(eventId: string): Observable<TasksResponse> {
        const tasks = this.getStoredTasks();
        const eventTasks = tasks.filter(t => t.eventId === eventId);

        return of({ tasks: eventTasks }).pipe(delay(200));
    }

    /**
     * Get task by ID
     */
    getTaskById(taskId: string): Observable<Task> {
        const tasks = this.getStoredTasks();
        const task = tasks.find(t => t.id === taskId);

        if (!task) {
            throw new Error('Task not found');
        }

        return of(task).pipe(delay(200));
    }

    /**
     * Create new task
     */
    createTask(taskData: CreateTaskRequest, currentUser: string): Observable<CreateTaskResponse> {
        const tasks = this.getStoredTasks();

        const newTask: Task = {
            id: this.generateTaskId(),
            title: taskData.title,
            description: taskData.description,
            eventId: taskData.eventId,
            dueDate: taskData.dueDate,
            status: 'pending',
            assignedTo: taskData.assignedTo,
            priority: taskData.priority,
            createdBy: currentUser,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        tasks.push(newTask);
        this.saveTasks(tasks);

        return of({
            success: true,
            task: newTask
        }).pipe(delay(300));
    }

    /**
     * Update task
     */
    updateTask(taskId: string, updates: Partial<Task>): Observable<{ success: boolean, task: Task }> {
        const tasks = this.getStoredTasks();
        const taskIndex = tasks.findIndex(t => t.id === taskId);

        if (taskIndex === -1) {
            throw new Error('Task not found');
        }

        tasks[taskIndex] = {
            ...tasks[taskIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        this.saveTasks(tasks);

        return of({ success: true, task: tasks[taskIndex] }).pipe(delay(300));
    }

    /**
     * Delete task
     */
    deleteTask(taskId: string, currentUser: string): Observable<{ success: boolean }> {
        const tasks = this.getStoredTasks();
        const taskIndex = tasks.findIndex(t => t.id === taskId);

        if (taskIndex === -1) {
            throw new Error('Task not found');
        }

        // Only allow creator to delete
        if (tasks[taskIndex].createdBy !== currentUser) {
            throw new Error('Only the creator can delete this task');
        }

        tasks.splice(taskIndex, 1);
        this.saveTasks(tasks);

        return of({ success: true }).pipe(delay(300));
    }

    // ==================== ADVANCED SEARCH ====================

    /**
     * Advanced search for events and/or tasks
     */
    advancedSearch(params: SearchFilterParams, currentUser: string): Observable<SearchResponse> {
        const events = this.getStoredEvents();
        const tasks = this.getStoredTasks();

        let filteredEvents: Event[] = [];
        let filteredTasks: Task[] = [];

        // Determine what to search
        const searchType = params.searchType || 'all';

        // Filter Events
        if (searchType === 'events' || searchType === 'all') {
            filteredEvents = this.filterEvents(events, params, currentUser);
        }

        // Filter Tasks
        if (searchType === 'tasks' || searchType === 'all') {
            filteredTasks = this.filterTasks(tasks, params, currentUser);
        }

        return of({
            events: filteredEvents,
            tasks: filteredTasks,
            totalCount: filteredEvents.length + filteredTasks.length
        }).pipe(delay(500));
    }

    /**
     * Filter events based on search parameters
     */
    private filterEvents(events: Event[], params: SearchFilterParams, currentUser: string): Event[] {
        let filtered = [...events];

        // Update event statuses
        filtered = filtered.map(event => ({
            ...event,
            status: this.getEventStatus(event.date)
        }));

        // Role filter
        if (params.role && params.role !== 'all') {
            if (params.role === 'organizer') {
                filtered = filtered.filter(e => e.organizerId === currentUser);
            } else if (params.role === 'attendee') {
                filtered = filtered.filter(e =>
                    e.organizerId !== currentUser &&
                    (e.invitees?.some(inv => inv.email.includes(currentUser)) || e.role === 'attendee')
                );
            }
        }

        // Keyword search
        if (params.keyword && params.keyword.trim()) {
            const keyword = params.keyword.toLowerCase();
            filtered = filtered.filter(e =>
                e.title.toLowerCase().includes(keyword) ||
                (e.description && e.description.toLowerCase().includes(keyword)) ||
                (e.location && e.location.toLowerCase().includes(keyword))
            );
        }

        // Date range filter
        if (params.dateFrom) {
            filtered = filtered.filter(e => new Date(e.date) >= new Date(params.dateFrom!));
        }
        if (params.dateTo) {
            filtered = filtered.filter(e => new Date(e.date) <= new Date(params.dateTo!));
        }

        // Event status filter
        if (params.eventStatus && params.eventStatus.length > 0) {
            filtered = filtered.filter(e => params.eventStatus!.includes(e.status));
        }

        return filtered;
    }

    /**
     * Filter tasks based on search parameters
     */
    private filterTasks(tasks: Task[], params: SearchFilterParams, currentUser: string): Task[] {
        let filtered = [...tasks];

        // Role filter
        if (params.role && params.role !== 'all') {
            if (params.role === 'organizer') {
                filtered = filtered.filter(t => t.createdBy === currentUser);
            } else if (params.role === 'assignee') {
                filtered = filtered.filter(t => t.assignedTo === currentUser);
            }
        }

        // Keyword search
        if (params.keyword && params.keyword.trim()) {
            const keyword = params.keyword.toLowerCase();
            filtered = filtered.filter(t =>
                t.title.toLowerCase().includes(keyword) ||
                t.description.toLowerCase().includes(keyword)
            );
        }

        // Date range filter (based on due date)
        if (params.dateFrom) {
            filtered = filtered.filter(t => new Date(t.dueDate) >= new Date(params.dateFrom!));
        }
        if (params.dateTo) {
            filtered = filtered.filter(t => new Date(t.dueDate) <= new Date(params.dateTo!));
        }

        // Task status filter
        if (params.taskStatus && params.taskStatus.length > 0) {
            filtered = filtered.filter(t => params.taskStatus!.includes(t.status));
        }

        // Priority filter
        if (params.priority && params.priority.length > 0) {
            filtered = filtered.filter(t => params.priority!.includes(t.priority));
        }

        return filtered;
    }

    /**
     * Seed sample tasks for testing
     */
    private seedSampleTasks(eventIds: string[]): void {
        if (eventIds.length === 0) return;

        const sampleTasks: Task[] = [
            {
                id: this.generateTaskId(),
                title: 'Prepare presentation materials',
                description: 'Create slides and handouts for the workshop',
                eventId: eventIds[0],
                dueDate: this.getFutureDate(3),
                status: 'in_progress',
                assignedTo: 'colleague1@example.com',
                priority: 'high',
                createdBy: 'demo_user',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: this.generateTaskId(),
                title: 'Book conference room',
                description: 'Reserve the conference room for the meeting',
                eventId: eventIds[0],
                dueDate: this.getFutureDate(2),
                status: 'completed',
                assignedTo: 'colleague2@example.com',
                priority: 'medium',
                createdBy: 'demo_user',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: this.generateTaskId(),
                title: 'Send meeting invitations',
                description: 'Email all stakeholders with meeting details',
                eventId: eventIds[1],
                dueDate: this.getFutureDate(8),
                status: 'pending',
                assignedTo: 'demo_user',
                priority: 'high',
                createdBy: 'demo_user',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];

        this.saveTasks(sampleTasks);
    }
}
