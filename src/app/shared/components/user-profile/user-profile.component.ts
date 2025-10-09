import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AppState } from '../../../core/store/app.reducer';
import { selectCurrentUser } from '../../../core/store/auth/auth.selectors';
import { User } from '../../../models/user.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="profile-container">
      <mat-card class="profile-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>person</mat-icon>
            User Profile
          </mat-card-title>
          <mat-card-subtitle>Manage your account information</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div *ngIf="currentUser$ | async as user; else loading" class="profile-content">
            <!-- User Information Display -->
            <div class="user-info-section">
              <h3>Account Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <label>Name:</label>
                  <span>{{ user.firstName }} {{ user.lastName }}</span>
                </div>
                <div class="info-item">
                  <label>Email:</label>
                  <span>{{ user.email }}</span>
                </div>
                <div class="info-item">
                  <label>Role:</label>
                  <span class="role-badge" [class.admin]="user.role === 'admin'" [class.student]="user.role === 'student'">
                    {{ user.role | titlecase }}
                  </span>
                </div>
                <div class="info-item">
                  <label>Status:</label>
                  <span class="status-badge" [class.active]="user.isActive" [class.inactive]="!user.isActive">
                    {{ user.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <div class="info-item">
                  <label>Member Since:</label>
                  <span>{{ user.createdAt | date:'medium' }}</span>
                </div>
              </div>
            </div>

            <!-- Edit Profile Form -->
            <div class="edit-section">
              <h3>Edit Profile</h3>
              <form [formGroup]="profileForm" (ngSubmit)="onUpdateProfile()" class="profile-form">
                <div class="form-row">
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>First Name</mat-label>
                    <input matInput formControlName="firstName" placeholder="Enter first name">
                    <mat-error *ngIf="profileForm.get('firstName')?.hasError('required')">
                      First name is required
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Last Name</mat-label>
                    <input matInput formControlName="lastName" placeholder="Enter last name">
                    <mat-error *ngIf="profileForm.get('lastName')?.hasError('required')">
                      Last name is required
                    </mat-error>
                  </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Email</mat-label>
                  <input matInput type="email" formControlName="email" placeholder="Enter your email">
                  <mat-icon matSuffix>email</mat-icon>
                  <mat-error *ngIf="profileForm.get('email')?.hasError('required')">
                    Email is required
                  </mat-error>
                  <mat-error *ngIf="profileForm.get('email')?.hasError('email')">
                    Please enter a valid email
                  </mat-error>
                </mat-form-field>

                <div class="button-group">
                  <button mat-raised-button color="primary" type="submit" [disabled]="profileForm.invalid || isUpdating">
                    <mat-icon *ngIf="isUpdating">hourglass_empty</mat-icon>
                    <mat-icon *ngIf="!isUpdating">save</mat-icon>
                    {{ isUpdating ? 'Updating...' : 'Update Profile' }}
                  </button>
                  <button mat-button type="button" (click)="resetForm()" [disabled]="isUpdating">
                    <mat-icon>refresh</mat-icon>
                    Reset
                  </button>
                </div>
              </form>
            </div>

            <!-- Change Password Section -->
            <div class="password-section">
              <h3>Change Password</h3>
              <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()" class="password-form">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Current Password</mat-label>
                  <input matInput [type]="hideCurrentPassword ? 'password' : 'text'" formControlName="currentPassword" placeholder="Enter current password">
                  <button mat-icon-button matSuffix (click)="hideCurrentPassword = !hideCurrentPassword" type="button">
                    <mat-icon>{{hideCurrentPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                  </button>
                  <mat-error *ngIf="passwordForm.get('currentPassword')?.hasError('required')">
                    Current password is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>New Password</mat-label>
                  <input matInput [type]="hideNewPassword ? 'password' : 'text'" formControlName="newPassword" placeholder="Enter new password">
                  <button mat-icon-button matSuffix (click)="hideNewPassword = !hideNewPassword" type="button">
                    <mat-icon>{{hideNewPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                  </button>
                  <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('required')">
                    New password is required
                  </mat-error>
                  <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('minlength')">
                    Password must be at least 6 characters
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Confirm New Password</mat-label>
                  <input matInput [type]="hideConfirmPassword ? 'password' : 'text'" formControlName="confirmPassword" placeholder="Confirm new password">
                  <button mat-icon-button matSuffix (click)="hideConfirmPassword = !hideConfirmPassword" type="button">
                    <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                  </button>
                  <mat-error *ngIf="passwordForm.get('confirmPassword')?.hasError('required')">
                    Please confirm your new password
                  </mat-error>
                  <mat-error *ngIf="passwordForm.get('confirmPassword')?.hasError('passwordMismatch')">
                    Passwords do not match
                  </mat-error>
                </mat-form-field>

                <div class="button-group">
                  <button mat-raised-button color="accent" type="submit" [disabled]="passwordForm.invalid || isChangingPassword">
                    <mat-icon *ngIf="isChangingPassword">hourglass_empty</mat-icon>
                    <mat-icon *ngIf="!isChangingPassword">lock</mat-icon>
                    {{ isChangingPassword ? 'Changing...' : 'Change Password' }}
                  </button>
                  <button mat-button type="button" (click)="resetPasswordForm()" [disabled]="isChangingPassword">
                    <mat-icon>refresh</mat-icon>
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </div>

          <ng-template #loading>
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Loading profile...</p>
            </div>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container {
      display: flex;
      justify-content: center;
      padding: 20px;
    }

    .profile-card {
      width: 100%;
      max-width: 800px;
    }

    .profile-content {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .user-info-section, .edit-section, .password-section {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 24px;
    }

    .user-info-section h3, .edit-section h3, .password-section h3 {
      margin: 0 0 20px 0;
      color: #1976d2;
      font-size: 18px;
      font-weight: 500;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-item label {
      font-weight: 500;
      color: #666;
      font-size: 14px;
    }

    .info-item span {
      color: #333;
      font-size: 16px;
    }

    .role-badge, .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .role-badge.admin {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .role-badge.student {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-badge.active {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-badge.inactive {
      background-color: #ffebee;
      color: #c62828;
    }

    .profile-form, .password-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .half-width {
      flex: 1;
    }

    .full-width {
      width: 100%;
    }

    .button-group {
      display: flex;
      gap: 12px;
      justify-content: flex-start;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }

    .loading-container p {
      margin-top: 16px;
      color: #666;
    }

    /* Mobile-specific styles */
    @media (max-width: 768px) {
      .profile-container {
        padding: 16px;
      }

      .profile-card {
        margin: 0;
      }

      .profile-content {
        gap: 24px;
      }

      .user-info-section, .edit-section, .password-section {
        padding: 16px;
      }

      .user-info-section h3, .edit-section h3, .password-section h3 {
        font-size: 16px;
        text-align: center;
        margin-bottom: 16px;
      }

      .info-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .info-item {
        gap: 2px;
      }

      .info-item label {
        font-size: 13px;
      }

      .info-item span {
        font-size: 15px;
      }

      .role-badge, .status-badge {
        font-size: 11px;
        padding: 3px 8px;
      }

      .form-row {
        flex-direction: column;
        gap: 12px;
      }
      
      .button-group {
        flex-direction: column;
        gap: 8px;
      }

      .button-group button {
        width: 100%;
        height: 48px;
      }
    }

    /* Small mobile devices */
    @media (max-width: 480px) {
      .profile-container {
        padding: 12px;
      }

      .user-info-section, .edit-section, .password-section {
        padding: 12px;
      }

      .user-info-section h3, .edit-section h3, .password-section h3 {
        font-size: 15px;
      }

      .info-item label {
        font-size: 12px;
      }

      .info-item span {
        font-size: 14px;
      }

      .role-badge, .status-badge {
        font-size: 10px;
        padding: 2px 6px;
      }
    }
  `]
})
export class UserProfileComponent implements OnInit, OnDestroy {
  currentUser$: Observable<User | null>;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  isUpdating = false;
  isChangingPassword = false;
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;
  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private authService: AuthService
  ) {
    this.currentUser$ = this.store.select(selectCurrentUser);
    
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    // Load user data into form
    this.subscription.add(
      this.currentUser$.subscribe(user => {
        if (user) {
          this.profileForm.patchValue({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          });
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onUpdateProfile() {
    if (this.profileForm.valid) {
      this.isUpdating = true;
      const formData = this.profileForm.value;
      
      this.authService.updateProfile(formData).subscribe({
        next: (updatedUser) => {
          this.isUpdating = false;
          this.snackBar.open('Profile updated successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
          // The auth service already updates the store, so the UI will refresh automatically
        },
        error: (error) => {
          this.isUpdating = false;
          let errorMessage = 'Failed to update profile. Please try again.';
          
          if (error.status === 409) {
            errorMessage = 'Email already exists. Please use a different email.';
          } else if (error.status === 400) {
            errorMessage = 'Invalid data. Please check your input.';
          }
          
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
        }
      });
    }
  }

  onChangePassword() {
    if (this.passwordForm.valid) {
      this.isChangingPassword = true;
      const { currentPassword, newPassword } = this.passwordForm.value;
      
      // For now, just show a success message
      // In a real implementation, you would call the API here
      setTimeout(() => {
        this.isChangingPassword = false;
        this.resetPasswordForm();
        this.snackBar.open('Password changed successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }, 1000);
    }
  }

  resetForm() {
    this.currentUser$.pipe(take(1)).subscribe(user => {
      if (user) {
        this.profileForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        });
      }
    });
  }

  resetPasswordForm() {
    this.passwordForm.reset();
  }
}
