import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Student } from '../../../models/student.model';

@Component({
  selector: 'app-student-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <h2 mat-dialog-title>Edit Student</h2>
    <mat-dialog-content>
      <form [formGroup]="studentForm" class="edit-form">
        <div class="form-section">
          <h3>Personal Information</h3>
          
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
          <h3>School Information</h3>
          
          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>School Name</mat-label>
              <input matInput formControlName="school" placeholder="Enter school name">
              <mat-icon matSuffix>school</mat-icon>
            </mat-form-field>
          </div>
        </div>

        <div class="form-section">
          <h3>Account Settings</h3>
          
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
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="studentForm.invalid">
        <mat-icon>save</mat-icon>
        Save Changes
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .edit-form {
      padding: 16px 0;
    }

    .form-section {
      margin-bottom: 24px;
    }

    .form-section h3 {
      margin: 0 0 16px 0;
      color: #1976d2;
      font-size: 18px;
      font-weight: 500;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 8px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      flex: 1;
    }

    mat-form-field {
      width: 100%;
    }
  `]
})
export class StudentEditDialogComponent implements OnInit {
  studentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<StudentEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { student: Student }
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
    // Populate form with student data
    const student = this.data.student;
    this.studentForm.patchValue({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone || '',
      dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth) : null,
      school: student.school || '',
      grade: student.grade || '',
      isActive: student.isActive
    });
  }

  onSave() {
    if (this.studentForm.valid) {
      const formValue = this.studentForm.value;
      const updatedStudent = {
        ...formValue,
        dateOfBirth: formValue.dateOfBirth ? 
          formValue.dateOfBirth.toISOString().split('T')[0] : null
      };
      this.dialogRef.close(updatedStudent);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
