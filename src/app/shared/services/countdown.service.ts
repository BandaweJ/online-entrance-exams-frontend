import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';

export interface CountdownState {
  timeRemaining: number;
  isRunning: boolean;
  isFinished: boolean;
  formattedTime: string;
}

@Injectable({
  providedIn: 'root'
})
export class CountdownService {
  private countdownSubject = new BehaviorSubject<CountdownState>({
    timeRemaining: 0,
    isRunning: false,
    isFinished: false,
    formattedTime: '00:00:00'
  });

  private subscription: Subscription | null = null;
  private totalTime = 0;

  public countdown$ = this.countdownSubject.asObservable();

  startCountdown(durationInSeconds: number): void {
    this.totalTime = durationInSeconds;
    this.countdownSubject.next({
      timeRemaining: durationInSeconds,
      isRunning: true,
      isFinished: false,
      formattedTime: this.formatTime(durationInSeconds)
    });

    this.subscription = interval(1000)
      .pipe(
        map(tick => durationInSeconds - tick),
        takeWhile(time => time >= 0)
      )
      .subscribe(timeRemaining => {
        const isFinished = timeRemaining === 0;
        this.countdownSubject.next({
          timeRemaining,
          isRunning: !isFinished,
          isFinished,
          formattedTime: this.formatTime(timeRemaining)
        });

        if (isFinished) {
          this.stopCountdown();
        }
      });
  }

  pauseCountdown(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    
    const currentState = this.countdownSubject.value;
    this.countdownSubject.next({
      ...currentState,
      isRunning: false
    });
  }

  resumeCountdown(): void {
    const currentState = this.countdownSubject.value;
    if (currentState.timeRemaining > 0 && !currentState.isFinished) {
      this.startCountdown(currentState.timeRemaining);
    }
  }

  stopCountdown(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    
    this.countdownSubject.next({
      timeRemaining: 0,
      isRunning: false,
      isFinished: true,
      formattedTime: '00:00:00'
    });
  }

  resetCountdown(durationInSeconds: number): void {
    this.stopCountdown();
    this.startCountdown(durationInSeconds);
  }

  getCurrentState(): CountdownState {
    return this.countdownSubject.value;
  }

  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      remainingSeconds.toString().padStart(2, '0')
    ].join(':');
  }

  getProgressPercentage(): number {
    const currentState = this.countdownSubject.value;
    if (this.totalTime === 0) return 0;
    return ((this.totalTime - currentState.timeRemaining) / this.totalTime) * 100;
  }

  getTimeRemaining(): number {
    return this.countdownSubject.value.timeRemaining;
  }

  isTimeUp(): boolean {
    return this.countdownSubject.value.isFinished;
  }

  isRunning(): boolean {
    return this.countdownSubject.value.isRunning;
  }
}
