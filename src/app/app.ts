import { Component, ViewChild } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from './core/store/app.reducer';
import { selectCurrentUser, selectIsAuthenticated } from './core/store/auth/auth.selectors';
import { AuthService } from './core/services/auth.service';
import { ChangePasswordDialogComponent } from './shared/components/change-password-dialog/change-password-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule
  ],
  template: `
    <div class="app-container">
      <mat-toolbar color="primary" *ngIf="isAuthenticated$ | async">
        <button mat-icon-button (click)="toggleSidenav()">
          <mat-icon>menu</mat-icon>
        </button>
        <span>School Entrance Exam System</span>
        <span class="spacer"></span>
        <span *ngIf="currentUser$ | async as user" class="user-info">
          Welcome, {{ user.firstName }} {{ user.lastName }}
        </span>
        <button mat-icon-button [matMenuTriggerFor]="userMenu">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #userMenu="matMenu">
          <button mat-menu-item (click)="openChangePasswordDialog()">
            <mat-icon>lock</mat-icon>
            <span>Change Password</span>
          </button>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span>Logout</span>
          </button>
        </mat-menu>
      </mat-toolbar>

      <mat-sidenav-container class="sidenav-container" *ngIf="isAuthenticated$ | async">
        <mat-sidenav #sidenav mode="side" [opened]="sidenavOpen">
          <mat-nav-list>
            <ng-container *ngIf="(currentUser$ | async)?.role === 'admin'">
              <a mat-list-item routerLink="/admin/dashboard">
                <mat-icon matListItemIcon>dashboard</mat-icon>
                <span matListItemTitle>Dashboard</span>
              </a>
              <a mat-list-item routerLink="/admin/exams">
                <mat-icon matListItemIcon>quiz</mat-icon>
                <span matListItemTitle>Exams</span>
              </a>
              <a mat-list-item routerLink="/admin/students">
                <mat-icon matListItemIcon>people</mat-icon>
                <span matListItemTitle>Students</span>
              </a>
              <a mat-list-item routerLink="/admin/results">
                <mat-icon matListItemIcon>assessment</mat-icon>
                <span matListItemTitle>Results</span>
              </a>
              <a mat-list-item routerLink="/admin/users">
                <mat-icon matListItemIcon>admin_panel_settings</mat-icon>
                <span matListItemTitle>User Management</span>
              </a>
              <a mat-list-item routerLink="/admin/profile">
                <mat-icon matListItemIcon>person</mat-icon>
                <span matListItemTitle>My Profile</span>
              </a>
            </ng-container>
            <ng-container *ngIf="(currentUser$ | async)?.role === 'student'">
              <a mat-list-item routerLink="/student/dashboard">
                <mat-icon matListItemIcon>dashboard</mat-icon>
                <span matListItemTitle>Dashboard</span>
              </a>
              <a mat-list-item routerLink="/student/exams">
                <mat-icon matListItemIcon>quiz</mat-icon>
                <span matListItemTitle>My Exams</span>
              </a>
              <a mat-list-item routerLink="/student/results">
                <mat-icon matListItemIcon>assessment</mat-icon>
                <span matListItemTitle>My Results</span>
              </a>
              <a mat-list-item routerLink="/student/profile">
                <mat-icon matListItemIcon>person</mat-icon>
                <span matListItemTitle>My Profile</span>
              </a>
            </ng-container>
          </mat-nav-list>
        </mat-sidenav>

        <mat-sidenav-content>
          <main class="main-content">
            <router-outlet></router-outlet>
          </main>
        </mat-sidenav-content>
      </mat-sidenav-container>

      <div *ngIf="!(isAuthenticated$ | async)" class="auth-container">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .sidenav-container {
      flex: 1;
    }

    .main-content {
      padding: 20px;
      height: 100%;
    }

    .auth-container {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .spacer {
      flex: 1 1 auto;
    }

    mat-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    mat-sidenav {
      width: 250px;
    }

    mat-nav-list a {
      text-decoration: none;
      color: inherit;
    }

    mat-nav-list a.active {
      background-color: rgba(0, 0, 0, 0.04);
    }
  `]
})
export class App {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  currentUser$: Observable<any>;
  isAuthenticated$: Observable<boolean>;
  sidenavOpen = true;

  constructor(
    private store: Store<AppState>,
    private authService: AuthService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.currentUser$ = this.store.select(selectCurrentUser);
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
  }

  toggleSidenav() {
    this.sidenavOpen = !this.sidenavOpen;
  }

  openChangePasswordDialog() {
    this.dialog.open(ChangePasswordDialogComponent, {
      width: '400px',
      data: { user: this.currentUser$ }
    });
  }

  logout() {
    this.authService.logout();
  }
}