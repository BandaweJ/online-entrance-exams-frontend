import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-exam-instructions',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="instructions-container">
      <mat-card class="instructions-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>info</mat-icon>
            {{ title }}
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <div class="instructions-content" [innerHTML]="instructions"></div>
        </mat-card-content>
        
        <mat-divider></mat-divider>
        
        <mat-card-actions class="instructions-actions">
          <button mat-button (click)="onBack()" *ngIf="showBackButton">
            <mat-icon>arrow_back</mat-icon>
            Back
          </button>
          <span class="spacer"></span>
          <button mat-raised-button color="primary" (click)="onContinue()">
            <mat-icon>arrow_forward</mat-icon>
            {{ continueButtonText }}
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .instructions-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .instructions-card {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .instructions-card mat-card-header {
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      color: white;
      margin: -24px -24px 24px -24px;
      padding: 24px;
      border-radius: 4px 4px 0 0;
    }

    .instructions-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1.5rem;
      font-weight: 500;
      margin: 0;
    }

    .instructions-card mat-card-title mat-icon {
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
    }

    .instructions-content {
      font-size: 1rem;
      line-height: 1.6;
      color: #333;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .instructions-content h1,
    .instructions-content h2,
    .instructions-content h3 {
      color: #1976d2;
      margin-top: 24px;
      margin-bottom: 12px;
    }

    .instructions-content h1:first-child,
    .instructions-content h2:first-child,
    .instructions-content h3:first-child {
      margin-top: 0;
    }

    .instructions-content p {
      margin-bottom: 16px;
    }

    .instructions-content ul,
    .instructions-content ol {
      margin-bottom: 16px;
      padding-left: 24px;
    }

    .instructions-content li {
      margin-bottom: 8px;
    }

    .instructions-content strong {
      color: #1976d2;
      font-weight: 600;
    }

    .instructions-content em {
      color: #666;
      font-style: italic;
    }

    .instructions-actions {
      display: flex;
      align-items: center;
      padding: 16px 24px;
      margin: 0 -24px -24px -24px;
      background: #f5f5f5;
    }

    .spacer {
      flex: 1;
    }

    .instructions-actions button {
      margin-left: 8px;
    }

    .instructions-actions button:first-child {
      margin-left: 0;
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .instructions-container {
        padding: 12px;
      }

      .instructions-card mat-card-header {
        margin: -16px -16px 16px -16px;
        padding: 16px;
      }

      .instructions-card mat-card-title {
        font-size: 1.25rem;
      }

      .instructions-content {
        font-size: 0.9rem;
      }

      .instructions-actions {
        padding: 12px 16px;
        margin: 0 -16px -16px -16px;
        flex-direction: column;
        gap: 12px;
      }

      .spacer {
        display: none;
      }

      .instructions-actions button {
        width: 100%;
        margin: 0;
      }
    }
  `]
})
export class ExamInstructionsComponent {
  @Input() title: string = 'Exam Instructions';
  @Input() instructions: string = '';
  @Input() continueButtonText: string = 'Continue to Exam';
  @Input() showBackButton: boolean = false;

  @Output() continue = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  onContinue() {
    this.continue.emit();
  }

  onBack() {
    this.back.emit();
  }
}
