import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';

export interface ErrorConfig {
  showSnackbar?: boolean;
  customMessage?: string;
  retryable?: boolean;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {
  private readonly defaultConfig: MatSnackBarConfig = {
    duration: 5000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
    panelClass: ['error-snackbar']
  };

  private errorSubject = new Subject<any>();
  public error$ = this.errorSubject.asObservable();

  constructor(private snackBar: MatSnackBar) {}

  handleError(error: any, config: ErrorConfig = {}): void {
    const {
      showSnackbar = true,
      customMessage,
      retryable = false,
      duration = 5000
    } = config;

    // Emit error for error boundary
    this.errorSubject.next(error);

    if (!showSnackbar) return;

    let message = customMessage || this.getErrorMessage(error);
    
    if (retryable) {
      message += ' Click to retry.';
    }

    const snackBarConfig: MatSnackBarConfig = {
      ...this.defaultConfig,
      duration,
      panelClass: this.getPanelClass(error)
    };

    this.snackBar.open(message, retryable ? 'Retry' : 'Close', snackBarConfig);
  }

  showSuccess(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Close', {
      ...this.defaultConfig,
      duration,
      panelClass: ['success-snackbar']
    });
  }

  showWarning(message: string, duration: number = 4000): void {
    this.snackBar.open(message, 'Close', {
      ...this.defaultConfig,
      duration,
      panelClass: ['warning-snackbar']
    });
  }

  showInfo(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Close', {
      ...this.defaultConfig,
      duration,
      panelClass: ['info-snackbar']
    });
  }

  private getErrorMessage(error: any): string {
    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 0:
          return 'Network error. Please check your internet connection.';
        case 400:
          return error.error?.message || 'Bad request. Please check your input.';
        case 401:
          return 'Unauthorized. Please log in again.';
        case 403:
          return 'Access denied. You do not have permission to perform this action.';
        case 404:
          return 'Resource not found.';
        case 409:
          return error.error?.message || 'Conflict. The resource already exists.';
        case 422:
          return error.error?.message || 'Validation error. Please check your input.';
        case 429:
          return 'Too many requests. Please try again later.';
        case 500:
          return 'Internal server error. Please try again later.';
        case 502:
        case 503:
        case 504:
          return 'Service temporarily unavailable. Please try again later.';
        default:
          return error.error?.message || `Error ${error.status}: ${error.statusText}`;
      }
    }

    if (error?.message) {
      return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
  }

  private getPanelClass(error: any): string[] {
    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 0:
        case 500:
        case 502:
        case 503:
        case 504:
          return ['error-snackbar', 'critical-error'];
        case 401:
        case 403:
          return ['error-snackbar', 'auth-error'];
        case 400:
        case 422:
          return ['error-snackbar', 'validation-error'];
        case 404:
          return ['error-snackbar', 'not-found-error'];
        default:
          return ['error-snackbar'];
      }
    }

    return ['error-snackbar'];
  }
}
