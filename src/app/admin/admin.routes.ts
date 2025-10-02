import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'exams',
    loadComponent: () => import('./exams/exams-list.component').then(m => m.ExamsListComponent)
  },
  {
    path: 'exams/create',
    loadComponent: () => import('./exams/exam-create.component').then(m => m.ExamCreateComponent)
  },
  {
    path: 'exams/:id',
    loadComponent: () => import('./exams/exam-view.component').then(m => m.ExamViewComponent)
  },
  {
    path: 'exams/:id/edit',
    loadComponent: () => import('./exams/exam-edit.component').then(m => m.ExamEditComponent)
  },
  {
    path: 'exams/:id/questions',
    loadComponent: () => import('./exams/question-editor.component').then(m => m.QuestionEditorComponent)
  },
  {
    path: 'students',
    loadComponent: () => import('./students/students-list.component').then(m => m.StudentsListComponent)
  },
  {
    path: 'students/create',
    loadComponent: () => import('./students/student-create.component').then(m => m.StudentCreateComponent)
  },
  {
    path: 'results',
    loadComponent: () => import('./results/results-list.component').then(m => m.ResultsListComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('../shared/components/user-profile/user-profile.component').then(m => m.UserProfileComponent)
  },
  {
    path: 'users',
    loadComponent: () => import('./users/users-list.component').then(m => m.UsersListComponent)
  },
  {
    path: 'users/create',
    loadComponent: () => import('./users/user-create.component').then(m => m.UserCreateComponent)
  }
];
