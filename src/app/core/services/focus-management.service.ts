import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class FocusManagementService {
  private focusHistory: HTMLElement[] = [];
  private currentModal: HTMLElement | null = null;
  private currentHandler: ((event: KeyboardEvent) => void) | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /**
   * Trap focus within a modal or dialog
   */
  trapFocus(modalElement: HTMLElement): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.currentModal = modalElement;
    
    // Store the currently focused element
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement) {
      this.focusHistory.push(activeElement);
    }

    // Find all focusable elements within the modal
    const focusableElements = this.getFocusableElements(modalElement);
    
    if (focusableElements.length === 0) return;

    // Focus the first element
    focusableElements[0].focus();

    // Add keyboard event listener for focus trapping
    this.currentHandler = this.handleFocusTrap.bind(this, focusableElements);
    modalElement.addEventListener('keydown', this.currentHandler);
  }

  /**
   * Release focus trap and restore previous focus
   */
  releaseFocus(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Remove event listener
    if (this.currentModal && this.currentHandler) {
      this.currentModal.removeEventListener('keydown', this.currentHandler);
      this.currentModal = null;
      this.currentHandler = null;
    }

    // Restore focus to the previously focused element
    const previousElement = this.focusHistory.pop();
    if (previousElement && previousElement.focus) {
      previousElement.focus();
    }
  }

  /**
   * Get all focusable elements within a container
   */
  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
  }

  /**
   * Handle keyboard navigation within focus trap
   */
  private handleFocusTrap(focusableElements: HTMLElement[], event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement;

    if (event.shiftKey) {
      // Shift + Tab: move backwards
      if (activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: move forwards
      if (activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  /**
   * Focus the first focusable element in a container
   */
  focusFirst(container: HTMLElement): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }

  /**
   * Focus the last focusable element in a container
   */
  focusLast(container: HTMLElement): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
    }
  }

  /**
   * Announce content to screen readers
   */
  announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
}
