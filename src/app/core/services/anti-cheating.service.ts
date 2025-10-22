import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, merge } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';

export interface CheatingWarning {
  warningCount: number;
  maxWarnings: number;
  actionType: 'refresh' | 'tab_switch' | 'tab_close';
  remainingWarnings: number;
}

@Injectable({
  providedIn: 'root'
})
export class AntiCheatingService {
  private readonly MAX_WARNINGS = 3;
  private warningCount = 0;
  private isExamActive = false;
  private examAttemptId: string | null = null;
  
  // Observable for warning events
  private warningSubject = new BehaviorSubject<CheatingWarning | null>(null);
  public warning$ = this.warningSubject.asObservable();

  // Observable for auto-submit events
  private autoSubmitSubject = new BehaviorSubject<boolean>(false);
  public autoSubmit$ = this.autoSubmitSubject.asObservable();

  // Event listeners
  private beforeUnloadListener?: () => string;
  private visibilityChangeListener?: () => void;
  private focusListener?: () => void;
  private blurListener?: () => void;

  constructor() {
    this.setupEventListeners();
  }

  /**
   * Start monitoring for cheating attempts
   */
  startMonitoring(attemptId: string) {
    this.isExamActive = true;
    this.examAttemptId = attemptId;
    this.warningCount = 0;
    this.setupExamEventListeners();
  }

  /**
   * Stop monitoring for cheating attempts
   */
  stopMonitoring() {
    this.isExamActive = false;
    this.examAttemptId = null;
    this.warningCount = 0;
    this.removeExamEventListeners();
  }

  /**
   * Reset warning count (for new exam attempts)
   */
  resetWarnings() {
    this.warningCount = 0;
  }

  /**
   * Get current warning count
   */
  getWarningCount(): number {
    return this.warningCount;
  }

  /**
   * Get remaining warnings
   */
  getRemainingWarnings(): number {
    return this.MAX_WARNINGS - this.warningCount;
  }

  /**
   * Check if exam should be auto-submitted
   */
  shouldAutoSubmit(): boolean {
    return this.warningCount >= this.MAX_WARNINGS;
  }

  private setupEventListeners() {
    // Global event listeners that are always active
    this.beforeUnloadListener = () => {
      if (this.isExamActive) {
        this.handleCheatingAttempt('tab_close');
        return 'You are about to leave the exam. This will count as a cheating attempt.';
      }
      return '';
    };

    window.addEventListener('beforeunload', this.beforeUnloadListener);
  }

  private setupExamEventListeners() {
    // Page visibility change (tab switch)
    this.visibilityChangeListener = () => {
      if (this.isExamActive && document.hidden) {
        this.handleCheatingAttempt('tab_switch');
      }
    };

    // Window focus/blur events
    this.focusListener = () => {
      if (this.isExamActive) {
        // User returned to the exam tab
        console.log('User returned to exam tab');
      }
    };

    this.blurListener = () => {
      if (this.isExamActive) {
        this.handleCheatingAttempt('tab_switch');
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', this.visibilityChangeListener);
    window.addEventListener('focus', this.focusListener);
    window.addEventListener('blur', this.blurListener);

    // Prevent context menu and certain keyboard shortcuts
    this.preventCheatingShortcuts();
  }

  private removeExamEventListeners() {
    if (this.visibilityChangeListener) {
      document.removeEventListener('visibilitychange', this.visibilityChangeListener);
    }
    if (this.focusListener) {
      window.removeEventListener('focus', this.focusListener);
    }
    if (this.blurListener) {
      window.removeEventListener('blur', this.blurListener);
    }
  }

  private preventCheatingShortcuts() {
    // Prevent F5, Ctrl+R, Ctrl+Shift+R, Ctrl+F5
    document.addEventListener('keydown', (event) => {
      if (!this.isExamActive) return;

      const isRefreshShortcut = 
        event.key === 'F5' ||
        (event.ctrlKey && event.key === 'r') ||
        (event.ctrlKey && event.shiftKey && event.key === 'R') ||
        (event.ctrlKey && event.key === 'F5');

      if (isRefreshShortcut) {
        event.preventDefault();
        this.handleCheatingAttempt('refresh');
      }

      // Prevent Ctrl+Shift+I (DevTools)
      if (event.ctrlKey && event.shiftKey && event.key === 'I') {
        event.preventDefault();
        this.handleCheatingAttempt('tab_switch');
      }

      // Prevent Ctrl+Shift+J (Console)
      if (event.ctrlKey && event.shiftKey && event.key === 'J') {
        event.preventDefault();
        this.handleCheatingAttempt('tab_switch');
      }

      // Prevent Ctrl+U (View Source)
      if (event.ctrlKey && event.key === 'u') {
        event.preventDefault();
        this.handleCheatingAttempt('tab_switch');
      }
    });

    // Prevent right-click context menu
    document.addEventListener('contextmenu', (event) => {
      if (this.isExamActive) {
        event.preventDefault();
        this.handleCheatingAttempt('tab_switch');
      }
    });

    // Prevent text selection (optional - can be disabled if needed)
    document.addEventListener('selectstart', (event) => {
      if (this.isExamActive) {
        // Allow text selection for answering questions
        // event.preventDefault();
      }
    });
  }

  private handleCheatingAttempt(actionType: 'refresh' | 'tab_switch' | 'tab_close') {
    if (!this.isExamActive) return;

    this.warningCount++;
    
    const warning: CheatingWarning = {
      warningCount: this.warningCount,
      maxWarnings: this.MAX_WARNINGS,
      actionType: actionType,
      remainingWarnings: this.MAX_WARNINGS - this.warningCount
    };

    console.log('Cheating attempt detected:', warning);

    // Emit warning event
    this.warningSubject.next(warning);

    // Check if exam should be auto-submitted
    if (this.shouldAutoSubmit()) {
      console.log('Maximum warnings reached. Auto-submitting exam...');
      this.autoSubmitSubject.next(true);
    }
  }

  /**
   * Acknowledge a warning (called when user dismisses warning dialog)
   */
  acknowledgeWarning() {
    // Warning has already been counted, just acknowledge it
    console.log('Warning acknowledged by user');
  }

  /**
   * Force auto-submit (for testing or emergency)
   */
  forceAutoSubmit() {
    this.autoSubmitSubject.next(true);
  }

  /**
   * Clean up all event listeners
   */
  destroy() {
    if (this.beforeUnloadListener) {
      window.removeEventListener('beforeunload', this.beforeUnloadListener);
    }
    this.removeExamEventListeners();
    this.stopMonitoring();
  }
}
