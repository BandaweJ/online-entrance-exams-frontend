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
    MatProgressSpinnerModule
  ],
  template: `
    <div class="dashboard-container">
      <h1>Admin Dashboard</h1>
      
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
              <button mat-raised-button color="primary" routerLink="/admin/exams/create">
                <mat-icon>add</mat-icon>
                Create New Exam
              </button>
              <button mat-raised-button color="accent" routerLink="/admin/students/create">
                <mat-icon>person_add</mat-icon>
                Add Student
              </button>
              <button mat-raised-button routerLink="/admin/exams">
                <mat-icon>quiz</mat-icon>
                Manage Exams
              </button>
              <button mat-raised-button routerLink="/admin/students">
                <mat-icon>people</mat-icon>
                Manage Students
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
    .dashboard-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-container h1 {
      margin-bottom: 30px;
      color: #1976d2;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
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
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #1976d2;
    }

    .stat-info h3 {
      margin: 0;
      font-size: 32px;
      font-weight: bold;
      color: #333;
    }

    .stat-info p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .activity-section {
      margin-bottom: 30px;
    }

    .activity-list {
      max-height: 300px;
      overflow-y: auto;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 0;
      border-bottom: 1px solid #eee;
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
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
      margin: 0 0 4px 0;
      font-size: 14px;
    }

    .activity-time {
      font-size: 12px;
      color: #666;
    }

    .quick-actions {
      margin-bottom: 30px;
    }

    .action-buttons {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .action-buttons button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
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
    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }

      .dashboard-container h1 {
        font-size: 1.5rem;
        text-align: center;
        margin-bottom: 20px;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-bottom: 20px;
      }

      .stat-card {
        padding: 12px;
      }

      .stat-content {
        gap: 12px;
      }

      .stat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }

      .stat-info h3 {
        font-size: 20px;
      }

      .stat-info p {
        font-size: 12px;
      }

      .activity-section, .quick-actions {
        margin-bottom: 20px;
      }

      .action-buttons {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .action-buttons button {
        width: 100%;
        height: 48px;
        justify-content: center;
      }

      .activity-item {
        padding: 8px 0;
        gap: 12px;
      }

      .activity-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      .activity-text {
        font-size: 13px;
      }

      .activity-time {
        font-size: 11px;
      }
    }

    /* Small mobile devices */
    @media (max-width: 480px) {
      .dashboard-container {
        padding: 12px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        gap: 8px;
      }

      .stat-content {
        gap: 8px;
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
        font-size: 11px;
      }

      .activity-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .activity-content {
        width: 100%;
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
