import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-user-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <h2 mat-dialog-title>User Details</h2>
    <mat-dialog-content>
      <div class="user-details">
        <div class="detail-section">
          <h3>Personal Information</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Full Name:</label>
              <span>{{ data.user.firstName }} {{ data.user.lastName }}</span>
            </div>
            <div class="detail-item">
              <label>Email:</label>
              <span>{{ data.user.email }}</span>
            </div>
            <div class="detail-item">
              <label>Role:</label>
              <mat-chip [class]="data.user.role === 'admin' ? 'role-admin' : 'role-student'">
                {{ data.user.role | titlecase }}
              </mat-chip>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3>Account Status</h3>
          <div class="status-chips">
            <mat-chip [class]="data.user.isActive ? 'status-active' : 'status-inactive'">
              <mat-icon>{{ data.user.isActive ? 'check_circle' : 'block' }}</mat-icon>
              {{ data.user.isActive ? 'Active' : 'Inactive' }}
            </mat-chip>
          </div>
        </div>

        <div class="detail-section">
          <h3>Timestamps</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Created:</label>
              <span>{{ data.user.createdAt | date:'medium' }}</span>
            </div>
            <div class="detail-item">
              <label>Last Updated:</label>
              <span>{{ data.user.updatedAt | date:'medium' }}</span>
            </div>
          </div>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .user-details {
      padding: 16px 0;
    }

    .detail-section {
      margin-bottom: 24px;
    }

    .detail-section h3 {
      margin: 0 0 16px 0;
      color: #1976d2;
      font-size: 18px;
      font-weight: 500;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 8px;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .detail-item label {
      font-weight: 500;
      color: #666;
      font-size: 14px;
    }

    .detail-item span {
      color: #333;
      font-size: 16px;
    }

    .status-chips {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .role-admin {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .role-student {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-active {
      background-color: #e8f5e8;
      color: #4caf50;
    }

    .status-inactive {
      background-color: #ffebee;
      color: #f44336;
    }

    mat-chip {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    mat-chip mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    /* Mobile-specific styles */
    @media (max-width: 768px) {
      .user-details {
        padding: 12px 0;
      }

      .detail-section h3 {
        font-size: 16px;
        text-align: center;
      }

      .detail-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .detail-item {
        gap: 2px;
      }

      .detail-item label {
        font-size: 13px;
      }

      .detail-item span {
        font-size: 15px;
      }

      .status-chips {
        justify-content: center;
      }
    }

    /* Small mobile devices */
    @media (max-width: 480px) {
      .detail-section h3 {
        font-size: 15px;
      }

      .detail-item label {
        font-size: 12px;
      }

      .detail-item span {
        font-size: 14px;
      }
    }
  `]
})
export class UserDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<UserDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User }
  ) {}
}
