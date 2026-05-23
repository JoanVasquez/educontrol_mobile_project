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
