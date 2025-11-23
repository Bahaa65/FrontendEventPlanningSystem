import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    this.isLoading = true;
    try {
      this.currentUser = this.authService.getCurrentUser();
      
      if (!this.currentUser || !this.authService.isLoggedIn()) {
        this.handleUnauthorizedAccess();
        return;
      }

    } catch (error) {
      this.handleError(error);
    } finally {
      this.isLoading = false;
    }
  }

  private handleUnauthorizedAccess(): void {
    this.errorMessage = 'Please log in to access the dashboard';
    this.router.navigate(['/login']);
  }

  private handleError(error: any): void {
    console.error('Dashboard error:', error);
    this.errorMessage = 'An error occurred while loading your data';
  }

  logout(): void {
    try {
      this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      this.handleError(error);
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
