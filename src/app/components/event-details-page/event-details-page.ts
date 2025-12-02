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
            console.log('Event ID from route:', this.eventId);
            this.loadEvent();
        });
    }

    loadEvent(): void {
        this.isLoading = true;
        this.errorMessage = '';

        console.log('Loading event with ID:', this.eventId);

        this.eventService.getEventById(this.eventId).subscribe({
            next: (event) => {
                console.log('Event loaded successfully:', event);
                console.log('Event invitees:', event.invitees);
                console.log('Event role:', event.role);
                this.event = event;
                this.isOrganizer = event.role === 'organizer';
                console.log('isOrganizer:', this.isOrganizer);
                this.calculateAttendanceSummary();
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading event:', error);
                this.errorMessage = 'Failed to load event. Please try again.';
                this.isLoading = false;
            }
        });
    }

    calculateAttendanceSummary(): void {
        if (!this.event?.invitees) {
            console.log('No invitees found');
            return;
        }

        // Reset counts
        this.goingCount = 0;
        this.maybeCount = 0;
        this.notGoingCount = 0;

        // Count based on invitee status
        this.event.invitees.forEach(invitee => {
            console.log('Invitee status:', invitee.status);
            if (invitee.status === 'Going') {
                this.goingCount++;
            } else if (invitee.status === 'Maybe') {
                this.maybeCount++;
            } else if (invitee.status === 'Not Going') {
                this.notGoingCount++;
            }
        });

        console.log('Attendance counts:', { going: this.goingCount, maybe: this.maybeCount, notGoing: this.notGoingCount });
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
