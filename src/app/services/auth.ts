import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  signup(userData: User): Observable<AuthResponse> {
    // في حالة وجود backend حقيقي
    // return this.http.post<AuthResponse>(`${this.baseUrl}/api/auth/signup/`, userData);
    
    // موك API للتطوير
    return of({
      id: 'user_id_123',
      username: userData.username,
      email: userData.email
    } as AuthResponse).pipe(
      tap(response => console.log('Signup successful:', response)),
      catchError(error => {
        console.error('Signup error:', error);
        return of({ error: 'Email already exists' });
      })
    );
  }

  login(userData: { email: string, password: string }): Observable<AuthResponse> {
    // في حالة وجود backend حقيقي
    // return this.http.post<AuthResponse>(`${this.baseUrl}/api/auth/login/`, userData);
    
    // موك API للتطوير
    if (userData.email && userData.password) {
      const mockResponse: AuthResponse = {
        token: 'mock-jwt-token',
        user: {
          id: 'user_id_123',
          username: 'bahaa',
          email: userData.email
        }
      };
      
      return of(mockResponse).pipe(
        tap(response => {
          if (response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
          }
        })
      );
    } else {
      return of({ error: 'Invalid credentials' });
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}
