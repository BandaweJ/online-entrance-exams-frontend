import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ExamService } from '../../core/services/exam.service';
import { Exam, Section, Question, QuestionType } from '../../models/exam.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { SectionDialogComponent } from '../../shared/components/section-dialog/section-dialog.component';
import { QuestionDialogComponent } from '../../shared/components/question-dialog/question-dialog.component';
import { SectionSelectionDialogComponent } from '../../shared/components/section-selection-dialog/section-selection-dialog.component';

@Component({
  selector: 'app-question-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTableModule,
    MatMenuModule,
    MatDialogModule
  ],
  template: `
    <div class="question-editor-container">
      <div class="editor-header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="header-info">
          <h1>{{ exam?.title }}</h1>
          <p>Manage questions and sections</p>
        </div>
        <button mat-raised-button color="primary" (click)="addQuestion()">
          <mat-icon>add</mat-icon>
          Add Question
        </button>
      </div>

      <mat-card *ngIf="!isLoading; else loading">
        <mat-tab-group>
          <!-- Sections Tab -->
          <mat-tab label="Sections">
            <div class="tab-content">
              <div class="sections-header">
                <h2>Sections</h2>
                <button mat-raised-button (click)="addSection()">
                  <mat-icon>add</mat-icon>
                  Add Section
                </button>
              </div>

              <div class="sections-list" *ngIf="sections.length > 0; else noSections">
                <mat-card *ngFor="let section of sections; let i = index" class="section-card">
                  <mat-card-content>
                    <div class="section-header">
                      <h3>{{ section.title }}</h3>
                      <button mat-icon-button [matMenuTriggerFor]="sectionMenu">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #sectionMenu="matMenu">
                        <button mat-menu-item (click)="editSection(section)">
                          <mat-icon>edit</mat-icon>
                          Edit
                        </button>
                        <button mat-menu-item (click)="deleteSection(section)" class="delete-action">
                          <mat-icon>delete</mat-icon>
                          Delete
                        </button>
                      </mat-menu>
                    </div>
                    <p class="section-description">{{ section.description }}</p>
                    <div class="section-stats">
                      <span>{{ section.questionCount }} questions</span>
                      <span>{{ section.totalMarks }} marks</span>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>

              <ng-template #noSections>
                <div class="no-data">
                  <mat-icon>folder_open</mat-icon>
                  <h3>No sections yet</h3>
                  <p>Create your first section to organize questions</p>
                  <button mat-raised-button color="primary" (click)="addSection()">
                    <mat-icon>add</mat-icon>
                    Add Section
                  </button>
                </div>
              </ng-template>
            </div>
          </mat-tab>

          <!-- Questions Tab -->
          <mat-tab label="All Questions">
            <div class="tab-content">
              <div class="questions-header">
                <h2>All Questions</h2>
                <div class="question-filters">
                  <mat-form-field appearance="outline">
                    <mat-label>Filter by Section</mat-label>
                    <mat-select [(value)]="selectedSectionFilter" (selectionChange)="onSectionFilterChange()">
                      <mat-option value="">All Sections</mat-option>
                      <mat-option *ngFor="let section of sections" [value]="section.id">
                        {{ section.title }}
                      </mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
              </div>

              <!-- Desktop Table View -->
              <div class="questions-table tablet-up" *ngIf="allQuestions.length > 0; else noQuestions">
                <table mat-table [dataSource]="filteredQuestions" class="questions-table">
                  <ng-container matColumnDef="question">
                    <th mat-header-cell *matHeaderCellDef>Question</th>
                    <td mat-cell *matCellDef="let question">
                      <div class="question-content">
                        <h4>{{ question.questionText | slice:0:100 }}{{ question.questionText.length > 100 ? '...' : '' }}</h4>
                        <p class="question-meta">
                          {{ question.section?.title }} • {{ question.type | titlecase }} • {{ question.marks }} marks
                        </p>
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="type">
                    <th mat-header-cell *matHeaderCellDef>Type</th>
                    <td mat-cell *matCellDef="let question">
                      <mat-chip>{{ question.type | titlecase }}</mat-chip>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="marks">
                    <th mat-header-cell *matHeaderCellDef>Marks</th>
                    <td mat-cell *matCellDef="let question">{{ question.marks }}</td>
                  </ng-container>

                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let question">
                      <button mat-icon-button [matMenuTriggerFor]="questionMenu">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #questionMenu="matMenu">
                        <button mat-menu-item (click)="editQuestion(question)">
                          <mat-icon>edit</mat-icon>
                          Edit
                        </button>
                        <button mat-menu-item (click)="duplicateQuestion(question)">
                          <mat-icon>content_copy</mat-icon>
                          Duplicate
                        </button>
                        <button mat-menu-item (click)="deleteQuestion(question)" class="delete-action">
                          <mat-icon>delete</mat-icon>
                          Delete
                        </button>
                      </mat-menu>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="questionColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: questionColumns;"></tr>
                </table>
              </div>

              <!-- Mobile Card View -->
              <div class="mobile-questions-list mobile-only" *ngIf="allQuestions.length > 0">
                <mat-card *ngFor="let question of filteredQuestions" class="question-card">
                  <mat-card-content>
                    <div class="question-card-header">
                      <div class="question-info">
                        <h4>{{ question.questionText | slice:0:80 }}{{ question.questionText.length > 80 ? '...' : '' }}</h4>
                        <p class="question-meta">
                          {{ question.section?.title }} • {{ question.type | titlecase }} • {{ question.marks }} marks
                        </p>
                      </div>
                      <button mat-icon-button [matMenuTriggerFor]="mobileQuestionMenu">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #mobileQuestionMenu="matMenu">
                        <button mat-menu-item (click)="editQuestion(question)">
                          <mat-icon>edit</mat-icon>
                          Edit
                        </button>
                        <button mat-menu-item (click)="duplicateQuestion(question)">
                          <mat-icon>content_copy</mat-icon>
                          Duplicate
                        </button>
                        <button mat-menu-item (click)="deleteQuestion(question)" class="delete-action">
                          <mat-icon>delete</mat-icon>
                          Delete
                        </button>
                      </mat-menu>
                    </div>
                    
                    <div class="question-details">
                      <div class="question-detail-row">
                        <span class="question-detail-label">Type:</span>
                        <mat-chip>{{ question.type | titlecase }}</mat-chip>
                      </div>
                      <div class="question-detail-row">
                        <span class="question-detail-label">Marks:</span>
                        <span>{{ question.marks }}</span>
                      </div>
                      <div class="question-detail-row">
                        <span class="question-detail-label">Section:</span>
                        <span>{{ question.section?.title || 'No section' }}</span>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>

              <ng-template #noQuestions>
                <div class="no-data">
                  <mat-icon>quiz</mat-icon>
                  <h3>No questions yet</h3>
                  <p>Add questions to your sections</p>
                  <button mat-raised-button color="primary" (click)="addQuestion()">
                    <mat-icon>add</mat-icon>
                    Add Question
                  </button>
                </div>
              </ng-template>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-card>

      <ng-template #loading>
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Loading exam data...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .question-editor-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .editor-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 30px;
    }

    .header-info h1 {
      margin: 0 0 4px 0;
      color: #1976d2;
    }

    .header-info p {
      margin: 0;
      color: #666;
    }

    .tab-content {
      padding: 20px 0;
    }

    .sections-header, .questions-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .sections-header h2, .questions-header h2 {
      margin: 0;
      color: #333;
    }

    .sections-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .section-card {
      transition: transform 0.2s ease-in-out;
    }

    .section-card:hover {
      transform: translateY(-2px);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .section-header h3 {
      margin: 0;
      font-size: 18px;
    }

    .section-description {
      margin: 0 0 12px 0;
      color: #666;
      font-size: 14px;
    }

    .section-stats {
      display: flex;
      gap: 16px;
      font-size: 14px;
      color: #666;
    }

    .question-filters {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .questions-table {
      width: 100%;
    }

    .question-content h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 500;
    }

    .question-meta {
      margin: 0;
      font-size: 12px;
      color: #666;
    }

    .delete-action {
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
      margin: 0 0 24px 0;
      color: #999;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }

    .loading-container p {
      margin-top: 16px;
      color: #666;
    }

    /* Mobile-specific styles */
    @media (max-width: 768px) {
      .question-editor-container {
        padding: 16px;
      }

      .editor-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
        margin-bottom: 20px;
      }

      .editor-header .header-info h1 {
        font-size: 1.25rem;
        text-align: center;
      }

      .editor-header button {
        width: 100%;
        height: 48px;
      }

      .sections-header, .questions-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .sections-header h2, .questions-header h2 {
        font-size: 1.125rem;
        text-align: center;
      }

      .sections-header button, .questions-header button {
        width: 100%;
        height: 48px;
      }

      .sections-list {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .section-card {
        margin: 0;
      }

      .section-header {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }

      .section-header h3 {
        font-size: 1rem;
        text-align: center;
      }

      .question-filters {
        flex-direction: column;
        align-items: stretch;
      }

      .question-filters mat-form-field {
        width: 100%;
      }

      .questions-table {
        display: none; /* Hide table on mobile */
      }

      /* Mobile questions list */
      .mobile-questions-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .question-card {
        margin: 0;
      }

      .question-card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12px;
      }

      .question-card-header .question-info h4 {
        margin: 0 0 4px 0;
        font-size: 1rem;
        font-weight: 500;
        color: #1976d2;
        line-height: 1.4;
      }

      .question-card-header .question-info .question-meta {
        margin: 0;
        font-size: 0.75rem;
        color: #666;
      }

      .question-details {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .question-detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 0;
      }

      .question-detail-label {
        font-weight: 500;
        color: #666;
        font-size: 0.875rem;
      }

      .question-detail-row span:last-child {
        color: #333;
        font-size: 0.875rem;
      }
    }

    /* Small mobile devices */
    @media (max-width: 480px) {
      .question-editor-container {
        padding: 12px;
      }

      .editor-header .header-info h1 {
        font-size: 1.125rem;
      }

      .sections-header h2, .questions-header h2 {
        font-size: 1rem;
      }

      .section-header h3 {
        font-size: 0.875rem;
      }

      .question-card-header .question-info h4 {
        font-size: 0.875rem;
      }

      .question-detail-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
      }

      .question-detail-label {
        font-size: 0.75rem;
      }

      .question-detail-row span:last-child {
        font-size: 0.875rem;
      }
    }
  `]
})
export class QuestionEditorComponent implements OnInit {
  exam: Exam | null = null;
  sections: Section[] = [];
  allQuestions: Question[] = [];
  filteredQuestions: Question[] = [];
  selectedSectionFilter = '';
  questionColumns: string[] = ['question', 'type', 'marks', 'actions'];
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examService: ExamService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    const examId = this.route.snapshot.paramMap.get('id');
    if (examId) {
      this.loadExamData(examId);
    }
  }

  private loadExamData(examId: string) {
    this.isLoading = true;
    this.examService.getExam(examId).subscribe({
      next: (exam) => {
        this.exam = exam;
        this.sections = exam.sections || [];
        this.loadAllQuestions();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading exam:', error);
        this.snackBar.open('Error loading exam', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  private loadSections() {
    if (this.exam?.id) {
      this.examService.getExam(this.exam.id).subscribe({
        next: (exam) => {
          this.sections = exam.sections || [];
        },
        error: (error) => {
          console.error('Error loading sections:', error);
        }
      });
    }
  }

  private loadAllQuestions() {
    this.allQuestions = [];
    this.sections.forEach(section => {
      if (section.questions) {
        this.allQuestions.push(...section.questions);
      }
    });
    this.applySectionFilter();
  }

  onSectionFilterChange() {
    this.applySectionFilter();
  }

  private applySectionFilter() {
    if (!this.selectedSectionFilter) {
      this.filteredQuestions = [...this.allQuestions];
    } else {
      this.filteredQuestions = this.allQuestions.filter(question => 
        question.sectionId === this.selectedSectionFilter
      );
    }
  }

  addSection() {
    const dialogRef = this.dialog.open(SectionDialogComponent, {
      data: {
        title: 'Add New Section',
        examId: this.exam?.id || ''
      },
      width: '500px',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.examService.createSection(this.exam?.id || '', result).subscribe({
          next: (section) => {
            this.sections.push(section);
            // Add a small delay to ensure backend recalculation completes
            setTimeout(() => {
              this.loadExamData(this.exam?.id || ''); // Refresh exam data to update statistics
            }, 500);
            this.snackBar.open('Section created successfully', 'Close', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error creating section:', error);
            this.snackBar.open('Error creating section', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  editSection(section: Section) {
    const dialogRef = this.dialog.open(SectionDialogComponent, {
      data: {
        title: 'Edit Section',
        section: section,
        examId: this.exam?.id || ''
      },
      width: '500px',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.examService.updateSection(this.exam?.id || '', section.id, result).subscribe({
          next: (updatedSection) => {
            const index = this.sections.findIndex(s => s.id === section.id);
            if (index !== -1) {
              this.sections[index] = updatedSection;
            }
            // Add a small delay to ensure backend recalculation completes
            setTimeout(() => {
              this.loadExamData(this.exam?.id || ''); // Refresh exam data to update statistics
            }, 500);
            this.snackBar.open('Section updated successfully', 'Close', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error updating section:', error);
            this.snackBar.open('Error updating section', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  deleteSection(section: Section) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Section',
        message: `Are you sure you want to delete "${section.title}"? This will also delete all questions in this section.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.examService.deleteSection(this.exam?.id || '', section.id).subscribe({
          next: () => {
            this.sections = this.sections.filter(s => s.id !== section.id);
            this.loadAllQuestions();
            // Add a small delay to ensure backend recalculation completes
            setTimeout(() => {
              this.loadExamData(this.exam?.id || ''); // Refresh exam data to update statistics
            }, 500);
            this.snackBar.open('Section deleted successfully', 'Close', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error deleting section:', error);
            this.snackBar.open('Error deleting section', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  addQuestion() {
    if (this.sections.length === 0) {
      this.snackBar.open('Please create a section first', 'Close', { duration: 3000 });
      return;
    }

    // Show section selection dialog first
    const sectionDialogRef = this.dialog.open(SectionSelectionDialogComponent, {
      data: {
        title: 'Select Section',
        sections: this.sections
      },
      width: '400px',
      maxWidth: '90vw'
    });

    sectionDialogRef.afterClosed().subscribe(selectedSection => {
      if (selectedSection) {
        const dialogRef = this.dialog.open(QuestionDialogComponent, {
          data: {
            title: 'Add New Question',
            sectionId: selectedSection.id,
            sectionTitle: selectedSection.title
          },
          width: '600px',
          maxWidth: '90vw'
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.examService.createQuestion(selectedSection.id, result).subscribe({
              next: (question) => {
                this.loadAllQuestions();
                this.loadSections(); // Refresh sections to update question counts
                // Add a small delay to ensure backend recalculation completes
                setTimeout(() => {
                  this.loadExamData(this.exam?.id || ''); // Refresh exam data to update statistics
                }, 500);
                this.snackBar.open('Question created successfully', 'Close', { duration: 3000 });
              },
              error: (error) => {
                console.error('Error creating question:', error);
                this.snackBar.open('Error creating question', 'Close', { duration: 3000 });
              }
            });
          }
        });
      }
    });
  }

  editQuestion(question: Question) {
    const section = this.sections.find(s => s.id === question.sectionId);
    const dialogRef = this.dialog.open(QuestionDialogComponent, {
      data: {
        title: 'Edit Question',
        question: question,
        sectionId: question.sectionId,
        sectionTitle: section?.title || 'Unknown Section'
      },
      width: '600px',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.examService.updateQuestion(question.sectionId, question.id, result).subscribe({
          next: (updatedQuestion) => {
            this.loadAllQuestions();
            this.loadSections(); // Refresh sections to update question counts
            // Add a small delay to ensure backend recalculation completes
            setTimeout(() => {
              this.loadExamData(this.exam?.id || ''); // Refresh exam data to update statistics
            }, 500);
            this.snackBar.open('Question updated successfully', 'Close', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error updating question:', error);
            this.snackBar.open('Error updating question', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  duplicateQuestion(question: Question) {
    this.examService.duplicateQuestion(question.id).subscribe({
      next: () => {
        this.loadAllQuestions();
        this.loadSections(); // Refresh sections to update question counts
        // Add a small delay to ensure backend recalculation completes
        setTimeout(() => {
          this.loadExamData(this.exam?.id || ''); // Refresh exam data to update statistics
        }, 500);
        this.snackBar.open('Question duplicated successfully', 'Close', { duration: 3000 });
      },
      error: (error: any) => {
        console.error('Error duplicating question:', error);
        this.snackBar.open('Error duplicating question', 'Close', { duration: 3000 });
      }
    });
  }

  deleteQuestion(question: Question) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Question',
        message: `Are you sure you want to delete this question?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.examService.deleteQuestion(question.sectionId, question.id).subscribe({
          next: () => {
            this.loadAllQuestions();
            this.loadSections(); // Refresh sections to update question counts
            // Add a small delay to ensure backend recalculation completes
            setTimeout(() => {
              this.loadExamData(this.exam?.id || ''); // Refresh exam data to update statistics
            }, 500);
            this.snackBar.open('Question deleted successfully', 'Close', { duration: 3000 });
          },
          error: (error: any) => {
            console.error('Error deleting question:', error);
            this.snackBar.open('Error deleting question', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin/exams']);
  }
}
