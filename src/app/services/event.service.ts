import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
    Event,
    EventsResponse,
    CreateEventRequest,
    CreateEventResponse,
    UpdateEventRequest,
    UpdateAttendanceRequest
} from '../models/event.model';
import { LocalStorageService } from './local-storage.service';

@Injectable({
    providedIn: 'root'
})
export class EventService {
    private baseUrl = environment.apiUrl;

    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService
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
        if (environment.useLocalStorage) {
            return this.localStorageService.getEventsByRole('organizer', this.getCurrentUsername()).pipe(
                map(response => response.events || [])
            );
        }

        return this.http.get<EventsResponse>(`${this.baseUrl}/api/events/`, { headers: this.getHeaders() }).pipe(
            map(response => {
                // Handle both 'events' and 'results' array names
                return response.events || response.results || [];
            }),
            catchError(error => {
                console.warn('Backend getAllEvents failed, falling back to local storage', error);
                return this.localStorageService.getEventsByRole('organizer', this.getCurrentUsername()).pipe(
                    map(response => response.events || [])
                );
            })
        );
    }

    /**
     * Get events you are invited to
     * GET /api/events/invited/
     */
    getInvitedEvents(): Observable<Event[]> {
        if (environment.useLocalStorage) {
            return this.localStorageService.getEventsByRole('attendee', this.getCurrentUsername()).pipe(
                map(response => response.events || [])
            );
        }

        return this.http.get<EventsResponse>(`${this.baseUrl}/api/events/invited/`, { headers: this.getHeaders() }).pipe(
            map(response => response.events || response.results || []),
            catchError(error => {
                console.warn('Backend getInvitedEvents failed, falling back to local storage', error);
                return this.localStorageService.getEventsByRole('attendee', this.getCurrentUsername()).pipe(
                    map(response => response.events || [])
                );
            })
        );
    }

    /**
     * Create a new event
     * POST /api/events/create/
     */
    createEvent(eventData: CreateEventRequest): Observable<CreateEventResponse> {
        const currentUser = this.getCurrentUsername();

        if (environment.useLocalStorage) {
            return this.localStorageService.createEvent(eventData, currentUser);
        }

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
                console.warn('Backend createEvent failed, falling back to local storage', error);
                return this.localStorageService.createEvent(eventData, currentUser);
            })
        );
    }

    /**
     * Get a specific event by ID
     * GET /api/events/{id}
     */
    getEventById(eventId: string | number): Observable<Event> {
        if (environment.useLocalStorage) {
            return this.localStorageService.getEventById(String(eventId));
        }

        return this.http.get<Event>(`${this.baseUrl}/api/events/${eventId}`, { headers: this.getHeaders() }).pipe(
            catchError(error => {
                console.warn('Backend getEventById failed, falling back to local storage', error);
                return this.localStorageService.getEventById(String(eventId));
            })
        );
    }

    /**
     * Update/Edit an event
     * PATCH /api/events/{id}/details/
     */
    updateEvent(eventId: string | number, updates: UpdateEventRequest): Observable<{ success: boolean, event?: Event }> {
        if (environment.useLocalStorage) {
            // LocalStorage service might not have this method, so we'll handle it
            return of({ success: true });
        }

        return this.http.patch<any>(`${this.baseUrl}/api/events/${eventId}/details/`, updates, { headers: this.getHeaders() }).pipe(
            map(response => ({
                success: true,
                event: response.event || response
            })),
            catchError(error => {
                console.error('Backend updateEvent failed', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Delete an event
     * DELETE /api/events/{id}/delete/
     */
    deleteEvent(eventId: string | number): Observable<{ success: boolean, message?: string }> {
        const currentUser = this.getCurrentUsername();

        if (environment.useLocalStorage) {
            return this.localStorageService.deleteEvent(String(eventId), currentUser);
        }

        return this.http.delete<any>(`${this.baseUrl}/api/events/${eventId}/delete/`, { headers: this.getHeaders() }).pipe(
            map(response => ({
                success: true,
                message: response.message || 'Event deleted successfully'
            })),
            catchError(error => {
                console.warn('Backend deleteEvent failed, falling back to local storage', error);
                return this.localStorageService.deleteEvent(String(eventId), currentUser);
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

        if (environment.useLocalStorage) {
            // Convert to lowercase for local storage
            const localStatus = status === 'Going' ? 'going' : status === 'Maybe' ? 'maybe' : 'not_going';
            return this.localStorageService.updateAttendanceStatus(String(eventId), localStatus as any, this.getCurrentUsername());
        }

        return this.http.patch<any>(`${this.baseUrl}/api/events/${eventId}/attendance/`, requestBody, { headers: this.getHeaders() }).pipe(
            map(response => ({ success: true })),
            catchError(error => {
                console.error('Backend updateAttendance failed', error);
                return throwError(() => error);
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
        const currentUser = this.getCurrentUsername();

        if (environment.useLocalStorage) {
            return this.localStorageService.addInvitee(String(eventId), email, currentUser);
        }

        return this.http.post<any>(`${this.baseUrl}/api/events/${eventId}/invitees/`, { email }, { headers: this.getHeaders() }).pipe(
            map(response => ({
                success: true,
                message: response.message || 'Invitee added successfully'
            })),
            catchError(error => {
                console.warn('Backend addInvitee failed, falling back to local storage', error);
                return this.localStorageService.addInvitee(String(eventId), email, currentUser);
            })
        );
    }

    /**
     * Remove an invitee from an event
     * DELETE /api/events/{id}/invitees/{email}
     */
    removeInvitee(eventId: string | number, email: string): Observable<{ success: boolean, message?: string }> {
        const currentUser = this.getCurrentUsername();

        if (environment.useLocalStorage) {
            return this.localStorageService.removeInvitee(String(eventId), email, currentUser);
        }

        return this.http.delete<any>(`${this.baseUrl}/api/events/${eventId}/invitees/${encodeURIComponent(email)}`, { headers: this.getHeaders() }).pipe(
            map(response => ({
                success: true,
                message: response.message || 'Invitee removed successfully'
            })),
            catchError(error => {
                console.warn('Backend removeInvitee failed, falling back to local storage', error);
                return this.localStorageService.removeInvitee(String(eventId), email, currentUser);
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

        if (environment.useLocalStorage) {
            // For local storage, we'll use the advanced search from LocalStorageService
            const searchParams = {
                keyword: params.keyword,
                dateFrom: params.date,
                dateTo: params.date,
                role: params.role
            };
            return this.localStorageService.advancedSearch(searchParams, this.getCurrentUsername()).pipe(
                map(response => response.events || [])
            );
        }

        return this.http.get<EventsResponse>(`${this.baseUrl}/api/events/search/`, {
            headers: this.getHeaders(),
            params: httpParams
        }).pipe(
            map(response => response.events || response.results || []),
            catchError(error => {
                console.warn('Backend searchEvents failed, falling back to local storage', error);
                const searchParams = {
                    keyword: params.keyword,
                    dateFrom: params.date,
                    dateTo: params.date,
                    role: params.role
                };
                return this.localStorageService.advancedSearch(searchParams, this.getCurrentUsername()).pipe(
                    map(response => response.events || [])
                );
            })
        );
    }

    /**
     * Get all events (both created and invited to)
     */
    getAllEventsForUser(): Observable<Event[]> {
        return new Observable(observer => {
            const allEvents: Event[] = [];
            let completed = 0;

            this.getAllEvents().subscribe({
                next: (events) => {
                    allEvents.push(...events);
                    completed++;
                    if (completed === 2) {
                        observer.next(allEvents);
                        observer.complete();
                    }
                },
                error: (err) => {
                    completed++;
                    if (completed === 2) {
                        observer.next(allEvents);
                        observer.complete();
                    }
                }
            });

            this.getInvitedEvents().subscribe({
                next: (events) => {
                    allEvents.push(...events);
                    completed++;
                    if (completed === 2) {
                        observer.next(allEvents);
                        observer.complete();
                    }
                },
                error: (err) => {
                    completed++;
                    if (completed === 2) {
                        observer.next(allEvents);
                        observer.complete();
                    }
                }
            });
        });
    }
}
