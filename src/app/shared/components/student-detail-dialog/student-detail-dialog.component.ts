import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Student } from '../../../models/student.model';
import { StudentService } from '../../../core/services/student.service';

@Component({
  selector: 'app-student-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <h2 mat-dialog-title>Student Details</h2>
    <mat-dialog-content>
      <div class="student-details">
        <div class="detail-section">
          <h3>Personal Information</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Student ID:</label>
              <span>{{ data.student.studentId }}</span>
            </div>
            <div class="detail-item">
              <label>Full Name:</label>
              <span>{{ data.student.firstName }} {{ data.student.lastName }}</span>
            </div>
            <div class="detail-item">
              <label>Email:</label>
              <span>{{ data.student.email }}</span>
            </div>
            <div class="detail-item">
              <label>Phone:</label>
              <span>{{ data.student.phone || 'Not provided' }}</span>
            </div>
            <div class="detail-item">
              <label>Date of Birth:</label>
              <span *ngIf="data.student.dateOfBirth; else noDateOfBirth">{{ data.student.dateOfBirth | date:'mediumDate' }}</span>
              <ng-template #noDateOfBirth>Not provided</ng-template>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3>School Information</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <label>School:</label>
              <span>{{ data.student.school || 'Not specified' }}</span>
            </div>
            <div class="detail-item">
              <label>Grade:</label>
              <span>{{ data.student.grade || 'Not specified' }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3>System Credentials</h3>
          <div class="credentials-info">
            <div class="credential-item">
              <label>Username (Email):</label>
              <span class="credential-value">{{ data.student.email }}</span>
            </div>
            <div class="credential-item">
              <label>Password:</label>
              <span class="credential-value password-masked">••••••••</span>
              <button mat-button color="primary" (click)="resendCredentials()" [disabled]="isResending">
                <mat-icon>refresh</mat-icon>
                {{ isResending ? 'Sending...' : 'Reset & Resend' }}
              </button>
            </div>
            <div class="credential-note">
              <mat-icon>info</mat-icon>
              <span>Password is randomly generated and sent via email. Use "Reset & Resend" to generate new credentials.</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3>Account Status</h3>
          <div class="status-chips">
            <mat-chip [class]="data.student.isActive ? 'status-active' : 'status-inactive'">
              <mat-icon>{{ data.student.isActive ? 'check_circle' : 'block' }}</mat-icon>
              {{ data.student.isActive ? 'Active' : 'Inactive' }}
            </mat-chip>
            <mat-chip [class]="data.student.credentialsSent ? 'status-sent' : 'status-pending'">
              <mat-icon>{{ data.student.credentialsSent ? 'email' : 'schedule' }}</mat-icon>
              {{ data.student.credentialsSent ? 'Credentials Sent' : 'Pending' }}
            </mat-chip>
          </div>
        </div>

        <div class="detail-section">
          <h3>Timestamps</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Created:</label>
              <span>{{ data.student.createdAt | date:'medium' }}</span>
            </div>
            <div class="detail-item">
              <label>Last Updated:</label>
              <span>{{ data.student.updatedAt | date:'medium' }}</span>
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
    .student-details {
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

    /* Mobile-specific styles */
    @media (max-width: 768px) {
      .student-details {
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

      .credentials-info {
        padding: 12px;
      }

      .credential-item {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }

      .credential-item label {
        min-width: auto;
      }

      .credential-note {
        font-size: 13px;
        padding: 10px;
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

      .credentials-info {
        padding: 10px;
      }

      .credential-note {
        font-size: 12px;
        padding: 8px;
      }
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

    .status-active {
      background-color: #e8f5e8;
      color: #4caf50;
    }

    .status-inactive {
      background-color: #ffebee;
      color: #f44336;
    }

    .status-sent {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .status-pending {
      background-color: #fff3e0;
      color: #ff9800;
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

    .credentials-info {
      background-color: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .credential-item {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      gap: 12px;
    }

    .credential-item:last-child {
      margin-bottom: 0;
    }

    .credential-item label {
      font-weight: 500;
      min-width: 120px;
      color: #333;
    }

    .credential-value {
      font-family: 'Courier New', monospace;
      background-color: #fff;
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid #ddd;
      flex: 1;
    }

    .password-masked {
      color: #666;
      letter-spacing: 2px;
    }

    .credential-note {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-top: 12px;
      padding: 12px;
      background-color: #e3f2fd;
      border-radius: 4px;
      font-size: 14px;
      color: #1976d2;
    }

    .credential-note mat-icon {
      margin-top: 2px;
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }
  `]
})
export class StudentDetailDialogComponent {
  isResending = false;

  constructor(
    public dialogRef: MatDialogRef<StudentDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { student: Student },
    private studentService: StudentService,
    private snackBar: MatSnackBar
  ) {}

  resendCredentials() {
    this.isResending = true;
    this.studentService.resendCredentials(this.data.student.id).subscribe({
      next: () => {
        this.snackBar.open('Credentials have been reset and sent to the student', 'Close', { duration: 5000 });
        this.isResending = false;
        // Update the student data to reflect that credentials were sent
        this.data.student.credentialsSent = true;
      },
      error: (error) => {
        console.error('Error resending credentials:', error);
        this.snackBar.open('Error resending credentials', 'Close', { duration: 3000 });
        this.isResending = false;
      }
    });
  }
}
