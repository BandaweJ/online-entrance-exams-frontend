import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Question } from '../../models/exam.model';

@Component({
  selector: 'app-exam-navigation',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <div class="navigation-container">
      <h3>Question Navigation</h3>
      
      <div class="question-grid">
        <button 
          *ngFor="let question of questions; let i = index"
          mat-button
          [class]="getQuestionClass(i)"
          [disabled]="isPaused"
          (click)="onQuestionClick(i)">
          <div class="question-number">
            {{ i + 1 }}
          </div>
          <div class="question-status">
            <mat-icon *ngIf="isAnswered(i)">check_circle</mat-icon>
            <mat-icon *ngIf="isDrafted(i)">edit</mat-icon>
            <mat-icon *ngIf="!isAnswered(i) && !isDrafted(i)">radio_button_unchecked</mat-icon>
          </div>
        </button>
      </div>

      <div class="navigation-summary">
        <div class="summary-item">
          <mat-icon>check_circle</mat-icon>
          <span>{{ answeredCount }} Answered</span>
        </div>
        <div class="summary-item">
          <mat-icon>edit</mat-icon>
          <span>{{ draftedCount }} Drafted</span>
        </div>
        <div class="summary-item">
          <mat-icon>radio_button_unchecked</mat-icon>
          <span>{{ unansweredCount }} Unanswered</span>
        </div>
        <div class="summary-item">
          <mat-icon>flag</mat-icon>
          <span>{{ flaggedCount }} Flagged</span>
        </div>
      </div>

      <div class="legend">
        <h4>Legend</h4>
        <div class="legend-item">
          <div class="legend-color current"></div>
          <span>Current Question</span>
        </div>
        <div class="legend-item">
          <div class="legend-color answered"></div>
          <span>Answered</span>
        </div>
        <div class="legend-item">
          <div class="legend-color drafted"></div>
          <span>Drafted</span>
        </div>
        <div class="legend-item">
          <div class="legend-color unanswered"></div>
          <span>Unanswered</span>
        </div>
        <div class="legend-item">
          <div class="legend-color flagged"></div>
          <span>Flagged for Review</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .navigation-container {
      padding: 20px;
    }

    .navigation-container h3 {
      margin: 0 0 20px 0;
      color: #333;
      font-size: 18px;
    }

    .question-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
      margin-bottom: 20px;
    }

    .question-grid button {
      position: relative;
      min-width: 50px;
      height: 50px;
      padding: 0;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .question-number {
      font-size: 16px;
      font-weight: 500;
    }

    .question-status {
      position: absolute;
      top: 4px;
      right: 4px;
    }

    .question-status mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .question-current {
      background-color: #1976d2;
      color: white;
      box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
    }

    .question-answered {
      background-color: #e8f5e8;
      color: #4caf50;
      border: 2px solid #4caf50;
    }

    .question-unanswered {
      background-color: #f5f5f5;
      color: #666;
      border: 2px solid #e0e0e0;
    }

    .question-flagged {
      background-color: #fff3e0;
      color: #ff9800;
      border: 2px solid #ff9800;
    }

    .question-drafted {
      background-color: #e3f2fd;
      color: #1976d2;
      border: 2px solid #1976d2;
    }

    .question-answered:hover,
    .question-unanswered:hover,
    .question-flagged:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .navigation-summary {
      background-color: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .summary-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .summary-item:last-child {
      margin-bottom: 0;
    }

    .summary-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .legend {
      border-top: 1px solid #e0e0e0;
      padding-top: 16px;
    }

    .legend h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: #666;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 12px;
    }

    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 4px;
      border: 1px solid #ccc;
    }

    .legend-color.current {
      background-color: #1976d2;
    }

    .legend-color.answered {
      background-color: #e8f5e8;
      border-color: #4caf50;
    }

    .legend-color.unanswered {
      background-color: #f5f5f5;
      border-color: #e0e0e0;
    }

    .legend-color.flagged {
      background-color: #fff3e0;
      border-color: #ff9800;
    }

    .legend-color.drafted {
      background-color: #e3f2fd;
      border-color: #1976d2;
    }

    @media (max-width: 768px) {
      .question-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }
  `]
})
export class ExamNavigationComponent {
  @Input() questions: Question[] = [];
  @Input() currentQuestionIndex = 0;
  @Input() answeredQuestions = new Set<number>();
  @Input() draftedQuestions = new Set<number>();
  @Input() flaggedQuestions = new Set<number>();
  @Input() isPaused = false;
  @Output() questionSelected = new EventEmitter<number>();

  get answeredCount(): number {
    return this.answeredQuestions.size;
  }

  get draftedCount(): number {
    return this.draftedQuestions.size;
  }

  get unansweredCount(): number {
    return this.questions.length - this.answeredQuestions.size - this.draftedQuestions.size;
  }

  get flaggedCount(): number {
    return this.flaggedQuestions.size;
  }

  onQuestionClick(index: number) {
    if (!this.isPaused) {
      this.questionSelected.emit(index);
    }
  }

  isAnswered(index: number): boolean {
    return this.answeredQuestions.has(index);
  }

  isFlagged(index: number): boolean {
    return this.flaggedQuestions.has(index);
  }

  isDrafted(index: number): boolean {
    return this.draftedQuestions.has(index);
  }

  getQuestionClass(index: number): string {
    if (index === this.currentQuestionIndex) {
      return 'question-current';
    } else if (this.isFlagged(index)) {
      return 'question-flagged';
    } else if (this.isAnswered(index)) {
      return 'question-answered';
    } else if (this.isDrafted(index)) {
      return 'question-drafted';
    } else {
      return 'question-unanswered';
    }
  }
}
