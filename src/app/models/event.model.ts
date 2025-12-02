export interface Event {
  id: string | number;
  title: string;
  date: string;
  time?: string;
  location: string;
  description: string;
  organizerId?: string;
  organizer?: string;
  role?: 'organizer' | 'attendee';
  status?: 'upcoming' | 'past';
  attendanceStatus?: 'Going' | 'Maybe' | 'Not Going';
  invitees?: Invitee[];
  tasks?: any[]; // Task[] - Populated when fetching event details
  taskCount?: number; // Quick count without loading full tasks
}

export interface Invitee {
  email: string;
  status: 'Going' | 'Maybe' | 'Not Going' | 'Pending';
  userId?: string;
  name?: string;
}

export interface CreateEventRequest {
  title: string;
  date: string;
  location?: string;
  description?: string;
  invitees?: string[];
}

export interface UpdateEventRequest {
  title?: string;
  date?: string;
  location?: string;
  description?: string;
}

export interface UpdateAttendanceRequest {
  email: string;
  status: 'Going' | 'Maybe' | 'Not Going';
}

export interface EventsResponse {
  events?: Event[];
  results?: Event[];  // Backend might use 'results' instead of 'events'
}

export interface CreateEventResponse {
  success?: boolean;
  event?: Event;
  id?: number | string;
  title?: string;
  message?: string;
}
