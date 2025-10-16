import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { AppState } from '../../core/store/app.reducer';
import { selectCurrentUser } from '../../core/store/auth/auth.selectors';
import { ExamService } from '../../core/services/exam.service';
import { AttemptsService } from '../../core/services/attempts.service';
import { ResultsService } from '../../core/services/results.service';
import { Exam } from '../../models/exam.model';
import { ExamAttempt } from '../../models/attempt.model';
import { Result } from '../../models/result.model';
import { Observable } from 'rxjs';
import { ExamRulesDialogComponent } from '../../shared/components/exam-rules-dialog/exam-rules-dialog.component';
import { SchoolLogoComponent } from '../../shared/components/school-logo/school-logo.component';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTableModule,
    SchoolLogoComponent
  ],
  template: `
    <div class="student-dashboard-container">
      <div class="dashboard-header">
        <div class="brand-section">
          <app-school-logo size="medium"></app-school-logo>
          <div class="header-text">
            <h1 class="brand-heading">Welcome, {{ (currentUser$ | async)?.firstName }}!</h1>
            <p class="brand-subheading">Your exam dashboard</p>
          </div>
        </div>
      </div>

      <div class="dashboard-content" *ngIf="!isLoading; else loading">
        <mat-tab-group>
          <!-- Available Exams Tab -->
          <mat-tab label="Available Exams">
            <div class="tab-content">
              <div class="exams-grid" *ngIf="availableExams.length > 0; else noExams">
                <mat-card *ngFor="let exam of availableExams" class="exam-card">
                  <mat-card-header>
                    <mat-card-title>{{ exam.title }}</mat-card-title>
                    <mat-card-subtitle>{{ exam.year }} • {{ exam.durationMinutes }} minutes</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <p class="exam-description">{{ exam.description }}</p>
                    <div class="exam-stats">
                      <span>{{ exam.totalQuestions }} questions</span>
                      <span>{{ exam.totalMarks }} marks</span>
                    </div>
                    <div class="exam-date">
                      <mat-icon>event</mat-icon>
                      <span>{{ exam.examDate | date:'medium' }}</span>
                    </div>
                  </mat-card-content>
                  <mat-card-actions>
                    <button mat-raised-button color="primary" (click)="startExam(exam.id)" 
                            [disabled]="hasSubmittedAttempt(exam.id)">
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

              <ng-template #noExams>
                <div class="no-data">
                  <mat-icon>quiz</mat-icon>
                  <h3>No exams available</h3>
                  <p>There are currently no published exams for you to take.</p>
                </div>
              </ng-template>
            </div>
          </mat-tab>

          <!-- My Attempts Tab -->
          <mat-tab label="My Attempts">
            <div class="tab-content">
              <!-- Desktop Table View -->
              <div class="attempts-table tablet-up" *ngIf="attempts.length > 0; else noAttempts">
                <table mat-table [dataSource]="attempts" class="attempts-table">
                  <!-- Exam Column -->
                  <ng-container matColumnDef="exam">
                    <th mat-header-cell *matHeaderCellDef>Exam</th>
                    <td mat-cell *matCellDef="let attempt">
                      <div class="exam-info">
                        <h4>{{ attempt.exam?.title }}</h4>
                        <p>{{ attempt.exam?.year }}</p>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Status Column -->
                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Status</th>
                    <td mat-cell *matCellDef="let attempt">
                      <mat-chip [class]="getStatusClass(attempt.status)">
                        {{ attempt.status | titlecase }}
                      </mat-chip>
                    </td>
                  </ng-container>

                  <!-- Progress Column -->
                  <ng-container matColumnDef="progress">
                    <th mat-header-cell *matHeaderCellDef>Progress</th>
                    <td mat-cell *matCellDef="let attempt">
                      <div class="progress-info">
                        <span>{{ attempt.questionsAnswered }}/{{ attempt.totalQuestions }} questions</span>
                        <div class="progress-bar">
                          <div class="progress-fill" [style.width.%]="getProgressPercentage(attempt)"></div>
                        </div>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Score Column -->
                  <ng-container matColumnDef="score">
                    <th mat-header-cell *matHeaderCellDef>Score</th>
                    <td mat-cell *matCellDef="let attempt">
                      <span *ngIf="attempt.status === 'submitted'">
                        {{ attempt.score }}/{{ attempt.totalMarks }} ({{ attempt.percentage | number:'1.2-2' }}%)
                      </span>
                      <span *ngIf="attempt.status !== 'submitted'">-</span>
                    </td>
                  </ng-container>

                  <!-- Time Column -->
                  <ng-container matColumnDef="time">
                    <th mat-header-cell *matHeaderCellDef>Time Spent</th>
                    <td mat-cell *matCellDef="let attempt">
                      {{ formatTime(attempt.timeSpent) }}
                    </td>
                  </ng-container>

                  <!-- Actions Column -->
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let attempt">
                      <button mat-button color="primary" (click)="continueExam(attempt)" 
                              *ngIf="attempt.status === 'in_progress' || attempt.status === 'paused'">
                        <mat-icon>play_arrow</mat-icon>
                        Continue
                      </button>
                      <button mat-button (click)="viewResult(attempt)" 
                              *ngIf="attempt.status === 'submitted'">
                        <mat-icon>visibility</mat-icon>
                        View Result
                      </button>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="attemptColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: attemptColumns;"></tr>
                </table>
              </div>

              <!-- Mobile Card View -->
              <div class="mobile-attempts-list mobile-only" *ngIf="attempts.length > 0">
                <mat-card *ngFor="let attempt of attempts" class="attempt-card">
                  <mat-card-content>
                    <div class="attempt-card-header">
                      <div class="attempt-info">
                        <h3>{{ attempt.exam?.title }}</h3>
                        <p class="exam-year">{{ getExamYear(attempt.exam) }}</p>
                      </div>
                      <mat-chip [class]="getStatusClass(attempt.status)">
                        {{ attempt.status | titlecase }}
                      </mat-chip>
                    </div>
                    
                    <div class="attempt-details">
                      <div class="detail-row">
                        <span class="detail-label">Progress:</span>
                        <span>{{ attempt.questionsAnswered }}/{{ attempt.totalQuestions }} questions</span>
                      </div>
                      <div class="progress-bar">
                        <div class="progress-fill" [style.width.%]="getProgressPercentage(attempt)"></div>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Score:</span>
                        <span *ngIf="attempt.status === 'submitted'">
                          {{ attempt.score }}/{{ attempt.totalMarks }} ({{ attempt.percentage | number:'1.2-2' }}%)
                        </span>
                        <span *ngIf="attempt.status !== 'submitted'">-</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Time Spent:</span>
                        <span>{{ formatTime(attempt.timeSpent) }}</span>
                      </div>
                    </div>
                    
                    <div class="attempt-actions">
                      <button mat-raised-button color="primary" (click)="continueExam(attempt)" 
                              *ngIf="attempt.status === 'in_progress' || attempt.status === 'paused'"
                              class="action-button">
                        <mat-icon>play_arrow</mat-icon>
                        Continue
                      </button>
                      <button mat-raised-button (click)="viewResult(attempt)" 
                              *ngIf="attempt.status === 'submitted'"
                              class="action-button">
                        <mat-icon>visibility</mat-icon>
                        View Result
                      </button>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>

              <ng-template #noAttempts>
                <div class="no-data">
                  <mat-icon>assignment</mat-icon>
                  <h3>No attempts yet</h3>
                  <p>Start taking exams to see your attempts here.</p>
                </div>
              </ng-template>
            </div>
          </mat-tab>

          <!-- My Results Tab -->
          <mat-tab label="My Results">
            <div class="tab-content">
              <div class="results-grid" *ngIf="results.length > 0; else noResults">
                <mat-card *ngFor="let result of results" class="result-card">
                  <mat-card-header>
                    <mat-card-title>{{ result.exam?.title }}</mat-card-title>
                    <mat-card-subtitle>{{ getExamYear(result.exam) }}</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="result-stats">
                      <div class="stat-item">
                        <h3>{{ result.score }}/{{ result.totalMarks }}</h3>
                        <p>Score</p>
                      </div>
                      <div class="stat-item">
                        <h3>{{ result.percentage | number:'1.2-2' }}%</h3>
                        <p>Percentage</p>
                      </div>
                      <div class="stat-item">
                        <h3>{{ result.grade }}</h3>
                        <p>Grade</p>
                      </div>
                      <div class="stat-item">
                        <h3>{{ result.rank }}/{{ result.totalStudents }}</h3>
                        <p>Rank</p>
                      </div>
                    </div>
                    <div class="result-status">
                      <mat-chip [class]="result.isPassed ? 'status-passed' : 'status-failed'">
                        {{ result.isPassed ? 'Passed' : 'Failed' }}
                      </mat-chip>
                      <mat-chip [class]="result.isPublished ? 'status-published' : 'status-draft'">
                        {{ result.isPublished ? 'Published' : 'Draft' }}
                      </mat-chip>
                    </div>
                  </mat-card-content>
                  <mat-card-actions>
                    <button mat-button (click)="viewDetailedResult(result.id)">
                      <mat-icon>assessment</mat-icon>
                      View Details
                    </button>
                  </mat-card-actions>
                </mat-card>
              </div>

              <ng-template #noResults>
                <div class="no-data">
                  <mat-icon>assessment</mat-icon>
                  <h3>No results yet</h3>
                  <p>Complete exams to see your results here.</p>
                </div>
              </ng-template>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>

      <ng-template #loading>
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Loading dashboard...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    /* Mobile-first base styles */
    .student-dashboard-container {
      padding: 12px;
      max-width: 1200px;
      margin: 0 auto;
      background: linear-gradient(135deg, var(--anarchy-off-white) 0%, #E5E7EB 100%);
      min-height: 100vh;
    }

    .dashboard-header {
      margin-bottom: 20px; /* Mobile-first: smaller margin */
      padding: 16px; /* Mobile-first: smaller padding */
      background: var(--glass-card);
      border-radius: 16px; /* Mobile-first: smaller radius */
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: var(--glass-shadow);
    }

    .brand-section {
      display: flex;
      flex-direction: column; /* Mobile-first: stacked layout */
      align-items: center;
      gap: 12px; /* Mobile-first: smaller gap */
      text-align: center;
    }

    .header-text h1 {
      margin: 0 0 6px 0; /* Mobile-first: smaller margin */
      font-family: 'Playfair Display', serif;
      font-size: 1.5rem; /* Mobile-first: smaller font */
      font-weight: 600;
      color: var(--anarchy-blue);
      line-height: 1.2;
    }

    .header-text p {
      margin: 0;
      font-family: 'Inter', sans-serif;
      color: var(--anarchy-grey);
      font-size: 0.875rem; /* Mobile-first: smaller font */
      line-height: 1.3;
    }

    .tab-content {
      padding: 16px 0; /* Mobile-first: smaller padding */
    }

    .exams-grid {
      display: grid;
      grid-template-columns: 1fr; /* Mobile-first: single column */
      gap: 16px; /* Mobile-first: smaller gap */
    }

    .exam-card {
      background: var(--glass-card);
      border-radius: 12px; /* Mobile-first: smaller radius */
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: var(--glass-shadow);
      transition: all 0.3s ease;
      margin: 0;
    }

    .exam-card:hover {
      transform: translateY(-2px); /* Mobile-first: smaller transform */
      box-shadow: 0 8px 25px 0 rgba(31, 38, 135, 0.4);
    }

    .exam-description {
      margin: 10px 0; /* Mobile-first: smaller margin */
      color: #666;
      font-size: 12px; /* Mobile-first: smaller font */
      line-height: 1.4;
    }

    .exam-stats {
      display: flex;
      flex-direction: column; /* Mobile-first: stacked layout */
      gap: 6px; /* Mobile-first: smaller gap */
      margin: 10px 0; /* Mobile-first: smaller margin */
      font-size: 12px; /* Mobile-first: smaller font */
      color: #666;
    }

    .exam-date {
      display: flex;
      align-items: center;
      gap: 6px; /* Mobile-first: smaller gap */
      margin: 10px 0; /* Mobile-first: smaller margin */
      font-size: 12px; /* Mobile-first: smaller font */
      color: #666;
      justify-content: center; /* Mobile-first: centered */
    }

    .attempts-table {
      width: 100%;
    }

    .exam-info h4 {
      margin: 0 0 3px 0; /* Mobile-first: smaller margin */
      font-size: 14px; /* Mobile-first: smaller font */
      font-weight: 500;
      line-height: 1.3;
    }

    .exam-info p {
      margin: 0;
      color: #666;
      font-size: 12px; /* Mobile-first: smaller font */
      line-height: 1.3;
    }

    .status-in-progress {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .status-paused {
      background-color: #fff3e0;
      color: #ff9800;
    }

    .status-submitted {
      background-color: #e8f5e8;
      color: #4caf50;
    }

    .status-timed-out {
      background-color: #ffebee;
      color: #f44336;
    }

    .progress-info {
      display: flex;
      flex-direction: column;
      gap: 6px; /* Mobile-first: smaller gap */
    }

    .progress-bar {
      width: 100%;
      height: 6px; /* Mobile-first: smaller height */
      background-color: #e0e0e0;
      border-radius: 3px; /* Mobile-first: smaller radius */
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background-color: #1976d2;
      transition: width 0.3s ease;
    }

    .results-grid {
      display: grid;
      grid-template-columns: 1fr; /* Mobile-first: single column */
      gap: 16px; /* Mobile-first: smaller gap */
    }

    .result-card {
      transition: transform 0.2s ease-in-out;
      margin: 0;
    }

    .result-card:hover {
      transform: translateY(-2px);
    }

    .result-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr); /* Mobile-first: 2 columns */
      gap: 12px; /* Mobile-first: smaller gap */
      margin: 12px 0; /* Mobile-first: smaller margin */
    }

    .stat-item {
      text-align: center;
    }

    .stat-item h3 {
      margin: 0 0 3px 0; /* Mobile-first: smaller margin */
      font-size: 16px; /* Mobile-first: smaller font */
      font-weight: bold;
      color: #1976d2;
      line-height: 1.2;
    }

    .stat-item p {
      margin: 0;
      color: #666;
      font-size: 10px; /* Mobile-first: smaller font */
      line-height: 1.2;
    }

    .result-status {
      display: flex;
      gap: 6px; /* Mobile-first: smaller gap */
      margin: 12px 0; /* Mobile-first: smaller margin */
      justify-content: center; /* Mobile-first: centered */
    }

    .status-passed {
      background-color: #e8f5e8;
      color: #4caf50;
    }

    .status-failed {
      background-color: #ffebee;
      color: #f44336;
    }

    .status-published {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .status-draft {
      background-color: #fff3e0;
      color: #ff9800;
    }

    .no-data {
      text-align: center;
      padding: 30px; /* Mobile-first: smaller padding */
    }

    .no-data mat-icon {
      font-size: 48px; /* Mobile-first: smaller icon */
      width: 48px;
      height: 48px;
      color: #ccc;
      margin-bottom: 12px; /* Mobile-first: smaller margin */
    }

    .no-data h3 {
      margin: 0 0 6px 0; /* Mobile-first: smaller margin */
      color: #666;
      font-size: 16px; /* Mobile-first: smaller font */
      line-height: 1.3;
    }

    .no-data p {
      margin: 0;
      color: #999;
      font-size: 12px; /* Mobile-first: smaller font */
      line-height: 1.4;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 30px; /* Mobile-first: smaller padding */
    }

    .loading-container p {
      margin-top: 12px; /* Mobile-first: smaller margin */
      color: #666;
      font-size: 13px; /* Mobile-first: smaller font */
    }

    .exam-warning {
      display: flex;
      align-items: center;
      gap: 6px; /* Mobile-first: smaller gap */
      margin-top: 6px; /* Mobile-first: smaller margin */
      padding: 6px 10px; /* Mobile-first: smaller padding */
      background-color: #fff3e0;
      border: 1px solid #ff9800;
      border-radius: 4px;
      font-size: 10px; /* Mobile-first: smaller font */
      color: #e65100;
    }

    .exam-warning mat-icon {
      font-size: 14px; /* Mobile-first: smaller icon */
      width: 14px;
      height: 14px;
    }

    /* Mobile-specific styles */
    .mobile-attempts-list {
      display: flex;
      flex-direction: column;
      gap: 12px; /* Mobile-first: smaller gap */
    }

    .attempt-card {
      margin: 0;
    }

    .attempt-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px; /* Mobile-first: smaller margin */
    }

    .attempt-card-header .attempt-info h3 {
      margin: 0 0 3px 0; /* Mobile-first: smaller margin */
      font-size: 1rem; /* Mobile-first: smaller font */
      font-weight: 500;
      color: #1976d2;
      line-height: 1.3;
    }

    .attempt-card-header .attempt-info .exam-year {
      margin: 0;
      color: #666;
      font-size: 0.75rem; /* Mobile-first: smaller font */
      line-height: 1.3;
    }

    .attempt-details {
      display: flex;
      flex-direction: column;
      gap: 6px; /* Mobile-first: smaller gap */
      margin-bottom: 12px; /* Mobile-first: smaller margin */
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 3px 0; /* Mobile-first: smaller padding */
    }

    .detail-label {
      font-weight: 500;
      color: #666;
      font-size: 0.75rem; /* Mobile-first: smaller font */
    }

    .detail-row span:last-child {
      color: #333;
      font-size: 0.75rem; /* Mobile-first: smaller font */
    }

    .attempt-actions {
      display: flex;
      flex-direction: column; /* Mobile-first: stacked layout */
      gap: 6px; /* Mobile-first: smaller gap */
    }

    .action-button {
      flex: 1;
      height: 44px; /* Mobile-first: smaller height */
      font-size: 12px; /* Mobile-first: smaller font */
    }

    /* Small mobile devices (320px and up) */
    @media (min-width: 320px) {
      .header-text h1 {
        font-size: 1.625rem;
      }
      
      .header-text p {
        font-size: 0.9rem;
      }
      
      .stat-item h3 {
        font-size: 18px;
      }
      
      .stat-item p {
        font-size: 11px;
      }
    }

    /* Medium mobile devices (480px and up) */
    @media (min-width: 480px) {
      .student-dashboard-container {
        padding: 16px;
      }

      .dashboard-header {
        padding: 20px;
        margin-bottom: 24px;
        border-radius: 20px;
      }

      .brand-section {
        flex-direction: row;
        text-align: left;
        gap: 16px;
      }

      .header-text h1 {
        font-size: 1.75rem;
        margin: 0 0 8px 0;
      }

      .header-text p {
        font-size: 1rem;
      }

      .exams-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .exam-description {
        font-size: 14px;
        margin: 12px 0;
      }

      .exam-stats {
        flex-direction: row;
        gap: 16px;
        margin: 12px 0;
        font-size: 14px;
      }

      .exam-date {
        justify-content: flex-start;
        font-size: 14px;
        margin: 12px 0;
      }

      .results-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .result-stats {
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
        margin: 16px 0;
      }

      .stat-item h3 {
        font-size: 20px;
        margin: 0 0 4px 0;
      }

      .stat-item p {
        font-size: 12px;
      }

      .result-status {
        justify-content: flex-start;
        gap: 8px;
        margin: 16px 0;
      }

      .attempt-card-header .attempt-info h3 {
        font-size: 1.125rem;
        margin: 0 0 4px 0;
      }

      .attempt-card-header .attempt-info .exam-year {
        font-size: 0.875rem;
      }

      .attempt-details {
        gap: 8px;
        margin-bottom: 16px;
      }

      .detail-row {
        padding: 4px 0;
      }

      .detail-label {
        font-size: 0.875rem;
      }

      .detail-row span:last-child {
        font-size: 0.875rem;
      }

      .attempt-actions {
        flex-direction: row;
        gap: 8px;
      }

      .action-button {
        height: 48px;
        font-size: 13px;
      }
    }

    /* Tablet and up (768px and up) */
    @media (min-width: 768px) {
      .student-dashboard-container {
        padding: 20px;
      }

      .dashboard-header {
        margin-bottom: 30px;
        padding: 24px;
      }

      .brand-section {
        gap: 20px;
      }

      .header-text h1 {
        font-size: 2rem;
        margin: 0 0 8px 0;
      }

      .header-text p {
        font-size: 1.125rem;
      }

      .exams-grid {
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 20px;
      }

      .results-grid {
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
      }

      .result-stats {
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
        margin: 16px 0;
      }

      .stat-item h3 {
        font-size: 20px;
      }

      .stat-item p {
        font-size: 12px;
      }

      .result-status {
        gap: 8px;
        margin: 16px 0;
      }

      .no-data {
        padding: 40px;
      }

      .no-data mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
      }

      .no-data h3 {
        font-size: 18px;
        margin: 0 0 8px 0;
      }

      .no-data p {
        font-size: 14px;
      }

      .loading-container {
        padding: 40px;
      }

      .loading-container p {
        margin-top: 16px;
        font-size: 14px;
      }

      .exam-warning {
        font-size: 12px;
        padding: 8px 12px;
        margin-top: 8px;
        gap: 8px;
      }

      .exam-warning mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }

    /* Large screens (1024px and up) */
    @media (min-width: 1024px) {
      .header-text h1 {
        font-size: 2.25rem;
      }

      .header-text p {
        font-size: 1.25rem;
      }

      .stat-item h3 {
        font-size: 24px;
      }

      .stat-item p {
        font-size: 13px;
      }
    }
  `]
})
export class StudentDashboardComponent implements OnInit {
  currentUser$: Observable<any>;
  availableExams: Exam[] = [];
  attempts: ExamAttempt[] = [];
  results: Result[] = [];
  attemptColumns: string[] = ['exam', 'status', 'progress', 'score', 'time', 'actions'];
  isLoading = false;

  constructor(
    private store: Store<AppState>,
    private examService: ExamService,
    private attemptsService: AttemptsService,
    private resultsService: ResultsService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.currentUser$ = this.store.select(selectCurrentUser);
  }

  ngOnInit() {
    // Wait for authentication to be established before loading data
    this.currentUser$.subscribe(user => {
      if (user && user.role === 'student') {
        this.loadDashboardData();
      }
    });
  }

  private loadDashboardData() {
    this.isLoading = true;
    
    // Load available exams
    this.examService.getActiveExams().subscribe({
      next: (exams) => {
        this.availableExams = exams;
      },
      error: (error) => {
        console.error('Error loading exams:', error);
      }
    });

    // Load attempts
    this.attemptsService.getAttempts().subscribe({
      next: (attempts) => {
        this.attempts = attempts;
      },
      error: (error) => {
        console.error('Error loading attempts:', error);
      }
    });

    // Load results
    this.resultsService.getStudentResults().subscribe({
      next: (results) => {
        this.results = results;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading results:', error);
        this.isLoading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    return `status-${status.replace('_', '-')}`;
  }

  getProgressPercentage(attempt: ExamAttempt): number {
    if (attempt.totalQuestions === 0) return 0;
    return (attempt.questionsAnswered / attempt.totalQuestions) * 100;
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  }

  startExam(examId: string) {
    const exam = this.availableExams.find(e => e.id === examId);
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

  continueExam(attempt: ExamAttempt) {
    // Navigate to exam taking interface
    this.router.navigate(['/student/exams', attempt.examId, 'attempt']);
  }

  viewResult(attempt: ExamAttempt) {
    console.log('Viewing result for attempt:', attempt.id);
    
    // First, try to find the result for this attempt
    const existingResult = this.results.find(result => result.attemptId === attempt.id);
    
    if (existingResult) {
      console.log('Found existing result:', existingResult.id);
      // Navigate to existing result
      this.router.navigate(['/student/results', existingResult.id]);
    } else {
      console.log('No existing result found, refreshing results...');
      this.refreshResultsAndNavigate(attempt.id, 0);
    }
  }

  private refreshResultsAndNavigate(attemptId: string, retryCount: number) {
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

    this.resultsService.getStudentResults().subscribe({
      next: (results: Result[]) => {
        this.results = results;
        const foundResult = results.find(result => result.attemptId === attemptId);
        
        if (foundResult) {
          console.log('Found result after refresh:', foundResult.id);
          this.router.navigate(['/student/results', foundResult.id]);
        } else if (retryCount < maxRetries) {
          console.log(`Result not found, retrying in ${retryDelay}ms... (attempt ${retryCount + 1}/${maxRetries})`);
          setTimeout(() => {
            this.refreshResultsAndNavigate(attemptId, retryCount + 1);
          }, retryDelay);
        } else {
          console.error('Result still not found after all retries');
          this.snackBar.open(
            'Result is still being processed. Please wait a few minutes and try again, or contact support if the issue persists.',
            'Close',
            { duration: 8000, panelClass: ['warning-snackbar'] }
          );
        }
      },
      error: (error) => {
        console.error('Error refreshing results:', error);
        this.snackBar.open(
          'Error loading results. Please try again.',
          'Close',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      }
    });
  }

  viewDetailedResult(resultId: string) {
    // Navigate to detailed result view
    this.router.navigate(['/student/results', resultId]);
  }

  getExamYear(exam: any): string {
    return exam?.year || 'N/A';
  }

  hasSubmittedAttempt(examId: string): boolean {
    return this.attempts.some(attempt => 
      attempt.examId === examId && attempt.status === 'submitted'
    );
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
}
