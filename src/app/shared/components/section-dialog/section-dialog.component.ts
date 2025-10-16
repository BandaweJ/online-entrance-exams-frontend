import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

export interface SectionDialogData {
  title: string;
  section?: any;
  examId: string;
}

@Component({
  selector: 'app-section-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title class="dialog-title">{{ data.title }}</h2>
      <mat-dialog-content class="dialog-content">
        <form [formGroup]="sectionForm" class="section-form">
          <div class="form-section">
            <h3>Section Information</h3>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Section Title</mat-label>
              <input matInput formControlName="title" placeholder="Enter section title">
              <mat-icon matSuffix>title</mat-icon>
              <mat-error *ngIf="sectionForm.get('title')?.hasError('required')">
                Title is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" placeholder="Enter section description" rows="3"></textarea>
              <mat-icon matSuffix>description</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Order</mat-label>
              <input matInput type="number" formControlName="order" placeholder="1" min="1">
              <mat-icon matSuffix>sort</mat-icon>
              <mat-error *ngIf="sectionForm.get('order')?.hasError('required')">
                Order is required
              </mat-error>
            </mat-form-field>
          </div>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()" class="cancel-button">
          <mat-icon>close</mat-icon>
          Cancel
        </button>
        <button mat-raised-button color="primary" (click)="onSave()" [disabled]="sectionForm.invalid" class="save-button">
          <mat-icon>save</mat-icon>
          {{ data.section ? 'Update' : 'Create' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    /* Mobile-first base styles with branding */
    .dialog-container {
      background: var(--glass-card);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: var(--glass-shadow);
      border-radius: 20px; /* Branded radius */
      overflow: hidden;
    }

    .dialog-title {
      margin: 0;
      padding: 16px 20px; /* Mobile-first: smaller padding */
      background: rgba(30, 58, 138, 0.1); /* Brand color background */
      color: var(--anarchy-blue); /* Brand color */
      font-family: 'Playfair Display', serif;
      font-size: 18px; /* Mobile-first: smaller font */
      font-weight: 600;
      text-align: center; /* Mobile-first: center alignment */
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }

    .dialog-content {
      padding: 16px 20px; /* Mobile-first: smaller padding */
      margin: 0;
    }

    .section-form {
      display: flex;
      flex-direction: column;
      gap: 12px; /* Mobile-first: smaller gap */
    }

    .form-section {
      background: rgba(255, 255, 255, 0.05);
      padding: 12px; /* Mobile-first: smaller padding */
      border-radius: 12px; /* Branded radius */
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .form-section h3 {
      margin: 0 0 12px 0; /* Mobile-first: smaller margin */
      color: var(--anarchy-blue); /* Brand color */
      font-family: 'Playfair Display', serif;
      font-size: 14px; /* Mobile-first: smaller font */
      font-weight: 600;
      border-bottom: 2px solid var(--anarchy-gold); /* Brand color */
      padding-bottom: 6px; /* Mobile-first: smaller padding */
    }

    .full-width {
      width: 100%;
    }

    .dialog-actions {
      display: flex;
      flex-direction: column; /* Mobile-first: stacked layout */
      gap: 8px; /* Mobile-first: smaller gap */
      padding: 16px 20px; /* Mobile-first: smaller padding */
      margin: 0;
      background: rgba(255, 255, 255, 0.05);
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }

    .dialog-actions button {
      height: 44px; /* Mobile-first: smaller height */
      font-size: 14px; /* Mobile-first: smaller font */
      border-radius: 12px; /* Branded radius */
      font-family: 'Inter', sans-serif;
      font-weight: 500;
      min-width: 120px;
    }

    .cancel-button {
      background: rgba(255, 255, 255, 0.1);
      color: var(--anarchy-grey); /* Brand color */
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .save-button {
      background: var(--brand-gradient);
      color: white;
      box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
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
      .dialog-title {
        font-size: 19px;
      }
      
      .form-section h3 {
        font-size: 15px;
      }
    }

    /* Medium mobile devices (480px and up) */
    @media (min-width: 480px) {
      .dialog-title {
        font-size: 20px;
        padding: 20px 24px;
        text-align: left;
      }

      .dialog-content {
        padding: 20px 24px;
      }

      .form-section {
        padding: 16px;
        border-radius: 16px;
      }

      .form-section h3 {
        font-size: 16px;
        margin: 0 0 16px 0;
        padding-bottom: 8px;
      }

      .section-form {
        gap: 16px;
      }

      .dialog-actions {
        flex-direction: row;
        justify-content: flex-end;
        gap: 12px;
        padding: 20px 24px;
      }

      .dialog-actions button {
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
      .dialog-title {
        font-size: 22px;
        padding: 24px 28px;
      }

      .dialog-content {
        padding: 24px 28px;
      }

      .form-section {
        padding: 20px;
        border-radius: 20px;
      }

      .form-section h3 {
        font-size: 18px;
        margin: 0 0 20px 0;
        padding-bottom: 10px;
      }

      .section-form {
        gap: 20px;
      }

      .dialog-actions {
        gap: 16px;
        padding: 24px 28px;
      }

      .dialog-actions button {
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
      .dialog-title {
        font-size: 24px;
      }

      .form-section h3 {
        font-size: 20px;
      }

      .dialog-actions button {
        font-size: 17px;
      }
    }
  `]
})
export class SectionDialogComponent {
  sectionForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<SectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SectionDialogData,
    private fb: FormBuilder
  ) {
    this.sectionForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      order: [1, [Validators.required, Validators.min(1)]]
    });

    if (this.data.section) {
      this.sectionForm.patchValue(this.data.section);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.sectionForm.valid) {
      this.dialogRef.close(this.sectionForm.value);
    }
  }
}
