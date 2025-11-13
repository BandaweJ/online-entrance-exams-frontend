import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

export interface ExamRulesDialogData {
  examTitle: string;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
}

@Component({
  selector: 'app-exam-rules-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="exam-rules-dialog">
      <h2 mat-dialog-title>
        <mat-icon>quiz</mat-icon>
        Exam Rules & Guidelines
      </h2>
      
      <mat-dialog-content>
        <div class="exam-info">
          <h3>{{ data.examTitle }}</h3>
          <div class="exam-details">
            <div class="detail-item">
              <mat-icon>schedule</mat-icon>
              <span>{{ formatDuration(data.durationMinutes) }}</span>
            </div>
            <div class="detail-item">
              <mat-icon>quiz</mat-icon>
              <span>{{ data.totalQuestions }} questions</span>
            </div>
            <div class="detail-item">
              <mat-icon>star</mat-icon>
              <span>{{ data.totalMarks }} marks</span>
            </div>
          </div>
        </div>

        <div class="rules-section">
          <h4>Important Rules:</h4>
          <ul class="rules-list">
            <li>
              <mat-icon>timer</mat-icon>
              <span>You have <strong>{{ formatDuration(data.durationMinutes) }}</strong> to complete this exam</span>
            </li>
            <li>
              <mat-icon>pause</mat-icon>
              <span>You can pause the exam, but <strong>you cannot interact with questions while paused</strong></span>
            </li>
            <li>
              <mat-icon>block</mat-icon>
              <span><strong>No external research or assistance</strong> is allowed during the exam</span>
            </li>
            <li>
              <mat-icon>save</mat-icon>
              <span>Your answers are automatically saved as you progress</span>
            </li>
            <li>
              <mat-icon>warning</mat-icon>
              <span><strong>You can only take this exam once</strong> - once submitted, you cannot retake it</span>
            </li>
            <li>
              <mat-icon>flag</mat-icon>
              <span>You can flag questions for review and navigate between them freely</span>
            </li>
          </ul>
        </div>

        <div class="anti-cheating-warning">
          <mat-icon>security</mat-icon>
          <div>
            <h4>Anti-Cheating Measures</h4>
            <p>The exam interface includes security measures to ensure academic integrity. Any attempt to circumvent these measures may result in disqualification.</p>
          </div>
        </div>

        <div class="agreement-section">
          <mat-checkbox [formControl]="agreeToRules" class="agreement-checkbox">
            I understand and agree to follow all exam rules and guidelines
          </mat-checkbox>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-button (click)="onCancel()">
          Cancel
        </button>
        <button mat-raised-button color="primary" 
                [disabled]="!agreeToRules.value"
                (click)="onStart()">
          <mat-icon>play_arrow</mat-icon>
          Start Exam
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .exam-rules-dialog {
      max-width: 600px;
    }

    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #1976d2;
      margin-bottom: 20px;
    }

    .exam-info {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .exam-info h3 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 20px;
    }

    .exam-details {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
    }

    .detail-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #1976d2;
    }

    .rules-section {
      margin-bottom: 24px;
    }

    .rules-section h4 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 16px;
    }

    .rules-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .rules-list li {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 12px;
      padding: 8px 0;
    }

    .rules-list mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #1976d2;
      margin-top: 2px;
    }

    .rules-list span {
      flex: 1;
      line-height: 1.5;
    }

    .anti-cheating-warning {
      background-color: #fff3e0;
      border: 1px solid #ff9800;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
      display: flex;
      gap: 12px;
    }

    .anti-cheating-warning mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: #ff9800;
      margin-top: 4px;
    }

    .anti-cheating-warning h4 {
      margin: 0 0 8px 0;
      color: #e65100;
      font-size: 14px;
    }

    .anti-cheating-warning p {
      margin: 0;
      color: #e65100;
      font-size: 13px;
      line-height: 1.4;
    }

    .agreement-section {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    .agreement-checkbox {
      font-size: 14px;
    }

    mat-dialog-actions {
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }

    @media (max-width: 600px) {
      .exam-details {
        flex-direction: column;
        gap: 12px;
      }
    }
  `]
})
export class ExamRulesDialogComponent {
  agreeToRules = new FormControl(false);

  constructor(
    public dialogRef: MatDialogRef<ExamRulesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ExamRulesDialogData
  ) {}

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    }
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${remainingMinutes} ${remainingMinutes === 1 ? 'minute' : 'minutes'}`;
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onStart(): void {
    if (this.agreeToRules.value) {
      this.dialogRef.close(true);
    }
  }
}
