import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
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

    this.authService.signup(this.user).subscribe({
      next: (response) => {
        if (response.error) {
          this.errorMessage = response.error;
        } else {
          this.successMessage = 'تم التسجيل بنجاح! جاري تحويلك لصفحة تسجيل الدخول...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        this.errorMessage = 'حدث خطأ أثناء التسجيل. الرجاء المحاولة مرة أخرى.';
        this.isSubmitting = false;
      }
    });
  }
  
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
