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
    MatProgressSpinnerModule
  ],
  template: `
    <div class="exams-container">
      <div class="exams-header">
        <h1>Exam Management</h1>
        <button mat-raised-button color="primary" routerLink="/admin/exams/create" class="create-button">
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
                    <p class="exam-description">{{ exam.description }}</p>
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
                  {{ exam.durationMinutes }} min
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
                    <button mat-menu-item (click)="deleteExam(exam)" class="delete-action">
                      <mat-icon>delete</mat-icon>
                      Delete
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
                    <p class="exam-description">{{ exam.description }}</p>
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
                    <button mat-menu-item (click)="deleteExam(exam)" class="delete-action">
                      <mat-icon>delete</mat-icon>
                      Delete
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
                    <span>{{ exam.durationMinutes }} min</span>
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
    }

    .exams-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
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
      font-weight: 500;
      color: #1976d2;
    }

    .exam-card-header .exam-info .exam-description {
      margin: 0;
      color: #666;
      font-size: 0.875rem;
      line-height: 1.4;
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

      .exams-header h1 {
        font-size: 1.5rem;
        text-align: center;
      }

      .create-button {
        width: 100%;
        height: 48px;
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
            this.snackBar.open('Error deleting exam', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
}
