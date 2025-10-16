import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Result, ExamStats } from '../../models/result.model';
import { Exam } from '../../models/exam.model';
import { ExamService } from '../../core/services/exam.service';
import { ResultsService } from '../../core/services/results.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-results-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatDialogModule
  ],
  template: `
    <div class="results-container">
      <div class="results-header">
        <h1>Results Management</h1>
      </div>

      <mat-card *ngIf="!isLoading; else loading">
        <mat-tab-group>
          <!-- All Results Tab -->
          <mat-tab label="All Results">
            <div class="tab-content">
              <div class="results-filters">
                <mat-form-field appearance="outline">
                  <mat-label>Filter by Exam</mat-label>
                  <mat-select [(value)]="selectedExamFilter" (selectionChange)="applyFilters()">
                    <mat-option value="">All Exams</mat-option>
                    <mat-option *ngFor="let exam of exams" [value]="exam.id">
                      {{ exam.title }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Search students</mat-label>
                  <input matInput [ngModel]="searchTerm" (ngModelChange)="searchTerm = $event; applyFilters()" placeholder="Search by student name">
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>
              </div>

              <!-- Desktop Table View -->
              <div class="table-container tablet-up">
                <table mat-table [dataSource]="filteredResults" class="results-table">
                  <!-- Student Column -->
                  <ng-container matColumnDef="student">
                    <th mat-header-cell *matHeaderCellDef>Student</th>
                    <td mat-cell *matCellDef="let result">
                      <div class="student-info">
                        <h4>{{ result.student?.firstName }} {{ result.student?.lastName }}</h4>
                        <p>{{ result.student?.email }}</p>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Exam Column -->
                  <ng-container matColumnDef="exam">
                    <th mat-header-cell *matHeaderCellDef>Exam</th>
                    <td mat-cell *matCellDef="let result">
                      <div class="exam-info">
                        <h4>{{ result.exam?.title }}</h4>
                        <p>{{ result.exam?.year }}</p>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Score Column -->
                  <ng-container matColumnDef="score">
                    <th mat-header-cell *matHeaderCellDef>Score</th>
                    <td mat-cell *matCellDef="let result">
                      <div class="score-info">
                        <h3>{{ result.score }}/{{ result.totalMarks }}</h3>
                        <p>{{ result.percentage | number:'1.2-2' }}%</p>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Grade Column -->
                  <ng-container matColumnDef="grade">
                    <th mat-header-cell *matHeaderCellDef>Grade</th>
                    <td mat-cell *matCellDef="let result">
                      <mat-chip [class]="getGradeClass(result.grade)">
                        {{ result.grade }}
                      </mat-chip>
                    </td>
                  </ng-container>

                  <!-- Rank Column -->
                  <ng-container matColumnDef="rank">
                    <th mat-header-cell *matHeaderCellDef>Rank</th>
                    <td mat-cell *matCellDef="let result">
                      <div class="rank-info">
                        <span class="rank">{{ result.rank }}</span>
                        <span class="total">/{{ result.totalStudents }}</span>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Status Column -->
                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Status</th>
                    <td mat-cell *matCellDef="let result">
                      <div class="status-chips">
                        <mat-chip [class]="result.isPassed ? 'status-passed' : 'status-failed'">
                          {{ result.isPassed ? 'Passed' : 'Failed' }}
                        </mat-chip>
                        <mat-chip [class]="result.isPublished ? 'status-published' : 'status-draft'">
                          {{ result.isPublished ? 'Published' : 'Draft' }}
                        </mat-chip>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Actions Column -->
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let result">
                      <button mat-icon-button [matMenuTriggerFor]="menu">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #menu="matMenu">
                        <button mat-menu-item (click)="viewResult(result.id)">
                          <mat-icon>visibility</mat-icon>
                          View Details
                        </button>
                        <button mat-menu-item (click)="publishResult(result)" *ngIf="!result.isPublished">
                          <mat-icon>publish</mat-icon>
                          Publish
                        </button>
                        <button mat-menu-item (click)="unpublishResult(result)" *ngIf="result.isPublished">
                          <mat-icon>unpublish</mat-icon>
                          Unpublish
                        </button>
                      </mat-menu>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                </table>
              </div>

              <!-- Mobile Card View -->
              <div class="mobile-results-list mobile-only" *ngIf="filteredResults.length > 0">
                <mat-card *ngFor="let result of filteredResults" class="result-card">
                  <mat-card-content>
                    <div class="result-card-header">
                      <div class="result-info">
                        <h3>{{ result.student?.firstName }} {{ result.student?.lastName }}</h3>
                        <p class="student-email">{{ result.student?.email }}</p>
                        <p class="exam-title">{{ result.exam?.title }} ({{ result.exam?.year }})</p>
                      </div>
                      <button mat-icon-button [matMenuTriggerFor]="mobileMenu">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #mobileMenu="matMenu">
                        <button mat-menu-item (click)="viewResult(result.id)">
                          <mat-icon>visibility</mat-icon>
                          View Details
                        </button>
                        <button mat-menu-item (click)="publishResult(result)" *ngIf="!result.isPublished">
                          <mat-icon>publish</mat-icon>
                          Publish
                        </button>
                        <button mat-menu-item (click)="unpublishResult(result)" *ngIf="result.isPublished">
                          <mat-icon>unpublish</mat-icon>
                          Unpublish
                        </button>
                      </mat-menu>
                    </div>
                    
                    <div class="result-details">
                      <div class="detail-row">
                        <span class="detail-label">Score:</span>
                        <span class="score-value">{{ result.score }}/{{ result.totalMarks }} ({{ result.percentage | number:'1.2-2' }}%)</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Grade:</span>
                        <mat-chip [class]="getGradeClass(result.grade)">{{ result.grade }}</mat-chip>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Rank:</span>
                        <span>{{ result.rank }}/{{ result.totalStudents }}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <div class="status-chips">
                          <mat-chip [class]="result.isPassed ? 'status-passed' : 'status-failed'">
                            {{ result.isPassed ? 'Passed' : 'Failed' }}
                          </mat-chip>
                          <mat-chip [class]="result.isPublished ? 'status-published' : 'status-draft'">
                            {{ result.isPublished ? 'Published' : 'Draft' }}
                          </mat-chip>
                        </div>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>

          <!-- Exam Statistics Tab -->
          <mat-tab label="Exam Statistics">
            <div class="tab-content">
              <div class="stats-header">
                <h2>Exam Statistics</h2>
                <mat-form-field appearance="outline">
                  <mat-label>Select Exam</mat-label>
                  <mat-select [(value)]="selectedExamForStats" (selectionChange)="loadExamStats()">
                    <mat-option *ngFor="let exam of exams" [value]="exam.id">
                      {{ exam.title }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="stats-grid" *ngIf="examStats">
                <mat-card class="stat-card">
                  <mat-card-content>
                    <div class="stat-content">
                      <mat-icon class="stat-icon">people</mat-icon>
                      <div class="stat-info">
                        <h3>{{ examStats.totalStudents }}</h3>
                        <p>Total Students</p>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                  <mat-card-content>
                    <div class="stat-content">
                      <mat-icon class="stat-icon">assessment</mat-icon>
                      <div class="stat-info">
                        <h3>{{ examStats.averageScore | number:'1.2-2' }}</h3>
                        <p>Average Score</p>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                  <mat-card-content>
                    <div class="stat-content">
                      <mat-icon class="stat-icon">trending_up</mat-icon>
                      <div class="stat-info">
                        <h3>{{ examStats.highestScore }}</h3>
                        <p>Highest Score</p>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                  <mat-card-content>
                    <div class="stat-content">
                      <mat-icon class="stat-icon">trending_down</mat-icon>
                      <div class="stat-info">
                        <h3>{{ examStats.lowestScore }}</h3>
                        <p>Lowest Score</p>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                  <mat-card-content>
                    <div class="stat-content">
                      <mat-icon class="stat-icon">check_circle</mat-icon>
                      <div class="stat-info">
                        <h3>{{ examStats.passRate | number:'1.2-2' }}%</h3>
                        <p>Pass Rate</p>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-card>

      <ng-template #loading>
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Loading results...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .results-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .results-header h1 {
      margin: 0 0 30px 0;
      color: #1976d2;
    }

    .tab-content {
      padding: 20px 0;
    }

    .results-filters {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
      align-items: center;
    }

    .results-filters mat-form-field {
      min-width: 200px;
    }

    .table-container {
      overflow-x: auto;
    }

    .results-table {
      width: 100%;
    }

    .student-info h4, .exam-info h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 500;
    }

    .student-info p, .exam-info p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .score-info h3 {
      margin: 0 0 4px 0;
      font-size: 18px;
      font-weight: bold;
      color: #1976d2;
    }

    .score-info p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .rank-info {
      display: flex;
      align-items: baseline;
    }

    .rank {
      font-size: 18px;
      font-weight: bold;
      color: #1976d2;
    }

    .total {
      color: #666;
      font-size: 14px;
    }

    .status-chips {
      display: flex;
      flex-direction: column;
      gap: 4px;
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

    .grade-a-plus, .grade-a {
      background-color: #e8f5e8;
      color: #4caf50;
    }

    .grade-b-plus, .grade-b {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .grade-c-plus, .grade-c {
      background-color: #fff3e0;
      color: #ff9800;
    }

    .grade-d, .grade-f {
      background-color: #ffebee;
      color: #f44336;
    }

    .stats-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .stats-header h2 {
      margin: 0;
      color: #333;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .stat-card {
      transition: transform 0.2s ease-in-out;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #1976d2;
    }

    .stat-info h3 {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }

    .stat-info p {
      margin: 0;
      color: #666;
      font-size: 14px;
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
    .mobile-results-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .result-card {
      margin: 0;
    }

    .result-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .result-card-header .result-info h3 {
      margin: 0 0 4px 0;
      font-size: 1.125rem;
      font-weight: 500;
      color: #1976d2;
    }

    .result-card-header .result-info .student-email {
      margin: 0 0 2px 0;
      color: #666;
      font-size: 0.875rem;
    }

    .result-card-header .result-info .exam-title {
      margin: 0;
      color: #999;
      font-size: 0.75rem;
    }

    .result-details {
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

    .score-value {
      font-weight: 600;
      color: #1976d2;
    }

    .detail-row .status-chips {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    /* Mobile header adjustments */
    @media (max-width: 768px) {
      .results-container {
        padding: 16px;
      }

      .results-header h1 {
        font-size: 1.5rem;
        text-align: center;
        margin-bottom: 20px;
      }

      .results-filters {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .results-filters mat-form-field {
        width: 100%;
        min-width: auto;
      }

      .stats-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .stats-header h2 {
        font-size: 1.25rem;
        text-align: center;
      }

      .stats-header mat-form-field {
        width: 100%;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .stat-card {
        padding: 12px;
      }

      .stat-content {
        gap: 12px;
      }

      .stat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      .stat-info h3 {
        font-size: 18px;
      }

      .stat-info p {
        font-size: 12px;
      }
    }

    /* Small mobile devices */
    @media (max-width: 480px) {
      .results-container {
        padding: 12px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        gap: 8px;
      }

      .result-card-header .result-info h3 {
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
export class ResultsListComponent implements OnInit {
  results: Result[] = [];
  filteredResults: Result[] = [];
  exams: Exam[] = [];
  examStats: ExamStats | null = null;
  selectedExamFilter = '';
  selectedExamForStats = '';
  searchTerm = '';
  displayedColumns: string[] = ['student', 'exam', 'score', 'grade', 'rank', 'status', 'actions'];
  isLoading = false;

  constructor(
    private resultsService: ResultsService,
    private examService: ExamService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadResults();
    this.loadExams();
  }

  private loadResults() {
    this.isLoading = true;
    console.log('Loading results for admin...');
    this.resultsService.getResults().subscribe({
      next: (results) => {
        console.log('Results loaded:', results);
        this.results = results;
        this.filteredResults = [...results];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading results:', error);
        this.snackBar.open('Error loading results', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  private loadExams() {
    this.examService.getExams().subscribe({
      next: (exams) => {
        this.exams = exams;
      },
      error: (error) => {
        console.error('Error loading exams:', error);
      }
    });
  }

  applyFilters() {
    // First apply exam filter
    let filteredByExam = this.results;
    if (this.selectedExamFilter) {
      filteredByExam = this.results.filter(result => result.examId === this.selectedExamFilter);
    }
    
    // Then apply search filter if there's a search term
    if (this.searchTerm.trim()) {
      const searchTerm = this.searchTerm.toLowerCase();
      this.filteredResults = filteredByExam.filter(result =>
        result.student?.firstName?.toLowerCase().includes(searchTerm) ||
        result.student?.lastName?.toLowerCase().includes(searchTerm) ||
        result.student?.email?.toLowerCase().includes(searchTerm)
      );
    } else {
      this.filteredResults = filteredByExam;
    }
  }

  loadExamStats() {
    if (this.selectedExamForStats) {
      this.resultsService.getExamStats(this.selectedExamForStats).subscribe({
        next: (stats) => {
          this.examStats = stats;
        },
        error: (error) => {
          console.error('Error loading exam stats:', error);
          this.snackBar.open('Error loading exam statistics', 'Close', { duration: 3000 });
        }
      });
    }
  }

  getGradeClass(grade: string): string {
    return `grade-${grade.toLowerCase().replace('+', '-plus')}`;
  }

  viewResult(id: string) {
    this.router.navigate(['/admin/results', id]);
  }

  publishResult(result: Result) {
    this.resultsService.publishResult(result.id).subscribe({
      next: () => {
        result.isPublished = true;
        this.snackBar.open('Result published successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error publishing result:', error);
        this.snackBar.open('Error publishing result', 'Close', { duration: 3000 });
      }
    });
  }

  unpublishResult(result: Result) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Unpublish Result',
        message: `Are you sure you want to unpublish this result?`,
        confirmText: 'Unpublish',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        // For now, just update the local state
        // In a real implementation, you'd call an API endpoint
        result.isPublished = false;
        result.publishedAt = undefined;
        this.snackBar.open('Result unpublished successfully', 'Close', { duration: 3000 });
      }
    });
  }
}
