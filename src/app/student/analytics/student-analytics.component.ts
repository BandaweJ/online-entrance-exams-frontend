import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsService, StudentPerformanceMetrics } from '../../core/services/analytics.service';
import { ResultsService } from '../../core/services/results.service';
import { SchoolLogoComponent } from '../../shared/components/school-logo/school-logo.component';

@Component({
  selector: 'app-student-analytics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTabsModule,
    BaseChartDirective,
    SchoolLogoComponent
  ],
  template: `
    <div class="student-analytics-container">
      <!-- Header -->
      <div class="analytics-header">
        <div class="brand-section">
          <app-school-logo size="medium"></app-school-logo>
          <div class="header-text">
            <h1 class="brand-heading">My Performance Analytics</h1>
            <p class="brand-subheading">Track Your Progress & Performance</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Loading your performance data...</p>
      </div>

      <!-- Analytics Content -->
      <div *ngIf="!isLoading" class="analytics-content">
        <!-- Summary Cards -->
        <div class="summary-cards">
          <mat-card class="summary-card">
            <mat-card-content>
              <div class="card-content">
                <mat-icon class="card-icon">quiz</mat-icon>
                <div class="card-info">
                  <h3>{{ studentStats?.totalExams || 0 }}</h3>
                  <p>Exams Taken</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="card-content">
                <mat-icon class="card-icon">trending_up</mat-icon>
                <div class="card-info">
                  <h3>{{ (studentStats?.averagePercentage | number:'1.1-1') || 0 }}%</h3>
                  <p>Average Score</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="card-content">
                <mat-icon class="card-icon">check_circle</mat-icon>
                <div class="card-info">
                  <h3>{{ studentStats?.examsPassed || 0 }}</h3>
                  <p>Exams Passed</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="card-content">
                <mat-icon class="card-icon">schedule</mat-icon>
                <div class="card-info">
                  <h3>{{ formatTimeSpent(studentStats?.totalTimeSpent || 0) }}</h3>
                  <p>Total Time Spent</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Performance Charts -->
        <div class="charts-section">
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Performance Over Time</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <canvas baseChart
                [data]="performanceChartData"
                [options]="performanceChartOptions"
                [type]="'line'">
              </canvas>
            </mat-card-content>
          </mat-card>

          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Grade Distribution</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <canvas baseChart
                [data]="gradeDistributionChartData"
                [options]="gradeDistributionChartOptions"
                [type]="'doughnut'">
              </canvas>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Recent Results Table -->
        <mat-card class="results-table-card">
          <mat-card-header>
            <mat-card-title>Recent Exam Results</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="results-list" *ngIf="recentResults.length > 0; else noResults">
              <div class="result-item" *ngFor="let result of recentResults">
                <div class="result-info">
                  <h4>{{ result.exam?.title || 'Unknown Exam' }}</h4>
                  <p class="result-date">{{ formatDate(result.createdAt) }}</p>
                </div>
                <div class="result-stats">
                  <mat-chip [color]="getGradeColor(result.grade)" selected>
                    {{ result.grade || 'N/A' }}
                  </mat-chip>
                  <span class="result-percentage">{{ result.percentage | number:'1.1-1' }}%</span>
                </div>
              </div>
            </div>
            <ng-template #noResults>
              <div class="no-results">
                <mat-icon>assessment</mat-icon>
                <p>No exam results available yet.</p>
              </div>
            </ng-template>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .student-analytics-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      background: linear-gradient(135deg, var(--anarchy-off-white) 0%, #E5E7EB 100%);
      min-height: 100vh;
    }

    .analytics-header {
      margin-bottom: 30px;
      padding: 24px;
      background: var(--glass-card);
      border-radius: 20px;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: var(--glass-shadow);
    }

    .brand-section {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .header-text h1 {
      margin: 0 0 8px 0;
      font-family: 'Playfair Display', serif;
      font-size: 2rem;
      font-weight: 600;
      color: var(--anarchy-blue);
      line-height: 1.2;
    }

    .header-text p {
      margin: 0;
      font-family: 'Inter', sans-serif;
      color: var(--anarchy-grey);
      font-size: 1.125rem;
      line-height: 1.3;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
    }

    .loading-container p {
      margin-top: 16px;
      color: #666;
      font-size: 16px;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .summary-card {
      background: var(--glass-card);
      border-radius: 16px;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: var(--glass-shadow);
      transition: all 0.3s ease;
    }

    .summary-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px 0 rgba(31, 38, 135, 0.4);
    }

    .card-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .card-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: var(--anarchy-gold);
      filter: drop-shadow(0 2px 4px rgba(212, 175, 55, 0.3));
    }

    .card-info h3 {
      margin: 0;
      font-size: 32px;
      font-weight: bold;
      color: var(--anarchy-blue);
      text-shadow: 0 1px 2px rgba(30, 58, 138, 0.2);
      line-height: 1.1;
    }

    .card-info p {
      margin: 0;
      color: var(--anarchy-grey);
      font-size: 14px;
      font-weight: 500;
      line-height: 1.2;
    }

    .charts-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
      margin-bottom: 30px;
    }

    .chart-card, .results-table-card {
      background: var(--glass-card);
      border-radius: 16px;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: var(--glass-shadow);
    }

    .chart-card mat-card-header {
      margin-bottom: 16px;
    }

    .chart-card mat-card-title {
      font-size: 1.25rem;
      color: var(--anarchy-blue);
      font-weight: 600;
    }

    .results-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .result-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .result-item:last-child {
      border-bottom: none;
    }

    .result-info h4 {
      margin: 0 0 4px 0;
      font-size: 1rem;
      color: var(--anarchy-blue);
      font-weight: 600;
    }

    .result-date {
      margin: 0;
      font-size: 0.875rem;
      color: var(--anarchy-grey);
    }

    .result-stats {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .result-percentage {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--anarchy-blue);
    }

    .no-results {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      text-align: center;
    }

    .no-results mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--anarchy-grey);
      margin-bottom: 16px;
    }

    .no-results p {
      margin: 0;
      color: var(--anarchy-grey);
      font-size: 1rem;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .student-analytics-container {
        padding: 12px;
      }

      .analytics-header {
        padding: 16px;
      }

      .brand-section {
        flex-direction: column;
        text-align: center;
        gap: 12px;
      }

      .header-text h1 {
        font-size: 1.5rem;
      }

      .header-text p {
        font-size: 1rem;
      }

      .summary-cards {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .charts-section {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .result-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .result-stats {
        align-self: flex-end;
      }
    }

    @media (max-width: 480px) {
      .summary-cards {
        grid-template-columns: 1fr;
      }

      .card-content {
        flex-direction: column;
        text-align: center;
        gap: 8px;
      }

      .card-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      .card-info h3 {
        font-size: 24px;
      }
    }
  `]
})
export class StudentAnalyticsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  isLoading = true;
  studentStats: any = null;
  recentResults: any[] = [];

  // Chart data
  performanceChartData: ChartData<'line'> = { datasets: [] };
  gradeDistributionChartData: ChartData<'doughnut'> = { datasets: [] };

  // Chart options
  performanceChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      title: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    }
  };

  gradeDistributionChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' },
      title: { display: false }
    }
  };

  constructor(
    private analyticsService: AnalyticsService,
    private resultsService: ResultsService
  ) {}

  ngOnInit() {
    this.loadStudentAnalytics();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadStudentAnalytics() {
    this.isLoading = true;

    // Load student stats and recent results
    this.resultsService.getStudentStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats: any) => {
          this.studentStats = stats;
          this.updatePerformanceChart();
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading student stats:', error);
          this.isLoading = false;
        }
      });

    this.resultsService.getStudentResults()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => {
          this.recentResults = results.slice(0, 10); // Last 10 results
          this.updateGradeDistributionChart();
        },
        error: (error: any) => {
          console.error('Error loading student results:', error);
        }
      });
  }

  private updatePerformanceChart() {
    if (!this.studentStats?.recentExams) return;

    const labels = this.studentStats.recentExams.map((exam: any, index: number) => `Exam ${index + 1}`);
    const percentages = this.studentStats.recentExams.map((exam: any) => exam.percentage);

    this.performanceChartData = {
      labels,
      datasets: [
        {
          data: percentages,
          label: 'Performance (%)',
          borderColor: '#3f51b5',
          backgroundColor: 'rgba(63, 81, 181, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  }

  private updateGradeDistributionChart() {
    if (!this.recentResults.length) return;

    const gradeCounts = this.recentResults.reduce((acc, result) => {
      const grade = result.grade || 'N/A';
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    this.gradeDistributionChartData = {
      labels: Object.keys(gradeCounts),
      datasets: [
        {
          data: Object.values(gradeCounts),
          backgroundColor: [
            '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b',
            '#ffc107', '#ff9800', '#ff5722', '#f44336'
          ]
        }
      ]
    };
  }

  getGradeColor(grade: string): 'primary' | 'accent' | 'warn' {
    if (!grade) return 'primary';
    
    switch (grade) {
      case 'A+':
      case 'A':
        return 'primary';
      case 'B+':
      case 'B':
        return 'accent';
      default:
        return 'warn';
    }
  }

  formatTimeSpent(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
