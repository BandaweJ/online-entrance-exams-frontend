import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { ResultsService } from '../../core/services/results.service';
import { Result, ExamStats } from '../../models/result.model';

@Component({
  selector: 'app-results-screen',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTableModule,
    MatDividerModule
  ],
  template: `
    <div class="results-container" *ngIf="result; else loading">
      <!-- Results Header -->
      <div class="results-header">
        <div class="header-content">
          <h1>Exam Results</h1>
          <p>{{ result.exam?.title }} - {{ getExamYear(result.exam) }}</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="goToDashboard()">
            <mat-icon>dashboard</mat-icon>
            Back to Dashboard
          </button>
        </div>
      </div>

      <!-- Score Summary -->
      <div class="score-summary">
        <mat-card class="score-card">
          <mat-card-content>
            <div class="score-display">
              <div class="main-score">
                <h2>{{ result.score }}/{{ result.totalMarks }}</h2>
                <p>Your Score</p>
              </div>
              <div class="percentage">
                <h1>{{ result.percentage | number:'1.2-2' }}%</h1>
                <p>Percentage</p>
              </div>
              <div class="grade">
                <h1>{{ result.grade }}</h1>
                <p>Grade</p>
              </div>
            </div>
            <mat-divider></mat-divider>
            <div class="score-details">
              <div class="detail-item">
                <mat-icon>emoji_events</mat-icon>
                <div class="detail-content">
                  <h4>Rank</h4>
                  <p>{{ result.rank }} out of {{ result.totalStudents }} students</p>
                </div>
              </div>
              <div class="detail-item">
                <mat-icon [class]="result.isPassed ? 'passed' : 'failed'">
                  {{ result.isPassed ? 'check_circle' : 'cancel' }}
                </mat-icon>
                <div class="detail-content">
                  <h4>Status</h4>
                  <p>{{ result.isPassed ? 'Passed' : 'Failed' }}</p>
                </div>
              </div>
              <div class="detail-item">
                <mat-icon>schedule</mat-icon>
                <div class="detail-content">
                  <h4>Time Taken</h4>
                  <p>{{ formatTime(result.timeSpent) }}</p>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Detailed Results -->
      <div class="detailed-results">
        <mat-tab-group>
          <!-- Performance Overview Tab -->
          <mat-tab label="Performance Overview">
            <div class="tab-content">
              <div class="performance-grid" *ngIf="examStats">
                <mat-card class="stat-card">
                  <mat-card-content>
                    <div class="stat-content">
                      <mat-icon class="stat-icon">trending_up</mat-icon>
                      <div class="stat-info">
                        <h3>{{ examStats.averagePercentage | number:'1.2-2' }}%</h3>
                        <p>Class Average</p>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                  <mat-card-content>
                    <div class="stat-content">
                      <mat-icon class="stat-icon">emoji_events</mat-icon>
                      <div class="stat-info">
                        <h3>{{ examStats.highestScore }}</h3>
                        <p>Highest Score</p>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                  <mat-card-content>
                    <div class="stat-content">
                      <mat-icon class="stat-icon">people</mat-icon>
                      <div class="stat-info">
                        <h3>{{ examStats.totalStudents }}</h3>
                        <p>Total Students</p>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                  <mat-card-content>
                    <div class="stat-content">
                      <mat-icon class="stat-icon">assessment</mat-icon>
                      <div class="stat-info">
                        <h3>{{ examStats.passRate | number:'1.2-2' }}%</h3>
                        <p>Pass Rate</p>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>

              <div class="performance-comparison">
                <h3>Your Performance vs Class Average</h3>
                <div class="comparison-bar">
                  <div class="bar-section">
                    <span>Your Score</span>
                    <div class="bar">
                      <div class="bar-fill your-score" [style.width.%]="result.percentage"></div>
                    </div>
                    <span>{{ result.percentage | number:'1.2-2' }}%</span>
                  </div>
                  <div class="bar-section">
                    <span>Class Average</span>
                    <div class="bar">
                      <div class="bar-fill class-average" [style.width.%]="examStats?.averagePercentage || 0"></div>
                    </div>
                    <span>{{ examStats?.averagePercentage | number:'1.2-2' }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Question Review Tab -->
          <mat-tab label="Question Review">
            <div class="tab-content">
              <div class="question-review" *ngIf="hasQuestionResults(result); else noQuestions">
                <div class="review-summary">
                  <h3>Question-by-Question Review</h3>
                  <p>Review your answers and see the correct solutions</p>
                </div>

                <div class="questions-list">
                  <mat-card *ngFor="let questionResult of getQuestionResults(result); let i = index" class="question-card">
                    <mat-card-content>
                      <div class="question-header">
                        <div class="question-number">
                          <h4>Question {{ i + 1 }}</h4>
                          <mat-chip [class]="questionResult.isCorrect ? 'correct' : 'incorrect'">
                            {{ questionResult.isCorrect ? 'Correct' : 'Incorrect' }}
                          </mat-chip>
                        </div>
                        <div class="question-marks">
                          <span>{{ questionResult.marksObtained }}/{{ questionResult.totalMarks }} marks</span>
                        </div>
                      </div>

                      <div class="question-content">
                        <h5>{{ questionResult.questionText }}</h5>
                        <div class="answer-section">
                          <div class="answer-item">
                            <h6>Your Answer:</h6>
                            <p>{{ questionResult.studentAnswer || 'No answer provided' }}</p>
                          </div>
                          <div class="answer-item">
                            <h6>Correct Answer:</h6>
                            <p>{{ questionResult.correctAnswer }}</p>
                          </div>
                        </div>
                        <div class="explanation" *ngIf="questionResult.explanation">
                          <h6>Explanation:</h6>
                          <p>{{ questionResult.explanation }}</p>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                </div>
              </div>

              <ng-template #noQuestions>
                <div class="no-data">
                  <mat-icon>quiz</mat-icon>
                  <h3>No question details available</h3>
                  <p>Question-by-question review is not available for this exam.</p>
                </div>
              </ng-template>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>

    <ng-template #loading>
      <div class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Loading results...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .results-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e0e0e0;
    }

    .header-content h1 {
      margin: 0 0 8px 0;
      color: #1976d2;
    }

    .header-content p {
      margin: 0;
      color: #666;
    }

    .score-summary {
      margin-bottom: 30px;
    }

    .score-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .score-display {
      display: flex;
      justify-content: space-around;
      align-items: center;
      margin-bottom: 20px;
    }

    .main-score, .percentage, .grade {
      text-align: center;
    }

    .main-score h2, .percentage h1, .grade h1 {
      margin: 0 0 8px 0;
      font-size: 2.5rem;
      font-weight: bold;
    }

    .main-score p, .percentage p, .grade p {
      margin: 0;
      font-size: 1rem;
      opacity: 0.9;
    }

    .score-details {
      display: flex;
      justify-content: space-around;
      margin-top: 20px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .detail-item mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .detail-item mat-icon.passed {
      color: #4caf50;
    }

    .detail-item mat-icon.failed {
      color: #f44336;
    }

    .detail-content h4 {
      margin: 0 0 4px 0;
      font-size: 14px;
      opacity: 0.9;
    }

    .detail-content p {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }

    .detailed-results {
      margin-bottom: 30px;
    }

    .tab-content {
      padding: 20px 0;
    }

    .performance-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      transition: transform 0.2s ease-in-out;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #1976d2;
    }

    .stat-info h3 {
      margin: 0 0 4px 0;
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }

    .stat-info p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .performance-comparison {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
    }

    .performance-comparison h3 {
      margin: 0 0 20px 0;
      color: #333;
    }

    .bar-section {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 12px;
    }

    .bar-section span:first-child {
      min-width: 100px;
      font-weight: 500;
    }

    .bar-section span:last-child {
      min-width: 60px;
      text-align: right;
      font-weight: 500;
    }

    .bar {
      flex: 1;
      height: 20px;
      background-color: #e0e0e0;
      border-radius: 10px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      border-radius: 10px;
      transition: width 0.3s ease;
    }

    .bar-fill.your-score {
      background-color: #1976d2;
    }

    .bar-fill.class-average {
      background-color: #4caf50;
    }

    .question-review {
      margin-top: 20px;
    }

    .review-summary {
      margin-bottom: 20px;
    }

    .review-summary h3 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .review-summary p {
      margin: 0;
      color: #666;
    }

    .questions-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .question-card {
      border-left: 4px solid #e0e0e0;
    }

    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .question-number {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .question-number h4 {
      margin: 0;
      color: #333;
    }

    .question-marks {
      font-weight: 500;
      color: #666;
    }

    .question-content h5 {
      margin: 0 0 16px 0;
      color: #333;
      line-height: 1.5;
    }

    .answer-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 16px;
    }

    .answer-item h6 {
      margin: 0 0 8px 0;
      color: #666;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .answer-item p {
      margin: 0;
      padding: 8px 12px;
      background-color: #f5f5f5;
      border-radius: 4px;
      font-family: monospace;
    }

    .explanation {
      margin-top: 16px;
      padding: 16px;
      background-color: #e3f2fd;
      border-radius: 8px;
    }

    .explanation h6 {
      margin: 0 0 8px 0;
      color: #1976d2;
      font-size: 14px;
    }

    .explanation p {
      margin: 0;
      color: #333;
      line-height: 1.5;
    }

    .correct {
      background-color: #e8f5e8;
      color: #4caf50;
    }

    .incorrect {
      background-color: #ffebee;
      color: #f44336;
    }

    .no-data {
      text-align: center;
      padding: 40px;
    }

    .no-data mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .no-data h3 {
      margin: 0 0 8px 0;
      color: #666;
    }

    .no-data p {
      margin: 0;
      color: #999;
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

    @media (max-width: 768px) {
      .score-display {
        flex-direction: column;
        gap: 20px;
      }

      .score-details {
        flex-direction: column;
        gap: 16px;
      }

      .answer-section {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ResultsScreenComponent implements OnInit {
  result: Result | null = null;
  examStats: ExamStats | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private resultsService: ResultsService
  ) {}

  ngOnInit() {
    const resultId = this.route.snapshot.paramMap.get('id');
    if (resultId) {
      this.loadResult(resultId);
    }
  }

  private loadResult(resultId: string) {
    this.resultsService.getResult(resultId).subscribe({
      next: (result) => {
        this.result = result;
        if (result.examId) {
          this.loadExamStats(result.examId);
        }
      },
      error: (error) => {
        console.error('Error loading result:', error);
      }
    });
  }

  private loadExamStats(examId: string) {
    this.resultsService.getExamStats(examId).subscribe({
      next: (stats) => {
        this.examStats = stats;
      },
      error: (error) => {
        console.error('Error loading exam stats:', error);
      }
    });
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  }

  goToDashboard() {
    this.router.navigate(['/student/dashboard']);
  }

  getExamYear(exam: any): string {
    return exam?.year || 'N/A';
  }

  hasQuestionResults(result: any): boolean {
    return result?.questionResults && result.questionResults.length > 0;
  }

  getQuestionResults(result: any): any[] {
    return result?.questionResults || [];
  }
}
