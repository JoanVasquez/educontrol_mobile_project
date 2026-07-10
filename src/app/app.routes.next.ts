import type { Routes } from '@angular/router';
import { authenticatedGuard, roleGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'home',
    canActivate: [roleGuard(['admin', 'director'], '/login')],
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'asistencia',
    canActivate: [authenticatedGuard],
    loadComponent: () => import('./attendance/attendance.page').then((m) => m.AttendancePage),
  },
  {
    path: 'asistencia/resumen',
    canActivate: [authenticatedGuard],
    loadComponent: () => import('./attendance-summary/attendance-summary.page').then((m) => m.AttendanceSummaryPage),
  },
  {
    path: 'averias/actualizar/:id',
    canActivate: [authenticatedGuard],
    loadComponent: () =>
      import('./breakdown-update/breakdown-update.page').then(({ BreakdownUpdatePage }) => BreakdownUpdatePage),
  },
  {
    path: 'averias/estado',
    canActivate: [authenticatedGuard],
    loadComponent: () =>
      import('./breakdown-status/breakdown-status.page').then(({ BreakdownStatusPage }) => BreakdownStatusPage),
  },
  {
    path: 'averias',
    canActivate: [authenticatedGuard],
    loadComponent: () =>
      import('./breakdown-report/breakdown-report.page').then(({ BreakdownReportPage }) => BreakdownReportPage),
  },
  {
    path: 'docentes/modificar/:id',
    canActivate: [roleGuard(['admin', 'director', 'secretaria'])],
    loadComponent: () =>
      import('./teacher-update/teacher-update.page').then(({ TeacherUpdatePage }) => TeacherUpdatePage),
  },
  {
    path: 'docentes/listado',
    canActivate: [roleGuard(['admin', 'director', 'secretaria'])],
    loadComponent: () =>
      import('./teacher-list/teacher-list.page').then(({ TeacherListPage }) => TeacherListPage),
  },
  {
    path: 'docentes',
    canActivate: [roleGuard(['admin', 'director', 'secretaria'])],
    loadComponent: () =>
      import('./teacher-registration/teacher-registration.page').then(({ TeacherRegistrationPage }) => TeacherRegistrationPage),
  },
  {
    path: 'perfil',
    canActivate: [authenticatedGuard],
    loadComponent: () => import('./profile/profile.page').then(({ ProfilePage }) => ProfilePage),
  },
  {
    path: 'registrar-estudiante',
    canActivate: [roleGuard(['admin', 'director', 'secretaria'])],
    loadComponent: () => import('./student-registration/student-registration.page').then((m) => m.StudentRegistrationPage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
