import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../../../models/user.model';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-user-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>Edit User</h2>
    <mat-dialog-content>
      <form [formGroup]="userForm" class="user-form">
        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>First Name</mat-label>
            <input matInput formControlName="firstName" placeholder="Enter first name">
            <mat-icon matSuffix>person</mat-icon>
            <mat-error *ngIf="userForm.get('firstName')?.hasError('required')">
              First name is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Last Name</mat-label>
            <input matInput formControlName="lastName" placeholder="Enter last name">
            <mat-icon matSuffix>person</mat-icon>
            <mat-error *ngIf="userForm.get('lastName')?.hasError('required')">
              Last name is required
            </mat-error>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" placeholder="Enter email address">
          <mat-icon matSuffix>email</mat-icon>
          <mat-error *ngIf="userForm.get('email')?.hasError('required')">
            Email is required
          </mat-error>
          <mat-error *ngIf="userForm.get('email')?.hasError('email')">
            Please enter a valid email
          </mat-error>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>New Password (Optional)</mat-label>
            <input matInput type="password" formControlName="password" placeholder="Leave blank to keep current">
            <mat-icon matSuffix>lock</mat-icon>
            <mat-error *ngIf="userForm.get('password')?.hasError('minlength')">
              Password must be at least 6 characters
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Confirm Password</mat-label>
            <input matInput type="password" formControlName="confirmPassword" placeholder="Confirm new password">
            <mat-icon matSuffix>lock</mat-icon>
            <mat-error *ngIf="userForm.get('confirmPassword')?.hasError('passwordMismatch')">
              Passwords do not match
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-note">
          <mat-icon>info</mat-icon>
          <span>Leave password fields blank to keep the current password unchanged.</span>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="userForm.invalid || isSaving">
        <mat-icon>save</mat-icon>
        {{ isSaving ? 'Saving...' : 'Save Changes' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .user-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 400px;
    }

    .full-width {
      width: 100%;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .half-width {
      flex: 1;
    }

    .form-note {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background-color: #e3f2fd;
      border-radius: 4px;
      font-size: 14px;
      color: #1976d2;
    }

    .form-note mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    mat-dialog-content {
      margin: 20px 0;
    }
    
    mat-dialog-actions {
      margin-top: 20px;
    }

    /* Mobile-specific styles */
    @media (max-width: 768px) {
      .user-form {
        min-width: auto;
        width: 100%;
      }

      .form-row {
        flex-direction: column;
        gap: 12px;
      }

      .half-width {
        width: 100%;
      }

      .form-note {
        font-size: 13px;
        padding: 10px;
      }

      .form-note mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }

    /* Small mobile devices */
    @media (max-width: 480px) {
      .form-note {
        font-size: 12px;
        padding: 8px;
      }
    }
  `]
})
export class UserEditDialogComponent {
  userForm: FormGroup;
  isSaving = false;

  constructor(
    public dialogRef: MatDialogRef<UserEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User },
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {
    this.userForm = this.fb.group({
      firstName: [data.user.firstName, [Validators.required, Validators.minLength(2)]],
      lastName: [data.user.lastName, [Validators.required, Validators.minLength(2)]],
      email: [data.user.email, [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      confirmPassword: ['']
    }, { validators: this.passwordMatchValidator });

    // Watch for password changes
    this.userForm.get('password')?.valueChanges.subscribe(() => {
      this.userForm.get('confirmPassword')?.updateValueAndValidity();
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value && confirmPassword.value) {
      return password.value === confirmPassword.value ? null : { passwordMismatch: true };
    }
    return null;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.userForm.valid) {
      this.isSaving = true;
      const formValue = { ...this.userForm.value };
      
      // Always remove confirmPassword as backend doesn't need it
      delete formValue.confirmPassword;
      
      // Remove password fields if they're empty
      if (!formValue.password) {
        delete formValue.password;
      }

      this.userService.updateUser(this.data.user.id, formValue).subscribe({
        next: (updatedUser) => {
          this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(updatedUser);
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.snackBar.open(error.error?.message || 'Error updating user', 'Close', { duration: 3000 });
          this.isSaving = false;
        }
      });
    }
  }
}
