import { Routes } from '@angular/router';

export const studentRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent)
  },
  {
    path: 'exams',
    loadComponent: () => import('./exams/exam-list.component').then(m => m.ExamListComponent)
  },
  {
    path: 'exams/:id/attempt',
    loadComponent: () => import('./exam/exam-container.component').then(m => m.ExamContainerComponent)
  },
  {
    path: 'results',
    loadComponent: () => import('./results/student-results.component').then(m => m.StudentResultsComponent)
  },
  {
    path: 'results/:id',
    loadComponent: () => import('./exam/results-screen.component').then(m => m.ResultsScreenComponent)
  },
  {
    path: 'analytics',
    loadComponent: () => import('./analytics/student-analytics.component').then(m => m.StudentAnalyticsComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('../shared/components/user-profile/user-profile.component').then(m => m.UserProfileComponent)
  }
];
