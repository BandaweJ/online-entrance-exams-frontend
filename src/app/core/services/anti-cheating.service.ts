import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, fromEvent, merge } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface CheatingWarning {
  warningCount: number;
  maxWarnings: number;
  actionType: 'refresh' | 'tab_switch' | 'tab_close';
  remainingWarnings: number;
}

export interface CheatingViolation {
  type: 'page_refresh' | 'tab_switch' | 'tab_close' | 'devtools_access' | 'right_click' | 'view_source' | 'keyboard_shortcut';
  description: string;
  timestamp: string;
  userAgent?: string;
  ipAddress?: string;
  metadata?: any;
}

export interface CheatingWarningResponse {
  warningCount: number;
  maxWarnings: number;
  remainingWarnings: number;
  shouldAutoSubmit: boolean;
  violations: CheatingViolation[];
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

  constructor(private http: HttpClient) {
    this.setupEventListeners();
  }

  /**
   * Start monitoring for cheating attempts
   */
  async startMonitoring(attemptId: string) {
    this.isExamActive = true;
    this.examAttemptId = attemptId;
    
    // Load existing warnings from backend
    try {
      const response = await this.getCheatingWarnings(attemptId).toPromise();
      if (response) {
        this.warningCount = response.warningCount;
        console.log(`Loaded ${this.warningCount} existing warnings from backend`);
      } else {
        this.warningCount = 0;
        console.log('No existing warnings found, starting fresh');
      }
    } catch (error) {
      console.error('Error loading existing warnings:', error);
      this.warningCount = 0;
    }
    
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

  private async handleCheatingAttempt(actionType: 'refresh' | 'tab_switch' | 'tab_close') {
    if (!this.isExamActive || !this.examAttemptId) return;

    try {
      // Map action type to violation type
      const violationType = this.mapActionTypeToViolationType(actionType);
      const description = this.getViolationDescription(actionType);

      // Send violation to backend
      const response = await this.addCheatingViolation(this.examAttemptId, {
        type: violationType,
        description: description,
        metadata: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          actionType: actionType
        }
      }).toPromise();

      if (response) {
        // Cap warning count at MAX_WARNINGS to prevent exceeding limit
        const cappedWarningCount = Math.min(response.warningCount, this.MAX_WARNINGS);
        const cappedRemainingWarnings = Math.max(0, this.MAX_WARNINGS - cappedWarningCount);
        
        // Update local warning count from backend response (capped)
        this.warningCount = cappedWarningCount;

        const warning: CheatingWarning = {
          warningCount: cappedWarningCount,
          maxWarnings: this.MAX_WARNINGS,
          actionType: actionType,
          remainingWarnings: cappedRemainingWarnings
        };

        console.log('Cheating attempt detected and synced with backend:', warning);

        // Check if exam should be auto-submitted (either from backend or if count exceeds limit)
        const shouldAutoSubmit = response.shouldAutoSubmit || cappedWarningCount >= this.MAX_WARNINGS;
        
        if (shouldAutoSubmit) {
          console.log('Maximum warnings reached. Auto-submitting exam...');
          // Emit auto-submit first, then warning (so auto-submit can close the dialog)
          this.autoSubmitSubject.next(true);
        } else {
          // Only emit warning if not auto-submitting
          this.warningSubject.next(warning);
        }
      } else {
        throw new Error('No response from backend');
      }
    } catch (error) {
      console.error('Error syncing cheating violation with backend:', error);
      // Fallback to local tracking if backend fails
      // Cap warning count at MAX_WARNINGS
      this.warningCount = Math.min(this.warningCount + 1, this.MAX_WARNINGS);
      const remainingWarnings = Math.max(0, this.MAX_WARNINGS - this.warningCount);
      
      const warning: CheatingWarning = {
        warningCount: this.warningCount,
        maxWarnings: this.MAX_WARNINGS,
        actionType: actionType,
        remainingWarnings: remainingWarnings
      };
      
      // Check if should auto-submit
      if (this.shouldAutoSubmit()) {
        console.log('Maximum warnings reached (fallback). Auto-submitting exam...');
        this.autoSubmitSubject.next(true);
      } else {
        this.warningSubject.next(warning);
      }
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

  // Helper methods
  private mapActionTypeToViolationType(actionType: 'refresh' | 'tab_switch' | 'tab_close'): string {
    switch (actionType) {
      case 'refresh': return 'page_refresh';
      case 'tab_switch': return 'tab_switch';
      case 'tab_close': return 'tab_close';
      default: return 'keyboard_shortcut';
    }
  }

  private getViolationDescription(actionType: 'refresh' | 'tab_switch' | 'tab_close'): string {
    switch (actionType) {
      case 'refresh': return 'Attempted to refresh the page during exam';
      case 'tab_switch': return 'Attempted to switch to another tab during exam';
      case 'tab_close': return 'Attempted to close the browser tab during exam';
      default: return 'Suspicious activity detected during exam';
    }
  }

  // HTTP methods for backend synchronization
  private addCheatingViolation(attemptId: string, violation: any) {
    return this.http.post<CheatingWarningResponse>(`${environment.apiUrl}/attempts/${attemptId}/cheating-violation`, violation);
  }

  private getCheatingWarnings(attemptId: string) {
    return this.http.get<CheatingWarningResponse>(`${environment.apiUrl}/attempts/${attemptId}/cheating-warnings`);
  }
}
