export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  organizerId: string;
  role: 'organizer' | 'attendee';
  status: 'upcoming' | 'past';
  attendanceStatus?: 'going' | 'maybe' | 'not_going';
  invitees?: Invitee[];
  tasks?: any[]; // Task[] - Populated when fetching event details
  taskCount?: number; // Quick count without loading full tasks
}

export interface Invitee {
  email: string;
  status: 'invited' | 'accepted' | 'declined';
  userId?: string;
}

export interface CreateEventRequest {
  title: string;
  date: string;
  time: string;
  location?: string;
  description?: string;
  invitees?: string[];
}

export interface EventsResponse {
  events: Event[];
}

export interface CreateEventResponse {
  success: boolean;
  event: Event;
}
