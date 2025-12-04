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
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
     if (token) headers = headers.set('Authorization', `Token ${token}`); 
    return headers;
  }

  private getCurrentUsername(): string {
    const user = this.authService.getCurrentUser();
    return user?.username || 'demo_user';
  }

  /** ==================== EVENTS ==================== */

  getAllEvents(): Observable<Event[]> {
    return this.http.get<EventsResponse>(`${this.baseUrl}/api/events/`, { headers: this.getHeaders() }).pipe(
 map(res => {
  // Unwrap any XrayWrapper
  const data = JSON.parse(JSON.stringify(res));
  return data.events || data.results || data || [];
})

,
      catchError(err => throwError(() => err))
    );
  }

  getInvitedEvents(): Observable<Event[]> {
    return this.http.get<EventsResponse>(`${this.baseUrl}/api/events/invited/`, { headers: this.getHeaders() }).pipe(
      map(res => {
  const data = JSON.parse(JSON.stringify(res)); // unwraps XrayWrapper
  return data.events || data.results || data || [];
})
,
      catchError(err => throwError(() => err))
    );
  }

getEventById(eventId: string | number): Observable<Event> {
  return this.http
    .get<any>(`${this.baseUrl}/api/events/${eventId}`, {
      headers: this.getHeaders()
    })
    .pipe(
      map(res => res.event ?? res), // Simply unwrap, no cloning needed
      catchError(err => throwError(() => err))
    );
}


  createEvent(eventData: CreateEventRequest): Observable<CreateEventResponse> {
    return this.http.post<CreateEventResponse>(`${this.baseUrl}/api/events/create/`, eventData, { headers: this.getHeaders() }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  updateEvent(eventId: string | number, updates: UpdateEventRequest): Observable<{ success: boolean; event?: Event }> {
    return this.http.patch<any>(`${this.baseUrl}/api/events/${eventId}/details/`, updates, { headers: this.getHeaders() }).pipe(
      map(res => {
  const data = JSON.parse(JSON.stringify(res)); // unwraps XrayWrapper
  return data.events || data.results || data || [];
})
,
      catchError(err => throwError(() => err))
    );
  }
  

  deleteEvent(eventId: string | number): Observable<{ success: boolean; message?: string }> {
    return this.http.delete<any>(`${this.baseUrl}/api/events/${eventId}/delete/`, { headers: this.getHeaders() }).pipe(
      map(res => ({ success: true, message: res.message || 'Event deleted successfully' })),
      catchError(err => throwError(() => err))
    );
  }

  /** ==================== ATTENDANCE ==================== */

  updateAttendance(eventId: string | number, email: string, status: 'Going' | 'Maybe' | 'Not Going'): Observable<{ success: boolean }> {
    const body: UpdateAttendanceRequest = { email, status };
    return this.http.patch<any>(`${this.baseUrl}/api/events/${eventId}/attendance/`, body, { headers: this.getHeaders() }).pipe(
      map(() => ({ success: true })),
      catchError(err => throwError(() => err))
    );
  }

  /** ==================== INVITEE ==================== */

  addInvitee(eventId: string | number, email: string): Observable<{ success: boolean; message?: string }> {
    return this.http.post<any>(`${this.baseUrl}/api/events/${eventId}/invitees/`, { email }, { headers: this.getHeaders() }).pipe(
      map(res => ({ success: true, message: res.message || 'Invitee added successfully' })),
      catchError(err => throwError(() => err))
    );
  }

  removeInvitee(eventId: string | number, email: string): Observable<{ success: boolean; message?: string }> {
    return this.http.delete<any>(`${this.baseUrl}/api/events/${eventId}/invitees/${encodeURIComponent(email)}`, { headers: this.getHeaders() }).pipe(
      map(res => ({ success: true, message: res.message || 'Invitee removed successfully' })),
      catchError(err => throwError(() => err))
    );
  }

  /** ==================== SEARCH ==================== */

  searchEvents(params: { keyword?: string; date?: string; role?: 'organizer' | 'attendee' }): Observable<Event[]> {
    let httpParams = new HttpParams();
    if (params.keyword) httpParams = httpParams.set('keyword', params.keyword);
    if (params.date) httpParams = httpParams.set('date', params.date);
    if (params.role) httpParams = httpParams.set('role', params.role);

    return this.http.get<EventsResponse>(`${this.baseUrl}/api/events/search/`, { headers: this.getHeaders(), params: httpParams }).pipe(
      map(res => res.events || res.results || []),
      catchError(err => throwError(() => err))
    );
  }

  /** ==================== GET ALL EVENTS FOR USER ==================== */

  getAllEventsForUser(): Observable<Event[]> {
    return forkJoin([this.getAllEvents(), this.getInvitedEvents()]).pipe(
      map(([created, invited]) => [...created, ...invited])
    );
  }
}
