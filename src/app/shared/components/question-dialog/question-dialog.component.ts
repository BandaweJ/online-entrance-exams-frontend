import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { QuestionType } from '../../../models/exam.model';

export interface QuestionDialogData {
  title: string;
  question?: any;
  sectionId: string;
  sectionTitle: string;
}

@Component({
  selector: 'app-question-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title class="dialog-title">{{ data.title }}</h2>
      <mat-dialog-content class="dialog-content">
        <form [formGroup]="questionForm" class="question-form">
          <div class="section-info">
            <mat-icon>folder</mat-icon>
            <span>{{ data.sectionTitle }}</span>
          </div>

          <div class="form-section">
            <h3>Question Details</h3>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Question Text</mat-label>
              <textarea matInput formControlName="questionText" placeholder="Enter the question" rows="3"></textarea>
              <mat-icon matSuffix>quiz</mat-icon>
              <mat-error *ngIf="questionForm.get('questionText')?.hasError('required')">
                Question text is required
              </mat-error>
            </mat-form-field>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Question Type</mat-label>
                <mat-select formControlName="type">
                  <mat-option value="multiple_choice">Multiple Choice</mat-option>
                  <mat-option value="true_false">True/False</mat-option>
                  <mat-option value="short_answer">Short Answer</mat-option>
                  <mat-option value="essay">Essay</mat-option>
                </mat-select>
                <mat-icon matSuffix>category</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Marks</mat-label>
                <input matInput type="number" formControlName="marks" placeholder="10" min="1">
                <mat-icon matSuffix>grade</mat-icon>
                <mat-error *ngIf="questionForm.get('marks')?.hasError('required')">
                  Marks is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Order</mat-label>
                <input matInput type="number" formControlName="order" placeholder="1" min="1">
                <mat-icon matSuffix>sort</mat-icon>
                <mat-error *ngIf="questionForm.get('order')?.hasError('required')">
                  Order is required
                </mat-error>
              </mat-form-field>
            </div>
          </div>

          <!-- Options for multiple choice and multiple select -->
          <div *ngIf="showOptions()" class="form-section options-section">
            <div class="options-header">
              <h3>Answer Options</h3>
              <button mat-icon-button type="button" (click)="addOption()" class="add-option-btn">
                <mat-icon>add</mat-icon>
              </button>
            </div>
            <div formArrayName="options" class="options-list">
              <div *ngFor="let option of optionsArray.controls; let i = index" class="option-item">
                <mat-form-field appearance="outline" class="option-input">
                  <mat-label>Option {{ i + 1 }}</mat-label>
                  <input matInput [formControlName]="i" placeholder="Enter option text">
                  <button mat-icon-button matSuffix type="button" (click)="removeOption(i)" class="remove-option-btn">
                    <mat-icon>remove</mat-icon>
                  </button>
                </mat-form-field>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Answer & Explanation</h3>
            <!-- Correct Answer -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Correct Answer</mat-label>
              <textarea matInput formControlName="correctAnswer" placeholder="Enter the correct answer" rows="2"></textarea>
              <mat-icon matSuffix>check_circle</mat-icon>
              <mat-error *ngIf="questionForm.get('correctAnswer')?.hasError('required')">
                Correct answer is required
              </mat-error>
            </mat-form-field>

            <!-- Explanation -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Explanation (Optional)</mat-label>
              <textarea matInput formControlName="explanation" placeholder="Explain why this is the correct answer" rows="2"></textarea>
              <mat-icon matSuffix>lightbulb</mat-icon>
            </mat-form-field>
          </div>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()" class="cancel-button">
          <mat-icon>close</mat-icon>
          Cancel
        </button>
        <button mat-raised-button color="primary" (click)="onSave()" [disabled]="questionForm.invalid" class="save-button">
          <mat-icon>save</mat-icon>
          {{ data.question ? 'Update' : 'Create' }}
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
      max-height: 90vh; /* Mobile-first: prevent overflow */
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
      max-height: 70vh; /* Mobile-first: prevent overflow */
      overflow-y: auto;
    }

    .question-form {
      display: flex;
      flex-direction: column;
      gap: 12px; /* Mobile-first: smaller gap */
    }

    .section-info {
      display: flex;
      align-items: center;
      gap: 8px; /* Mobile-first: smaller gap */
      padding: 8px 12px; /* Mobile-first: smaller padding */
      background: rgba(30, 58, 138, 0.1); /* Brand color background */
      border-radius: 8px; /* Branded radius */
      font-family: 'Inter', sans-serif;
      font-size: 12px; /* Mobile-first: smaller font */
      color: var(--anarchy-grey); /* Brand color */
      border: 1px solid rgba(30, 58, 138, 0.2);
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

    .form-row {
      display: flex;
      flex-direction: column; /* Mobile-first: stacked layout */
      gap: 12px; /* Mobile-first: smaller gap */
    }

    .half-width {
      flex: 1;
    }

    .options-section {
      background: rgba(30, 58, 138, 0.05); /* Brand color background */
      border: 1px solid rgba(30, 58, 138, 0.2);
      border-radius: 12px; /* Branded radius */
      padding: 12px; /* Mobile-first: smaller padding */
    }

    .options-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px; /* Mobile-first: smaller margin */
    }

    .options-header h3 {
      margin: 0;
      color: var(--anarchy-blue); /* Brand color */
      font-family: 'Playfair Display', serif;
      font-size: 14px; /* Mobile-first: smaller font */
      font-weight: 600;
      border-bottom: 2px solid var(--anarchy-gold); /* Brand color */
      padding-bottom: 6px; /* Mobile-first: smaller padding */
    }

    .add-option-btn {
      background: var(--brand-gradient);
      color: white;
      border-radius: 50%;
      width: 32px; /* Mobile-first: smaller size */
      height: 32px;
      box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
    }

    .options-list {
      display: flex;
      flex-direction: column;
      gap: 8px; /* Mobile-first: smaller gap */
    }

    .option-item {
      display: flex;
      flex-direction: column; /* Mobile-first: stacked layout */
      align-items: stretch;
      gap: 8px; /* Mobile-first: smaller gap */
    }

    .option-input {
      flex: 1;
    }

    .remove-option-btn {
      color: #f44336;
      background: rgba(244, 67, 54, 0.1);
      border-radius: 50%;
      width: 28px; /* Mobile-first: smaller size */
      height: 28px;
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
      
      .options-header h3 {
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

      .question-form {
        gap: 16px;
      }

      .form-row {
        flex-direction: row;
        gap: 16px;
      }

      .options-section {
        padding: 16px;
        border-radius: 16px;
      }

      .options-header h3 {
        font-size: 16px;
        margin: 0 0 16px 0;
        padding-bottom: 8px;
      }

      .options-header {
        margin-bottom: 16px;
      }

      .add-option-btn {
        width: 36px;
        height: 36px;
      }

      .options-list {
        gap: 12px;
      }

      .option-item {
        flex-direction: row;
        align-items: center;
        gap: 12px;
      }

      .remove-option-btn {
        width: 32px;
        height: 32px;
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
      .dialog-container {
        max-height: 95vh;
      }

      .dialog-title {
        font-size: 22px;
        padding: 24px 28px;
      }

      .dialog-content {
        padding: 24px 28px;
        max-height: 75vh;
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

      .question-form {
        gap: 20px;
      }

      .form-row {
        gap: 20px;
      }

      .options-section {
        padding: 20px;
        border-radius: 20px;
      }

      .options-header h3 {
        font-size: 18px;
        margin: 0 0 20px 0;
        padding-bottom: 10px;
      }

      .options-header {
        margin-bottom: 20px;
      }

      .add-option-btn {
        width: 40px;
        height: 40px;
      }

      .options-list {
        gap: 16px;
      }

      .option-item {
        gap: 16px;
      }

      .remove-option-btn {
        width: 36px;
        height: 36px;
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

      .options-header h3 {
        font-size: 20px;
      }

      .dialog-actions button {
        font-size: 17px;
      }
    }
  `]
})
export class QuestionDialogComponent {
  questionForm: FormGroup;
  questionTypes: QuestionType[] = [
    'multiple_choice',
    'true_false',
    'short_answer',
    'essay'
  ];

  constructor(
    public dialogRef: MatDialogRef<QuestionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: QuestionDialogData,
    private fb: FormBuilder
  ) {
    this.questionForm = this.fb.group({
      questionText: ['', [Validators.required, Validators.minLength(10)]],
      type: ['multiple_choice', [Validators.required]],
      marks: [10, [Validators.required, Validators.min(1)]],
      order: [1, [Validators.required, Validators.min(1)]],
      options: this.fb.array([]),
      correctAnswer: ['', [Validators.required]],
      explanation: ['']
    });

    if (this.data.question) {
      this.questionForm.patchValue(this.data.question);
      if (this.data.question.options) {
        this.data.question.options.forEach((option: string) => {
          this.addOption(option);
        });
      }
    } else {
      // Add default options for multiple choice
      this.addOption();
      this.addOption();
    }

    // Watch for type changes to show/hide options
    this.questionForm.get('type')?.valueChanges.subscribe(() => {
      this.updateOptionsVisibility();
    });
  }

  get optionsArray() {
    return this.questionForm.get('options') as FormArray;
  }

  showOptions(): boolean {
    const type = this.questionForm.get('type')?.value;
    return type === 'multiple_choice';
  }

  addOption(value: string = '') {
    this.optionsArray.push(this.fb.control(value));
  }

  removeOption(index: number) {
    if (this.optionsArray.length > 1) {
      this.optionsArray.removeAt(index);
    }
  }

  private updateOptionsVisibility() {
    const type = this.questionForm.get('type')?.value;
    if (this.showOptions()) {
      if (this.optionsArray.length === 0) {
        this.addOption();
        this.addOption();
      }
    } else {
      this.optionsArray.clear();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.questionForm.valid) {
      const formValue = this.questionForm.value;
      // Filter out empty options
      if (formValue.options) {
        formValue.options = formValue.options.filter((option: string) => option.trim() !== '');
      }
      this.dialogRef.close(formValue);
    }
  }
}
