import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loadingCount = 0;

  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  show(): void {
    this.loadingCount++;
    if (this.loadingCount === 1) {
      this.loadingSubject.next(true);
    }
  }

  hide(): void {
    this.loadingCount = Math.max(0, this.loadingCount - 1);
    if (this.loadingCount === 0) {
      this.loadingSubject.next(false);
    }
  }

  reset(): void {
    this.loadingCount = 0;
    this.loadingSubject.next(false);
  }

  isLoading(): boolean {
    return this.loadingSubject.value;
  }

  // Helper method to wrap async operations with loading
  async withLoading<T>(operation: () => Promise<T>): Promise<T> {
    this.show();
    try {
      const result = await operation();
      return result;
    } finally {
      this.hide();
    }
  }
}
