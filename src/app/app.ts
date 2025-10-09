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
      <!-- Mobile-First Toolbar -->
      <mat-toolbar color="primary" class="app-toolbar" *ngIf="isAuthenticated$ | async">
        <button mat-icon-button (click)="toggleSidenav()" class="menu-button">
          <mat-icon>menu</mat-icon>
        </button>
        
        <!-- Mobile: Show app name, Desktop: Show full title -->
        <span class="app-title mobile-only">Exam System</span>
        <span class="app-title tablet-up">School Entrance Exam System</span>
        
        <span class="spacer"></span>
        
        <!-- Mobile: Show user initials, Desktop: Show full name -->
        <span *ngIf="currentUser$ | async as user" class="user-info">
          <span class="user-name mobile-only">{{ user.firstName?.charAt(0) }}{{ user.lastName?.charAt(0) }}</span>
          <span class="user-name tablet-up">Welcome, {{ user.firstName }} {{ user.lastName }}</span>
        </span>
        
        <button mat-icon-button [matMenuTriggerFor]="userMenu" class="user-menu-button">
          <mat-icon>account_circle</mat-icon>
        </button>
        
        <mat-menu #userMenu="matMenu" class="user-menu">
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

      <!-- Mobile-First Navigation -->
      <mat-sidenav-container class="sidenav-container" *ngIf="isAuthenticated$ | async">
        <mat-sidenav #sidenav 
                     [mode]="isMobile ? 'over' : 'side'" 
                     [opened]="isMobile ? false : sidenavOpen"
                     [disableClose]="!isMobile"
                     class="navigation-sidenav">
          
          <!-- Navigation Header -->
          <div class="nav-header">
            <h3 class="nav-title">Navigation</h3>
            <button mat-icon-button (click)="closeSidenav()" class="close-nav mobile-only">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          
          <mat-nav-list class="nav-list">
            <ng-container *ngIf="(currentUser$ | async)?.role === 'admin'">
              <a mat-list-item routerLink="/admin/dashboard" (click)="onNavItemClick()">
                <mat-icon matListItemIcon>dashboard</mat-icon>
                <span matListItemTitle>Dashboard</span>
              </a>
              <a mat-list-item routerLink="/admin/exams" (click)="onNavItemClick()">
                <mat-icon matListItemIcon>quiz</mat-icon>
                <span matListItemTitle>Exams</span>
              </a>
              <a mat-list-item routerLink="/admin/students" (click)="onNavItemClick()">
                <mat-icon matListItemIcon>people</mat-icon>
                <span matListItemTitle>Students</span>
              </a>
              <a mat-list-item routerLink="/admin/results" (click)="onNavItemClick()">
                <mat-icon matListItemIcon>assessment</mat-icon>
                <span matListItemTitle>Results</span>
              </a>
              <a mat-list-item routerLink="/admin/users" (click)="onNavItemClick()">
                <mat-icon matListItemIcon>admin_panel_settings</mat-icon>
                <span matListItemTitle>User Management</span>
              </a>
              <a mat-list-item routerLink="/admin/profile" (click)="onNavItemClick()">
                <mat-icon matListItemIcon>person</mat-icon>
                <span matListItemTitle>My Profile</span>
              </a>
            </ng-container>
            <ng-container *ngIf="(currentUser$ | async)?.role === 'student'">
              <a mat-list-item routerLink="/student/dashboard" (click)="onNavItemClick()">
                <mat-icon matListItemIcon>dashboard</mat-icon>
                <span matListItemTitle>Dashboard</span>
              </a>
              <a mat-list-item routerLink="/student/exams" (click)="onNavItemClick()">
                <mat-icon matListItemIcon>quiz</mat-icon>
                <span matListItemTitle>My Exams</span>
              </a>
              <a mat-list-item routerLink="/student/results" (click)="onNavItemClick()">
                <mat-icon matListItemIcon>assessment</mat-icon>
                <span matListItemTitle>My Results</span>
              </a>
              <a mat-list-item routerLink="/student/profile" (click)="onNavItemClick()">
                <mat-icon matListItemIcon>person</mat-icon>
                <span matListItemTitle>My Profile</span>
              </a>
            </ng-container>
          </mat-nav-list>
        </mat-sidenav>

        <mat-sidenav-content class="main-sidenav-content">
          <main class="main-content">
            <router-outlet></router-outlet>
          </main>
        </mat-sidenav-content>
      </mat-sidenav-container>

      <!-- Auth Container -->
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

    /* Mobile-First Toolbar */
    .app-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      height: 56px; /* Mobile toolbar height */
      padding: 0 8px;
    }

    .app-title {
      font-size: 1rem;
      font-weight: 500;
      margin-left: 8px;
    }

    .user-info {
      display: flex;
      align-items: center;
    }

    .user-name {
      font-size: 0.875rem;
      font-weight: 400;
    }

    .menu-button, .user-menu-button {
      min-width: 44px;
      min-height: 44px;
    }

    .spacer {
      flex: 1 1 auto;
    }

    /* Mobile-First Navigation */
    .sidenav-container {
      flex: 1;
    }

    .navigation-sidenav {
      width: 280px; /* Wider for mobile touch */
    }

    .nav-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-bottom: 1px solid rgba(0,0,0,0.12);
      background-color: #f5f5f5;
    }

    .nav-title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 500;
      color: #333;
    }

    .close-nav {
      min-width: 44px;
      min-height: 44px;
    }

    .nav-list {
      padding: 8px 0;
    }

    .nav-list a {
      text-decoration: none;
      color: inherit;
      min-height: 48px; /* Touch-friendly */
    }

    .nav-list a.active {
      background-color: rgba(25, 118, 210, 0.12);
      color: #1976d2;
    }

    .nav-list mat-icon {
      margin-right: 16px;
    }

    /* Main Content */
    .main-sidenav-content {
      background-color: #f5f5f5;
    }

    .main-content {
      padding: 16px;
      min-height: calc(100vh - 56px);
      background-color: #f5f5f5;
    }

    /* Auth Container */
    .auth-container {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 16px;
    }

    /* Tablet and up */
    @media (min-width: 768px) {
      .app-toolbar {
        height: 64px;
        padding: 0 16px;
      }

      .app-title {
        font-size: 1.25rem;
        margin-left: 16px;
      }

      .user-name {
        font-size: 1rem;
      }

      .navigation-sidenav {
        width: 250px;
      }

      .main-content {
        padding: 24px;
      }

      .auth-container {
        padding: 24px;
      }
    }

    /* Desktop and up */
    @media (min-width: 1024px) {
      .main-content {
        padding: 32px;
      }
    }
  `]
})
export class App {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  currentUser$: Observable<any>;
  isAuthenticated$: Observable<boolean>;
  sidenavOpen = true;
  isMobile = false;

  constructor(
    private store: Store<AppState>,
    private authService: AuthService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.currentUser$ = this.store.select(selectCurrentUser);
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
    
    // Mobile detection
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile) {
      this.sidenavOpen = false;
    }
  }

  toggleSidenav() {
    if (this.isMobile) {
      this.sidenav.toggle();
    } else {
      this.sidenavOpen = !this.sidenavOpen;
    }
  }

  closeSidenav() {
    if (this.isMobile) {
      this.sidenav.close();
    }
  }

  onNavItemClick() {
    if (this.isMobile) {
      this.sidenav.close();
    }
  }

  openChangePasswordDialog() {
    const dialogWidth = this.isMobile ? '90vw' : '400px';
    this.dialog.open(ChangePasswordDialogComponent, {
      width: dialogWidth,
      maxWidth: '400px',
      data: { user: this.currentUser$ }
    });
  }

  logout() {
    this.authService.logout();
  }
}