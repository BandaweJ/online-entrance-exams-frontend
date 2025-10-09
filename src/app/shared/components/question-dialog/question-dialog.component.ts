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
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <form [formGroup]="questionForm" class="question-form">
        <div class="section-info">
          <mat-icon>folder</mat-icon>
          <span>{{ data.sectionTitle }}</span>
        </div>

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

        <!-- Options for multiple choice and multiple select -->
        <div *ngIf="showOptions()" class="options-section">
          <div class="options-header">
            <h4>Answer Options</h4>
            <button mat-icon-button type="button" (click)="addOption()">
              <mat-icon>add</mat-icon>
            </button>
          </div>
          <div formArrayName="options" class="options-list">
            <div *ngFor="let option of optionsArray.controls; let i = index" class="option-item">
              <mat-form-field appearance="outline" class="option-input">
                <mat-label>Option {{ i + 1 }}</mat-label>
                <input matInput [formControlName]="i" placeholder="Enter option text">
                <button mat-icon-button matSuffix type="button" (click)="removeOption(i)">
                  <mat-icon>remove</mat-icon>
                </button>
              </mat-form-field>
            </div>
          </div>
        </div>

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
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="questionForm.invalid">
        <mat-icon>save</mat-icon>
        {{ data.question ? 'Update' : 'Create' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .question-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 500px;
    }

    .section-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background-color: #f5f5f5;
      border-radius: 4px;
      font-size: 14px;
      color: #666;
    }

    .full-width {
      width: 100%;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .half-width {
      flex: 1;
    }

    .options-section {
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 16px;
      background-color: #fafafa;
    }

    .options-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .options-header h4 {
      margin: 0;
      color: #333;
    }

    .options-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .option-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .option-input {
      flex: 1;
    }

    mat-dialog-content {
      margin: 20px 0;
    }
    
    mat-dialog-actions {
      margin-top: 20px;
    }

    /* Mobile-specific styles */
    @media (max-width: 768px) {
      .question-form {
        min-width: auto;
        width: 100%;
      }

      .form-row {
        flex-direction: column;
        gap: 12px;
      }

      .half-width {
        width: 100%;
      }

      .options-section {
        padding: 12px;
      }

      .options-header h4 {
        font-size: 16px;
      }

      .option-item {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }

      .option-input {
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
      .options-section {
        padding: 10px;
      }

      .options-header h4 {
        font-size: 15px;
      }

      mat-dialog-content {
        margin: 12px 0;
      }
      
      mat-dialog-actions {
        margin-top: 12px;
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
