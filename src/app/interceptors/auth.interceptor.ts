import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);

    // Get token from localStorage
    const token = localStorage.getItem('token');

    // Clone the request and add authorization header if token exists
    let authReq = req;
    if (token && !req.headers.has('Authorization')) {
        authReq = req.clone({
            setHeaders: {
                Authorization: `Token ${token}`
            }
        });
    }

    // Handle the request and catch errors
    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            // Handle 401 Unauthorized - token expired or invalid
            if (error.status === 401) {
                console.warn('Authentication failed. Redirecting to login...');
                // Clear invalid token
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Redirect to login page
                router.navigate(['/login']);
            }

            // Handle 403 Forbidden - insufficient permissions
            if (error.status === 403) {
                console.error('Access forbidden:', error);
            }

            // Handle 0 - Network error (backend not reachable)
            if (error.status === 0) {
                console.error('Network error: Cannot connect to backend server');
            }

            return throwError(() => error);
        })
    );
};
