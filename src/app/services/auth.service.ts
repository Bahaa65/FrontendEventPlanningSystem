import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (token) {
      headers = headers.set('Authorization', `Token ${token}`);
    }
    
    return headers;
  }

  signup(userData: User): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/signup/`, {
      username: userData.username,
      email: userData.email,
      password: userData.password
    }, { headers: this.getHeaders() }).pipe(
      tap(response => {
        // Store the token and user info
        if (response.token) {
          localStorage.setItem('token', response.token);
          const user = {
            username: userData.username,
            email: userData.email
          };
          localStorage.setItem('user', JSON.stringify(user));
        }
      }),
      catchError(error => {
        let errorMessage = 'An error occurred during signup';
        if (error.error?.message) {
          errorMessage = error.error.message;
        }
        return throwError(() => ({ error: errorMessage }));
      })
    );
  }

  login(userData: { username: string, password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login/`, userData, { headers: this.getHeaders() }).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          // Store user information
          const user = {
            username: userData.username
          };
          localStorage.setItem('user', JSON.stringify(user));
        }
      }),
      catchError(error => {
        let errorMessage = 'Invalid credentials';
        if (error.error?.message) {
          errorMessage = error.error.message;
        }
        return throwError(() => ({ error: errorMessage }));
      })
    );
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