import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss']
})
export class SignupComponent {
  user: User = {
    username: '',
    email: '',
    password: ''
  };
  
  errorMessage: string = '';
  successMessage: string = '';
  isSubmitting: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.user.username || !this.user.email || !this.user.password) {
      this.errorMessage = 'Please fill in all required fields';
      this.isSubmitting = false;
      return;
    }

    this.authService.signup(this.user).subscribe({
      next: (response) => {
        if (response.error) {
          this.errorMessage = response.error;
        } else {
          this.successMessage = 'Registration successful! Please login with your new account.';
          // Store username temporarily to auto-fill login form
          sessionStorage.setItem('lastSignupUsername', this.user.username || '');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        this.errorMessage = error.error || 'An error occurred during registration. Please try again.';
        this.isSubmitting = false;
      }
    });
  }
  
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}