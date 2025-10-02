import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.reducer';
import { selectCurrentUser } from '../store/auth/auth.selectors';

@Injectable({
  providedIn: 'root'
})
export class StudentGuard implements CanActivate {
  constructor(
    private store: Store<AppState>,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.store.select(selectCurrentUser).pipe(
      take(1),
      map(user => {
        if (user && user.role === 'student') {
          return true;
        } else if (user && user.role === 'admin') {
          return this.router.createUrlTree(['/admin']);
        } else {
          return this.router.createUrlTree(['/login']);
        }
      })
    );
  }
}
