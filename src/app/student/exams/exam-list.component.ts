import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { ExamService } from '../../core/services/exam.service';
import { AttemptsService } from '../../core/services/attempts.service';
import { Exam } from '../../models/exam.model';
import { ExamAttempt } from '../../models/attempt.model';
import { ExamRulesDialogComponent } from '../../shared/components/exam-rules-dialog/exam-rules-dialog.component';

@Component({
  selector: 'app-exam-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="exam-list-container">
      <div class="exam-list-header">
        <h1>Available Exams</h1>
        <p>Select an exam to start taking</p>
      </div>

      <div class="exams-grid" *ngIf="!isLoading; else loading">
        <mat-card *ngFor="let exam of exams" class="exam-card">
          <mat-card-header>
            <mat-card-title>{{ exam.title }}</mat-card-title>
            <mat-card-subtitle>{{ exam.year }} • {{ formatDuration(exam.durationMinutes) }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p class="exam-description">{{ cleanDescription(exam.description) }}</p>
            <div class="exam-stats">
              <span>{{ exam.totalQuestions }} questions</span>
              <span>{{ exam.totalMarks }} marks</span>
            </div>
            <div class="exam-date">
              <mat-icon>event</mat-icon>
              <span>{{ exam.examDate | date:'medium' }}</span>
            </div>
            <div class="exam-status">
              <mat-chip [class]="getStatusClass(exam.status)">
                {{ exam.status | titlecase }}
              </mat-chip>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" (click)="startExam(exam.id)" 
                    [disabled]="exam.status !== 'published' || hasSubmittedAttempt(exam.id)">
              <mat-icon>play_arrow</mat-icon>
              {{ getExamButtonText(exam.id) }}
            </button>
            <div *ngIf="hasSubmittedAttempt(exam.id)" class="exam-warning">
              <mat-icon>info</mat-icon>
              <span>Already submitted - cannot retake</span>
            </div>
          </mat-card-actions>
        </mat-card>
      </div>

      <div class="no-exams" *ngIf="exams.length === 0 && !isLoading">
        <mat-icon>quiz</mat-icon>
        <h3>No exams available</h3>
        <p>There are currently no published exams for you to take.</p>
      </div>

      <ng-template #loading>
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Loading exams...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .exam-list-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .exam-list-header {
      margin-bottom: 30px;
    }

    .exam-list-header h1 {
      margin: 0 0 8px 0;
      color: #1976d2;
    }

    .exam-list-header p {
      margin: 0;
      color: #666;
    }

    .exams-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .exam-card {
      transition: transform 0.2s ease-in-out;
    }

    .exam-card:hover {
      transform: translateY(-2px);
    }

    .exam-description {
      margin: 12px 0;
      color: #666;
      font-size: 14px;
    }

    .exam-stats {
      display: flex;
      gap: 16px;
      margin: 12px 0;
      font-size: 14px;
      color: #666;
    }

    .exam-date {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 12px 0;
      font-size: 14px;
      color: #666;
    }

    .exam-status {
      margin: 12px 0;
    }

    .status-published {
      background-color: #e8f5e8;
      color: #4caf50;
    }

    .status-draft {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .status-closed {
      background-color: #ffebee;
      color: #f44336;
    }

    .no-exams {
      text-align: center;
      padding: 40px;
    }

    .no-exams mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .no-exams h3 {
      margin: 0 0 8px 0;
      color: #666;
    }

    .no-exams p {
      margin: 0;
      color: #999;
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

    .exam-warning {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
      padding: 8px 12px;
      background-color: #fff3e0;
      border: 1px solid #ff9800;
      border-radius: 4px;
      font-size: 12px;
      color: #e65100;
    }

    .exam-warning mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
  `]
})
export class ExamListComponent implements OnInit {
  exams: Exam[] = [];
  attempts: ExamAttempt[] = [];
  isLoading = false;

  constructor(
    private examService: ExamService,
    private attemptsService: AttemptsService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadExams();
    this.loadAttempts();
  }

  private loadExams() {
    this.isLoading = true;
    this.examService.getActiveExams().subscribe({
      next: (exams) => {
        this.exams = exams;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading exams:', error);
        this.isLoading = false;
      }
    });
  }

  private loadAttempts() {
    this.attemptsService.getAttempts().subscribe({
      next: (attempts: ExamAttempt[]) => {
        this.attempts = attempts;
      },
      error: (error: any) => {
        console.error('Error loading attempts:', error);
      }
    });
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  hasSubmittedAttempt(examId: string): boolean {
    return this.attempts.some(attempt => 
      attempt.examId === examId && attempt.status === 'submitted'
    );
  }

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

  cleanDescription(description: string | undefined): string {
    if (!description) return '';
    
    // Remove time-related patterns that might conflict with the actual duration
    // Patterns like "Time: 2 hours 30 minutes", "2 hrs 30 mins", "120 minutes", etc.
    let cleaned = description
      .replace(/Time:\s*\d+\s*(hours?|hrs?|h)\s*\d+\s*(minutes?|mins?|m)/gi, '')
      .replace(/Time:\s*\d+\s*(hours?|hrs?|h)/gi, '')
      .replace(/Time:\s*\d+\s*(minutes?|mins?|m)/gi, '')
      .replace(/\d+\s*(hours?|hrs?|h)\s*\d+\s*(minutes?|mins?|m)/gi, '')
      .replace(/\d+\s*(hours?|hrs?|h)/gi, '')
      .trim();
    
    // Clean up any double spaces or leading/trailing punctuation
    cleaned = cleaned.replace(/\s+/g, ' ').replace(/^[,\s]+|[,\s]+$/g, '');
    
    return cleaned || description; // Return original if cleaning removed everything
  }

  getExamButtonText(examId: string): string {
    const attempt = this.attempts.find(attempt => attempt.examId === examId);
    if (attempt) {
      switch (attempt.status) {
        case 'in_progress':
          return 'Continue Exam';
        case 'paused':
          return 'Resume Exam';
        case 'submitted':
          return 'Already Submitted';
        default:
          return 'Start Exam';
      }
    }
    return 'Start Exam';
  }

  startExam(examId: string) {
    const exam = this.exams.find(e => e.id === examId);
    if (!exam) return;

    const dialogRef = this.dialog.open(ExamRulesDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        examTitle: exam.title,
        durationMinutes: exam.durationMinutes,
        totalQuestions: exam.totalQuestions,
        totalMarks: exam.totalMarks
      }
    });

    dialogRef.afterClosed().subscribe(agreed => {
      if (agreed) {
        this.router.navigate(['/student/exams', examId, 'attempt']);
      }
    });
  }
}
