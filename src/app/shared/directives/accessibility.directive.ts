import { Directive, ElementRef, HostListener, Input, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appAccessibility]'
})
export class AccessibilityDirective implements OnInit, OnDestroy {
  @Input() appAccessibility: string = '';
  @Input() announceChanges: boolean = false;
  @Input() trapFocus: boolean = false;

  private focusableElements: HTMLElement[] = [];
  private currentFocusIndex = 0;

  constructor(
    private el: ElementRef<HTMLElement>,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Add ARIA attributes based on input
    if (this.appAccessibility) {
      this.el.nativeElement.setAttribute('aria-label', this.appAccessibility);
    }

    // Set up focus trap if enabled
    if (this.trapFocus) {
      this.setupFocusTrap();
    }
  }

  ngOnDestroy() {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.trapFocus) {
      this.el.nativeElement.removeEventListener('keydown', this.handleKeydown.bind(this));
    }
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (!isPlatformBrowser(this.platformId)) return;

    // Handle common accessibility shortcuts
    switch (event.key) {
      case 'Enter':
        if (this.el.nativeElement.tagName === 'BUTTON' || this.el.nativeElement.getAttribute('role') === 'button') {
          this.el.nativeElement.click();
        }
        break;
      case ' ':
        if (this.el.nativeElement.tagName === 'BUTTON' || this.el.nativeElement.getAttribute('role') === 'button') {
          event.preventDefault();
          this.el.nativeElement.click();
        }
        break;
      case 'Escape':
        // Close any open modals or dropdowns
        const closeEvent = new CustomEvent('accessibility-close');
        this.el.nativeElement.dispatchEvent(closeEvent);
        break;
    }
  }

  private setupFocusTrap() {
    this.focusableElements = this.getFocusableElements();
    this.el.nativeElement.addEventListener('keydown', this.handleKeydown.bind(this));
  }

  private getFocusableElements(): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(this.el.nativeElement.querySelectorAll(focusableSelectors)) as HTMLElement[];
  }

  private handleKeydown(event: KeyboardEvent) {
    if (event.key !== 'Tab') return;

    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];
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
}

@Directive({
  selector: '[appAnnounce]'
})
export class AnnounceDirective {
  @Input() appAnnounce: string = '';
  @Input() priority: 'polite' | 'assertive' = 'polite';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  @HostListener('click')
  onClick() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.announceToScreenReader(this.appAnnounce, this.priority);
  }

  private announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  }
}

@Directive({
  selector: '[appFocusOnLoad]'
})
export class FocusOnLoadDirective implements OnInit {
  @Input() appFocusOnLoad: boolean = true;

  constructor(
    private el: ElementRef<HTMLElement>,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId) || !this.appFocusOnLoad) return;

    // Focus the element after a short delay to ensure it's rendered
    setTimeout(() => {
      this.el.nativeElement.focus();
    }, 100);
  }
}
