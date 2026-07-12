import { inject } from '@angular/core';
import type { CanActivateFn, UrlTree } from '@angular/router';
import { Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import type { UserRole } from '../users/user-profile.model';
import { AuthService } from './auth.service';

export const authenticatedGuard: CanActivateFn = (): ReturnType<CanActivateFn> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.waitUntilReady().pipe(
    filter(Boolean),
    take(1),
    map((): boolean | UrlTree => (authService.hasAnyRole(['admin', 'director', 'docente']) ? true : router.createUrlTree(['/login']))),
  );
};

export const adminGuard: CanActivateFn = (): ReturnType<CanActivateFn> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.waitUntilReady().pipe(
    filter(Boolean),
    take(1),
    map((): boolean | UrlTree => (authService.hasAnyRole(['admin']) ? true : router.createUrlTree(['/home']))),
  );
};

export const roleGuard = (allowedRoles: UserRole[], fallbackPath = '/home'): CanActivateFn => (): ReturnType<CanActivateFn> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.waitUntilReady().pipe(
    filter(Boolean),
    take(1),
    map((): boolean | UrlTree => (authService.hasAnyRole(allowedRoles) ? true : router.createUrlTree([fallbackPath]))),
  );
};
