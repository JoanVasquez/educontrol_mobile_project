import type { Routes } from '@angular/router';
import { authenticatedGuard, roleGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'home',
    canActivate: [authenticatedGuard],
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'asistencia',
    canActivate: [authenticatedGuard],
    loadComponent: () => import('./feature-placeholder/feature-placeholder.page').then((m) => m.FeaturePlaceholderPage),
    data: { title: 'Asistencia', activePath: '/asistencia' },
  },
  {
    path: 'averias',
    canActivate: [authenticatedGuard],
    loadComponent: () => import('./feature-placeholder/feature-placeholder.page').then((m) => m.FeaturePlaceholderPage),
    data: { title: 'Averias', activePath: '/averias' },
  },
  {
    path: 'docentes',
    canActivate: [authenticatedGuard],
    loadComponent: () => import('./feature-placeholder/feature-placeholder.page').then((m) => m.FeaturePlaceholderPage),
    data: { title: 'Docentes', activePath: '/docentes' },
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
