import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

export interface CheatingWarningData {
  warningCount: number;
  maxWarnings: number;
  actionType: 'refresh' | 'tab_switch' | 'tab_close';
  remainingWarnings: number;
}

@Component({
  selector: 'app-cheating-warning-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  template: `
    <div class="warning-dialog-container">
      <div class="warning-header">
        <mat-icon class="warning-icon">warning</mat-icon>
        <h2>⚠️ Anti-Cheating Warning</h2>
      </div>
      
      <div class="warning-content">
        <div class="warning-message">
          <p><strong>You have attempted to {{ getActionDescription() }} during the exam.</strong></p>
          <p>This is considered suspicious behavior and may indicate cheating.</p>
        </div>

        <div class="warning-stats">
          <div class="warning-count">
            <span class="count-label">Warnings:</span>
            <span class="count-value">{{ data.warningCount }} / {{ data.maxWarnings }}</span>
          </div>
          <div class="remaining-warnings">
            <span class="remaining-label">Remaining:</span>
            <span class="remaining-value">{{ data.remainingWarnings }}</span>
          </div>
        </div>

        <div class="warning-consequences" *ngIf="data.remainingWarnings > 0">
          <p class="consequence-text">
            <mat-icon>info</mat-icon>
            <strong>Next violation will result in automatic exam submission!</strong>
          </p>
        </div>

        <div class="final-warning" *ngIf="data.remainingWarnings === 0">
          <p class="final-warning-text">
            <mat-icon>error</mat-icon>
            <strong>This is your final warning! Any further violations will automatically submit your exam.</strong>
          </p>
        </div>

        <div class="exam-rules">
          <h4>Exam Rules Reminder:</h4>
          <ul>
            <li>Do not refresh the page</li>
            <li>Do not switch to other tabs or applications</li>
            <li>Do not close the browser tab</li>
            <li>Stay focused on the exam content</li>
          </ul>
        </div>
      </div>

      <div class="warning-actions">
        <button mat-button (click)="onAcknowledge()" class="acknowledge-button">
          <mat-icon>check</mat-icon>
          I Understand - Continue Exam
        </button>
      </div>
    </div>
  `,
  styles: [`
    .warning-dialog-container {
      background: var(--glass-card);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      box-shadow: var(--glass-shadow);
      max-width: 500px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .warning-header {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 20px 20px 0 0;
    }

    .warning-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 12px;
      color: #fff;
    }

    .warning-header h2 {
      margin: 0;
      font-family: 'Playfair Display', serif;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .warning-content {
      padding: 24px;
    }

    .warning-message {
      background: rgba(255, 107, 107, 0.1);
      border: 1px solid #ff6b6b;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 20px;
    }

    .warning-message p {
      margin: 0 0 8px 0;
      color: var(--anarchy-grey);
      font-family: 'Inter', sans-serif;
      line-height: 1.5;
    }

    .warning-message p:last-child {
      margin-bottom: 0;
    }

    .warning-stats {
      display: flex;
      justify-content: space-between;
      background: rgba(30, 58, 138, 0.1);
      border: 1px solid var(--anarchy-blue);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 20px;
    }

    .warning-count, .remaining-warnings {
      text-align: center;
    }

    .count-label, .remaining-label {
      display: block;
      font-size: 12px;
      color: var(--anarchy-grey);
      font-family: 'Inter', sans-serif;
      margin-bottom: 4px;
    }

    .count-value, .remaining-value {
      display: block;
      font-size: 24px;
      font-weight: 600;
      color: var(--anarchy-blue);
      font-family: 'Playfair Display', serif;
    }

    .warning-consequences {
      background: rgba(255, 152, 0, 0.1);
      border: 1px solid var(--anarchy-gold);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 20px;
    }

    .consequence-text {
      margin: 0;
      color: var(--anarchy-grey);
      font-family: 'Inter', sans-serif;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .consequence-text mat-icon {
      color: var(--anarchy-gold);
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .final-warning {
      background: rgba(255, 0, 0, 0.1);
      border: 1px solid #ff0000;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 20px;
    }

    .final-warning-text {
      margin: 0;
      color: #ff0000;
      font-family: 'Inter', sans-serif;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .final-warning-text mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .exam-rules {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 16px;
    }

    .exam-rules h4 {
      margin: 0 0 12px 0;
      color: var(--anarchy-blue);
      font-family: 'Playfair Display', serif;
      font-size: 1rem;
      font-weight: 600;
    }

    .exam-rules ul {
      margin: 0;
      padding-left: 20px;
    }

    .exam-rules li {
      color: var(--anarchy-grey);
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      line-height: 1.5;
      margin-bottom: 4px;
    }

    .warning-actions {
      padding: 0 24px 24px 24px;
    }

    .acknowledge-button {
      width: 100%;
      height: 48px;
      background: var(--anarchy-blue) !important;
      color: white !important;
      border-radius: 12px;
      font-family: 'Inter', sans-serif;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 15px rgba(30, 58, 138, 0.3);
    }

    .acknowledge-button:hover {
      background: #1e3a8a !important;
      box-shadow: 0 6px 20px rgba(30, 58, 138, 0.4);
    }

    .acknowledge-button mat-icon {
      margin-right: 8px;
    }

    /* Mobile responsiveness */
    @media (max-width: 480px) {
      .warning-dialog-container {
        margin: 16px;
        max-width: calc(100vw - 32px);
      }

      .warning-header {
        padding: 16px;
      }

      .warning-header h2 {
        font-size: 1.25rem;
      }

      .warning-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
      }

      .warning-content {
        padding: 16px;
      }

      .warning-stats {
        flex-direction: column;
        gap: 12px;
      }

      .acknowledge-button {
        height: 44px;
        font-size: 14px;
      }
    }
  `]
})
export class CheatingWarningDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CheatingWarningDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CheatingWarningData
  ) {}

  getActionDescription(): string {
    switch (this.data.actionType) {
      case 'refresh':
        return 'refresh the page';
      case 'tab_switch':
        return 'switch to another tab';
      case 'tab_close':
        return 'close the browser tab';
      default:
        return 'perform a suspicious action';
    }
  }

  onAcknowledge() {
    this.dialogRef.close(true);
  }
}
