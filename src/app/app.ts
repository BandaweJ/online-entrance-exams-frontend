import { Component, ViewChild, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { AppState } from './core/store/app.reducer';
import { selectCurrentUser, selectIsAuthenticated } from './core/store/auth/auth.selectors';
import { selectTheme } from './core/store/ui/ui.selectors';
import { AuthService } from './core/services/auth.service';
import { ChangePasswordDialogComponent } from './shared/components/change-password-dialog/change-password-dialog.component';
import { toggleTheme } from './core/store/ui/ui.actions';
// import { GlobalLoadingComponent } from './shared/components/global-loading/global-loading.component';
// import { ErrorBoundaryComponent } from './shared/components/error-boundary/error-boundary.component';

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
    // GlobalLoadingComponent,
    // ErrorBoundaryComponent
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
        
        <!-- Dark Mode Toggle Button -->
        <button mat-icon-button (click)="toggleDarkMode()" class="theme-toggle-button" 
                [attr.aria-label]="(theme$ | async) === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'">
          <mat-icon>{{ (theme$ | async) === 'dark' ? 'light_mode' : 'dark_mode' }}</mat-icon>
        </button>
        
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
              <a mat-list-item routerLink="/admin/analytics" (click)="onNavItemClick()">
                <mat-icon matListItemIcon>analytics</mat-icon>
                <span matListItemTitle>Analytics</span>
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
              <a mat-list-item routerLink="/student/analytics" (click)="onNavItemClick()">
                <mat-icon matListItemIcon>analytics</mat-icon>
                <span matListItemTitle>My Analytics</span>
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
    /* Mobile-first base styles with branding */
    .app-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: linear-gradient(135deg, var(--anarchy-off-white) 0%, #E5E7EB 100%);
    }

    /* Mobile-First Toolbar with Branding */
    .app-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      height: 56px; /* Mobile toolbar height */
      padding: 0 8px; /* Mobile-first: smaller padding */
      background: var(--glass-card);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: var(--glass-shadow);
    }

    .app-title {
      font-family: 'Playfair Display', serif;
      font-size: 1rem; /* Mobile-first: smaller font */
      font-weight: 600;
      margin-left: 8px; /* Mobile-first: smaller margin */
      color: var(--anarchy-blue); /* Brand color */
    }

    .user-info {
      display: flex;
      align-items: center;
    }

    .user-name {
      font-family: 'Inter', sans-serif;
      font-size: 0.875rem; /* Mobile-first: smaller font */
      font-weight: 500;
      color: var(--anarchy-grey); /* Brand color */
    }

    .menu-button, .user-menu-button, .theme-toggle-button {
      min-width: 44px; /* Touch-friendly */
      min-height: 44px;
      border-radius: 12px; /* Branded radius */
      color: var(--anarchy-blue); /* Brand color */
    }

    .menu-button:hover, .user-menu-button:hover, .theme-toggle-button:hover {
      background: rgba(30, 58, 138, 0.1); /* Brand color background */
    }

    .theme-toggle-button {
      margin-right: 8px;
      transition: all 0.3s ease;
    }

    .theme-toggle-button:hover {
      transform: rotate(180deg);
    }

    .spacer {
      flex: 1 1 auto;
    }

    /* Mobile-First Navigation with Branding */
    .sidenav-container {
      flex: 1;
    }

    .navigation-sidenav {
      width: 280px; /* Wider for mobile touch */
      background: var(--glass-card);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-right: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: var(--glass-shadow);
    }

    .nav-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px; /* Mobile-first: smaller padding */
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(30, 58, 138, 0.1); /* Brand color background */
    }

    .nav-title {
      margin: 0;
      font-family: 'Playfair Display', serif;
      font-size: 1.125rem; /* Mobile-first: smaller font */
      font-weight: 600;
      color: var(--anarchy-blue); /* Brand color */
    }

    .close-nav {
      min-width: 44px; /* Touch-friendly */
      min-height: 44px;
      border-radius: 12px; /* Branded radius */
      color: var(--anarchy-grey); /* Brand color */
    }

    .close-nav:hover {
      background: rgba(30, 58, 138, 0.1); /* Brand color background */
    }

    .nav-list {
      padding: 8px 0; /* Mobile-first: smaller padding */
    }

    .nav-list a {
      text-decoration: none;
      color: var(--anarchy-grey); /* Brand color */
      min-height: 48px; /* Touch-friendly */
      font-family: 'Inter', sans-serif;
      font-weight: 500;
      border-radius: 8px; /* Branded radius */
      margin: 4px 8px; /* Mobile-first: smaller margin */
      transition: all 0.3s ease;
    }

    .nav-list a:hover {
      background: rgba(30, 58, 138, 0.1); /* Brand color background */
      color: var(--anarchy-blue); /* Brand color */
      transform: translateX(4px);
    }

    .nav-list a.active {
      background: var(--brand-gradient);
      color: white;
      box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
    }

    .nav-list mat-icon {
      margin-right: 16px; /* Mobile-first: smaller margin */
      color: var(--anarchy-blue); /* Brand color */
    }

    .nav-list a.active mat-icon {
      color: white;
    }

    /* Main Content with Branding */
    .main-sidenav-content {
      background: linear-gradient(135deg, var(--anarchy-off-white) 0%, #E5E7EB 100%);
    }

    .main-content {
      padding: 12px; /* Mobile-first: smaller padding */
      min-height: calc(100vh - 56px);
      background: transparent;
    }

    /* Auth Container with Branding */
    .auth-container {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--anarchy-off-white) 0%, #E5E7EB 100%);
      padding: 12px; /* Mobile-first: smaller padding */
    }

    /* User Menu with Branding */
    .user-menu {
      background: var(--glass-card);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: var(--glass-shadow);
      border-radius: 16px; /* Branded radius */
    }

    .user-menu .mat-menu-item {
      font-family: 'Inter', sans-serif;
      color: var(--anarchy-grey); /* Brand color */
      border-radius: 8px; /* Branded radius */
      margin: 4px 8px; /* Mobile-first: smaller margin */
    }

    .user-menu .mat-menu-item:hover {
      background: rgba(30, 58, 138, 0.1); /* Brand color background */
      color: var(--anarchy-blue); /* Brand color */
    }

    .user-menu .mat-menu-item mat-icon {
      color: var(--anarchy-blue); /* Brand color */
    }

    /* Small mobile devices (320px and up) */
    @media (min-width: 320px) {
      .app-title {
        font-size: 1.125rem;
      }
      
      .user-name {
        font-size: 0.9rem;
      }
    }

    /* Medium mobile devices (480px and up) */
    @media (min-width: 480px) {
      .app-toolbar {
        padding: 0 12px;
      }

      .app-title {
        font-size: 1.25rem;
        margin-left: 12px;
      }

      .user-name {
        font-size: 1rem;
      }

      .main-content {
        padding: 16px;
      }

      .auth-container {
        padding: 16px;
      }
    }

    /* Tablet and up (768px and up) */
    @media (min-width: 768px) {
      .app-toolbar {
        height: 64px;
        padding: 0 16px;
      }

      .app-title {
        font-size: 1.375rem;
        margin-left: 16px;
      }

      .user-name {
        font-size: 1.125rem;
      }

      .navigation-sidenav {
        width: 250px;
      }

      .nav-header {
        padding: 20px;
      }

      .nav-title {
        font-size: 1.25rem;
      }

      .nav-list {
        padding: 12px 0;
      }

      .nav-list a {
        margin: 6px 12px;
      }

      .main-content {
        padding: 24px;
      }

      .auth-container {
        padding: 24px;
      }
    }

    /* Desktop and up (1024px and up) */
    @media (min-width: 1024px) {
      .app-title {
        font-size: 1.5rem;
      }

      .user-name {
        font-size: 1.25rem;
      }

      .nav-title {
        font-size: 1.375rem;
      }

      .main-content {
        padding: 32px;
      }
    }

    /* Large screens (1200px and up) */
    @media (min-width: 1200px) {
      .main-content {
        padding: 40px;
      }
    }
  `]
})
export class App implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  currentUser$: Observable<any>;
  isAuthenticated$: Observable<boolean>;
  theme$: Observable<'light' | 'dark'>;
  sidenavOpen = true;
  isMobile = false;
  private themeSubscription?: Subscription;

  constructor(
    private store: Store<AppState>,
    private authService: AuthService,
    private dialog: MatDialog,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.currentUser$ = this.store.select(selectCurrentUser);
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
    this.theme$ = this.store.select(selectTheme);
    
    // Mobile detection
    this.checkScreenSize();
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('resize', () => this.checkScreenSize());
    }
  }

  ngOnInit() {
    // Initialize theme from localStorage
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
      this.store.dispatch({ type: '[UI] Set Theme', theme: savedTheme });
      this.applyTheme(savedTheme);
    }

    // Subscribe to theme changes
    this.themeSubscription = this.theme$.subscribe(theme => {
      if (isPlatformBrowser(this.platformId)) {
        this.applyTheme(theme);
        localStorage.setItem('theme', theme);
      }
    });
  }

  ngOnDestroy() {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', () => this.checkScreenSize());
    }
  }

  checkScreenSize() {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth < 768;
      if (this.isMobile) {
        this.sidenavOpen = false;
      }
    }
  }

  toggleDarkMode() {
    this.store.dispatch(toggleTheme());
  }

  private applyTheme(theme: 'light' | 'dark') {
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.setAttribute('data-theme', theme);
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
    } else {
      this.sidenavOpen = false;
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