import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ExamService } from '../../core/services/exam.service';
import { Exam } from '../../models/exam.model';

@Component({
  selector: 'app-exam-view',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="exam-view-container">
      <div class="exam-view-header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="header-info">
          <h1>{{ exam?.title }}</h1>
          <p>Exam Details</p>
        </div>
        <button mat-raised-button color="primary" (click)="editExam()">
          <mat-icon>edit</mat-icon>
          Edit Exam
        </button>
      </div>

      <div *ngIf="!isLoading; else loading" class="exam-details">
        <mat-card class="exam-info-card">
          <mat-card-header>
            <mat-card-title>Exam Information</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <mat-icon>description</mat-icon>
                <div>
                  <h4>Description</h4>
                  <p>{{ exam?.description || 'No description provided' }}</p>
                </div>
              </div>
              
              <div class="info-item">
                <mat-icon>calendar_today</mat-icon>
                <div>
                  <h4>Year</h4>
                  <p>{{ exam?.year }}</p>
                </div>
              </div>
              
              <div class="info-item">
                <mat-icon>event</mat-icon>
                <div>
                  <h4>Exam Date</h4>
                  <p>{{ exam?.examDate | date:'medium' }}</p>
                </div>
              </div>
              
              <div class="info-item">
                <mat-icon>timer</mat-icon>
                <div>
                  <h4>Duration</h4>
                  <p>{{ exam?.durationMinutes }} minutes</p>
                </div>
              </div>
              
              <div class="info-item">
                <mat-icon>info</mat-icon>
                <div>
                  <h4>Status</h4>
                  <mat-chip [class]="getStatusClass(exam?.status || '')">
                    {{ exam?.status | titlecase }}
                  </mat-chip>
                </div>
              </div>
              
              <div class="info-item">
                <mat-icon>quiz</mat-icon>
                <div>
                  <h4>Statistics</h4>
                  <p>{{ exam?.totalQuestions || 0 }} questions, {{ exam?.totalMarks || 0 }} marks</p>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="sections-card" *ngIf="hasSections">
          <mat-card-header>
            <mat-card-title>Sections</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="sections-list">
              <div *ngFor="let section of sections" class="section-item">
                <div class="section-header">
                  <h3>{{ section.title }}</h3>
                  <mat-chip>{{ section.questionCount || 0 }} questions</mat-chip>
                </div>
                <p class="section-description">{{ section.description }}</p>
                <div class="section-stats">
                  <span>{{ section.totalMarks || 0 }} marks</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <div class="no-sections" *ngIf="!hasSections">
          <mat-icon>folder_open</mat-icon>
          <h3>No sections yet</h3>
          <p>This exam doesn't have any sections. Add sections to organize questions.</p>
          <button mat-raised-button color="primary" (click)="manageQuestions()">
            <mat-icon>add</mat-icon>
            Manage Questions
          </button>
        </div>
      </div>

      <ng-template #loading>
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Loading exam details...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .exam-view-container {
      padding: 20px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .exam-view-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 30px;
    }

    .header-info h1 {
      margin: 0 0 4px 0;
      color: #1976d2;
    }

    .header-info p {
      margin: 0;
      color: #666;
    }

    .exam-details {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .info-item {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .info-item mat-icon {
      color: #1976d2;
      margin-top: 4px;
    }

    .info-item h4 {
      margin: 0 0 4px 0;
      color: #333;
      font-size: 16px;
    }

    .info-item p {
      margin: 0;
      color: #666;
    }

    .sections-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .section-item {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      background-color: #fafafa;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .section-header h3 {
      margin: 0;
      font-size: 18px;
    }

    .section-description {
      margin: 0 0 12px 0;
      color: #666;
      font-size: 14px;
    }

    .section-stats {
      font-size: 14px;
      color: #666;
    }

    .no-sections {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .no-sections mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: #ccc;
    }

    .no-sections h3 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .no-sections p {
      margin: 0 0 24px 0;
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
export class ExamViewComponent implements OnInit {
  exam: Exam | null = null;
  isLoading = false;

  constructor(
    private examService: ExamService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    const examId = this.route.snapshot.paramMap.get('id');
    if (examId) {
      this.loadExam(examId);
    }
  }

  private loadExam(examId: string) {
    this.isLoading = true;
    this.examService.getExam(examId).subscribe({
      next: (exam) => {
        this.exam = exam;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading exam:', error);
        this.snackBar.open('Error loading exam', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  get hasSections(): boolean {
    return !!(this.exam?.sections && this.exam.sections && this.exam.sections.length > 0);
  }

  get sections(): any[] {
    return this.exam?.sections || [];
  }

  editExam() {
    this.router.navigate(['/admin/exams', this.exam?.id, 'edit']);
  }

  manageQuestions() {
    this.router.navigate(['/admin/exams', this.exam?.id, 'questions']);
  }

  goBack() {
    this.router.navigate(['/admin/exams']);
  }
}
