import type { Routes } from '@angular/router';
import { authenticatedGuard, roleGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'home',
    canActivate: [roleGuard(['admin', 'director'], '/asistencia')],
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
    path: 'ubicacion',
    canActivate: [authenticatedGuard],
    loadComponent: () => import('./location/location.page').then((m) => m.LocationPage),
  },
  {
    path: 'sincronizacion-local',
    canActivate: [authenticatedGuard],
    loadComponent: () => import('./local-sync/local-sync.page').then(({ LocalSyncPage }) => LocalSyncPage),
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
    canActivate: [roleGuard(['admin', 'director'])],
    loadComponent: () =>
      import('./teacher-editor/teacher-editor.page').then(({ TeacherEditorPage }) => TeacherEditorPage),
  },
  {
    path: 'docentes/listado',
    canActivate: [roleGuard(['admin', 'director'])],
    loadComponent: () =>
      import('./teacher-directory/teacher-directory.page').then(({ TeacherDirectoryPage }) => TeacherDirectoryPage),
  },
  {
    path: 'docentes',
    canActivate: [roleGuard(['admin', 'director'])],
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
    canActivate: [roleGuard(['admin', 'director'])],
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
