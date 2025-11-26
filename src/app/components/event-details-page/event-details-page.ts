import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';
import { EventHeaderCardComponent } from '../event-header-card/event-header-card';
import { EventDescriptionBoxComponent } from '../event-description-box/event-description-box';
import { EventRsvpSectionComponent } from '../event-rsvp-section/event-rsvp-section';
import { EventInviteeTableComponent } from '../event-invitee-table/event-invitee-table';

@Component({
    selector: 'app-event-details-page',
    standalone: true,
    imports: [
        CommonModule,
        EventHeaderCardComponent,
        EventDescriptionBoxComponent,
        EventRsvpSectionComponent,
        EventInviteeTableComponent
    ],
    templateUrl: './event-details-page.html',
    styleUrls: ['./event-details-page.css']
})
export class EventDetailsPageComponent implements OnInit {
    event: Event | null = null;
    eventId: string = '';
    isOrganizer: boolean = false;
    isLoading: boolean = true;
    errorMessage: string = '';
    showDeleteModal: boolean = false;

    // Attendance summary for attendees
    goingCount: number = 0;
    maybeCount: number = 0;
    notGoingCount: number = 0;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private eventService: EventService
    ) { }

    ngOnInit(): void {
        // Get event ID from route parameters
        this.route.params.subscribe(params => {
            this.eventId = params['id'];
            this.loadEvent();
        });
    }

    loadEvent(): void {
        this.isLoading = true;
        this.errorMessage = '';

        this.eventService.getEventById(this.eventId).subscribe({
            next: (event) => {
                this.event = event;
                this.isOrganizer = event.role === 'organizer';
                this.calculateAttendanceSummary();
                this.isLoading = false;
            },
            error: (error) => {
                this.errorMessage = 'Failed to load event. Please try again.';
                this.isLoading = false;
                console.error('Error loading event:', error);
            }
        });
    }

    calculateAttendanceSummary(): void {
        if (!this.event?.invitees) {
            return;
        }

        // Reset counts
        this.goingCount = 0;
        this.maybeCount = 0;
        this.notGoingCount = 0;

        // Count based on invitee acceptance status
        this.event.invitees.forEach(invitee => {
            if (invitee.status === 'accepted') {
                this.goingCount++;
            }
            // You can extend this if you track maybe/declined in invitee status
        });
    }

    onRsvpChanged(): void {
        // Refresh event data after RSVP change
        this.loadEvent();
    }

    refreshEvent(): void {
        // Refresh event data after invitee changes
        this.loadEvent();
    }

    onDeleteEvent(): void {
        this.showDeleteModal = true;
    }

    confirmDelete(): void {
        if (!this.eventId) return;

        this.eventService.deleteEvent(this.eventId).subscribe({
            next: () => {
                this.router.navigate(['/dashboard']);
            },
            error: (error) => {
                this.errorMessage = 'Failed to delete event. Please try again.';
                console.error('Error deleting event:', error);
                this.showDeleteModal = false;
            }
        });
    }

    cancelDelete(): void {
        this.showDeleteModal = false;
    }
}
