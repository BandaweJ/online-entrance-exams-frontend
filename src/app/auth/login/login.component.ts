import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AppState } from '../../core/store/app.reducer';
import { AuthService } from '../../core/services/auth.service';
import * as AuthActions from '../../core/store/auth/auth.actions';
import { selectIsLoading, selectIsAuthenticated, selectCurrentUser, selectError } from '../../core/store/auth/auth.selectors';
import { SchoolLogoComponent } from '../../shared/components/school-logo/school-logo.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    SchoolLogoComponent
  ],
  template: `
    <div class="login-container">
      <!-- School Logo and Header -->
      <div class="brand-header">
        <app-school-logo size="large"></app-school-logo>
        <h1 class="brand-title">Entrance Exam System</h1>
        <p class="brand-subtitle">Excellence in Education</p>
      </div>

      <mat-card class="login-card glass-card" *ngIf="!showRegister">
        <mat-card-header>
          <mat-card-title class="brand-heading">
            <mat-icon>login</mat-icon>
            Sign In
          </mat-card-title>
          <mat-card-subtitle class="brand-subheading">Access your exam portal</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="Enter your email">
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                Please enter a valid email
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" placeholder="Enter your password">
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
              <mat-error *ngIf="loginForm.get('password')?.hasError('minlength')">
                Password must be at least 6 characters
              </mat-error>
            </mat-form-field>

            <button mat-raised-button type="submit" class="full-width btn-brand-primary" [disabled]="loginForm.invalid || (isLoading$ | async)">
              <mat-icon *ngIf="isLoading$ | async">hourglass_empty</mat-icon>
              <mat-icon *ngIf="!(isLoading$ | async)">login</mat-icon>
              {{ (isLoading$ | async) ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <p class="register-text">
            Don't have an account? 
            <a href="#" (click)="showRegister = !showRegister; $event.preventDefault()">
              Register here
            </a>
          </p>
        </mat-card-actions>
      </mat-card>

      <!-- Registration Form -->
      <mat-card class="register-card" *ngIf="showRegister">
        <mat-card-header>
          <mat-card-title>Create Student Account</mat-card-title>
          <mat-card-subtitle>Register as a student to take exams</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="registration-info">
            <p><strong>Note:</strong> Student registration is for exam candidates only. Admin accounts are created by system administrators.</p>
          </div>
          <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="register-form">
            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>First Name</mat-label>
                <input matInput formControlName="firstName" placeholder="Enter first name">
                <mat-error *ngIf="registerForm.get('firstName')?.hasError('required')">
                  First name is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Last Name</mat-label>
                <input matInput formControlName="lastName" placeholder="Enter last name">
                <mat-error *ngIf="registerForm.get('lastName')?.hasError('required')">
                  Last name is required
                </mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="Enter your email">
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
                Please enter a valid email
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput [type]="hideRegisterPassword ? 'password' : 'text'" formControlName="password" placeholder="Enter your password">
              <button mat-icon-button matSuffix (click)="hideRegisterPassword = !hideRegisterPassword" type="button">
                <mat-icon>{{hideRegisterPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
              <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
                Password must be at least 6 characters
              </mat-error>
            </mat-form-field>

            <!-- Success Message -->
            <div *ngIf="showSuccessMessage" class="success-message">
              <mat-icon>check_circle</mat-icon>
              Registration successful! You can now sign in with your credentials.
            </div>

            <!-- Error Message -->
            <div *ngIf="error$ | async as error" class="error-message">
              <mat-icon>error</mat-icon>
              {{ error }}
            </div>

            <div class="button-group">
              <button mat-raised-button type="submit" class="btn-brand-primary" [disabled]="registerForm.invalid || (isLoading$ | async)">
                <mat-icon *ngIf="isLoading$ | async">hourglass_empty</mat-icon>
                <mat-icon *ngIf="!(isLoading$ | async)">person_add</mat-icon>
                {{ (isLoading$ | async) ? 'Registering...' : 'Register' }}
              </button>
              <button mat-button type="button" (click)="showRegister = false" [disabled]="isLoading$ | async">
                Back to Login
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    /* Mobile-first base styles */
    .login-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 12px;
      gap: 16px;
      background: linear-gradient(135deg, var(--anarchy-blue) 0%, var(--anarchy-gold) 100%);
      position: relative;
      overflow: hidden;
    }

    .login-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
      opacity: 0.3;
      z-index: 0;
    }

    .brand-header {
      text-align: center;
      z-index: 1;
      position: relative;
    }

    .brand-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.75rem; /* Mobile-first: smaller base size */
      font-weight: 700;
      color: white;
      margin: 12px 0 6px 0;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
      line-height: 1.2;
    }

    .brand-subtitle {
      font-family: 'Inter', sans-serif;
      font-size: 0.9rem; /* Mobile-first: smaller base size */
      color: rgba(255, 255, 255, 0.9);
      margin: 0;
      font-weight: 300;
      letter-spacing: 0.5px;
      line-height: 1.3;
    }

    .login-card, .register-card {
      width: 100%;
      max-width: 100%; /* Mobile-first: full width */
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
      border-radius: 16px; /* Mobile-first: smaller radius */
      z-index: 1;
      position: relative;
    }

    .login-form, .register-form {
      display: flex;
      flex-direction: column;
      gap: 12px; /* Mobile-first: smaller gap */
    }

    .form-row {
      display: flex;
      flex-direction: column;
      gap: 12px; /* Mobile-first: smaller gap */
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      flex: 1;
    }

    .login-button {
      height: 44px; /* Mobile-first: smaller height */
      font-size: 14px; /* Mobile-first: smaller font */
      margin-top: 8px;
      font-weight: 500;
    }

    .register-text {
      text-align: center;
      margin: 0;
      font-size: 13px; /* Mobile-first: smaller font */
      line-height: 1.4;
    }

    .register-text a {
      color: #1976d2;
      text-decoration: none;
      font-weight: 500;
    }

    .register-text a:hover {
      text-decoration: underline;
    }

    .button-group {
      display: flex;
      flex-direction: column;
      gap: 10px; /* Mobile-first: smaller gap */
    }

    mat-card-header {
      text-align: center;
      margin-bottom: 16px; /* Mobile-first: smaller margin */
      padding: 16px 16px 0 16px; /* Mobile-first: smaller padding */
    }

    mat-card-title {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px; /* Mobile-first: smaller gap */
      font-size: 1.25rem; /* Mobile-first: smaller font */
      font-weight: 600;
      color: white;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
      line-height: 1.3;
    }

    mat-card-subtitle {
      font-size: 12px; /* Mobile-first: smaller font */
      color: rgba(255, 255, 255, 0.8);
      margin-top: 6px; /* Mobile-first: smaller margin */
      line-height: 1.3;
    }

    mat-card-content {
      padding: 0 16px 16px 16px; /* Mobile-first: smaller padding */
    }

    mat-card-actions {
      padding: 0 16px 16px 16px; /* Mobile-first: smaller padding */
    }

    .registration-info {
      background-color: #e3f2fd;
      border: 1px solid #bbdefb;
      border-radius: 8px;
      padding: 12px; /* Mobile-first: smaller padding */
      margin-bottom: 16px; /* Mobile-first: smaller margin */
    }

    .registration-info p {
      margin: 0;
      font-size: 12px; /* Mobile-first: smaller font */
      color: #1976d2;
      line-height: 1.4;
    }

    .error-message {
      display: flex;
      align-items: flex-start;
      gap: 6px; /* Mobile-first: smaller gap */
      background-color: #ffebee;
      border: 1px solid #f44336;
      border-radius: 8px;
      padding: 12px; /* Mobile-first: smaller padding */
      margin-bottom: 12px; /* Mobile-first: smaller margin */
      color: #c62828;
      font-size: 12px; /* Mobile-first: smaller font */
    }

    .error-message mat-icon {
      font-size: 18px; /* Mobile-first: smaller icon */
      width: 18px;
      height: 18px;
      margin-top: 1px;
    }

    .success-message {
      display: flex;
      align-items: flex-start;
      gap: 6px; /* Mobile-first: smaller gap */
      background-color: #e8f5e8;
      border: 1px solid #4caf50;
      border-radius: 8px;
      padding: 12px; /* Mobile-first: smaller padding */
      margin-bottom: 12px; /* Mobile-first: smaller margin */
      color: #2e7d32;
      font-size: 12px; /* Mobile-first: smaller font */
    }

    .success-message mat-icon {
      font-size: 18px; /* Mobile-first: smaller icon */
      width: 18px;
      height: 18px;
      margin-top: 1px;
    }

    /* Small mobile devices (320px and up) */
    @media (min-width: 320px) {
      .brand-title {
        font-size: 1.875rem;
      }
      
      .brand-subtitle {
        font-size: 1rem;
      }
      
      mat-card-title {
        font-size: 1.375rem;
      }
    }

    /* Medium mobile devices (480px and up) */
    @media (min-width: 480px) {
      .login-container {
        padding: 16px;
        gap: 20px;
      }

      .brand-title {
        font-size: 2.25rem;
        margin: 16px 0 8px 0;
      }

      .brand-subtitle {
        font-size: 1.125rem;
      }

      .login-card, .register-card {
        max-width: 400px;
        border-radius: 20px;
      }

      .login-form, .register-form {
        gap: 16px;
      }

      .form-row {
        gap: 16px;
      }

      mat-card-header {
        padding: 20px 20px 0 20px;
        margin-bottom: 20px;
      }

      mat-card-content {
        padding: 0 20px 20px 20px;
      }

      mat-card-actions {
        padding: 0 20px 20px 20px;
      }

      mat-card-title {
        font-size: 1.5rem;
        gap: 8px;
      }

      mat-card-subtitle {
        font-size: 14px;
        margin-top: 8px;
      }

      .registration-info {
        padding: 16px;
        margin-bottom: 20px;
      }

      .registration-info p {
        font-size: 14px;
      }

      .error-message, .success-message {
        padding: 16px;
        margin-bottom: 16px;
        font-size: 14px;
        gap: 8px;
      }

      .error-message mat-icon, .success-message mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        margin-top: 2px;
      }

      .register-text {
        font-size: 14px;
      }

      .login-button {
        height: 48px;
        font-size: 16px;
      }
    }

    /* Tablet and up (768px and up) */
    @media (min-width: 768px) {
      .login-container {
        padding: 24px;
        gap: 24px;
      }

      .brand-title {
        font-size: 2.5rem;
        margin: 20px 0 10px 0;
      }

      .brand-subtitle {
        font-size: 1.25rem;
      }

      .form-row {
        flex-direction: row;
      }

      .button-group {
        flex-direction: row;
        justify-content: center;
        gap: 12px;
      }

      mat-card-title {
        font-size: 1.75rem;
      }
    }

    /* Large screens (1024px and up) */
    @media (min-width: 1024px) {
      .brand-title {
        font-size: 3rem;
      }

      .brand-subtitle {
        font-size: 1.375rem;
      }

      mat-card-title {
        font-size: 2rem;
      }
    }
  `]
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  registerForm: FormGroup;
  hidePassword = true;
  hideRegisterPassword = true;
  showRegister = false;
  showSuccessMessage = false;
  private subscription: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    // No automatic navigation - let auth effects handle navigation after login
    // This prevents conflicts during logout
    
    // Listen for registration success
    this.subscription.add(
      this.store.select(state => state.auth.user).subscribe(user => {
        if (user && this.showRegister) {
          this.showSuccessMessage = true;
          this.registerForm.reset();
          // Hide success message after 5 seconds and switch to login
          setTimeout(() => {
            this.showSuccessMessage = false;
            this.showRegister = false;
          }, 5000);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  get isLoading$() {
    return this.store.select(selectIsLoading);
  }

  get error$() {
    return this.store.select(selectError);
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.store.dispatch(AuthActions.login({ 
        email: this.loginForm.value.email, 
        password: this.loginForm.value.password 
      }));
    }
  }

  onRegister() {
    if (this.registerForm.valid) {
      this.showSuccessMessage = false; // Clear any previous success message
      this.store.dispatch(AuthActions.register({ userData: this.registerForm.value }));
    }
  }
}
