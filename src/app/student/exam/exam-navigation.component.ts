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
    /* Mobile-first base styles with branding */
    .navigation-container {
      padding: 12px; /* Mobile-first: smaller padding */
    }

    .navigation-container h3 {
      margin: 0 0 16px 0; /* Mobile-first: smaller margin */
      color: var(--anarchy-blue); /* Brand color */
      font-family: 'Playfair Display', serif;
      font-size: 16px; /* Mobile-first: smaller font */
      font-weight: 600;
      text-align: center; /* Mobile-first: center alignment */
    }

    .question-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr); /* Mobile-first: fewer columns */
      gap: 6px; /* Mobile-first: smaller gap */
      margin-bottom: 16px; /* Mobile-first: smaller margin */
    }

    .question-grid button {
      position: relative;
      min-width: 40px; /* Mobile-first: smaller size */
      height: 40px; /* Mobile-first: smaller height */
      padding: 0;
      border-radius: 12px; /* Branded radius */
      transition: all 0.3s ease;
      font-family: 'Inter', sans-serif;
    }

    .question-number {
      font-size: 12px; /* Mobile-first: smaller font */
      font-weight: 600;
    }

    .question-status {
      position: absolute;
      top: 2px; /* Mobile-first: smaller offset */
      right: 2px;
    }

    .question-status mat-icon {
      font-size: 12px; /* Mobile-first: smaller icon */
      width: 12px;
      height: 12px;
    }

    .question-current {
      background: var(--brand-gradient); /* Brand gradient */
      color: white;
      box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
      transform: scale(1.05);
    }

    .question-answered {
      background-color: rgba(76, 175, 80, 0.1); /* Branded success */
      color: #4caf50;
      border: 2px solid #4caf50;
    }

    .question-unanswered {
      background-color: rgba(255, 255, 255, 0.1);
      color: var(--anarchy-grey); /* Brand color */
      border: 2px solid rgba(255, 255, 255, 0.2);
    }

    .question-flagged {
      background-color: rgba(255, 152, 0, 0.1); /* Branded warning */
      color: var(--anarchy-gold); /* Brand color */
      border: 2px solid var(--anarchy-gold);
    }

    .question-drafted {
      background-color: rgba(30, 58, 138, 0.1); /* Brand color background */
      color: var(--anarchy-blue); /* Brand color */
      border: 2px solid var(--anarchy-blue);
    }

    .question-answered:hover,
    .question-unanswered:hover,
    .question-flagged:hover,
    .question-drafted:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 6px 16px rgba(0,0,0,0.15);
    }

    .navigation-summary {
      background: rgba(30, 58, 138, 0.05); /* Brand color background */
      padding: 12px; /* Mobile-first: smaller padding */
      border-radius: 12px; /* Branded radius */
      margin-bottom: 16px; /* Mobile-first: smaller margin */
      border: 1px solid rgba(30, 58, 138, 0.1);
    }

    .summary-item {
      display: flex;
      align-items: center;
      gap: 6px; /* Mobile-first: smaller gap */
      margin-bottom: 6px; /* Mobile-first: smaller margin */
      font-family: 'Inter', sans-serif;
      font-size: 11px; /* Mobile-first: smaller font */
      color: var(--anarchy-grey); /* Brand color */
    }

    .summary-item:last-child {
      margin-bottom: 0;
    }

    .summary-item mat-icon {
      font-size: 14px; /* Mobile-first: smaller icon */
      width: 14px;
      height: 14px;
    }

    .legend {
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      padding-top: 12px; /* Mobile-first: smaller padding */
    }

    .legend h4 {
      margin: 0 0 8px 0; /* Mobile-first: smaller margin */
      font-family: 'Inter', sans-serif;
      font-size: 12px; /* Mobile-first: smaller font */
      color: var(--anarchy-grey); /* Brand color */
      font-weight: 600;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px; /* Mobile-first: smaller gap */
      margin-bottom: 6px; /* Mobile-first: smaller margin */
      font-family: 'Inter', sans-serif;
      font-size: 10px; /* Mobile-first: smaller font */
      color: var(--anarchy-grey); /* Brand color */
    }

    .legend-color {
      width: 12px; /* Mobile-first: smaller size */
      height: 12px;
      border-radius: 6px; /* Branded radius */
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .legend-color.current {
      background: var(--brand-gradient); /* Brand gradient */
    }

    .legend-color.answered {
      background-color: rgba(76, 175, 80, 0.1);
      border-color: #4caf50;
    }

    .legend-color.unanswered {
      background-color: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .legend-color.flagged {
      background-color: rgba(255, 152, 0, 0.1);
      border-color: var(--anarchy-gold);
    }

    .legend-color.drafted {
      background-color: rgba(30, 58, 138, 0.1);
      border-color: var(--anarchy-blue);
    }

    /* Small mobile devices (320px and up) */
    @media (min-width: 320px) {
      .navigation-container h3 {
        font-size: 17px;
      }
      
      .question-number {
        font-size: 13px;
      }
      
      .summary-item {
        font-size: 12px;
      }
    }

    /* Medium mobile devices (480px and up) */
    @media (min-width: 480px) {
      .navigation-container {
        padding: 16px;
      }

      .navigation-container h3 {
        font-size: 18px;
        margin: 0 0 20px 0;
        text-align: left;
      }

      .question-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        margin-bottom: 20px;
      }

      .question-grid button {
        min-width: 45px;
        height: 45px;
        border-radius: 16px;
      }

      .question-number {
        font-size: 14px;
      }

      .question-status {
        top: 3px;
        right: 3px;
      }

      .question-status mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }

      .navigation-summary {
        padding: 16px;
        border-radius: 16px;
        margin-bottom: 20px;
      }

      .summary-item {
        gap: 8px;
        margin-bottom: 8px;
        font-size: 13px;
      }

      .summary-item mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .legend {
        padding-top: 16px;
      }

      .legend h4 {
        font-size: 14px;
        margin: 0 0 12px 0;
      }

      .legend-item {
        gap: 8px;
        margin-bottom: 8px;
        font-size: 12px;
      }

      .legend-color {
        width: 14px;
        height: 14px;
        border-radius: 8px;
      }
    }

    /* Tablet and up (768px and up) */
    @media (min-width: 768px) {
      .navigation-container {
        padding: 20px;
      }

      .navigation-container h3 {
        font-size: 20px;
        margin: 0 0 24px 0;
      }

      .question-grid {
        grid-template-columns: repeat(5, 1fr);
        gap: 10px;
        margin-bottom: 24px;
      }

      .question-grid button {
        min-width: 50px;
        height: 50px;
        border-radius: 20px;
      }

      .question-number {
        font-size: 16px;
      }

      .question-status {
        top: 4px;
        right: 4px;
      }

      .question-status mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .navigation-summary {
        padding: 20px;
        border-radius: 20px;
        margin-bottom: 24px;
      }

      .summary-item {
        gap: 10px;
        margin-bottom: 10px;
        font-size: 14px;
      }

      .summary-item mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      .legend {
        padding-top: 20px;
      }

      .legend h4 {
        font-size: 15px;
        margin: 0 0 16px 0;
      }

      .legend-item {
        gap: 10px;
        margin-bottom: 10px;
        font-size: 13px;
      }

      .legend-color {
        width: 16px;
        height: 16px;
        border-radius: 10px;
      }
    }

    /* Large screens (1024px and up) */
    @media (min-width: 1024px) {
      .navigation-container h3 {
        font-size: 22px;
      }

      .question-number {
        font-size: 17px;
      }

      .summary-item {
        font-size: 15px;
      }

      .legend-item {
        font-size: 14px;
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
