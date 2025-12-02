import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventService } from '../../services/event.service';
import { CreateEventRequest } from '../../models/event.model';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './create-event.html',
  styleUrls: ['./create-event.scss']
})
export class CreateEventComponent implements OnInit {
  eventForm: FormGroup;
  isSubmitting: boolean = false;
  error: string | null = null;
  successMessage: string | null = null;

  // Invitees management
  inviteeEmail: string = '';
  invitees: string[] = [];
  inviteeError: string | null = null;

  // Show confirmation dialog
  showConfirmDialog: boolean = false;

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private router: Router
  ) {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      date: ['', Validators.required],
      time: ['', Validators.required],
      location: ['', Validators.maxLength(200)],
      description: ['', Validators.maxLength(1000)]
    });
  }

  ngOnInit(): void {
    // Set minimum date to today
    this.setMinDate();
  }

  setMinDate(): void {
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
    if (dateInput) {
      dateInput.setAttribute('min', today);
    }
  }

  // Form getters for validation
  get title() {
    return this.eventForm.get('title');
  }

  get date() {
    return this.eventForm.get('date');
  }

  get time() {
    return this.eventForm.get('time');
  }

  get location() {
    return this.eventForm.get('location');
  }

  get description() {
    return this.eventForm.get('description');
  }

  // Invitee Management
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  addInvitee(): void {
    this.inviteeError = null;
    const email = this.inviteeEmail.trim();

    if (!email) {
      this.inviteeError = 'Please enter an email address';
      return;
    }

    if (!this.isValidEmail(email)) {
      this.inviteeError = 'Please enter a valid email address';
      return;
    }

    if (this.invitees.includes(email)) {
      this.inviteeError = 'This email has already been added';
      return;
    }

    this.invitees.push(email);
    this.inviteeEmail = '';
  }

  removeInvitee(email: string): void {
    this.invitees = this.invitees.filter(e => e !== email);
  }

  // Date validation
  validateDate(): void {
    const dateValue = this.eventForm.get('date')?.value;
    if (dateValue) {
      const selectedDate = new Date(dateValue);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        this.eventForm.get('date')?.setErrors({ pastDate: true });
      }
    }
  }

  // Form submission
  onSubmit(): void {
    // Validate form
    if (this.eventForm.invalid) {
      Object.keys(this.eventForm.controls).forEach(key => {
        const control = this.eventForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.validateDate();
    if (this.eventForm.get('date')?.hasError('pastDate')) {
      return;
    }

    // Show confirmation if there are invitees
    if (this.invitees.length > 0) {
      this.showConfirmDialog = true;
    } else {
      this.submitEvent();
    }
  }

  cancelConfirm(): void {
    this.showConfirmDialog = false;
  }

  confirmSubmit(): void {
    this.showConfirmDialog = false;
    this.submitEvent();
  }

  submitEvent(): void {
    this.isSubmitting = true;
    this.error = null;

    // Note: time is not sent to backend as per API specification
    const eventData: CreateEventRequest = {
      title: this.eventForm.get('title')?.value,
      date: this.eventForm.get('date')?.value,
      location: this.eventForm.get('location')?.value || undefined,
      description: this.eventForm.get('description')?.value || undefined,
      invitees: this.invitees.length > 0 ? this.invitees : undefined
    };

    this.eventService.createEvent(eventData).subscribe({
      next: (response) => {
        this.successMessage = 'Event created successfully!';

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error: (error) => {
        this.error = error.error || 'Failed to create event. Please try again.';
        this.isSubmitting = false;

        // Scroll to top to show error
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }

  // Helper to check if field has error
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.eventForm.get(fieldName);
    return !!(field?.hasError(errorType) && field?.touched);
  }
}
