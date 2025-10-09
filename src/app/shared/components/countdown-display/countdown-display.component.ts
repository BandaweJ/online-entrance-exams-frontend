import { Component, Input, OnInit, OnDestroy } from '@angular/core';
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
export class CountdownDisplayComponent implements OnInit, OnDestroy {
  @Input() endTime: string = '';
  @Input() onTimeUp?: () => void;

  formattedTime: string = '00:00:00';
  timeLabel: string = 'Time Remaining';
  isPaused: boolean = false;
  isWarning: boolean = false;
  isDanger: boolean = false;

  private intervalId?: number;

  constructor(private countdownService: CountdownService) {}

  ngOnInit() {
    if (this.endTime) {
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
    if (!this.endTime) return;

    const now = new Date().getTime();
    const end = new Date(this.endTime).getTime();
    const timeLeft = end - now;

    if (timeLeft <= 0) {
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
      return;
    }

    // Update warning states
    const totalMinutes = Math.floor(timeLeft / (1000 * 60));
    this.isWarning = totalMinutes <= 10 && totalMinutes > 5;
    this.isDanger = totalMinutes <= 5;

    // Format time
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    this.formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    if (hours > 0) {
      this.timeLabel = 'Hours Remaining';
    } else if (minutes > 0) {
      this.timeLabel = 'Minutes Remaining';
    } else {
      this.timeLabel = 'Seconds Remaining';
    }
  }

  // Timer control methods removed - managed by exam container
}