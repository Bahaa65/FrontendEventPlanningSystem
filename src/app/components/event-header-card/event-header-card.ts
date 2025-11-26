import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Event } from '../../models/event.model';

@Component({
    selector: 'app-event-header-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './event-header-card.html',
    styleUrls: ['./event-header-card.css']
})
export class EventHeaderCardComponent {
    @Input() event: Event | null = null;
    @Input() isOrganizer: boolean = false;
    @Output() deleteEvent = new EventEmitter<void>();

    onDelete(): void {
        this.deleteEvent.emit();
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}
