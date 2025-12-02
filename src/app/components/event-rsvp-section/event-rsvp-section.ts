import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-event-rsvp-section',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './event-rsvp-section.html',
    styleUrls: ['./event-rsvp-section.css']
})
export class EventRsvpSectionComponent {
    @Input() eventId: string = '';
    @Input() currentStatus: 'Going' | 'Maybe' | 'Not Going' | undefined;
    @Output() statusChanged = new EventEmitter<void>();

    isUpdating: boolean = false;
    errorMessage: string = '';

    constructor(
        private eventService: EventService,
        private authService: AuthService
    ) { }

    updateStatus(status: 'Going' | 'Maybe' | 'Not Going'): void {
        if (this.isUpdating) return;

        this.isUpdating = true;
        this.errorMessage = '';

        // Get current user email
        const currentUser = this.authService.getCurrentUser();
        const email = currentUser?.email || '';

        this.eventService.updateAttendance(this.eventId, email, status).subscribe({
            next: () => {
                this.currentStatus = status;
                this.isUpdating = false;
                this.statusChanged.emit();
            },
            error: (error) => {
                this.errorMessage = 'Failed to update RSVP. Please try again.';
                this.isUpdating = false;
                console.error('Error updating RSVP:', error);
            }
        });
    }

    isSelected(status: 'Going' | 'Maybe' | 'Not Going'): boolean {
        return this.currentStatus === status;
    }
}
