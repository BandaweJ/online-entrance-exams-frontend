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
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <form [formGroup]="sectionForm" class="section-form">
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
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="sectionForm.invalid">
        <mat-icon>save</mat-icon>
        {{ data.section ? 'Update' : 'Create' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .section-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 400px;
    }

    .full-width {
      width: 100%;
    }

    mat-dialog-content {
      margin: 20px 0;
    }
    
    mat-dialog-actions {
      margin-top: 20px;
    }

    /* Mobile-specific styles */
    @media (max-width: 768px) {
      .section-form {
        min-width: auto;
        width: 100%;
      }

      mat-dialog-content {
        margin: 16px 0;
      }
      
      mat-dialog-actions {
        margin-top: 16px;
        flex-direction: column;
        gap: 8px;
      }

      mat-dialog-actions button {
        width: 100%;
        height: 48px;
      }
    }

    /* Small mobile devices */
    @media (max-width: 480px) {
      mat-dialog-content {
        margin: 12px 0;
      }
      
      mat-dialog-actions {
        margin-top: 12px;
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
