import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Question, QuestionType } from '../../models/exam.model';

@Component({
  selector: 'app-question-view',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="question-view" *ngIf="question">
      <!-- Question Header -->
      <div class="question-header">
        <div class="question-meta">
          <mat-chip class="question-type">{{ question.type | titlecase }}</mat-chip>
          <mat-chip class="question-marks">{{ question.marks }} marks</mat-chip>
        </div>
        <div class="question-actions">
          <button mat-icon-button (click)="toggleFlag()" [class.flagged]="isFlagged">
            <mat-icon>flag</mat-icon>
          </button>
        </div>
      </div>

      <!-- Question Text -->
      <div class="question-text">
        <h2>{{ question.questionText }}</h2>
        <p *ngIf="question.description" class="question-description">{{ question.description }}</p>
      </div>

      <!-- Question Options -->
      <div class="question-options">
        <form [formGroup]="answerForm" (ngModelChange)="onAnswerChange()">
          <!-- Multiple Choice -->
          <div *ngIf="question.type === 'multiple_choice'" class="option-group">
            <mat-radio-group formControlName="answer" class="radio-group" [disabled]="isPaused">
              <mat-radio-button 
                *ngFor="let option of question.options; let i = index" 
                [value]="option"
                class="option-item">
                <div class="option-content">
                  <span class="option-label">{{ getOptionLabel(i) }}</span>
                  <span class="option-text">{{ option }}</span>
                </div>
              </mat-radio-button>
            </mat-radio-group>
          </div>


          <!-- True/False -->
          <div *ngIf="question.type === 'true_false'" class="option-group">
            <mat-radio-group formControlName="answer" class="radio-group" [disabled]="isPaused">
              <mat-radio-button value="true" class="option-item">
                <div class="option-content">
                  <span class="option-label">A</span>
                  <span class="option-text">True</span>
                </div>
              </mat-radio-button>
              <mat-radio-button value="false" class="option-item">
                <div class="option-content">
                  <span class="option-label">B</span>
                  <span class="option-text">False</span>
                </div>
              </mat-radio-button>
            </mat-radio-group>
          </div>

          <!-- Short Answer -->
          <div *ngIf="question.type === 'short_answer'" class="option-group">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Your Answer</mat-label>
              <input matInput formControlName="answer" placeholder="Enter your answer" [disabled]="isPaused">
            </mat-form-field>
          </div>

          <!-- Essay -->
          <div *ngIf="question.type === 'essay'" class="option-group">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Your Answer</mat-label>
              <textarea matInput formControlName="answer" placeholder="Enter your answer" rows="6" [disabled]="isPaused"></textarea>
            </mat-form-field>
          </div>

        </form>
      </div>

      <!-- Question Footer -->
      <div class="question-footer">
        <div class="question-info">
          <span>Question {{ questionIndex + 1 }} of {{ totalQuestions }}</span>
        </div>
        <div class="question-actions">
          <button mat-button (click)="clearAnswer()" *ngIf="hasAnswer()" [disabled]="isPaused">
            <mat-icon>clear</mat-icon>
            Clear Answer
          </button>
          <button mat-raised-button color="primary" (click)="submitAnswer()" 
                  [disabled]="!hasAnswer() || isSubmitting || isPaused">
            <mat-icon *ngIf="!isSubmitting">save</mat-icon>
            <mat-spinner *ngIf="isSubmitting" diameter="20"></mat-spinner>
            {{ isSubmitting ? 'Saving...' : 'Save Answer' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .question-view {
      max-width: 800px;
      margin: 0 auto;
    }

    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .question-meta {
      display: flex;
      gap: 8px;
    }

    .question-type {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .question-marks {
      background-color: #e8f5e8;
      color: #4caf50;
    }

    .question-actions button.flagged {
      color: #ff9800;
    }

    .question-text {
      margin-bottom: 30px;
    }

    .question-text h2 {
      margin: 0 0 12px 0;
      font-size: 20px;
      line-height: 1.4;
      color: #333;
    }

    .question-description {
      margin: 0;
      color: #666;
      font-size: 14px;
      line-height: 1.5;
    }

    .question-options {
      margin-bottom: 30px;
    }

    .option-group {
      margin-bottom: 20px;
    }

    .radio-group, .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .option-item {
      padding: 16px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .option-item:hover {
      border-color: #1976d2;
      background-color: #f5f5f5;
    }

    .option-item.mat-radio-checked,
    .option-item.mat-checkbox-checked {
      border-color: #1976d2;
      background-color: #e3f2fd;
    }

    .option-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .option-label {
      font-weight: bold;
      color: #1976d2;
      min-width: 24px;
    }

    .option-text {
      flex: 1;
    }

    .full-width {
      width: 100%;
    }

    .fill-blank-content {
      margin-bottom: 20px;
      padding: 16px;
      background-color: #f8f9fa;
      border-radius: 8px;
      font-size: 16px;
      line-height: 1.5;
    }

    .blank-inputs {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .blank-input {
      width: 100%;
    }

    .question-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }

    .question-info {
      color: #666;
      font-size: 14px;
    }

    .question-actions button {
      color: #666;
    }

    .question-actions button:hover {
      color: #1976d2;
    }
  `]
})
export class QuestionViewComponent implements OnInit, OnChanges {
  @Input() question: Question | null = null;
  @Input() questionIndex = 0;
  @Input() answer: any = '';
  @Input() totalQuestions = 0;
  @Input() isFlagged = false;
  @Input() isPaused = false;
  @Output() answerChanged = new EventEmitter<any>();
  @Output() flagChanged = new EventEmitter<boolean>();
  @Output() answerSubmitted = new EventEmitter<any>();

  answerForm: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.answerForm = this.fb.group({});
  }

  ngOnInit() {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Reinitialize form when question or answer changes
    if (changes['question'] || changes['answer']) {
      // Add a small delay to ensure the DOM is updated
      setTimeout(() => {
        this.initializeForm();
      }, 0);
    }
  }

  private initializeForm() {
    if (this.question) {
      const formControls: any = {};

      // Get the current answer value, ensuring it's properly formatted
      let currentAnswer = '';
      if (this.answer !== null && this.answer !== undefined) {
        if (typeof this.answer === 'string') {
          currentAnswer = this.answer;
        } else if (Array.isArray(this.answer)) {
          // For multiple choice questions that might have selectedOptions
          currentAnswer = this.answer[0] || '';
        } else {
          currentAnswer = String(this.answer);
        }
      }

      switch (this.question.type) {
        case 'multiple_choice':
        case 'true_false':
          formControls['answer'] = [currentAnswer];
          break;
        case 'short_answer':
        case 'essay':
          formControls['answer'] = [currentAnswer];
          break;
      }

      // Create new form group to ensure clean state
      this.answerForm = this.fb.group(formControls);
      
      // Emit the current answer value to parent component
      this.answerChanged.emit(currentAnswer);
    }
  }

  onAnswerChange() {
    let answerValue: any = '';

    switch (this.question?.type) {
      case 'multiple_choice':
      case 'true_false':
        answerValue = this.answerForm.get('answer')?.value || '';
        break;
      case 'short_answer':
      case 'essay':
        answerValue = this.answerForm.get('answer')?.value || '';
        break;
    }

    this.answerChanged.emit(answerValue);
  }

  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D, etc.
  }


  hasAnswer(): boolean {
    const answerValue = this.answerForm.get('answer')?.value;
    return answerValue && answerValue.toString().trim() !== '';
  }

  clearAnswer() {
    this.answerForm.reset();
    this.answerChanged.emit('');
    this.snackBar.open('Answer cleared', 'Close', { duration: 2000 });
  }

  toggleFlag() {
    const newFlaggedState = !this.isFlagged;
    // Emit flag change to parent component
    this.flagChanged.emit(newFlaggedState);
    
    // Show feedback to user
    this.snackBar.open(
      newFlaggedState ? 'Question flagged for review' : 'Question unflagged',
      'Close',
      { duration: 2000 }
    );
  }

  submitAnswer() {
    if (!this.hasAnswer()) {
      this.snackBar.open('Please provide an answer before submitting', 'Close', { duration: 3000 });
      return;
    }

    this.isSubmitting = true;
    const answerValue = this.answerForm.get('answer')?.value;
    
    // Emit the answer submission to parent component
    this.answerSubmitted.emit(answerValue);
    
    // Reset submitting state after a short delay
    setTimeout(() => {
      this.isSubmitting = false;
    }, 1000);
  }
}
