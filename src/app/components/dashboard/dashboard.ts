import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { EventService } from '../../services/event.service';
import { User } from '../../models/user.model';
import { Event } from '../../models/event.model';

type TabType = 'my-events' | 'invited-events';
type FilterType = 'all' | 'upcoming' | 'past';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;

  myEvents: Event[] = [];
  invitedEvents: Event[] = [];
  displayedEvents: Event[] = [];

  activeTab: TabType = 'my-events';
  isLoading: boolean = true;
  isLoadingEvents: boolean = false;
  error: string | null = null;

  searchQuery: string = '';
  activeFilter: FilterType = 'all';

  showDeleteDialog: boolean = false;
  eventToDelete: Event | null = null;

  constructor(
    private authService: AuthService,
    private eventService: EventService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    if (!this.currentUser || !this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = false;
    this.loadEvents();
  }

  loadEvents(): void {
    this.isLoadingEvents = true;
    this.error = null;

    if (this.activeTab === 'my-events') {
      this.eventService.getAllEvents().subscribe({
        next: (events) => {
          this.myEvents = events || [];
          this.updateDisplayedEvents();
          this.isLoadingEvents = false;
        },
        error: (error) => {
          this.error = error.error || 'Failed to load events';
          this.isLoadingEvents = false;
          console.error('Error loading events:', error);
        }
      });
    } else {
      this.eventService.getInvitedEvents().subscribe({
        next: (events) => {
          this.invitedEvents = events || [];
          this.updateDisplayedEvents();
          this.isLoadingEvents = false;
        },
        error: (error) => {
          this.error = error.error || 'Failed to load invited events';
          this.isLoadingEvents = false;
          console.error('Error loading invited events:', error);
        }
      });
    }
  }

  switchTab(tab: TabType): void {
    if (this.activeTab === tab) return;

    this.activeTab = tab;
    this.searchQuery = '';
    this.activeFilter = 'all';

    if (tab === 'my-events' && this.myEvents.length === 0) {
      this.loadEvents();
    } else if (tab === 'invited-events' && this.invitedEvents.length === 0) {
      this.loadEvents();
    } else {
      this.updateDisplayedEvents();
    }
  }

  updateDisplayedEvents(): void {
    let events = this.activeTab === 'my-events' ? this.myEvents : this.invitedEvents;

    if (this.activeFilter === 'upcoming') {
      events = events.filter(e => e.status === 'upcoming');
    } else if (this.activeFilter === 'past') {
      events = events.filter(e => e.status === 'past');
    }

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      events = events.filter(e =>
        e.title.toLowerCase().includes(query) ||
        (e.description && e.description.toLowerCase().includes(query)) ||
        (e.location && e.location.toLowerCase().includes(query))
      );
    }

    this.displayedEvents = events;
  }

  onSearchChange(): void { this.updateDisplayedEvents(); }
  setFilter(filter: FilterType): void { this.activeFilter = filter; this.updateDisplayedEvents(); }

  viewEvent(event: Event): void { this.router.navigate(['/events', event.id]); }

  confirmDelete(event: Event): void {
    if (event.role !== 'organizer') return;
    this.eventToDelete = event;
    this.showDeleteDialog = true;
  }

  cancelDelete(): void { this.showDeleteDialog = false; this.eventToDelete = null; }

  deleteEvent(): void {
    if (!this.eventToDelete) return;
    const eventId = this.eventToDelete.id;

    this.eventService.deleteEvent(eventId).subscribe({
      next: () => {
        this.myEvents = this.myEvents.filter(e => e.id !== eventId);
        this.updateDisplayedEvents();
        this.cancelDelete();
      },
      error: (error) => {
        this.error = error.error || 'Failed to delete event';
        this.cancelDelete();
      }
    });
  }

  retryLoad(): void { this.loadEvents(); }
  goToCreateEvent(): void { this.router.navigate(['/events/create']); }
  logout(): void { this.authService.logout(); this.router.navigate(['/login']); }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  isUpcoming(event: Event): boolean { return event.status === 'upcoming'; }

  get upcomingEventsCount(): number { return this.myEvents.filter(e => e.status === 'upcoming').length; }

  get upcomingNext7Days(): number {
    const now = new Date();
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return this.myEvents.filter(e => e.status === 'upcoming' && new Date(e.date) >= now && new Date(e.date) <= next7Days).length;
  }

  get pendingInvitations(): number { return this.invitedEvents.filter(e => !e.attendanceStatus || e.attendanceStatus === 'Maybe').length; }
}
  