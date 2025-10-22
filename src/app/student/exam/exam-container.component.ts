import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { CountdownDisplayComponent } from '../../shared/components/countdown-display/countdown-display.component';
import { ExamNavigationComponent } from './exam-navigation.component';
import { QuestionViewComponent } from './question-view.component';
import { ExamInstructionsComponent } from '../../shared/components/exam-instructions/exam-instructions.component';
import { SectionInstructionsComponent } from '../../shared/components/section-instructions/section-instructions.component';
import { ExamService } from '../../core/services/exam.service';
import { AttemptsService } from '../../core/services/attempts.service';
import { AnswersService } from '../../core/services/answers.service';
import { Exam, Question, Section } from '../../models/exam.model';
import { ExamAttempt, CreateAttemptRequest } from '../../models/attempt.model';
import { Answer } from '../../models/answer.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { SchoolLogoComponent } from '../../shared/components/school-logo/school-logo.component';
import { CheatingWarningDialogComponent } from '../../shared/components/cheating-warning-dialog/cheating-warning-dialog.component';
import { AntiCheatingService, CheatingWarning } from '../../core/services/anti-cheating.service';
import { interval, Subscription, fromEvent, merge } from 'rxjs';
import { map, filter, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-exam-container',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    CountdownDisplayComponent,
    ExamNavigationComponent,
    QuestionViewComponent,
    ExamInstructionsComponent,
    SectionInstructionsComponent,
    SchoolLogoComponent,
    CheatingWarningDialogComponent // Used dynamically via MatDialog
  ],
  template: `
    <div class="exam-container" *ngIf="exam && attempt; else loading">
      <!-- Time Up Overlay -->
      <div class="time-up-overlay" *ngIf="isTimeUp">
        <div class="time-up-content">
          <mat-icon class="time-up-icon">timer_off</mat-icon>
          <h2>Time's Up!</h2>
          <p>Your exam time has expired. The exam will be automatically submitted.</p>
          <div class="time-up-warning">
            <mat-icon>warning</mat-icon>
            <span>You can no longer interact with the exam content.</span>
          </div>
        </div>
      </div>

      <!-- Paused Overlay -->
      <div class="paused-overlay" *ngIf="attempt.status === 'paused'">
        <div class="paused-content">
          <mat-icon class="paused-icon">pause_circle</mat-icon>
          <h2>Exam Paused</h2>
          <p>Your exam has been paused. You cannot interact with the exam content while it's paused.</p>
          <p class="paused-warning">
            <mat-icon>warning</mat-icon>
            <strong>Anti-cheating measure:</strong> The exam interface is locked to prevent research or external assistance.
          </p>
          <button mat-raised-button color="primary" (click)="resumeExam()">
            <mat-icon>play_arrow</mat-icon>
            Resume Exam
          </button>
        </div>
      </div>

      <!-- Exam Header -->
      <div class="exam-header">
        <div class="exam-info">
          <div class="brand-section">
            <app-school-logo size="small"></app-school-logo>
            <div class="exam-details">
              <h1>{{ exam.title }}</h1>
              <p>{{ exam.description }}</p>
            </div>
          </div>
        </div>
        <div class="exam-controls">
          <div class="timer-section">
            <app-countdown-display 
              [endTime]="attempt.endTime"
              [timeSpent]="attempt.timeSpent"
              [totalDuration]="exam.durationMinutes"
              (timeUp)="onTimeUp()">
            </app-countdown-display>
          </div>
          <div class="action-buttons">
            <button mat-button (click)="pauseExam()" *ngIf="attempt.status === 'in_progress' && !isTimeUp">
              <mat-icon>pause</mat-icon>
              Pause
            </button>
            <button mat-button (click)="resumeExam()" *ngIf="attempt.status === 'paused' && !isTimeUp">
              <mat-icon>play_arrow</mat-icon>
              Resume
            </button>
            <button mat-raised-button color="warn" (click)="submitExam()" 
                    [disabled]="attempt.status === 'paused' || isTimeUp">
              <mat-icon>check</mat-icon>
              Submit Exam
            </button>
          </div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="progress-section">
        <div class="progress-info">
          <span>Question {{ currentQuestionIndex + 1 }} of {{ totalQuestions }}</span>
          <span>{{ getProgressPercentage() }}% Complete</span>
        </div>
        <mat-progress-bar 
          mode="determinate" 
          [value]="(currentQuestionIndex + 1) / totalQuestions * 100">
        </mat-progress-bar>
      </div>

      <!-- Main Content -->
      <div class="exam-content" [class.paused]="attempt.status === 'paused'">
        <!-- Exam Instructions -->
        <div *ngIf="examFlowState === 'instructions'">
          <app-exam-instructions
            [title]="'Exam Instructions'"
            [instructions]="exam.instructions || 'No specific instructions for this exam.'"
            [continueButtonText]="'Start Exam'"
            (continue)="onStartExam()">
          </app-exam-instructions>
        </div>

        <!-- Section Instructions -->
        <div *ngIf="examFlowState === 'section-instructions'">
          <app-section-instructions
            [sectionTitle]="getCurrentSection()?.title || ''"
            [sectionDescription]="getCurrentSection()?.description || ''"
            [instructions]="getCurrentSection()?.instructions || ''"
            [totalMarks]="getCurrentSection()?.totalMarks || 0"
            [questionCount]="getCurrentSection()?.questionCount || 0"
            [showBackButton]="currentSectionIndex > 0"
            (startSection)="onStartSection()"
            (back)="onBackToPreviousSection()">
          </app-section-instructions>
        </div>

        <!-- Questions View -->
        <div *ngIf="examFlowState === 'questions'" class="questions-container">
          <!-- Navigation Sidebar -->
          <div class="navigation-sidebar">
            <app-exam-navigation
              [questions]="questions"
              [currentQuestionIndex]="currentQuestionIndex"
              [answeredQuestions]="answeredQuestions"
              [draftedQuestions]="draftedQuestions"
              [flaggedQuestions]="flaggedQuestions"
              [isPaused]="attempt.status === 'paused'"
              (questionSelected)="onQuestionSelected($event)">
            </app-exam-navigation>
          </div>

          <!-- Mobile Floating Navigation Button -->
          <button mat-fab color="primary" class="mobile-nav-fab" 
                  (click)="toggleMobileNav()" 
                  *ngIf="isMobile">
            <mat-icon>{{ showMobileNav ? 'close' : 'list' }}</mat-icon>
          </button>

          <!-- Mobile Navigation Overlay -->
          <div class="mobile-nav-overlay" *ngIf="isMobile && showMobileNav" (click)="toggleMobileNav()">
            <div class="mobile-nav-content" (click)="$event.stopPropagation()">
              <div class="mobile-nav-header">
                <h3>Question Navigation</h3>
                <button mat-icon-button (click)="toggleMobileNav()">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
              <app-exam-navigation
                [questions]="questions"
                [currentQuestionIndex]="currentQuestionIndex"
                [answeredQuestions]="answeredQuestions"
                [draftedQuestions]="draftedQuestions"
                [flaggedQuestions]="flaggedQuestions"
                [isPaused]="attempt.status === 'paused'"
                (questionSelected)="onQuestionSelected($event); toggleMobileNav()">
              </app-exam-navigation>
            </div>
          </div>

          <!-- Question Area -->
          <div class="question-area">
            <!-- Section Header with Instructions Link -->
            <div class="section-header" *ngIf="currentQuestion?.section">
              <div class="section-info">
                <mat-chip class="section-chip">
                  <mat-icon>folder</mat-icon>
                  {{ currentQuestion?.section?.title }}
                </mat-chip>
                <span class="section-description" *ngIf="currentQuestion?.section?.description">
                  {{ currentQuestion?.section?.description }}
                </span>
                <!-- Section Progress -->
                <div class="section-progress">
                  <span class="progress-text">
                    Section {{ getSectionProgress().current }} of {{ getSectionProgress().total }}
                    ({{ getQuestionProgress().current }}/{{ getQuestionProgress().total }} questions)
                  </span>
                  <mat-progress-bar 
                    mode="determinate" 
                    [value]="getQuestionProgress().percentage"
                    class="question-progress-bar">
                  </mat-progress-bar>
                </div>
              </div>
              <button mat-button (click)="onViewSectionInstructions()" 
                      *ngIf="currentQuestion?.section?.instructions"
                      class="instructions-button">
                <mat-icon>info</mat-icon>
                View Instructions
              </button>
            </div>

            <app-question-view
              [question]="currentQuestion"
              [questionIndex]="currentQuestionIndex"
              [answer]="getCurrentAnswer()"
              [isFlagged]="isQuestionFlagged(currentQuestionIndex)"
              [isPaused]="attempt.status === 'paused' || isTimeUp"
              (answerChanged)="onAnswerChanged($event)"
              (answerSubmitted)="onAnswerSubmitted($event)"
              (flagChanged)="onFlagChanged($event)">
            </app-question-view>

            <!-- Navigation Buttons -->
            <div class="question-navigation">
              <button mat-button (click)="previousQuestion()" 
                      [disabled]="!canGoPrevious() || attempt.status === 'paused' || isTimeUp"
                      class="nav-button previous-button">
                <mat-icon>chevron_left</mat-icon>
                <span *ngIf="currentQuestionIndex > 0">Previous Question</span>
                <span *ngIf="currentQuestionIndex === 0 && currentSectionIndex > 0">Previous Section</span>
                <span *ngIf="currentQuestionIndex === 0 && currentSectionIndex === 0">Previous</span>
              </button>
              
              <div class="nav-info">
                <span class="question-counter">
                  Question {{ currentQuestionIndex + 1 }} of {{ questions.length }}
                </span>
                <span class="section-counter" *ngIf="sections.length > 1">
                  Section {{ currentSectionIndex + 1 }} of {{ sections.length }}
                </span>
              </div>
              
              <button mat-raised-button color="primary" (click)="nextQuestion()" 
                      [disabled]="!canGoNext() || attempt.status === 'paused' || isTimeUp"
                      class="nav-button next-button">
                <span *ngIf="!isAtEndOfExam() && currentQuestionIndex < questions.length - 1">Next Question</span>
                <span *ngIf="!isAtEndOfExam() && currentQuestionIndex === questions.length - 1">Next Section</span>
                <span *ngIf="isAtEndOfExam()">Submit Exam</span>
                <mat-icon>chevron_right</mat-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ng-template #loading>
      <div class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Loading exam...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    /* Mobile-first base styles with branding */
    .exam-container {
      min-height: 100vh;
      background: linear-gradient(135deg, var(--anarchy-off-white) 0%, #E5E7EB 100%);
      position: relative;
      padding: 12px; /* Mobile-first: smaller padding */
      max-width: 1200px;
      margin: 0 auto;
    }

    .paused-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .time-up-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(244, 67, 54, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1001;
    }

    .time-up-content {
      background: white;
      padding: 32px;
      border-radius: 20px;
      text-align: center;
      max-width: 500px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .time-up-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #f44336;
      margin-bottom: 20px;
    }

    .time-up-content h2 {
      margin: 0 0 16px 0;
      color: #f44336;
      font-family: 'Playfair Display', serif;
      font-size: 2rem;
      font-weight: 600;
    }

    .time-up-content p {
      margin: 0 0 20px 0;
      color: #333;
      font-family: 'Inter', sans-serif;
      font-size: 16px;
      line-height: 1.5;
    }

    .time-up-warning {
      background-color: rgba(244, 67, 54, 0.1);
      border: 1px solid #f44336;
      border-radius: 8px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .time-up-warning mat-icon {
      color: #f44336;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .time-up-warning span {
      color: #f44336;
      font-weight: 500;
    }

    .paused-content {
      background: var(--glass-card); /* Branded glass effect */
      padding: 24px; /* Mobile-first: smaller padding */
      border-radius: 16px; /* Mobile-first: smaller radius */
      text-align: center;
      max-width: 90vw; /* Mobile-first: responsive width */
      box-shadow: var(--glass-shadow);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .paused-icon {
      font-size: 48px; /* Mobile-first: smaller icon */
      width: 48px;
      height: 48px;
      color: var(--anarchy-gold); /* Brand color */
      margin-bottom: 16px; /* Mobile-first: smaller margin */
    }

    .paused-content h2 {
      margin: 0 0 12px 0; /* Mobile-first: smaller margin */
      color: var(--anarchy-blue); /* Brand color */
      font-family: 'Playfair Display', serif;
      font-size: 1.5rem; /* Mobile-first: smaller font */
      font-weight: 600;
      line-height: 1.3;
    }

    .paused-content p {
      margin: 0 0 12px 0; /* Mobile-first: smaller margin */
      color: var(--anarchy-grey); /* Brand color */
      font-family: 'Inter', sans-serif;
      font-size: 14px; /* Mobile-first: smaller font */
      line-height: 1.4;
    }

    .paused-warning {
      background-color: rgba(255, 152, 0, 0.1); /* Branded warning */
      border: 1px solid var(--anarchy-gold);
      border-radius: 8px;
      padding: 12px; /* Mobile-first: smaller padding */
      margin: 16px 0; /* Mobile-first: smaller margin */
      display: flex;
      align-items: center;
      gap: 6px; /* Mobile-first: smaller gap */
    }

    .paused-warning mat-icon {
      color: var(--anarchy-gold); /* Brand color */
      font-size: 18px; /* Mobile-first: smaller icon */
      width: 18px;
      height: 18px;
    }

    .exam-header {
      background: var(--glass-card);
      padding: 16px; /* Mobile-first: smaller padding */
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: var(--glass-shadow);
      border-radius: 16px; /* Mobile-first: smaller radius */
      margin-bottom: 16px; /* Mobile-first: smaller margin */
      display: flex;
      flex-direction: column; /* Mobile-first: stacked layout */
      gap: 12px; /* Mobile-first: smaller gap */
    }

    .brand-section {
      display: flex;
      flex-direction: column; /* Mobile-first: stacked layout */
      align-items: center;
      gap: 12px; /* Mobile-first: smaller gap */
      text-align: center;
    }

    .exam-details h1 {
      margin: 0 0 6px 0; /* Mobile-first: smaller margin */
      font-family: 'Playfair Display', serif;
      font-size: 1.25rem; /* Mobile-first: smaller font */
      font-weight: 600;
      color: var(--anarchy-blue);
      line-height: 1.2;
    }

    .exam-details p {
      margin: 0;
      font-family: 'Inter', sans-serif;
      color: var(--anarchy-grey);
      font-size: 0.875rem; /* Mobile-first: smaller font */
      line-height: 1.3;
    }

    .exam-controls {
      display: flex;
      flex-direction: column; /* Mobile-first: stacked layout */
      align-items: center;
      gap: 12px; /* Mobile-first: smaller gap */
    }

    .timer-section {
      display: flex;
      align-items: center;
      gap: 8px; /* Mobile-first: smaller gap */
    }

    .action-buttons {
      display: flex;
      flex-direction: column; /* Mobile-first: stacked layout */
      gap: 8px; /* Mobile-first: smaller gap */
      width: 100%;
    }

    .action-buttons button {
      height: 44px; /* Mobile-first: smaller height */
      font-size: 13px; /* Mobile-first: smaller font */
      border-radius: 12px; /* Branded radius */
    }

    .progress-section {
      background: var(--glass-card);
      padding: 12px 16px; /* Mobile-first: smaller padding */
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }

    .progress-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px; /* Mobile-first: smaller margin */
      font-size: 12px; /* Mobile-first: smaller font */
      color: var(--anarchy-grey);
      font-family: 'Inter', sans-serif;
    }

    .exam-content {
      display: flex;
      flex-direction: column; /* Mobile-first: stacked layout */
      min-height: calc(100vh - 200px);
    }

    .exam-content.paused {
      pointer-events: none;
      opacity: 0.6;
    }

    .questions-container {
      display: flex;
      flex-direction: column; /* Mobile-first: stacked layout */
      gap: 16px;
      min-height: calc(100vh - 200px);
    }

    .navigation-sidebar {
      width: 100%; /* Mobile-first: full width */
      background: var(--glass-card);
      border-right: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      padding: 16px; /* Mobile-first: smaller padding */
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      order: 2; /* Show navigation after question on mobile */
    }

    .question-area {
      flex: 1;
      padding: 16px; /* Mobile-first: smaller padding */
      background: var(--glass-card);
      margin: 0; /* Mobile-first: no margin */
      border-radius: 16px; /* Branded radius */
      box-shadow: var(--glass-shadow);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      order: 1; /* Show question first on mobile */
    }

    .section-header {
      background: rgba(30, 58, 138, 0.1); /* Brand color background */
      padding: 12px; /* Mobile-first: smaller padding */
      border-radius: 12px; /* Branded radius */
      margin-bottom: 16px; /* Mobile-first: smaller margin */
      border-left: 4px solid var(--anarchy-blue);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }

    .section-info {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
    }

    .instructions-button {
      color: var(--anarchy-blue);
      border: 1px solid var(--anarchy-blue);
      border-radius: 8px;
      font-size: 12px;
      min-width: auto;
      padding: 6px 12px;
    }

    .instructions-button:hover {
      background-color: rgba(30, 58, 138, 0.1);
    }

    .section-chip {
      background-color: rgba(30, 58, 138, 0.1); /* Brand color background */
      color: var(--anarchy-blue);
      margin-bottom: 6px; /* Mobile-first: smaller margin */
      font-size: 12px; /* Mobile-first: smaller font */
    }

    .section-description {
      display: block;
      color: var(--anarchy-grey);
      font-size: 12px; /* Mobile-first: smaller font */
      margin-top: 6px; /* Mobile-first: smaller margin */
      line-height: 1.3;
    }

    .question-navigation {
      display: flex;
      flex-direction: column; /* Mobile-first: stacked layout */
      gap: 12px; /* Mobile-first: smaller gap */
      margin-top: 20px; /* Mobile-first: smaller margin */
      padding-top: 16px; /* Mobile-first: smaller padding */
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }

    .nav-button {
      width: 100%; /* Mobile-first: full width */
      height: 44px; /* Mobile-first: smaller height */
      font-size: 14px; /* Mobile-first: smaller font */
      border-radius: 12px; /* Branded radius */
      transition: all 0.3s ease;
    }

    .nav-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .nav-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      margin: 8px 0;
    }

    .question-counter, .section-counter {
      font-size: 12px;
      color: var(--anarchy-grey);
      font-weight: 500;
    }

    .section-counter {
      opacity: 0.8;
    }

    .section-progress {
      margin-top: 8px;
      width: 100%;
    }

    .progress-text {
      font-size: 11px;
      color: var(--anarchy-grey);
      display: block;
      margin-bottom: 4px;
    }

    .question-progress-bar {
      height: 4px;
      border-radius: 2px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }

    .loading-container p {
      margin-top: 12px; /* Mobile-first: smaller margin */
      color: var(--anarchy-grey);
      font-family: 'Inter', sans-serif;
      font-size: 13px; /* Mobile-first: smaller font */
    }

    /* Small mobile devices (320px and up) */
    @media (min-width: 320px) {
      .exam-details h1 {
        font-size: 1.375rem;
      }
      
      .paused-content h2 {
        font-size: 1.625rem;
      }
      
      .paused-content p {
        font-size: 15px;
      }
    }

    /* Medium mobile devices (480px and up) */
    @media (min-width: 480px) {
      .exam-container {
        padding: 16px;
      }

      .exam-header {
        padding: 20px;
        margin-bottom: 20px;
        border-radius: 20px;
      }

      .brand-section {
        flex-direction: row;
        text-align: left;
        gap: 16px;
      }

      .exam-details h1 {
        font-size: 1.5rem;
        margin: 0 0 8px 0;
      }

      .exam-details p {
        font-size: 0.9rem;
      }

      .exam-controls {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }

      .action-buttons {
        flex-direction: row;
        gap: 12px;
        width: auto;
      }

      .action-buttons button {
        height: 48px;
        font-size: 14px;
        min-width: 120px;
      }

      .progress-section {
        padding: 16px 20px;
      }

      .progress-info {
        font-size: 14px;
        margin-bottom: 8px;
      }

      .question-area {
        padding: 20px;
        margin: 20px;
        border-radius: 20px;
      }

      .navigation-sidebar {
        padding: 20px;
        border-radius: 20px;
      }

      .section-header {
        padding: 16px;
        margin-bottom: 20px;
        border-radius: 16px;
      }

      .section-chip {
        font-size: 14px;
        margin-bottom: 8px;
      }

      .section-description {
        font-size: 14px;
        margin-top: 8px;
      }

      .question-navigation {
        flex-direction: row;
        justify-content: space-between;
        gap: 12px;
        margin-top: 30px;
        padding-top: 20px;
      }

      .question-navigation {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
      }

      .nav-button {
        width: auto;
        min-width: 140px;
        height: 48px;
        font-size: 16px;
      }

      .nav-info {
        flex-direction: row;
        gap: 16px;
        margin: 0;
      }

      .question-counter, .section-counter {
        font-size: 14px;
      }

      .paused-content {
        padding: 32px;
        max-width: 500px;
        border-radius: 20px;
      }

      .paused-content h2 {
        font-size: 1.75rem;
        margin: 0 0 16px 0;
      }

      .paused-content p {
        font-size: 16px;
        margin: 0 0 16px 0;
      }

      .paused-icon {
        font-size: 56px;
        width: 56px;
        height: 56px;
        margin-bottom: 20px;
      }

      .paused-warning {
        padding: 16px;
        margin: 20px 0;
        gap: 8px;
      }

      .paused-warning mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    /* Landscape tablets and up (768px and up) */
    @media (min-width: 768px) {
      .exam-container {
        padding: 20px;
      }

      .exam-header {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 24px;
        margin-bottom: 30px;
      }

      .brand-section {
        gap: 20px;
      }

      .exam-details h1 {
        font-size: 1.75rem;
        margin: 0 0 8px 0;
      }

      .exam-details p {
        font-size: 1rem;
      }

      .exam-controls {
        flex-direction: row;
        gap: 20px;
      }

      .action-buttons {
        gap: 12px;
      }

      .questions-container {
        flex-direction: row;
        gap: 0;
        min-height: calc(100vh - 200px);
      }

      .navigation-sidebar {
        width: 300px;
        order: 1;
        border-right: 1px solid rgba(255, 255, 255, 0.2);
        border-bottom: none;
        padding: 24px;
        margin: 0;
      }

      .question-area {
        order: 2;
        margin: 0;
        padding: 24px;
        flex: 1;
      }

      .question-navigation {
        flex-direction: row;
        justify-content: space-between;
        margin-top: 30px;
        padding-top: 20px;
      }

      .nav-button {
        width: auto;
        min-width: 140px;
        height: 48px;
        font-size: 16px;
      }

      .nav-info {
        flex-direction: row;
        gap: 16px;
      }
    }

    /* Landscape orientation for tablets */
    @media (min-width: 768px) and (orientation: landscape) {
      .questions-container {
        flex-direction: row;
        gap: 0;
      }

      .navigation-sidebar {
        width: 280px;
        order: 1;
        border-right: 1px solid rgba(255, 255, 255, 0.2);
        border-bottom: none;
        padding: 20px;
        margin: 0;
      }

      .question-area {
        order: 2;
        margin: 0;
        padding: 20px;
        flex: 1;
      }
    }

    /* Large screens (1024px and up) */
    @media (min-width: 1024px) {
      .exam-details h1 {
        font-size: 2rem;
      }

      .exam-details p {
        font-size: 1.125rem;
      }

      .paused-content h2 {
        font-size: 2rem;
      }

      .paused-content p {
        font-size: 18px;
      }

      .paused-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
      }
    }

    /* Mobile Navigation Styles */
    .mobile-nav-fab {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      width: 56px;
      height: 56px;
      background: var(--brand-gradient);
      color: white;
      border-radius: 50%;
      box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
    }

    .mobile-nav-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 1001;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .mobile-nav-content {
      background: var(--glass-card);
      border-radius: 20px; /* Branded radius */
      width: 100%;
      max-width: 400px;
      max-height: 80vh;
      overflow: hidden;
      box-shadow: var(--glass-shadow);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .mobile-nav-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(30, 58, 138, 0.1); /* Brand color background */
    }

    .mobile-nav-header h3 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 500;
      color: var(--anarchy-blue);
      font-family: 'Playfair Display', serif;
    }

    .mobile-nav-header button {
      min-width: 44px;
      min-height: 44px;
      border-radius: 12px; /* Branded radius */
    }
  `]
})
export class ExamContainerComponent implements OnInit, OnDestroy {
  exam: Exam | null = null;
  attempt: ExamAttempt | null = null;
  questions: Question[] = [];
  sections: Section[] = [];
  currentQuestionIndex = 0;
  currentSectionIndex = 0;
  answeredQuestions = new Set<number>();
  draftedQuestions = new Set<number>();
  flaggedQuestions = new Set<number>();
  answers: Map<string, Answer> = new Map();
  
  // Exam flow states
  examFlowState: 'instructions' | 'section-instructions' | 'questions' | 'completed' = 'instructions';
  showExamInstructions = false;
  showSectionInstructions = false;
  
  private timeUpdateSubscription?: Subscription;
  private networkSubscription?: Subscription;
  private timerSyncSubscription?: Subscription;
  private isOnline = navigator.onLine;
  private wasPausedByNetwork = false;
  private resumeTime?: Date; // Track when exam was resumed
  private autoSaveTimeout: any;
  isSubmitting = false;
  isMobile = false;
  showMobileNav = false;
  
  // Anti-cheating properties
  private cheatingWarningSubscription?: Subscription;
  private autoSubmitSubscription?: Subscription;
  
  // Time management
  isTimeUp = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examService: ExamService,
    private attemptsService: AttemptsService,
    private answersService: AnswersService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private antiCheatingService: AntiCheatingService
  ) {}

  ngOnInit() {
    // Mobile detection
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
    
    // Network monitoring
    this.setupNetworkMonitoring();
    
    // Setup anti-cheating monitoring
    this.setupAntiCheatingMonitoring();
    
    const examId = this.route.snapshot.paramMap.get('id');
    const attemptId = this.route.snapshot.paramMap.get('attemptId');
    
    if (examId && attemptId) {
      this.loadExamData(examId, attemptId);
    } else if (examId) {
      this.startNewExam(examId);
    }
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  toggleMobileNav() {
    this.showMobileNav = !this.showMobileNav;
  }

  ngOnDestroy() {
    if (this.timeUpdateSubscription) {
      this.timeUpdateSubscription.unsubscribe();
    }
    if (this.networkSubscription) {
      this.networkSubscription.unsubscribe();
    }
    if (this.timerSyncSubscription) {
      this.timerSyncSubscription.unsubscribe();
    }
    if (this.cheatingWarningSubscription) {
      this.cheatingWarningSubscription.unsubscribe();
    }
    if (this.autoSubmitSubscription) {
      this.autoSubmitSubscription.unsubscribe();
    }
    
    // Stop anti-cheating monitoring
    this.antiCheatingService.stopMonitoring();
  }

  private loadExamData(examId: string, attemptId: string) {
    // Load exam first
    this.examService.getExam(examId).subscribe({
      next: (exam) => {
        this.exam = exam;
        this.sections = exam.sections || [];
        this.loadQuestions();
        
        // Set initial flow state based on whether exam has instructions
        if (exam.instructions) {
          this.examFlowState = 'instructions';
        } else if (this.sections.length > 0) {
          // Always start with section instructions if there are sections
          this.examFlowState = 'section-instructions';
          this.currentSectionIndex = 0;
        } else {
          this.examFlowState = 'questions';
        }
        
        // Load attempt after questions are loaded
        this.attemptsService.getAttempt(attemptId).subscribe({
          next: (attempt) => {
            this.attempt = attempt;
            this.loadExistingAnswers();
            this.startTimeTracking();
            this.startTimerSynchronization();
            
            // Start anti-cheating monitoring when exam is loaded
            this.antiCheatingService.startMonitoring(attempt.id);
          },
          error: (error) => {
            console.error('Error loading attempt:', error);
            this.snackBar.open('Error loading attempt', 'Close', { duration: 3000 });
          }
        });
      },
      error: (error) => {
        console.error('Error loading exam:', error);
        this.snackBar.open('Error loading exam', 'Close', { duration: 3000 });
      }
    });
  }

  private startNewExam(examId: string) {
    this.examService.getExam(examId).subscribe({
      next: (exam) => {
        this.exam = exam;
        this.sections = exam.sections || [];
        this.loadQuestions();
        
        // Set initial flow state based on whether exam has instructions
        if (exam.instructions) {
          this.examFlowState = 'instructions';
        } else if (this.sections.length > 0) {
          // Always start with section instructions if there are sections
          this.examFlowState = 'section-instructions';
          this.currentSectionIndex = 0;
        } else {
          this.examFlowState = 'questions';
        }
        
        this.createNewAttempt(examId);
      },
      error: (error) => {
        console.error('Error loading exam:', error);
        this.snackBar.open('Error loading exam', 'Close', { duration: 3000 });
      }
    });
  }

  private setupAntiCheatingMonitoring() {
    // Subscribe to cheating warnings
    this.cheatingWarningSubscription = this.antiCheatingService.warning$.subscribe(
      (warning: CheatingWarning | null) => {
        if (warning) {
          this.showCheatingWarningDialog(warning);
        }
      }
    );

    // Subscribe to auto-submit events
    this.autoSubmitSubscription = this.antiCheatingService.autoSubmit$.subscribe(
      (shouldAutoSubmit: boolean) => {
        if (shouldAutoSubmit) {
          this.handleAutoSubmit();
        }
      }
    );
  }

  private showCheatingWarningDialog(warning: CheatingWarning) {
    const dialogRef = this.dialog.open(CheatingWarningDialogComponent, {
      data: warning,
      disableClose: true, // Prevent closing by clicking outside
      width: '90vw',
      maxWidth: '500px',
      panelClass: 'cheating-warning-dialog'
    });

    dialogRef.afterClosed().subscribe((acknowledged: boolean) => {
      if (acknowledged) {
        this.antiCheatingService.acknowledgeWarning();
        this.snackBar.open(
          `Warning acknowledged. ${warning.remainingWarnings} warnings remaining.`,
          'Close',
          { duration: 3000 }
        );
      }
    });
  }

  private handleAutoSubmit() {
    this.snackBar.open(
      'Maximum warnings reached. Exam will be submitted automatically.',
      'Close',
      { duration: 5000, panelClass: ['error-snackbar'] }
    );
    
    // Auto-submit the exam
    this.submitExam();
  }

  private loadQuestions() {
    // Don't load all questions at once - load them per section
    // This method is called during exam initialization
    if (this.exam?.sections) {
      this.sections = this.exam.sections;
      // Load questions for the first section if we're in questions state
      if (this.examFlowState === 'questions') {
        this.loadSectionQuestions();
      }
    }
  }

  private createNewAttempt(examId: string) {
    // First, check if student already has an existing attempt for this exam
    this.attemptsService.getCurrentAttempt(examId).subscribe({
      next: (existingAttempt: ExamAttempt | null) => {
        if (existingAttempt) {
          if (existingAttempt.status === 'submitted') {
            // Student has already submitted this exam, prevent retaking
            this.snackBar.open('You have already submitted this exam and cannot retake it.', 'Close', { duration: 5000 });
            this.router.navigate(['/student/dashboard']);
            return;
          }
          // Load existing attempt (in_progress or paused)
          this.attempt = existingAttempt;
          this.loadExistingAnswers();
          this.startTimeTracking();
          
          // Start anti-cheating monitoring when resuming existing attempt
          this.antiCheatingService.startMonitoring(existingAttempt.id);
          
          this.snackBar.open('Resuming existing exam attempt', 'Close', { duration: 3000 });
        } else {
          // No existing attempt, create a new one
          this.createAttempt(examId);
        }
      },
      error: (error: any) => {
        console.error('Error checking for existing attempt:', error);
        // If there's an error checking, try to create a new attempt
        this.createAttempt(examId);
      }
    });
  }

  private createAttempt(examId: string) {
    const attemptData: CreateAttemptRequest = {
      examId: examId
    };

    this.attemptsService.createAttempt(attemptData).subscribe({
      next: (attempt) => {
        this.attempt = attempt;
        this.loadExistingAnswers();
        this.startTimeTracking();
        this.startTimerSynchronization();
        
        // Start anti-cheating monitoring when new attempt is created
        this.antiCheatingService.startMonitoring(attempt.id);
      },
      error: (error) => {
        console.error('Error creating attempt:', error);
        if (error.status === 400 && error.error?.message?.includes('already has an attempt')) {
          this.snackBar.open('You already have an attempt for this exam. Please refresh the page.', 'Close', { duration: 5000 });
        } else {
          this.snackBar.open('Error starting exam', 'Close', { duration: 3000 });
        }
      }
    });
  }


  private startTimeTracking() {
    // Wait a bit for the attempt to be fully loaded before starting time tracking
    setTimeout(() => {
      // Update time spent every second for real-time timer
      this.timeUpdateSubscription = interval(1000).subscribe(() => {
        if (this.attempt && this.attempt.status === 'in_progress') {
          this.updateTimeSpent();
        }
      });
    }, 1000); // Wait 1 second before starting time tracking
  }

  private updateTimeSpent() {
    if (this.attempt && this.attempt.status === 'in_progress') {
      let timeSpent = 0;
      
      if (this.attempt.startedAt) {
        const now = new Date();
        
        if (this.resumeTime) {
          // Exam was resumed - calculate time from resume point
          const sessionTimeSpent = Math.floor((now.getTime() - this.resumeTime.getTime()) / 1000);
          const previouslySpentTime = this.attempt.timeSpent || 0;
          timeSpent = previouslySpentTime + sessionTimeSpent;
          
          console.log('Updating time spent (resumed):', {
            sessionTimeSpent,
            previouslySpentTime,
            totalTimeSpent: timeSpent,
            resumeTime: this.resumeTime,
            now: now
          });
        } else {
          // Fresh exam start - calculate from original start time
          const startTime = new Date(this.attempt.startedAt);
          timeSpent = Math.floor((now.getTime() - startTime.getTime()) / 1000);
          
          console.log('Updating time spent (fresh):', {
            timeSpent,
            startTime: startTime,
            now: now
          });
        }
      }
      
      // Update local timeSpent for real-time display
      this.attempt.timeSpent = timeSpent;
      
      // Only update backend every 30 seconds to avoid too many API calls
      if (timeSpent % 30 === 0) {
        this.attemptsService.updateAttempt(this.attempt.id, { timeSpent }).subscribe({
          next: (updatedAttempt) => {
            // Keep local timeSpent as it's more accurate for real-time display
            this.attempt!.timeSpent = timeSpent;
          },
          error: (error) => {
            console.error('Error updating time spent:', error);
          }
        });
      }
    }
  }

  get currentQuestion(): Question | null {
    return this.questions[this.currentQuestionIndex] || null;
  }

  get totalQuestions(): number {
    return this.questions.length;
  }


  getProgressPercentage(): number {
    if (this.totalQuestions === 0) return 0;
    return Math.round(((this.currentQuestionIndex + 1) / this.totalQuestions) * 100);
  }

  onQuestionSelected(index: number) {
    this.currentQuestionIndex = index;
    // The answer will be automatically loaded through the getCurrentAnswer() method
    // which is called in the template binding
  }



  private getTimeSpent(): number {
    if (!this.attempt || !this.attempt.startedAt) return 0;
    
    const now = new Date().getTime();
    const startTime = new Date(this.attempt.startedAt).getTime();
    return Math.floor((now - startTime) / 1000); // Return seconds
  }

  private autoSave() {
    // Debounce auto-save to avoid too many API calls
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }
    
    this.autoSaveTimeout = setTimeout(() => {
      if (this.attempt) {
        // Call API to save attempt progress
        this.attemptsService.updateAttempt(this.attempt.id, {
          questionsAnswered: this.attempt.questionsAnswered,
          timeSpent: this.getTimeSpent()
        }).subscribe({
          next: () => {
            // Successfully saved
          },
          error: (error: any) => {
            console.error('Error auto-saving:', error);
          }
        });
      }
    }, 2000); // Auto-save after 2 seconds of inactivity
  }


  onTimeUp() {
    console.log('Time up! Auto-submitting exam...');
    this.isTimeUp = true;
    this.autoSubmitExam();
  }

  pauseExam() {
    if (this.attempt) {
      // Clear resume time when pausing
      this.resumeTime = undefined;
      
      // If offline, just update local state
      if (!this.isOnline) {
        this.attempt.status = 'paused';
        this.snackBar.open('Exam paused (offline)', 'Close', { duration: 3000 });
        return;
      }

      this.attemptsService.pauseAttempt(this.attempt.id).subscribe({
        next: () => {
          this.attempt!.status = 'paused';
          this.snackBar.open('Exam paused', 'Close', { duration: 3000 });
        },
        error: (error: any) => {
          console.error('Error pausing exam:', error);
          // If network error, still pause locally
          this.attempt!.status = 'paused';
          this.snackBar.open('Exam paused (offline)', 'Close', { duration: 3000 });
        }
      });
    }
  }

  resumeExam() {
    if (this.attempt) {
      // Set resume time for proper time tracking
      this.resumeTime = new Date();
      
      console.log('Resuming exam:', {
        attemptId: this.attempt.id,
        currentTimeSpent: this.attempt.timeSpent,
        resumeTime: this.resumeTime
      });
      
      // If offline, just update local state
      if (!this.isOnline) {
        this.attempt.status = 'in_progress';
        this.snackBar.open('Exam resumed (offline)', 'Close', { duration: 3000 });
        return;
      }

      this.attemptsService.resumeAttempt(this.attempt.id).subscribe({
        next: () => {
          this.attempt!.status = 'in_progress';
          this.snackBar.open('Exam resumed', 'Close', { duration: 3000 });
        },
        error: (error: any) => {
          console.error('Error resuming exam:', error);
          // If network error, still resume locally
          this.attempt!.status = 'in_progress';
          this.snackBar.open('Exam resumed (offline)', 'Close', { duration: 3000 });
        }
      });
    }
  }

  autoSubmitExam() {
    if (!this.attempt) return;

    console.log('Auto-submitting exam due to time expiry...');
    this.isSubmitting = true;
    
    // Disable all exam interactions immediately
    this.examFlowState = 'completed';
    
    this.attemptsService.submitAttempt(this.attempt.id).subscribe({
      next: () => {
        this.attempt!.status = 'submitted';
        this.snackBar.open('Exam automatically submitted - time expired', 'Close', { 
          duration: 5000,
          panelClass: ['warning-snackbar']
        });
        this.router.navigate(['/student/dashboard']);
      },
      error: (error: any) => {
        console.error('Error auto-submitting exam:', error);
        this.isSubmitting = false;
        this.snackBar.open('Error submitting exam. Please try again.', 'Close', { 
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  submitExam() {
    if (!this.attempt) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Submit Exam',
        message: 'Are you sure you want to submit your exam? This action cannot be undone.',
        confirmText: 'Submit',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.isSubmitting = true;
        this.attemptsService.submitAttempt(this.attempt!.id).subscribe({
          next: () => {
            this.attempt!.status = 'submitted';
            this.snackBar.open('Exam submitted successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/student/dashboard']);
          },
          error: (error: any) => {
            console.error('Error submitting exam:', error);
            this.snackBar.open('Error submitting exam', 'Close', { duration: 3000 });
            this.isSubmitting = false;
          }
        });
      }
    });
  }

  // Flag management
  isQuestionFlagged(questionIndex: number): boolean {
    return this.flaggedQuestions.has(questionIndex);
  }

  onFlagChanged(isFlagged: boolean) {
    if (this.currentQuestion) {
      if (isFlagged) {
        this.flaggedQuestions.add(this.currentQuestionIndex);
      } else {
        this.flaggedQuestions.delete(this.currentQuestionIndex);
      }
    }
  }

  // Answer persistence
  private saveAnswerToBackend(question: Question, answer: any) {
    if (!this.attempt) return;

    const existingAnswer = this.answers.get(question.id);
    
    if (existingAnswer) {
      // Update existing answer
      this.answersService.updateAnswer(existingAnswer.id, {
        answerText: answer,
        selectedOptions: Array.isArray(answer) ? answer : undefined
      }).subscribe({
        next: (updatedAnswer) => {
          this.answers.set(question.id, updatedAnswer);
        },
        error: (error) => {
          console.error('Error updating answer:', error);
        }
      });
    } else {
      // Create new answer
      this.answersService.createAnswer({
        questionId: question.id,
        attemptId: this.attempt.id,
        answerText: answer,
        selectedOptions: Array.isArray(answer) ? answer : undefined
      }).subscribe({
        next: (newAnswer) => {
          this.answers.set(question.id, newAnswer);
          this.answeredQuestions.add(this.currentQuestionIndex);
        },
        error: (error) => {
          console.error('Error creating answer:', error);
        }
      });
    }
  }

  private loadExistingAnswers() {
    if (!this.attempt) return;

    this.answersService.getAnswersByAttempt(this.attempt.id).subscribe({
      next: (answers) => {
        this.answers.clear();
        this.answeredQuestions.clear();
        this.draftedQuestions.clear();
        
        answers.forEach(answer => {
          this.answers.set(answer.questionId, answer);
          
          // Find question index and mark as answered
          const questionIndex = this.questions.findIndex(q => q.id === answer.questionId);
          if (questionIndex !== -1) {
            this.answeredQuestions.add(questionIndex);
          }
        });
        
      },
      error: (error) => {
        console.error('Error loading answers:', error);
      }
    });
  }

  // Handle answer changes (auto-save for draft)
  onAnswerChanged(answer: any) {
    if (this.attempt && this.currentQuestion) {
      // Mark as drafted if there's content
      if (answer && answer.toString().trim() !== '') {
        this.draftedQuestions.add(this.currentQuestionIndex);
      } else {
        this.draftedQuestions.delete(this.currentQuestionIndex);
      }
    }
  }

  // Handle explicit answer submission
  onAnswerSubmitted(answer: any) {
    if (this.attempt && this.currentQuestion) {
      // Update local state
      this.answeredQuestions.add(this.currentQuestionIndex);
      this.draftedQuestions.delete(this.currentQuestionIndex); // Remove from drafted since it's now answered
      
      // Save to backend
      this.saveAnswerToBackend(this.currentQuestion, answer);
      
      // Show success message
      this.snackBar.open('Answer saved successfully!', 'Close', { duration: 2000 });
    }
  }

  // Updated getCurrentAnswer method
  getCurrentAnswer(): any {
    if (this.currentQuestion) {
      const answer = this.answers.get(this.currentQuestion.id);
      if (answer) {
        // Return the appropriate answer format based on question type
        if (this.currentQuestion.type === 'multiple_choice' || this.currentQuestion.type === 'true_false') {
          return answer.answerText || '';
        } else {
          return answer.answerText || '';
        }
      }
    }
    return '';
  }

  // Network monitoring and timer synchronization methods
  private setupNetworkMonitoring() {
    // Monitor online/offline events
    const online$ = fromEvent(window, 'online').pipe(map(() => true));
    const offline$ = fromEvent(window, 'offline').pipe(map(() => false));
    
    this.networkSubscription = merge(online$, offline$)
      .pipe(debounceTime(1000)) // Debounce to avoid rapid state changes
      .subscribe(isOnline => {
        this.isOnline = isOnline;
        this.handleNetworkChange(isOnline);
      });
  }

  private handleNetworkChange(isOnline: boolean) {
    if (!this.attempt) return;

    if (!isOnline && this.attempt.status === 'in_progress') {
      // Network went offline - pause exam
      this.wasPausedByNetwork = true;
      this.pauseExam();
      this.snackBar.open('Network disconnected. Exam paused automatically.', 'Close', { 
        duration: 5000,
        panelClass: ['warning-snackbar']
      });
    } else if (isOnline && this.wasPausedByNetwork && this.attempt.status === 'paused') {
      // Network came back online - resume exam
      this.wasPausedByNetwork = false;
      this.resumeExam();
      this.snackBar.open('Network reconnected. Exam resumed automatically.', 'Close', { 
        duration: 5000,
        panelClass: ['success-snackbar']
      });
    }
  }

  private startTimerSynchronization() {
    if (!this.attempt) return;

    // Sync timer with backend every 30 seconds
    this.timerSyncSubscription = interval(30000).subscribe(() => {
      if (this.isOnline && this.attempt && this.attempt.status === 'in_progress') {
        this.syncTimerWithBackend();
      }
    });

    // Initial sync
    this.syncTimerWithBackend();
  }

  private syncTimerWithBackend() {
    if (!this.attempt) return;

    this.attemptsService.getAttempt(this.attempt.id).subscribe({
      next: (updatedAttempt) => {
        if (updatedAttempt.endTime !== this.attempt!.endTime) {
          this.attempt!.endTime = updatedAttempt.endTime;
          this.snackBar.open('Timer synchronized with server', 'Close', { 
            duration: 2000,
            panelClass: ['info-snackbar']
          });
        }
      },
      error: (error) => {
        console.error('Error syncing timer:', error);
        // Don't show error to user for timer sync failures
      }
    });
  }

  // Exam flow methods
  onStartExam() {
    this.examFlowState = 'section-instructions';
    this.currentSectionIndex = 0;
  }

  onStartSection() {
    this.examFlowState = 'questions';
    this.loadSectionQuestions();
  }

  onBackToPreviousSection() {
    if (this.currentSectionIndex > 0) {
      this.currentSectionIndex--;
      // Stay in section-instructions state to show previous section
    }
  }

  onViewSectionInstructions() {
    this.examFlowState = 'section-instructions';
  }

  getNextButtonText(): string {
    if (this.isAtEndOfExam()) {
      return 'Submit Exam';
    }
    
    // Check if we're at the last question of current section but not the last section
    if (this.currentQuestionIndex === this.questions.length - 1 && 
        this.currentSectionIndex < this.sections.length - 1) {
      return 'Next Section';
    }
    
    return 'Next';
  }

  isAtEndOfExam(): boolean {
    // Check if we're at the last question of the last section
    // Also ensure we have questions loaded
    if (this.questions.length === 0) {
      return false; // Can't be at end if no questions loaded
    }
    
    const isAtLastQuestion = this.currentQuestionIndex === this.questions.length - 1;
    const isAtLastSection = this.currentSectionIndex === this.sections.length - 1;
    
    return isAtLastQuestion && isAtLastSection;
  }

  canGoPrevious(): boolean {
    // Can go previous if:
    // 1. Not at the first question of the first section, OR
    // 2. There are previous sections to go back to
    if (this.currentQuestionIndex > 0) {
      return true; // Can go to previous question in current section
    }
    
    // Check if we can go to previous section
    if (this.currentSectionIndex > 0) {
      return true; // Can go to previous section
    }
    
    return false; // At the very beginning
  }

  canGoNext(): boolean {
    // Can always go next - either to next question, next section, or submit exam
    // The button text will indicate what action will be taken
    return true;
  }

  getCurrentSection(): Section | null {
    if (this.sections && this.sections.length > 0) {
      return this.sections[this.currentSectionIndex] || null;
    }
    return null;
  }

  private loadSectionQuestions() {
    const currentSection = this.getCurrentSection();
    if (currentSection && currentSection.questions) {
      // Load questions for the current section and add section reference
      this.questions = currentSection.questions.map(q => ({
        ...q,
        section: currentSection
      }));
      this.currentQuestionIndex = 0;
      
    } else {
      this.questions = [];
      this.currentQuestionIndex = 0;
    }
  }

  // Override nextQuestion to handle section transitions
  nextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      // Move to next question in current section
      this.currentQuestionIndex++;
    } else {
      // End of current section - check if there are more sections
      if (this.currentSectionIndex < this.sections.length - 1) {
        // Move to next section
        this.currentSectionIndex++;
        this.examFlowState = 'section-instructions';
      } else {
        // End of exam - all sections completed
        this.submitExam();
      }
    }
  }

  // Override previousQuestion to handle section transitions
  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      // Move to previous question in current section
      this.currentQuestionIndex--;
    } else {
      // Beginning of current section - check if we can go to previous section
      if (this.currentSectionIndex > 0) {
        // Move to previous section
        this.currentSectionIndex--;
        this.examFlowState = 'section-instructions';
        this.loadSectionQuestions();
        this.currentQuestionIndex = this.questions.length - 1;
      }
    }
  }

  // Get current section progress information
  getSectionProgress(): { current: number; total: number; percentage: number } {
    const current = this.currentSectionIndex + 1;
    const total = this.sections.length;
    const percentage = Math.round((current / total) * 100);
    return { current, total, percentage };
  }

  // Get current question progress within section
  getQuestionProgress(): { current: number; total: number; percentage: number } {
    const current = this.currentQuestionIndex + 1;
    const total = this.questions.length;
    const percentage = Math.round((current / total) * 100);
    return { current, total, percentage };
  }
}
