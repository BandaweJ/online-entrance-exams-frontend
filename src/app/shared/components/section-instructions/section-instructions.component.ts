import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-section-instructions',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule
  ],
  template: `
    <div class="section-instructions-container">
      <mat-card class="section-instructions-card">
        <mat-card-header>
          <div class="section-header">
            <div class="section-title">
              <mat-icon>assignment</mat-icon>
              <h2>{{ sectionTitle }}</h2>
            </div>
            <div class="section-meta">
              <mat-chip class="section-marks">{{ totalMarks }} marks</mat-chip>
              <mat-chip class="section-questions">{{ questionCount }} questions</mat-chip>
            </div>
          </div>
        </mat-card-header>
        
        <mat-card-content>
          <div class="section-description" *ngIf="sectionDescription">
            <p>{{ sectionDescription }}</p>
          </div>
          
          <div class="section-instructions" *ngIf="instructions">
            <h3>
              <mat-icon>info</mat-icon>
              Section Instructions
            </h3>
            <div class="instructions-content" [innerHTML]="instructions"></div>
          </div>
          
          <div class="no-instructions" *ngIf="!instructions">
            <p class="no-instructions-text">
              <mat-icon>info_outline</mat-icon>
              No specific instructions for this section. Please proceed with the questions.
            </p>
          </div>
        </mat-card-content>
        
        <mat-divider></mat-divider>
        
        <mat-card-actions class="section-actions">
          <button mat-button (click)="onBack()" *ngIf="showBackButton">
            <mat-icon>arrow_back</mat-icon>
            Back
          </button>
          <span class="spacer"></span>
          <button mat-raised-button color="primary" (click)="onStartSection()">
            <mat-icon>play_arrow</mat-icon>
            Start Section
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .section-instructions-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
    }

    .section-instructions-card {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .section-title h2 {
      margin: 0;
      color: #1976d2;
      font-size: 1.5rem;
      font-weight: 500;
    }

    .section-title mat-icon {
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
      color: #1976d2;
    }

    .section-meta {
      display: flex;
      gap: 8px;
    }

    .section-marks {
      background-color: #e8f5e8;
      color: #4caf50;
      font-weight: 500;
    }

    .section-questions {
      background-color: #e3f2fd;
      color: #1976d2;
      font-weight: 500;
    }

    .section-description {
      margin-bottom: 24px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
      border-left: 4px solid #1976d2;
    }

    .section-description p {
      margin: 0;
      color: #666;
      font-style: italic;
    }

    .section-instructions h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #1976d2;
      font-size: 1.25rem;
      font-weight: 500;
      margin: 0 0 16px 0;
    }

    .section-instructions h3 mat-icon {
      font-size: 1.25rem;
      width: 1.25rem;
      height: 1.25rem;
    }

    .instructions-content {
      font-size: 1rem;
      line-height: 1.6;
      color: #333;
      white-space: pre-wrap;
      word-wrap: break-word;
      padding: 16px;
      background-color: #fafafa;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }

    .instructions-content h1,
    .instructions-content h2,
    .instructions-content h3,
    .instructions-content h4 {
      color: #1976d2;
      margin-top: 20px;
      margin-bottom: 12px;
    }

    .instructions-content h1:first-child,
    .instructions-content h2:first-child,
    .instructions-content h3:first-child,
    .instructions-content h4:first-child {
      margin-top: 0;
    }

    .instructions-content p {
      margin-bottom: 12px;
    }

    .instructions-content ul,
    .instructions-content ol {
      margin-bottom: 12px;
      padding-left: 24px;
    }

    .instructions-content li {
      margin-bottom: 6px;
    }

    .instructions-content strong {
      color: #1976d2;
      font-weight: 600;
    }

    .instructions-content em {
      color: #666;
      font-style: italic;
    }

    .instructions-content blockquote {
      margin: 16px 0;
      padding: 12px 16px;
      background-color: #e3f2fd;
      border-left: 4px solid #1976d2;
      border-radius: 4px;
    }

    .no-instructions {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }

    .no-instructions-text {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin: 0;
      font-style: italic;
    }

    .no-instructions-text mat-icon {
      font-size: 1.25rem;
      width: 1.25rem;
      height: 1.25rem;
    }

    .section-actions {
      display: flex;
      align-items: center;
      padding: 16px 24px;
      margin: 0 -24px -24px -24px;
      background: #f5f5f5;
    }

    .spacer {
      flex: 1;
    }

    .section-actions button {
      margin-left: 8px;
    }

    .section-actions button:first-child {
      margin-left: 0;
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .section-instructions-container {
        padding: 12px;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .section-meta {
        align-self: flex-end;
      }

      .section-title h2 {
        font-size: 1.25rem;
      }

      .instructions-content {
        font-size: 0.9rem;
        padding: 12px;
      }

      .section-actions {
        padding: 12px 16px;
        margin: 0 -16px -16px -16px;
        flex-direction: column;
        gap: 12px;
      }

      .spacer {
        display: none;
      }

      .section-actions button {
        width: 100%;
        margin: 0;
      }
    }
  `]
})
export class SectionInstructionsComponent {
  @Input() sectionTitle: string = '';
  @Input() sectionDescription: string = '';
  @Input() instructions: string = '';
  @Input() totalMarks: number = 0;
  @Input() questionCount: number = 0;
  @Input() showBackButton: boolean = false;

  @Output() startSection = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  onStartSection() {
    this.startSection.emit();
  }

  onBack() {
    this.back.emit();
  }
}
