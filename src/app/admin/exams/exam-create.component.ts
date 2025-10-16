import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ExamService } from '../../core/services/exam.service';
import { CreateExamRequest } from '../../models/exam.model';

@Component({
  selector: 'app-exam-create',
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
    MatStepperModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="exam-create-container">
      <div class="exam-create-header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Create New Exam</h1>
      </div>

      <mat-card>
        <mat-card-content>
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
                <mat-error *ngIf="examForm.get('year')?.hasError('min')">
                  Year must be 2020 or later
                </mat-error>
                <mat-error *ngIf="examForm.get('year')?.hasError('max')">
                  Year must be 2030 or earlier
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Duration (minutes)</mat-label>
                <input matInput type="number" formControlName="durationMinutes" placeholder="120" min="30" max="300">
                <mat-icon matSuffix>timer</mat-icon>
                <mat-error *ngIf="examForm.get('durationMinutes')?.hasError('required')">
                  Duration is required
                </mat-error>
                <mat-error *ngIf="examForm.get('durationMinutes')?.hasError('min')">
                  Duration must be at least 30 minutes
                </mat-error>
                <mat-error *ngIf="examForm.get('durationMinutes')?.hasError('max')">
                  Duration must not exceed 300 minutes
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
                {{ isSubmitting ? 'Creating...' : 'Create Exam' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    /* Mobile-first base styles with branding */
    .exam-create-container {
      padding: 12px; /* Mobile-first: smaller padding */
      max-width: 800px;
      margin: 0 auto;
      min-height: 100vh;
      background: linear-gradient(135deg, var(--anarchy-off-white) 0%, #E5E7EB 100%);
    }

    .exam-create-header {
      display: flex;
      flex-direction: column; /* Mobile-first: stacked layout */
      gap: 12px; /* Mobile-first: smaller gap */
      margin-bottom: 20px; /* Mobile-first: smaller margin */
      padding: 16px; /* Mobile-first: smaller padding */
      background: var(--glass-card);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: var(--glass-shadow);
      border-radius: 16px; /* Branded radius */
    }

    .exam-create-header h1 {
      margin: 0;
      color: var(--anarchy-blue); /* Brand color */
      font-family: 'Playfair Display', serif;
      font-size: 18px; /* Mobile-first: smaller font */
      font-weight: 600;
      text-align: center; /* Mobile-first: center alignment */
    }

    .exam-form {
      display: flex;
      flex-direction: column;
      gap: 16px; /* Mobile-first: smaller gap */
    }

    .form-row {
      display: flex;
      flex-direction: column; /* Mobile-first: stacked layout */
      gap: 12px; /* Mobile-first: smaller gap */
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      flex: 1;
    }

    .form-actions {
      display: flex;
      flex-direction: column; /* Mobile-first: stacked layout */
      gap: 12px; /* Mobile-first: smaller gap */
      margin-top: 24px; /* Mobile-first: smaller margin */
      padding-top: 20px; /* Mobile-first: smaller padding */
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }

    .form-actions button {
      min-width: 120px;
      height: 44px; /* Mobile-first: smaller height */
      font-size: 14px; /* Mobile-first: smaller font */
      border-radius: 12px; /* Branded radius */
      font-family: 'Inter', sans-serif;
      font-weight: 500;
    }

    mat-form-field {
      width: 100%;
    }

    mat-form-field .mat-form-field-outline {
      color: rgba(30, 58, 138, 0.3); /* Brand color */
    }

    mat-form-field.mat-focused .mat-form-field-outline {
      color: var(--anarchy-blue); /* Brand color */
    }

    mat-form-field .mat-form-field-label {
      color: var(--anarchy-grey); /* Brand color */
      font-family: 'Inter', sans-serif;
    }

    mat-form-field.mat-focused .mat-form-field-label {
      color: var(--anarchy-blue); /* Brand color */
    }

    textarea {
      resize: vertical;
      min-height: 60px; /* Mobile-first: smaller height */
      font-family: 'Inter', sans-serif;
    }

    /* Small mobile devices (320px and up) */
    @media (min-width: 320px) {
      .exam-create-header h1 {
        font-size: 19px;
      }
    }

    /* Medium mobile devices (480px and up) */
    @media (min-width: 480px) {
      .exam-create-container {
        padding: 16px;
      }

      .exam-create-header {
        flex-direction: row;
        align-items: center;
        gap: 16px;
        margin-bottom: 24px;
        padding: 20px;
        border-radius: 20px;
      }

      .exam-create-header h1 {
        font-size: 20px;
        text-align: left;
      }

      .exam-form {
        gap: 20px;
      }

      .form-row {
        flex-direction: row;
        gap: 16px;
      }

      .form-actions {
        flex-direction: row;
        justify-content: flex-end;
        gap: 16px;
        margin-top: 32px;
        padding-top: 24px;
      }

      .form-actions button {
        height: 48px;
        font-size: 15px;
        min-width: 140px;
      }

      textarea {
        min-height: 80px;
      }
    }

    /* Tablet and up (768px and up) */
    @media (min-width: 768px) {
      .exam-create-container {
        padding: 24px;
      }

      .exam-create-header {
        padding: 24px;
        margin-bottom: 32px;
      }

      .exam-create-header h1 {
        font-size: 24px;
      }

      .exam-form {
        gap: 24px;
      }

      .form-row {
        gap: 20px;
      }

      .form-actions {
        gap: 20px;
        margin-top: 40px;
        padding-top: 32px;
      }

      .form-actions button {
        height: 52px;
        font-size: 16px;
        min-width: 160px;
      }

      textarea {
        min-height: 100px;
      }
    }

    /* Large screens (1024px and up) */
    @media (min-width: 1024px) {
      .exam-create-header h1 {
        font-size: 28px;
      }

      .form-actions button {
        font-size: 17px;
      }
    }
  `]
})
export class ExamCreateComponent implements OnInit {
  examForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private examService: ExamService,
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
    // Set default exam date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.examForm.patchValue({
      examDate: tomorrow
    });
  }

  onSubmit() {
    if (this.examForm.valid) {
      this.isSubmitting = true;
      const examData: CreateExamRequest = {
        ...this.examForm.value,
        examDate: this.examForm.value.examDate.toISOString()
      };

      this.examService.createExam(examData).subscribe({
        next: (exam) => {
          this.snackBar.open('Exam created successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/admin/exams']);
        },
        error: (error) => {
          console.error('Error creating exam:', error);
          this.snackBar.open('Error creating exam', 'Close', { duration: 3000 });
          this.isSubmitting = false;
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/admin/exams']);
  }
}
