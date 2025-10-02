import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-change-password-dialog',
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
    <h2 mat-dialog-title>Change Password</h2>
    <mat-dialog-content>
      <form [formGroup]="changePasswordForm" class="change-password-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Current Password</mat-label>
          <input matInput 
                 [type]="hideCurrentPassword ? 'password' : 'text'" 
                 formControlName="currentPassword"
                 placeholder="Enter current password">
          <button mat-icon-button matSuffix 
                  (click)="hideCurrentPassword = !hideCurrentPassword" 
                  [attr.aria-label]="'Hide current password'" 
                  [attr.aria-pressed]="hideCurrentPassword">
            <mat-icon>{{hideCurrentPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
          </button>
          <mat-error *ngIf="changePasswordForm.get('currentPassword')?.hasError('required')">
            Current password is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>New Password</mat-label>
          <input matInput 
                 [type]="hideNewPassword ? 'password' : 'text'" 
                 formControlName="newPassword"
                 placeholder="Enter new password">
          <button mat-icon-button matSuffix 
                  (click)="hideNewPassword = !hideNewPassword" 
                  [attr.aria-label]="'Hide new password'" 
                  [attr.aria-pressed]="hideNewPassword">
            <mat-icon>{{hideNewPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
          </button>
          <mat-error *ngIf="changePasswordForm.get('newPassword')?.hasError('required')">
            New password is required
          </mat-error>
          <mat-error *ngIf="changePasswordForm.get('newPassword')?.hasError('minlength')">
            Password must be at least 6 characters long
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Confirm New Password</mat-label>
          <input matInput 
                 [type]="hideConfirmPassword ? 'password' : 'text'" 
                 formControlName="confirmPassword"
                 placeholder="Confirm new password">
          <button mat-icon-button matSuffix 
                  (click)="hideConfirmPassword = !hideConfirmPassword" 
                  [attr.aria-label]="'Hide confirm password'" 
                  [attr.aria-pressed]="hideConfirmPassword">
            <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
          </button>
          <mat-error *ngIf="changePasswordForm.get('confirmPassword')?.hasError('required')">
            Please confirm your new password
          </mat-error>
          <mat-error *ngIf="changePasswordForm.hasError('passwordMismatch')">
            Passwords do not match
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button 
              color="primary" 
              (click)="onChangePassword()" 
              [disabled]="changePasswordForm.invalid || isChanging">
        <mat-icon *ngIf="isChanging">hourglass_empty</mat-icon>
        {{ isChanging ? 'Changing...' : 'Change Password' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .change-password-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
    }
    .full-width {
      width: 100%;
    }
    mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
  `]
})
export class ChangePasswordDialogComponent implements OnInit {
  changePasswordForm: FormGroup;
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;
  isChanging = false;

  constructor(
    public dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: any },
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {}

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onChangePassword(): void {
    if (this.changePasswordForm.valid) {
      this.isChanging = true;
      const formValue = this.changePasswordForm.value;
      
      this.authService.changePassword(formValue.currentPassword, formValue.newPassword).subscribe({
        next: () => {
          this.snackBar.open('Password changed successfully', 'Close', { duration: 3000 });
          this.dialogRef.close();
          this.isChanging = false;
        },
        error: (error) => {
          console.error('Error changing password:', error);
          this.snackBar.open('Error changing password. Please check your current password.', 'Close', { duration: 5000 });
          this.isChanging = false;
        }
      });
    }
  }
}
