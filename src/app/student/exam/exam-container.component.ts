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
import { ExamService } from '../../core/services/exam.service';
import { AttemptsService } from '../../core/services/attempts.service';
import { AnswersService } from '../../core/services/answers.service';
import { Exam, Question, Section } from '../../models/exam.model';
import { ExamAttempt, CreateAttemptRequest } from '../../models/attempt.model';
import { Answer } from '../../models/answer.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
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
    QuestionViewComponent
  ],
  template: `
    <div class="exam-container" *ngIf="exam && attempt; else loading">
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
          <h1>{{ exam.title }}</h1>
          <p>{{ exam.description }}</p>
        </div>
        <div class="exam-controls">
          <div class="timer-section">
            <app-countdown-display 
              [endTime]="attempt.endTime"
              (timeUp)="onTimeUp()">
            </app-countdown-display>
          </div>
          <div class="action-buttons">
            <button mat-button (click)="pauseExam()" *ngIf="attempt.status === 'in_progress'">
              <mat-icon>pause</mat-icon>
              Pause
            </button>
            <button mat-button (click)="resumeExam()" *ngIf="attempt.status === 'paused'">
              <mat-icon>play_arrow</mat-icon>
              Resume
            </button>
            <button mat-raised-button color="warn" (click)="submitExam()" 
                    [disabled]="attempt.status === 'paused'">
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
          <!-- Section Header -->
          <div class="section-header" *ngIf="currentQuestion?.section">
            <mat-chip class="section-chip">
              <mat-icon>folder</mat-icon>
              {{ currentQuestion?.section?.title }}
            </mat-chip>
            <span class="section-description" *ngIf="currentQuestion?.section?.description">
              {{ currentQuestion?.section?.description }}
            </span>
          </div>

          <app-question-view
            [question]="currentQuestion"
            [questionIndex]="currentQuestionIndex"
            [answer]="getCurrentAnswer()"
            [isFlagged]="isQuestionFlagged(currentQuestionIndex)"
            [isPaused]="attempt.status === 'paused'"
            (answerChanged)="onAnswerChanged($event)"
            (answerSubmitted)="onAnswerSubmitted($event)"
            (flagChanged)="onFlagChanged($event)">
          </app-question-view>

          <!-- Navigation Buttons -->
          <div class="question-navigation">
            <button mat-button (click)="previousQuestion()" 
                    [disabled]="currentQuestionIndex === 0 || attempt.status === 'paused'">
              <mat-icon>chevron_left</mat-icon>
              Previous
            </button>
            <button mat-raised-button color="primary" (click)="nextQuestion()" 
                    [disabled]="currentQuestionIndex === totalQuestions - 1 || attempt.status === 'paused'">
              Next
              <mat-icon>chevron_right</mat-icon>
            </button>
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
    .exam-container {
      min-height: 100vh;
      background-color: #f5f5f5;
      position: relative;
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

    .paused-content {
      background: white;
      padding: 40px;
      border-radius: 12px;
      text-align: center;
      max-width: 500px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .paused-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ff9800;
      margin-bottom: 20px;
    }

    .paused-content h2 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 28px;
    }

    .paused-content p {
      margin: 0 0 16px 0;
      color: #666;
      font-size: 16px;
      line-height: 1.5;
    }

    .paused-warning {
      background-color: #fff3e0;
      border: 1px solid #ff9800;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .paused-warning mat-icon {
      color: #ff9800;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .exam-header {
      background: white;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .exam-info h1 {
      margin: 0 0 8px 0;
      color: #1976d2;
    }

    .exam-info p {
      margin: 0;
      color: #666;
    }

    .exam-controls {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .timer-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
    }

    .progress-section {
      background: white;
      padding: 16px 20px;
      border-bottom: 1px solid #e0e0e0;
    }

    .progress-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
      color: #666;
    }

    .exam-content {
      display: flex;
      min-height: calc(100vh - 200px);
    }

    .exam-content.paused {
      pointer-events: none;
      opacity: 0.6;
    }

    .navigation-sidebar {
      width: 300px;
      background: white;
      border-right: 1px solid #e0e0e0;
      padding: 20px;
    }

    .question-area {
      flex: 1;
      padding: 20px;
      background: white;
      margin: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .section-header {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      border-left: 4px solid #1976d2;
    }

    .section-chip {
      background-color: #e3f2fd;
      color: #1976d2;
      margin-bottom: 8px;
    }

    .section-description {
      display: block;
      color: #666;
      font-size: 14px;
      margin-top: 8px;
    }

    .question-navigation {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }

    .loading-container p {
      margin-top: 16px;
      color: #666;
    }

    /* Mobile-First Responsive Design */
    @media (max-width: 768px) {
      .exam-container {
        padding: 0;
      }

      .exam-header {
        flex-direction: column;
        align-items: stretch;
        padding: 16px;
        gap: 16px;
      }

      .exam-info h1 {
        font-size: 1.25rem;
        margin-bottom: 4px;
      }

      .exam-info p {
        font-size: 0.875rem;
      }

      .exam-controls {
        flex-direction: column;
        gap: 12px;
      }

      .timer-section {
        justify-content: center;
      }

      .action-buttons {
        justify-content: center;
        flex-wrap: wrap;
      }

      .action-buttons button {
        flex: 1;
        min-width: 120px;
      }

      .progress-section {
        padding: 12px 16px;
      }

      .progress-info {
        font-size: 12px;
      }

      .exam-content {
        flex-direction: column;
        min-height: auto;
      }

      .navigation-sidebar {
        width: 100%;
        border-right: none;
        border-bottom: 1px solid #e0e0e0;
        padding: 16px;
        order: 2; /* Show navigation after question on mobile */
      }

      .question-area {
        flex: 1;
        padding: 16px;
        margin: 0;
        border-radius: 0;
        order: 1; /* Show question first on mobile */
      }

      .section-header {
        padding: 12px;
        margin-bottom: 16px;
      }

      .section-chip {
        font-size: 0.75rem;
      }

      .section-description {
        font-size: 0.75rem;
      }

      .question-navigation {
        flex-direction: column;
        gap: 12px;
        margin-top: 20px;
        padding-top: 16px;
      }

      .question-navigation button {
        width: 100%;
        height: 48px;
        font-size: 16px;
      }

      .paused-content {
        margin: 16px;
        padding: 24px 16px;
        max-width: calc(100vw - 32px);
      }

      .paused-content h2 {
        font-size: 1.5rem;
      }

      .paused-content p {
        font-size: 14px;
      }

      .paused-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
      }
    }

    /* Small mobile devices */
    @media (max-width: 480px) {
      .exam-header {
        padding: 12px;
      }

      .exam-info h1 {
        font-size: 1.125rem;
      }

      .action-buttons button {
        min-width: 100px;
        font-size: 14px;
      }

      .question-area {
        padding: 12px;
      }

      .navigation-sidebar {
        padding: 12px;
      }

      .paused-content {
        margin: 12px;
        padding: 20px 12px;
      }
    }

    /* Tablet and up */
    @media (min-width: 769px) {
      .exam-content {
        flex-direction: row;
      }

      .navigation-sidebar {
        width: 300px;
        order: 1;
      }

      .question-area {
        order: 2;
        margin: 20px;
      }

      .question-navigation {
        flex-direction: row;
        justify-content: space-between;
      }

      .question-navigation button {
        width: auto;
        min-width: 120px;
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
      background: white;
      border-radius: 12px;
      width: 100%;
      max-width: 400px;
      max-height: 80vh;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .mobile-nav-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid #e0e0e0;
      background-color: #f5f5f5;
    }

    .mobile-nav-header h3 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 500;
      color: #333;
    }

    .mobile-nav-header button {
      min-width: 44px;
      min-height: 44px;
    }
  `]
})
export class ExamContainerComponent implements OnInit, OnDestroy {
  exam: Exam | null = null;
  attempt: ExamAttempt | null = null;
  questions: Question[] = [];
  currentQuestionIndex = 0;
  answeredQuestions = new Set<number>();
  draftedQuestions = new Set<number>();
  flaggedQuestions = new Set<number>();
  answers: Map<string, Answer> = new Map();
  private timeUpdateSubscription?: Subscription;
  private networkSubscription?: Subscription;
  private timerSyncSubscription?: Subscription;
  private isOnline = navigator.onLine;
  private wasPausedByNetwork = false;
  private autoSaveTimeout: any;
  isSubmitting = false;
  isMobile = false;
  showMobileNav = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examService: ExamService,
    private attemptsService: AttemptsService,
    private answersService: AnswersService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    // Mobile detection
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
    
    // Network monitoring
    this.setupNetworkMonitoring();
    
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
  }

  private loadExamData(examId: string, attemptId: string) {
    // Load exam first
    this.examService.getExam(examId).subscribe({
      next: (exam) => {
        this.exam = exam;
        this.loadQuestions();
        
        // Load attempt after questions are loaded
        this.attemptsService.getAttempt(attemptId).subscribe({
          next: (attempt) => {
            this.attempt = attempt;
            this.loadExistingAnswers();
            this.startTimeTracking();
            this.startTimerSynchronization();
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
        this.loadQuestions();
        this.createNewAttempt(examId);
      },
      error: (error) => {
        console.error('Error loading exam:', error);
        this.snackBar.open('Error loading exam', 'Close', { duration: 3000 });
      }
    });
  }

  private loadQuestions() {
    if (this.exam?.sections) {
      this.questions = [];
      this.exam.sections.forEach(section => {
        if (section.questions) {
          // Add section reference to each question
          const questionsWithSection = section.questions.map(q => ({
            ...q,
            section: section
          }));
          this.questions.push(...questionsWithSection);
        }
      });
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
      // Update time spent every minute
      this.timeUpdateSubscription = interval(60000).subscribe(() => {
        if (this.attempt && this.attempt.status === 'in_progress') {
          this.updateTimeSpent();
        }
      });
    }, 1000); // Wait 1 second before starting time tracking
  }

  private updateTimeSpent() {
    if (this.attempt && this.attempt.startedAt && this.attempt.status === 'in_progress') {
      const now = new Date();
      const startTime = new Date(this.attempt.startedAt);
      const timeSpent = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      
      // Only update if timeSpent is a valid positive number and different from current timeSpent
      if (timeSpent >= 0 && !isNaN(timeSpent) && timeSpent !== this.attempt.timeSpent) {
        this.attemptsService.updateAttempt(this.attempt.id, { timeSpent }).subscribe({
          next: (updatedAttempt) => {
            this.attempt = updatedAttempt;
          },
          error: (error) => {
            console.error('Error updating time spent:', error);
            // Stop time tracking if there's an error to prevent continuous failures
            if (this.timeUpdateSubscription) {
              this.timeUpdateSubscription.unsubscribe();
            }
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

  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.totalQuestions - 1) {
      this.currentQuestionIndex++;
    }
  }

  onTimeUp() {
    this.submitExam();
  }

  pauseExam() {
    if (this.attempt) {
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
}
