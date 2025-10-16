import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, finalize, retry, retryWhen, delayWhen, take } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';
import { ErrorHandlingService } from '../services/error-handling.service';

export function loadingErrorInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const loadingService = inject(LoadingService);
  const errorHandlingService = inject(ErrorHandlingService);
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second

  // Skip loading for certain requests
  if (shouldSkipLoading(request)) {
    return next(request);
  }

  // Show loading
  loadingService.show();

  return next(request).pipe(
    retryWhen(errors =>
      errors.pipe(
        delayWhen((error, index) => {
          // Only retry for network errors and 5xx errors
          if (shouldRetry(error, index, maxRetries)) {
            return timer(retryDelay * (index + 1));
          }
          return throwError(error);
        }),
        take(maxRetries + 1)
      )
    ),
    catchError((error: HttpErrorResponse) => {
      // Handle different types of errors
      if (isNetworkError(error)) {
        errorHandlingService.handleError(error, {
          customMessage: 'Network error. Please check your internet connection.',
          retryable: true
        });
      } else if (isServerError(error)) {
        errorHandlingService.handleError(error, {
          customMessage: 'Server error. Please try again later.',
          retryable: true
        });
      } else if (isClientError(error)) {
        errorHandlingService.handleError(error, {
          customMessage: getClientErrorMessage(error),
          retryable: false
        });
      } else {
        errorHandlingService.handleError(error);
      }

      return throwError(error);
    }),
    finalize(() => {
      loadingService.hide();
    })
  );
}

function shouldSkipLoading(request: HttpRequest<unknown>): boolean {
  // Skip loading for certain endpoints
  const skipLoadingEndpoints = [
    '/api/health',
    '/api/ip-monitoring/log-activity'
  ];

  return skipLoadingEndpoints.some(endpoint => request.url.includes(endpoint));
}

function shouldRetry(error: any, retryCount: number, maxRetries: number): boolean {
  if (retryCount >= maxRetries) {
    return false;
  }

  if (error instanceof HttpErrorResponse) {
    // Retry on network errors and 5xx server errors
    return error.status === 0 || (error.status >= 500 && error.status < 600);
  }

  return false;
}

function isNetworkError(error: HttpErrorResponse): boolean {
  return error.status === 0;
}

function isServerError(error: HttpErrorResponse): boolean {
  return error.status >= 500 && error.status < 600;
}

function isClientError(error: HttpErrorResponse): boolean {
  return error.status >= 400 && error.status < 500;
}

function getClientErrorMessage(error: HttpErrorResponse): string {
  switch (error.status) {
    case 400:
      return error.error?.message || 'Invalid request. Please check your input.';
    case 401:
      return 'Please log in to continue.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return error.error?.message || 'This resource already exists.';
    case 422:
      return error.error?.message || 'Please check your input and try again.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    default:
      return error.error?.message || 'An error occurred. Please try again.';
  }
}
