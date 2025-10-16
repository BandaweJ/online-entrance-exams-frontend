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
    <div class="question-view" *ngIf="question" role="main" aria-label="Question view">
      <!-- Question Header -->
      <div class="question-header">
        <div class="question-meta" role="group" aria-label="Question information">
          <mat-chip class="question-type" aria-label="Question type: {{ question.type | titlecase }}">{{ question.type | titlecase }}</mat-chip>
          <mat-chip class="question-marks" aria-label="Question worth {{ question.marks }} marks">{{ question.marks }} marks</mat-chip>
        </div>
        <div class="question-actions">
          <button mat-icon-button (click)="toggleFlag()" [class.flagged]="isFlagged"
                  [attr.aria-label]="isFlagged ? 'Remove flag from question' : 'Flag question for review'"
                  [attr.aria-pressed]="isFlagged">
            <mat-icon>flag</mat-icon>
          </button>
        </div>
      </div>

      <!-- Question Text -->
      <div class="question-text">
        <h2 id="question-text">{{ question.questionText }}</h2>
        <p *ngIf="question.description" class="question-description" id="question-description">{{ question.description }}</p>
      </div>

      <!-- Question Options -->
      <div class="question-options" role="group" [attr.aria-labelledby]="'question-text'">
        <form [formGroup]="answerForm" (ngModelChange)="onAnswerChange()">
          <!-- Multiple Choice -->
          <fieldset *ngIf="question.type === 'multiple_choice'" class="option-group">
            <legend class="sr-only">Select one answer</legend>
            <mat-radio-group formControlName="answer" class="radio-group" [disabled]="isPaused"
                           [attr.aria-labelledby]="'question-text'"
                           [attr.aria-describedby]="question.description ? 'question-description' : null">
              <mat-radio-button 
                *ngFor="let option of question.options; let i = index" 
                [value]="option"
                class="option-item"
                [attr.aria-label]="'Option ' + getOptionLabel(i) + ': ' + option">
                <div class="option-content">
                  <span class="option-label" aria-hidden="true">{{ getOptionLabel(i) }}</span>
                  <span class="option-text">{{ option }}</span>
                </div>
              </mat-radio-button>
            </mat-radio-group>
          </fieldset>


          <!-- True/False -->
          <fieldset *ngIf="question.type === 'true_false'" class="option-group">
            <legend class="sr-only">Select true or false</legend>
            <mat-radio-group formControlName="answer" class="radio-group" [disabled]="isPaused"
                           [attr.aria-labelledby]="'question-text'"
                           [attr.aria-describedby]="question.description ? 'question-description' : null">
              <mat-radio-button value="true" class="option-item" aria-label="Option A: True">
                <div class="option-content">
                  <span class="option-label" aria-hidden="true">A</span>
                  <span class="option-text">True</span>
                </div>
              </mat-radio-button>
              <mat-radio-button value="false" class="option-item" aria-label="Option B: False">
                <div class="option-content">
                  <span class="option-label" aria-hidden="true">B</span>
                  <span class="option-text">False</span>
                </div>
              </mat-radio-button>
            </mat-radio-group>
          </fieldset>

          <!-- Short Answer -->
          <div *ngIf="question.type === 'short_answer'" class="option-group">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Your Answer</mat-label>
              <input matInput formControlName="answer" 
                     placeholder="Enter your answer" 
                     [disabled]="isPaused"
                     [attr.aria-labelledby]="'question-text'"
                     [attr.aria-describedby]="question.description ? 'question-description' : null">
            </mat-form-field>
          </div>

          <!-- Essay -->
          <div *ngIf="question.type === 'essay'" class="option-group">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Your Answer</mat-label>
              <textarea matInput formControlName="answer" 
                        placeholder="Enter your answer" 
                        rows="6" 
                        [disabled]="isPaused"
                        [attr.aria-labelledby]="'question-text'"
                        [attr.aria-describedby]="question.description ? 'question-description' : null"></textarea>
            </mat-form-field>
          </div>

        </form>
      </div>

      <!-- Question Footer -->
      <div class="question-footer" role="toolbar" aria-label="Question actions">
        <div class="question-info" aria-live="polite" aria-label="Question progress">
          <span>Question {{ questionIndex + 1 }} of {{ totalQuestions }}</span>
        </div>
        <div class="question-actions">
          <button mat-button (click)="clearAnswer()" *ngIf="hasAnswer()" [disabled]="isPaused"
                  aria-label="Clear current answer">
            <mat-icon aria-hidden="true">clear</mat-icon>
            Clear Answer
          </button>
          <button mat-raised-button color="primary" (click)="submitAnswer()" 
                  [disabled]="!hasAnswer() || isSubmitting || isPaused"
                  [attr.aria-label]="isSubmitting ? 'Saving answer...' : 'Save current answer'">
            <mat-icon *ngIf="!isSubmitting" aria-hidden="true">save</mat-icon>
            <mat-spinner *ngIf="isSubmitting" diameter="20" aria-label="Saving"></mat-spinner>
            {{ isSubmitting ? 'Saving...' : 'Save Answer' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Mobile-first base styles with branding */
    .question-view {
      max-width: 800px;
      margin: 0 auto;
      padding: 12px; /* Mobile-first: smaller padding */
    }

    .question-header {
      display: flex;
      flex-direction: column; /* Mobile-first: stacked layout */
      gap: 12px; /* Mobile-first: smaller gap */
      margin-bottom: 16px; /* Mobile-first: smaller margin */
      padding-bottom: 12px; /* Mobile-first: smaller padding */
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }

    .question-meta {
      display: flex;
      flex-wrap: wrap; /* Mobile-first: wrap on small screens */
      gap: 6px; /* Mobile-first: smaller gap */
    }

    .question-type {
      background-color: rgba(30, 58, 138, 0.1); /* Brand color background */
      color: var(--anarchy-blue); /* Brand color */
      font-size: 11px; /* Mobile-first: smaller font */
      font-family: 'Inter', sans-serif;
      font-weight: 500;
    }

    .question-marks {
      background-color: rgba(76, 175, 80, 0.1); /* Branded success color */
      color: #4caf50;
      font-size: 11px; /* Mobile-first: smaller font */
      font-family: 'Inter', sans-serif;
      font-weight: 500;
    }

    .question-actions {
      display: flex;
      justify-content: center; /* Mobile-first: center alignment */
    }

    .question-actions button.flagged {
      color: var(--anarchy-gold); /* Brand color */
    }

    .question-text {
      margin-bottom: 20px; /* Mobile-first: smaller margin */
    }

    .question-text h2 {
      margin: 0 0 8px 0; /* Mobile-first: smaller margin */
      font-family: 'Playfair Display', serif;
      font-size: 16px; /* Mobile-first: smaller font */
      font-weight: 600;
      line-height: 1.3;
      color: var(--anarchy-blue); /* Brand color */
    }

    .question-description {
      margin: 0;
      color: var(--anarchy-grey); /* Brand color */
      font-family: 'Inter', sans-serif;
      font-size: 12px; /* Mobile-first: smaller font */
      line-height: 1.4;
    }

    .question-options {
      margin-bottom: 20px; /* Mobile-first: smaller margin */
    }

    .option-group {
      margin-bottom: 16px; /* Mobile-first: smaller margin */
    }

    .radio-group, .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 8px; /* Mobile-first: smaller gap */
    }

    .option-item {
      padding: 12px; /* Mobile-first: smaller padding */
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px; /* Branded radius */
      transition: all 0.3s ease;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
    }

    .option-item:hover {
      border-color: var(--anarchy-blue); /* Brand color */
      background-color: rgba(30, 58, 138, 0.1);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(30, 58, 138, 0.15);
    }

    .option-item.mat-radio-checked,
    .option-item.mat-checkbox-checked {
      border-color: var(--anarchy-blue); /* Brand color */
      background-color: rgba(30, 58, 138, 0.15);
      box-shadow: 0 4px 12px rgba(30, 58, 138, 0.2);
    }

    .option-content {
      display: flex;
      align-items: center;
      gap: 8px; /* Mobile-first: smaller gap */
    }

    .option-label {
      font-family: 'Inter', sans-serif;
      font-weight: 600;
      color: var(--anarchy-blue); /* Brand color */
      min-width: 20px; /* Mobile-first: smaller width */
      font-size: 12px; /* Mobile-first: smaller font */
    }

    .option-text {
      flex: 1;
      font-family: 'Inter', sans-serif;
      font-size: 13px; /* Mobile-first: smaller font */
      line-height: 1.3;
    }

    .full-width {
      width: 100%;
    }

    .fill-blank-content {
      margin-bottom: 16px; /* Mobile-first: smaller margin */
      padding: 12px; /* Mobile-first: smaller padding */
      background-color: rgba(30, 58, 138, 0.05); /* Brand color background */
      border-radius: 12px; /* Branded radius */
      font-family: 'Inter', sans-serif;
      font-size: 13px; /* Mobile-first: smaller font */
      line-height: 1.4;
      border: 1px solid rgba(30, 58, 138, 0.1);
    }

    .blank-inputs {
      display: flex;
      flex-direction: column;
      gap: 12px; /* Mobile-first: smaller gap */
    }

    .blank-input {
      width: 100%;
    }

    .question-footer {
      display: flex;
      flex-direction: column; /* Mobile-first: stacked layout */
      gap: 12px; /* Mobile-first: smaller gap */
      align-items: center;
      padding-top: 16px; /* Mobile-first: smaller padding */
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }

    .question-info {
      color: var(--anarchy-grey); /* Brand color */
      font-family: 'Inter', sans-serif;
      font-size: 12px; /* Mobile-first: smaller font */
    }

    .question-actions button {
      color: var(--anarchy-grey); /* Brand color */
      border-radius: 12px; /* Branded radius */
    }

    .question-actions button:hover {
      color: var(--anarchy-blue); /* Brand color */
    }

    /* Small mobile devices (320px and up) */
    @media (min-width: 320px) {
      .question-text h2 {
        font-size: 17px;
      }
      
      .question-description {
        font-size: 13px;
      }
      
      .option-text {
        font-size: 14px;
      }
    }

    /* Medium mobile devices (480px and up) */
    @media (min-width: 480px) {
      .question-view {
        padding: 16px;
      }

      .question-header {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        margin-bottom: 24px;
        padding-bottom: 16px;
      }

      .question-meta {
        gap: 8px;
      }

      .question-type, .question-marks {
        font-size: 12px;
      }

      .question-actions {
        justify-content: flex-end;
      }

      .question-text h2 {
        font-size: 18px;
        margin: 0 0 12px 0;
      }

      .question-description {
        font-size: 14px;
      }

      .question-options {
        margin-bottom: 24px;
      }

      .option-group {
        margin-bottom: 20px;
      }

      .radio-group, .checkbox-group {
        gap: 12px;
      }

      .option-item {
        padding: 16px;
        border-radius: 16px;
      }

      .option-content {
        gap: 12px;
      }

      .option-label {
        min-width: 24px;
        font-size: 14px;
      }

      .option-text {
        font-size: 15px;
      }

      .fill-blank-content {
        margin-bottom: 20px;
        padding: 16px;
        font-size: 15px;
        border-radius: 16px;
      }

      .blank-inputs {
        gap: 16px;
      }

      .question-footer {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        padding-top: 20px;
      }

      .question-info {
        font-size: 14px;
      }
    }

    /* Tablet and up (768px and up) */
    @media (min-width: 768px) {
      .question-view {
        padding: 20px;
      }

      .question-header {
        margin-bottom: 30px;
      }

      .question-text h2 {
        font-size: 20px;
        margin: 0 0 12px 0;
      }

      .question-description {
        font-size: 15px;
      }

      .question-options {
        margin-bottom: 30px;
      }

      .option-group {
        margin-bottom: 24px;
      }

      .radio-group, .checkbox-group {
        gap: 16px;
      }

      .option-item {
        padding: 20px;
        border-radius: 20px;
      }

      .option-content {
        gap: 16px;
      }

      .option-label {
        min-width: 28px;
        font-size: 16px;
      }

      .option-text {
        font-size: 16px;
      }

      .fill-blank-content {
        margin-bottom: 24px;
        padding: 20px;
        font-size: 16px;
        border-radius: 20px;
      }

      .blank-inputs {
        gap: 20px;
      }

      .question-footer {
        padding-top: 24px;
      }

      .question-info {
        font-size: 15px;
      }
    }

    /* Large screens (1024px and up) */
    @media (min-width: 1024px) {
      .question-text h2 {
        font-size: 22px;
      }

      .question-description {
        font-size: 16px;
      }

      .option-text {
        font-size: 17px;
      }

      .fill-blank-content {
        font-size: 17px;
      }
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
