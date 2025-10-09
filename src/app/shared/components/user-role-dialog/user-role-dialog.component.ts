import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../../../models/user.model';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-user-role-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>Change User Role</h2>
    <mat-dialog-content>
      <div class="user-info">
        <div class="user-details">
          <h3>{{ data.user.firstName }} {{ data.user.lastName }}</h3>
          <p>{{ data.user.email }}</p>
          <div class="current-role">
            <mat-icon>person</mat-icon>
            <span>Current Role: {{ data.user.role | titlecase }}</span>
          </div>
        </div>
      </div>

      <form [formGroup]="roleForm" class="role-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>New Role</mat-label>
          <mat-select formControlName="role">
            <mat-option value="admin">
              <div class="role-option">
                <mat-icon>admin_panel_settings</mat-icon>
                <span>Admin</span>
                <small>Full system access and management</small>
              </div>
            </mat-option>
            <mat-option value="student">
              <div class="role-option">
                <mat-icon>school</mat-icon>
                <span>Student</span>
                <small>Can take exams and view results</small>
              </div>
            </mat-option>
          </mat-select>
          <mat-icon matSuffix>swap_horiz</mat-icon>
          <mat-error *ngIf="roleForm.get('role')?.hasError('required')">
            Please select a role
          </mat-error>
        </mat-form-field>

        <div class="role-warning" *ngIf="roleForm.get('role')?.value && roleForm.get('role')?.value !== data.user.role">
          <mat-icon>warning</mat-icon>
          <div class="warning-content">
            <strong>Warning:</strong> Changing this user's role will affect their system permissions immediately.
            <ul>
              <li *ngIf="roleForm.get('role')?.value === 'admin'">Admin users can manage exams, students, and other users</li>
              <li *ngIf="roleForm.get('role')?.value === 'student'">Students can only take exams and view their results</li>
            </ul>
          </div>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="roleForm.invalid || isSaving">
        <mat-icon>save</mat-icon>
        {{ isSaving ? 'Saving...' : 'Change Role' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .user-info {
      margin-bottom: 24px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }

    .user-details h3 {
      margin: 0 0 4px 0;
      color: #1976d2;
      font-size: 18px;
    }

    .user-details p {
      margin: 0 0 12px 0;
      color: #666;
      font-size: 14px;
    }

    .current-role {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 14px;
    }

    .current-role mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .role-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 400px;
    }

    .full-width {
      width: 100%;
    }

    .role-option {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
    }

    .role-option mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #1976d2;
    }

    .role-option span {
      font-weight: 500;
      color: #333;
    }

    .role-option small {
      color: #666;
      font-size: 12px;
      margin-left: auto;
    }

    .role-warning {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      background-color: #fff3e0;
      border: 1px solid #ff9800;
      border-radius: 4px;
      margin-top: 8px;
    }

    .role-warning mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #ff9800;
      margin-top: 2px;
    }

    .warning-content {
      flex: 1;
      font-size: 14px;
      color: #e65100;
    }

    .warning-content strong {
      display: block;
      margin-bottom: 8px;
    }

    .warning-content ul {
      margin: 8px 0 0 0;
      padding-left: 16px;
    }

    .warning-content li {
      margin-bottom: 4px;
    }

    mat-dialog-content {
      margin: 20px 0;
    }
    
    mat-dialog-actions {
      margin-top: 20px;
    }

    /* Mobile-specific styles */
    @media (max-width: 768px) {
      .role-form {
        min-width: auto;
        width: 100%;
      }

      .user-info {
        padding: 12px;
        margin-bottom: 20px;
      }

      .user-details h3 {
        font-size: 16px;
        text-align: center;
      }

      .user-details p {
        text-align: center;
      }

      .current-role {
        justify-content: center;
      }

      .role-option {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        padding: 12px 0;
      }

      .role-option small {
        margin-left: 0;
        margin-top: 4px;
      }

      .role-warning {
        padding: 12px;
        gap: 8px;
      }

      .warning-content {
        font-size: 13px;
      }
    }

    /* Small mobile devices */
    @media (max-width: 480px) {
      .user-info {
        padding: 10px;
      }

      .user-details h3 {
        font-size: 15px;
      }

      .role-warning {
        padding: 10px;
      }

      .warning-content {
        font-size: 12px;
      }
    }
  `]
})
export class UserRoleDialogComponent {
  roleForm: FormGroup;
  isSaving = false;

  constructor(
    public dialogRef: MatDialogRef<UserRoleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User },
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {
    this.roleForm = this.fb.group({
      role: [data.user.role, [Validators.required]]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.roleForm.valid) {
      this.isSaving = true;
      const newRole = this.roleForm.value.role;

      this.userService.updateUserRole(this.data.user.id, newRole).subscribe({
        next: (updatedUser) => {
          this.snackBar.open(`User role changed to ${newRole} successfully`, 'Close', { duration: 3000 });
          this.dialogRef.close(updatedUser);
        },
        error: (error) => {
          console.error('Error changing user role:', error);
          this.snackBar.open('Error changing user role', 'Close', { duration: 3000 });
          this.isSaving = false;
        }
      });
    }
  }
}
