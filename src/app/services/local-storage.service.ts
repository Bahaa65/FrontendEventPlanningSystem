import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Event, EventsResponse, CreateEventRequest, CreateEventResponse, Invitee } from '../models/event.model';
import { AuthResponse } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {
    private readonly EVENTS_KEY = 'app_events';
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
                title: 'Annual Company Retreat',
                date: this.getFutureDate(30),
                time: '09:00',
                location: 'Mountain Resort, Lake Tahoe',
                description: 'Three-day company retreat with team activities and relaxation',
                organizerId: 'hr_manager',
                role: 'attendee',
                status: 'upcoming',
                attendanceStatus: 'going'
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
            location: eventData.location,
            description: eventData.description,
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
     * Clear all local storage data (for testing)
     */
    clearAllData(): void {
        localStorage.removeItem(this.EVENTS_KEY);
        localStorage.removeItem(this.USERS_KEY);
        localStorage.removeItem(this.CURRENT_USER_KEY);
        this.initializeSampleData();
    }
}
