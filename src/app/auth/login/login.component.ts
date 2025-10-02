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
    MatSnackBarModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card" *ngIf="!showRegister">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>school</mat-icon>
            School Entrance Exam System
          </mat-card-title>
          <mat-card-subtitle>Please sign in to continue</mat-card-subtitle>
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

            <button mat-raised-button color="primary" type="submit" class="full-width login-button" [disabled]="loginForm.invalid || (isLoading$ | async)">
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
              <button mat-raised-button color="primary" type="submit" [disabled]="registerForm.invalid || (isLoading$ | async)">
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
    .login-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
      gap: 20px;
    }

    .login-card, .register-card {
      width: 100%;
      max-width: 400px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border-radius: 12px;
    }

    .login-form, .register-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      flex: 1;
    }

    .login-button {
      height: 48px;
      font-size: 16px;
      margin-top: 8px;
    }

    .register-text {
      text-align: center;
      margin: 0;
    }

    .register-text a {
      color: #1976d2;
      text-decoration: none;
    }

    .register-text a:hover {
      text-decoration: underline;
    }

    .button-group {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    mat-card-header {
      text-align: center;
      margin-bottom: 20px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 24px;
      font-weight: 500;
    }

    mat-card-subtitle {
      font-size: 14px;
      color: #666;
    }

    .registration-info {
      background-color: #e3f2fd;
      border: 1px solid #bbdefb;
      border-radius: 4px;
      padding: 12px;
      margin-bottom: 20px;
    }

    .registration-info p {
      margin: 0;
      font-size: 14px;
      color: #1976d2;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      background-color: #ffebee;
      border: 1px solid #f44336;
      border-radius: 4px;
      padding: 12px;
      margin-bottom: 16px;
      color: #c62828;
      font-size: 14px;
    }

    .error-message mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .success-message {
      display: flex;
      align-items: center;
      gap: 8px;
      background-color: #e8f5e8;
      border: 1px solid #4caf50;
      border-radius: 4px;
      padding: 12px;
      margin-bottom: 16px;
      color: #2e7d32;
      font-size: 14px;
    }

    .success-message mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
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
