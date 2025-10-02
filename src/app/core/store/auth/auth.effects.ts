import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { User } from '../../../models/user.model';
import * as AuthActions from './auth.actions';
import { AppState } from '../app.reducer';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private store = inject(Store<AppState>);
  private router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          map((response) => {
            const user: User = {
              ...response.user,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            return AuthActions.loginSuccess({
              user,
              token: response.access_token,
            });
          }),
          catchError((error) =>
            of(AuthActions.loginFailure({ error: error.message || 'Login failed' }))
          )
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ user }) => {
          // Navigate based on user role
          if (user.role === 'admin') {
            this.router.navigate(['/admin/dashboard']);
          } else if (user.role === 'student') {
            this.router.navigate(['/student/dashboard']);
          }
        })
      ),
    { dispatch: false }
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      switchMap(({ userData }) =>
        this.authService.register(userData).pipe(
          switchMap((response) => {
            // After successful registration, automatically log in the user
            return this.authService.login(userData.email, userData.password).pipe(
              map((loginResponse) => {
                const user: User = {
                  ...loginResponse.user,
                  isActive: true,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                return AuthActions.registerSuccess({ 
                  user, 
                  token: loginResponse.access_token 
                });
              })
            );
          }),
          catchError((error) =>
            of(AuthActions.registerFailure({ error: error.message || 'Registration failed' }))
          )
        )
      )
    )
  );

  registerSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.registerSuccess),
        tap(({ user, token }) => {
          // Store token in localStorage
          localStorage.setItem('token', token);
          
          // Update AuthService's currentUserSubject to maintain consistency
          this.authService['currentUserSubject'].next(user);
          
          // Navigate based on user role after successful registration
          if (user.role === 'admin') {
            this.router.navigate(['/admin/dashboard']);
          } else if (user.role === 'student') {
            this.router.navigate(['/student/dashboard']);
          }
        })
      ),
    { dispatch: false }
  );

  loadUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadUser),
      switchMap(() =>
        this.authService.getCurrentUser().pipe(
          map((user) => AuthActions.loadUserSuccess({ user })),
          catchError((error) =>
            of(AuthActions.loadUserFailure({ error: error.message || 'Failed to load user' }))
          )
        )
      )
    )
  );

  // Initialize auth state on app start
  initAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType('@ngrx/effects/init'),
      switchMap(() => {
        const token = localStorage.getItem('token');
        if (token) {
          return this.authService.getCurrentUser().pipe(
            map((user) => {
              if (user) {
                return AuthActions.loginSuccess({ user, token });
              } else {
                localStorage.removeItem('token');
                return AuthActions.loadUserFailure({ error: 'Invalid token' });
              }
            }),
            catchError(() => {
              localStorage.removeItem('token');
              return of(AuthActions.loadUserFailure({ error: 'Token validation failed' }));
            })
          );
        } else {
          return of(AuthActions.loadUserFailure({ error: 'No token found' }));
        }
      })
    )
  );

  // No logout effect needed - logout is handled directly in AuthService
  // to avoid circular dependencies
}