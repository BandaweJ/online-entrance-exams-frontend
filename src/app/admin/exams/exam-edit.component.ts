import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ExamService } from '../../core/services/exam.service';
import { Exam } from '../../models/exam.model';

@Component({
  selector: 'app-exam-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="exam-edit-container">
      <div class="exam-edit-header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Edit Exam</h1>
      </div>

      <mat-card *ngIf="!isLoading; else loading">
        <mat-card-content>
          <!-- Published Exam Warning -->
          <div *ngIf="exam?.status === 'published'" class="published-warning">
            <mat-icon>info</mat-icon>
            <div>
              <strong>Published Exam</strong>
              <p>This exam has been published. Only exam date, duration, and description can be modified.</p>
            </div>
          </div>

          <form [formGroup]="examForm" (ngSubmit)="onSubmit()" class="exam-form">
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Exam Title</mat-label>
                <input matInput formControlName="title" placeholder="Enter exam title">
                <mat-icon matSuffix>quiz</mat-icon>
                <mat-error *ngIf="examForm.get('title')?.hasError('required')">
                  Title is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" placeholder="Enter exam description" rows="3"></textarea>
                <mat-icon matSuffix>description</mat-icon>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Year</mat-label>
                <input matInput type="number" formControlName="year" placeholder="2024" min="2020" max="2030">
                <mat-icon matSuffix>calendar_today</mat-icon>
                <mat-error *ngIf="examForm.get('year')?.hasError('required')">
                  Year is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Duration (minutes)</mat-label>
                <input matInput type="number" formControlName="durationMinutes" placeholder="120" min="30" max="300">
                <mat-icon matSuffix>timer</mat-icon>
                <mat-error *ngIf="examForm.get('durationMinutes')?.hasError('required')">
                  Duration is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Exam Date & Time</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="examDate" placeholder="Select exam date and time">
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-icon matSuffix>event</mat-icon>
                <mat-error *ngIf="examForm.get('examDate')?.hasError('required')">
                  Exam date is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button mat-button type="button" (click)="goBack()">
                Cancel
              </button>
              <button mat-raised-button color="primary" type="submit" [disabled]="examForm.invalid || isSubmitting">
                <mat-icon *ngIf="isSubmitting">hourglass_empty</mat-icon>
                <mat-icon *ngIf="!isSubmitting">save</mat-icon>
                {{ isSubmitting ? 'Updating...' : 'Update Exam' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <ng-template #loading>
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Loading exam...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .exam-edit-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .exam-edit-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 30px;
    }

    .exam-edit-header h1 {
      margin: 0;
      color: #1976d2;
    }

    .exam-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      flex: 1;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #eee;
    }

    .form-actions button {
      min-width: 120px;
    }

    mat-form-field {
      width: 100%;
    }

    textarea {
      resize: vertical;
      min-height: 80px;
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

    .published-warning {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }

    .published-warning mat-icon {
      color: #856404;
      margin-top: 2px;
    }

    .published-warning strong {
      color: #856404;
      display: block;
      margin-bottom: 4px;
    }

    .published-warning p {
      margin: 0;
      color: #856404;
      font-size: 14px;
    }
  `]
})
export class ExamEditComponent implements OnInit {
  examForm: FormGroup;
  exam: Exam | null = null;
  isSubmitting = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private examService: ExamService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.examForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      year: [new Date().getFullYear(), [Validators.required, Validators.min(2020), Validators.max(2030)]],
      examDate: ['', [Validators.required]],
      durationMinutes: [120, [Validators.required, Validators.min(30), Validators.max(300)]]
    });
  }

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
        this.examForm.patchValue({
          title: exam.title,
          description: exam.description,
          year: exam.year,
          examDate: new Date(exam.examDate),
          durationMinutes: exam.durationMinutes
        });
        
        // Disable fields for published exams
        if (exam.status === 'published') {
          this.examForm.get('title')?.disable();
          this.examForm.get('year')?.disable();
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading exam:', error);
        this.snackBar.open('Error loading exam', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  onSubmit() {
    if (this.examForm.valid && this.exam) {
      this.isSubmitting = true;
      const formValue = this.examForm.getRawValue(); // Use getRawValue() to include disabled controls
      const examData = {
        ...formValue,
        examDate: formValue.examDate.toISOString()
      };

      this.examService.updateExam(this.exam.id, examData).subscribe({
        next: (exam) => {
          this.snackBar.open('Exam updated successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/admin/exams']);
        },
        error: (error) => {
          console.error('Error updating exam:', error);
          let errorMessage = 'Error updating exam';
          
          if (error.status === 400) {
            errorMessage = error.error?.message || 'Cannot update this exam. It may be published and only certain fields can be modified.';
          } else if (error.status === 401) {
            errorMessage = 'You are not authorized to update this exam.';
          } else if (error.status === 404) {
            errorMessage = 'Exam not found.';
          }
          
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
          this.isSubmitting = false;
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/admin/exams']);
  }
}
