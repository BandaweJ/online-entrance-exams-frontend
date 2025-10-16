import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { AppState } from '../../core/store/app.reducer';
import { selectIsLoading } from '../../core/store/auth/auth.selectors';
import { ExamService } from '../../core/services/exam.service';
import { StudentService } from '../../core/services/student.service';
import { ResultsService } from '../../core/services/results.service';
import { Observable } from 'rxjs';
import { SchoolLogoComponent } from '../../shared/components/school-logo/school-logo.component';

interface DashboardStats {
  totalExams: number;
  activeExams: number;
  totalStudents: number;
  activeStudents: number;
  totalAttempts: number;
  completedAttempts: number;
}

interface RecentActivity {
  icon: string;
  iconClass: string;
  text: string;
  time: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    SchoolLogoComponent
  ],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <div class="brand-section">
          <app-school-logo size="medium"></app-school-logo>
          <div class="header-text">
            <h1 class="brand-heading">Admin Dashboard</h1>
            <p class="brand-subheading">Exam Management System</p>
          </div>
        </div>
      </div>
      
      <!-- Stats Cards -->
      <div class="stats-grid" *ngIf="!(isLoading$ | async); else loading">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">quiz</mat-icon>
              <div class="stat-info">
                <h3>{{ stats.totalExams }}</h3>
                <p>Total Exams</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">play_circle</mat-icon>
              <div class="stat-info">
                <h3>{{ stats.activeExams }}</h3>
                <p>Active Exams</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">people</mat-icon>
              <div class="stat-info">
                <h3>{{ stats.totalStudents }}</h3>
                <p>Total Students</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">check_circle</mat-icon>
              <div class="stat-info">
                <h3>{{ stats.completedAttempts }}</h3>
                <p>Completed Attempts</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Recent Activity -->
      <div class="activity-section">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Recent Activity</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="activity-list">
              <div class="activity-item" *ngFor="let activity of recentActivity">
                <mat-icon [class]="activity.iconClass">{{ activity.icon }}</mat-icon>
                <div class="activity-content">
                  <p class="activity-text">{{ activity.text }}</p>
                  <span class="activity-time">{{ activity.time }}</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Quick Actions</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="action-buttons">
              <button mat-raised-button routerLink="/admin/exams/create" class="btn-brand-primary">
                <mat-icon>add</mat-icon>
                Create New Exam
              </button>
              <button mat-raised-button routerLink="/admin/students/create" class="btn-brand-secondary">
                <mat-icon>person_add</mat-icon>
                Add Student
              </button>
              <button mat-raised-button routerLink="/admin/exams" class="btn-brand-primary">
                <mat-icon>quiz</mat-icon>
                Manage Exams
              </button>
              <button mat-raised-button routerLink="/admin/students" class="btn-brand-primary">
                <mat-icon>people</mat-icon>
                Manage Students
              </button>
              <button mat-raised-button routerLink="/admin/ip-monitoring" class="btn-brand-secondary">
                <mat-icon>security</mat-icon>
                IP Monitoring
              </button>
            </div>
          </mat-card-content>
        </mat-card>
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
    .dashboard-container {
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

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr); /* Mobile-first: 2 columns */
      gap: 12px; /* Mobile-first: smaller gap */
      margin-bottom: 20px; /* Mobile-first: smaller margin */
    }

    .stat-card {
      background: var(--glass-card);
      border-radius: 12px; /* Mobile-first: smaller radius */
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: var(--glass-shadow);
      transition: all 0.3s ease;
      padding: 12px; /* Mobile-first: smaller padding */
    }

    .stat-card:hover {
      transform: translateY(-2px); /* Mobile-first: smaller transform */
      box-shadow: 0 8px 25px 0 rgba(31, 38, 135, 0.4);
    }

    .stat-content {
      display: flex;
      flex-direction: column; /* Mobile-first: stacked layout */
      align-items: center;
      gap: 8px; /* Mobile-first: smaller gap */
      text-align: center;
    }

    .stat-icon {
      font-size: 24px; /* Mobile-first: smaller icon */
      width: 24px;
      height: 24px;
      color: var(--anarchy-gold);
      filter: drop-shadow(0 2px 4px rgba(212, 175, 55, 0.3));
    }

    .stat-info h3 {
      margin: 0;
      font-size: 20px; /* Mobile-first: smaller font */
      font-weight: bold;
      color: var(--anarchy-blue);
      text-shadow: 0 1px 2px rgba(30, 58, 138, 0.2);
      line-height: 1.1;
    }

    .stat-info p {
      margin: 0;
      color: var(--anarchy-grey);
      font-size: 11px; /* Mobile-first: smaller font */
      font-weight: 500;
      line-height: 1.2;
    }

    .activity-section {
      margin-bottom: 20px; /* Mobile-first: smaller margin */
    }

    .activity-list {
      max-height: 200px; /* Mobile-first: smaller height */
      overflow-y: auto;
    }

    .activity-item {
      display: flex;
      align-items: flex-start; /* Mobile-first: align to start */
      gap: 10px; /* Mobile-first: smaller gap */
      padding: 8px 0; /* Mobile-first: smaller padding */
      border-bottom: 1px solid #eee;
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-icon {
      font-size: 16px; /* Mobile-first: smaller icon */
      width: 16px;
      height: 16px;
      margin-top: 2px; /* Mobile-first: small offset */
    }

    .activity-icon.success {
      color: #4caf50;
    }

    .activity-icon.warning {
      color: #ff9800;
    }

    .activity-icon.info {
      color: #2196f3;
    }

    .activity-content {
      flex: 1;
    }

    .activity-text {
      margin: 0 0 3px 0; /* Mobile-first: smaller margin */
      font-size: 12px; /* Mobile-first: smaller font */
      line-height: 1.3;
    }

    .activity-time {
      font-size: 10px; /* Mobile-first: smaller font */
      color: #666;
      line-height: 1.2;
    }

    .quick-actions {
      margin-bottom: 20px; /* Mobile-first: smaller margin */
    }

    .action-buttons {
      display: grid;
      grid-template-columns: 1fr; /* Mobile-first: single column */
      gap: 10px; /* Mobile-first: smaller gap */
    }

    .action-buttons button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px; /* Mobile-first: smaller gap */
      padding: 10px 12px; /* Mobile-first: smaller padding */
      height: 44px; /* Mobile-first: smaller height */
      font-size: 13px; /* Mobile-first: smaller font */
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

    /* Small mobile devices (320px and up) */
    @media (min-width: 320px) {
      .header-text h1 {
        font-size: 1.625rem;
      }
      
      .header-text p {
        font-size: 0.9rem;
      }
      
      .stat-info h3 {
        font-size: 22px;
      }
      
      .stat-info p {
        font-size: 12px;
      }
    }

    /* Medium mobile devices (480px and up) */
    @media (min-width: 480px) {
      .dashboard-container {
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

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
        margin-bottom: 24px;
      }

      .stat-card {
        padding: 16px;
        border-radius: 16px;
      }

      .stat-content {
        flex-direction: row;
        text-align: left;
        gap: 12px;
      }

      .stat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      .stat-info h3 {
        font-size: 24px;
      }

      .stat-info p {
        font-size: 13px;
      }

      .activity-section, .quick-actions {
        margin-bottom: 24px;
      }

      .activity-list {
        max-height: 250px;
      }

      .activity-item {
        align-items: center;
        gap: 12px;
        padding: 10px 0;
      }

      .activity-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        margin-top: 0;
      }

      .activity-text {
        font-size: 13px;
        margin: 0 0 4px 0;
      }

      .activity-time {
        font-size: 11px;
      }

      .action-buttons {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .action-buttons button {
        height: 48px;
        font-size: 14px;
        padding: 12px 16px;
        gap: 8px;
      }
    }

    /* Tablet and up (768px and up) */
    @media (min-width: 768px) {
      .dashboard-container {
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

      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
      }

      .stat-card {
        padding: 20px;
      }

      .stat-content {
        gap: 16px;
      }

      .stat-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
      }

      .stat-info h3 {
        font-size: 32px;
      }

      .stat-info p {
        font-size: 14px;
      }

      .activity-section, .quick-actions {
        margin-bottom: 30px;
      }

      .activity-list {
        max-height: 300px;
      }

      .activity-item {
        gap: 16px;
        padding: 12px 0;
      }

      .activity-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .activity-text {
        font-size: 14px;
      }

      .activity-time {
        font-size: 12px;
      }

      .action-buttons {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
      }

      .action-buttons button {
        height: 52px;
        font-size: 15px;
        padding: 14px 18px;
        gap: 10px;
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

      .stat-info h3 {
        font-size: 36px;
      }

      .stat-info p {
        font-size: 15px;
      }

      .action-buttons button {
        height: 56px;
        font-size: 16px;
        padding: 16px 20px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  isLoading$: Observable<boolean>;
  stats: DashboardStats = {
    totalExams: 0,
    activeExams: 0,
    totalStudents: 0,
    activeStudents: 0,
    totalAttempts: 0,
    completedAttempts: 0
  };

  recentActivity: RecentActivity[] = [];

  constructor(
    private store: Store<AppState>,
    private examService: ExamService,
    private studentService: StudentService,
    private resultsService: ResultsService
  ) {
    this.isLoading$ = this.store.select(selectIsLoading);
  }

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    // Load exam stats
    this.examService.getExams().subscribe(exams => {
      this.stats.totalExams = exams.length;
      this.stats.activeExams = exams.filter(exam => exam.status === 'published').length;
      
      // Load recent activities from exams
      this.loadRecentActivities(exams);
    });

    // Load student stats
    this.studentService.getStudentStats().subscribe(stats => {
      this.stats.totalStudents = stats.totalStudents;
      this.stats.activeStudents = stats.activeStudents;
    });

    // Load results for attempt stats
    this.resultsService.getResults().subscribe(results => {
      this.stats.totalAttempts = results.length;
      this.stats.completedAttempts = results.filter(result => result.isPublished).length;
    });
  }

  private loadRecentActivities(exams: any[]) {
    const activities: RecentActivity[] = [];
    
    // Get recent exams (last 5)
    const recentExams = exams
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    
    recentExams.forEach(exam => {
      const timeAgo = this.getTimeAgo(new Date(exam.createdAt));
      activities.push({
        icon: 'quiz',
        iconClass: 'activity-icon info',
        text: `Exam "${exam.title}" created`,
        time: timeAgo
      });
    });

    // Get recent results (last 5)
    this.resultsService.getResults().subscribe(results => {
      const recentResults = results
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      
      recentResults.forEach(result => {
        const timeAgo = this.getTimeAgo(new Date(result.createdAt));
        activities.push({
          icon: 'assessment',
          iconClass: 'activity-icon success',
          text: `Result for "${result.exam?.title || 'Unknown Exam'}" completed`,
          time: timeAgo
        });
      });

      // Sort all activities by time and take the most recent 10
      this.recentActivity = activities
        .sort((a, b) => {
          const timeA = this.parseTimeAgo(a.time);
          const timeB = this.parseTimeAgo(b.time);
          return timeB - timeA;
        })
        .slice(0, 10);
    });
  }

  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }

  private parseTimeAgo(timeStr: string): number {
    if (timeStr === 'Just now') return 0;
    
    const match = timeStr.match(/(\d+)\s+(minute|hour|day)s?\s+ago/);
    if (!match) return 0;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 'minute': return value * 60;
      case 'hour': return value * 3600;
      case 'day': return value * 86400;
      default: return 0;
    }
  }
}
