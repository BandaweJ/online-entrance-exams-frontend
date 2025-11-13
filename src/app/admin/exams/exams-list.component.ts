import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { AppState } from '../../core/store/app.reducer';
import { Exam } from '../../models/exam.model';
import { ExamService } from '../../core/services/exam.service';
import { Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { SchoolLogoComponent } from '../../shared/components/school-logo/school-logo.component';
import { selectExamsWithCalculatedStats, selectExamLoading } from '../../core/store/exam/exam.selectors';
import * as ExamActions from '../../core/store/exam/exam.actions';

@Component({
  selector: 'app-exams-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    SchoolLogoComponent
  ],
  template: `
    <div class="exams-container">
      <div class="exams-header">
        <div class="brand-section">
          <app-school-logo size="medium"></app-school-logo>
          <div class="header-text">
            <h1 class="brand-heading">Exam Management</h1>
            <p class="brand-subheading">Manage and monitor all exams</p>
          </div>
        </div>
        <button mat-raised-button routerLink="/admin/exams/create" class="btn-brand-primary create-button">
          <mat-icon>add</mat-icon>
          <span class="tablet-up">Create New Exam</span>
          <span class="mobile-only">New Exam</span>
        </button>
      </div>

      <mat-card *ngIf="!(isLoading$ | async); else loading">
        <mat-card-content>
          <!-- Desktop Table View -->
          <div class="table-container tablet-up">
            <table mat-table [dataSource]="exams" class="exams-table">
              <!-- Title Column -->
              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef>Title</th>
                <td mat-cell *matCellDef="let exam">
                  <div class="exam-title">
                    <h3>{{ exam.title }}</h3>
                    <p class="exam-description">{{ cleanDescription(exam.description) }}</p>
                  </div>
                </td>
              </ng-container>

              <!-- Year Column -->
              <ng-container matColumnDef="year">
                <th mat-header-cell *matHeaderCellDef>Year</th>
                <td mat-cell *matCellDef="let exam">{{ exam.year }}</td>
              </ng-container>

              <!-- Date Column -->
              <ng-container matColumnDef="examDate">
                <th mat-header-cell *matHeaderCellDef>Exam Date</th>
                <td mat-cell *matCellDef="let exam">
                  {{ exam.examDate | date:'medium' }}
                </td>
              </ng-container>

              <!-- Duration Column -->
              <ng-container matColumnDef="duration">
                <th mat-header-cell *matHeaderCellDef>Duration</th>
                <td mat-cell *matCellDef="let exam">
                  {{ formatDuration(exam.durationMinutes) }}
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let exam">
                  <mat-chip [class]="getStatusClass(exam.status)">
                    {{ exam.status | titlecase }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Stats Column -->
              <ng-container matColumnDef="stats">
                <th mat-header-cell *matHeaderCellDef>Statistics</th>
                <td mat-cell *matCellDef="let exam">
                  <div class="exam-stats">
                    <span>{{ exam.calculatedTotalQuestions || 0 }} questions</span>
                    <span>{{ exam.calculatedTotalMarks || 0 | number:'1.2-2' }} marks</span>
                  </div>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let exam">
                  <button mat-icon-button [matMenuTriggerFor]="menu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="viewExam(exam.id)">
                      <mat-icon>visibility</mat-icon>
                      View
                    </button>
                    <button mat-menu-item (click)="editExam(exam.id)">
                      <mat-icon>edit</mat-icon>
                      Edit
                    </button>
                    <button mat-menu-item (click)="manageQuestions(exam.id)">
                      <mat-icon>quiz</mat-icon>
                      Manage Questions
                    </button>
                    <button mat-menu-item (click)="publishExam(exam)" *ngIf="exam.status === 'draft'">
                      <mat-icon>publish</mat-icon>
                      Publish
                    </button>
                    <button mat-menu-item (click)="closeExam(exam)" *ngIf="exam.status === 'published'">
                      <mat-icon>close</mat-icon>
                      Close
                    </button>
                    <button mat-menu-item (click)="deleteExam(exam)" 
                            [disabled]="exam.status === 'published'"
                            class="delete-action">
                      <mat-icon>delete</mat-icon>
                      <span *ngIf="exam.status === 'published'">Delete (Close first)</span>
                      <span *ngIf="exam.status !== 'published'">Delete</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>

          <!-- Mobile Card View -->
          <div class="mobile-exams-list mobile-only" *ngIf="exams.length > 0">
            <mat-card *ngFor="let exam of exams" class="exam-card">
              <mat-card-content>
                <div class="exam-card-header">
                  <div class="exam-info">
                    <h3>{{ exam.title }}</h3>
                    <p class="exam-description">{{ cleanDescription(exam.description) }}</p>
                  </div>
                  <button mat-icon-button [matMenuTriggerFor]="mobileMenu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #mobileMenu="matMenu">
                    <button mat-menu-item (click)="viewExam(exam.id)">
                      <mat-icon>visibility</mat-icon>
                      View
                    </button>
                    <button mat-menu-item (click)="editExam(exam.id)">
                      <mat-icon>edit</mat-icon>
                      Edit
                    </button>
                    <button mat-menu-item (click)="manageQuestions(exam.id)">
                      <mat-icon>quiz</mat-icon>
                      Manage Questions
                    </button>
                    <button mat-menu-item (click)="publishExam(exam)" *ngIf="exam.status === 'draft'">
                      <mat-icon>publish</mat-icon>
                      Publish
                    </button>
                    <button mat-menu-item (click)="closeExam(exam)" *ngIf="exam.status === 'published'">
                      <mat-icon>close</mat-icon>
                      Close
                    </button>
                    <button mat-menu-item (click)="deleteExam(exam)" 
                            [disabled]="exam.status === 'published'"
                            class="delete-action">
                      <mat-icon>delete</mat-icon>
                      <span *ngIf="exam.status === 'published'">Delete (Close first)</span>
                      <span *ngIf="exam.status !== 'published'">Delete</span>
                    </button>
                  </mat-menu>
                </div>
                
                <div class="exam-details">
                  <div class="detail-row">
                    <span class="detail-label">Year:</span>
                    <span>{{ exam.year }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span>{{ exam.examDate | date:'short' }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Duration:</span>
                    <span>{{ formatDuration(exam.durationMinutes) }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <mat-chip [class]="getStatusClass(exam.status)">
                      {{ exam.status | titlecase }}
                    </mat-chip>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Questions:</span>
                    <span>{{ exam.calculatedTotalQuestions || 0 }} ({{ exam.calculatedTotalMarks || 0 }} marks)</span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <div class="no-data" *ngIf="exams.length === 0">
            <mat-icon>quiz</mat-icon>
            <h3>No exams found</h3>
            <p>Create your first exam to get started</p>
            <button mat-raised-button color="primary" routerLink="/admin/exams/create">
              <mat-icon>add</mat-icon>
              Create Exam
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <ng-template #loading>
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Loading exams...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .exams-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      background: linear-gradient(135deg, var(--anarchy-off-white) 0%, #E5E7EB 100%);
      min-height: 100vh;
    }

    .exams-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding: 20px;
      background: var(--glass-card);
      border-radius: 20px;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: var(--glass-shadow);
      position: relative;
    }

    .brand-section {
      display: flex;
      align-items: center;
      gap: 20px;
      flex: 1;
      min-width: 0; /* Allow text to wrap if needed */
    }

    .create-button {
      flex-shrink: 0;
      margin-left: 20px;
      z-index: 10;
      position: relative;
    }

    .header-text h1 {
      margin: 0 0 8px 0;
      font-family: 'Playfair Display', serif;
      font-size: 2rem;
      font-weight: 600;
      color: var(--anarchy-blue);
    }

    .header-text p {
      margin: 0;
      font-family: 'Inter', sans-serif;
      color: var(--anarchy-grey);
      font-size: 1rem;
    }

    .exams-header h1 {
      margin: 0;
      color: #1976d2;
    }

    .table-container {
      overflow-x: auto;
    }

    .exams-table {
      width: 100%;
    }

    .exam-title h3 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 500;
    }

    .exam-description {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .exam-stats {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 14px;
      color: #666;
    }

    .status-draft {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .status-published {
      background-color: #e8f5e8;
      color: #4caf50;
    }

    .status-closed {
      background-color: #ffebee;
      color: #f44336;
    }

    .delete-action {
      color: #f44336;
    }

    .delete-action:disabled {
      color: #ccc;
      cursor: not-allowed;
    }

    .no-data {
      text-align: center;
      padding: 40px;
    }

    .no-data mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .no-data h3 {
      margin: 0 0 8px 0;
      color: #666;
    }

    .no-data p {
      margin: 0 0 24px 0;
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

    /* Mobile-specific styles */
    .mobile-exams-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .exam-card {
      margin: 0;
      background: var(--glass-card);
      border-radius: 16px;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: var(--glass-shadow);
      transition: all 0.3s ease;
    }

    .exam-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.5);
    }

    .exam-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .exam-card-header .exam-info h3 {
      margin: 0 0 4px 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--anarchy-blue);
      font-family: 'Playfair Display', serif;
    }

    .exam-card-header .exam-info .exam-description {
      margin: 0;
      color: var(--anarchy-grey);
      font-size: 0.875rem;
      line-height: 1.4;
      font-family: 'Inter', sans-serif;
    }

    .exam-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0;
    }

    .detail-label {
      font-weight: 500;
      color: #666;
      font-size: 0.875rem;
    }

    .detail-row span:last-child {
      color: #333;
      font-size: 0.875rem;
    }

    /* Medium screens - prevent overlap */
    @media (max-width: 1024px) and (min-width: 769px) {
      .exams-header {
        padding: 16px;
      }

      .header-text h1 {
        font-size: 1.75rem;
      }

      .create-button {
        margin-left: 16px;
        padding: 8px 16px;
        font-size: 14px;
      }
    }

    /* Mobile header adjustments */
    @media (max-width: 768px) {
      .exams-container {
        padding: 16px;
      }

      .exams-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
        margin-bottom: 20px;
      }

      .brand-section {
        flex-direction: column;
        text-align: center;
        gap: 12px;
      }

      .header-text h1 {
        font-size: 1.5rem;
        margin: 0 0 4px 0;
      }

      .header-text p {
        font-size: 0.875rem;
      }

      .create-button {
        width: 100%;
        height: 48px;
        margin-left: 0;
      }
    }

    /* Small mobile devices */
    @media (max-width: 480px) {
      .exams-container {
        padding: 12px;
      }

      .exam-card-header .exam-info h3 {
        font-size: 1rem;
      }

      .detail-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
      }

      .detail-label {
        font-size: 0.75rem;
      }

      .detail-row span:last-child {
        font-size: 0.875rem;
      }
    }
  `]
})
export class ExamsListComponent implements OnInit, OnDestroy {
  exams$: Observable<any[]>;
  isLoading$: Observable<boolean>;
  displayedColumns: string[] = ['title', 'year', 'examDate', 'duration', 'status', 'stats', 'actions'];
  private routerSubscription?: Subscription;
  exams: any[] = [];

  constructor(
    private store: Store<AppState>,
    private examService: ExamService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.exams$ = this.store.select(selectExamsWithCalculatedStats);
    this.isLoading$ = this.store.select(selectExamLoading);
  }

  ngOnInit() {
    this.loadExams();
    
    // Subscribe to exams data
    this.exams$.subscribe(exams => {
      this.exams = exams || [];
    });
    
    // Listen for navigation events to refresh data when returning to this page
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url === '/admin/exams') {
          // Add a small delay to ensure backend has completed any pending operations
          setTimeout(() => {
            this.loadExams();
          }, 200);
        }
      });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private loadExams() {
    this.store.dispatch(ExamActions.loadExams());
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
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

  viewExam(id: string) {
    // Navigate to exam view
    this.router.navigate(['/admin/exams', id]);
  }

  editExam(id: string) {
    // Navigate to exam edit
    this.router.navigate(['/admin/exams', id, 'edit']);
  }

  manageQuestions(id: string) {
    // Navigate to question management
    this.router.navigate(['/admin/exams', id, 'questions']);
  }

  publishExam(exam: Exam) {
    this.examService.publishExam(exam.id).subscribe({
      next: () => {
        exam.status = 'published';
        this.snackBar.open('Exam published successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error publishing exam:', error);
        this.snackBar.open('Error publishing exam', 'Close', { duration: 3000 });
      }
    });
  }

  closeExam(exam: Exam) {
    this.examService.closeExam(exam.id).subscribe({
      next: () => {
        exam.status = 'closed';
        this.snackBar.open('Exam closed successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error closing exam:', error);
        this.snackBar.open('Error closing exam', 'Close', { duration: 3000 });
      }
    });
  }

  deleteExam(exam: Exam) {
    // Check if exam is published
    if (exam.status === 'published') {
      this.snackBar.open(
        'Cannot delete published exam. Please close the exam first, then you can delete it.',
        'Close',
        { duration: 5000, panelClass: ['warning-snackbar'] }
      );
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Exam',
        message: `Are you sure you want to delete "${exam.title}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.examService.deleteExam(exam.id).subscribe({
          next: () => {
            this.store.dispatch(ExamActions.deleteExamSuccess({ id: exam.id }));
            this.snackBar.open('Exam deleted successfully', 'Close', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error deleting exam:', error);
            if (error.error?.message?.includes('Cannot delete published exam')) {
              this.snackBar.open(
                'Cannot delete published exam. Please close the exam first.',
                'Close',
                { duration: 5000, panelClass: ['error-snackbar'] }
              );
            } else {
              this.snackBar.open('Error deleting exam', 'Close', { duration: 3000 });
            }
          }
        });
      }
    });
  }
}
