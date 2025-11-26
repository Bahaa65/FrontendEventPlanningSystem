import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
    Event,
    EventsResponse,
    CreateEventRequest,
    CreateEventResponse
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

    /**
     * Get events based on role
     * @param role 'organizer' or 'attendee'
     */
    getEvents(role: 'organizer' | 'attendee'): Observable<EventsResponse> {
        const currentUser = this.getCurrentUsername();

        // Use local storage if enabled
        if (environment.useLocalStorage) {
            return this.localStorageService.getEventsByRole(role, currentUser);
        }

        // Otherwise use backend API
        return this.http.get<EventsResponse>(
            `${this.baseUrl}/api/events?role=${role}`,
            { headers: this.getHeaders() }
        ).pipe(
            catchError(error => {
                // Fallback to local storage on error
                console.warn('Backend getEvents failed, falling back to local storage');
                return this.localStorageService.getEventsByRole(role, currentUser);
            })
        );
    }

    /**
     * Get a specific event by ID
     * @param eventId Event ID
     */
    getEventById(eventId: string): Observable<Event> {
        // Use local storage if enabled
        if (environment.useLocalStorage) {
            return this.localStorageService.getEventById(eventId);
        }

        // Otherwise use backend API
        return this.http.get<Event>(
            `${this.baseUrl}/api/events/${eventId}`,
            { headers: this.getHeaders() }
        ).pipe(
            catchError(error => {
                // Fallback to local storage on error
                console.warn('Backend getEventById failed, falling back to local storage');
                return this.localStorageService.getEventById(eventId);
            })
        );
    }

    /**
     * Create a new event
     * @param eventData Event data
     */
    createEvent(eventData: CreateEventRequest): Observable<CreateEventResponse> {
        const currentUser = this.getCurrentUsername();

        // Use local storage if enabled
        if (environment.useLocalStorage) {
            return this.localStorageService.createEvent(eventData, currentUser);
        }

        // Otherwise use backend API
        return this.http.post<CreateEventResponse>(
            `${this.baseUrl}/api/events`,
            eventData,
            { headers: this.getHeaders() }
        ).pipe(
            catchError(error => {
                // Fallback to local storage on error
                console.warn('Backend createEvent failed, falling back to local storage');
                return this.localStorageService.createEvent(eventData, currentUser);
            })
        );
    }

    /**
     * Delete an event (only for organizers)
     * @param eventId Event ID
     */
    deleteEvent(eventId: string): Observable<{ success: boolean }> {
        const currentUser = this.getCurrentUsername();

        // Use local storage if enabled
        if (environment.useLocalStorage) {
            return this.localStorageService.deleteEvent(eventId, currentUser);
        }

        // Otherwise use backend API
        return this.http.delete<{ success: boolean }>(
            `${this.baseUrl}/api/events/${eventId}`,
            { headers: this.getHeaders() }
        ).pipe(
            catchError(error => {
                // Fallback to local storage on error
                console.warn('Backend deleteEvent failed, falling back to local storage');
                return this.localStorageService.deleteEvent(eventId, currentUser);
            })
        );
    }

    /**
     * Update attendance status for an event
     * @param eventId Event ID
     * @param status Attendance status
     */
    updateAttendanceStatus(
        eventId: string,
        status: 'going' | 'maybe' | 'not_going'
    ): Observable<{ success: boolean }> {
        const currentUser = this.getCurrentUsername();

        // Use local storage if enabled
        if (environment.useLocalStorage) {
            return this.localStorageService.updateAttendanceStatus(eventId, status, currentUser);
        }

        // Otherwise use backend API
        return this.http.patch<{ success: boolean }>(
            `${this.baseUrl}/api/events/${eventId}/attendance`,
            { status },
            { headers: this.getHeaders() }
        ).pipe(
            catchError(error => {
                // Fallback to local storage on error
                console.warn('Backend updateAttendanceStatus failed, falling back to local storage');
                return this.localStorageService.updateAttendanceStatus(eventId, status, currentUser);
            })
        );
    }

    /**
     * Update attendance (alias for updateAttendanceStatus to match specification)
     * @param id Event ID
     * @param status Attendance status
     */
    updateAttendance(
        id: string,
        status: 'going' | 'maybe' | 'not_going'
    ): Observable<{ success: boolean }> {
        return this.updateAttendanceStatus(id, status);
    }

    /**
     * Add an invitee to an event (organizer only)
     * @param eventId Event ID
     * @param email Invitee email
     */
    addInvitee(
        eventId: string,
        email: string
    ): Observable<{ success: boolean }> {
        const currentUser = this.getCurrentUsername();

        // Use local storage if enabled
        if (environment.useLocalStorage) {
            return this.localStorageService.addInvitee(eventId, email, currentUser);
        }

        // Otherwise use backend API
        return this.http.post<{ success: boolean }>(
            `${this.baseUrl}/api/events/${eventId}/invitees`,
            { email },
            { headers: this.getHeaders() }
        ).pipe(
            catchError(error => {
                // Fallback to local storage on error
                console.warn('Backend addInvitee failed, falling back to local storage');
                return this.localStorageService.addInvitee(eventId, email, currentUser);
            })
        );
    }

    /**
     * Remove an invitee from an event (organizer only)
     * @param eventId Event ID
     * @param email Invitee email
     */
    removeInvitee(
        eventId: string,
        email: string
    ): Observable<{ success: boolean }> {
        const currentUser = this.getCurrentUsername();

        // Use local storage if enabled
        if (environment.useLocalStorage) {
            return this.localStorageService.removeInvitee(eventId, email, currentUser);
        }

        // Otherwise use backend API
        return this.http.delete<{ success: boolean }>(
            `${this.baseUrl}/api/events/${eventId}/invitees/${encodeURIComponent(email)}`,
            { headers: this.getHeaders() }
        ).pipe(
            catchError(error => {
                // Fallback to local storage on error
                console.warn('Backend removeInvitee failed, falling back to local storage');
                return this.localStorageService.removeInvitee(eventId, email, currentUser);
            })
        );
    }
}
