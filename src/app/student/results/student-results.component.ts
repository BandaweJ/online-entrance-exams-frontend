import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { ResultsService } from '../../core/services/results.service';
import { Result } from '../../models/result.model';

@Component({
  selector: 'app-student-results',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTableModule
  ],
  template: `
    <div class="student-results-container">
      <div class="results-header">
        <h1>My Results</h1>
        <p>View your exam results and performance</p>
      </div>

      <div class="results-grid" *ngIf="!isLoading; else loading">
        <mat-card *ngFor="let result of results" class="result-card">
          <mat-card-header>
            <mat-card-title>{{ result.exam?.title }}</mat-card-title>
            <mat-card-subtitle>{{ result.exam?.year }}</mat-card-subtitle>
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

      <div class="no-results" *ngIf="results.length === 0 && !isLoading">
        <mat-icon>assessment</mat-icon>
        <h3>No results yet</h3>
        <p>Complete exams to see your results here.</p>
      </div>

      <ng-template #loading>
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Loading results...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .student-results-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .results-header {
      margin-bottom: 30px;
    }

    .results-header h1 {
      margin: 0 0 8px 0;
      color: #1976d2;
    }

    .results-header p {
      margin: 0;
      color: #666;
    }

    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .result-card {
      transition: transform 0.2s ease-in-out;
    }

    .result-card:hover {
      transform: translateY(-2px);
    }

    .result-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin: 16px 0;
    }

    .stat-item {
      text-align: center;
    }

    .stat-item h3 {
      margin: 0 0 4px 0;
      font-size: 20px;
      font-weight: bold;
      color: #1976d2;
    }

    .stat-item p {
      margin: 0;
      color: #666;
      font-size: 12px;
    }

    .result-status {
      display: flex;
      gap: 8px;
      margin: 16px 0;
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

    .no-results {
      text-align: center;
      padding: 40px;
    }

    .no-results mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .no-results h3 {
      margin: 0 0 8px 0;
      color: #666;
    }

    .no-results p {
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
  `]
})
export class StudentResultsComponent implements OnInit {
  results: Result[] = [];
  isLoading = false;

  constructor(
    private resultsService: ResultsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadResults();
  }

  private loadResults() {
    this.isLoading = true;
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

  viewDetailedResult(resultId: string) {
    // Navigate to detailed result view
    this.router.navigate(['/student/results', resultId]);
  }
}
