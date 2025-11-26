import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../services/event.service';

@Component({
    selector: 'app-event-rsvp-section',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './event-rsvp-section.html',
    styleUrls: ['./event-rsvp-section.css']
})
export class EventRsvpSectionComponent {
    @Input() eventId: string = '';
    @Input() currentStatus: 'going' | 'maybe' | 'not_going' | undefined;
    @Output() statusChanged = new EventEmitter<void>();

    isUpdating: boolean = false;
    errorMessage: string = '';

    constructor(private eventService: EventService) { }

    updateStatus(status: 'going' | 'maybe' | 'not_going'): void {
        if (this.isUpdating) return;

        this.isUpdating = true;
        this.errorMessage = '';

        this.eventService.updateAttendance(this.eventId, status).subscribe({
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

    isSelected(status: 'going' | 'maybe' | 'not_going'): boolean {
        return this.currentStatus === status;
    }
}
