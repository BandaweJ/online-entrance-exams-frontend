import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

export interface SectionSelectionDialogData {
  title: string;
  sections: any[];
}

@Component({
  selector: 'app-section-selection-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatListModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <mat-list>
        <mat-list-item 
          *ngFor="let section of data.sections" 
          (click)="selectSection(section)"
          class="section-item">
          <mat-icon matListItemIcon>folder</mat-icon>
          <div matListItemTitle>{{ section.title }}</div>
          <div matListItemLine>{{ section.description || 'No description' }}</div>
          <div matListItemLine class="section-info">
            <span class="question-count">{{ section.questionCount || 0 }} questions</span>
            <span class="marks">{{ section.totalMarks || 0 }} marks</span>
          </div>
        </mat-list-item>
      </mat-list>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .section-item {
      cursor: pointer;
      border-radius: 4px;
      margin-bottom: 8px;
      transition: background-color 0.2s;
    }
    
    .section-item:hover {
      background-color: #f5f5f5;
    }
    
    .section-info {
      display: flex;
      gap: 16px;
      font-size: 0.875rem;
      color: #666;
    }
    
    .question-count, .marks {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    mat-dialog-content {
      max-height: 400px;
      overflow-y: auto;
    }
  `]
})
export class SectionSelectionDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SectionSelectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SectionSelectionDialogData
  ) {}

  selectSection(section: any): void {
    this.dialogRef.close(section);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
