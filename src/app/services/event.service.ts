import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
    Event,
    EventsResponse,
    CreateEventRequest,
    CreateEventResponse,
    UpdateEventRequest,
    UpdateAttendanceRequest
} from '../models/event.model';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class EventService {
    private baseUrl = environment.apiUrl;

    constructor(
        private http: HttpClient
    ) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        let headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        if (token) {
            headers = headers.set('Authorization', `Token ${token}`);
        }

        return headers;
    }

    private getCurrentUsername(): string {
        const user = localStorage.getItem('user');
        if (user) {
            const parsedUser = JSON.parse(user);
            return parsedUser.username || 'demo_user';
        }
        return 'demo_user';
    }

    private getCurrentUserEmail(): string {
        const user = localStorage.getItem('user');
        if (user) {
            const parsedUser = JSON.parse(user);
            return parsedUser.email || '';
        }
        return '';
    }

    // ==================== EVENT MANAGEMENT ====================

    /**
     * Get all events created by the current user
     * GET /api/events/
     */
    getAllEvents(): Observable<Event[]> {
        return this.http.get<EventsResponse>(`${this.baseUrl}/api/events/`, { headers: this.getHeaders() }).pipe(
            map(response => {
                // Handle both 'events' and 'results' array names
                return response.events || response.results || [];
            }),
            catchError(error => {
                console.error('Backend getAllEvents failed:', error);
                return throwError(() => ({
                    error: error.status === 0
                        ? 'Cannot connect to server'
                        : error.error?.message || 'Failed to load events'
                }));
            })
        );
    }

    /**
     * Get events you are invited to
     * GET /api/events/invited/
     */
    getInvitedEvents(): Observable<Event[]> {
        return this.http.get<EventsResponse>(`${this.baseUrl}/api/events/invited/`, { headers: this.getHeaders() }).pipe(
            map(response => response.events || response.results || []),
            catchError(error => {
                console.error('Backend getInvitedEvents failed:', error);
                return throwError(() => ({
                    error: error.status === 0
                        ? 'Cannot connect to server'
                        : error.error?.message || 'Failed to load invited events'
                }));
            })
        );
    }

    /**
     * Create a new event
     * POST /api/events/create/
     */
    createEvent(eventData: CreateEventRequest): Observable<CreateEventResponse> {
        return this.http.post<any>(`${this.baseUrl}/api/events/create/`, eventData, { headers: this.getHeaders() }).pipe(
            map(response => {
                // Normalize response structure
                return {
                    success: true,
                    event: response.event || response,
                    id: response.id,
                    message: response.message
                };
            }),
            catchError(error => {
                console.error('Backend createEvent failed:', error);
                let errorMessage = 'Failed to create event';
                if (error.status === 0) {
                    errorMessage = 'Cannot connect to server';
                } else if (error.error?.message) {
                    errorMessage = error.error.message;
                }
                return throwError(() => ({ error: errorMessage }));
            })
        );
    }

    /**
     * Get a specific event by ID
     * GET /api/events/{id}
     */
    getEventById(eventId: string | number): Observable<Event> {
        return this.http.get<Event>(`${this.baseUrl}/api/events/${eventId}`, { headers: this.getHeaders() }).pipe(
            catchError(error => {
                console.error('Backend getEventById failed:', error);
                let errorMessage = 'Failed to load event details';
                if (error.status === 0) {
                    errorMessage = 'Cannot connect to server';
                } else if (error.status === 404) {
                    errorMessage = 'Event not found';
                } else if (error.error?.message) {
                    errorMessage = error.error.message;
                }
                return throwError(() => ({ error: errorMessage }));
            })
        );
    }

    /**
     * Update/Edit an event
     * PATCH /api/events/{id}/details/
     */
    updateEvent(eventId: string | number, updates: UpdateEventRequest): Observable<{ success: boolean, event?: Event }> {
        return this.http.patch<any>(`${this.baseUrl}/api/events/${eventId}/details/`, updates, { headers: this.getHeaders() }).pipe(
            map(response => ({
                success: true,
                event: response.event || response
            })),
            catchError(error => {
                console.error('Backend updateEvent failed:', error);
                let errorMessage = 'Failed to update event';
                if (error.status === 0) {
                    errorMessage = 'Cannot connect to server';
                } else if (error.error?.message) {
                    errorMessage = error.error.message;
                }
                return throwError(() => ({ error: errorMessage }));
            })
        );
    }

    /**
     * Delete an event
     * DELETE /api/events/{id}/delete/
     */
    deleteEvent(eventId: string | number): Observable<{ success: boolean, message?: string }> {
        return this.http.delete<any>(`${this.baseUrl}/api/events/${eventId}/delete/`, { headers: this.getHeaders() }).pipe(
            map(response => ({
                success: true,
                message: response.message || 'Event deleted successfully'
            })),
            catchError(error => {
                console.error('Backend deleteEvent failed:', error);
                let errorMessage = 'Failed to delete event';
                if (error.status === 0) {
                    errorMessage = 'Cannot connect to server';
                } else if (error.status === 403) {
                    errorMessage = 'You do not have permission to delete this event';
                } else if (error.error?.message) {
                    errorMessage = error.error.message;
                }
                return throwError(() => ({ error: errorMessage }));
            })
        );
    }

    // ==================== ATTENDANCE MANAGEMENT ====================

    /**
     * Update attendance status for an event
     * PATCH /api/events/{id}/attendance/
     * Body: { email: string, status: 'Going' | 'Maybe' | 'Not Going' }
     */
    updateAttendance(eventId: string | number, email: string, status: 'Going' | 'Maybe' | 'Not Going'): Observable<{ success: boolean }> {
        const requestBody: UpdateAttendanceRequest = {
            email: email,
            status: status
        };

        return this.http.patch<any>(`${this.baseUrl}/api/events/${eventId}/attendance/`, requestBody, { headers: this.getHeaders() }).pipe(
            map(response => ({ success: true })),
            catchError(error => {
                console.error('Backend updateAttendance failed:', error);
                let errorMessage = 'Failed to update attendance';
                if (error.status === 0) {
                    errorMessage = 'Cannot connect to server';
                } else if (error.error?.message) {
                    errorMessage = error.error.message;
                }
                return throwError(() => ({ error: errorMessage }));
            })
        );
    }

    // ==================== INVITEE MANAGEMENT ====================

    /**
     * Add a new invitee to an event
     * POST /api/events/{id}/invitees/
     * Body: { email: string }
     */
    addInvitee(eventId: string | number, email: string): Observable<{ success: boolean, message?: string }> {
        return this.http.post<any>(`${this.baseUrl}/api/events/${eventId}/invitees/`, { email }, { headers: this.getHeaders() }).pipe(
            map(response => ({
                success: true,
                message: response.message || 'Invitee added successfully'
            })),
            catchError(error => {
                console.error('Backend addInvitee failed:', error);
                let errorMessage = 'Failed to add invitee';
                if (error.status === 0) {
                    errorMessage = 'Cannot connect to server';
                } else if (error.status === 400) {
                    errorMessage = error.error?.error || 'Invalid email or invitee already exists';
                } else if (error.error?.message) {
                    errorMessage = error.error.message;
                }
                return throwError(() => ({ error: errorMessage }));
            })
        );
    }

    /**
     * Remove an invitee from an event
     * DELETE /api/events/{id}/invitees/{email}
     */
    removeInvitee(eventId: string | number, email: string): Observable<{ success: boolean, message?: string }> {
        return this.http.delete<any>(`${this.baseUrl}/api/events/${eventId}/invitees/${encodeURIComponent(email)}`, { headers: this.getHeaders() }).pipe(
            map(response => ({
                success: true,
                message: response.message || 'Invitee removed successfully'
            })),
            catchError(error => {
                console.error('Backend removeInvitee failed:', error);
                let errorMessage = 'Failed to remove invitee';
                if (error.status === 0) {
                    errorMessage = 'Cannot connect to server';
                } else if (error.error?.message) {
                    errorMessage = error.error.message;
                }
                return throwError(() => ({ error: errorMessage }));
            })
        );
    }

    // ==================== SEARCH FUNCTIONALITY ====================

    /**
     * Search events with various filters
     * GET /api/events/search/?keyword=...&date=...&role=...
     */
    searchEvents(params: {
        keyword?: string;
        date?: string;
        role?: 'organizer' | 'attendee';
    }): Observable<Event[]> {
        let httpParams = new HttpParams();

        if (params.keyword) {
            httpParams = httpParams.set('keyword', params.keyword);
        }
        if (params.date) {
            httpParams = httpParams.set('date', params.date);
        }
        if (params.role) {
            httpParams = httpParams.set('role', params.role);
        }

        return this.http.get<EventsResponse>(`${this.baseUrl}/api/events/search/`, {
            headers: this.getHeaders(),
            params: httpParams
        }).pipe(
            map(response => response.events || response.results || []),
            catchError(error => {
                console.error('Backend searchEvents failed:', error);
                let errorMessage = 'Failed to search events';
                if (error.status === 0) {
                    errorMessage = 'Cannot connect to server';
                } else if (error.error?.message) {
                    errorMessage = error.error.message;
                }
                return throwError(() => ({ error: errorMessage }));
            })
        );
    }

    /** ==================== GET ALL EVENTS FOR USER ==================== */

    getAllEventsForUser(): Observable<Event[]> {
        return forkJoin([this.getAllEvents(), this.getInvitedEvents()]).pipe(
            map(([created, invited]) => [...created, ...invited])
        );
    }
}
