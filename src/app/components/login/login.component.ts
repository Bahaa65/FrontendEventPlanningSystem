import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  loginData = {
    username: '',
    password: ''
  };
  
  errorMessage = '';
  isSubmitting = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Check if user just signed up and auto-fill username
    const lastUsername = sessionStorage.getItem('lastSignupUsername');
    if (lastUsername) {
      this.loginData.username = lastUsername;
      sessionStorage.removeItem('lastSignupUsername');
    }
    
    // If already logged in, redirect to dashboard
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    this.isSubmitting = true;
    this.errorMessage = '';

    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        if (response.error) {
          this.errorMessage = response.error;
          this.isSubmitting = false;
        } else {
          // Login successful, redirecting to dashboard
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        this.errorMessage = 'An error occurred during login. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  goToSignup(): void {
    this.router.navigate(['/signup']);
  }
}
