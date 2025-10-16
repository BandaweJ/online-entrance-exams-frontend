import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { AnalyticsService, DashboardSummary, PerformanceTrends, StudentPerformanceMetrics, TimeBasedAnalytics, SubjectPerformance } from '../../core/services/analytics.service';
import { SchoolLogoComponent } from '../../shared/components/school-logo/school-logo.component';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    FormsModule,
    BaseChartDirective,
    SchoolLogoComponent
  ],
  template: `
    <div class="analytics-container">
      <!-- Header -->
      <div class="analytics-header">
        <div class="brand-section">
          <app-school-logo size="medium"></app-school-logo>
          <div class="header-text">
            <h1 class="brand-heading">Analytics Dashboard</h1>
            <p class="brand-subheading">Student Performance Insights & Trends</p>
          </div>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="exportData()" [disabled]="isLoading">
            <mat-icon>download</mat-icon>
            Export Data
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Loading analytics data...</p>
      </div>

      <!-- Analytics Content -->
      <div *ngIf="!isLoading" class="analytics-content">
        <!-- Summary Cards -->
        <div class="summary-cards">
          <mat-card class="summary-card">
            <mat-card-content>
              <div class="card-content">
                <mat-icon class="card-icon">trending_up</mat-icon>
                <div class="card-info">
                  <h3>{{ summaryData?.performanceTrends?.length || 0 }}</h3>
                  <p>Performance Periods</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="card-content">
                <mat-icon class="card-icon">people</mat-icon>
                <div class="card-info">
                  <h3>{{ summaryData?.topStudents?.length || 0 }}</h3>
                  <p>Top Students</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="card-content">
                <mat-icon class="card-icon">assessment</mat-icon>
                <div class="card-info">
                  <h3>{{ summaryData?.subjectPerformance?.length || 0 }}</h3>
                  <p>Subjects Analyzed</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="card-content">
                <mat-icon class="card-icon">schedule</mat-icon>
                <div class="card-info">
                  <h3>{{ summaryData?.recentActivity?.length || 0 }}</h3>
                  <p>Recent Activity Days</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Analytics Tabs -->
        <mat-tab-group class="analytics-tabs">
          <!-- Performance Trends Tab -->
          <mat-tab label="Performance Trends">
            <div class="tab-content">
              <div class="tab-header">
                <h2>Performance Trends Over Time</h2>
                <div class="tab-controls">
                  <mat-form-field appearance="outline">
                    <mat-label>Period</mat-label>
                    <mat-select [(value)]="selectedPeriod" (selectionChange)="loadPerformanceTrends()">
                      <mat-option value="week">Week</mat-option>
                      <mat-option value="month">Month</mat-option>
                      <mat-option value="quarter">Quarter</mat-option>
                      <mat-option value="year">Year</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
              </div>
              
              <div class="charts-grid">
                <mat-card class="chart-card">
                  <mat-card-header>
                    <mat-card-title>Average Scores Over Time</mat-card-title>
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
                    <mat-card-title>Pass Rate Trends</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <canvas baseChart
                      [data]="passRateChartData"
                      [options]="passRateChartOptions"
                      [type]="'bar'">
                    </canvas>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>

          <!-- Student Performance Tab -->
          <mat-tab label="Student Performance">
            <div class="tab-content">
              <div class="tab-header">
                <h2>Student Performance Metrics</h2>
                <div class="tab-controls">
                  <mat-form-field appearance="outline">
                    <mat-label>Sort By</mat-label>
                    <mat-select [(value)]="studentSortBy" (selectionChange)="loadStudentPerformance()">
                      <mat-option value="averageScore">Average Score</mat-option>
                      <mat-option value="improvement">Improvement Trend</mat-option>
                      <mat-option value="totalExams">Total Exams</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
              </div>

              <div class="charts-grid">
                <mat-card class="chart-card">
                  <mat-card-header>
                    <mat-card-title>Top Performing Students</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <canvas baseChart
                      [data]="studentPerformanceChartData"
                      [options]="studentPerformanceChartOptions"
                      [type]="'bar'">
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

              <!-- Student Performance Table -->
              <mat-card class="table-card">
                <mat-card-header>
                  <mat-card-title>Student Performance Details</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <table mat-table [dataSource]="studentPerformanceData" class="performance-table">
                    <ng-container matColumnDef="studentName">
                      <th mat-header-cell *matHeaderCellDef>Student Name</th>
                      <td mat-cell *matCellDef="let student">{{ student.studentName }}</td>
                    </ng-container>

                    <ng-container matColumnDef="totalExams">
                      <th mat-header-cell *matHeaderCellDef>Exams Taken</th>
                      <td mat-cell *matCellDef="let student">{{ student.totalExams }}</td>
                    </ng-container>

                    <ng-container matColumnDef="averagePercentage">
                      <th mat-header-cell *matHeaderCellDef>Average %</th>
                      <td mat-cell *matCellDef="let student">{{ student.averagePercentage | number:'1.1-1' }}%</td>
                    </ng-container>

                    <ng-container matColumnDef="bestGrade">
                      <th mat-header-cell *matHeaderCellDef>Best Grade</th>
                      <td mat-cell *matCellDef="let student">
                        <mat-chip [color]="getGradeColor(student.bestGrade)" selected>
                          {{ student.bestGrade || 'N/A' }}
                        </mat-chip>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="improvementTrend">
                      <th mat-header-cell *matHeaderCellDef>Trend</th>
                      <td mat-cell *matCellDef="let student">
                        <mat-chip [color]="getTrendColor(student.improvementTrend)" selected>
                          <mat-icon>{{ getTrendIcon(student.improvementTrend) }}</mat-icon>
                          {{ student.improvementTrend | titlecase }}
                        </mat-chip>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="studentColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: studentColumns;"></tr>
                  </table>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Time-based Analytics Tab -->
          <mat-tab label="Time-based Analytics">
            <div class="tab-content">
              <div class="tab-header">
                <h2>Activity Patterns Over Time</h2>
                <div class="tab-controls">
                  <mat-form-field appearance="outline">
                    <mat-label>Time Period</mat-label>
                    <mat-select [(value)]="selectedTimePeriod" (selectionChange)="loadTimeBasedAnalytics()">
                      <mat-option value="day">Daily</mat-option>
                      <mat-option value="week">Weekly</mat-option>
                      <mat-option value="month">Monthly</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
              </div>

              <div class="charts-grid">
                <mat-card class="chart-card">
                  <mat-card-header>
                    <mat-card-title>Activity by Hour</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <canvas baseChart
                      [data]="hourlyActivityChartData"
                      [options]="hourlyActivityChartOptions"
                      [type]="'bar'">
                    </canvas>
                  </mat-card-content>
                </mat-card>

                <mat-card class="chart-card">
                  <mat-card-header>
                    <mat-card-title>Daily Activity Trends</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <canvas baseChart
                      [data]="dailyActivityChartData"
                      [options]="dailyActivityChartOptions"
                      [type]="'line'">
                    </canvas>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>

          <!-- Subject Performance Tab -->
          <mat-tab label="Subject Performance">
            <div class="tab-content">
              <div class="tab-header">
                <h2>Subject-wise Performance Analysis</h2>
              </div>

              <div class="charts-grid">
                <mat-card class="chart-card">
                  <mat-card-header>
                    <mat-card-title>Subject Accuracy Rates</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <canvas baseChart
                      [data]="subjectPerformanceChartData"
                      [options]="subjectPerformanceChartOptions"
                      [type]="'bar'">
                    </canvas>
                  </mat-card-content>
                </mat-card>

                <mat-card class="chart-card">
                  <mat-card-header>
                    <mat-card-title>Subject Difficulty Distribution</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <canvas baseChart
                      [data]="subjectDifficultyChartData"
                      [options]="subjectDifficultyChartOptions"
                      [type]="'doughnut'">
                    </canvas>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .analytics-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
      background: linear-gradient(135deg, var(--anarchy-off-white) 0%, #E5E7EB 100%);
      min-height: 100vh;
    }

    .analytics-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
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

    .header-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
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

    .analytics-tabs {
      background: var(--glass-card);
      border-radius: 16px;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: var(--glass-shadow);
    }

    .tab-content {
      padding: 24px;
    }

    .tab-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .tab-header h2 {
      margin: 0;
      font-family: 'Playfair Display', serif;
      font-size: 1.75rem;
      color: var(--anarchy-blue);
    }

    .tab-controls {
      display: flex;
      gap: 16px;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }

    .chart-card {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .chart-card mat-card-header {
      margin-bottom: 16px;
    }

    .chart-card mat-card-title {
      font-size: 1.25rem;
      color: var(--anarchy-blue);
      font-weight: 600;
    }

    .table-card {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .performance-table {
      width: 100%;
    }

    .performance-table th {
      font-weight: 600;
      color: var(--anarchy-blue);
      background: rgba(255, 255, 255, 0.1);
    }

    .performance-table td {
      padding: 12px 8px;
    }

    .performance-table mat-chip {
      font-size: 12px;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .analytics-container {
        padding: 12px;
      }

      .analytics-header {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }

      .brand-section {
        flex-direction: column;
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

      .charts-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .tab-header {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }

      .tab-controls {
        width: 100%;
        justify-content: center;
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
export class AnalyticsDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  isLoading = true;
  summaryData: DashboardSummary | null = null;
  
  // Performance trends data
  performanceTrendsData: PerformanceTrends[] = [];
  selectedPeriod: 'week' | 'month' | 'quarter' | 'year' = 'month';
  
  // Student performance data
  studentPerformanceData: StudentPerformanceMetrics[] = [];
  studentSortBy: 'averageScore' | 'improvement' | 'totalExams' = 'averageScore';
  
  // Time-based analytics data
  timeBasedData: TimeBasedAnalytics | null = null;
  selectedTimePeriod: 'day' | 'week' | 'month' = 'week';
  
  // Subject performance data
  subjectPerformanceData: SubjectPerformance[] = [];

  // Chart data
  performanceChartData: ChartData<'line'> = { datasets: [] };
  passRateChartData: ChartData<'bar'> = { datasets: [] };
  studentPerformanceChartData: ChartData<'bar'> = { datasets: [] };
  gradeDistributionChartData: ChartData<'doughnut'> = { datasets: [] };
  hourlyActivityChartData: ChartData<'bar'> = { datasets: [] };
  dailyActivityChartData: ChartData<'line'> = { datasets: [] };
  subjectPerformanceChartData: ChartData<'bar'> = { datasets: [] };
  subjectDifficultyChartData: ChartData<'doughnut'> = { datasets: [] };

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

  passRateChartOptions: ChartConfiguration['options'] = {
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

  studentPerformanceChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      title: { display: false }
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

  hourlyActivityChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      title: { display: false }
    }
  };

  dailyActivityChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      title: { display: false }
    }
  };

  subjectPerformanceChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      title: { display: false }
    }
  };

  subjectDifficultyChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' },
      title: { display: false }
    }
  };

  // Table columns
  studentColumns = ['studentName', 'totalExams', 'averagePercentage', 'bestGrade', 'improvementTrend'];

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData() {
    this.isLoading = true;
    
    forkJoin({
      summary: this.analyticsService.getDashboardSummary(),
      performanceTrends: this.analyticsService.getPerformanceTrends(this.selectedPeriod),
      studentPerformance: this.analyticsService.getStudentPerformance(20, this.studentSortBy),
      timeBasedAnalytics: this.analyticsService.getTimeBasedAnalytics(this.selectedTimePeriod),
      subjectPerformance: this.analyticsService.getSubjectPerformance()
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        this.summaryData = data.summary;
        this.performanceTrendsData = data.performanceTrends;
        this.studentPerformanceData = data.studentPerformance;
        this.timeBasedData = data.timeBasedAnalytics;
        this.subjectPerformanceData = data.subjectPerformance;
        
        this.updateCharts();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
      }
    });
  }

  loadPerformanceTrends() {
    this.analyticsService.getPerformanceTrends(this.selectedPeriod)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.performanceTrendsData = data;
        this.updatePerformanceCharts();
      });
  }

  loadStudentPerformance() {
    this.analyticsService.getStudentPerformance(20, this.studentSortBy)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.studentPerformanceData = data;
        this.updateStudentPerformanceCharts();
      });
  }

  loadTimeBasedAnalytics() {
    this.analyticsService.getTimeBasedAnalytics(this.selectedTimePeriod)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.timeBasedData = data;
        this.updateTimeBasedCharts();
      });
  }

  private updateCharts() {
    this.updatePerformanceCharts();
    this.updateStudentPerformanceCharts();
    this.updateTimeBasedCharts();
    this.updateSubjectPerformanceCharts();
  }

  private updatePerformanceCharts() {
    const labels = this.performanceTrendsData.map(trend => trend.period);
    
    this.performanceChartData = {
      labels,
      datasets: [
        {
          data: this.performanceTrendsData.map(trend => trend.averagePercentage),
          label: 'Average Percentage',
          borderColor: '#3f51b5',
          backgroundColor: 'rgba(63, 81, 181, 0.1)',
          tension: 0.4
        }
      ]
    };

    this.passRateChartData = {
      labels,
      datasets: [
        {
          data: this.performanceTrendsData.map(trend => trend.passRate),
          label: 'Pass Rate (%)',
          backgroundColor: '#4caf50',
          borderColor: '#4caf50'
        }
      ]
    };
  }

  private updateStudentPerformanceCharts() {
    const topStudents = this.studentPerformanceData.slice(0, 10);
    const labels = topStudents.map(student => student.studentName);
    
    this.studentPerformanceChartData = {
      labels,
      datasets: [
        {
          data: topStudents.map(student => student.averagePercentage),
          label: 'Average Percentage',
          backgroundColor: '#ff9800',
          borderColor: '#ff9800'
        }
      ]
    };

    // Grade distribution
    const gradeCounts = this.studentPerformanceData.reduce((acc, student) => {
      const grade = student.bestGrade || 'N/A';
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

  private updateTimeBasedCharts() {
    if (!this.timeBasedData) return;

    // Hourly activity
    const hourlyLabels = this.timeBasedData.hourly.map(item => `${item.hour}:00`);
    this.hourlyActivityChartData = {
      labels: hourlyLabels,
      datasets: [
        {
          data: this.timeBasedData.hourly.map(item => item.attempts),
          label: 'Attempts',
          backgroundColor: '#2196f3',
          borderColor: '#2196f3'
        }
      ]
    };

    // Daily activity
    const dailyLabels = this.timeBasedData.daily.map(item => item.date);
    this.dailyActivityChartData = {
      labels: dailyLabels,
      datasets: [
        {
          data: this.timeBasedData.daily.map(item => item.averageScore),
          label: 'Average Score',
          borderColor: '#9c27b0',
          backgroundColor: 'rgba(156, 39, 176, 0.1)',
          tension: 0.4
        }
      ]
    };
  }

  private updateSubjectPerformanceCharts() {
    const labels = this.subjectPerformanceData.map(subject => subject.subject);
    
    this.subjectPerformanceChartData = {
      labels,
      datasets: [
        {
          data: this.subjectPerformanceData.map(subject => subject.averageAccuracy),
          label: 'Average Accuracy (%)',
          backgroundColor: '#00bcd4',
          borderColor: '#00bcd4'
        }
      ]
    };

    // Subject difficulty distribution
    const totalEasy = this.subjectPerformanceData.reduce((sum, subject) => sum + subject.difficultyBreakdown.easy, 0);
    const totalMedium = this.subjectPerformanceData.reduce((sum, subject) => sum + subject.difficultyBreakdown.medium, 0);
    const totalHard = this.subjectPerformanceData.reduce((sum, subject) => sum + subject.difficultyBreakdown.hard, 0);

    this.subjectDifficultyChartData = {
      labels: ['Easy', 'Medium', 'Hard'],
      datasets: [
        {
          data: [totalEasy, totalMedium, totalHard],
          backgroundColor: ['#4caf50', '#ff9800', '#f44336']
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

  getTrendColor(trend: string): 'primary' | 'accent' | 'warn' {
    switch (trend) {
      case 'improving':
        return 'primary';
      case 'stable':
        return 'accent';
      case 'declining':
        return 'warn';
      default:
        return 'primary';
    }
  }

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'improving':
        return 'trending_up';
      case 'stable':
        return 'trending_flat';
      case 'declining':
        return 'trending_down';
      default:
        return 'help';
    }
  }

  exportData() {
    // Implementation for data export
    this.analyticsService.exportData('performance', 'csv')
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        const blob = new Blob([data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'analytics-data.csv';
        link.click();
        window.URL.revokeObjectURL(url);
      });
  }
}
