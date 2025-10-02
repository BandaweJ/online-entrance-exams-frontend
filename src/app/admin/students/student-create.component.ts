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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { StudentService } from '../../core/services/student.service';
import { CreateStudentRequest } from '../../models/student.model';

@Component({
  selector: 'app-student-create',
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
    MatNativeDateModule,
    MatStepperModule,
    MatSelectModule
  ],
  template: `
    <div class="student-create-container">
      <div class="student-create-header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Add New Student</h1>
      </div>

      <mat-card>
        <mat-card-content>
          <form [formGroup]="studentForm" (ngSubmit)="onSubmit()" class="student-form">
            <div class="form-section">
              <h2>Personal Information</h2>
              
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>First Name</mat-label>
                  <input matInput formControlName="firstName" placeholder="Enter first name">
                  <mat-icon matSuffix>person</mat-icon>
                  <mat-error *ngIf="studentForm.get('firstName')?.hasError('required')">
                    First name is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Last Name</mat-label>
                  <input matInput formControlName="lastName" placeholder="Enter last name">
                  <mat-icon matSuffix>person</mat-icon>
                  <mat-error *ngIf="studentForm.get('lastName')?.hasError('required')">
                    Last name is required
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Email</mat-label>
                  <input matInput type="email" formControlName="email" placeholder="Enter email address">
                  <mat-icon matSuffix>email</mat-icon>
                  <mat-error *ngIf="studentForm.get('email')?.hasError('required')">
                    Email is required
                  </mat-error>
                  <mat-error *ngIf="studentForm.get('email')?.hasError('email')">
                    Please enter a valid email
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Phone Number</mat-label>
                  <input matInput formControlName="phone" placeholder="Enter phone number">
                  <mat-icon matSuffix>phone</mat-icon>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Date of Birth</mat-label>
                  <input matInput [matDatepicker]="picker" formControlName="dateOfBirth" placeholder="Select date of birth">
                  <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                  <mat-datepicker #picker></mat-datepicker>
                  <mat-icon matSuffix>cake</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Grade</mat-label>
                  <input matInput formControlName="grade" placeholder="Enter grade level">
                  <mat-icon matSuffix>school</mat-icon>
                </mat-form-field>
              </div>
            </div>

            <div class="form-section">
              <h2>School Information</h2>
              
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>School Name</mat-label>
                  <input matInput formControlName="school" placeholder="Enter school name">
                  <mat-icon matSuffix>school</mat-icon>
                </mat-form-field>
              </div>
            </div>

            <div class="form-section">
              <h2>Account Settings</h2>
              
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Status</mat-label>
                  <mat-select formControlName="isActive">
                    <mat-option [value]="true">Active</mat-option>
                    <mat-option [value]="false">Inactive</mat-option>
                  </mat-select>
                  <mat-icon matSuffix>toggle_on</mat-icon>
                </mat-form-field>
              </div>
            </div>

            <div class="form-actions">
              <button mat-button type="button" (click)="goBack()">
                Cancel
              </button>
              <button mat-raised-button color="primary" type="submit" [disabled]="studentForm.invalid || isSubmitting">
                <mat-icon *ngIf="isSubmitting">hourglass_empty</mat-icon>
                <mat-icon *ngIf="!isSubmitting">person_add</mat-icon>
                {{ isSubmitting ? 'Adding Student...' : 'Add Student' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .student-create-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .student-create-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 30px;
    }

    .student-create-header h1 {
      margin: 0;
      color: #1976d2;
    }

    .student-form {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .form-section {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-section h2 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 20px;
      font-weight: 500;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 8px;
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
  `]
})
export class StudentCreateComponent implements OnInit {
  studentForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.studentForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      dateOfBirth: [''],
      school: [''],
      grade: [''],
      isActive: [true]
    });
  }

  ngOnInit() {
    // Form is already initialized in constructor
  }

  onSubmit() {
    if (this.studentForm.valid) {
      this.isSubmitting = true;
      const studentData: CreateStudentRequest = {
        ...this.studentForm.value,
        dateOfBirth: this.studentForm.value.dateOfBirth ? 
          this.studentForm.value.dateOfBirth.toISOString().split('T')[0] : undefined
      };

      this.studentService.createStudent(studentData).subscribe({
        next: (student) => {
          this.snackBar.open('Student added successfully. Login credentials will be sent via email.', 'Close', { duration: 5000 });
          this.router.navigate(['/admin/students']);
        },
        error: (error) => {
          console.error('Error creating student:', error);
          this.snackBar.open('Error creating student', 'Close', { duration: 3000 });
          this.isSubmitting = false;
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/admin/students']);
  }
}
