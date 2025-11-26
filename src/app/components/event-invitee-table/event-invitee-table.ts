import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../services/event.service';
import { Invitee } from '../../models/event.model';

@Component({
    selector: 'app-event-invitee-table',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './event-invitee-table.html',
    styleUrls: ['./event-invitee-table.css']
})
export class EventInviteeTableComponent {
    @Input() eventId: string = '';
    @Input() invitees: Invitee[] = [];
    @Output() inviteeChanged = new EventEmitter<void>();

    newInviteeEmail: string = '';
    isAdding: boolean = false;
    isRemoving: boolean = false;
    errorMessage: string = '';
    showConfirmDelete: boolean = false;
    inviteeToDelete: string = '';

    constructor(private eventService: EventService) { }

    addInvitee(): void {
        // Validate email
        if (!this.newInviteeEmail.trim()) {
            this.errorMessage = 'Please enter an email address';
            return;
        }

        if (!this.isValidEmail(this.newInviteeEmail)) {
            this.errorMessage = 'Please enter a valid email address';
            return;
        }

        // Check if invitee already exists
        if (this.invitees.some(inv => inv.email === this.newInviteeEmail.trim())) {
            this.errorMessage = 'This invitee already exists';
            return;
        }

        this.isAdding = true;
        this.errorMessage = '';

        this.eventService.addInvitee(this.eventId, this.newInviteeEmail.trim()).subscribe({
            next: () => {
                this.newInviteeEmail = '';
                this.isAdding = false;
                this.inviteeChanged.emit();
            },
            error: (error) => {
                this.errorMessage = 'Failed to add invitee. Please try again.';
                this.isAdding = false;
                console.error('Error adding invitee:', error);
            }
        });
    }

    confirmRemoveInvitee(email: string): void {
        this.inviteeToDelete = email;
        this.showConfirmDelete = true;
    }

    removeInvitee(): void {
        if (!this.inviteeToDelete) return;

        this.isRemoving = true;
        this.errorMessage = '';

        this.eventService.removeInvitee(this.eventId, this.inviteeToDelete).subscribe({
            next: () => {
                this.isRemoving = false;
                this.showConfirmDelete = false;
                this.inviteeToDelete = '';
                this.inviteeChanged.emit();
            },
            error: (error) => {
                this.errorMessage = 'Failed to remove invitee. Please try again.';
                this.isRemoving = false;
                this.showConfirmDelete = false;
                console.error('Error removing invitee:', error);
            }
        });
    }

    cancelDelete(): void {
        this.showConfirmDelete = false;
        this.inviteeToDelete = '';
    }

    isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    getStatusClass(status: string): string {
        return `status-${status}`;
    }
}
