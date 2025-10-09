import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CountdownService } from '../../services/countdown.service';

@Component({
  selector: 'app-countdown-display',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <mat-card class="countdown-card" [class.warning]="isWarning" [class.danger]="isDanger">
      <mat-card-content>
        <div class="countdown-content">
          <mat-icon class="countdown-icon">timer</mat-icon>
          <div class="countdown-info">
            <div class="time-display">{{ formattedTime }}</div>
            <div class="time-label">{{ timeLabel }}</div>
          </div>
          <!-- Timer controls removed - managed by exam container -->
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .countdown-card {
      margin: 16px 0;
      transition: all 0.3s ease;
    }

    .countdown-card.warning {
      background-color: #fff3e0;
      border-left: 4px solid #ff9800;
    }

    .countdown-card.danger {
      background-color: #ffebee;
      border-left: 4px solid #f44336;
    }

    .countdown-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .countdown-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #1976d2;
    }

    .countdown-info {
      flex: 1;
    }

    .time-display {
      font-size: 24px;
      font-weight: bold;
      font-family: 'Roboto Mono', monospace;
      color: #1976d2;
    }

    .time-label {
      font-size: 14px;
      color: #666;
      margin-top: 4px;
    }
  `]
})
export class CountdownDisplayComponent implements OnInit, OnDestroy, OnChanges {
  @Input() endTime: string = '';
  @Input() timeSpent: number = 0; // Time already spent in seconds
  @Input() totalDuration: number = 0; // Total exam duration in minutes
  @Input() onTimeUp?: () => void;

  formattedTime: string = '00:00:00';
  timeLabel: string = 'Time Remaining';
  isPaused: boolean = false;
  isWarning: boolean = false;
  isDanger: boolean = false;

  private intervalId?: number;

  constructor(private countdownService: CountdownService) {}

  ngOnInit() {
    if (this.totalDuration) {
      this.startCountdown();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['endTime'] && changes['endTime'].currentValue) ||
        (changes['timeSpent'] && changes['timeSpent'].currentValue !== undefined) ||
        (changes['totalDuration'] && changes['totalDuration'].currentValue)) {
      
      // Clear existing interval
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = undefined;
      }
      
      // Reset states
      this.isWarning = false;
      this.isDanger = false;
      
      // Start new countdown with updated values
      this.startCountdown();
    }
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private startCountdown() {
    this.intervalId = window.setInterval(() => {
      this.updateCountdown();
    }, 1000);
    
    // Initial update
    this.updateCountdown();
  }

  private updateCountdown() {
    if (!this.totalDuration) {
      return;
    }

    // Calculate remaining time based on total duration and time already spent
    const totalDurationSeconds = this.totalDuration * 60; // Convert minutes to seconds
    const remainingSeconds = totalDurationSeconds - this.timeSpent;
    
    // If time is up or negative, show 00:00:00
    if (remainingSeconds <= 0) {
      this.handleTimeUp();
      return;
    }

    // Update warning states
    const remainingMinutes = Math.floor(remainingSeconds / 60);
    this.isWarning = remainingMinutes <= 10 && remainingMinutes > 5;
    this.isDanger = remainingMinutes <= 5;

    // Format time
    this.formattedTime = this.formatTimeFromSeconds(remainingSeconds);
    
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    
    if (hours > 0) {
      this.timeLabel = 'Hours Remaining';
    } else if (minutes > 0) {
      this.timeLabel = 'Minutes Remaining';
    } else {
      this.timeLabel = 'Seconds Remaining';
    }
  }

  private handleTimeUp() {
    this.formattedTime = '00:00:00';
    this.timeLabel = 'Time Up!';
    this.isDanger = true;
    
    if (this.onTimeUp) {
      this.onTimeUp();
    }
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  private formatTimeFromSeconds(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Timer control methods removed - managed by exam container
}