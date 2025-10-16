import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, retry, retryWhen, delay, take, timer } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const router = inject(Router);

  // Skip retry for certain endpoints
  const skipRetryEndpoints = ['/api/auth/login', '/api/auth/register'];
  const shouldRetry = !skipRetryEndpoints.some(endpoint => req.url.includes(endpoint));

  return next(req).pipe(
    retryWhen(errors =>
      errors.pipe(
        delay(1000), // Wait 1 second before retry
        take(shouldRetry ? 2 : 0) // Retry up to 2 times for retryable requests
      )
    ),
    catchError((error: HttpErrorResponse) => {
      const errorInfo = getErrorInfo(error);
      
      if (errorInfo.showSnackbar) {
        showEnhancedSnackbar(snackBar, errorInfo);
      }

      return throwError(() => error);
    })
  );
};

interface ErrorInfo {
  message: string;
  showSnackbar: boolean;
  panelClass: string[];
  duration: number;
  action?: string;
}

function getErrorInfo(error: HttpErrorResponse): ErrorInfo {
  if (error.error instanceof ErrorEvent) {
    // Client-side error
    return {
      message: 'Network error. Please check your internet connection.',
      showSnackbar: true,
      panelClass: ['error-snackbar', 'network-error'],
      duration: 5000,
      action: 'Retry'
    };
  }

  // Server-side error
  switch (error.status) {
    case 0:
      return {
        message: 'Network error. Please check your internet connection.',
        showSnackbar: true,
        panelClass: ['error-snackbar', 'network-error'],
        duration: 5000,
        action: 'Retry'
      };
    case 400:
      return {
        message: error.error?.message || 'Invalid request. Please check your input.',
        showSnackbar: true,
        panelClass: ['error-snackbar', 'validation-error'],
        duration: 4000
      };
    case 401:
      return {
        message: 'Please log in to continue.',
        showSnackbar: false, // Don't show snackbar for 401 errors
        panelClass: [],
        duration: 0
      };
    case 403:
      return {
        message: 'Access forbidden. You do not have permission to perform this action.',
        showSnackbar: true,
        panelClass: ['error-snackbar', 'auth-error'],
        duration: 5000
      };
    case 404:
      return {
        message: 'Resource not found.',
        showSnackbar: true,
        panelClass: ['error-snackbar', 'not-found-error'],
        duration: 4000
      };
    case 409:
      return {
        message: error.error?.message || 'This resource already exists.',
        showSnackbar: true,
        panelClass: ['warning-snackbar'],
        duration: 4000
      };
    case 422:
      return {
        message: error.error?.message || 'Please check your input and try again.',
        showSnackbar: true,
        panelClass: ['warning-snackbar', 'validation-error'],
        duration: 4000
      };
    case 429:
      return {
        message: 'Too many requests. Please wait a moment and try again.',
        showSnackbar: true,
        panelClass: ['warning-snackbar'],
        duration: 6000
      };
    case 500:
    case 502:
    case 503:
    case 504:
      return {
        message: 'Server error. Please try again later.',
        showSnackbar: true,
        panelClass: ['error-snackbar', 'critical-error'],
        duration: 6000,
        action: 'Retry'
      };
    default:
      return {
        message: error.error?.message || `Error ${error.status}: ${error.statusText}`,
        showSnackbar: true,
        panelClass: ['error-snackbar'],
        duration: 5000
      };
  }
}

function showEnhancedSnackbar(snackBar: MatSnackBar, errorInfo: ErrorInfo): void {
  const config = {
    duration: errorInfo.duration,
    horizontalPosition: 'right' as const,
    verticalPosition: 'top' as const,
    panelClass: errorInfo.panelClass
  };

  snackBar.open(errorInfo.message, errorInfo.action || 'Close', config);
}
