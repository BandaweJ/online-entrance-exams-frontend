import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { User } from '../../models/user.model';
import { LoginRequest, LoginResponse, RegisterRequest } from '../../models/auth.model';
import { AppState } from '../store/app.reducer';
import * as AuthActions from '../store/auth/auth.actions';
import * as ExamActions from '../store/exam/exam.actions';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private store: Store<AppState>
  ) {
    // Authentication state initialization is now handled by the initAuth$ effect
  }

  login(email: string, password: string): Observable<LoginResponse> {
    const loginRequest: LoginRequest = { email, password };
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, loginRequest).pipe(
      tap(response => {
        localStorage.setItem('token', response.access_token);
        // Convert response user to full User object
        const user: User = {
          ...response.user,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.currentUserSubject.next(user);
      })
    );
  }

  register(registerData: RegisterRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/register`, registerData);
  }

  getCurrentUser(): Observable<User> {
    const token = localStorage.getItem('token');
    if (!token) {
      return of(null as any);
    }

    return this.http.get<User>(`${this.API_URL}/auth/profile`).pipe(
      tap(user => this.currentUserSubject.next(user)),
      catchError(error => {
        // If token is invalid, clear it and return null
        if (error.status === 401) {
          localStorage.removeItem('token');
          this.currentUserSubject.next(null);
        }
        return of(null as any);
      })
    );
  }

  updateProfile(profileData: { firstName?: string; lastName?: string; email?: string }): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/auth/profile`, profileData).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        // Update the store with the new user data
        this.store.dispatch(AuthActions.loginSuccess({ user, token: localStorage.getItem('token') || '' }));
      })
    );
  }

  logout(): void {
    // Clear token and user data immediately
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    
    // Clear store state
    this.store.dispatch(AuthActions.logout());
    this.store.dispatch(ExamActions.clearExamData());
    
    // Navigate to login page
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/change-password`, {
      currentPassword,
      newPassword
    });
  }
}